import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Search } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { HOSPITAL_IMAGES } from '../data/seedData';
import { submitInquiry } from '../services/hospitalService';
import { isValidEmail, isValidPhone } from '../utils/hospitalLogic';
import { Breadcrumb } from '../components/Breadcrumb';
import { PageMeta } from '../components/PageMeta';

export const DiagnosticsPage: React.FC<{ mode?: 'services' | 'diagnostics' }> = ({
  mode = 'diagnostics',
}) => {
  const { diagnostics, user } = useApp();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');

  const [inqName, setInqName] = useState(user?.displayName || '');
  const [inqEmail, setInqEmail] = useState(user?.email || '');
  const [inqPhone, setInqPhone] = useState('');
  const [inqSubject, setInqSubject] = useState('Diagnostic Test Preparation Inquiry');
  const [inqMessage, setInqMessage] = useState('');
  const [inqError, setInqError] = useState('');
  const [inqSubmitting, setInqSubmitting] = useState(false);
  const [inqDone, setInqDone] = useState(false);

  const categories = ['all', ...Array.from(new Set(diagnostics.map((d) => d.category)))];

  const filtered = diagnostics.filter((item) => {
    if (category !== 'all' && item.category !== category) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      item.name.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.preparation.toLowerCase().includes(q)
    );
  });

  const handleInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setInqError('');
    if (inqName.trim().length < 2) {
      setInqError('Please enter your full name.');
      return;
    }
    if (!isValidEmail(inqEmail)) {
      setInqError('Please enter a valid email address.');
      return;
    }
    if (!isValidPhone(inqPhone)) {
      setInqError('Please enter a valid phone number.');
      return;
    }
    if (inqMessage.trim().length < 5) {
      setInqError('Please provide details about the test or service inquiry.');
      return;
    }
    setInqSubmitting(true);
    try {
      await submitInquiry(
        {
          type: 'diagnostic',
          name: inqName,
          email: inqEmail,
          phone: inqPhone,
          subject: inqSubject,
          message: inqMessage,
        },
        user
      );
      setInqDone(true);
      setInqMessage('');
    } catch (err) {
      setInqError(err instanceof Error ? err.message : 'Unable to send inquiry.');
    } finally {
      setInqSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <PageMeta
        title={mode === 'services' ? 'Medical Services' : 'Diagnostic Services'}
        description="Explore Nova Care Hospital’s inpatient medical services, 3T MRI, CT scan, ultrasound, echocardiography, pathology, and preparation instructions."
      />
      <Breadcrumb
        items={[{ label: mode === 'services' ? 'Medical Services' : 'Diagnostic Services' }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-6 space-y-3">
          <p className="text-xs font-semibold text-teal-700 dark:text-teal-400">
            Clinical Infrastructure & Diagnostics
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
            {mode === 'services'
              ? 'Integrated Medical & Diagnostic Services'
              : 'Diagnostic Imaging & Laboratory Services'}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            Review our laboratory panels, imaging modalities, report turnaround times, and patient preparation instructions. Note: We do not provide automated medical diagnoses online.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              to="/health-packages"
              className="px-4 py-2.5 rounded-xl bg-[#0F2942] dark:bg-teal-600 text-white text-xs font-semibold"
            >
              View Preventive Packages
            </Link>
            <Link
              to="/appointments/book"
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100"
            >
              Request Specialist Consultation
            </Link>
          </div>
        </div>
        <div className="lg:col-span-6 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 aspect-[16/10]">
          <img
            src={HOSPITAL_IMAGES.diagnosticMri}
            alt="Nova Care Diagnostic Imaging and MRI Suite"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Medical Care Pathways Summary when in /services mode */}
      {mode === 'services' && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: 'Outpatient Specialist Clinics',
              desc: 'Scheduled consultation suites across 30 departments with online slot requesting and diagnostic coordination.',
            },
            {
              title: '24/7 Emergency & Critical Care',
              desc: 'Dedicated resuscitation bay, adult ICU, level-III NICU readiness, and surgical standby.',
            },
            {
              title: 'Day-Care & Preventive Lounge',
              desc: 'Morning health checkup coordination, infusion therapy suites, and multidisciplinary rehabilitation.',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-2"
            >
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                {item.title}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </section>
      )}

      {/* Search & Filter */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3 justify-between">
          <div className="relative max-w-md w-full self-start">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search MRI, CT scan, blood test, ECG..."
              aria-label="Search diagnostic services"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                  category === cat
                    ? 'bg-[#0F2942] dark:bg-teal-600 text-white'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {cat === 'all' ? 'All Diagnostics' : cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((svc) => (
            <article
              key={svc.id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col justify-between gap-4"
            >
              <div className="space-y-2.5">
                <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
                  {svc.category} · {svc.turnaroundTime}
                </p>
                <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                  {svc.name}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {svc.description}
                </p>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Preparation Instructions
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    {svc.preparation}
                  </p>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-900 dark:text-white tabular-nums">
                  Fee: BDT {svc.priceDemo.toLocaleString()}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setInqSubject(`Diagnostic Inquiry: ${svc.name}`);
                    document.getElementById('diagnostic-inquiry-form')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="font-semibold text-teal-700 dark:text-teal-400 hover:underline"
                >
                  Inquire
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Diagnostic Inquiry Form */}
      <section
        id="diagnostic-inquiry-form"
        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 md:p-8 max-w-3xl"
      >
        <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
          Diagnostic Preparation & Scheduling Inquiry
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6">
          Ask about test preparation, contrast safety screening, or report turnaround times.
        </p>

        {inqDone ? (
          <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 p-5 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="space-y-1 text-sm">
              <p className="font-semibold text-emerald-900 dark:text-emerald-200">
                Diagnostic Inquiry Received
              </p>
              <p className="text-emerald-800 dark:text-emerald-300">
                Your inquiry has been logged for review. Thank you.
              </p>
              <button
                type="button"
                onClick={() => setInqDone(false)}
                className="text-xs font-semibold underline mt-2"
              >
                Send another inquiry
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleInquiry} className="space-y-4">
            {inqError && (
              <p role="alert" className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                {inqError}
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="diag-name" className="block text-xs font-medium mb-1">
                  Full Name *
                </label>
                <input
                  id="diag-name"
                  type="text"
                  required
                  value={inqName}
                  onChange={(e) => setInqName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label htmlFor="diag-phone" className="block text-xs font-medium mb-1">
                  Phone Number *
                </label>
                <input
                  id="diag-phone"
                  type="tel"
                  required
                  value={inqPhone}
                  onChange={(e) => setInqPhone(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="diag-email" className="block text-xs font-medium mb-1">
                  Email Address *
                </label>
                <input
                  id="diag-email"
                  type="email"
                  required
                  value={inqEmail}
                  onChange={(e) => setInqEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label htmlFor="diag-subject" className="block text-xs font-medium mb-1">
                  Test / Subject
                </label>
                <input
                  id="diag-subject"
                  type="text"
                  value={inqSubject}
                  onChange={(e) => setInqSubject(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div>
              <label htmlFor="diag-msg" className="block text-xs font-medium mb-1">
                Inquiry Details *
              </label>
              <textarea
                id="diag-msg"
                rows={3}
                required
                value={inqMessage}
                onChange={(e) => setInqMessage(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={inqSubmitting}
              className="px-5 py-2.5 rounded-xl bg-[#0F2942] dark:bg-teal-600 text-white text-sm font-semibold disabled:opacity-50"
            >
              {inqSubmitting ? 'Submitting...' : 'Submit Diagnostic Inquiry'}
            </button>
          </form>
        )}
      </section>
    </div>
  );
};
