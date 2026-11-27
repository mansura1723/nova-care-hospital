import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  CalendarClock,
  Check,
  Download,
  FileText,
  Info,
  LogOut,
  Package,
  RefreshCw,
  ShieldCheck,
  UserCheck,
  XCircle,
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import {
  cancelAppointment,
  fetchUserAppointments,
  fetchUserNotifications,
  fetchUserPackageBookings,
  fetchUserReports,
  markNotificationRead,
  rescheduleAppointment,
  updatePatientProfile,
} from '../services/hospitalService';
import { Breadcrumb } from '../components/Breadcrumb';
import { PageMeta } from '../components/PageMeta';
import type {
  AppointmentRequest,
  DiagnosticReport,
  PackageBooking,
  PatientNotification,
  PatientProfile,
} from '../types/hospital';

type PortalTab = 'appointments' | 'reports' | 'packages' | 'notifications' | 'profile';

const STATUS_LABELS: Record<AppointmentRequest['status'], string> = {
  pending: 'Request Pending',
  approved: 'Approved',
  reschedule_requested: 'Reschedule Requested',
  cancelled: 'Cancelled',
  rejected: 'Declined',
  completed: 'Completed',
};

export const PatientPortalPage: React.FC = () => {
  const {
    user,
    patientProfile,
    doctors,
    authReady,
    authLoading,
    authError,
    signInWithGoogle,
    logout,
    refreshProfile,
  } = useApp();

  const [tab, setTab] = useState<PortalTab>('appointments');
  const [appointments, setAppointments] = useState<AppointmentRequest[]>([]);
  const [reports, setReports] = useState<DiagnosticReport[]>([]);
  const [pkgBookings, setPkgBookings] = useState<PackageBooking[]>([]);
  const [notifications, setNotifications] = useState<PatientNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Reschedule state
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newSlot, setNewSlot] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    displayName: '',
    phone: '',
    dateOfBirth: '',
    gender: 'Prefer not to say' as PatientProfile['gender'],
    bloodGroup: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const loadPortalData = useCallback(async () => {
    setLoading(true);
    try {
      const [appts, pkgs, reps, notifs] = await Promise.all([
        fetchUserAppointments(user),
        fetchUserPackageBookings(user),
        fetchUserReports(user),
        fetchUserNotifications(user),
      ]);
      setAppointments(appts);
      setPkgBookings(pkgs);
      setReports(reps);
      setNotifications(notifs);
    } catch (err) {
      console.error('Portal load issue:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadPortalData();
  }, [loadPortalData]);

  useEffect(() => {
    if (patientProfile) {
      setProfileForm({
        displayName: patientProfile.displayName,
        phone: patientProfile.phone,
        dateOfBirth: patientProfile.dateOfBirth,
        gender: patientProfile.gender,
        bloodGroup: patientProfile.bloodGroup,
      });
    }
  }, [patientProfile]);

  const handleCancel = async (appt: AppointmentRequest) => {
    setActionError(null);
    setActionMsg(null);
    setBusyId(appt.id);
    try {
      await cancelAppointment(appt, user);
      setActionMsg(`Appointment request ${appt.referenceNumber} has been cancelled and the time slot released.`);
      await loadPortalData();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Unable to cancel appointment request.');
    } finally {
      setBusyId(null);
    }
  };

  const startReschedule = (appt: AppointmentRequest) => {
    const docObj = doctors.find((d) => d.id === appt.doctorId);
    setReschedulingId(appt.id);
    setNewDate(appt.preferredDate);
    setNewSlot(docObj?.availableSlots[0] || appt.timeSlot);
    setActionError(null);
    setActionMsg(null);
  };

  const handleRescheduleSubmit = async (appt: AppointmentRequest) => {
    if (!newDate || !newSlot) {
      setActionError('Please choose both a date and an available slot.');
      return;
    }
    setBusyId(appt.id);
    setActionError(null);
    setActionMsg(null);
    try {
      await rescheduleAppointment(appt, newDate, newSlot, user);
      setReschedulingId(null);
      setActionMsg(`Reschedule request submitted for ${appt.referenceNumber} (${newDate} · ${newSlot}).`);
      await loadPortalData();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Unable to reschedule appointment.');
    } finally {
      setBusyId(null);
    }
  };

  const handleDownloadReport = (report: DiagnosticReport) => {
    const lines = [
      'NOVA CARE HOSPITAL — PATIENT DIAGNOSTIC REPORT',
      '===============================================',
      'IMPORTANT NOTICE: THIS IS A PORTAL RECORD SUMMARY.',
      'PLEASE CONSULT A LICENSED PHYSICIAN FOR CLINICAL INTERPRETATION.',
      '',
      `Report Code : ${report.reportCode}`,
      `Test Name   : ${report.testName}`,
      `Category    : ${report.category}`,
      `Report Date : ${report.reportDate}`,
      `Status      : ${report.status}`,
      '',
      'Summary:',
      report.summary,
      '',
      'Please consult a qualified physician for actual clinical evaluation.',
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${report.reportCode}-report.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Unable to update notification.');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true);
    setActionError(null);
    setActionMsg(null);
    try {
      await updatePatientProfile(user.uid, profileForm);
      await refreshProfile();
      setActionMsg('Patient profile updated.');
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Unable to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <PageMeta
        title="Patient Portal"
        description="Manage appointment requests, view diagnostic reports, track health packages, and update patient settings."
      />
      <Breadcrumb items={[{ label: 'Patient Portal' }]} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">
            Patient Portal
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            {user
              ? `Signed in as ${patientProfile?.displayName || user.displayName || user.email}`
              : 'Manage session appointment requests or sign in with Google for Cloud Firestore sync and diagnostic reports.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/appointments/book"
            className="px-4 py-2 rounded-lg bg-[#0F2942] dark:bg-teal-600 text-white text-xs font-semibold hover:bg-[#173c61] dark:hover:bg-teal-500 transition-colors"
          >
            New Appointment Request
          </Link>
          {user && (
            <button
              type="button"
              onClick={() => void logout()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
              Sign Out
            </button>
          )}
        </div>
      </div>

      {/* Sign-In Card when signed out */}
      {authReady && !user && (
        <section
          aria-label="Patient authentication"
          className="rounded-2xl border border-teal-200 dark:border-teal-900 bg-white dark:bg-slate-900 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-teal-700 dark:text-teal-300 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
              Private Authenticated Portal
            </div>
            <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
              Sign in with Google for Full Patient Portal Access
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Authenticated patients can save appointment requests in Cloud Firestore, access private diagnostic reports, receive notifications, and manage profile settings. Local session requests remain visible below.
            </p>
            {authError && (
              <p role="alert" className="text-xs text-rose-600 dark:text-rose-400 font-medium pt-1">
                {authError}
              </p>
            )}
          </div>
          <button
            type="button"
            disabled={authLoading}
            onClick={() => void signInWithGoogle()}
            className="px-6 py-3 rounded-xl bg-[#0F2942] dark:bg-teal-600 text-white text-sm font-semibold hover:bg-[#173c61] dark:hover:bg-teal-500 whitespace-nowrap shrink-0 disabled:opacity-50"
          >
            {authLoading ? 'Signing In...' : 'Sign in with Google'}
          </button>
        </section>
      )}

      {/* Feedback alerts */}
      {actionMsg && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 p-4 text-sm text-emerald-800 dark:text-emerald-200"
        >
          {actionMsg}
        </div>
      )}
      {actionError && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 p-4 text-sm text-rose-800 dark:text-rose-200"
        >
          {actionError}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'appointments', label: `Appointment Requests (${appointments.length})`, icon: CalendarClock },
          { id: 'reports', label: `Online Reports (${reports.length})`, icon: FileText },
          { id: 'packages', label: `Health Packages (${pkgBookings.length})`, icon: Package },
          {
            id: 'notifications',
            label: `Notifications${unreadCount > 0 ? ` (${unreadCount})` : ''}`,
            icon: Bell,
          },
          { id: 'profile', label: 'Profile Settings', icon: UserCheck },
        ].map((item) => {
          const Icon = item.icon;
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id as PortalTab)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                active
                  ? 'border-teal-600 text-[#0F2942] dark:text-teal-300'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" aria-hidden="true" />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {tab === 'appointments' && (
        <section aria-label="Appointment history" className="space-y-4">
          {loading ? (
            <p className="text-sm text-slate-500">Loading appointment requests...</p>
          ) : appointments.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center space-y-3">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                No appointment requests recorded in this account or browser session yet.
              </p>
              <Link
                to="/appointments/book"
                className="inline-flex px-4 py-2 rounded-lg bg-[#0F2942] dark:bg-teal-600 text-white text-xs font-semibold"
              >
                Request an Appointment
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appt) => {
                const canModify =
                  appt.status === 'pending' ||
                  appt.status === 'approved' ||
                  appt.status === 'reschedule_requested';
                const doctorSlots =
                  doctors.find((d) => d.id === appt.doctorId)?.availableSlots || [
                    '09:30 AM',
                    '11:00 AM',
                    '03:30 PM',
                  ];

                return (
                  <article
                    key={appt.id}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-mono text-teal-700 dark:text-teal-400">
                          Ref: {appt.referenceNumber}
                          {appt.isLocalPreview ? ' · Preview Session' : ''}
                        </p>
                        <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                          {appt.doctorName} · {appt.departmentName}
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 tabular-nums">
                          {appt.preferredDate} · {appt.timeSlot} · {appt.consultationType} · Patient: {appt.patientName}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800">
                          {STATUS_LABELS[appt.status]}
                        </span>
                        {canModify && (
                          <>
                            <button
                              type="button"
                              disabled={busyId === appt.id}
                              onClick={() => startReschedule(appt)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                              <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                              Reschedule
                            </button>
                            <button
                              type="button"
                              disabled={busyId === appt.id}
                              onClick={() => void handleCancel(appt)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-rose-300 dark:border-rose-800 text-xs font-medium text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            >
                              <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
                              Cancel Request
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {reschedulingId === appt.id && (
                      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                        <div>
                          <label className="block text-xs font-medium mb-1">New Date</label>
                          <input
                            type="date"
                            min={todayStr}
                            value={newDate}
                            onChange={(e) => setNewDate(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">New Time Slot</label>
                          <select
                            value={newSlot}
                            onChange={(e) => setNewSlot(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs"
                          >
                            {doctorSlots.map((slot) => (
                              <option key={slot} value={slot}>
                                {slot}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={busyId === appt.id}
                            onClick={() => void handleRescheduleSubmit(appt)}
                            className="px-4 py-2 rounded-lg bg-[#0F2942] dark:bg-teal-600 text-white text-xs font-semibold"
                          >
                            Confirm Reschedule
                          </button>
                          <button
                            type="button"
                            onClick={() => setReschedulingId(null)}
                            className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}

      {tab === 'reports' && (
        <section aria-label="Online diagnostic reports" className="space-y-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 p-4 flex items-start gap-3 text-xs text-slate-700 dark:text-slate-300">
            <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" aria-hidden="true" />
            <p>
              <strong>Online Report Security Notice:</strong> Reports are strictly restricted to authenticated account owners and are never exposed on public URLs.
            </p>
          </div>

          {!user ? (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center">
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                Please sign in with Google to access your private diagnostic reports.
              </p>
              <button
                type="button"
                onClick={() => void signInWithGoogle()}
                className="px-5 py-2.5 rounded-xl bg-[#0F2942] dark:bg-teal-600 text-white text-xs font-semibold"
              >
                Sign in with Google
              </button>
            </div>
          ) : reports.length === 0 ? (
            <p className="text-sm text-slate-500">No diagnostic reports available yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reports.map((rep) => (
                <article
                  key={rep.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-teal-700 dark:text-teal-400">
                        {rep.reportCode}
                      </span>
                      <span className="font-semibold text-slate-700 dark:text-slate-200">
                        {rep.status} · {rep.reportDate}
                      </span>
                    </div>
                    <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                      {rep.testName}
                    </h3>
                    <p className="text-xs text-slate-500">{rep.category} · Digital Portal Record</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                      {rep.summary}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDownloadReport(rep)}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Download className="w-3.5 h-3.5" aria-hidden="true" />
                    Download Report (.txt)
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {tab === 'packages' && (
        <section aria-label="Health package bookings" className="space-y-4">
          {pkgBookings.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center space-y-3">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                No health checkup package requests recorded yet.
              </p>
              <Link
                to="/health-packages"
                className="inline-flex px-4 py-2 rounded-lg bg-[#0F2942] dark:bg-teal-600 text-white text-xs font-semibold"
              >
                Explore Health Packages
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {pkgBookings.map((pkg) => (
                <article
                  key={pkg.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <p className="text-xs font-mono text-teal-700 dark:text-teal-400">
                      {pkg.referenceNumber} {pkg.isLocalPreview ? '· Preview Session' : ''}
                    </p>
                    <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                      {pkg.packageName}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
                      Preferred Date: {pkg.preferredDate} · Patient: {pkg.patientName}
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                    {pkg.status}
                  </span>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {tab === 'notifications' && (
        <section aria-label="Notifications" className="space-y-3">
          {!user ? (
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Sign in with Google to receive appointment and report status updates.
            </p>
          ) : notifications.length === 0 ? (
            <p className="text-sm text-slate-500">No notifications yet.</p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`rounded-xl border p-4 flex items-start justify-between gap-4 ${
                  n.isRead
                    ? 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                    : 'border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-950/30'
                }`}
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{n.title}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{n.message}</p>
                </div>
                {!n.isRead && (
                  <button
                    type="button"
                    onClick={() => void handleMarkRead(n.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium shrink-0"
                  >
                    <Check className="w-3.5 h-3.5" aria-hidden="true" />
                    Mark Read
                  </button>
                )}
              </div>
            ))
          )}
        </section>
      )}

      {tab === 'profile' && (
        <section aria-label="Profile settings">
          {!user ? (
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Sign in with Google to edit your saved patient profile details.
            </p>
          ) : (
            <form
              onSubmit={handleSaveProfile}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 max-w-2xl space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="prof-name" className="block text-xs font-medium mb-1">
                    Display Name
                  </label>
                  <input
                    id="prof-name"
                    type="text"
                    required
                    value={profileForm.displayName}
                    onChange={(e) => setProfileForm({ ...profileForm, displayName: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="prof-phone" className="block text-xs font-medium mb-1">
                    Contact Phone
                  </label>
                  <input
                    id="prof-phone"
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="prof-dob" className="block text-xs font-medium mb-1">
                    Date of Birth
                  </label>
                  <input
                    id="prof-dob"
                    type="date"
                    max={todayStr}
                    value={profileForm.dateOfBirth}
                    onChange={(e) => setProfileForm({ ...profileForm, dateOfBirth: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="prof-gender" className="block text-xs font-medium mb-1">
                    Gender
                  </label>
                  <select
                    id="prof-gender"
                    value={profileForm.gender}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        gender: e.target.value as PatientProfile['gender'],
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
                  >
                    <option value="Prefer not to say">Prefer not to say</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="prof-blood" className="block text-xs font-medium mb-1">
                    Blood Group
                  </label>
                  <input
                    id="prof-blood"
                    type="text"
                    placeholder="e.g. O+"
                    maxLength={10}
                    value={profileForm.bloodGroup}
                    onChange={(e) => setProfileForm({ ...profileForm, bloodGroup: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={savingProfile}
                className="px-5 py-2.5 rounded-xl bg-[#0F2942] dark:bg-teal-600 text-white text-sm font-semibold disabled:opacity-50"
              >
                {savingProfile ? 'Saving...' : 'Save Profile Settings'}
              </button>
            </form>
          )}
        </section>
      )}
    </div>
  );
};
