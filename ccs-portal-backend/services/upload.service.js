const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const { S3Client } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');

// Local storage configuration
const localStore = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for images and PDFs
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg', 
    'image/png', 
    'image/jpg', 
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, PDF, and DOC/DOCX are allowed.'), false);
  }
};

const upload = multer({
  storage: localStore,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

// Cloudinary configuration (if credentials exist)
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

// AWS S3 configuration (if credentials exist)
let s3Client = null;
if (process.env.AWS_ACCESS_KEY_ID) {
  s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });
}

/**
 * Handles the actual upload based on environment
 * @param {Object} file - The file object from Multer
 * @returns {Promise<string>} - The URL of the uploaded file
 */
const handleFileUpload = async (file) => {
  // If in production and S3/Cloudinary is configured
  if (process.env.NODE_ENV === 'production') {
    // Priority 1: Cloudinary
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      try {
        const result = await cloudinary.uploader.upload(file.path, {
          resource_type: file.mimetype === 'application/pdf' ? 'raw' : 'auto',
          folder: 'ccs-portal'
        });
        // Delete local temporary file
        fs.unlinkSync(file.path);
        return result.secure_url;
      } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw new Error('Cloudinary upload failed');
      }
    }
    
    // Priority 2: AWS S3
    if (s3Client) {
      try {
        const fileStream = fs.createReadStream(file.path);
        const upload = new Upload({
          client: s3Client,
          params: {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: `uploads/${Date.now()}-${file.originalname}`,
            Body: fileStream,
            ContentType: file.mimetype,
            ACL: 'public-read'
          }
        });

        const result = await upload.done();
        // Delete local temporary file
        fs.unlinkSync(file.path);
        return result.Location;
      } catch (error) {
        console.error('S3 upload error:', error);
        throw new Error('S3 upload failed');
      }
    }
  }

  // Fallback / Local Mode: Return the local static URL
  // In development, we serve the 'uploads' folder statically
  const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
  return `${baseUrl}/uploads/${path.basename(file.path)}`;
};

module.exports = {
  upload,
  handleFileUpload
};
