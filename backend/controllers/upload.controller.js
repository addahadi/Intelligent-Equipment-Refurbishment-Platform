import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import * as uploadService from '../services/upload.service.js';

export const upload = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    throw AppError.badRequest('Aucun fichier fourni.');
  }
  const folder = req.body.folder || 'reconditionnement/misc';
  const urls = await uploadService.uploadMany(req.files, folder);
  res.status(201).json({ urls });
});
