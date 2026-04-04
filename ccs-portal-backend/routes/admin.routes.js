const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const User = require('../models/User.model');
const Page = require('../models/Page.model');
const Course = require('../models/Course.model');
const ELibrary = require('../models/ELibrary.model');
const { authenticate, authorize } = require('../middleware/auth.middleware');

/**
 * Get dashboard statistics (admin only)
 */
router.get('/dashboard', authenticate, authorize('admin'), async (req, res) => {
  try {
    const User = require('../models/User.model');
    const Course = require('../models/Course.model');
    const Placement = require('../models/Placement.model');
    const Enrollment = require('../models/Enrollment.model');

    // Get statistics in parallel
    const [
      userStats,
      courseCount,
      placementCount,
      enrollmentCount,
      recentUsers
    ] = await Promise.all([
      User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
      Course.countDocuments(),
      Placement.countDocuments(),
      Enrollment.countDocuments(),
      User.find().select('-password').sort({ createdAt: -1 }).limit(5)
    ]);

    // Calculate total users
    const totalUsers = userStats.reduce((sum, stat) => sum + stat.count, 0);

    res.status(200).json({
      success: true,
      data: {
        statistics: {
          users: {
            total: totalUsers,
            byRole: userStats
          },
          courses: courseCount,
          placements: placementCount,
          enrollments: enrollmentCount
        },
        recentActivities: {
          users: recentUsers
        }
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics.',
      error: error.message
    });
  }
});

/**
 * Get all users (admin only)
 */
router.get('/users', authenticate, authorize('admin'), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      role,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      college,
      department,
      year
    } = req.query;

    // Build query
    const query = {};
    
    if (role) query.role = role;
    if (status) query.status = status;
    if (college) query.college = college;
    if (department) query.department = department;
    if (year) query.year = year;
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Sort options
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const users = await User.find(query)
      .select('-password')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Get total count
    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users.',
      error: error.message
    });
  }
});

/**
 * Get user by ID (admin only)
 */
router.get('/users/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    // Get user's pages
    const userPages = await Page.find({ author: user._id })
      .select('title slug status createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        user,
        pages: userPages
      }
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user.',
      error: error.message
    });
  }
});

/**
 * Update user (admin only)
 */
router.put('/users/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { name, email, role, status } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (email) updates.email = email;
    if (role) updates.role = role;
    if (status) updates.status = status;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully.',
      data: { user }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user.',
      error: error.message
    });
  }
});

/**
 * Delete user (admin only)
 */
router.delete('/users/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    // Prevent deleting own account
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account.'
      });
    }

    // Delete user's pages
    await Page.deleteMany({ author: user._id });

    // Delete user
    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User and associated pages deleted successfully.'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user.',
      error: error.message
    });
  }
});

/**
 * Patch user status (admin only)
 */
router.patch('/users/:id/status', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['active', 'inactive', 'suspended'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value.'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    res.status(200).json({
      success: true,
      message: `User status updated to ${status}.`,
      data: { user }
    });
  } catch (error) {
    console.error('Patch status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user status.',
      error: error.message
    });
  }
});

/**
 * Create staff/admin user (admin only)
 */
router.post('/users', authenticate, authorize('admin'), [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').notEmpty().trim(),
  body('role').isIn(['admin', 'staff', 'faculty', 'placement', 'student'])
], async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email.'
      });
    }

    // Create new user
    const user = new User({
      email,
      password,
      name,
      role: role || 'staff'
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'User created successfully.',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status
        }
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating user.',
      error: error.message
    });
  }
});

/**
 * System settings (admin only)
 */
router.get('/settings', authenticate, authorize('admin'), async (req, res) => {
  try {
    const Settings = require('../models/Settings.model');
    let settings = await Settings.findOne({ key: 'system_governance' });
    
    if (!settings) {
      settings = new Settings({ key: 'system_governance' });
      await settings.save();
    }

    res.status(200).json({
      success: true,
      data: { settings }
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching settings.',
      error: error.message
    });
  }
});

/**
 * Update system settings (admin only)
 */
router.put('/settings', authenticate, authorize('admin'), async (req, res) => {
  try {
    const Settings = require('../models/Settings.model');
    const updates = req.body;
    
    const settings = await Settings.findOneAndUpdate(
      { key: 'system_governance' },
      { $set: updates },
      { new: true, upsert: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Settings updated successfully.',
      data: { settings }
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating settings.',
      error: error.message
    });
  }
});

/**
 * ==========================================
 * FACULTY MANAGEMENT ROUTES
 * ==========================================
 */

/**
 * Get all faculty users (admin only)
 */
router.get('/faculty', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { department, search, role } = req.query;

    const query = {
      role: { $in: ['admin', 'faculty', 'placement'] }
    };
    
    if (role && query.role.$in.includes(role)) {
      query.role = role;
    }
    if (department && department !== 'all') {
      query.department = department;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } }
      ];
    }

    const faculty = await User.find(query)
      .select('-password')
      .sort({ order: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        faculty
      }
    });
  } catch (error) {
    console.error('Get faculty error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching faculty.',
      error: error.message
    });
  }
});

/**
 * Create new faculty (admin only)
 */
