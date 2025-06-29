import React, { useCallback } from 'react';
import { downloaderService } from '../services/downloaderService';
import { FormatOption, MediaInfo } from '../types';
import { LinkIcon, LoaderIcon, AlertTriangleIcon, UserIcon, ClockIcon, VideoIcon, AudioIcon, FileIcon } from './icons/Icons';

interface DownloadFormProps {
  onAddDownload: (url: string, format: FormatOption, title: string, thumbnail: string) => void;
  url: string;
  setUrl: React.Dispatch<React.SetStateAction<string>>;
  isFetching: boolean;
  setIsFetching: React.Dispatch<React.SetStateAction<boolean>>;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  mediaInfo: MediaInfo | null;
  setMediaInfo: React.Dispatch<React.SetStateAction<MediaInfo | null>>;
  selectedFormatId: string;
  setSelectedFormatId: React.Dispatch<React.SetStateAction<string>>;
}

const FormatButton: React.FC<{
  format: FormatOption;
  selectedFormatId: string;
  onSelect: (id: string) => void;
}> = ({ format, selectedFormatId, onSelect }) => {
  const isSelected = selectedFormatId === format.id;
  const isDefaultFormat = format.label.startsWith('[DEFAULT]'); // Check for the prefix
  const displayLabel = isDefaultFormat ? format.label.replace('[DEFAULT] ', '') : format.label; // Remove prefix for display

  return (
    <button
      type="button"
      onClick={() => onSelect(format.id)}
      className={`p-3 border rounded-lg text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-dark-card focus-visible:ring-light-blue ${
        isSelected
          ? 'border-light-blue bg-light-blue/20 dark:border-light-blue dark:bg-light-blue/10 ring-1 ring-light-blue'
          : isDefaultFormat
            ? 'border-green-500 bg-green-50 dark:bg-green-900/20 hover:border-green-600 dark:hover:border-green-400' // Custom style for default
            : 'border-medium-blue/30 bg-cream dark:bg-dark-bg hover:border-light-blue dark:hover:border-light-blue'
      }`}
      aria-pressed={isSelected}
    >
      <div className="font-semibold text-dark-blue dark:text-dark-text text-sm truncate">{displayLabel}</div>
      <div className="flex justify-between items-baseline text-xs text-medium-blue dark:text-slate-400 mt-2">
        <span className="px-1.5 py-0.5 bg-medium-blue/10 dark:bg-slate-700 rounded text-medium-blue dark:text-slate-300 font-mono uppercase">{format.extension}</span>
        {format.size && <span className="font-medium">{format.size}</span>}
      </div>
    </button>
  );
};


