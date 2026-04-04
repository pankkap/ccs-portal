const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema({
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['passed', 'failed'],
    required: true
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
});

const enrollmentSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'dropped'],
    default: 'in-progress'
  },
  progress: {
    type: Number,
    default: 0
  },
  completedModules: [{
    type: String // Module ID or Title
  }],
  assessmentAttempts: [attemptSchema],
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now
  },
  completionAt: {
    type: Date
  }
}, { timestamps: true });

// Ensure a student can only enroll in a course once
enrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

const Enrollment = mongoose.models.Enrollment || mongoose.model('Enrollment', enrollmentSchema);

module.exports = Enrollment;
