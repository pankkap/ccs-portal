const express = require('express');
const router = express.Router();
const { upload, handleFileUpload } = require('../services/upload.service');

const { authenticate } = require('../middleware/auth.middleware');

/**
 * @route POST /api/upload
 * @desc Upload a single file (Image or PDF)
 * @access Private
 */
router.post('/', authenticate, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded.'
      });
    }

    // Process the upload (move to cloud if in production, or keep local)
    const fileUrl = await handleFileUpload(req.file);

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully.',
      data: {
        url: fileUrl,
        filename: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      }
    });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'File upload failed.'
    });
  }
});

module.exports = router;