router.post('/faculty', authenticate, authorize('admin'), [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').notEmpty().trim(),
  body('role').isIn(['admin', 'faculty', 'placement'])
], async (req, res) => {
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
  }

  try {
    const { email, password, name, role, department, status, showInFacultyPage } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email.'
      });
    }

    const user = new User({
      email,
      password,
      name,
      role: role || 'faculty',
      department: department || '',
      status: status || 'active',
      // Respect the value from body, or default to true for 'faculty' role
      showInFacultyPage: showInFacultyPage !== undefined ? showInFacultyPage : (role === 'faculty'),
      designation: req.body.designation || '',
      specialization: req.body.specialization || '',
      experience: req.body.experience || '',
      education: req.body.education || '',
      image: req.body.image || '',
      linkedin: req.body.linkedin || ''
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'Faculty member created successfully.',
      data: {
        faculty: user
      }
    });
  } catch (error) {
    console.error('Create faculty error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating faculty.',
      error: error.message
    });
  }
});

/**
 * Update faculty (admin only)
 */
router.put('/faculty/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { 
      name, email, role, department, status, 
      showInFacultyPage, designation, specialization, experience, education, image, linkedin 
    } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (email) updates.email = email;
    if (role) updates.role = role;
    if (department !== undefined) updates.department = department;
    if (status) updates.status = status;
    
    // Faculty Profile Updates
    if (showInFacultyPage !== undefined) updates.showInFacultyPage = showInFacultyPage;
    if (designation !== undefined) updates.designation = designation;
    if (specialization !== undefined) updates.specialization = specialization;
    if (experience !== undefined) updates.experience = experience;
    if (education !== undefined) updates.education = education;
    if (image !== undefined) updates.image = image;
    if (linkedin !== undefined) updates.linkedin = linkedin;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Faculty member updated successfully.',
      data: { faculty: user }
    });
  } catch (error) {
    console.error('Update faculty error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating faculty.',
      error: error.message
    });
  }
});

/**
 * Delete faculty (admin only)
 */
router.delete('/faculty/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found.'
      });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account.'
      });
    }

    await Page.deleteMany({ author: user._id });
    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Faculty member deleted successfully.'
    });
  } catch (error) {
    console.error('Delete faculty error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting faculty.',
      error: error.message
    });
  }
});

/**
 * Patch faculty role (admin only)
 */
router.patch('/faculty/role/:id', authenticate, authorize('admin'), [
  body('role').isIn(['admin', 'faculty', 'placement'])
], async (req, res) => {
  try {
    const { role } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Faculty role updated successfully.',
      data: { faculty: user }
    });
  } catch (error) {
    console.error('Patch faculty role error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating role.',
      error: error.message
    });
  }
});

/**
 * Bulk reorder faculty (admin only)
 */
router.patch('/faculty/reorder', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { items } = req.body; // Expects [{ id, order }]
    
    if (!Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: 'Items must be an array.'
      });
    }

    const updatePromises = items.map(item => 
      User.findByIdAndUpdate(item.id, { order: item.order })
    );

    await Promise.all(updatePromises);

    res.status(200).json({
      success: true,
      message: 'Faculty reordered successfully.'
    });
  } catch (error) {
    console.error('Reorder faculty error:', error);
    res.status(500).json({
      success: false,
      message: 'Error reordering faculty.',
      error: error.message
    });
  }
});

/**
 * ==========================================
 * COURSE MANAGEMENT ROUTES
 * ==========================================
 */

/**
 * Get all courses (admin only)
 */
router.get('/courses', authenticate, authorize('admin', 'staff'), async (req, res) => {
  try {
    const courses = await Course.find()
      .sort({ order: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { courses }
    });
  } catch (error) {
    console.error('Get admin courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching courses.',
      error: error.message
    });
  }
});

/**
 * Bulk reorder courses (admin only)
 */
router.patch('/courses/reorder', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { items } = req.body; // Expects [{ id, order }]
    
    if (!Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: 'Items must be an array.'
      });
    }

    const updatePromises = items.map(item => 
      Course.findByIdAndUpdate(item.id, { order: item.order })
    );

    await Promise.all(updatePromises);

    res.status(200).json({
      success: true,
      message: 'Courses reordered successfully.'
    });
  } catch (error) {
    console.error('Reorder courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Error reordering courses.',
      error: error.message
    });
  }
});

/**
 * ==========================================
 * E-LIBRARY MANAGEMENT ROUTES
 * ==========================================
 */

/**
 * Get all e-library resources (admin only)
 */
router.get('/elibrary', authenticate, authorize('admin', 'staff'), async (req, res) => {
  try {
    const resources = await ELibrary.find()
      .sort({ order: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { resources }
    });
  } catch (error) {
    console.error('Get admin elibrary error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching e-library resources.',
      error: error.message
    });
  }
});

/**
 * Bulk reorder e-library resources (admin only)
 */
router.patch('/elibrary/reorder', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { items } = req.body; // Expects [{ id, order }]
    
    if (!Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: 'Items must be an array.'
      });
    }

    const updatePromises = items.map(item => 
      ELibrary.findByIdAndUpdate(item.id, { order: item.order })
    );

    await Promise.all(updatePromises);

    res.status(200).json({
      success: true,
      message: 'E-Library reordered successfully.'
    });
  } catch (error) {
    console.error('Reorder elibrary error:', error);
    res.status(500).json({
      success: false,
      message: 'Error reordering e-library.',
      error: error.message
    });
  }
});

module.exports = router;