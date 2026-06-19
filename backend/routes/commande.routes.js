import { Router } from 'express';
import authenticate from '../middleware/authenticate.js';
import * as commandeController from '../controllers/commande.controller.js';

const router = Router();

router.get('/', authenticate, commandeController.list);

export default router;
