import asyncHandler from '../utils/asyncHandler.js';
import { resolveLang } from '../utils/lang.js';
import * as etapeService from '../services/etape.service.js';

export const list = asyncHandler(async (req, res) => {
  const etapes = await etapeService.list(req.params.id, resolveLang(req));
  res.json(etapes);
});

export const create = asyncHandler(async (req, res) => {
  const etape = await etapeService.create(req.params.id, req.body, resolveLang(req));
  res.status(201).json(etape);
});

export const update = asyncHandler(async (req, res) => {
  const etape = await etapeService.update(req.params.id, req.body, resolveLang(req));
  res.json(etape);
});

export const remove = asyncHandler(async (req, res) => {
  await etapeService.remove(req.params.id);
  res.status(204).end();
});

export const reorder = asyncHandler(async (req, res) => {
  const etapes = await etapeService.reorder(req.params.id, req.body.direction, resolveLang(req));
  res.json(etapes);
});
