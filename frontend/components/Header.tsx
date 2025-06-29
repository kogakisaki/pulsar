import React, { useState, useEffect, forwardRef } from 'react';
import { SunIcon, MoonIcon } from './icons/Icons';
import { useTheme } from '../contexts/ThemeContext';
import { downloaderService } from '../services/downloaderService';

const ThemeSwitcher: React.FC = () => {
    const { theme, toggleTheme } = useTheme();
    return (
        <button 
            onClick={toggleTheme} 
            className="p-2 rounded-full text-medium-blue dark:text-light-blue hover:bg-light-blue/20 dark:hover:bg-dark-card transition-colors"
            aria-label="Toggle theme"
        >
            {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
        </button>
    )
}


const Header = forwardRef<HTMLElement>((props, ref) => {
  const [ytDlpVersion, setYtDlpVersion] = useState<string | null>(null);

  useEffect(() => {
    const fetchVersion = async () => {
      try {
        const version = await downloaderService.getDlpVersion();
        setYtDlpVersion(version);
      } catch (error) {
        console.error("Failed to fetch yt-dlp version:", error);
      }
    };
    fetchVersion();
  }, []);

  return (
    <header ref={ref} className="bg-cream dark:bg-dark-card sticky top-0 z-40 w-full border-b border-medium-blue/30 dark:border-slate-700">
      <div className="max-w-4xl mx-auto flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl md:text-2xl font-bold text-dark-blue dark:text-dark-text">
              <span className="text-light-blue">P</span>ulsar
            </h1>
            {ytDlpVersion && (
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-light-blue/20 text-medium-blue dark:bg-slate-700 dark:text-slate-300">
                v{ytDlpVersion}
              </span>
            )}
          </div>
        </div>
        <ThemeSwitcher />
      </div>
    </header>
  );
});

Header.displayName = 'Header';
export default Header;