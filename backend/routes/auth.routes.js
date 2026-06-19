import { Router } from 'express';
import validate from '../middleware/validate.js';
import authenticate from '../middleware/authenticate.js';
import { registerSchema, loginSchema } from '../schemas/auth.schema.js';
import * as authController from '../controllers/auth.controller.js';

const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.get('/me', authenticate, authController.me);

export default router;
