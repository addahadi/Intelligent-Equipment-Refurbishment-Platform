import { Router } from 'express';
import validate from '../middleware/validate.js';
import authenticate from '../middleware/authenticate.js';
import requireAdmin from '../middleware/requireAdmin.js';
import {
  listEtapesSchema, createEtapeSchema, updateEtapeSchema, reorderEtapeSchema,
} from '../schemas/etape.schema.js';
import { idParam } from '../schemas/common.schema.js';
import * as etapeController from '../controllers/etape.controller.js';

const router = Router();

// Nested under a composant: /composants/:id/etapes
router.get('/composants/:id/etapes', validate(listEtapesSchema), etapeController.list);
router.post(
  '/composants/:id/etapes',
  authenticate, requireAdmin, validate(createEtapeSchema), etapeController.create,
);

// Mutations addressed by étape id: /etapes/:id
router.patch('/etapes/:id', authenticate, requireAdmin, validate(updateEtapeSchema), etapeController.update);
router.delete('/etapes/:id', authenticate, requireAdmin, validate({ params: idParam }), etapeController.remove);
router.post('/etapes/:id/reorder', authenticate, requireAdmin, validate(reorderEtapeSchema), etapeController.reorder);

export default router;
