const express = require('express');
const router = express.Router();
const Assessment = require('../models/Assessment.model');
const { authenticate, authorize } = require('../middleware/auth.middleware');

/**
 * @route GET /api/assessments
 * @desc Get all assessments (Public)
 * @access Public
 */
router.get('/', async (req, res) => {
  try {
    const { courseId } = req.query;
    const filter = { published: true };
    if (courseId) {
      filter.courseId = courseId;
    }

    const assessments = await Assessment.find(filter)
      .sort({ createdAt: -1 })
      .select('-questions'); 
    
    res.json({
      success: true,
      data: { assessments }
    });
  } catch (error) {
    console.error('Fetch assessments error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route GET /api/assessments/my
 * @desc Get all assessments created by the logged-in faculty
 * @access Private (Faculty/Admin)
 */
router.get('/my', authenticate, authorize('faculty', 'admin'), async (req, res) => {
  try {
    const assessments = await Assessment.find({ facultyId: req.user._id })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: { assessments }
    });
  } catch (error) {
    console.error('Fetch my assessments error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route GET /api/assessments/:id
 * @desc Get assessment by ID
 * @access Private/Public
 */
router.get('/:id', async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }

    res.json({
      success: true,
      data: { assessment }
    });
  } catch (error) {
    console.error('Fetch assessment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route POST /api/assessments
 * @desc Create a new assessment
 * @access Private (Faculty/Admin)
 */
router.post('/', authenticate, authorize('faculty', 'admin'), async (req, res) => {
  try {
    const { title, description, timeLimit, passingScore, proctored, published, type, questions } = req.body;

    const newAssessment = new Assessment({
      title,
      description,
      timeLimit,
      passingScore: passingScore || 70,
      proctored,
      published,
      type: type || 'final',
      facultyId: req.user._id,
      facultyName: req.user.name,
      questions: questions || []
    });

    await newAssessment.save();

    res.status(201).json({
      success: true,
      message: 'Assessment created successfully',
      data: { assessment: newAssessment }
    });
  } catch (error) {
    console.error('Create assessment error:', error);
    res.status(500).json({ success: false, message: 'Failed to create assessment' });
  }
});

/**
 * @route PUT /api/assessments/:id
 * @desc Update an existing assessment
 * @access Private (Faculty/Admin)
 */
router.put('/:id', authenticate, authorize('faculty', 'admin'), async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);

    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }

    // Check ownership
    if (assessment.facultyId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to update this assessment' });
    }

    const updates = req.body;
    updates.updatedAt = Date.now();

    const updatedAssessment = await Assessment.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Assessment updated successfully',
      data: { assessment: updatedAssessment }
    });
  } catch (error) {
    console.error('Update assessment error:', error);
    res.status(500).json({ success: false, message: 'Failed to update assessment' });
  }
});

/**
 * @route DELETE /api/assessments/:id
 * @desc Delete an assessment
 * @access Private (Faculty/Admin)
 */
router.delete('/:id', authenticate, authorize('faculty', 'admin'), async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);

    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }

    // Check ownership
    if (assessment.facultyId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this assessment' });
    }

    await Assessment.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Assessment deleted successfully'
    });
  } catch (error) {
    console.error('Delete assessment error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete assessment' });
  }
});

/**
 * @route POST /api/assessments/:id/submit
 * @desc Submit assessment answers and get results
 * @access Private (Student)
 */
router.post('/:id/submit', authenticate, async (req, res) => {
  try {
    const { answers, courseId } = req.body;
    const assessment = await Assessment.findById(req.params.id);
    
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }

    // Calculate score
    let correctCount = 0;
    const questions = assessment.questions;
    
    questions.forEach((q, index) => {
      // answers is an object like { questionId: selectedOptionIndex }
      // Or in the new MERN model, we use the question's _id
      const submittedAnswer = answers[q._id];
      if (submittedAnswer === q.correctOption) {
        correctCount++;
      }
    });

    const totalQuestions = questions.length || 1;
    const score = Math.round((correctCount / totalQuestions) * 100);
    const passed = score >= assessment.passingScore;

    // Update Enrollment if passed
    if (passed && courseId) {
      const Enrollment = require('../models/Enrollment.model');
      const Certificate = require('../models/Certificate.model');
      const Course = require('../models/Course.model');

      const enrollment = await Enrollment.findOne({ studentId: req.user._id, courseId });
      if (enrollment && enrollment.status !== 'completed') {
        enrollment.status = 'completed';
        enrollment.progress = 100;
        enrollment.completionAt = Date.now();
        await enrollment.save();

        // Generate Certificate
        const course = await Course.findById(courseId);
        const crypto = require('crypto');
        const certNumber = `CERT-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
        
        const newCertificate = new Certificate({
          studentId: req.user._id,
          studentName: req.user.name,
          courseId: courseId,
          courseTitle: course ? course.title : 'Professional Curriculum',
          certificateNumber: certNumber
        });
        await newCertificate.save();
      }
    }

    res.json({
      success: true,
      data: {
        score,
        passed,
        correctCount,
        totalQuestions
      }
    });
  } catch (error) {
    console.error('Submit assessment error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during assessment' });
  }
});

module.exports = router;
