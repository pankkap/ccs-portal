const express = require('express');
const router = express.Router();
const Certificate = require('../models/Certificate.model');
const Enrollment = require('../models/Enrollment.model');
const crypto = require('crypto');
const { authenticate } = require('../middleware/auth.middleware');

/**
 * @route GET /api/certificates
 * @desc Get all certificates for logged in student
 * @access Private (Student)
 */
router.get('/', authenticate, async (req, res) => {
  try {
    // Retroactive Self-Healing: Mint missing certificates for completed enrollments
    const completedEnrollments = await Enrollment.find({ studentId: req.user._id, status: 'completed' }).populate('courseId');
    for (const enrollment of completedEnrollments) {
       if (enrollment.courseId) {
          const existing = await Certificate.findOne({ studentId: req.user._id, courseId: enrollment.courseId._id });
          if (!existing) {
             const certNum = 'CCS-' + crypto.randomBytes(3).toString('hex').toUpperCase() + '-' + Date.now().toString().slice(-4);
              await Certificate.create({
                 studentId: req.user._id,
                 studentName: req.user.name,
                 courseId: enrollment.courseId._id,
                 courseTitle: enrollment.courseId.title,
                 certificateTemplateId: enrollment.courseId.certificateTemplateId || null,
                 certificateNumber: certNum
              });
           } else if (!existing.certificateTemplateId && enrollment.courseId.certificateTemplateId) {
              // Sync template ID if missing on existing certificate
              existing.certificateTemplateId = enrollment.courseId.certificateTemplateId;
              await existing.save();
           }
        }
     }
 
     const certificates = await Certificate.find({ studentId: req.user._id })
       .populate('certificateTemplateId')
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
