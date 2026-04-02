const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  options: [{
    type: String,
    required: true
  }],
  correctOption: {
    type: Number,
    required: true
  },
  points: {
    type: Number,
    default: 1
  },
  order: {
    type: Number,
    default: 0
  }
});

const assessmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String
  },
  timeLimit: {
    type: Number,
    default: 30 // in minutes
  },
  passingScore: {
    type: Number,
    default: 70
  },
  type: {
    type: String,
    enum: ['exam', 'mock'],
    default: 'exam'
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  facultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  facultyName: {
    type: String,
    required: true
  },
  questions: [questionSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const Assessment = mongoose.models.Assessment || mongoose.model('Assessment', assessmentSchema);

module.exports = Assessment;
