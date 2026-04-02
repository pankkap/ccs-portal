const express = require('express');
const router = express.Router();
const ELibrary = require('../models/ELibrary.model');
const { authenticate, authorize } = require('../middleware/auth.middleware');

/**
 * @route GET /api/elibrary
 * @desc Get all e-library resources
 * @access Public
 */
router.get('/', async (req, res) => {
  try {
    const resources = await ELibrary.find()
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: { resources }
    });
  } catch (error) {
    console.error('Fetch e-library error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route GET /api/elibrary/my
 * @desc Get all resources created by the logged-in faculty
 * @access Private (Faculty/Admin)
 */
router.get('/my', authenticate, authorize('faculty', 'admin', 'placement'), async (req, res) => {
  try {
    const resources = await ELibrary.find({ facultyId: req.user._id })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: { resources }
    });
  } catch (error) {
    console.error('Fetch my resources error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route POST /api/elibrary
 * @desc Create a new resource
 * @access Private (Faculty/Admin)
 */
router.post('/', authenticate, authorize('faculty', 'admin', 'placement'), async (req, res) => {
  try {
    const { title, type, contentUrl, description } = req.body;

    if (!title || !type || !contentUrl) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title, type, and content/URL are required' 
      });
    }

    const newResource = new ELibrary({
      title,
      type,
      contentUrl,
      description,
      facultyId: req.user._id,
      facultyName: req.user.name
    });

    await newResource.save();

    res.status(201).json({
      success: true,
      message: 'Resource added successfully',
      data: { resource: newResource }
    });
  } catch (error) {
    console.error('Create resource error:', error);
    res.status(500).json({ success: false, message: 'Failed to add resource' });
  }
});

/**
 * @route PUT /api/elibrary/:id
 * @desc Update an existing resource
 * @access Private (Faculty/Admin)
 */
router.put('/:id', authenticate, authorize('faculty', 'admin', 'placement'), async (req, res) => {
  try {
    const resource = await ELibrary.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    // Check ownership
    if (resource.facultyId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const updates = req.body;
    const updatedResource = await ELibrary.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Resource updated successfully',
      data: { resource: updatedResource }
    });
  } catch (error) {
    console.error('Update resource error:', error);
    res.status(500).json({ success: false, message: 'Failed to update resource' });
  }
});

/**
 * @route DELETE /api/elibrary/:id
 * @desc Delete a resource
 * @access Private (Faculty/Admin)
 */
router.delete('/:id', authenticate, authorize('faculty', 'admin', 'placement'), async (req, res) => {
  try {
    const resource = await ELibrary.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    // Check ownership
    if (resource.facultyId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    await ELibrary.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Resource deleted successfully'
    });
  } catch (error) {
    console.error('Delete resource error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete resource' });
  }
});

module.exports = router;
