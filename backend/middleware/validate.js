import { ZodError } from 'zod';
import AppError from '../utils/AppError.js';

// validate({ body, query, params }) — runs the given Zod schemas and replaces
// req[part] with the parsed (coerced) value. Zod failures become 400s.
export default function validate(schemas) {
  return (req, _res, next) => {
    try {
      for (const part of ['body', 'query', 'params']) {
        if (schemas[part]) {
          req[part] = schemas[part].parse(req[part]);
        }
      }
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const details = err.issues.map((i) => ({
          path: i.path.join('.'),
          message: i.message,
        }));
        return next(AppError.badRequest('Données invalides.', details));
      }
      return next(err);
    }
  };
}
