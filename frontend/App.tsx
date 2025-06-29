
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { DownloadItem, MainTab, FormatOption, DownloadStatus, MediaInfo } from './types';
import { downloaderService } from './services/downloaderService';
import Header from './components/Header';
import DownloaderPage from './components/pages/DownloaderPage';
import HistoryPage from './components/pages/HistoryPage';
import SettingsPage from './components/pages/SettingsPage';
import AboutPage from './components/pages/AboutPage';
import Footer from './components/Footer';

const App: React.FC = () => {
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [activeTab, setActiveTab] = useState<MainTab>('downloader');
  const navContainerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  // State for DownloadForm, moved from DownloadForm.tsx
  const [url, setUrl] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mediaInfo, setMediaInfo] = useState<MediaInfo | null>(null);
  const [selectedFormatId, setSelectedFormatId] = useState<string>('');

  // WebSocket setup
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}`); // Connect to backend WebSocket on the same host and port

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event: MessageEvent) => {
      const message: { type: string; payload: any } = JSON.parse(event.data);
      console.log('WebSocket message received:', message);

      setDownloads(prevDownloads => {
        switch (message.type) {
          case 'download:progress':
            return prevDownloads.map(d => (d.id === message.payload.id ? { ...d, progress: message.payload.progress, status: DownloadStatus.Downloading } : d));
          case 'download:complete':
            setActiveTab('history'); // Navigate to history tab
            return prevDownloads.map(d => (d.id === message.payload.id ? { ...d, progress: 100, status: DownloadStatus.Completed } : d));
          case 'download:error':
            return prevDownloads.map(d => (d.id === message.payload.id ? { ...d, status: DownloadStatus.Error, error: message.payload.error } : d));
          case 'download:cancelled':
            return prevDownloads.map(d => (d.id === message.payload.id ? { ...d, status: DownloadStatus.Cancelled } : d));
          case 'queue:updated':
          case 'history:updated': // Handle history updates
            // Re-fetch all downloads to ensure consistency with backend database
            downloaderService.fetchAllDownloads().then(setDownloads);
            return prevDownloads; // Return current state, will be updated by fetchAllDownloads
          default:
            console.warn('Unknown WebSocket message type:', message.type);
            return prevDownloads;
        }
      });
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    ws.onerror = (event: Event) => {
      console.error('WebSocket error:', event);
    };

    return () => {
      ws.close();
    };
  }, []);

  // Initial fetch of downloads
  useEffect(() => {
    downloaderService.fetchAllDownloads().then(setDownloads);
  }, []);

  const addDownload = async (url: string, format: FormatOption, title: string, thumbnail: string) => {
    try {
      await downloaderService.startDownload({ url, format, title, thumbnail });
      // The queue:updated WebSocket event will handle updating the downloads state
    } catch (error) {
      console.error("Failed to start download:", error);
    }
  };

  const updateDownloadStatus = async (id: string, status: DownloadStatus) => {
    // Only cancel is supported via API for now
    if (status === DownloadStatus.Cancelled) {
      try {
        await downloaderService.cancelDownload(id);
        // The download:cancelled WebSocket event will handle updating the downloads state
      } catch (error) {
        console.error(`Failed to cancel download ${id}:`, error);
      }
    } else {
      console.warn(`Status update to ${status} not supported via API for download ${id}.`);
    }
  };
  
  const clearHistory = async () => {
    try {
      await downloaderService.clearHistory();
      // The queue:updated WebSocket event will handle updating the downloads state
    } catch (error) {
      console.error("Failed to clear history:", error);
    }
  }

  const handleDeleteFile = async (id: string) => {
    try {
      await downloaderService.deleteFile(id);
      // The queue:updated WebSocket event will handle updating the downloads state
    } catch (error) {
      console.error(`Failed to delete file ${id}:`, error);
    }
  };

  const { queue, history } = useMemo(() => {
    const queue = downloads.filter(
      (d: DownloadItem) => d.status === DownloadStatus.Downloading || d.status === DownloadStatus.Paused || d.status === DownloadStatus.Pending
    ).sort((a: DownloadItem, b: DownloadItem) => b.createdAt - a.createdAt);
    const history = downloads.filter(
      (d: DownloadItem) => d.status === DownloadStatus.Completed || d.status === DownloadStatus.Error || d.status === DownloadStatus.Cancelled
    ).sort((a: DownloadItem, b: DownloadItem) => b.createdAt - a.createdAt);
    return { queue, history };
  }, [downloads]);

  const renderContent = () => {
    switch (activeTab) {
      case 'downloader':
        return (
          <DownloaderPage
            onAddDownload={addDownload}
            queue={queue}
            onUpdateStatus={updateDownloadStatus}
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
        );
      case 'history':
        return <HistoryPage history={history} onUpdateStatus={updateDownloadStatus} onClearHistory={clearHistory} onDeleteFile={handleDeleteFile} />;
      case 'settings':
        return <SettingsPage />;
      case 'about':
        return <AboutPage />;
      default:
        return null;
    }
  };

  const handleNavClick = (tab: MainTab, event: React.MouseEvent<HTMLButtonElement>) => {
    setActiveTab(tab);
    
    const clickedButton = event.currentTarget;
  
    // Use scrollIntoView for simpler and more robust centering.
    clickedButton.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  
    // Scroll main window to the top to ensure content is visible from the start.
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const NavButton: React.FC<{ tab: MainTab; label: string; iconClassName: string; }> = ({ tab, label, iconClassName }) => {
    const isActive = activeTab === tab;
    return (
        <button
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleNavClick(tab, e)}
            className={`flex-shrink-0 flex items-center justify-center px-4 py-2 text-sm md:text-base font-semibold rounded-md transition-colors duration-200 ${
                isActive 
                    ? 'bg-light-blue text-cream dark:bg-medium-blue dark:text-white' 
                    : 'text-medium-blue hover:bg-light-blue/20 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-dark-text'
            }`}
        >
            <i className={`${iconClassName} mr-2`} aria-hidden="true"></i>
            <span>{label}</span>
        </button>
    );
  };

  return (
    <div className="min-h-screen text-dark-blue dark:text-dark-text flex flex-col">
      <Header ref={headerRef} />
      <main className="max-w-4xl mx-auto p-4 md:p-6 w-full flex-grow">
        <nav className="mb-6 bg-cream dark:bg-dark-card rounded-lg border border-medium-blue/30 dark:border-slate-700 sticky top-[var(--header-height)] z-30 transition-all duration-300">
            <div
                ref={navContainerRef}
                className="flex items-center justify-start md:justify-center space-x-1 md:space-x-2 overflow-x-auto p-2 no-scrollbar"
            >
                <NavButton tab="downloader" label="Downloader" iconClassName="fas fa-download" />
                <NavButton tab="history" label="History" iconClassName="fas fa-history" />
                <NavButton tab="settings" label="Settings" iconClassName="fas fa-cog" />
                <NavButton tab="about" label="About" iconClassName="fas fa-info-circle" />
            </div>
        </nav>
        
        {renderContent()}

      </main>
      <Footer />
    </div>
  );
};

export default App;
