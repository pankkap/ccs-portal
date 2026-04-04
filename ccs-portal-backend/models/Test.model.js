const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  testType: {
    type: String,
    enum: ['practice', 'curriculum'],
    default: 'practice'
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  passingScore: {
    type: Number,
    default: 70
  },
  duration: {
    type: Number, // in minutes
    required: true,
    default: 30
  },
  maxMarks: {
    type: Number,
    default: 100
  },
  isProctored: {
    type: Boolean,
    default: false
  },
  category: {
    type: String,
    required: true,
    enum: ['Aptitude Reasoning', 'Communication Verbal', 'Technical Domain']
  },
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { 
  timestamps: true 
});

// Auto-flip isPublic to false if Curriculum type is selected
testSchema.pre('save', function(next) {
  if (this.testType === 'curriculum') {
    this.isPublic = false;
  }
  next();
});

const Test = mongoose.models.Test || mongoose.model('Test', testSchema);

module.exports = Test;
