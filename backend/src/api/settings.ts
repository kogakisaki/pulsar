import { Router } from 'express';
import asyncHandler from '../utils/asyncHandler';
import { prisma } from '../utils/db';
import logger from '../utils/logger';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises'; // Use promises version of fs

const router = Router();

// Templates
router.get('/templates', asyncHandler(async (req, res) => {
  const templates = await prisma.argumentTemplate.findMany();
  res.json(templates);
}));

router.post('/templates', asyncHandler(async (req, res) => {
  const { name, args } = req.body;
  if (!name || !args) {
    return res.status(400).json({ message: 'Name and args are required for a template.' });
  }
  const newTemplate = await prisma.argumentTemplate.create({
    data: { name, args },
  });
  logger.info(`Created new template: ${name}`);
  res.status(201).json(newTemplate);
}));

router.put('/templates/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, args } = req.body;
  if (!name || !args) {
    return res.status(400).json({ message: 'Name and args are required for a template update.' });
  }
  const updatedTemplate = await prisma.argumentTemplate.update({
    where: { id },
    data: { name, args },
  });
  logger.info(`Updated template: ${name} (ID: ${id})`);
  res.json(updatedTemplate);
}));

router.delete('/templates/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  await prisma.argumentTemplate.delete({
    where: { id },
  });
  logger.info(`Deleted template with ID: ${id}`);
  res.status(204).send(); // No content
}));

// Cookies
const upload = multer({ dest: 'uploads/' }); // Temporary upload directory

// Cookies
router.post('/cookies', upload.single('cookieFile'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  const cookieFilePath = path.resolve(process.env.COOKIE_FILE_PATH || './cookies.txt');

  try {
    // Ensure the directory exists
    await fs.mkdir(path.dirname(cookieFilePath), { recursive: true });
    // Move the uploaded file to the designated path
    await fs.rename(req.file.path, cookieFilePath);

    // Store the file path in the Settings table
    await prisma.setting.upsert({
      where: { key: 'cookieFilePath' },
      update: { value: cookieFilePath },
      create: { key: 'cookieFilePath', value: cookieFilePath },
    });

    logger.info(`Cookies file uploaded and saved to ${cookieFilePath}`);
    res.status(200).json({ message: 'Cookies file uploaded successfully.' });
  } catch (error) {
    logger.error(error, 'Failed to upload cookies file');
    res.status(500).json({ message: 'Failed to upload cookies file.' });
  }
}));

router.delete('/cookies', asyncHandler(async (req, res) => {
  const cookieFilePath = process.env.COOKIE_FILE_PATH || './cookies.txt';

  try {
    // Delete the cookie file
    await fs.unlink(cookieFilePath);

    // Clear the setting from the database
    await prisma.setting.delete({
      where: { key: 'cookieFilePath' },
    });

    logger.info(`Cookies file deleted from ${cookieFilePath}`);
    res.status(200).json({ message: 'Cookies file cleared successfully.' });
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      // File not found, so it's already "cleared"
      logger.warn(`Attempted to delete non-existent cookie file: ${cookieFilePath}`);
      return res.status(200).json({ message: 'Cookies file already cleared.' });
    }
    logger.error(error, 'Failed to delete cookies file');
    res.status(500).json({ message: 'Failed to clear cookies file.' });
  }
}));

router.get('/cookies', asyncHandler(async (req, res) => {
  try {
    const cookieSetting = await prisma.setting.findUnique({
      where: { key: 'cookieFilePath' },
    });

    const hasCookies = !!cookieSetting && await fs.access(cookieSetting.value).then(() => true).catch(() => false);

    res.status(200).json({ hasCookies });
  } catch (error) {
    logger.error(error, 'Failed to get cookie info');
    res.status(500).json({ message: 'Failed to get cookie info.' });
  }
}));

export default router;