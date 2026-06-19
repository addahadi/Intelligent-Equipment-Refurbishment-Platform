import AppError from '../utils/AppError.js';

// Must run after authenticate. Gates admin-only routes.
export default function requireAdmin(req, _res, next) {
  if (!req.user) return next(AppError.unauthenticated());
  if (req.user.role !== 'ADMINISTRATEUR') return next(AppError.forbidden());
  return next();
}
