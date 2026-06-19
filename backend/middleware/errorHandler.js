import AppError from '../utils/AppError.js';

// Central error handler — the LAST middleware. Translates AppError and known
// Postgres error codes into the { error: { code, message, details? } } envelope.
// eslint-disable-next-line no-unused-vars
export default function errorHandler(err, _req, res, _next) {
  // Already a structured application error.
  if (err instanceof AppError) {
    return res.status(err.status).json({
      error: { code: err.code, message: err.message, details: err.details },
    });
  }

  // Multer upload errors (file too large, too many files, etc.).
  if (err.name === 'MulterError') {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: `Téléversement refusé : ${err.message}` },
    });
  }

  // Postgres errors (porsager 'postgres' driver exposes SQLSTATE on err.code).
  switch (err.code) {
    case 'P0001': // raise exception — e.g. acheter_composant 'Cet article vient d'être vendu'
      return res.status(409).json({
        error: { code: 'CONFLICT', message: err.message || 'Opération impossible.' },
      });
    case '23505': // unique_violation (duplicate reference, double favori, double sale)
      return res.status(409).json({
        error: { code: 'CONFLICT', message: 'Cette ressource existe déjà.' },
      });
    case '23503': // foreign_key_violation
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Référence liée invalide.' },
      });
    case '23502': // not_null_violation
    case '23514': // check_violation
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Contrainte de données non respectée.' },
      });
    default:
      break;
  }

  console.error('Unhandled error:', err);
  return res.status(500).json({
    error: { code: 'INTERNAL', message: 'Erreur interne du serveur.' },
  });
}
