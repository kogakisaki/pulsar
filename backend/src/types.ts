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
  thumbnail: string | null;
  status: string;
  progress: number; // 0-100
  format: FormatOption;
  error?: string;
  createdAt: number;
}