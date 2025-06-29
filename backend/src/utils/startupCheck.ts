import { exec } from 'child_process';
import logger from './logger';

const checkCommand = (command: string, versionArg: string = '--version'): Promise<void> => {
  return new Promise((resolve, reject) => {
    exec(`${command} ${versionArg}`, (error, stdout, stderr) => {
      if (error) {
        logger.error(`'${command}' not found. Please install it and ensure it's in your system's PATH.`);
        return reject(new Error(`'${command}' is not available.`));
      }
      logger.info(`'${command}' found: ${stdout.trim().split('\n')[0]}`); // Take only the first line for ffmpeg
      resolve();
    });
  });
};

export const runStartupChecks = async () => {
  logger.info('Running startup dependency checks...');
  try {
    await checkCommand('yt-dlp');
    await checkCommand('ffmpeg', '-version'); // Use -version for ffmpeg
    logger.info('All required command-line tools are available.');
  } catch (error) {
    logger.error('A required dependency is missing. The application may not function correctly.');
    // In a real application, you might want to exit the process
    // process.exit(1);
  }
};