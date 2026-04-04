const express = require('express');
const router = express.Router();
const Course = require('../models/Course.model');
const { authenticate, authorize } = require('../middleware/auth.middleware');

/**
 * @route GET /api/courses
 * @desc Get all published courses
 * @access Public
 */
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find({ published: true })
      .sort({ createdAt: -1 })
      .select('-modules'); // Don't return all modules in the list view for performance
    
    res.json({
      success: true,
      data: { courses }
    });
  } catch (error) {
    console.error('Fetch courses error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route GET /api/courses/my
 * @desc Get all courses created by the logged-in faculty
 * @access Private (Faculty/Admin)
 */
router.get('/my', authenticate, authorize('faculty', 'admin'), async (req, res) => {
  try {
    const courses = await Course.find({ facultyId: req.user._id })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: { courses }
    });
  } catch (error) {
    console.error('Fetch my courses error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route GET /api/courses/:id
 * @desc Get course by ID
 * @access Private/Public (based on published status)
 */
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.id || req.params.id);
    
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    res.json({
      success: true,
      data: { course }
    });
  } catch (error) {
    console.error('Fetch course error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route POST /api/courses
 * @desc Create a new course
 * @access Private (Faculty/Admin)
 */
router.post('/', authenticate, authorize('faculty', 'admin'), async (req, res) => {
  try {
    const { title, description, skills, duration, thumbnail, published, modules, finalAssessmentId, finalAllowedAttempts, certificateTemplateId, issueCertificate } = req.body;

    const newCourse = new Course({
      title,
      description,
      skills,
      duration,
      thumbnail,
      published,
      finalAssessmentId,
      finalAllowedAttempts,
      certificateTemplateId,
      issueCertificate,
      facultyId: req.user._id,
      facultyName: req.user.name,
      modules: modules || []
    });

    await newCourse.save();

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: { course: newCourse }
    });
  } catch (error) {
    console.error('Create course error:', error);
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map(val => val.message).join(', ');
      return res.status(400).json({ success: false, message });
    }
    res.status(500).json({ success: false, message: 'Failed to create course' });
  }
});

/**
 * @route PUT /api/courses/:id
 * @desc Update an existing course
 * @access Private (Faculty/Admin)
 */
router.put('/:id', authenticate, authorize('faculty', 'admin'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Check ownership
    if (course.facultyId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to update this course' });
    }

    const updates = req.body;
    updates.updatedAt = Date.now();

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Course updated successfully',
      data: { course: updatedCourse }
    });
  } catch (error) {
    console.error('Update course error:', error);
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map(val => val.message).join(', ');
      return res.status(400).json({ success: false, message });
    }
    res.status(500).json({ success: false, message: 'Failed to update course' });
  }
});

/**
 * @route DELETE /api/courses/:id
 * @desc Delete a course
 * @access Private (Faculty/Admin)
 */
router.delete('/:id', authenticate, authorize('faculty', 'admin'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Check ownership
    if (course.facultyId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this course' });
    }

    await Course.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete course' });
  }
});

module.exports = router;
