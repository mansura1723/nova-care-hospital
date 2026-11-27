import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  CalendarCheck2,
  Database,
  FileSpreadsheet,
  HeartPulse,
  Lock,
  LogOut,
  MessageSquare,
  Plus,
  Settings,
  ShieldAlert,
  Stethoscope,
  Trash2,
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import {
  adminDeleteArticle,
  adminDeleteDepartment,
  adminDeleteDoctor,
  adminSaveArticle,
  adminSaveDepartment,
  adminSaveDoctor,
  adminSaveHealthPackage,
  adminSaveWebsiteSettings,
  adminUpdateAppointmentStatus,
  adminUpdateInquiryStatus,
  fetchAdminOverviewData,
  seedCatalogToFirestore,
} from '../services/hospitalService';
import { Breadcrumb } from '../components/Breadcrumb';
import { PageMeta } from '../components/PageMeta';
import type {
  AppointmentRequest,
  AppointmentStatus,
  Article,
  BodyRegion,
  Department,
  Doctor,
  HealthPackage,
  Inquiry,
  PatientFeedback,
  PatientProfile,
  WebsiteSettings,
} from '../types/hospital';

type AdminTab =
  | 'overview'
  | 'doctors'
  | 'departments'
  | 'appointments'
  | 'packages'
  | 'articles'
  | 'inquiries'
  | 'settings';

