import React from 'react';
import { Accessibility, Globe, Moon, Sun, X } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

export const AccessibilityModal: React.FC = () => {
  const {
    accessibilityOpen,
    setAccessibilityOpen,
    fontScale,
    setFontScale,
    highContrast,
    setHighContrast,
    theme,
    toggleTheme,
    language,
    setLanguage,
  } = useApp();

  if (!accessibilityOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Accessibility and display preferences"
    >
      <div className="max-w-md w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Accessibility className="w-5 h-5 text-teal-600" aria-hidden="true" />
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Display & Accessibility
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setAccessibilityOpen(false)}
            aria-label="Close accessibility controls"
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 text-sm">
          <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-800">
            <div>
              <p className="font-medium text-slate-900 dark:text-white">Text Size</p>
              <p className="text-xs text-slate-500">Increase reading scale across pages</p>
            </div>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setFontScale('normal')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                  fontScale === 'normal'
                    ? 'bg-[#0F2942] dark:bg-teal-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                }`}
              >
                Standard
              </button>
              <button
                type="button"
                onClick={() => setFontScale('large')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                  fontScale === 'large'
                    ? 'bg-[#0F2942] dark:bg-teal-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                }`}
              >
                Large
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-800">
            <div>
              <p className="font-medium text-slate-900 dark:text-white">Enhanced Contrast</p>
              <p className="text-xs text-slate-500">Boost contrast across text and borders</p>
            </div>
            <button
              type="button"
              onClick={() => setHighContrast(!highContrast)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                highContrast
                  ? 'bg-[#0F2942] dark:bg-teal-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
              }`}
            >
              {highContrast ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-800">
            <div>
              <p className="font-medium text-slate-900 dark:text-white">Color Theme</p>
              <p className="text-xs text-slate-500">Switch between Light and Dark mode</p>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-100"
            >
              {theme === 'light' ? (
                <>
                  <Moon className="w-3.5 h-3.5" aria-hidden="true" />
                  Dark Mode
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5" aria-hidden="true" />
                  Light Mode
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium text-slate-900 dark:text-white">Language / ভাষা</p>
              <p className="text-xs text-slate-500">English or Bangla interface</p>
            </div>
            <button
              type="button"
              onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-100"
            >
              <Globe className="w-3.5 h-3.5" aria-hidden="true" />
              {language === 'en' ? 'Switch to বাংলা' : 'Switch to English'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
