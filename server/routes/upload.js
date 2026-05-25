import express from 'express';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import cloudinary from '../config/cloudinary.js';

const router = express.Router();

// Helper function to upload file buffer to Cloudinary
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'creator-platform' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });
};

// Upload file to Cloudinary
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    console.log('📤 Upload request received');
    console.log('  - User:', req.user?.email);
    console.log('  - File:', req.file ? '✅ present' : '❌ missing');
    
    // Check if file was uploaded
    if (!req.file) {
      console.log('❌ No file in request');
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    console.log('📦 Uploading to Cloudinary...');
    // Upload buffer to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer);

    console.log('✅ Upload successful:', result.secure_url);
    // Return secure URL and public ID
    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        size: result.bytes,
        format: result.format
      }
    });

  } catch (error) {
    console.error('❌ Upload error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to upload file',
      error: error.message
    });
  }
});

// Multer error handler (must have 4 parameters to be treated as error middleware)
router.use((error, req, res, next) => {
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File is too large. Maximum size is 5MB.'
    });
  }

  return res.status(400).json({
    success: false,
    message: error.message || 'File upload error'
  });
});

export default router;
