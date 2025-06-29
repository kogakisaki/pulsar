import React from 'react';
import { GithubIcon } from './icons/Icons';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full text-dark-blue dark:text-dark-text font-sans p-4 mt-auto border-t border-medium-blue/30 dark:border-slate-700">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between text-center sm:text-left gap-4">
        <p className="text-sm text-medium-blue dark:text-slate-400">
          &copy; {currentYear} Pulsar. All rights reserved.
        </p>
        <div className="flex items-center space-x-4">
          <a
            href="https://github.com/katto-dev"
            target="_blank"
            rel="noopener noreferrer"
            className="text-medium-blue hover:text-dark-blue dark:text-slate-400 dark:hover:text-light-blue transition-colors"
            aria-label="Katto's GitHub Profile"
          >
            <GithubIcon className="w-5 h-5" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;