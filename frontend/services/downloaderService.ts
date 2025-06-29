import { DownloadItem, DownloadOptions, MediaInfo } from '../types';

const API_BASE_URL = '/api'; // Assuming backend serves frontend and API on the same port

export const downloaderService = {
  fetchMediaInfo: async (url: string): Promise<MediaInfo> => {
    const response = await fetch(`${API_BASE_URL}/info`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch media info');
    }

    return response.json();
  },

  startDownload: async (options: DownloadOptions): Promise<DownloadItem> => {
    const response = await fetch(`${API_BASE_URL}/downloads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to start download');
    }

    return response.json();
  },

  // pauseDownload and resumeDownload are not directly supported by the current backend
  // They would require additional API endpoints and logic on the backend.
  // For now, we'll remove them from the frontend service.

  cancelDownload: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/downloads/${id}/cancel`, {
      method: 'POST',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to cancel download');
    }
  },

  getDlpVersion: async (): Promise<string> => {
    const response = await fetch(`${API_BASE_URL}/version`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get yt-dlp version');
    }

    const data = await response.json();
    return data.version;
  },

  fetchAllDownloads: async (): Promise<DownloadItem[]> => {
    const response = await fetch(`${API_BASE_URL}/downloads`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch all downloads');
    }

    return response.json();
  },

  clearHistory: async (): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/history`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to clear history');
    }
  },

  deleteFile: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/files/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to delete file for ID: ${id}`);
    }
  },
};