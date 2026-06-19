import AppError from '../utils/AppError.js';

// Catches any request that matched no route.
export default function notFound(req, _res, next) {
  next(AppError.notFound(`Route introuvable : ${req.method} ${req.originalUrl}`));
}
