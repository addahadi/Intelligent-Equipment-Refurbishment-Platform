import asyncHandler from '../utils/asyncHandler.js';
import * as statsService from '../services/stats.service.js';

export const dashboard = asyncHandler(async (_req, res) => {
  const stats = await statsService.dashboard();
  res.json(stats);
});
