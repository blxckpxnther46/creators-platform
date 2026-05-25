import multer from 'multer';

// Use memory storage - file stays in RAM as a Buffer
const storage = multer.memoryStorage();

// Create upload middleware with file size and type restrictions
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only allow image files
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (JPEG, PNG, WebP, GIF)'), false);
    }
  }
});

export default upload;
