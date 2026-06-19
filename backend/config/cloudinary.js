import { v2 as cloudinary } from 'cloudinary';
import env from './env.js';

// The SDK auto-reads CLOUDINARY_URL from the environment; calling config()
// here makes the dependency explicit and lets us flag a missing setup early.
if (env.cloudinaryUrl) {
  cloudinary.config({ secure: true });
} else {
  console.warn('CLOUDINARY_URL not set — /uploads will fail until configured.');
}

export default cloudinary;
