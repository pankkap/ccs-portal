const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const pageController = require('../controllers/page.controller');
const { authenticate, authorize, isAdminOrStaff } = require('../middleware/auth.middleware');

// Validation middleware
const validateCreatePage = [
  body('title').notEmpty().trim().isLength({ min: 3 }),
  body('slug').notEmpty().trim().matches(/^[a-z0-9-]+$/),
  body('content').notEmpty().trim(),
  body('status').optional().isIn(['published', 'draft', 'archived']),
  body('category').optional().isIn(['home', 'about', 'contact', 'training', 'faculty', 'placement', 'library', 'general'])
];

const validateUpdatePage = [
  body('title').optional().trim().isLength({ min: 3 }),
  body('slug').optional().trim().matches(/^[a-z0-9-]+$/),
  body('content').optional().trim(),
  body('status').optional().isIn(['published', 'draft', 'archived']),
  body('category').optional().isIn(['home', 'about', 'contact', 'training', 'faculty', 'placement', 'library', 'general'])
];

// Public routes (no authentication required)
router.get('/published', pageController.getPublishedPages);
router.get('/category/:category', pageController.getPagesByCategory);
router.get('/slug/:slug', pageController.getPageBySlug);

// Protected routes (require authentication)
router.post(
  '/',
  authenticate,
  isAdminOrStaff,
  validateCreatePage,
  pageController.createPage
);

router.get(
  '/',
  authenticate,
  isAdminOrStaff,
  pageController.getAllPages
);

router.get(
  '/:id',
  authenticate,
  isAdminOrStaff,
  pageController.getPageById
);

router.put(
  '/:id',
  authenticate,
  isAdminOrStaff,
  validateUpdatePage,
  pageController.updatePage
);

router.delete(
  '/:id',
  authenticate,
  authorize('admin', 'staff'),
  pageController.deletePage
);

// Admin-only routes
router.get(
  '/admin/stats',
  authenticate,
  authorize('admin'),
  async (req, res) => {
    try {
      const totalPages = await require('../models/Page.model').countDocuments();
      const publishedPages = await require('../models/Page.model').countDocuments({ status: 'published' });
      const draftPages = await require('../models/Page.model').countDocuments({ status: 'draft' });
      const totalViews = await require('../models/Page.model').aggregate([
        { $group: { _id: null, totalViews: { $sum: '$views' } } }
      ]);

      res.status(200).json({
        success: true,
        data: {
          totalPages,
          publishedPages,
          draftPages,
          totalViews: totalViews[0]?.totalViews || 0,
          categories: await require('../models/Page.model').aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } }
          ])
        }
      });
    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching statistics.',
        error: error.message
      });
    }
  }
);

// Bulk operations (admin only)
router.post(
  '/admin/bulk-publish',
  authenticate,
  authorize('admin'),
  async (req, res) => {
    try {
      const { pageIds } = req.body;
      
      if (!Array.isArray(pageIds) || pageIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Please provide an array of page IDs.'
        });
      }

      const result = await require('../models/Page.model').updateMany(
        { _id: { $in: pageIds } },
        { 
          status: 'published',
          publishedAt: new Date(),
          lastEditedBy: req.user._id
        }
      );

      res.status(200).json({
        success: true,
        message: `${result.modifiedCount} pages published successfully.`,
        data: { modifiedCount: result.modifiedCount }
      });
    } catch (error) {
      console.error('Bulk publish error:', error);
      res.status(500).json({
        success: false,
        message: 'Error publishing pages.',
        error: error.message
      });
    }
  }
);

module.exports = router;