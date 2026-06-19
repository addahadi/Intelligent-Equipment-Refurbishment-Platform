import { Router } from 'express';
import authenticate from '../middleware/authenticate.js';
import requireAdmin from '../middleware/requireAdmin.js';
import * as statsController from '../controllers/stats.controller.js';

const router = Router();

router.get('/', authenticate, requireAdmin, statsController.dashboard);

export default router;
