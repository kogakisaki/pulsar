import { Router } from 'express';
import { ytDlpService } from '../services/YtDlpService';
import logger from '../utils/logger';
import asyncHandler from '../utils/asyncHandler';
import { prisma } from '../utils/db';
import { DownloadStatus } from '../types';
import { wsManager } from '../index'; // Import wsManager

const router = Router();

// POST /api/downloads - Start a new download
router.post('/', asyncHandler(async (req, res) => {
  const { url, format, title, thumbnail } = req.body;
  if (!url || !format || !title || !thumbnail) {
    return res.status(400).json({ message: 'Missing required download options.' });
  }

  const downloadItem = await ytDlpService.startDownload({ url, format, title, thumbnail });
  res.status(201).json(downloadItem);
  wsManager.broadcast({ type: 'queue:updated', payload: {} }); // Notify frontend
}));

// GET /api/downloads - Fetch all downloads
router.get('/', asyncHandler(async (req, res) => {
  const downloads = await prisma.download.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Convert Prisma's Download model to DownloadItem interface
  const formattedDownloads = downloads.map((d: typeof downloads[number]) => ({
    id: d.id,
    url: d.url,
    title: d.title,
    thumbnail: d.thumbnail,
    status: d.status, // Status is already string
    progress: d.progress,
    format: { id: '', label: d.format, extension: '' }, // Reconstruct FormatOption
    error: d.errorMessage || undefined,
    createdAt: d.createdAt.getTime(),
    filePath: d.filePath || undefined, // Add filePath
  }));

  res.json(formattedDownloads);
}));

// POST /api/downloads/:id/cancel - Cancel a download
router.post('/:id/cancel', asyncHandler(async (req, res) => {
  const { id } = req.params;
  await ytDlpService.cancelDownload(id);
  res.status(200).json({ message: `Download ${id} cancelled.` });
  wsManager.broadcast({ type: 'queue:updated', payload: {} }); // Notify frontend
}));

export default router;