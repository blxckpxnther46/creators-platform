import { v2 as cloudinary } from 'cloudinary';

// Cloudinary automatically uses CLOUDINARY_URL or individual variables from environment
cloudinary.config({
  secure: true
});

console.log('✅ Cloudinary initialized');

export default cloudinary;
