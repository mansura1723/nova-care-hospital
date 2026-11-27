import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, MapPin, PhoneCall } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { submitInquiry } from '../services/hospitalService';
import { isValidEmail, isValidPhone } from '../utils/hospitalLogic';
import { Breadcrumb } from '../components/Breadcrumb';
import { PageMeta } from '../components/PageMeta';

export const EmergencyPage: React.FC = () => {
  const { settings, user } = useApp();
  const [name, setName] = useState(user?.displayName || '');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [pickupLocation, setPickupLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleAmbulanceInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (name.trim().length < 2) {
      setError('Please enter contact name.');
      return;
    }
    if (!isValidPhone(phone)) {
      setError('Please enter a valid contact phone number.');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (pickupLocation.trim().length < 4) {
      setError('Please enter pickup area or transfer details.');
      return;
    }
    setSubmitting(true);
    try {
      await submitInquiry(
        {
          type: 'ambulance',
          name,
          phone,
          email,
          subject: `Ambulance Inquiry (Non-Emergency / Transfer): ${pickupLocation}`,
          message: notes || `Requested ambulance inquiry from ${pickupLocation}`,
        },
        user
      );
      setSubmitted(true);
      setPickupLocation('');
      setNotes('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to submit inquiry.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <PageMeta
        title="24/7 Emergency Services"
        description="Emergency triage information, configurable emergency contact desk, hospital campus directions, and ambulance transfer inquiry."
      />
      <Breadcrumb items={[{ label: 'Emergency Services' }]} />

      {/* Critical Medical Disclaimer Banner */}
      <div
        role="alert"
        className="rounded-2xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 p-6 flex items-start gap-4"
      >
        <AlertTriangle className="w-6 h-6 text-rose-700 dark:text-rose-400 shrink-0 mt-0.5" aria-hidden="true" />
        <div className="space-y-1.5">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-rose-950 dark:text-rose-100">
            24/7 Emergency & Acute Triage Services
          </h1>
          <p className="text-sm text-rose-900 dark:text-rose-200 leading-relaxed">
            {settings.emergencyNotice}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-6 space-y-6">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-3">
            <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400">
              <PhoneCall className="w-5 h-5" aria-hidden="true" />
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                Emergency Contact Desk (Admin Configurable)
              </h2>
            </div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {settings.emergencyContactLabel}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Notice: Hospital emergency contact details can be updated by your administrator in Admin Console &gt; Website Settings.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-3">
            <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400">
              <MapPin className="w-5 h-5" aria-hidden="true" />
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                Emergency Entrance & Directions
              </h2>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">{settings.address}</p>
            <ul className="text-sm text-slate-600 dark:text-slate-400 list-disc pl-5 space-y-1.5">
              <li>Dedicated Ambulance Ramp at Block A East Gate (Ground Level).</li>
              <li>Immediate nurse triage, point-of-care ECG, and acute resuscitation bay access.</li>
              <li>Direct elevator corridor to CT/MRI Imaging, Cath Lab, and Critical Care ICU.</li>
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-3">
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Emergency FAQs
            </h2>
            <details className="text-sm border-t border-slate-100 dark:border-slate-800 pt-2">
              <summary className="cursor-pointer font-medium text-slate-900 dark:text-white">
                What symptoms require immediate emergency care?
              </summary>
              <p className="text-slate-600 dark:text-slate-400 mt-1.5">
                Chest pain or pressure, sudden breathing difficulty, facial droop or arm weakness, severe trauma, uncontrolled bleeding, seizures, or sudden loss of consciousness.
              </p>
            </details>
            <details className="text-sm border-t border-slate-100 dark:border-slate-800 pt-2">
              <summary className="cursor-pointer font-medium text-slate-900 dark:text-white">
                Should I submit a web form during a life-threatening emergency?
              </summary>
              <p className="text-slate-600 dark:text-slate-400 mt-1.5">
                No. Do not wait for an online form reply during an emergency—seek immediate in-person emergency care or call local emergency responders.
              </p>
            </details>
          </div>
        </div>

        {/* Ambulance Transfer Inquiry Form */}
        <div className="lg:col-span-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 md:p-8 space-y-5">
            <div>
              <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                Ambulance & Patient Transfer Inquiry
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                For planned inter-facility transfers or non-critical transport inquiries. Not for immediate life-threatening emergencies.
              </p>
            </div>

            {submitted ? (
              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-5 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0" aria-hidden="true" />
                <div className="text-sm space-y-1">
                  <p className="font-semibold text-emerald-900 dark:text-emerald-200">
                    Transport Inquiry Logged
                  </p>
                  <p className="text-emerald-800 dark:text-emerald-300">
                    Your transport inquiry has been saved for desk review.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="text-xs underline font-semibold mt-1"
                  >
                    Submit another inquiry
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleAmbulanceInquiry} className="space-y-4">
                {error && (
                  <p role="alert" className="text-xs font-medium text-rose-600 dark:text-rose-400">
                    {error}
                  </p>
                )}
                <div>
                  <label htmlFor="amb-name" className="block text-xs font-medium mb-1">
                    Requester Name *
                  </label>
                  <input
                    id="amb-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="amb-phone" className="block text-xs font-medium mb-1">
                      Phone Number *
                    </label>
                    <input
                      id="amb-phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="amb-email" className="block text-xs font-medium mb-1">
                      Email Address *
                    </label>
                    <input
                      id="amb-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="amb-loc" className="block text-xs font-medium mb-1">
                    Pickup Area / Transfer Facility *
                  </label>
                  <input
                    id="amb-loc"
                    type="text"
                    required
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="amb-notes" className="block text-xs font-medium mb-1">
                    Support Requirements (e.g., Wheelchair, Oxygen, ICU Monitor)
                  </label>
                  <textarea
                    id="amb-notes"
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-sm font-semibold disabled:opacity-50"
                >
                  {submitting ? 'Submitting Inquiry...' : 'Submit Ambulance Inquiry'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
