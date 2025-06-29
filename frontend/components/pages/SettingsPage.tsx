
import React, { useState, useEffect, useRef } from 'react';
import { ArgumentTemplate } from '../../types';
import { SaveIcon, EditIcon, TrashIcon, UploadIcon, XCircleIcon, CheckCircleIcon, AlertTriangleIcon, InfoIcon } from '../icons/Icons';
import { downloaderService } from '../../services/downloaderService';


const SettingsPage: React.FC = () => {
  const [templates, setTemplates] = useState<ArgumentTemplate[]>([]);
  const [cookiesContent, setCookiesContent] = useState<string>('');
  const [dlpVersion, setDlpVersion] = useState<string | null>(null);
  
  const [editingTemplate, setEditingTemplate] = useState<ArgumentTemplate | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [templateArgs, setTemplateArgs] = useState('');

  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      console.log('Attempting to fetch templates...'); // Added log
      try {
        const response = await fetch('http://localhost:4000/api/settings/templates'); // Changed to absolute URL
        if (response.ok) {
          const data = await response.json();
          setTemplates(data);
        } else {
          showNotification('error', 'Failed to load templates.');
        }
      } catch (error) {
        console.error("Failed to fetch templates:", error);
        showNotification('error', 'Failed to load templates.');
      }
    };
    fetchTemplates();

    const fetchCookieStatus = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/settings/cookies'); // Changed to absolute URL
        if (response.ok) {
          const data = await response.json();
          setCookiesContent(data.hasCookies ? 'Cookies loaded' : ''); // Assuming backend returns { hasCookies: boolean }
        } else {
          showNotification('error', 'Failed to load cookie status.');
        }
      } catch (error) {
        console.error("Failed to fetch cookie status:", error);
        showNotification('error', 'Failed to load cookie status.');
      }
    };
    fetchCookieStatus();
  }, []);

  useEffect(() => {
    const fetchDlpVersion = async () => {
      try {
        const version = await downloaderService.getDlpVersion();
        setDlpVersion(version);
      } catch (error) {
        console.error("Failed to fetch yt-dlp version:", error);
        setDlpVersion('Error fetching version');
      }
    };
    fetchDlpVersion();
  }, []);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleClearForm = () => {
    setEditingTemplate(null);
    setTemplateName('');
    setTemplateArgs('');
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateName.trim() || !templateArgs.trim()) {
      showNotification('error', 'Template name and arguments cannot be empty.');
      return;
    }

    try {
      let response;
      if (editingTemplate) {
        response = await fetch(`http://localhost:4000/api/settings/templates/${editingTemplate.id}`, { // Changed to absolute URL
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: templateName, args: templateArgs }),
        });
      } else {
        response = await fetch('http://localhost:4000/api/settings/templates', { // Changed to absolute URL
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: templateName, args: templateArgs }),
        });
      }

      if (response.ok) {
        const savedTemplate = await response.json();
        if (editingTemplate) {
          setTemplates(templates.map(t => t.id === savedTemplate.id ? savedTemplate : t));
          showNotification('success', 'Template updated successfully.');
        } else {
          setTemplates([...templates, savedTemplate]);
          showNotification('success', 'Template saved successfully.');
        }
        handleClearForm();
      } else {
        const errorData = await response.json();
        showNotification('error', errorData.message || 'Failed to save template.');
      }
    } catch (error) {
      console.error("Failed to save template:", error);
      showNotification('error', 'Failed to save template.');
    }
  };

  const handleEditTemplate = (template: ArgumentTemplate) => {
    setEditingTemplate(template);
    setTemplateName(template.name);
    setTemplateArgs(template.args);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteTemplate = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this template?")) {
      try {
        const response = await fetch(`http://localhost:4000/api/settings/templates/${id}`, { // Changed to absolute URL
          method: 'DELETE',
        });

        if (response.ok) {
          setTemplates(templates.filter(t => t.id !== id));
          showNotification('success', 'Template deleted successfully.');
          if (editingTemplate?.id === id) {
            handleClearForm();
          }
        } else {
          const errorData = await response.json();
          showNotification('error', errorData.message || 'Failed to delete template.');
        }
      } catch (error) {
        console.error("Failed to delete template:", error);
        showNotification('error', 'Failed to delete template.');
      }
    }
  };
  
  const handleCookieFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('cookieFile', file);

    try {
      const response = await fetch('http://localhost:4000/api/settings/cookies', { // Changed to absolute URL
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setCookiesContent('Cookies loaded');
        showNotification('success', 'Cookies file imported successfully.');
      } else {
        const errorData = await response.json();
        showNotification('error', errorData.message || 'Failed to import cookies file.');
      }
    } catch (error) {
      console.error("Failed to import cookies file:", error);
      showNotification('error', 'Failed to import cookies file.');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Clear the file input
      }
    }
  };
  
  const handleClearCookies = async () => {
     if (window.confirm("Are you sure you want to clear the imported cookies?")) {
        try {
          const response = await fetch('http://localhost:4000/api/settings/cookies', { // Changed to absolute URL
            method: 'DELETE',
          });

          if (response.ok) {
            setCookiesContent('');
            showNotification('success', 'Cookies have been cleared.');
          } else {
            const errorData = await response.json();
            showNotification('error', errorData.message || 'Failed to clear cookies.');
          }
        } catch (error) {
          console.error("Failed to clear cookies:", error);
          showNotification('error', 'Failed to clear cookies.');
        } finally {
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
     }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <h2 className="text-2xl font-bold text-dark-blue dark:text-dark-text">Settings</h2>

      {/* yt-dlp Version */}
      <div className="bg-cream dark:bg-dark-card rounded-lg p-4 border border-medium-blue/30 dark:border-slate-700 flex items-center gap-3">
        <InfoIcon className="w-6 h-6 text-light-blue flex-shrink-0" />
        <p className="text-sm text-medium-blue dark:text-slate-400">
          yt-dlp Version: <span className="font-semibold text-dark-blue dark:text-dark-text">{dlpVersion || 'Loading...'}</span>
        </p>
      </div>


      {notification && (
        <div className={`flex items-center gap-2 p-3 text-sm rounded-md ${notification.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300'}`}>
          {notification.type === 'success' ? <CheckCircleIcon className="w-5 h-5"/> : <AlertTriangleIcon className="w-5 h-5" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Arguments Templates Section */}
      <div className="bg-cream dark:bg-dark-card rounded-lg p-6 border border-medium-blue/30 dark:border-slate-700">
        <h3 className="text-xl font-bold mb-2 text-dark-blue dark:text-dark-text">Arguments Templates</h3>
        <p className="text-sm text-medium-blue dark:text-slate-400 mb-4">
          Create reusable templates for your favorite yt-dlp commands. For a full list of available options, check the{' '}
          <a href="https://github.com/yt-dlp/yt-dlp?tab=readme-ov-file#usage-and-options" target="_blank" rel="noopener noreferrer" className="font-semibold text-light-blue hover:text-medium-blue underline transition-colors">
            yt-dlp documentation
          </a>.
        </p>
        <form onSubmit={handleSaveTemplate} className="space-y-4">
          <div>
            <label htmlFor="template-name" className="block text-sm font-medium text-dark-blue dark:text-slate-300 mb-1">Template Name</label>
            <input id="template-name" type="text" value={templateName} onChange={(e) => setTemplateName(e.target.value)} placeholder="e.g., Audio Only FLAC" className="w-full p-2 border border-medium-blue/50 rounded-md bg-cream dark:bg-dark-bg focus:outline-none focus:border-dark-blue dark:focus:border-light-blue transition" />
          </div>
          <div>
            <label htmlFor="template-args" className="block text-sm font-medium text-dark-blue dark:text-slate-300 mb-1">Arguments</label>
            <textarea id="template-args" value={templateArgs} onChange={(e) => setTemplateArgs(e.target.value)} rows={3} placeholder='--extract-audio --audio-format flac -o "%(title)s.%(ext)s"' className="w-full p-2 border border-medium-blue/50 rounded-md bg-cream dark:bg-dark-bg focus:outline-none focus:border-dark-blue dark:focus:border-light-blue transition font-sans"></textarea>
          </div>
          <div className="flex items-center gap-2">
            <button type="submit" className="flex items-center gap-2 px-4 py-2 border border-transparent rounded-md text-sm font-semibold bg-light-blue text-dark-blue dark:bg-light-blue dark:text-dark-bg hover:bg-medium-blue hover:text-cream dark:hover:text-dark-text transition">
              <SaveIcon className="w-5 h-5" />
              <span>{editingTemplate ? 'Update Template' : 'Save Template'}</span>
            </button>
            {editingTemplate && (
              <button type="button" onClick={handleClearForm} className="px-4 py-2 border border-medium-blue/50 dark:border-slate-600 rounded-md text-sm font-semibold text-dark-blue hover:bg-light-blue/20 dark:text-slate-300 dark:hover:bg-slate-700 transition">
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="mt-8">
            <h4 className="font-semibold text-dark-blue dark:text-dark-text mb-2">Saved Templates ({templates.length})</h4>
            <div className="space-y-3">
                {templates.length > 0 ? templates.map(template => (
                    <div key={template.id} className="p-3 rounded-md border border-medium-blue/30 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex-grow">
                            <p className="font-semibold text-dark-blue dark:text-dark-text">{template.name}</p>
                            <p className="text-sm text-medium-blue dark:text-slate-400 font-sans break-all">{template.args}</p>
                        </div>
                        <div className="flex-shrink-0 flex items-center gap-2">
                            <button onClick={() => handleEditTemplate(template)} className="flex items-center gap-1 p-2 text-sm text-medium-blue dark:text-slate-300 hover:text-dark-blue dark:hover:text-white hover:bg-light-blue/20 dark:hover:bg-slate-700 rounded-md transition">
                                <EditIcon className="w-4 h-4" /> Edit
                            </button>
                            <button onClick={() => handleDeleteTemplate(template.id)} className="flex items-center gap-1 p-2 text-sm text-medium-blue dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-md transition">
                                <TrashIcon className="w-4 h-4" /> Delete
                            </button>
                        </div>
                    </div>
                )) : <p className="text-medium-blue dark:text-slate-400">No templates saved yet.</p>}
            </div>
        </div>
      </div>

      {/* Cookies Section */}
      <div className="bg-cream dark:bg-dark-card rounded-lg p-6 border border-medium-blue/30 dark:border-slate-700">
        <h3 className="text-xl font-bold mb-2 text-dark-blue dark:text-dark-text">Cookies</h3>
        <div className="space-y-4">
            <p className="text-sm text-medium-blue dark:text-slate-400">
                For downloads requiring a login, you can import a Netscape-formatted cookies file. Use a browser extension like 'Get cookies.txt' to export your cookies.
                Learn more about how to{' '}
                <a href="https://github.com/yt-dlp/yt-dlp/wiki/FAQ#how-do-i-pass-cookies-to-yt-dlp" target="_blank" rel="noopener noreferrer" className="font-semibold text-light-blue hover:text-medium-blue underline transition-colors">
                    pass cookies to yt-dlp in the official docs
                </a>.
                <br/>
                <strong className="text-red-600 dark:text-red-400 mt-2 block">Warning: Cookie files contain sensitive session information. Handle them with care.</strong>
            </p>
            <div className="flex items-center gap-4">
                <input type="file" id="cookie-file" accept=".txt" ref={fileInputRef} onChange={handleCookieFileChange} className="hidden" />
                <label htmlFor="cookie-file" className="cursor-pointer flex items-center gap-2 px-4 py-2 border border-transparent rounded-md text-sm font-semibold bg-light-blue text-dark-blue dark:bg-light-blue dark:text-dark-bg hover:bg-medium-blue hover:text-cream dark:hover:text-dark-text transition">
                    <UploadIcon className="w-5 h-5" />
                    <span>{cookiesContent ? 'Import New File' : 'Import Cookies File'}</span>
                </label>
                {cookiesContent && (
                    <button onClick={handleClearCookies} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-md transition border border-red-200 dark:border-red-800">
                        <XCircleIcon className="w-5 h-5"/>
                        Clear Cookies
                    </button>
                )}
            </div>
            {cookiesContent && (
                <div className="p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-md">
                    <p className="text-sm font-semibold text-green-700 dark:text-green-300">Cookies are loaded and will be used for future downloads.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
