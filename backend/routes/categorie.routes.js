import { Router } from 'express';
import validate from '../middleware/validate.js';
import authenticate from '../middleware/authenticate.js';
import requireAdmin from '../middleware/requireAdmin.js';
import { createCategorieSchema, categorieIdSchema } from '../schemas/categorie.schema.js';
import * as categorieController from '../controllers/categorie.controller.js';

const router = Router();

router.get('/', categorieController.list);
router.post('/', authenticate, requireAdmin, validate(createCategorieSchema), categorieController.create);
router.delete('/:id', authenticate, requireAdmin, validate(categorieIdSchema), categorieController.remove);

export default router;
