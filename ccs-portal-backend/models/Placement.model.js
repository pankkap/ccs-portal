const mongoose = require('mongoose');

const placementSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    required: true,
    trim: true
  },
  jobDescription: {
    type: String,
    required: true
  },
  companyType: {
    type: String,
    enum: ['Product Based', 'Service Based'],
    required: true
  },
  location: {
    type: String,
    required: true
  },
  recruitmentProcess: {
    type: String,
    required: true
  },
  companyLink: {
    type: String
  },
  applyLink: {
    type: String
  },
  eligibility: {
    type: String
  },
  ctc: {
    type: String
  },
  targetSchools: {
    type: [String],
    default: []
  },
  targetDepartments: {
    type: [String],
    default: []
  },
  targetYears: {
    type: [String],
    default: []
  },
  skills: {
    type: [String],
    default: []
  },
  status: {
     type: String,
     enum: ['Open', 'Closed'],
     default: 'Open'
  },
  deadline: {
    type: Date
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  postedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const Placement = mongoose.models.Placement || mongoose.model('Placement', placementSchema);

module.exports = Placement;
