import React from 'react';
import { useApp } from '../contexts/AppContext';
import { Breadcrumb } from '../components/Breadcrumb';
import { PageMeta } from '../components/PageMeta';

export const PrivacyPage: React.FC = () => {
  const { cookieConsent, setCookieConsent } = useApp();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <PageMeta
        title="Privacy & Cookie Preferences"
        description="Review Nova Care Hospital’s privacy disclosures, data isolation controls, and cookie preferences."
      />
      <Breadcrumb items={[{ label: 'Privacy & Cookies' }]} />

      <div className="space-y-2">
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">
          Privacy, Data Protection & Cookie Preferences
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Security & Privacy Disclosure
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 md:p-8 space-y-5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        <section className="space-y-1.5">
          <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
            1. Platform Scope & Non-Clinical Notice
          </h2>
          <p>
            This hospital portal provides care coordination, scheduling, and informational resources and is not a substitute for emergency clinical evaluation. Please do not submit acute medical emergencies through online web forms.
          </p>
        </section>

        <section className="space-y-1.5">
          <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
            2. Patient Data Isolation
          </h2>
          <p>
            Authenticated patient profiles, appointment requests, package bookings, notifications, and diagnostic report metadata are stored in Cloud Firestore with strict owner-only and administrator-only security rules.
          </p>
        </section>

        <section className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
          <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
            3. Cookie & Storage Preference
          </h2>
          <p className="text-xs text-slate-500">
            Current preference:{' '}
            <span className="font-semibold text-slate-900 dark:text-white">
              {cookieConsent === 'unset' ? 'Not selected yet' : cookieConsent}
            </span>
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCookieConsent('essential')}
              className={`px-4 py-2 rounded-lg border text-xs font-semibold ${
                cookieConsent === 'essential'
                  ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200'
                  : 'border-slate-300 dark:border-slate-700'
              }`}
            >
              Essential Storage Only
            </button>
            <button
              type="button"
              onClick={() => setCookieConsent('all')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold ${
                cookieConsent === 'all'
                  ? 'bg-[#0F2942] dark:bg-teal-600 text-white'
                  : 'border border-slate-300 dark:border-slate-700'
              }`}
            >
              Accept All Preferences
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
