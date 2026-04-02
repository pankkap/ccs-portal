const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

/**
 * Middleware to verify JWT token
 */
const authenticate = async (req, res, next) => {
  try {
    // Extract token from HTTP-only cookie, fallback to Authorization header
    const token = req.cookies.token || req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ccs-portal-secret-key');
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found.' 
      });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ 
        success: false, 
        message: 'Account is not active.' 
      });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid token.' 
    });
  }
};

/**
 * Middleware to check if user has required role
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required.' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Access denied. Required roles: ${roles.join(', ')}` 
      });
    }

    next();
  };
};

/**
 * Middleware to check if user is admin or staff
 */
const isAdminOrStaff = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required.' 
    });
  }

  if (!['admin', 'staff'].includes(req.user.role)) {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Admin or staff privileges required.' 
    });
  }

  next();
};

module.exports = {
  authenticate,
  authorize,
  isAdminOrStaff
};