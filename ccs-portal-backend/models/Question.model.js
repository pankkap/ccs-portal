const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
    trim: true
  },
  domain: {
    type: String,
    required: true,
    enum: ['Aptitude Reasoning', 'Communication Verbal', 'Technical Domain'],
    default: 'Technical Domain'
  },
  type: {
    type: String,
    required: true,
    enum: ['MCQ (Single Ans)', 'MCQ (Multiple Ans)', 'Fill in the Blank', 'Output Based', 'Subjective'],
    default: 'MCQ (Single Ans)'
  },
  options: [{
    type: String
  }],
  correctAnswer: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  explanation: {
    type: String
  },
  topic: {
    type: String,
    required: true,
    trim: true
  },
  subtopic: {
    type: String,
    trim: true
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  source: {
    type: String,
    enum: ['AI', 'Manual', 'Bulk'],
    default: 'Manual'
  }
}, { 
  timestamps: true 
});

const Question = mongoose.models.Question || mongoose.model('Question', questionSchema);

module.exports = Question;
