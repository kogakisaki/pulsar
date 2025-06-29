import { Router } from 'express';
import { ytDlpService } from '../services/YtDlpService';
import logger from '../utils/logger';
import asyncHandler from '../utils/asyncHandler';

const router = Router();

router.post('/', asyncHandler(async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ message: 'URL is required.' });
  }

  const mediaInfo = await ytDlpService.getMediaInfo(url);
  res.json(mediaInfo);
}));

export default router;