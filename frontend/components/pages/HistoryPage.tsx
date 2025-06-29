
import React from 'react';
import DownloadQueue from '../DownloadQueue';
import { DownloadItem, DownloadStatus } from '../../types';
import { XCircleIcon } from '../icons/Icons';

interface HistoryPageProps {
  history: DownloadItem[];
  onUpdateStatus: (id: string, status: DownloadStatus) => void;
  onClearHistory: () => void;
  onDeleteFile: (id: string) => void; // New prop for deleting file
}

const HistoryPage: React.FC<HistoryPageProps> = ({ history, onUpdateStatus, onClearHistory, onDeleteFile }) => {
  return (
    <div className="bg-cream dark:bg-dark-card rounded-lg border border-medium-blue/30 dark:border-slate-700 animate-fade-in">
        <div className="p-4 border-b border-medium-blue/30 dark:border-slate-700 flex justify-between items-center">
            <h3 className="text-xl font-bold text-dark-blue dark:text-dark-text">Download History ({history.length})</h3>
            {history.length > 0 && (
                <button 
                    onClick={onClearHistory} 
                    className="flex items-center gap-2 text-sm font-semibold text-medium-blue hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900"
                >
                    <XCircleIcon className="w-5 h-5" />
                    Clear History
                </button>
            )}
        </div>
        <div className="p-2 md:p-4">
            <DownloadQueue downloads={history} onUpdateStatus={onUpdateStatus} onDeleteFile={onDeleteFile} />
        </div>
    </div>
  );
};

export default HistoryPage;