export const AdminDashboardPage: React.FC = () => {
  const {
    user,
    isAdmin,
    authReady,
    authLoading,
    authError,
    signInWithGoogle,
    logout,
    doctors,
    departments,
    packages,
    articles,
    settings,
    refreshCatalogs,
  } = useApp();

  const [tab, setTab] = useState<AdminTab>('overview');
  const [appointments, setAppointments] = useState<AppointmentRequest[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [feedback, setFeedback] = useState<PatientFeedback[]>([]);
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [loadingAdminData, setLoadingAdminData] = useState(false);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

  // Filters
  const [apptFilter, setApptFilter] = useState<'all' | AppointmentStatus>('all');
  const [docQuery, setDocQuery] = useState('');

  // Editable Forms
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [editingPkg, setEditingPkg] = useState<HealthPackage | null>(null);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [settingsForm, setSettingsForm] = useState<WebsiteSettings>(settings);

  useEffect(() => {
    setSettingsForm(settings);
  }, [settings]);

  const loadAdminRecords = useCallback(async () => {
    if (!isAdmin) return;
    setLoadingAdminData(true);
    try {
      const res = await fetchAdminOverviewData();
      setAppointments(res.appointments);
      setInquiries(res.inquiries);
      setFeedback(res.feedback);
      setPatients(res.users);
    } catch (err) {
      setErrorBanner(err instanceof Error ? err.message : 'Unable to load admin records.');
    } finally {
      setLoadingAdminData(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      void loadAdminRecords();
    }
  }, [isAdmin, loadAdminRecords]);

  const handleSeedFirestore = async () => {
    setSeeding(true);
    setStatusBanner(null);
    setErrorBanner(null);
    try {
      await seedCatalogToFirestore();
      await refreshCatalogs();
      setStatusBanner('All doctors, 30 departments, packages, diagnostics, articles, and settings seeded to Cloud Firestore.');
    } catch (err) {
      setErrorBanner(err instanceof Error ? err.message : 'Failed to seed catalog.');
    } finally {
      setSeeding(false);
    }
  };

  // Doctor CRUD
  const handleSaveDoctorForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoctor) return;
    setErrorBanner(null);
    try {
      const dept = departments.find((d) => d.id === editingDoctor.departmentId);
      await adminSaveDoctor({
        ...editingDoctor,
        departmentName: dept?.name || editingDoctor.departmentName,
      });
      await refreshCatalogs();
      setEditingDoctor(null);
      setStatusBanner(`Saved specialist profile: ${editingDoctor.name}`);
    } catch (err) {
      setErrorBanner(err instanceof Error ? err.message : 'Unable to save doctor.');
    }
  };

  const handleDeleteDoctor = async (id: string) => {
    try {
      await adminDeleteDoctor(id);
      await refreshCatalogs();
      setStatusBanner('Doctor profile removed.');
    } catch (err) {
      setErrorBanner(err instanceof Error ? err.message : 'Unable to delete doctor.');
    }
  };

  // Department CRUD
  const handleSaveDeptForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDept) return;
    try {
      await adminSaveDepartment(editingDept);
      await refreshCatalogs();
      setEditingDept(null);
      setStatusBanner(`Saved department: ${editingDept.name}`);
    } catch (err) {
      setErrorBanner(err instanceof Error ? err.message : 'Unable to save department.');
    }
  };

  const handleDeleteDept = async (id: string) => {
    try {
      await adminDeleteDepartment(id);
      await refreshCatalogs();
      setStatusBanner('Department removed.');
    } catch (err) {
      setErrorBanner(err instanceof Error ? err.message : 'Unable to delete department.');
    }
  };

  // Package CRUD
  const handleSavePkgForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPkg) return;
    try {
      await adminSaveHealthPackage(editingPkg);
      await refreshCatalogs();
      setEditingPkg(null);
      setStatusBanner(`Saved health package: ${editingPkg.name}`);
    } catch (err) {
      setErrorBanner(err instanceof Error ? err.message : 'Unable to save health package.');
    }
  };

  // Article CRUD
  const handleSaveArticleForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle) return;
    try {
      await adminSaveArticle(editingArticle);
      await refreshCatalogs();
      setEditingArticle(null);
      setStatusBanner(`Saved content item: ${editingArticle.title}`);
    } catch (err) {
      setErrorBanner(err instanceof Error ? err.message : 'Unable to save article.');
    }
  };

  const handleDeleteArticle = async (id: string) => {
    try {
      await adminDeleteArticle(id);
      await refreshCatalogs();
      setStatusBanner('Content item deleted.');
    } catch (err) {
      setErrorBanner(err instanceof Error ? err.message : 'Unable to delete article.');
    }
  };

  // Appointment & Inquiry status updates
  const handleUpdateApptStatus = async (appt: AppointmentRequest, status: AppointmentStatus) => {
    try {
      await adminUpdateAppointmentStatus(appt, status);
      await loadAdminRecords();
      setStatusBanner(`Appointment ${appt.referenceNumber} updated to "${status}".`);
    } catch (err) {
      setErrorBanner(err instanceof Error ? err.message : 'Unable to update appointment status.');
    }
  };

  const handleUpdateInqStatus = async (inq: Inquiry, status: Inquiry['status']) => {
    try {
      await adminUpdateInquiryStatus(inq, status);
      await loadAdminRecords();
      setStatusBanner(`Inquiry updated to "${status}".`);
    } catch (err) {
      setErrorBanner(err instanceof Error ? err.message : 'Unable to update inquiry.');
    }
  };

  // Settings save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminSaveWebsiteSettings(settingsForm);
      await refreshCatalogs();
      setStatusBanner('Hospital website settings updated in Cloud Firestore.');
    } catch (err) {
      setErrorBanner(err instanceof Error ? err.message : 'Unable to update settings.');
    }
  };

  // Auth / Role Gates
  if (!authReady) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-sm text-slate-500">
        Verifying administrator credentials...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 space-y-6">
        <PageMeta title="Admin Console Sign In" description="Authorized Hospital Administration Portal." />
        <Breadcrumb items={[{ label: 'Admin Console' }]} />
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 space-y-4">
          <div className="flex items-center gap-3 text-[#0F2942] dark:text-teal-300">
            <Lock className="w-6 h-6" aria-hidden="true" />
            <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
              Hospital Admin Console
            </h1>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            This management dashboard is separated from the Patient Portal and protected by Firebase Authentication and Cloud Firestore security rules. Sign in with an authorized administrator Google account to manage doctors, departments, appointments, packages, articles, and settings.
          </p>
          {authError && (
            <p role="alert" className="text-xs text-rose-600 font-medium">
              {authError}
            </p>
          )}
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              disabled={authLoading}
              onClick={() => void signInWithGoogle()}
              className="px-5 py-2.5 rounded-xl bg-[#0F2942] dark:bg-teal-600 text-white text-sm font-semibold disabled:opacity-50"
            >
              {authLoading ? 'Signing In...' : 'Admin Sign In with Google'}
            </button>
            <Link
              to="/patient-portal"
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Go to Patient Portal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 space-y-6">
        <PageMeta title="Admin Access Restricted" description="Administrator privileges required." />
        <Breadcrumb items={[{ label: 'Admin Console' }]} />
        <div className="rounded-2xl border border-rose-200 dark:border-rose-900 bg-white dark:bg-slate-900 p-8 space-y-4">
          <div className="flex items-center gap-3 text-rose-700 dark:text-rose-400">
            <ShieldAlert className="w-6 h-6" aria-hidden="true" />
            <h1 className="font-display text-xl font-bold text-slate-900 dark:text-white">
              Administrator Access Required
            </h1>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            You are currently signed in as <span className="font-mono">{user.email}</span>, which does not hold verified administrator permissions in Cloud Firestore.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              to="/patient-portal"
              className="px-4 py-2 rounded-lg bg-[#0F2942] dark:bg-teal-600 text-white text-xs font-semibold"
            >
              Return to Patient Portal
            </Link>
            <button
              type="button"
              onClick={() => void logout()}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium"
            >
              Sign Out & Switch Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  const pendingAppts = appointments.filter((a) => a.status === 'pending' || a.status === 'reschedule_requested');
  const filteredAppts =
    apptFilter === 'all' ? appointments : appointments.filter((a) => a.status === apptFilter);
  const filteredDocs = doctors.filter(
    (d) =>
      !docQuery.trim() ||
      d.name.toLowerCase().includes(docQuery.toLowerCase()) ||
      d.departmentName.toLowerCase().includes(docQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <PageMeta
        title="Admin Dashboard"
        description="Nova Care Hospital operations console for managing specialists, departments, appointments, packages, and settings."
      />
      <Breadcrumb items={[{ label: 'Admin Dashboard' }]} />

      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">
            Nova Care Admin Console
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            Authenticated administrator: <span className="font-mono">{user.email}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={seeding}
            onClick={() => void handleSeedFirestore()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-700 text-white text-xs font-semibold hover:bg-teal-600 disabled:opacity-50"
          >
            <Database className="w-3.5 h-3.5" aria-hidden="true" />
            {seeding ? 'Seeding Catalog...' : 'Seed Catalog to Firestore'}
          </button>
          <button
            type="button"
            onClick={() => void logout()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200"
          >
            <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
            Sign Out
          </button>
        </div>
      </div>

      {statusBanner && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 p-4 text-sm text-emerald-800 dark:text-emerald-200"
        >
          {statusBanner}
        </div>
      )}
      {errorBanner && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 p-4 text-sm text-rose-800 dark:text-rose-200"
        >
          {errorBanner}
        </div>
      )}

      {/* KPI Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Doctors', value: doctors.length },
          { label: 'Departments', value: departments.length },
          { label: 'Appointments', value: appointments.length },
          { label: 'Pending Review', value: pendingAppts.length },
          { label: 'Health Packages', value: packages.length },
          { label: 'Inquiries', value: inquiries.length },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4"
          >
            <p className="text-xs text-slate-500 dark:text-slate-400">{kpi.label}</p>
            <p className="font-display text-2xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
              {kpi.value}
            </p>
          </div>
        ))}
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'overview', label: 'Overview', icon: HeartPulse },
          { id: 'doctors', label: 'A. Doctors', icon: Stethoscope },
          { id: 'departments', label: 'B. Departments', icon: Building2 },
          { id: 'appointments', label: 'C. Appointments', icon: CalendarCheck2 },
          { id: 'packages', label: 'D. Packages', icon: FileSpreadsheet },
          { id: 'articles', label: 'E. Content & News', icon: FileSpreadsheet },
          { id: 'inquiries', label: 'F. Patients & Inquiries', icon: MessageSquare },
          { id: 'settings', label: 'G. Settings', icon: Settings },
        ].map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id as AdminTab)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                active
                  ? 'border-teal-600 text-[#0F2942] dark:text-teal-300'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" aria-hidden="true" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Overview Tab */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Pending Appointment Requests ({pendingAppts.length})
            </h2>
            {loadingAdminData ? (
              <p className="text-xs text-slate-500">Loading requests...</p>
            ) : pendingAppts.length === 0 ? (
              <p className="text-xs text-slate-500">All appointment requests are reviewed.</p>
            ) : (
              <div className="space-y-3">
                {pendingAppts.slice(0, 6).map((a) => (
                  <div
                    key={a.id}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-white">
                        {a.patientName} · {a.doctorName}
                      </p>
                      <p className="text-[11px] text-slate-500 tabular-nums">
                        {a.referenceNumber} · {a.preferredDate} · {a.timeSlot}
                      </p>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => void handleUpdateApptStatus(a, 'approved')}
                        className="px-2.5 py-1 rounded bg-emerald-600 text-white text-[11px] font-medium"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleUpdateApptStatus(a, 'rejected')}
                        className="px-2.5 py-1 rounded border border-rose-300 text-rose-700 dark:text-rose-300 text-[11px] font-medium"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Recent Inquiries & Feedback
            </h2>
            {inquiries.length === 0 && feedback.length === 0 ? (
              <p className="text-xs text-slate-500">No inquiries or feedback logged yet.</p>
            ) : (
              <div className="space-y-3">
                {inquiries.slice(0, 4).map((inq) => (
                  <div key={inq.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">
                      {inq.subject} ({inq.type})
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {inq.name} · {inq.email} · Status: {inq.status}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* A. Doctors */}
      {tab === 'doctors' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <input
              type="search"
              placeholder="Search specialists..."
              value={docQuery}
              onChange={(e) => setDocQuery(e.target.value)}
              className="w-full sm:w-72 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={() =>
                setEditingDoctor({
                  id: `doc_${Date.now()}`,
                  slug: `dr-new-specialist-${Date.now().toString().slice(-4)}`,
                  name: '',
                  designation: 'Consultant',
                  departmentId: departments[0]?.id || 'cardiology',
                  departmentName: departments[0]?.name || 'Cardiology',
                  qualifications: 'MBBS, MD',
                  experienceYears: 10,
                  bio: 'Specialist physician providing evidence-based care across multidisciplinary clinics.',
                  consultationDays: ['Sun', 'Tue', 'Thu'],
                  availableSlots: ['09:30 AM', '11:00 AM', '04:00 PM'],
                  consultationFeeDemo: 1500,
                  photoUrl: '',
                  isFeatured: false,
                  isAvailableToday: true,
                  languages: ['English', 'Bengali'],
                })
              }
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0F2942] dark:bg-teal-600 text-white text-xs font-semibold"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              Add Specialist
            </button>
          </div>

          {editingDoctor && (
            <form
              onSubmit={handleSaveDoctorForm}
              className="rounded-2xl border border-teal-200 dark:border-teal-800 bg-white dark:bg-slate-900 p-6 space-y-4"
            >
              <h3 className="font-display text-lg font-bold">Doctor Editor</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1">Full Name *</label>
                  <input
                    required
                    value={editingDoctor.name}
                    onChange={(e) => setEditingDoctor({ ...editingDoctor, name: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Slug *</label>
                  <input
                    required
                    value={editingDoctor.slug}
                    onChange={(e) => setEditingDoctor({ ...editingDoctor, slug: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Department</label>
                  <select
                    value={editingDoctor.departmentId}
                    onChange={(e) =>
                      setEditingDoctor({ ...editingDoctor, departmentId: e.target.value })
                    }
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
                  <label className="block text-xs font-medium mb-1">Designation *</label>
                  <input
                    required
                    value={editingDoctor.designation}
                    onChange={(e) =>
                      setEditingDoctor({ ...editingDoctor, designation: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Qualifications *</label>
                  <input
                    required
                    value={editingDoctor.qualifications}
                    onChange={(e) =>
                      setEditingDoctor({ ...editingDoctor, qualifications: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    min={0}
                    max={80}
                    value={editingDoctor.experienceYears}
                    onChange={(e) =>
                      setEditingDoctor({
                        ...editingDoctor,
                        experienceYears: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Biography *</label>
                <textarea
                  rows={3}
                  required
                  value={editingDoctor.bio}
                  onChange={(e) => setEditingDoctor({ ...editingDoctor, bio: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
                />
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingDoctor.isFeatured}
                    onChange={(e) =>
                      setEditingDoctor({ ...editingDoctor, isFeatured: e.target.checked })
                    }
                  />
                  Featured on Homepage
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingDoctor.isAvailableToday}
                    onChange={(e) =>
                      setEditingDoctor({ ...editingDoctor, isAvailableToday: e.target.checked })
                    }
                  />
                  Available Today
                </label>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#0F2942] dark:bg-teal-600 text-white text-xs font-semibold"
                >
                  Save Doctor
                </button>
                <button
                  type="button"
                  onClick={() => setEditingDoctor(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDocs.map((d) => (
              <div
                key={d.id}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex items-center justify-between gap-4"
              >
                <div>
                  <p className="font-semibold text-sm text-slate-900 dark:text-white">{d.name}</p>
                  <p className="text-xs text-slate-500">
                    {d.departmentName} · {d.experienceYears} yrs · BDT {d.consultationFeeDemo}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingDoctor(d)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDeleteDoctor(d.id)}
                    aria-label={`Delete ${d.name}`}
                    className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-800 text-rose-600"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* B. Departments */}
      {tab === 'departments' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() =>
                setEditingDept({
                  id: `dept_${Date.now()}`,
                  slug: `dept-${Date.now().toString().slice(-4)}`,
                  name: '',
                  nameBn: '',
                  category: 'Clinical Care',
                  bodyRegion: 'systemic',
                  overview: 'Multidisciplinary medical department providing comprehensive care.',
                  services: ['Outpatient Consultation', 'Diagnostic Evaluation'],
                  commonConditions: ['Preventive Screening'],
                  diagnostics: ['Laboratory Evaluation'],
                  relatedSlugs: ['internal-medicine'],
                  isActive: true,
                })
              }
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0F2942] dark:bg-teal-600 text-white text-xs font-semibold"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              Add Department
            </button>
          </div>

          {editingDept && (
            <form
              onSubmit={handleSaveDeptForm}
              className="rounded-2xl border border-teal-200 dark:border-teal-800 bg-white dark:bg-slate-900 p-6 space-y-4"
            >
              <h3 className="font-display text-lg font-bold">Department Editor</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1">Name *</label>
                  <input
                    required
                    value={editingDept.name}
                    onChange={(e) => setEditingDept({ ...editingDept, name: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Slug *</label>
                  <input
                    required
                    value={editingDept.slug}
                    onChange={(e) => setEditingDept({ ...editingDept, slug: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Body Region</label>
                  <select
                    value={editingDept.bodyRegion}
                    onChange={(e) =>
                      setEditingDept({
                        ...editingDept,
                        bodyRegion: e.target.value as BodyRegion,
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
                  >
                    {['head', 'chest', 'abdomen', 'musculoskeletal', 'reproductive', 'pediatric', 'systemic'].map(
                      (reg) => (
                        <option key={reg} value={reg}>
                          {reg}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Overview *</label>
                <textarea
                  rows={3}
                  required
                  value={editingDept.overview}
                  onChange={(e) => setEditingDept({ ...editingDept, overview: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#0F2942] dark:bg-teal-600 text-white text-xs font-semibold"
                >
                  Save Department
                </button>
                <button
                  type="button"
                  onClick={() => setEditingDept(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {departments.map((dept) => (
              <div
                key={dept.id}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex items-center justify-between gap-3"
              >
                <div>
                  <p className="font-semibold text-sm text-slate-900 dark:text-white">{dept.name}</p>
                  <p className="text-xs text-slate-500">
                    {dept.category} · {dept.bodyRegion}
                  </p>
                </div>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setEditingDept(dept)}
                    className="px-2.5 py-1 rounded border border-slate-300 dark:border-slate-700 text-xs"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDeleteDept(dept.id)}
                    aria-label={`Delete ${dept.name}`}
                    className="p-1.5 rounded border border-rose-200 text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* C. Appointments */}
      {tab === 'appointments' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {(['all', 'pending', 'approved', 'reschedule_requested', 'completed', 'cancelled', 'rejected'] as const).map(
              (st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setApptFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                    apptFilter === st
                      ? 'bg-[#0F2942] dark:bg-teal-600 text-white border-transparent'
                      : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {st}
                </button>
              )
            )}
          </div>

          {filteredAppts.length === 0 ? (
            <p className="text-sm text-slate-500">No appointment requests match this filter.</p>
          ) : (
            <div className="space-y-3">
              {filteredAppts.map((a) => (
                <div
                  key={a.id}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div>
                    <p className="text-xs font-mono text-teal-700 dark:text-teal-400">
                      {a.referenceNumber} · Status: {a.status}
                    </p>
                    <p className="font-semibold text-sm text-slate-900 dark:text-white">
                      {a.patientName} ({a.phone}) — {a.doctorName} ({a.departmentName})
                    </p>
                    <p className="text-xs text-slate-500 tabular-nums">
                      {a.preferredDate} · {a.timeSlot} · {a.consultationType}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(['approved', 'completed', 'rejected', 'cancelled'] as AppointmentStatus[]).map(
                      (target) => (
                        <button
                          key={target}
                          type="button"
                          onClick={() => void handleUpdateApptStatus(a, target)}
                          className="px-2.5 py-1 rounded border border-slate-300 dark:border-slate-700 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          {target}
                        </button>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* D. Health Packages */}
      {tab === 'packages' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() =>
                setEditingPkg({
                  id: `pkg_${Date.now()}`,
                  slug: `package-${Date.now().toString().slice(-4)}`,
                  name: '',
                  category: 'Executive Wellness',
                  description: 'Comprehensive preventive screening panel.',
                  targetAudience: 'Adults 30+',
                  priceDemo: 9500,
                  includedTests: ['CBC', 'Lipid Profile', 'Fasting Glucose', 'ECG'],
                  preparation: '10–12 hours fasting recommended.',
                  imageUrl: '',
                  isPublished: true,
                })
              }
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0F2942] dark:bg-teal-600 text-white text-xs font-semibold"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              Create Health Package
            </button>
          </div>

          {editingPkg && (
            <form
              onSubmit={handleSavePkgForm}
              className="rounded-2xl border border-teal-200 dark:border-teal-800 bg-white dark:bg-slate-900 p-6 space-y-4"
            >
              <h3 className="font-display text-lg font-bold">Package Editor</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1">Package Name *</label>
                  <input
                    required
                    value={editingPkg.name}
                    onChange={(e) => setEditingPkg({ ...editingPkg, name: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Category *</label>
                  <input
                    required
                    value={editingPkg.category}
                    onChange={(e) => setEditingPkg({ ...editingPkg, category: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Package Price (BDT)</label>
                  <input
                    type="number"
                    min={0}
                    value={editingPkg.priceDemo}
                    onChange={(e) =>
                      setEditingPkg({ ...editingPkg, priceDemo: Number(e.target.value) })
                    }
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">
                  Included Tests (comma separated)
                </label>
                <input
                  value={editingPkg.includedTests.join(', ')}
                  onChange={(e) =>
                    setEditingPkg({
                      ...editingPkg,
                      includedTests: e.target.value
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
                />
              </div>
              <label className="inline-flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={editingPkg.isPublished}
                  onChange={(e) => setEditingPkg({ ...editingPkg, isPublished: e.target.checked })}
                />
                Published publicly
              </label>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#0F2942] dark:bg-teal-600 text-white text-xs font-semibold"
                >
                  Save Package
                </button>
                <button
                  type="button"
                  onClick={() => setEditingPkg(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {packages.map((p) => (
              <div
                key={p.id}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex items-center justify-between gap-4"
              >
                <div>
                  <p className="font-semibold text-sm text-slate-900 dark:text-white">{p.name}</p>
                  <p className="text-xs text-slate-500 tabular-nums">
                    {p.category} · BDT {p.priceDemo.toLocaleString()} · {p.isPublished ? 'Published' : 'Unpublished'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingPkg(p)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium"
                >
                  Edit
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* E. Content & News */}
      {tab === 'articles' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() =>
                setEditingArticle({
                  id: `art_${Date.now()}`,
                  slug: `news-${Date.now().toString().slice(-4)}`,
                  title: '',
                  kind: 'news',
                  category: 'Hospital Update',
                  summary: 'Summary of hospital announcement or health education article.',
                  content: 'Full article body content for Nova Care Hospital News & Media section.',
                  author: 'Nova Care Editorial Team',
                  publishedDate: new Date().toISOString().slice(0, 10),
                  imageUrl: '',
                  isPublished: true,
                })
              }
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0F2942] dark:bg-teal-600 text-white text-xs font-semibold"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              Publish Article / News
            </button>
          </div>

          {editingArticle && (
            <form
              onSubmit={handleSaveArticleForm}
              className="rounded-2xl border border-teal-200 dark:border-teal-800 bg-white dark:bg-slate-900 p-6 space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1">Title *</label>
                  <input
                    required
                    value={editingArticle.title}
                    onChange={(e) =>
                      setEditingArticle({ ...editingArticle, title: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Kind</label>
                  <select
                    value={editingArticle.kind}
                    onChange={(e) =>
                      setEditingArticle({
                        ...editingArticle,
                        kind: e.target.value as Article['kind'],
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
                  >
                    <option value="news">Hospital News</option>
                    <option value="article">Health Article</option>
                    <option value="event">Event</option>
                    <option value="story">Patient Story</option>
                    <option value="press">Press Release</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Category *</label>
                  <input
                    required
                    value={editingArticle.category}
                    onChange={(e) =>
                      setEditingArticle({ ...editingArticle, category: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Content *</label>
                <textarea
                  rows={4}
                  required
                  value={editingArticle.content}
                  onChange={(e) =>
                    setEditingArticle({ ...editingArticle, content: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#0F2942] dark:bg-teal-600 text-white text-xs font-semibold"
                >
                  Save Content
                </button>
                <button
                  type="button"
                  onClick={() => setEditingArticle(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {articles.map((art) => (
              <div
                key={art.id}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex items-center justify-between gap-4"
              >
                <div>
                  <p className="font-semibold text-sm text-slate-900 dark:text-white">{art.title}</p>
                  <p className="text-xs text-slate-500">
                    {art.kind} · {art.category} · {art.publishedDate}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingArticle(art)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDeleteArticle(art.id)}
                    aria-label={`Delete ${art.title}`}
                    className="p-1.5 rounded-lg border border-rose-200 text-rose-600"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* F. Patients & Inquiries */}
      {tab === 'inquiries' && (
        <div className="space-y-8">
          <section className="space-y-3">
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Hospital Inquiries ({inquiries.length})
            </h2>
            {inquiries.length === 0 ? (
              <p className="text-xs text-slate-500">No inquiries submitted yet.</p>
            ) : (
              inquiries.map((inq) => (
                <div
                  key={inq.id}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {inq.subject} ({inq.type})
                    </p>
                    <p className="text-xs text-slate-500">
                      {inq.name} · {inq.email} · {inq.phone}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{inq.message}</p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    {(['new', 'in_review', 'resolved'] as Inquiry['status'][]).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => void handleUpdateInqStatus(inq, st)}
                        className={`px-2.5 py-1 rounded text-xs font-medium border ${
                          inq.status === st
                            ? 'bg-[#0F2942] dark:bg-teal-600 text-white border-transparent'
                            : 'border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Registered Patient Profiles ({patients.length})
            </h2>
            {patients.length === 0 ? (
              <p className="text-xs text-slate-500">No patient accounts registered in Firestore yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {patients.map((p) => (
                  <div
                    key={p.uid}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-xs"
                  >
                    <p className="font-semibold text-slate-900 dark:text-white">{p.displayName}</p>
                    <p className="text-slate-500 mt-0.5">{p.email}</p>
                    <p className="text-slate-500 mt-0.5">
                      Phone: {p.phone || 'Not provided'} · Blood Group: {p.bloodGroup || 'Unset'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* G. Website Settings */}
      {tab === 'settings' && (
        <form
          onSubmit={handleSaveSettings}
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 max-w-3xl space-y-4"
        >
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            Hospital Website Settings
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1">Hospital Name *</label>
              <input
                required
                value={settingsForm.hospitalName}
                onChange={(e) =>
                  setSettingsForm({ ...settingsForm, hospitalName: e.target.value })
                }
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Emergency Contact Label *</label>
              <input
                required
                value={settingsForm.emergencyContactLabel}
                onChange={(e) =>
                  setSettingsForm({ ...settingsForm, emergencyContactLabel: e.target.value })
                }
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Contact Email *</label>
              <input
                required
                type="email"
                value={settingsForm.contactEmail}
                onChange={(e) =>
                  setSettingsForm({ ...settingsForm, contactEmail: e.target.value })
                }
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Default Language</label>
              <select
                value={settingsForm.defaultLanguage}
                onChange={(e) =>
                  setSettingsForm({
                    ...settingsForm,
                    defaultLanguage: e.target.value as 'en' | 'bn',
                  })
                }
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
              >
                <option value="en">English (EN)</option>
                <option value="bn">Bengali (BN)</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Campus Address *</label>
            <input
              required
              value={settingsForm.address}
              onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Emergency Notice Banner *</label>
            <textarea
              rows={2}
              required
              value={settingsForm.emergencyNotice}
              onChange={(e) =>
                setSettingsForm({ ...settingsForm, emergencyNotice: e.target.value })
              }
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-[#0F2942] dark:bg-teal-600 text-white text-sm font-semibold"
          >
            Save Settings
          </button>
        </form>
      )}
    </div>
  );
};