const DownloadForm: React.FC<DownloadFormProps> = ({
  onAddDownload,
  url,
  setUrl,
  isFetching,
  setIsFetching,
  error,
  setError,
  mediaInfo,
  setMediaInfo,
  selectedFormatId,
  setSelectedFormatId,
}) => {
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    if (mediaInfo || error) {
      setMediaInfo(null);
      setError(null);
      setSelectedFormatId('');
    }
  };
  
  const handleFetchInfo = useCallback(async () => {
    if (!url) {
      setError('Please enter a URL first.');
      return;
    }
    setIsFetching(true);
    setError(null);
    setMediaInfo(null);

    try {
      const info = await downloaderService.fetchMediaInfo(url);
      setMediaInfo(info);
      setSelectedFormatId(info.videoFormats[0]?.id || info.audioFormats[0]?.id || info.otherFormats[0]?.id || '');
    } catch (err: any) {
      setError(err.message || 'Failed to fetch media information.');
      console.error(err);
    } finally {
      setIsFetching(false);
    }
  }, [url]);

  const handleAddToQueue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !selectedFormatId || !mediaInfo) {
      setError('Could not add to queue. Please fetch info and select a format.');
      return;
    }
    const allFormats = [...mediaInfo.videoFormats, ...mediaInfo.audioFormats, ...mediaInfo.otherFormats];
    const selectedFormat = allFormats.find(f => f.id === selectedFormatId);

    if (selectedFormat) {
      onAddDownload(url, selectedFormat, mediaInfo.title, mediaInfo.thumbnail);
      setUrl('');
      setMediaInfo(null);
      setError(null);
      setSelectedFormatId('');
    } else {
        setError('Selected format is invalid. Please try again.');
    }
  };

  const formatDuration = (seconds: number): string => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const parts: string[] = [];
    if (h > 0) parts.push(h.toString().padStart(2, '0'));
    parts.push(m.toString().padStart(2, '0'));
    parts.push(s.toString().padStart(2, '0'));
    return parts.join(':');
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="url-input" className="block text-sm font-medium text-dark-blue dark:text-slate-300 mb-1">
          Video/Playlist URL
        </label>
        <div className="flex space-x-2">
          <div className="relative flex-grow">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <LinkIcon className="h-5 w-5 text-medium-blue dark:text-slate-400" />
            </div>
            <input
              id="url-input"
              type="text"
              value={url}
              onChange={handleUrlChange}
              placeholder="Enter video or playlist URL from any supported site..."
              className="w-full pl-10 p-2 border border-medium-blue/50 rounded-md bg-cream dark:bg-dark-bg focus:outline-none focus:border-dark-blue dark:focus:border-light-blue transition"
              disabled={isFetching}
            />
          </div>
          <button
            type="button"
            onClick={handleFetchInfo}
            disabled={isFetching || !url}
            className="flex-shrink-0 px-4 py-2 border border-transparent rounded-md text-sm font-semibold bg-light-blue text-dark-blue dark:bg-light-blue dark:text-dark-bg hover:bg-medium-blue hover:text-cream dark:hover:text-dark-text disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isFetching ? <LoaderIcon className="w-5 h-5 animate-spin" /> : 'Fetch Info'}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 dark:text-red-300 dark:bg-red-900/50 rounded-md animate-fade-in">
          <AlertTriangleIcon className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {mediaInfo && (
        <form onSubmit={handleAddToQueue} className="space-y-4 animate-fade-in pt-4 border-t border-medium-blue/30 dark:border-slate-700">
          <div className="flex flex-col md:flex-row gap-4">
            <img src={mediaInfo.thumbnail} alt="thumbnail" className="w-full md:w-48 h-auto object-cover rounded-md flex-shrink-0" />
            <div className="flex-grow">
              <h3 className="font-bold text-lg text-dark-blue dark:text-dark-text">{mediaInfo.title}</h3>
              <div className="flex items-center gap-2 text-sm text-medium-blue dark:text-slate-400 mt-1">
                <UserIcon className="w-4 h-4" />
                <span>{mediaInfo.uploader}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-medium-blue dark:text-slate-400 mt-1">
                <ClockIcon className="w-4 h-4" />
                <span>{formatDuration(mediaInfo.duration)}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4 pt-2">
            {/* Default Format */}
            {mediaInfo.otherFormats.some(f => f.label.startsWith('[DEFAULT]')) && (
              <div>
                <h4 className="flex items-center gap-2 text-base font-semibold text-dark-blue dark:text-dark-text mb-2">
                  <FileIcon className="w-5 h-5" />
                  Default Format
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  {mediaInfo.otherFormats.filter(f => f.label.startsWith('[DEFAULT]')).map(f => (
                    <FormatButton key={f.id} format={f} selectedFormatId={selectedFormatId} onSelect={setSelectedFormatId} />
                  ))}
                </div>
              </div>
            )}

            {/* Video Formats */}
            <div>
              <h4 className="flex items-center gap-2 text-base font-semibold text-dark-blue dark:text-dark-text mb-2">
                <VideoIcon className="w-5 h-5" />
                Video Formats
              </h4>
              {mediaInfo.videoFormats.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {mediaInfo.videoFormats.map(f => (
                    <FormatButton key={f.id} format={f} selectedFormatId={selectedFormatId} onSelect={setSelectedFormatId} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-medium-blue dark:text-slate-400">No video formats available.</p>
              )}
            </div>

            {/* Audio Formats */}
            <div>
              <h4 className="flex items-center gap-2 text-base font-semibold text-dark-blue dark:text-dark-text mb-2">
                <AudioIcon className="w-5 h-5" />
                Audio Formats
              </h4>
              {mediaInfo.audioFormats.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {mediaInfo.audioFormats.map(f => (
                    <FormatButton key={f.id} format={f} selectedFormatId={selectedFormatId} onSelect={setSelectedFormatId} />
                  ))}
                </div>
              ) : (
                 <p className="text-sm text-medium-blue dark:text-slate-400">No audio formats available.</p>
              )}
            </div>

            {/* Other Formats (excluding default) */}
            {mediaInfo.otherFormats.filter(f => !f.label.startsWith('[DEFAULT]')).length > 0 && (
               <div>
                <h4 className="flex items-center gap-2 text-base font-semibold text-dark-blue dark:text-dark-text mb-2">
                    <FileIcon className="w-5 h-5" />
                    Other Formats
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {mediaInfo.otherFormats.filter(f => !f.label.startsWith('[DEFAULT]')).map(f => (
                        <FormatButton key={f.id} format={f} selectedFormatId={selectedFormatId} onSelect={setSelectedFormatId} />
                    ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={!selectedFormatId}
              className="w-full flex justify-center items-center gap-2 bg-light-blue text-dark-blue font-bold py-2.5 px-4 rounded-md hover:bg-medium-blue hover:text-cream dark:bg-light-blue dark:text-dark-bg dark:hover:bg-medium-blue dark:hover:text-dark-text disabled:bg-light-blue/50 disabled:cursor-not-allowed transition-all duration-300"
            >
              Add to Queue
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default DownloadForm;