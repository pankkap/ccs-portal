const express = require('express');
const router = express.Router();
const Certificate = require('../models/Certificate.model');
const { authenticate } = require('../middleware/auth.middleware');

/**
 * @route GET /api/certificates
 * @desc Get all certificates for logged in student
 * @access Private (Student)
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const certificates = await Certificate.find({ studentId: req.user._id })
      .sort({ issuedAt: -1 });
    
    res.json({
      success: true,
      data: { certificates }
    });
  } catch (error) {
    console.error('Fetch certificates error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route GET /api/certificates/:id
 * @desc Get certificate by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id)
      .populate('studentId', 'name email');
    
    if (!certificate) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }

    res.json({
      success: true,
      data: { certificate }
    });
  } catch (error) {
    console.error('Fetch certificate error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
