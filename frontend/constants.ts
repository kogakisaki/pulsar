import { FormatOption } from './types';

export const MOCK_VIDEO_FORMATS: FormatOption[] = [
  { id: 'bestvideo', label: 'Best Video', extension: 'mp4', size: '128.5 MB' },
  { id: '1080p', label: '1080p', extension: 'mp4', size: '85.2 MB' },
  { id: '720p', label: '720p', extension: 'mp4', size: '45.1 MB' },
  { id: '480p', label: '480p', extension: 'webm', size: '22.8 MB' },
];

export const MOCK_AUDIO_FORMATS: FormatOption[] = [
  { id: 'bestaudio', label: 'Best Audio', extension: 'm4a', size: '5.6 MB' },
  { id: 'mp3', label: 'MP3 (192kbps)', extension: 'mp3', size: '4.8 MB' },
  { id: 'opus', label: 'Opus (160kbps)', extension: 'opus', size: '3.9 MB' },
];

export const MOCK_OTHER_FORMATS: FormatOption[] = [
  { id: 'vtt', label: 'VTT Subtitle', extension: 'vtt', size: '15 KB' },
  { id: 'srt', label: 'SRT Subtitle', extension: 'srt', size: '14 KB' },
  { id: 'jpg_thumb', label: 'Thumbnail', extension: 'jpg', size: '98 KB' },
];