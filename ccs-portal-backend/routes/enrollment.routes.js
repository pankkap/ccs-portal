const express = require('express');
const router = express.Router();
const Enrollment = require('../models/Enrollment.model');
const Course = require('../models/Course.model');
const { authenticate } = require('../middleware/auth.middleware');

/**
 * @route POST /api/enrollments
 * @desc Enroll a student in a course
 * @access Private
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const { courseId } = req.body;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Check if already enrolled
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
      .populate('courseId', 'title description thumbnail duration skills modules')
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
    
    const enrollment = await Enrollment.findById(req.params.id);
    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }

    // Check ownership
    if (enrollment.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    enrollment.progress = progress;
    if (completedModules) {
      enrollment.completedModules = completedModules;
    }
    
    if (progress === 100) {
      enrollment.status = 'completed';
      enrollment.completionAt = Date.now();
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

module.exports = router;
