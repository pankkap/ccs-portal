const mongoose = require('mongoose');

const elibrarySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Audio', 'Video', 'PDF', 'Doc', 'Link'],
    default: 'Link'
  },
  contentUrl: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
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
  order: {
    type: Number,
    default: 0
  }
}, { 
  timestamps: true 
});

const ELibrary = mongoose.models.ELibrary || mongoose.model('ELibrary', elibrarySchema);

module.exports = ELibrary;
