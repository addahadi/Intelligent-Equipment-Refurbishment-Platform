import { z } from 'zod';
import { langQuery } from './common.schema.js';

export const favoriParamSchema = {
  params: z.object({ composantId: z.coerce.number().int().positive() }),
};

export const listFavorisSchema = { query: langQuery };
