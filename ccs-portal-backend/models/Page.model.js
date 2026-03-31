const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  excerpt: {
    type: String,
    trim: true
  },
  metaTitle: {
    type: String,
    trim: true
  },
  metaDescription: {
    type: String,
    trim: true
  },
  metaKeywords: {
    type: [String],
    default: []
  },
  status: {
    type: String,
    enum: ['published', 'draft', 'archived'],
    default: 'draft'
  },
  category: {
    type: String,
    enum: ['home', 'about', 'contact', 'training', 'faculty', 'placement', 'library', 'general'],
    default: 'general'
  },
  featuredImage: {
    type: String,
    default: ''
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastEditedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  publishedAt: {
    type: Date,
    default: null
  },
  views: {
    type: Number,
    default: 0
  },
  seoScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  customFields: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Index for faster queries
pageSchema.index({ slug: 1 });
pageSchema.index({ status: 1, category: 1 });
pageSchema.index({ author: 1 });
pageSchema.index({ createdAt: -1 });

// Pre-save middleware to update publishedAt
pageSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  if (this.isModified('content') || this.isModified('title')) {
    // Update SEO score based on content length, title presence, etc.
    let score = 0;
    if (this.title && this.title.length > 10) score += 30;
    if (this.content && this.content.length > 200) score += 40;
    if (this.metaDescription && this.metaDescription.length > 50) score += 20;
    if (this.metaKeywords && this.metaKeywords.length > 0) score += 10;
    
    this.seoScore = Math.min(100, score);
  }
  
  next();
});

// Method to increment views
pageSchema.methods.incrementViews = async function() {
  this.views += 1;
  await this.save();
};

// Static method to get published pages
pageSchema.statics.getPublishedPages = function() {
  return this.find({ status: 'published' })
    .populate('author', 'name email')
    .sort({ publishedAt: -1 });
};

// Static method to get pages by category
pageSchema.statics.getPagesByCategory = function(category) {
  return this.find({ 
    status: 'published', 
    category 
  })
  .populate('author', 'name email')
  .sort({ publishedAt: -1 });
};

const Page = mongoose.model('Page', pageSchema);

module.exports = Page;