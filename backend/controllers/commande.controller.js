import asyncHandler from '../utils/asyncHandler.js';
import * as commandeService from '../services/commande.service.js';

export const list = asyncHandler(async (req, res) => {
  const commandes = await commandeService.list(req.user);
  res.json(commandes);
});
