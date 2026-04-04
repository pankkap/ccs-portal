const express = require('express');
const router = express.Router();
const Enrollment = require('../models/Enrollment.model');
const Course = require('../models/Course.model');
const Certificate = require('../models/Certificate.model');
const Test = require('../models/Test.model');
const { authenticate } = require('../middleware/auth.middleware');
const crypto = require('crypto');

const issueCertificate = async (studentId, studentName, courseId, courseTitle, certificateTemplateId) => {
  try {
    const existing = await Certificate.findOne({ studentId, courseId });
    if (!existing) {
      const certNum = 'CCS-' + crypto.randomBytes(3).toString('hex').toUpperCase() + '-' + Date.now().toString().slice(-4);
      await Certificate.create({
        studentId,
        studentName,
        courseId,
        courseTitle,
        certificateTemplateId: certificateTemplateId || null,
        certificateNumber: certNum
      });
    }
  } catch (err) {
    console.error('Certificate Issuance Error:', err);
  }
};

/**
 * @route POST /api/enrollments
 * @desc Enroll a student in a course
 * @access Private
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const { courseId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const existingEnrollment = await Enrollment.findOne({ studentId: req.user._id, courseId });
    if (existingEnrollment) {
      return res.status(400).json({ success: false, message: 'Already enrolled in this course' });
    }

    const newEnrollment = new Enrollment({
      studentId: req.user._id,
      courseId
    });

    await newEnrollment.save();

    res.status(201).json({
      success: true,
      message: 'Enrolled successfully',
      data: { enrollment: newEnrollment }
    });
  } catch (error) {
    console.error('Enrollment error:', error);
    res.status(500).json({ success: false, message: 'Failed to enroll in course' });
  }
});

/**
 * @route GET /api/enrollments/my
 * @desc Get all enrollments for the logged-in student
 * @access Private
 */
router.get('/my', authenticate, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ studentId: req.user._id })
      .populate('courseId', 'title description thumbnail duration skills modules finalAssessmentId finalAllowedAttempts')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      data: { enrollments }
    });
  } catch (error) {
    console.error('Fetch my enrollments error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch your enrollments' });
  }
});

/**
 * @route GET /api/enrollments/:courseId
 * @desc Get enrollment details for a specific course
 * @access Private
 */
