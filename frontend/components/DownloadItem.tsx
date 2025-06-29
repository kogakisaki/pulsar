
import React from 'react';
import { DownloadItem, DownloadStatus } from '../types';
import { XIcon, CheckCircleIcon, AlertTriangleIcon, ClockIcon, CancelledIcon, ArrowDownCircleIcon } from './icons/Icons';

interface DownloadItemProps {
  item: DownloadItem;
  onUpdateStatus: (id:string, status: DownloadStatus) => void;
  onDeleteFile: (id: string) => void; // New prop for deleting file
}

const getStatusStyles = (status: string): { icon: React.ReactElement; text: string; className: string } => {
  const iconClassName = "w-4 h-4 flex-shrink-0 mr-1.5"; // Common class for all icons
  switch (status) {
    case DownloadStatus.Downloading:
      return { icon: <ArrowDownCircleIcon className={iconClassName} />, text: 'Downloading', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' };
    case DownloadStatus.Pending:
      return { icon: <ClockIcon className={iconClassName} />, text: 'Pending', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' };
    case DownloadStatus.Paused:
      return { icon: <ClockIcon className={iconClassName} />, text: 'Paused', className: 'bg-light-blue/20 text-medium-blue dark:bg-slate-600 dark:text-slate-200' };
    case DownloadStatus.Completed:
      return { icon: <CheckCircleIcon className={iconClassName} />, text: 'Completed', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' };
    case DownloadStatus.Error:
      return { icon: <AlertTriangleIcon className={iconClassName} />, text: 'Error', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' };
    case DownloadStatus.Cancelled:
      return { icon: <CancelledIcon className={iconClassName} />, text: 'Cancelled', className: 'bg-medium-blue/10 text-medium-blue dark:bg-slate-700 dark:text-slate-400' };
    default:
        return { icon: <></>, text: '', className: '' };
  }
};


const ProgressBar: React.FC<{ progress: number; status: string }> = ({ progress, status }) => {
    const color =
        status === DownloadStatus.Completed ? 'bg-green-500' :
        status === DownloadStatus.Error ? 'bg-red-500' :
        'bg-light-blue';

    return (
        <div className="w-full bg-medium-blue/20 dark:bg-slate-700 rounded-full h-1.5 mt-1.5">
            <div
                className={`h-1.5 rounded-full ${color} transition-all duration-500 ease-out`}
                style={{ width: `${progress}%` }}
            ></div>
        </div>
    );
};


const DownloadItemComponent: React.FC<DownloadItemProps> = ({ item, onUpdateStatus, onDeleteFile }) => {
  const { icon, text, className } = getStatusStyles(item.status);
  
  console.log(`DownloadItem ${item.id}: status=${item.status}, filePath=${item.filePath}`); // Added log
  
  const handleCancel = () => onUpdateStatus(item.id, DownloadStatus.Cancelled);
  const handleDelete = () => onDeleteFile(item.id); // New handler for deleting file
  
  // Only cancel is supported via API for now
  const isActionable = item.status === DownloadStatus.Downloading || item.status === DownloadStatus.Paused || item.status === DownloadStatus.Pending;
  const isDeletable = item.status === DownloadStatus.Completed && item.filePath; // File can be deleted if completed and path exists

  return (
    <div className="bg-cream dark:bg-dark-card p-3 rounded-lg flex items-center space-x-4 transition-colors border border-medium-blue/30 dark:border-slate-700">
      <img src={item.thumbnail || ''} alt="thumbnail" className="w-24 h-auto object-cover rounded-md flex-shrink-0" />
      <div className="flex-grow overflow-hidden">
        {item.status === DownloadStatus.Completed && item.filePath ? (
            <a
                href={`/api/files/${item.id}`} // Link to the downloaded file
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold truncate text-dark-blue dark:text-dark-text hover:underline"
                title={item.title}
            >
                {item.title}
            </a>
        ) : (
            <p className="text-sm font-semibold truncate text-dark-blue dark:text-dark-text" title={item.title}>
                {item.title}
            </p>
        )}
         {item.status === DownloadStatus.Error && item.error && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1 truncate" title={item.error}>
                {item.error}
            </p>
        )}
        <div className={`flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${className} mt-1 w-fit`}>
            {icon}
            <span>{text} {item.status === DownloadStatus.Downloading && `${item.progress.toFixed(0)}%`}</span>
        </div>
        <ProgressBar progress={item.progress} status={item.status} />
      </div>
      <div className="flex-shrink-0 flex items-center space-x-1">
        {isActionable && (
            <button onClick={handleCancel} title="Cancel" className="p-2 rounded-full hover:bg-red-100 text-medium-blue hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-red-900 transition-colors">
              <XIcon className="w-5 h-5" />
            </button>
        )}
        {isDeletable && (
            <button onClick={handleDelete} title="Delete File" className="p-2 rounded-full hover:bg-red-100 text-medium-blue hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-red-900 transition-colors">
              <XIcon className="w-5 h-5" /> {/* Using XIcon for delete, consider a trash icon if available */}
            </button>
        )}
      </div>
    </div>
  );
};

export default React.memo(DownloadItemComponent);