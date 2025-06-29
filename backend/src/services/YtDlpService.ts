import { spawn, ChildProcess } from 'child_process';
import path from 'path'; // Import path module
import logger from '../utils/logger';
import { MediaInfo, FormatOption, DownloadOptions, DownloadItem, DownloadStatus } from '../types';
import { prisma } from '../utils/db';
import WebSocketManager from '../websockets/WebSocketManager'; // Import WebSocketManager

interface YtDlpFormat {
  format_id: string;
  ext: string;
  filesize?: number;
  url?: string;
  format_note?: string;
  video_ext?: string; // Added
  audio_ext?: string; // Added
  isDefault?: boolean; // Added
}

const activeDownloadProcesses = new Map<string, ChildProcess>();

class YtDlpService {
  private wsManager: WebSocketManager; // Declare wsManager property

  constructor(wsManager: WebSocketManager) {
    this.wsManager = wsManager;
  }

  private executeCommand(args: string[]): Promise<{ stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
      const process = spawn('yt-dlp', args);

      let stdout = '';
      let stderr = '';

      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve({ stdout, stderr });
        } else {
          logger.error({ code, stderr }, 'yt-dlp command failed');
          reject(new Error(`yt-dlp exited with code ${code}`));
        }
      });

      process.on('error', (err) => {
        logger.error(err, 'Failed to start yt-dlp process');
        reject(err);
      });
    });
  }

  private extractFormats(formats: YtDlpFormat[], type: 'video' | 'audio' | 'other'): FormatOption[] {
    return formats
      .filter(f => {
        if (type === 'video') {
          return f.video_ext && f.video_ext !== 'none';
        }
        if (type === 'audio') {
          return f.audio_ext && f.audio_ext !== 'none';
        }
        // For 'other' type, include formats where both video_ext and audio_ext are 'none' or undefined
        return (!f.video_ext || f.video_ext === 'none') && (!f.audio_ext || f.audio_ext === 'none');
      })
      .map(f => {
        let label = f.format_note || `${f.ext} (${f.format_id})`;
        if (f.format_id === 'download' && f.format_note === 'watermarked') {
          label = `Default (Watermarked) - ${f.ext}`;
        }
        return {
          id: f.format_id,
          label: label,
          extension: f.ext,
          size: f.filesize ? `${(f.filesize / (1024 * 1024)).toFixed(2)} MB` : undefined,
        };
      });
  }

  async getMediaInfo(url: string, cookiesPath?: string): Promise<MediaInfo> {
    if (!url) {
      throw new Error('URL is required to fetch media info.');
    }

    const args = ['--dump-json', url];
    if (cookiesPath) {
      args.unshift('--cookies', cookiesPath);
    }

    try {
      const { stdout } = await this.executeCommand(args);
      const data = JSON.parse(stdout);

      const mediaInfo: MediaInfo = {
        title: data.title || 'No Title',
        uploader: data.uploader || 'Unknown Uploader',
        duration: data.duration || 0,
        thumbnail: data.thumbnail || '',
        videoFormats: this.extractFormats(data.formats || [], 'video'),
        audioFormats: this.extractFormats(data.formats || [], 'audio'),
        otherFormats: [
          ...(data.ext && data.format_id ? [{
            id: data.format_id,
            label: `[DEFAULT] Default (${data.ext}) - ${data.resolution || data.format_note || ''}`.trim(),
            extension: data.ext,
            size: data.filesize ? `${(data.filesize / (1024 * 1024)).toFixed(2)} MB` : undefined,
          }] : []),
          ...this.extractFormats(data.formats || [], 'other'),
        ],
      };

      return mediaInfo;
    } catch (error) {
      logger.error({ url, error }, 'Failed to fetch media info');
      throw new Error(`Could not fetch media info for ${url}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async startDownload(options: DownloadOptions): Promise<DownloadItem> {
    const { url, format, title, thumbnail } = options;

    // 1. Create a new Download record in the database with PENDING status
    const newDownload = await prisma.download.create({
      data: {
        url,
        title,
        thumbnail,
        format: format.label, // Store the label for simplicity
        status: DownloadStatus.Pending,
        progress: 0,
        createdAt: new Date(),
      },
    });

    logger.info(`Starting download for ${title} (${url}) with ID: ${newDownload.id}`);

    // 2. Construct the yt-dlp command
    const args: string[] = [
      url,
      '-f', format.id,
      '-o', path.join(process.env.DOWNLOAD_DIRECTORY || './downloads', `${newDownload.id}.%(ext)s`),
      '--progress',
      '--progress-template', 'download:%(progress)s', // Custom progress template
      '--newline', // Ensure progress is on new lines
      '--no-warnings',
      '--no-playlist',
      '--restrict-filenames',
    ];

    // TODO: Add cookiesPath if available from settings

    // 3. Spawn the yt-dlp child process
    const childProcess = spawn('yt-dlp', args);
    activeDownloadProcesses.set(newDownload.id, childProcess);

    // Update status to Downloading
    await prisma.download.update({
      where: { id: newDownload.id },
      data: { status: DownloadStatus.Downloading },
    });

    // 4. Capture stdout for progress updates
    let accumulatedStdout = '';
    let accumulatedStderr = '';
    let finalFilePath: string | null = null;

    // 4. Capture stdout for progress updates and full output
    childProcess.stdout.on('data', async (data) => {
      const output = data.toString();
      accumulatedStdout += output; // Accumulate full stdout
      const progressMatch = output.match(/download:(\d+\.\d+)%/);
      if (progressMatch && progressMatch[1]) {
        const progress = parseFloat(progressMatch[1]);
        await prisma.download.update({
          where: { id: newDownload.id },
          data: { progress: Math.floor(progress) },
        });
        this.wsManager.broadcast({ type: 'download:progress', payload: { id: newDownload.id, progress } });
      }

      // Attempt to extract final file path from stdout
      const destinationMatch = output.match(/\[download\] Destination: (.+)/);
      if (destinationMatch && destinationMatch[1]) {
        finalFilePath = destinationMatch[1].trim();
      }
    });

    // 5. Capture stderr for logging errors and full output
    childProcess.stderr.on('data', (data) => {
      const output = data.toString();
      accumulatedStderr += output; // Accumulate full stderr
      logger.error(`yt-dlp stderr for ${newDownload.id}: ${output}`);
    });

    // 6. Handle process exit codes
    childProcess.on('close', async (code) => {
      activeDownloadProcesses.delete(newDownload.id); // Remove from active processes

      let filePathToSave: string | null = null;
      if (finalFilePath) {
        // Make the filePath relative to the DOWNLOAD_DIRECTORY
        const downloadDir = path.resolve(process.env.DOWNLOAD_DIRECTORY || './downloads');
        filePathToSave = path.relative(downloadDir, finalFilePath);
      }

      if (code === 0) {
        // Success
        await prisma.download.update({
          where: { id: newDownload.id },
          data: {
            status: DownloadStatus.Completed,
            progress: 100,
            filePath: filePathToSave,
          },
        });
        logger.info(`Download completed for ID: ${newDownload.id}. File: ${filePathToSave}`);
        this.wsManager.broadcast({ type: 'download:complete', payload: { id: newDownload.id } });
        this.wsManager.broadcast({ type: 'queue:updated', payload: {} }); // Notify queue update
      } else if (code === null) {
        // Process was killed (e.g., cancelled)
        await prisma.download.update({
          where: { id: newDownload.id },
          data: { status: DownloadStatus.Cancelled },
        });
        logger.warn(`Download cancelled for ID: ${newDownload.id}`);
        this.wsManager.broadcast({ type: 'download:cancelled', payload: { id: newDownload.id } });
        this.wsManager.broadcast({ type: 'queue:updated', payload: {} }); // Notify queue update
      }
      else {
        // Error
        const errorMessage = `yt-dlp exited with code ${code}. Error: ${accumulatedStderr || 'No stderr output.'}`;
        await prisma.download.update({
          where: { id: newDownload.id },
          data: {
            status: DownloadStatus.Error,
            errorMessage: errorMessage,
          },
        });
        logger.error(`Download failed for ID: ${newDownload.id}: ${errorMessage}`);
        this.wsManager.broadcast({ type: 'download:error', payload: { id: newDownload.id, error: errorMessage } });
        this.wsManager.broadcast({ type: 'queue:updated', payload: {} }); // Notify queue update
      }
    });

    childProcess.on('error', async (err) => {
      activeDownloadProcesses.delete(newDownload.id);
      const errorMessage = `Failed to spawn yt-dlp process: ${err.message}`;
      await prisma.download.update({
        where: { id: newDownload.id },
        data: {
          status: DownloadStatus.Error,
          errorMessage: errorMessage,
        },
      });
      logger.error(err, `Failed to start download process for ID: ${newDownload.id}`);
      this.wsManager.broadcast({ type: 'download:error', payload: { id: newDownload.id, error: errorMessage } });
      this.wsManager.broadcast({ type: 'queue:updated', payload: {} }); // Notify queue update
    });

    return {
      ...newDownload,
      format: options.format, // Return the full format object
      createdAt: newDownload.createdAt.getTime(), // Convert Date to number for consistency with frontend
    };
  }

  async cancelDownload(id: string): Promise<void> {
    const childProcess = activeDownloadProcesses.get(id);
    if (childProcess) {
      childProcess.kill('SIGKILL'); // Force kill the process
      activeDownloadProcesses.delete(id);
      await prisma.download.update({
        where: { id },
        data: { status: DownloadStatus.Cancelled, progress: 0 },
      });
      logger.info(`Download with ID ${id} cancelled.`);
      this.wsManager.broadcast({ type: 'queue:updated', payload: {} }); // Notify queue update
    } else {
      logger.warn(`Attempted to cancel download with ID ${id}, but no active process found.`);
    }
  }

  async getVersion(): Promise<string> {
    try {
      const { stdout } = await this.executeCommand(['--version']);
      return stdout.trim();
    } catch (error) {
      logger.error(error, 'Failed to get yt-dlp version');
      throw new Error(`Could not get yt-dlp version: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

// This will be initialized in index.ts after wsManager is available
export let ytDlpService: YtDlpService;

// Function to initialize the service with wsManager
export const initializeYtDlpService = (wsManager: WebSocketManager) => {
  ytDlpService = new YtDlpService(wsManager);
};