const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  courseTitle: {
    type: String,
    required: true
  },
  certificateTemplateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CertificateTemplate',
    default: null
  },
  issuedAt: {
    type: Date,
    default: Date.now
  },
  certificateNumber: {
    type: String,
    required: true,
    unique: true
  }
}, { timestamps: true });

const Certificate = mongoose.models.Certificate || mongoose.model('Certificate', certificateSchema);

module.exports = Certificate;
