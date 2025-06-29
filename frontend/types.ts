export enum DownloadStatus {
  Pending = 'Pending',
  Downloading = 'Downloading',
  Paused = 'Paused',
  Completed = 'Completed',
  Error = 'Error',
  Cancelled = 'Cancelled'
}

export interface FormatOption {
  id: string;
  label: string;
  extension: string;
  size?: string;
}

export interface MediaInfo {
  title: string;
  uploader: string;
  duration: number; // in seconds
  thumbnail: string;
  videoFormats: FormatOption[];
  audioFormats: FormatOption[];
  otherFormats: FormatOption[];
}

export interface DownloadOptions {
  url: string;
  format: FormatOption;
  title: string;
  thumbnail: string;
}

export interface DownloadItem {
  id: string;
  url: string;
  title: string;
  thumbnail: string;
  status: DownloadStatus;
  progress: number; // 0-100
  format: FormatOption;
  error?: string;
  createdAt: number;
  filePath?: string | null; // Added filePath
}

export type MainTab = 'downloader' | 'history' | 'settings' | 'about';

export interface ArgumentTemplate {
  id: string;
  name: string;
  args: string;
}