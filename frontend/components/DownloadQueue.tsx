import React from 'react';
import { DownloadItem, DownloadStatus } from '../types';
import DownloadItemComponent from './DownloadItem';

interface DownloadQueueProps {
  downloads: DownloadItem[];
  onUpdateStatus: (id: string, status: DownloadStatus) => void;
  onDeleteFile: (id: string) => void; // New prop
}

const DownloadQueue: React.FC<DownloadQueueProps> = ({ downloads, onUpdateStatus, onDeleteFile }) => {
  if (downloads.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-medium-blue dark:text-slate-400">The list is empty.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {downloads.map((item) => (
        <DownloadItemComponent key={item.id} item={item} onUpdateStatus={onUpdateStatus} onDeleteFile={onDeleteFile} />
      ))}
    </div>
  );
};

export default DownloadQueue;