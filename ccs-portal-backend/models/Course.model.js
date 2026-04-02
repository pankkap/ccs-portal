const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['video', 'pdf', 'link'],
    default: 'video'
  },
  contentUrl: {
    type: String,
    required: true
  },
  order: {
    type: Number,
    default: 0
  }
}, { _id: true });

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  skills: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String, // URL to the uploaded image
    default: ''
  },
  published: {
    type: Boolean,
    default: false
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
  modules: [moduleSchema],
  order: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Ensure modules are sorted by order when retrieving
courseSchema.pre('save', function(next) {
  if (this.modules && this.modules.length > 0) {
    this.modules.sort((a, b) => a.order - b.order);
  }
  next();
});

const Course = mongoose.models.Course || mongoose.model('Course', courseSchema);

module.exports = Course;
