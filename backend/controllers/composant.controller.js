import asyncHandler from '../utils/asyncHandler.js';
import { resolveLang } from '../utils/lang.js';
import * as composantService from '../services/composant.service.js';

export const list = asyncHandler(async (req, res) => {
  const items = await composantService.list(req.query, resolveLang(req));
  res.json(items);
});

export const getById = asyncHandler(async (req, res) => {
  const item = await composantService.getById(req.params.id, resolveLang(req));
  res.json(item);
});

export const create = asyncHandler(async (req, res) => {
  const item = await composantService.create(req.body, resolveLang(req));
  res.status(201).json(item);
});

export const update = asyncHandler(async (req, res) => {
  const { override, motif } = req.body;
  const item = await composantService.update(
    req.params.id, req.body, resolveLang(req),
    { override, motif, profilId: req.user.id },
  );
  res.json(item);
});

export const acheter = asyncHandler(async (req, res) => {
  const commande = await composantService.acheter(req.params.id, req.user.id);
  res.status(201).json(commande);
});

export const declarePieces = asyncHandler(async (req, res) => {
  const created = await composantService.declarePieces(req.params.id, req.body.pieces, resolveLang(req));
  res.status(201).json(created);
});
