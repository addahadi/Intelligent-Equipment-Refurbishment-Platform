// Application-level error carrying an HTTP status and a machine-readable code.
// The central error handler turns this into the { error: { code, message, details } } envelope.
export default class AppError extends Error {
  constructor(code, status, message, details) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
    this.details = details;
  }

  static unauthenticated(message = 'Authentification requise.') {
    return new AppError('UNAUTHENTICATED', 401, message);
  }

  static forbidden(message = 'Accès refusé.') {
    return new AppError('FORBIDDEN', 403, message);
  }

  static notFound(message = 'Ressource introuvable.') {
    return new AppError('NOT_FOUND', 404, message);
  }

  // `code` lets callers raise a distinct conflict (e.g. COMPOSANT_VENDU) the
  // frontend can branch on, while defaulting to the generic CONFLICT.
  static conflict(message = 'Conflit de ressource.', code = 'CONFLICT') {
    return new AppError(code, 409, message);
  }

  static badRequest(message = 'Requête invalide.', details) {
    return new AppError('VALIDATION_ERROR', 400, message, details);
  }
}
