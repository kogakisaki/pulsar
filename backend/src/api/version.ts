import { Router } from 'express';
import asyncHandler from '../utils/asyncHandler';
import { ytDlpService } from '../services/YtDlpService';
import logger from '../utils/logger';

const router = Router();

router.get('/', asyncHandler(async (req, res) => {
  try {
    const version = await ytDlpService.getVersion();
    res.json({ version });
  } catch (error) {
    logger.error(error, 'Error fetching yt-dlp version');
    res.status(500).json({ message: 'Failed to retrieve yt-dlp version.' });
  }
}));

export default router;