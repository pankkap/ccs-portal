const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

/**
 * Generate JWT token
 */
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET || 'ccs-portal-secret-key',
    { expiresIn: '7d' }
  );
};

/**
 * Register a new user
 */
const register = async (req, res) => {
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
      role: role || 'student'
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id, user.role);

    // Update last login
    await user.updateLastLogin();

    // Set token in HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
          image: user.image,
          designation: user.designation,
          department: user.department
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering user.',
      error: error.message
    });
  }
};

/**
 * Login user
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Check account status
    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: `Account is ${user.status}. Please contact administrator.`
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Generate token
    const token = generateToken(user._id, user.role);

    // Update last login
    await user.updateLastLogin();

    // Set token in HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
          image: user.image,
          designation: user.designation,
          department: user.department,
          lastLogin: user.lastLogin
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login.',
      error: error.message
    });
  }
};

/**
 * Get current user profile
 */
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile.',
      error: error.message
    });
  }
};

/**
 * Update user profile
 */
const updateProfile = async (req, res) => {
  try {
    const { 
      name, email, designation, specialization, experience, 
      education, image, linkedin, department, 
      college, year, skills, preferences, rollNo, resume
    } = req.body;
    
    console.log('Update Profile Request Body:', req.body);
    
    const updates = {};

    if (name) updates.name = name;
    if (email) updates.email = email;
    if (rollNo !== undefined) updates.rollNo = rollNo;
    if (resume !== undefined) updates.resume = resume;
    if (designation !== undefined) updates.designation = designation;
    if (specialization !== undefined) updates.specialization = specialization;
    if (experience !== undefined) updates.experience = experience;
    if (education !== undefined) updates.education = education;
    if (image !== undefined) {
      console.log('Setting image update to:', image);
      updates.image = image;
    }
    if (linkedin !== undefined) updates.linkedin = linkedin;
    if (department !== undefined) updates.department = department;
    if (college !== undefined) updates.college = college;
    if (year !== undefined) updates.year = year;
    if (skills !== undefined) updates.skills = skills;
    if (preferences !== undefined) updates.preferences = preferences;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    console.log('Updated user record:', { id: user._id, image: user.image });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: { user }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile.',
      error: error.message
    });
  }
};

/**
 * Change password
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect.'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully.'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error changing password.',
      error: error.message
    });
  }
};

/**
 * Logout user by clearing cookie
 */
const logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  
  res.status(200).json({
    success: true,
    message: 'Logged out successfully.'
  });
};

/**
 * Handle Google SSO Callback
 */
const googleSSOCallback = async (req, res) => {
  try {
    const user = req.user; // Passport supplies the authenticated user here
    
    // Generate JWT
    const token = generateToken(user._id, user.role);
    
    // Update last login
    await user.updateLastLogin();

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    // Redirect securely to frontend dashboard which will now fetch profile
    res.redirect('http://localhost:3000/dashboard');
  } catch (error) {
    console.error('Google SSO Callback error:', error);
    res.redirect('http://localhost:3000/login?error=oauth_failed');
  }
};

/**
 * Get all users marked as visible for the public Faculty page
 */
const getPublicFaculty = async (req, res) => {
  try {
    const faculty = await User.find({ showInFacultyPage: true })
      .select('name designation specialization experience education image linkedin department order')
      .sort({ order: 1, name: 1 });

    res.status(200).json({
      success: true,
      data: { faculty }
    });
  } catch (error) {
    console.error('Get public faculty error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching faculty information.',
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  googleSSOCallback,
  getPublicFaculty
};