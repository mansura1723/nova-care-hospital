import React, { useState } from 'react';
import { CheckCircle2, Mail, MapPin, Phone } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { submitFeedback, submitInquiry } from '../services/hospitalService';
import { isValidEmail, isValidPhone } from '../utils/hospitalLogic';
import { Breadcrumb } from '../components/Breadcrumb';
import { PageMeta } from '../components/PageMeta';

export const ContactPage: React.FC = () => {
  const { settings, departments, user } = useApp();

  const [name, setName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const [fbName, setFbName] = useState(user?.displayName || '');
  const [fbDept, setFbDept] = useState('Cardiology');
  const [fbRating, setFbRating] = useState(5);
  const [fbComment, setFbComment] = useState('');
  const [fbSent, setFbSent] = useState(false);
  const [fbError, setFbError] = useState('');

  const handleContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (name.trim().length < 2) {
      setError('Please enter your name.');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid email.');
      return;
    }
    if (!isValidPhone(phone)) {
      setError('Please enter a valid phone number.');
      return;
    }
    if (subject.trim().length < 2 || message.trim().length < 5) {
      setError('Please provide a subject and message.');
      return;
    }
    setSubmitting(true);
    try {
      await submitInquiry(
        { type: 'general', name, email, phone, subject, message },
        user
      );
      setSent(true);
      setSubject('');
      setMessage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send message.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setFbError('');
    if (fbName.trim().length < 2 || fbComment.trim().length < 5) {
      setFbError('Please enter your name and at least 5 characters of feedback.');
      return;
    }
    try {
      await submitFeedback(
        {
          patientName: fbName,
          departmentName: fbDept,
          rating: fbRating,
          comment: fbComment,
        },
        user
      );
      setFbSent(true);
      setFbComment('');
    } catch (err) {
      setFbError(err instanceof Error ? err.message : 'Unable to submit feedback.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <PageMeta
        title="Contact & Campus Location"
        description="Contact Nova Care Hospital, browse department extensions, submit inquiries or patient feedback, and view campus directions."
      />
      <Breadcrumb items={[{ label: 'Contact & Location' }]} />

      <div className="space-y-2 max-w-3xl">
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">
          Contact & Hospital Campus Directory
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Reach our helpdesk, browse department directory extensions, or share patient experience feedback.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Contact Details + Map */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 text-sm">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Campus Address</p>
                <p className="text-slate-600 dark:text-slate-400 mt-0.5">{settings.address}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Helpdesk & Emergency</p>
                <p className="text-slate-600 dark:text-slate-400 mt-0.5">{settings.generalPhoneLabel}</p>
                <p className="text-rose-700 dark:text-rose-400 text-xs mt-1 font-medium">
                  {settings.emergencyContactLabel}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Email</p>
                <p className="text-slate-600 dark:text-slate-400 mt-0.5">{settings.contactEmail}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-3">
            <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
              Department Contact Extensions
            </h2>
            <ul className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {[
                { name: 'Appointments & OPD Desk', ext: 'Ext. 101 · Atrium Ground' },
                { name: 'Diagnostic & Lab Reception', ext: 'Ext. 204 · Wing B Level 1' },
                { name: 'Health Checkup Lounge', ext: 'Ext. 310 · Wing C Level 2' },
                { name: 'International Patient Support', ext: 'Ext. 415 · Atrium Level 1' },
              ].map((row) => (
                <li key={row.name} className="py-2.5 flex items-center justify-between">
                  <span className="font-medium text-slate-800 dark:text-slate-200">{row.name}</span>
                  <span className="font-mono text-slate-500">{row.ext}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Form & Patient Feedback */}
        <div className="lg:col-span-7 space-y-8">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 md:p-8 space-y-4">
            <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
              Send a General Inquiry
            </h2>
            {sent ? (
              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-4 flex items-center gap-3 text-sm text-emerald-900 dark:text-emerald-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" aria-hidden="true" />
                <span>Your message has been logged for our team.</span>
              </div>
            ) : (
              <form onSubmit={handleContact} className="space-y-4">
                {error && <p role="alert" className="text-xs text-rose-600 font-medium">{error}</p>}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="cnt-name" className="block text-xs font-medium mb-1">Full Name *</label>
                    <input
                      id="cnt-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="cnt-phone" className="block text-xs font-medium mb-1">Phone *</label>
                    <input
                      id="cnt-phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="cnt-email" className="block text-xs font-medium mb-1">Email *</label>
                    <input
                      id="cnt-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="cnt-subj" className="block text-xs font-medium mb-1">Subject *</label>
                    <input
                      id="cnt-subj"
                      type="text"
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="cnt-msg" className="block text-xs font-medium mb-1">Message *</label>
                  <textarea
                    id="cnt-msg"
                    rows={3}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-[#0F2942] dark:bg-teal-600 text-white text-sm font-semibold disabled:opacity-50"
                >
                  {submitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 md:p-8 space-y-4">
            <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
              Patient Experience Feedback
            </h2>
            {fbSent ? (
              <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">
                Thank you for sharing your feedback.
              </p>
            ) : (
              <form onSubmit={handleFeedback} className="space-y-4">
                {fbError && <p role="alert" className="text-xs text-rose-600 font-medium">{fbError}</p>}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="fb-name" className="block text-xs font-medium mb-1">Your Name *</label>
                    <input
                      id="fb-name"
                      type="text"
                      required
                      value={fbName}
                      onChange={(e) => setFbName(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="fb-dept" className="block text-xs font-medium mb-1">Department</label>
                    <select
                      id="fb-dept"
                      value={fbDept}
                      onChange={(e) => setFbDept(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
                    >
                      {departments.map((d) => (
                        <option key={d.id} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="fb-rating" className="block text-xs font-medium mb-1">Rating (1–5)</label>
                    <select
                      id="fb-rating"
                      value={fbRating}
                      onChange={(e) => setFbRating(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
                    >
                      {[5, 4, 3, 2, 1].map((n) => (
                        <option key={n} value={n}>{n} / 5</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="fb-comment" className="block text-xs font-medium mb-1">Feedback Comment *</label>
                  <textarea
                    id="fb-comment"
                    rows={2}
                    required
                    value={fbComment}
                    onChange={(e) => setFbComment(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Submit Feedback
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
