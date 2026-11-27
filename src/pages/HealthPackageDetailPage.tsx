import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { submitPackageBooking } from '../services/hospitalService';
import { isValidEmail, isValidPhone } from '../utils/hospitalLogic';
import { Breadcrumb } from '../components/Breadcrumb';
import { PageMeta } from '../components/PageMeta';
import type { PackageBooking } from '../types/hospital';

export const HealthPackageDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { packages, user } = useApp();
  const pkg = packages.find((p) => p.slug === slug);

  const [patientName, setPatientName] = useState(user?.displayName || '');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [preferredDate, setPreferredDate] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState<PackageBooking | null>(null);

  if (!pkg) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="font-display text-2xl font-bold">Health Package Not Found</h1>
        <Link
          to="/health-packages"
          className="inline-block px-4 py-2 rounded-lg bg-[#0F2942] text-white text-sm"
        >
          Back to Health Packages
        </Link>
      </div>
    );
  }

  const today = new Date().toISOString().slice(0, 10);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (patientName.trim().length < 2) {
      setError('Please enter patient full name.');
      return;
    }
    if (!isValidPhone(phone)) {
      setError('Please enter a valid phone number.');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!preferredDate || preferredDate < today) {
      setError('Please choose today or a future preferred date.');
      return;
    }
    setSubmitting(true);
    try {
      const booking = await submitPackageBooking(
        { pkg, patientName, phone, email, preferredDate },
        user
      );
      setConfirmed(booking);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to submit booking request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <PageMeta
        title={pkg.name}
        description={`${pkg.name} — ${pkg.description} Package price: BDT ${pkg.priceDemo.toLocaleString()}.`}
      />
      <Breadcrumb
        items={[
          { label: 'Health Packages', to: '/health-packages' },
          { label: pkg.name },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 aspect-[16/10]">
            <img
              src={pkg.imageUrl}
              alt={pkg.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold text-teal-700 dark:text-teal-400">
              {pkg.category} · Target Audience: {pkg.targetAudience}
            </p>
            <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">
              {pkg.name}
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              {pkg.description}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Included Screening Tests ({pkg.includedTests.length})
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-sm text-slate-700 dark:text-slate-300">
              {pkg.includedTests.map((testName) => (
                <li key={testName} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{testName}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-2">
            <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
              Preparation Instructions
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {pkg.preparation}
            </p>
          </div>
        </div>

        {/* Request Booking Card */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5">
            <div className="pb-4 border-b border-slate-200 dark:border-slate-800 flex items-baseline justify-between">
              <span className="text-xs font-medium text-slate-500">Package Price</span>
              <span className="font-display text-2xl font-bold text-[#0F2942] dark:text-white tabular-nums">
                BDT {pkg.priceDemo.toLocaleString()}
              </span>
            </div>

            {confirmed ? (
              <div className="space-y-4">
                <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-4 space-y-2">
                  <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
                    Package Request Submitted
                  </p>
                  <p className="text-xs font-mono text-emerald-800 dark:text-emerald-300">
                    Reference: {confirmed.referenceNumber}
                  </p>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300">
                    Preferred Date: {confirmed.preferredDate}
                  </p>
                </div>
                <Link
                  to="/patient-portal"
                  className="block text-center w-full py-2.5 rounded-xl bg-[#0F2942] dark:bg-teal-600 text-white text-sm font-semibold"
                >
                  View in Patient Portal
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                  Request Package Booking
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Submitting creates a preventive health package checkup request for scheduling coordination.
                </p>
                {error && (
                  <p role="alert" className="text-xs font-medium text-rose-600 dark:text-rose-400">
                    {error}
                  </p>
                )}
                <div>
                  <label htmlFor="pkg-patient" className="block text-xs font-medium mb-1">
                    Patient Full Name *
                  </label>
                  <input
                    id="pkg-patient"
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="pkg-phone" className="block text-xs font-medium mb-1">
                    Phone Number *
                  </label>
                  <input
                    id="pkg-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="pkg-email" className="block text-xs font-medium mb-1">
                    Email Address *
                  </label>
                  <input
                    id="pkg-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="pkg-date" className="block text-xs font-medium mb-1">
                    Preferred Checkup Date *
                  </label>
                  <input
                    id="pkg-date"
                    type="date"
                    min={today}
                    required
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 rounded-xl bg-[#0F2942] dark:bg-teal-600 text-white text-sm font-semibold disabled:opacity-50"
                >
                  {submitting ? 'Submitting Request...' : 'Request Package Booking'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
