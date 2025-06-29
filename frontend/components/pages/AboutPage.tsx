

import React from 'react';

const AboutPage: React.FC = () => {
  return (
    <div className="bg-cream dark:bg-dark-card rounded-lg p-6 md:p-8 border border-medium-blue/30 dark:border-slate-700 animate-fade-in">
      <h2 className="text-2xl font-bold mb-4 text-dark-blue dark:text-dark-text">About Pulsar</h2>
      <div className="space-y-4 text-medium-blue dark:text-slate-400">
        <p>
            <span className="font-semibold text-dark-blue dark:text-dark-text">Version:</span> 1.0.0
        </p>
        <p>
            This application provides a modern, user-friendly graphical interface for the powerful command-line video downloader,{' '}
            <a href="https://github.com/yt-dlp/yt-dlp" target="_blank" rel="noopener noreferrer" className="font-semibold text-light-blue hover:text-medium-blue underline transition-colors">
                yt-dlp
            </a>. 
            It supports downloading from YouTube and hundreds of other video hosting websites.
        </p>
        <p>
            Built with React, TypeScript, and Tailwind CSS.
        </p>
        <div className="border-t border-medium-blue/30 dark:border-slate-700 pt-4 mt-4">
            <h3 className="text-lg font-semibold text-dark-blue dark:text-dark-text">Credits</h3>
            <p>
                This UI is a conceptual project designed to simplify video downloading. All credit for the download functionality goes to the developers and contributors of the yt-dlp project.
            </p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;