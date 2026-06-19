import asyncHandler from '../utils/asyncHandler.js';
import { resolveLang } from '../utils/lang.js';
import * as favoriService from '../services/favori.service.js';

export const list = asyncHandler(async (req, res) => {
  const favoris = await favoriService.list(req.user.id, resolveLang(req));
  res.json(favoris);
});

export const add = asyncHandler(async (req, res) => {
  await favoriService.add(req.user.id, req.params.composantId);
  res.status(204).end();
});

export const remove = asyncHandler(async (req, res) => {
  await favoriService.remove(req.user.id, req.params.composantId);
  res.status(204).end();
});
