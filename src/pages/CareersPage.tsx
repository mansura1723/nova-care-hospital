import React, { useEffect, useState } from 'react';
import { Briefcase, CheckCircle2, Upload } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import {
  fetchUserJobApplications,
  submitJobApplication,
} from '../services/hospitalService';
import { isValidEmail, isValidPhone } from '../utils/hospitalLogic';
import { Breadcrumb } from '../components/Breadcrumb';
import { PageMeta } from '../components/PageMeta';
import type { JobApplication, JobListing } from '../types/hospital';

export const CareersPage: React.FC = () => {
  const { jobs, user } = useApp();
  const [selectedJob, setSelectedJob] = useState<JobListing>(jobs[0]);
  const [applications, setApplications] = useState<JobApplication[]>([]);

  const [applicantName, setApplicantName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [cvFileName, setCvFileName] = useState('');
  const [coverNote, setCoverNote] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<JobApplication | null>(null);

  useEffect(() => {
    void fetchUserJobApplications(user).then(setApplications).catch(() => {});
  }, [user, submitted]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCvFileName(file.name);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (applicantName.trim().length < 2) {
      setError('Please enter your full name.');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!isValidPhone(phone)) {
      setError('Please enter a valid phone number.');
      return;
    }
    if (!cvFileName) {
      setError('Please select a CV/resume file (PDF or DOCX) to attach.');
      return;
    }
    setSubmitting(true);
    try {
      const app = await submitJobApplication(
        {
          job: selectedJob,
          applicantName,
          email,
          phone,
          cvFileName,
          coverNote,
        },
        user
      );
      setSubmitted(app);
      setCoverNote('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <PageMeta
        title="Careers"
        description="Explore open clinical, nursing, allied health, and administrative career opportunities at Nova Care Hospital."
      />
      <Breadcrumb items={[{ label: 'Careers' }]} />

      <div className="space-y-2 max-w-3xl">
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">
          Hospital Careers & Talent Portal
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
          Review clinical, nursing, radiology, pharmacy, and administrative roles and submit a career application online.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Job Listings */}
        <div className="lg:col-span-6 space-y-4">
          <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
            Open Positions ({jobs.filter((j) => j.isOpen).length})
          </h2>
          {jobs
            .filter((j) => j.isOpen)
            .map((job) => {
              const active = selectedJob?.id === job.id;
              return (
                <article
                  key={job.id}
                  className={`rounded-xl border p-5 transition-colors ${
                    active
                      ? 'border-teal-600 bg-teal-50/40 dark:bg-teal-950/20'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                  }`}
                >
                  <p className="text-xs text-teal-700 dark:text-teal-400 font-medium">
                    {job.department} · {job.employmentType}
                  </p>
                  <h3 className="font-display text-base font-bold text-slate-900 dark:text-white mt-1">
                    {job.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {job.location}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-2.5 leading-relaxed">
                    {job.description}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedJob(job);
                      setSubmitted(null);
                    }}
                    className="mt-3 px-3.5 py-1.5 rounded-lg bg-[#0F2942] dark:bg-teal-600 text-white text-xs font-medium"
                  >
                    {active ? 'Selected for Application' : 'Apply for This Role'}
                  </button>
                </article>
              );
            })}
        </div>

        {/* Application Form + Status */}
        <div className="lg:col-span-6 space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
            <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400">
              <Briefcase className="w-5 h-5" aria-hidden="true" />
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                Apply: {selectedJob?.title}
              </h2>
            </div>

            {submitted ? (
              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-5 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" aria-hidden="true" />
                <div className="text-sm space-y-1">
                  <p className="font-semibold text-emerald-900 dark:text-emerald-200">
                    Application Received
                  </p>
                  <p className="text-emerald-800 dark:text-emerald-300">
                    Role: {submitted.jobTitle} · CV: {submitted.cvFileName} · Status: {submitted.status}
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitted(null)}
                    className="text-xs underline font-semibold mt-1"
                  >
                    Submit another application
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleApply} className="space-y-4">
                {error && (
                  <p role="alert" className="text-xs font-medium text-rose-600">
                    {error}
                  </p>
                )}
                <div>
                  <label htmlFor="job-name" className="block text-xs font-medium mb-1">
                    Full Name *
                  </label>
                  <input
                    id="job-name"
                    type="text"
                    required
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="job-email" className="block text-xs font-medium mb-1">
                      Email Address *
                    </label>
                    <input
                      id="job-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="job-phone" className="block text-xs font-medium mb-1">
                      Phone Number *
                    </label>
                    <input
                      id="job-phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="job-cv" className="block text-xs font-medium mb-1">
                    Upload CV / Resume (PDF/DOCX metadata stored) *
                  </label>
                  <label
                    htmlFor="job-cv"
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 cursor-pointer text-xs text-slate-600 dark:text-slate-300"
                  >
                    <span className="truncate">{cvFileName || 'Choose CV file...'}</span>
                    <Upload className="w-4 h-4 text-teal-600 shrink-0" aria-hidden="true" />
                    <input
                      id="job-cv"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                  </label>
                </div>
                <div>
                  <label htmlFor="job-note" className="block text-xs font-medium mb-1">
                    Cover Note (Optional)
                  </label>
                  <textarea
                    id="job-note"
                    rows={3}
                    value={coverNote}
                    onChange={(e) => setCoverNote(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 rounded-xl bg-[#0F2942] dark:bg-teal-600 text-white text-sm font-semibold disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Career Application'}
                </button>
              </form>
            )}
          </div>

          {applications.length > 0 && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-3">
              <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                Your Application Status
              </h3>
              <ul className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                {applications.map((app) => (
                  <li key={app.id} className="py-2.5 flex items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{app.jobTitle}</p>
                      <p className="text-slate-500">CV: {app.cvFileName}</p>
                    </div>
                    <span className="font-mono font-medium text-teal-700 dark:text-teal-400">
                      {app.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
