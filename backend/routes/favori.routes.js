    import { Router } from 'express';
import validate from '../middleware/validate.js';
import authenticate from '../middleware/authenticate.js';
import { favoriParamSchema, listFavorisSchema } from '../schemas/favori.schema.js';
import * as favoriController from '../controllers/favori.controller.js';

const router = Router();

router.use(authenticate);

router.get('/', validate(listFavorisSchema), favoriController.list);
router.put('/:composantId', validate(favoriParamSchema), favoriController.add);
router.delete('/:composantId', validate(favoriParamSchema), favoriController.remove);

export default router;
