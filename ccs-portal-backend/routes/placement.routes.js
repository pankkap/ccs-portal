const express = require('express');
const router = express.Router();
const Placement = require('../models/Placement.model');
const Application = require('../models/Application.model');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// =====================================================================
// IMPORTANT: All named/static routes MUST be defined BEFORE /:id routes
// Otherwise Express will treat "matched", "my-applications" etc. as :id
// =====================================================================

/**
 * @route GET /api/placements
 * @desc Get all job openings
 */
router.get('/', async (req, res) => {
  try {
    const placements = await Placement.find({ status: 'Open' })
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
 * @access Private (Placement/Admin/Staff)
 */
router.get('/all', authenticate, authorize('placement', 'admin', 'staff'), async (req, res) => {
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
 * @route GET /api/placements/matched
 * @desc Get jobs matching student profile
 * @access Private (Student)
 */
router.get('/matched', authenticate, async (req, res) => {
  try {
    const { college, department, year } = req.user;
    
    // Build match query
    const query = { status: 'Open' };
    
    // Match logic: If target array exists and isn't empty, student must be in it.
    // If empty or missing, it's open to everyone in that category.
    const matchFilters = [];
    
    if (college) {
      matchFilters.push({ 
        $or: [
          { targetSchools: { $exists: false } },
          { targetSchools: { $size: 0 } },
          { targetSchools: college }
        ] 
      });
    }

    if (department) {
      matchFilters.push({ 
        $or: [
          { targetDepartments: { $exists: false } },
          { targetDepartments: { $size: 0 } },
          { targetDepartments: department }
        ] 
      });
    }

    if (year) {
      matchFilters.push({ 
        $or: [
          { targetYears: { $exists: false } },
          { targetYears: { $size: 0 } },
          { targetYears: year }
        ] 
      });
    }

    if (matchFilters.length > 0) {
      query.$and = matchFilters;
    }

    const placements = await Placement.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: { placements } });
  } catch (error) {
    console.error('Match placements algorithm error:', error);
    // Graceful fallback for API consumers
    try {
      const fallbackPlacements = await Placement.find({ status: 'Open' }).sort({ createdAt: -1 });
      res.json({ success: true, data: { placements: fallbackPlacements, note: 'Profile incomplete, showing general drives' } });
    } catch (fallbackError) {
      res.status(500).json({ success: false, message: 'Institutional matching system failure' });
    }
  }
});

/**
 * @route GET /api/placements/my-applications
 * @desc Get all placements the user has applied to
 */
router.get('/my-applications', authenticate, async (req, res) => {
  try {
    const placements = await Placement.find({
      'applicants.studentId': req.user._id
    }).sort({ createdAt: -1 });

    const applications = placements.map(p => {
      const applicant = p.applicants.find(a => a.studentId.toString() === req.user._id.toString());
      return {
        ...applicant.toObject(),
        placementId: {
          _id: p._id,
          companyName: p.companyName,
          role: p.role
        }
      };
    });

    res.json({ success: true, data: { applications } });
  } catch (error) {
    console.error('Fetch my apps error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route GET /api/placements/applications
 * @desc Get all applications (Placement/Admin only)
 * @access Private (Placement/Admin/Staff)
 */
router.get('/applications', authenticate, authorize('placement', 'admin', 'staff'), async (req, res) => {
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
 * @route POST /api/placements
 * @desc Create a new job opening
 * @access Private (Placement/Admin/Staff)
 */
router.post('/', authenticate, authorize('placement', 'admin', 'staff'), async (req, res) => {
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
 * @route POST /api/placements/apply
 * @desc Apply for a job (Internal Applicants Registry)
 */
router.post('/apply', authenticate, async (req, res) => {
  try {
    const { placementId, resume, notes } = req.body;
    
    // Find placement and check if already applied
    const placement = await Placement.findById(placementId);
    if (!placement) {
      return res.status(404).json({ success: false, message: 'Drive not found' });
    }

    const hasApplied = placement.applicants.some(a => a.studentId.toString() === req.user._id.toString());
    if (hasApplied) {
      return res.status(400).json({ success: false, message: 'Already applied to this drive' });
    }

    // Push to applicants registry
    placement.applicants.push({
      studentId: req.user._id,
      studentName: req.user.name,
      skills: req.body.skills || [], // Skill Alignment
      resume, // PDF URL
      notes: req.body.notes || 'Dossier synchronized via Student Identity Portal'
    });

    await placement.save();

    // Explicitly create an Application Record for Admin dashboard compatibility
    try {
      await Application.create({
        studentId: req.user._id,
        placementId: placementId,
        studentName: req.user.name,
        resume,
        notes: req.body.notes || 'Dossier synchronized via Student Identity Portal'
      });
    } catch (appErr) {
      // Ignore if document naturally duplicates due to the unique index during race conditions
      console.error('Application creation warning:', appErr);
    }

    // Update Student model with the placement drive Id to track global history and sync global skills
    const User = require('../models/User.model');
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { 
        appliedPlacements: placementId,
        skills: { $each: req.body.skills || [] }
      }
    });

    res.json({ success: true, message: 'Application Synchronized Successfully' });
  } catch (error) {
    console.error('Apply error:', error);
    res.status(500).json({ success: false, message: 'Failed to synchronize application' });
  }
});

/**
 * @route PUT /api/placements/applications
 * @desc Update application status (Nested Registry)
 */
router.put('/applications', authenticate, authorize('placement', 'admin', 'staff'), async (req, res) => {
  try {
    const { placementId, studentId, status } = req.body;
    
    const placement = await Placement.findById(placementId);
    if (!placement) {
      return res.status(404).json({ success: false, message: 'Drive not found' });
    }

    const applicant = placement.applicants.find(a => a.studentId.toString() === studentId);
    if (!applicant) {
      return res.status(404).json({ success: false, message: 'Applicant not found' });
    }

    applicant.status = status;
    await placement.save();

    res.json({ success: true, message: 'Applicant status updated' });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update status' });
  }
});

// =====================================================================
// Parameterized :id routes MUST come LAST to avoid catching named routes
// =====================================================================

/**
 * @route GET /api/placements/:id
 * @desc Get single job opening details
 */
router.get('/:id', async (req, res) => {
  try {
    const placement = await Placement.findById(req.params.id)
      .populate('applicants.studentId', 'rollNo name year department college cgpa resume');
    if (!placement) {
      return res.status(404).json({ success: false, message: 'Drive not found' });
    }
    
    res.json({
      success: true,
      data: { placement }
    });
  } catch (error) {
    console.error('Fetch placement details error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route PUT /api/placements/:id
 * @desc Update a job opening
 * @access Private (Placement/Admin/Staff)
 */
router.put('/:id', authenticate, authorize('placement', 'admin', 'staff'), async (req, res) => {
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
 * @access Private (Placement/Admin/Staff)
 */
router.delete('/:id', authenticate, authorize('placement', 'admin', 'staff'), async (req, res) => {
  try {
    await Placement.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Delete placement error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete job' });
  }
});

module.exports = router;
