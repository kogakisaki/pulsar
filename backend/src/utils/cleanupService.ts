import cron from 'node-cron';
import { prisma } from '../utils/db';
import logger from './logger';
import fs from 'fs/promises';
import path from 'path';
import { DownloadStatus } from '../types';

const FILE_RETENTION_HOURS = parseInt(process.env.FILE_RETENTION_HOURS || '5', 10); // Default to 5 hours

const cleanupDownloads = async () => {
  logger.info('Starting scheduled cleanup of old downloads...');
  const cutoffDate = new Date();
  cutoffDate.setHours(cutoffDate.getHours() - FILE_RETENTION_HOURS);

  try {
    const oldDownloads = await prisma.download.findMany({
      where: {
        status: DownloadStatus.Completed,
        createdAt: {
          lt: cutoffDate,
        },
        filePath: {
          not: null, // Only consider downloads that have a file path
        },
      },
    });

    if (oldDownloads.length === 0) {
      logger.info('No old completed downloads found for cleanup.');
      return;
    }

    for (const download of oldDownloads) {
      if (download.filePath) {
        const absolutePath = path.resolve(process.env.DOWNLOAD_DIRECTORY || './downloads', download.filePath);
        try {
          await fs.unlink(absolutePath);
          logger.info(`Deleted file: ${absolutePath}`);
        } catch (error: any) {
          if (error.code === 'ENOENT') {
            logger.warn(`File not found during cleanup, skipping: ${absolutePath}`);
          } else {
            logger.error(error, `Failed to delete file ${absolutePath} for download ${download.id}`);
          }
        }
      }
      // Delete the record from the database regardless of file deletion success
      await prisma.download.delete({ where: { id: download.id } });
      logger.info(`Deleted database record for old download: ${download.id}`);
    }
    logger.info(`Finished scheduled cleanup. Cleaned up ${oldDownloads.length} downloads.`);
  } catch (error) {
    logger.error(error, 'Error during scheduled cleanup of old downloads.');
  }
};

export const startCleanupJob = () => {
  // Schedule to run every hour
  cron.schedule('0 * * * *', cleanupDownloads, {
    timezone: "Asia/Ho_Chi_Minh" // Or your desired timezone
  });
  logger.info(`Cleanup job scheduled to run every hour. Files older than ${FILE_RETENTION_HOURS} hours will be removed.`);
};