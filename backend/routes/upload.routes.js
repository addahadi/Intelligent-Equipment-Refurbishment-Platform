import { Router } from 'express';
import multer from 'multer';
import AppError from '../utils/AppError.js';
import * as uploadController from '../controllers/upload.controller.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 5 }, // 5MB each, max 5 files
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) return cb(null, true);
    return cb(AppError.badRequest('Seules les images sont autorisées.'));
  },
});

const router = Router();

// Public: the offer-submission form (FR-17) is anonymous, so image upload must
// be reachable without a token. Abuse is bounded by multer (images only,
// 5 MB x 5 files).
router.post('/', upload.array('files', 5), uploadController.upload);

export default router;