router.get('/:courseId', authenticate, async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({ 
      studentId: req.user._id, 
      courseId: req.params.courseId 
    }).populate('courseId');

    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment record not found' });
    }

    res.json({
      success: true,
      data: { enrollment }
    });
  } catch (error) {
    console.error('Fetch enrollment detail error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route PUT /api/enrollments/progress/:id
 * @desc Update course progress
 * @access Private
 */
router.put('/progress/:id', authenticate, async (req, res) => {
  try {
    const { progress, completedModules } = req.body;
    
    const enrollment = await Enrollment.findById(req.params.id).populate('courseId');
    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }

    if (enrollment.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // Progression Rule: If any completed module had an assessment, verify it's passed
    // This is handled more strictly in the submit-assessment route, but here we sync the array
    if (completedModules) {
      enrollment.completedModules = completedModules;
    }
    
    enrollment.progress = progress;
    
    // Auto-complete course only if NO final assessment is required or it's already passed
    if (progress === 100) {
      const hasFinalAssessment = enrollment.courseId.finalAssessmentId;
      const finalPassed = enrollment.assessmentAttempts.some(a => 
        a.testId.toString() === hasFinalAssessment?.toString() && a.status === 'passed'
      );

      if (!hasFinalAssessment || finalPassed) {
        enrollment.status = 'completed';
        enrollment.completionAt = Date.now();
        if (enrollment.courseId.issueCertificate) {
          await issueCertificate(req.user._id, req.user.name, enrollment.courseId._id, enrollment.courseId.title, enrollment.courseId.certificateTemplateId);
        }
      } else {
         // Cap progress at 99% if final assessment is pending
         enrollment.progress = 99;
         enrollment.status = 'in-progress';
      }
    }

    enrollment.lastAccessedAt = Date.now();
    await enrollment.save();

    res.json({
      success: true,
      message: 'Progress updated',
      data: { enrollment }
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ success: false, message: 'Failed to update progress' });
  }
});

/**
 * @route POST /api/enrollments/:enrollmentId/submit-assessment
 * @desc Submit results for a module or course level assessment
 * @access Private
 */
router.post('/:enrollmentId/submit-assessment', authenticate, async (req, res) => {
  try {
    const { testId, answers, moduleId } = req.body;
    const { enrollmentId } = req.params;

    const enrollment = await Enrollment.findById(enrollmentId).populate('courseId');
    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment record not found' });
    }

    if (enrollment.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to student dossier' });
    }

    const test = await Test.findById(testId).populate('questions');
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test blueprint not found' });
    }

    // Determine Attempt Limit
    let allowed = 3;
    if (moduleId) {
      const module = enrollment.courseId.modules.id(moduleId);
      if (module) allowed = module.allowedAttempts || 3;
    } else if (enrollment.courseId.finalAssessmentId?.toString() === testId) {
      allowed = enrollment.courseId.finalAllowedAttempts || 3;
    }

    // Check Previous Attempts
    const prevAttempts = enrollment.assessmentAttempts.filter(a => a.testId.toString() === testId);
    if (prevAttempts.length >= allowed && !prevAttempts.some(a => a.status === 'passed')) {
       return res.status(400).json({ success: false, message: `Maximum attempts (${allowed}) exhausted for this assessment.` });
    }

    // Grading Logic
    let correctCount = 0;
    test.questions.forEach(q => {
      const studentAns = answers[q._id.toString()];
      // Flexible matching for strings or indexes
      if (studentAns !== undefined) {
         if (String(q.correctAnswer) === String(studentAns)) {
            correctCount++;
         } else if (Array.isArray(q.correctAnswer) && q.correctAnswer.map(String).includes(String(studentAns))) {
            correctCount++;
         }
      }
    });

    const score = Math.round((correctCount / test.questions.length) * 100);
    const passed = score >= (test.passingScore || 70);

    const attempt = {
      testId,
      score,
      status: passed ? 'passed' : 'failed',
      completedAt: Date.now()
    };

    enrollment.assessmentAttempts.push(attempt);

    // Progression Unlock Logic
    if (passed) {
      if (moduleId) {
        if (!enrollment.completedModules.includes(moduleId)) {
           enrollment.completedModules.push(moduleId);
        }
        
        if (enrollment.courseId?.modules) {
          const total = enrollment.courseId.modules.length;
          if (total > 0) {
            const newProgress = Math.round((enrollment.completedModules.length / total) * 100);
            const hasFinalAssessment = enrollment.courseId.finalAssessmentId;
            
            if (newProgress >= 100 && hasFinalAssessment) {
              enrollment.progress = 99;
            } else if (newProgress >= 100 && !hasFinalAssessment) {
              enrollment.progress = 100;
              enrollment.status = 'completed';
              enrollment.completionAt = Date.now();
              if (enrollment.courseId.issueCertificate) {
                await issueCertificate(req.user._id, req.user.name, enrollment.courseId._id, enrollment.courseId.title, enrollment.courseId.certificateTemplateId);
              }
            } else {
              enrollment.progress = newProgress;
            }
          }
        }
      } else if (enrollment.courseId.finalAssessmentId?.toString() === testId) {
        enrollment.status = 'completed';
        enrollment.completionAt = Date.now();
        enrollment.progress = 100;
        if (enrollment.courseId.issueCertificate) {
          await issueCertificate(req.user._id, req.user.name, enrollment.courseId._id, enrollment.courseId.title, enrollment.courseId.certificateTemplateId);
        }
      }
    }

    await enrollment.save();

    res.json({
      success: true,
      message: passed ? 'Assessment Passed' : 'Assessment Failed',
      data: {
        score,
        passed,
        totalQuestions: test.questions.length,
        correctCount,
        attemptsRemaining: Math.max(0, allowed - prevAttempts.length - 1)
      }
    });

  } catch (error) {
    console.error('Assessment Submission Error:', error);
    res.status(500).json({ success: false, message: 'Error processing assessment results' });
  }
});

module.exports = router;
