const express = require('express');
const router = express.Router();
const Test = require('../models/Test.model');
const { authenticate, authorize } = require('../middleware/auth.middleware');

/**
 * @route GET /api/tests/my
 * @desc Get all tests created by the logged-in faculty
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
router.get('/:id', authenticate, authorize('faculty', 'admin', 'placement'), async (req, res) => {
  try {
    const test = await Test.findOne({ _id: req.params.id, createdBy: req.user._id })
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
 * @desc Create a new mock test
 * @access Private (Faculty/Admin)
 */
router.post('/', authenticate, authorize('faculty', 'admin', 'placement'), async (req, res) => {
  try {
    const { title, description, duration, maxMarks, isProctored, category, questions } = req.body;

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
      createdBy: req.user._id
    });

    await test.save();

    res.status(201).json({
      success: true,
      message: 'Test created successfully',
      data: { test }
    });
  } catch (error) {
    console.error('Create Test Error:', error);
    res.status(500).json({ success: false, message: 'Failed to create test' });
  }
});

/**
 * @route PUT /api/tests/:id
 * @desc Update a test
 */
router.put('/:id', authenticate, authorize('faculty', 'admin', 'placement'), async (req, res) => {
  try {
    const test = await Test.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      { $set: req.body },
      { new: true }
    );

    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }

    res.json({
      success: true,
      message: 'Test updated successfully',
      data: { test }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update test' });
  }
});

/**
 * @route DELETE /api/tests/:id
 * @desc Delete a test
 */
router.delete('/:id', authenticate, authorize('faculty', 'admin', 'placement'), async (req, res) => {
  try {
    const test = await Test.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });

    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }

    res.json({
      success: true,
      message: 'Test deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete test' });
  }
});

module.exports = router;
