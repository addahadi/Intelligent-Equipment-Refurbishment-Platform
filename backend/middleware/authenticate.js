import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import AppError from '../utils/AppError.js';

// Verifies the Bearer token and attaches { id, role } to req.user.
export default function authenticate(req, _res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(AppError.unauthenticated());
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.user = { id: Number(payload.id), role: payload.role };
    return next();
  } catch {
    return next(AppError.unauthenticated('Jeton invalide ou expiré.'));
  }
}
