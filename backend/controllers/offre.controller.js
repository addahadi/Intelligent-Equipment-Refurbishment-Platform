import asyncHandler from '../utils/asyncHandler.js';
import { resolveLang } from '../utils/lang.js';
import * as offreService from '../services/offre.service.js';

export const submit = asyncHandler(async (req, res) => {
  const offre = await offreService.submit(req.body, resolveLang(req));
  res.status(201).json(offre);
});

export const list = asyncHandler(async (req, res) => {
  const offres = await offreService.list(req.query, resolveLang(req));
  res.json(offres);
});

export const accepter = asyncHandler(async (req, res) => {
  const composant = await offreService.accepter(req.params.id, resolveLang(req));
  res.status(201).json(composant);
});

export const rejeter = asyncHandler(async (req, res) => {
  const offre = await offreService.rejeter(req.params.id, resolveLang(req));
  res.json(offre);
});
