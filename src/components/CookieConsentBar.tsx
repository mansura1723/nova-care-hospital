import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';

export const CookieConsentBar: React.FC = () => {
  const { cookieConsent, setCookieConsent } = useApp();

  if (cookieConsent !== 'unset') return null;

  return (
    <div
      role="region"
      aria-label="Cookie and privacy preferences"
      className="fixed bottom-4 left-4 right-4 md:right-auto md:left-5 md:max-w-lg z-30 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
    >
      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
        We use essential browser storage for language, theme, and authenticated session preferences.{' '}
        <Link to="/privacy" className="underline text-[#0F2942] dark:text-teal-300 font-medium">
          Privacy Policy
        </Link>
      </p>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={() => setCookieConsent('essential')}
          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          Essential Only
        </button>
        <button
          type="button"
          onClick={() => setCookieConsent('all')}
          className="px-3 py-1.5 rounded-lg bg-[#0F2942] dark:bg-teal-600 text-white font-medium"
        >
          Accept
        </button>
      </div>
    </div>
  );
};
