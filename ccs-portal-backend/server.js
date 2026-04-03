const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const passport = require('passport');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const pageRoutes = require('./routes/page.routes');
const courseRoutes = require('./routes/course.routes');
const uploadRoutes = require('./routes/upload.routes');
const assessmentRoutes = require('./routes/assessment.routes');
const enrollmentRoutes = require('./routes/enrollment.routes');
const placementRoutes = require('./routes/placement.routes');
const certificateRoutes = require('./routes/certificate.routes');
const elibraryRoutes = require('./routes/elibrary.routes');
const aiRoutes = require('./routes/ai.routes');
const questionRoutes = require('./routes/question.routes');
const testRoutes = require('./routes/test.routes');
const authController = require('./controllers/auth.controller');
const path = require('path');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Passport Config
require('./config/passport');

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ccs-portal')
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'CCS Training Portal Backend API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      admin: '/api/admin',
      pages: '/api/pages'
    }
  });
});

// Auth Callback (Root Level) to match user's Google Console: http://localhost:5000/auth/google/callback
app.get('/auth/google/callback', 
  passport.authenticate('google', { session: false, failureRedirect: 'http://localhost:3000/login?error=oauth_failed' }),
  authController.googleSSOCallback
);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/pages', pageRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/placements', placementRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/elibrary', elibraryRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/tests', testRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;