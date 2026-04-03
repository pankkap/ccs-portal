const express = require('express');
const router = express.Router();
const Placement = require('../models/Placement.model');
const Application = require('../models/Application.model');
const { authenticate, authorize } = require('../middleware/auth.middleware');

/**
 * @route GET /api/placements
 * @desc Get all job openings
 */
router.get('/', async (req, res) => {
  try {
    const placements = await Placement.find({ status: 'active' })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: { placements }
    });
  } catch (error) {
    console.error('Fetch placements error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route GET /api/placements/all
 * @desc Get all job openings for staff/admin
 * @access Private (Placement/Admin)
 */
router.get('/all', authenticate, authorize('placement', 'admin'), async (req, res) => {
  try {
    const placements = await Placement.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: { placements }
    });
  } catch (error) {
    console.error('Fetch all placements error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route POST /api/placements
 * @desc Create a new job opening
 * @access Private (Placement/Admin)
 */
router.post('/', authenticate, authorize('placement', 'admin'), async (req, res) => {
  try {
    const newPlacement = new Placement({
      ...req.body,
      postedBy: req.user._id
    });
    await newPlacement.save();
    res.status(201).json({
      success: true,
      data: { placement: newPlacement }
    });
  } catch (error) {
    console.error('Create placement error:', error);
    res.status(500).json({ success: false, message: 'Failed to post job' });
  }
});

/**
 * @route GET /api/placements/applications
 * @desc Get all applications (Placement/Admin only)
 * @access Private
 */
router.get('/applications', authenticate, authorize('placement', 'admin'), async (req, res) => {
  try {
    const applications = await Application.find()
      .populate('placementId', 'role company')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: { applications }
    });
  } catch (error) {
    console.error('Fetch applications error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route POST /api/placements/apply
 * @desc Apply for a job
 * @access Private (Student)
 */
router.post('/apply', authenticate, async (req, res) => {
  try {
    const { placementId, resume, notes } = req.body;
    
    const existing = await Application.findOne({ studentId: req.user._id, placementId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Already applied' });
    }

    const newApplication = new Application({
      studentId: req.user._id,
      placementId,
      studentName: req.user.name,
      resume,
      notes
    });

    await newApplication.save();
    res.json({ success: true, data: { application: newApplication } });
  } catch (error) {
    console.error('Apply error:', error);
    res.status(500).json({ success: false, message: 'Failed to apply' });
  }
});

/**
 * @route PUT /api/placements/applications/:id
 * @desc Update application status (Placement/Admin only)
 * @access Private
 */
router.put('/applications/:id', authenticate, authorize('placement', 'admin'), async (req, res) => {
  try {
    const { status } = req.body;
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { $set: { status, updatedAt: Date.now() } },
      { new: true }
    );
    res.json({ success: true, data: { application } });
  } catch (error) {
    console.error('Update application error:', error);
    res.status(500).json({ success: false, message: 'Failed to update' });
  }
});

/**
 * @route PUT /api/placements/:id
 * @desc Update a job opening
 * @access Private (Placement/Admin)
 */
router.put('/:id', authenticate, authorize('placement', 'admin'), async (req, res) => {
  try {
    const placement = await Placement.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json({ success: true, data: { placement } });
  } catch (error) {
    console.error('Update placement error:', error);
    res.status(500).json({ success: false, message: 'Failed to update job' });
  }
});

/**
 * @route DELETE /api/placements/:id
 * @desc Delete a job opening
 * @access Private (Placement/Admin)
 */
router.delete('/:id', authenticate, authorize('placement', 'admin'), async (req, res) => {
  try {
    await Placement.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Delete placement error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete job' });
  }
});

module.exports = router;
