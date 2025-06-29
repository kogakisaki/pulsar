import { Router } from 'express';
import asyncHandler from '../utils/asyncHandler';
import { prisma } from '../utils/db';
import { DownloadStatus } from '../types';
import logger from '../utils/logger';
import { wsManager } from '../index';

const router = Router();

// DELETE /api/history - Deletes all completed, errored, and cancelled items from the Downloads table.
router.delete('/', asyncHandler(async (req, res) => {
  const result = await prisma.download.deleteMany({
    where: {
      status: {
        in: [DownloadStatus.Completed, DownloadStatus.Error, DownloadStatus.Cancelled],
      },
    },
  });
  logger.info(`Cleared ${result.count} history items.`);
  res.status(200).json({ message: `Cleared ${result.count} history items.` });
  wsManager.broadcast({ type: 'history:updated', payload: {} });
}));

export default router;