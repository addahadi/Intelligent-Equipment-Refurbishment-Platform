import asyncHandler from '../utils/asyncHandler.js';
import { resolveLang } from '../utils/lang.js';
import * as categorieService from '../services/categorie.service.js';

export const list = asyncHandler(async (req, res) => {
  const categories = await categorieService.list(resolveLang(req));
  res.json(categories);
});

export const create = asyncHandler(async (req, res) => {
  const categorie = await categorieService.create(req.body, resolveLang(req));
  res.status(201).json(categorie);
});

export const remove = asyncHandler(async (req, res) => {
  await categorieService.remove(req.params.id);
  res.status(204).end();
});
