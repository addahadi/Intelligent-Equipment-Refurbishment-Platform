import { Router } from 'express';
import validate from '../middleware/validate.js';
import authenticate from '../middleware/authenticate.js';
import requireAdmin from '../middleware/requireAdmin.js';
import {
  listComposantsSchema, composantIdSchema, createComposantSchema,
  updateComposantSchema, declarePiecesSchema,
} from '../schemas/composant.schema.js';
import * as composantController from '../controllers/composant.controller.js';

const router = Router();

router.get('/', validate(listComposantsSchema), composantController.list);
router.get('/:id', validate(composantIdSchema), composantController.getById);

router.post('/', authenticate, requireAdmin, /* validate(createComposantSchema), */ composantController.create);
router.patch('/:id', authenticate, requireAdmin, composantController.update);

router.post('/:id/acheter', authenticate, validate(composantIdSchema), composantController.acheter);
router.post('/:id/pieces', authenticate, requireAdmin, validate(declarePiecesSchema), composantController.declarePieces);

export default router;
