
import React from 'react';
import DownloadForm from '../DownloadForm';
import DownloadQueue from '../DownloadQueue';
import { DownloadItem, DownloadStatus, FormatOption, MediaInfo } from '../../types';
import { Dispatch, SetStateAction } from 'react';

interface DownloaderPageProps {
  onAddDownload: (url: string, format: FormatOption, title: string, thumbnail: string) => void;
  queue: DownloadItem[];
  onUpdateStatus: (id: string, status: DownloadStatus) => void;
  url: string;
  setUrl: Dispatch<SetStateAction<string>>;
  isFetching: boolean;
  setIsFetching: Dispatch<SetStateAction<boolean>>;
  error: string | null;
  setError: Dispatch<SetStateAction<string | null>>;
  mediaInfo: MediaInfo | null;
  setMediaInfo: Dispatch<SetStateAction<MediaInfo | null>>;
  selectedFormatId: string;
  setSelectedFormatId: Dispatch<SetStateAction<string>>;
}

const DownloaderPage: React.FC<DownloaderPageProps> = ({
  onAddDownload,
  queue,
  onUpdateStatus,
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
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-cream dark:bg-dark-card rounded-lg p-6 md:p-8 border border-medium-blue/30 dark:border-slate-700">
        <h2 className="text-2xl font-bold mb-4 text-dark-blue dark:text-dark-text">Add New Download</h2>
        <DownloadForm
          onAddDownload={onAddDownload}
          url={url}
          setUrl={setUrl}
          isFetching={isFetching}
          setIsFetching={setIsFetching}
          error={error}
          setError={setError}
          mediaInfo={mediaInfo}
          setMediaInfo={setMediaInfo}
          selectedFormatId={selectedFormatId}
          setSelectedFormatId={setSelectedFormatId}
        />
      </div>

      <div className="bg-cream dark:bg-dark-card rounded-lg border border-medium-blue/30 dark:border-slate-700">
        <div className="p-4 border-b border-medium-blue/30 dark:border-slate-700">
          <h3 className="text-xl font-bold text-dark-blue dark:text-dark-text">Active Queue ({queue.length})</h3>
        </div>
        <div className="p-2 md:p-4">
          <DownloadQueue downloads={queue} onUpdateStatus={onUpdateStatus} onDeleteFile={() => {}} />
        </div>
      </div>
    </div>
  );
};

export default DownloaderPage;