import 'dotenv/config';

// Fail-fast validation: the app refuses to boot without its required config.
const REQUIRED = ['SUPABASE_DB_URL', 'JWT_SECRET'];

const missing = REQUIRED.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

const env = {
  databaseUrl: process.env.SUPABASE_DB_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  cloudinaryUrl: process.env.CLOUDINARY_URL,
  port: Number(process.env.PORT) || 3000,
  corsOrigin: process.env.CORS_ORIGIN || '*',
  adminSeedPassword: process.env.ADMIN_SEED_PASSWORD || 'change_me',
};

export default env;
