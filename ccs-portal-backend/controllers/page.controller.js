const Page = require('../models/Page.model');

/**
 * Create a new page
 */
const createPage = async (req, res) => {
  try {
    const {
      title,
      slug,
      content,
      excerpt,
      metaTitle,
      metaDescription,
      metaKeywords,
      status,
      category,
      featuredImage,
      customFields
    } = req.body;

    // Check if slug already exists
    const existingPage = await Page.findOne({ slug });
    if (existingPage) {
      return res.status(400).json({
        success: false,
        message: 'A page with this slug already exists.'
      });
    }

    // Create new page
    const page = new Page({
      title,
      slug,
      content,
      excerpt,
      metaTitle: metaTitle || title,
      metaDescription,
      metaKeywords: metaKeywords || [],
      status: status || 'draft',
      category: category || 'general',
      featuredImage: featuredImage || '',
      author: req.user._id,
      lastEditedBy: req.user._id,
      customFields: customFields || {}
    });

    await page.save();

    // Populate author details
    await page.populate('author', 'name email');

    res.status(201).json({
      success: true,
      message: 'Page created successfully.',
      data: { page }
    });
  } catch (error) {
    console.error('Create page error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating page.',
      error: error.message
    });
  }
};

/**
 * Get all pages (with pagination and filtering)
 */
const getAllPages = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      category,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};
    
    if (status) query.status = status;
    if (category) query.category = category;
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } }
      ];
    }

    // Sort options
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const pages = await Page.find(query)
      .populate('author', 'name email')
      .populate('lastEditedBy', 'name email')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Get total count
    const total = await Page.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        pages,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all pages error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pages.',
      error: error.message
    });
  }
};

/**
 * Get page by ID
 */
const getPageById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const page = await Page.findById(id)
      .populate('author', 'name email')
      .populate('lastEditedBy', 'name email');

    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Page not found.'
      });
    }

    // Increment views if it's a published page
    if (page.status === 'published') {
      await page.incrementViews();
    }

    res.status(200).json({
      success: true,
      data: { page }
    });
  } catch (error) {
    console.error('Get page by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching page.',
      error: error.message
    });
  }
};

/**
 * Get page by slug
 */
const getPageBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const page = await Page.findOne({ slug })
      .populate('author', 'name email')
      .populate('lastEditedBy', 'name email');

    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Page not found.'
      });
    }

    // Check if page is published (unless admin/staff)
    if (page.status !== 'published' && 
        !['admin', 'staff'].includes(req.user?.role)) {
      return res.status(403).json({
        success: false,
        message: 'This page is not published.'
      });
    }

    // Increment views if it's a published page
    if (page.status === 'published') {
      await page.incrementViews();
    }

    res.status(200).json({
      success: true,
      data: { page }
    });
  } catch (error) {
    console.error('Get page by slug error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching page.',
      error: error.message
    });
  }
};

/**
 * Update page
 */
const updatePage = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Find page
    const page = await Page.findById(id);
    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Page not found.'
      });
    }

    // Check permissions (author or admin/staff)
    if (page.author.toString() !== req.user._id.toString() && 
        !['admin', 'staff'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this page.'
      });
    }

    // Update page
    Object.keys(updates).forEach(key => {
      if (key !== '_id' && key !== 'author' && key !== 'createdAt') {
        page[key] = updates[key];
      }
    });

    // Update last edited by
    page.lastEditedBy = req.user._id;

    await page.save();
    await page.populate('author', 'name email');
    await page.populate('lastEditedBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Page updated successfully.',
      data: { page }
    });
  } catch (error) {
    console.error('Update page error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating page.',
      error: error.message
    });
  }
};

/**
 * Delete page
 */
const deletePage = async (req, res) => {
  try {
    const { id } = req.params;

    // Find page
    const page = await Page.findById(id);
    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Page not found.'
      });
    }

    // Check permissions (author or admin/staff)
    if (page.author.toString() !== req.user._id.toString() && 
        !['admin', 'staff'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this page.'
      });
    }

    await page.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Page deleted successfully.'
    });
  } catch (error) {
    console.error('Delete page error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting page.',
      error: error.message
    });
  }
};

/**
 * Get published pages for public access
 */
const getPublishedPages = async (req, res) => {
  try {
    const pages = await Page.getPublishedPages();
    
    res.status(200).json({
      success: true,
      data: { pages }
    });
  } catch (error) {
    console.error('Get published pages error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching published pages.',
      error: error.message
    });
  }
};

/**
 * Get pages by category for public access
 */
const getPagesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    const pages = await Page.getPagesByCategory(category);
    
    res.status(200).json({
      success: true,
      data: { pages }
    });
  } catch (error) {
    console.error('Get pages by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pages by category.',
      error: error.message
    });
  }
};

module.exports = {
  createPage,
  getAllPages,
  getPageById,
  getPageBySlug,
  updatePage,
  deletePage,
  getPublishedPages,
  getPagesByCategory
};