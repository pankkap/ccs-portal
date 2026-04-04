const express = require('express');
const router = express.Router();
const Test = require('../models/Test.model');
const { authenticate, authorize } = require('../middleware/auth.middleware');

/**
 * @route GET /api/tests
 * @desc Get all public practice mock tests (Authenticated Students)
 * @access Private
 */
router.get('/', authenticate, async (req, res) => {
  try {
    // Filter: Only public practice tests for the general lobby
    const tests = await Test.find({ testType: 'practice', isPublic: true })
      .populate('questions')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { tests }
    });
  } catch (error) {
    console.error('Fetch Tests Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route GET /api/tests/my
 * @desc Get all tests created by the logged-in faculty (All types)
 * @access Private (Faculty/Admin)
 */
router.get('/my', authenticate, authorize('faculty', 'admin', 'placement'), async (req, res) => {
  try {
    const tests = await Test.find({ createdBy: req.user._id })
      .populate('questions')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { tests }
    });
  } catch (error) {
    console.error('Fetch My Tests Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route GET /api/tests/:id
 * @desc Get details of a specific test
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    // Students can access a test if it's public OR they are enrolled in a course that uses it (handled in enrollment routes)
    // For now, allow direct fetch if authenticated for simplicity in testing player
    const test = await Test.findById(req.params.id)
      .populate('questions');
    
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }

    res.json({ success: true, data: { test } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route POST /api/tests
 * @desc Create a new assessment or practice test
 * @access Private (Faculty/Admin)
 */
router.post('/', authenticate, authorize('faculty', 'admin', 'placement'), async (req, res) => {
  try {
    const { 
      title, description, duration, maxMarks, 
      isProctored, category, questions, 
      testType, isPublic, passingScore 
    } = req.body;

    if (!title || !duration || !category || !questions) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title, duration, category, and questions are required' 
      });
    }

    const test = new Test({
      title,
      description,
      duration,
      maxMarks,
      isProctored,
      category,
      questions,
      testType,
      isPublic,
      passingScore,
      createdBy: req.user._id
    });

    await test.save();

    res.status(201).json({
      success: true,
      message: 'Assessment created successfully',
      data: { test }
    });
  } catch (error) {
    console.error('Create Test Error:', error);
    res.status(500).json({ success: false, message: 'Failed to create assessment' });
  }
});

/**
 * @route PUT /api/tests/:id
 * @desc Update an assessment
 */
router.put('/:id', authenticate, authorize('faculty', 'admin', 'placement'), async (req, res) => {
  try {
    const test = await Test.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      { $set: req.body },
      { new: true }
    );

    if (!test) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }

    res.json({
      success: true,
      message: 'Assessment updated successfully',
      data: { test }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update assessment' });
  }
});

/**
 * @route DELETE /api/tests/:id
 * @desc Delete an assessment
 */
router.delete('/:id', authenticate, authorize('faculty', 'admin', 'placement'), async (req, res) => {
  try {
    const test = await Test.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });

    if (!test) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }

    res.json({
      success: true,
      message: 'Assessment deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete assessment' });
  }
});

module.exports = router;
