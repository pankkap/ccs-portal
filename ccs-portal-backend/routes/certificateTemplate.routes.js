const express = require('express');
const router = express.Router();
const CertificateTemplate = require('../models/CertificateTemplate.model');
const { authenticate, authorize } = require('../middleware/auth.middleware');

/**
 * @route GET /api/certificate-templates
 * @desc Get all ACTIVE templates (for faculty to select when building courses)
 * @access Private (Faculty/Admin)
 */
router.get('/', authenticate, authorize('faculty', 'admin'), async (req, res) => {
  try {
    const templates = await CertificateTemplate.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({ success: true, data: { templates } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route GET /api/certificate-templates/admin
 * @desc Get ALL templates (including inactive) for admin management panel
 * @access Private (Admin)
 */
router.get('/admin', authenticate, authorize('admin'), async (req, res) => {
  try {
    const templates = await CertificateTemplate.find({})
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: { templates } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route GET /api/certificate-templates/:id
 * @desc Get single template by ID
 * @access Private
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const template = await CertificateTemplate.findById(req.params.id);
    if (!template) return res.status(404).json({ success: false, message: 'Template not found' });
    res.json({ success: true, data: { template } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route POST /api/certificate-templates
 * @desc Create a new certificate template
 * @access Private (Admin)
 */
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { name, description, backgroundUrl, isActive } = req.body;
    if (!name || !backgroundUrl) {
      return res.status(400).json({ success: false, message: 'Name and background image are required' });
    }

    const template = await CertificateTemplate.create({
      name,
      description,
      backgroundUrl,
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user._id
    });

    res.status(201).json({ success: true, message: 'Template created successfully', data: { template } });
  } catch (error) {
    console.error('Create Template Error:', error);
    res.status(500).json({ success: false, message: 'Failed to create template' });
  }
});

/**
 * @route PUT /api/certificate-templates/:id
 * @desc Update a certificate template
 * @access Private (Admin)
 */
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const template = await CertificateTemplate.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!template) return res.status(404).json({ success: false, message: 'Template not found' });

    res.json({ success: true, message: 'Template updated', data: { template } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update template' });
  }
});

/**
 * @route DELETE /api/certificate-templates/:id
 * @desc Delete a certificate template
 * @access Private (Admin)
 */
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const template = await CertificateTemplate.findByIdAndDelete(req.params.id);
    if (!template) return res.status(404).json({ success: false, message: 'Template not found' });
    res.json({ success: true, message: 'Template deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete template' });
  }
});

module.exports = router;
