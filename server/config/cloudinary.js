import { v2 as cloudinary } from 'cloudinary';

// Debug: Log what environment variables we have
console.log('🔍 Cloudinary config - checking environment variables:');
console.log('  CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? '✅ set' : '❌ NOT SET');
console.log('  CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '✅ set' : '❌ NOT SET');
console.log('  CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '✅ set' : '❌ NOT SET');
console.log('  CLOUDINARY_URL:', process.env.CLOUDINARY_URL ? '✅ set' : '❌ NOT SET');

// Configure Cloudinary - it automatically reads from CLOUDINARY_URL if set
// But we'll explicitly set all values to be sure
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Verify configuration was applied
console.log('🔐 Cloudinary configured:');
console.log('  cloud_name:', cloudinary.config().cloud_name ? '✅' : '❌');
console.log('  api_key:', cloudinary.config().api_key ? '✅' : '❌');
console.log('  api_secret:', cloudinary.config().api_secret ? '✅' : '❌');

export default cloudinary;
