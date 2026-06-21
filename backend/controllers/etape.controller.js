import asyncHandler from '../utils/asyncHandler.js';
import { resolveLang } from '../utils/lang.js';
import * as etapeService from '../services/etape.service.js';

export const list = asyncHandler(async (req, res) => {
  const etapes = await etapeService.list(req.params.id, resolveLang(req));
  res.json(etapes);
});

export const create = asyncHandler(async (req, res) => {
  const { override, motif } = req.body;
  const etape = await etapeService.create(
    req.params.id, req.body, resolveLang(req),
    { override, motif, profilId: req.user.id },
  );
  res.status(201).json(etape);
});

export const update = asyncHandler(async (req, res) => {
  const { override, motif } = req.body;
  const etape = await etapeService.update(
    req.params.id, req.body, resolveLang(req),
    { override, motif, profilId: req.user.id },
  );
  res.json(etape);
});

export const remove = asyncHandler(async (req, res) => {
  const { override, motif } = req.body || {};
  await etapeService.remove(req.params.id, { override, motif, profilId: req.user.id });
  res.status(204).end();
});

export const reorder = asyncHandler(async (req, res) => {
  const { override, motif } = req.body;
  const etapes = await etapeService.reorder(
    req.params.id, req.body.direction, resolveLang(req),
    { override, motif, profilId: req.user.id },
  );
  res.json(etapes);
});
