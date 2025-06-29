import { Router } from 'express';
import asyncHandler from '../utils/asyncHandler';
import { prisma } from '../utils/db';
import { DownloadStatus } from '../types';
import path from 'path';
import fs from 'fs';
import logger from '../utils/logger';
import { wsManager } from '../index'; // Import wsManager

const router = Router();

// GET /api/files/:id - Serve a downloaded file
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const download = await prisma.download.findUnique({
    where: { id },
  });

  if (!download) {
    logger.warn(`File download request for non-existent ID: ${id}`);
    return res.status(404).json({ message: 'Download record not found.' });
  }

  if (download.status !== DownloadStatus.Completed || !download.filePath) {
    logger.warn(`File download request for incomplete or missing file for ID: ${id}, Status: ${download.status}`);
    return res.status(400).json({ message: 'File not available for download or download not completed.' });
  }

  const downloadDir = process.env.DOWNLOAD_DIRECTORY || './downloads';
  const absoluteFilePath = path.join(downloadDir, download.filePath);

  // Check if file exists
  if (!fs.existsSync(absoluteFilePath)) {
    logger.error(`File not found on disk for ID: ${id}, Path: ${absoluteFilePath}`);
    return res.status(404).json({ message: 'File not found on server.' });
  }

  // Set content disposition to attachment to force download
  res.download(absoluteFilePath, download.title + path.extname(absoluteFilePath), (err) => {
    if (err) {
      logger.error(`Error serving file ${absoluteFilePath}: ${err.message}`);
      // Handle error, but don't send headers if they've already been sent
      if (!res.headersSent) {
        res.status(500).json({ message: 'Error serving file.' });
      }
    } else {
      logger.info(`Successfully served file for ID: ${id}, Path: ${absoluteFilePath}`);
    }
  });
}));

// DELETE /api/files/:id - Delete a downloaded file and its record
router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const download = await prisma.download.findUnique({
    where: { id },
  });

  if (!download) {
    logger.warn(`File deletion request for non-existent ID: ${id}`);
    return res.status(404).json({ message: 'Download record not found.' });
  }

  if (download.filePath) {
    const downloadDir = process.env.DOWNLOAD_DIRECTORY || './downloads';
    const absoluteFilePath = path.join(downloadDir, download.filePath);

    try {
      if (fs.existsSync(absoluteFilePath)) {
        fs.unlinkSync(absoluteFilePath);
        logger.info(`Successfully deleted file: ${absoluteFilePath}`);
      } else {
        logger.warn(`File not found on disk for ID: ${id}, Path: ${absoluteFilePath}. Deleting record only.`);
      }
    } catch (error) {
      logger.error(error, `Failed to delete file: ${absoluteFilePath}`);
      // Continue to delete record even if file deletion fails
    }
  }

  await prisma.download.delete({
    where: { id },
  });

  logger.info(`Deleted database record for ID: ${id}`);
  // Notify frontend to update queue/history
  // Using queue:updated as it triggers a full re-fetch of downloads
  wsManager.broadcast({ type: 'queue:updated', payload: {} });
  res.status(200).json({ message: `File and record for ID ${id} deleted successfully.` });
}));

export default router;