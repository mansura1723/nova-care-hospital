import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CalendarCheck, CheckCircle2, Info, ShieldCheck } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import {
  isSlotAvailableInCloud,
  submitAppointmentRequest,
} from '../services/hospitalService';
import { validateAppointmentForm } from '../utils/hospitalLogic';
import { Breadcrumb } from '../components/Breadcrumb';
import { PageMeta } from '../components/PageMeta';
import type { AppointmentRequest } from '../types/hospital';

export const BookAppointmentPage: React.FC = () => {
  const { doctors, departments, user, signInWithGoogle } = useApp();
  const [searchParams] = useSearchParams();

  const initialDoctorId = searchParams.get('doctor') || '';
  const initialDeptId =
    searchParams.get('department') ||
    doctors.find((d) => d.id === initialDoctorId)?.departmentId ||
    departments[0]?.id ||
    'cardiology';
  const initialSlot = searchParams.get('slot') || '';

  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const today = new Date().toISOString().slice(0, 10);

  const [patientName, setPatientName] = useState(user?.displayName || '');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other' | ''>('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [departmentId, setDepartmentId] = useState(initialDeptId);
  const [doctorId, setDoctorId] = useState(initialDoctorId);
  const [preferredDate, setPreferredDate] = useState(tomorrow);
  const [timeSlot, setTimeSlot] = useState(initialSlot);
  const [consultationType, setConsultationType] = useState<'In-Person' | 'Online Video'>('In-Person');
  const [message, setMessage] = useState('');

  const [slotStatusMap, setSlotStatusMap] = useState<Record<string, boolean>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState<AppointmentRequest | null>(null);

  const deptDoctors = doctors.filter((d) => d.departmentId === departmentId);
  const availableDoctors = deptDoctors.length > 0 ? deptDoctors : doctors;
  const selectedDoctor =
    availableDoctors.find((d) => d.id === doctorId) || availableDoctors[0];
  const selectedDepartment =
    departments.find((d) => d.id === departmentId) || departments[0];

  useEffect(() => {
    if (user) {
      setPatientName((prev) => prev || user.displayName || '');
      setEmail((prev) => prev || user.email || '');
    }
  }, [user]);

  useEffect(() => {
    if (selectedDoctor && selectedDoctor.id !== doctorId) {
      setDoctorId(selectedDoctor.id);
    }
  }, [departmentId, selectedDoctor, doctorId]);

  useEffect(() => {
    let active = true;
    const checkSlots = async () => {
      if (!selectedDoctor || !preferredDate) return;
      const entries = await Promise.all(
        selectedDoctor.availableSlots.map(async (slot) => [
          slot,
          await isSlotAvailableInCloud(selectedDoctor.id, preferredDate, slot),
        ])
      );
      if (active) {
        setSlotStatusMap(Object.fromEntries(entries));
      }
    };
    void checkSlots();
    return () => {
      active = false;
    };
  }, [selectedDoctor, preferredDate, confirmed]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    const formInput = {
      patientName,
      dateOfBirth,
      gender,
      phone,
      email,
      departmentId: selectedDepartment?.id || '',
      doctorId: selectedDoctor?.id || '',
      preferredDate,
      timeSlot,
      consultationType,
      message,
    };

    const validation = validateAppointmentForm(formInput);
    setFieldErrors(validation.errors);
    if (!validation.valid || !selectedDoctor || !selectedDepartment) {
      return;
    }

    setSubmitting(true);
    try {
      const created = await submitAppointmentRequest(
        formInput,
        selectedDoctor,
        selectedDepartment,
        user
      );
      setConfirmed(created);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Unable to submit appointment request.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <PageMeta
        title="Book Appointment Request"
        description="Submit a consultation or online video appointment request at Nova Care Hospital with real-time slot validation."
      />
      <Breadcrumb items={[{ label: 'Book Appointment' }]} />

      <div className="space-y-3">
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">
          Request an Appointment
        </h1>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 p-4 flex items-start gap-3 text-xs text-slate-700 dark:text-slate-300">
          <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="leading-relaxed">
            <strong>Scheduling Notice:</strong> Submissions create a tracked appointment{' '}
            <em>request</em> subject to hospital schedule confirmation. Duplicate slot bookings for the same doctor, date, and time are blocked automatically.
          </p>
        </div>
      </div>

      {!user && (
        <div className="rounded-xl border border-teal-200 dark:border-teal-900 bg-teal-50/70 dark:bg-teal-950/30 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5 text-xs text-teal-950 dark:text-teal-200">
            <ShieldCheck className="w-4 h-4 text-teal-700 dark:text-teal-400 shrink-0 mt-0.5" aria-hidden="true" />
            <span>
              Sign in with Google to save your appointment request directly to Cloud Firestore and manage it across devices in your Patient Portal. You can also test a local session request below without signing in.
            </span>
          </div>
          <button
            type="button"
            onClick={() => void signInWithGoogle()}
            className="px-4 py-2 rounded-lg bg-[#0F2942] dark:bg-teal-600 text-white text-xs font-semibold whitespace-nowrap shrink-0"
          >
            Sign in with Google
          </button>
        </div>
      )}

      {confirmed ? (
        <section
          aria-label="Appointment request confirmation"
          className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-900 p-6 md:p-8 space-y-6"
        >
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0" aria-hidden="true" />
            <div>
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                Appointment Request Logged
              </p>
              <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
                Reference: <span className="font-mono">{confirmed.referenceNumber}</span>
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm border-y border-slate-200 dark:border-slate-800 py-5">
            <div>
              <p className="text-xs text-slate-500">Patient</p>
              <p className="font-semibold text-slate-900 dark:text-white">{confirmed.patientName}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Department & Specialist</p>
              <p className="font-semibold text-slate-900 dark:text-white">
                {confirmed.doctorName} · {confirmed.departmentName}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Preferred Date & Time Slot</p>
              <p className="font-semibold text-slate-900 dark:text-white tabular-nums">
                {confirmed.preferredDate} · {confirmed.timeSlot}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Consultation Format & Status</p>
              <p className="font-semibold text-slate-900 dark:text-white">
                {confirmed.consultationType} · Request Pending Review
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/patient-portal"
              className="px-5 py-2.5 rounded-xl bg-[#0F2942] dark:bg-teal-600 text-white text-sm font-semibold"
            >
              View Appointment History
            </Link>
            <button
              type="button"
              onClick={() => {
                setConfirmed(null);
                setTimeSlot('');
              }}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-medium text-slate-800 dark:text-slate-100"
            >
              Submit Another Request
            </button>
          </div>
        </section>
      ) : (
        <form
          onSubmit={handleSubmit}
          noValidate
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 md:p-8 space-y-6"
        >
          {submitError && (
            <div
              role="alert"
              className="rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 p-4 text-sm text-rose-800 dark:text-rose-200 font-medium"
            >
              {submitError}
            </div>
          )}

          {/* Patient Details */}
          <fieldset className="space-y-4">
            <legend className="font-display text-lg font-bold text-slate-900 dark:text-white">
              1. Patient Information
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label htmlFor="appt-name" className="block text-xs font-medium mb-1">
                  Patient Full Name *
                </label>
                <input
                  id="appt-name"
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
                />
                {fieldErrors.patientName && (
                  <p className="text-xs text-rose-600 mt-1">{fieldErrors.patientName}</p>
                )}
              </div>

              <div>
                <label htmlFor="appt-dob" className="block text-xs font-medium mb-1">
                  Date of Birth *
                </label>
                <input
                  id="appt-dob"
                  type="date"
                  max={today}
                  required
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
                />
                {fieldErrors.dateOfBirth && (
                  <p className="text-xs text-rose-600 mt-1">{fieldErrors.dateOfBirth}</p>
                )}
              </div>

              <div>
                <label htmlFor="appt-gender" className="block text-xs font-medium mb-1">
                  Gender *
                </label>
                <select
                  id="appt-gender"
                  required
                  value={gender}
                  onChange={(e) => setGender(e.target.value as 'Male' | 'Female' | 'Other')}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {fieldErrors.gender && (
                  <p className="text-xs text-rose-600 mt-1">{fieldErrors.gender}</p>
                )}
              </div>

              <div>
                <label htmlFor="appt-phone" className="block text-xs font-medium mb-1">
                  Phone Number *
                </label>
                <input
                  id="appt-phone"
                  type="tel"
                  required
                  placeholder="+880 1XXX-XXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
                />
                {fieldErrors.phone && (
                  <p className="text-xs text-rose-600 mt-1">{fieldErrors.phone}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="appt-email" className="block text-xs font-medium mb-1">
                  Email Address *
                </label>
                <input
                  id="appt-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
                />
                {fieldErrors.email && (
                  <p className="text-xs text-rose-600 mt-1">{fieldErrors.email}</p>
                )}
              </div>
            </div>
          </fieldset>

          {/* Department, Doctor & Date/Slot */}
          <fieldset className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <legend className="font-display text-lg font-bold text-slate-900 dark:text-white">
              2. Specialty, Specialist & Schedule
            </legend>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="appt-dept" className="block text-xs font-medium mb-1">
                  Medical Department *
                </label>
                <select
                  id="appt-dept"
                  value={departmentId}
                  onChange={(e) => {
                    setDepartmentId(e.target.value);
                    setTimeSlot('');
                  }}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="appt-doc" className="block text-xs font-medium mb-1">
                  Specialist *
                </label>
                <select
                  id="appt-doc"
                  value={selectedDoctor?.id || ''}
                  onChange={(e) => {
                    setDoctorId(e.target.value);
                    setTimeSlot('');
                  }}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
                >
                  {availableDoctors.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name} ({doc.departmentName})
                    </option>
                  ))}
                </select>
                {deptDoctors.length === 0 && (
                  <p className="text-[11px] text-slate-500 mt-1">
                    Showing multidisciplinary consultants supporting {selectedDepartment?.name}.
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="appt-date" className="block text-xs font-medium mb-1">
                  Preferred Date *
                </label>
                <input
                  id="appt-date"
                  type="date"
                  min={today}
                  required
                  value={preferredDate}
                  onChange={(e) => {
                    setPreferredDate(e.target.value);
                    setTimeSlot('');
                  }}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
                />
                {fieldErrors.preferredDate && (
                  <p className="text-xs text-rose-600 mt-1">{fieldErrors.preferredDate}</p>
                )}
              </div>

              <div>
                <label htmlFor="appt-type" className="block text-xs font-medium mb-1">
                  Consultation Type *
                </label>
                <select
                  id="appt-type"
                  value={consultationType}
                  onChange={(e) =>
                    setConsultationType(e.target.value as 'In-Person' | 'Online Video')
                  }
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
                >
                  <option value="In-Person">In-Person Hospital Visit</option>
                  <option value="Online Video">Online Video Consultation Request</option>
                </select>
              </div>
            </div>

            <div>
              <p className="block text-xs font-medium mb-2">
                Select Available Time Slot * ({selectedDoctor?.name})
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedDoctor?.availableSlots.map((slot) => {
                  const isAvailable = slotStatusMap[slot] !== false;
                  const isSelected = timeSlot === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => setTimeSlot(slot)}
                      className={`px-3.5 py-2 rounded-lg text-xs font-medium border transition-colors ${
                        !isAvailable
                          ? 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/50 text-slate-400 line-through cursor-not-allowed'
                          : isSelected
                            ? 'border-teal-600 bg-[#0F2942] dark:bg-teal-600 text-white'
                            : 'border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-teal-600'
                      }`}
                    >
                      {slot} {!isAvailable ? '(Reserved)' : ''}
                    </button>
                  );
                })}
              </div>
              {fieldErrors.timeSlot && (
                <p className="text-xs text-rose-600 mt-1">{fieldErrors.timeSlot}</p>
              )}
            </div>

            <div>
              <label htmlFor="appt-message" className="block text-xs font-medium mb-1">
                Additional Message / Reason for Visit (Optional)
              </label>
              <textarea
                id="appt-message"
                rows={3}
                maxLength={1000}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Briefly describe your consultation preference or prior reports to bring..."
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
              />
            </div>
          </fieldset>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Estimated consultation fee: BDT{' '}
              <span className="tabular-nums font-semibold">
                {selectedDoctor?.consultationFeeDemo.toLocaleString()}
              </span>
            </p>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0F2942] dark:bg-teal-600 text-white text-sm font-semibold hover:bg-[#163b5e] dark:hover:bg-teal-500 disabled:opacity-50"
            >
              <CalendarCheck className="w-4 h-4" aria-hidden="true" />
              {submitting ? 'Submitting Request...' : 'Submit Appointment Request'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
