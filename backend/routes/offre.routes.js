import { Router } from 'express';
import validate from '../middleware/validate.js';
import authenticate from '../middleware/authenticate.js';
import requireAdmin from '../middleware/requireAdmin.js';
import { submitOffreSchema, listOffresSchema, offreIdSchema, accepterOffreSchema } from '../schemas/offre.schema.js';
import * as offreController from '../controllers/offre.controller.js';

const router = Router();

// Public submission (FR-17).
router.post('/', validate(submitOffreSchema), offreController.submit);

// Admin review.
router.get('/', authenticate, requireAdmin, validate(listOffresSchema), offreController.list);
router.post('/:id/accepter', authenticate, requireAdmin, validate(accepterOffreSchema), offreController.accepter);
router.post('/:id/rejeter', authenticate, requireAdmin, validate(offreIdSchema), offreController.rejeter);

export default router;
