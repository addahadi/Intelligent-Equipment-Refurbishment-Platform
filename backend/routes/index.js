import { Router } from 'express';

import authRoutes from './auth.routes.js';
import categorieRoutes from './categorie.routes.js';
import composantRoutes from './composant.routes.js';
import etapeRoutes from './etape.routes.js';
import offreRoutes from './offre.routes.js';
import favoriRoutes from './favori.routes.js';
import commandeRoutes from './commande.routes.js';
import uploadRoutes from './upload.routes.js';
import statsRoutes from './stats.routes.js';

const router = Router();

router.get('/health', (_req, res) => res.json({ status: 'ok' }));

router.use('/auth', authRoutes);
router.use('/categories', categorieRoutes);
router.use('/composants', composantRoutes);
// étape routes mounted at root: /composants/:id/etapes (read/create) + /etapes/:id (mutate)
router.use('/', etapeRoutes);
router.use('/offres', offreRoutes);
router.use('/favoris', favoriRoutes);
router.use('/commandes', commandeRoutes);
router.use('/uploads', uploadRoutes);
router.use('/stats', statsRoutes);

export default router;
