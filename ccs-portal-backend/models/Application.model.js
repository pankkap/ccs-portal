const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  placementId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Placement',
    required: true
  },
  status: {
    type: String,
    enum: ['applied', 'shortlisted', 'rejected', 'placed'],
    default: 'applied'
  },
  studentName: {
    type: String,
    required: true
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  resume: {
    type: String // URL
  },
  notes: {
    type: String
  }
}, { timestamps: true });

// A student can only apply to a job once
applicationSchema.index({ studentId: 1, placementId: 1 }, { unique: true });

const Application = mongoose.models.Application || mongoose.model('Application', applicationSchema);

module.exports = Application;
