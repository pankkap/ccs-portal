const express = require('express');
const router = express.Router();
const AcademicStructure = require('../models/AcademicStructure.model');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// @desc    Get all academic units
// @route   GET /api/academic
// @access  Protected
router.get('/', authenticate, async (req, res) => {
  try {
    const units = await AcademicStructure.find().sort({ type: 1, name: 1 });
    res.json({ success: true, data: units });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Create academic unit
// @route   POST /api/academic
// @access  Private/Admin
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { type, name, parentId } = req.body;
    
    // Normalize parentId: Empty string should be null to avoid Mongoose validation error
    const normalizedParentId = parentId && parentId !== "" ? parentId : null;
    
    const unit = await AcademicStructure.create({ 
      type, 
      name, 
      parentId: normalizedParentId 
    });
    res.status(201).json({ success: true, data: unit });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @desc    Delete academic unit
// @route   DELETE /api/academic/:id
// @access  Private/Admin
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const unit = await AcademicStructure.findById(req.params.id);
    if (!unit) {
      return res.status(404).json({ success: false, message: 'Unit not found' });
    }
    await unit.deleteOne();
    res.json({ success: true, message: 'Academic unit removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
