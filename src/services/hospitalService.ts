import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { BOOTSTRAPPED_ADMIN_EMAIL, db, handleFirestoreError, OperationType } from '../firebase';
import {
  createDemoReportsForUser,
  DEFAULT_WEBSITE_SETTINGS,
  SEED_ARTICLES,
  SEED_DEPARTMENTS,
  SEED_DIAGNOSTICS,
  SEED_DOCTORS,
  SEED_HEALTH_PACKAGES,
  SEED_JOBS,
} from '../data/seedData';
import type {
  AppointmentRequest,
  AppointmentStatus,
  Article,
  Department,
  DiagnosticReport,
  DiagnosticService,
  Doctor,
  HealthPackage,
  Inquiry,
  JobApplication,
  JobListing,
  PackageBooking,
  PatientFeedback,
  PatientNotification,
  PatientProfile,
  WebsiteSettings,
} from '../types/hospital';
import {
  buildSlotKey,
  generateReferenceNumber,
  safeStorageGet,
  safeStorageSet,
  sanitizeText,
  validateAppointmentForm,
  type AppointmentFormInput,
} from '../utils/hospitalLogic';

const PREVIEW_APPTS_KEY = 'novacare_preview_appointments';
const PREVIEW_PACKAGES_KEY = 'novacare_preview_package_bookings';
const PREVIEW_INQUIRIES_KEY = 'novacare_preview_inquiries';
const PREVIEW_FEEDBACK_KEY = 'novacare_preview_feedback';
const PREVIEW_JOBS_KEY = 'novacare_preview_job_apps';

function safeParseJson<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function getPreviewAppointments(): AppointmentRequest[] {
  return safeParseJson<AppointmentRequest[]>(safeStorageGet(PREVIEW_APPTS_KEY), []);
}

export function getPreviewPackageBookings(): PackageBooking[] {
  return safeParseJson<PackageBooking[]>(safeStorageGet(PREVIEW_PACKAGES_KEY), []);
}

export function getPreviewInquiries(): Inquiry[] {
  return safeParseJson<Inquiry[]>(safeStorageGet(PREVIEW_INQUIRIES_KEY), []);
}

export function getPreviewFeedback(): PatientFeedback[] {
  return safeParseJson<PatientFeedback[]>(safeStorageGet(PREVIEW_FEEDBACK_KEY), []);
}

export function getPreviewJobApplications(): JobApplication[] {
  return safeParseJson<JobApplication[]>(safeStorageGet(PREVIEW_JOBS_KEY), []);
}

async function fetchServerReference(prefix = 'NCH'): Promise<string> {
  try {
    const res = await fetch('/api/booking-reference', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prefix }),
    });
    if (res.ok) {
      const data = (await res.json()) as { referenceNumber?: string };
      if (data.referenceNumber) return data.referenceNumber;
    }
  } catch {
    // Fallback to deterministic generator if offline
  }
  return generateReferenceNumber(prefix);
}

export async function checkAndEnsureAdmin(user: User | null): Promise<boolean> {
  if (!user || !user.emailVerified) return false;
  if (user.email === BOOTSTRAPPED_ADMIN_EMAIL) {
    const adminRef = doc(db, 'admins', user.uid);
    try {
      const snap = await getDoc(adminRef);
      if (!snap.exists()) {
        await setDoc(adminRef, {
          uid: user.uid,
          email: user.email,
          name: sanitizeText(user.displayName || 'Hospital Administrator', 120),
          role: 'super_admin',
          createdAt: serverTimestamp(),
        });
      }
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `admins/${user.uid}`);
    }
  }
  try {
    const snap = await getDoc(doc(db, 'admins', user.uid));
    return snap.exists();
  } catch {
    return false;
  }
}

export async function ensurePatientProfile(user: User): Promise<PatientProfile> {
  const userRef = doc(db, 'users', user.uid);
  try {
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const d = snap.data();
      return {
        uid: user.uid,
        displayName: String(d.displayName || user.displayName || 'Patient'),
        email: String(d.email || user.email || ''),
        phone: String(d.phone || ''),
        dateOfBirth: String(d.dateOfBirth || ''),
        gender: (d.gender as PatientProfile['gender']) || 'Prefer not to say',
        bloodGroup: String(d.bloodGroup || ''),
        role: 'patient',
        createdAt: d.createdAt?.toDate ? d.createdAt.toDate().toISOString() : new Date().toISOString(),
        updatedAt: d.updatedAt?.toDate ? d.updatedAt.toDate().toISOString() : new Date().toISOString(),
      };
    }

    await setDoc(userRef, {
      uid: user.uid,
      displayName: sanitizeText(user.displayName || 'Nova Care Patient', 120),
      email: sanitizeText(user.email || '', 160),
      phone: '',
      dateOfBirth: '',
      gender: 'Prefer not to say',
      bloodGroup: '',
      role: 'patient',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Provision starter demo diagnostic reports & welcome notification for this authenticated user
    const demoReports = createDemoReportsForUser(user.uid);
    for (const rep of demoReports) {
      await setDoc(doc(db, 'reports', rep.id), {
        id: rep.id,
        userId: user.uid,
        reportCode: rep.reportCode,
        testName: rep.testName,
        category: rep.category,
        reportDate: rep.reportDate,
        status: rep.status,
        summary: rep.summary,
        createdAt: serverTimestamp(),
      });
    }

    const welcomeId = `notif_${user.uid.slice(0, 10)}_welcome`;
    await setDoc(doc(db, 'notifications', welcomeId), {
      id: welcomeId,
      userId: user.uid,
      title: 'Welcome to Nova Care Patient Portal',
      message: 'Your secure patient profile and digital report archive are ready.',
      category: 'system',
      isRead: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return {
      uid: user.uid,
      displayName: sanitizeText(user.displayName || 'Nova Care Patient', 120),
      email: sanitizeText(user.email || '', 160),
      phone: '',
      dateOfBirth: '',
      gender: 'Prefer not to say',
      bloodGroup: '',
      role: 'patient',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
  }
}

export async function updatePatientProfile(
  uid: string,
  updates: Partial<Pick<PatientProfile, 'displayName' | 'phone' | 'dateOfBirth' | 'gender' | 'bloodGroup'>>
): Promise<void> {
  const path = `users/${uid}`;
  try {
    await updateDoc(doc(db, 'users', uid), {
      displayName: sanitizeText(updates.displayName || 'Patient', 120),
      phone: sanitizeText(updates.phone || '', 32),
      dateOfBirth: sanitizeText(updates.dateOfBirth || '', 20),
      gender: updates.gender || 'Prefer not to say',
      bloodGroup: sanitizeText(updates.bloodGroup || '', 10),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function fetchPublicCatalogs(): Promise<{
  doctors: Doctor[];
  departments: Department[];
  packages: HealthPackage[];
  diagnostics: DiagnosticService[];
  articles: Article[];
  jobs: JobListing[];
  settings: WebsiteSettings;
}> {
  try {
    const [docSnap, deptSnap, pkgSnap, diagSnap, artSnap, jobSnap, settingsSnap] = await Promise.all([
      getDocs(collection(db, 'doctors')),
      getDocs(collection(db, 'departments')),
      getDocs(collection(db, 'healthPackages')),
      getDocs(collection(db, 'diagnosticServices')),
      getDocs(collection(db, 'articles')),
      getDocs(collection(db, 'jobListings')),
      getDoc(doc(db, 'websiteSettings', 'main')),
    ]);

    const doctors = docSnap.empty
      ? SEED_DOCTORS
      : docSnap.docs.map((d) => ({ ...d.data(), id: d.id } as Doctor));
    const departments = deptSnap.empty
      ? SEED_DEPARTMENTS
      : deptSnap.docs.map((d) => ({ ...d.data(), id: d.id } as Department));
    const packages = pkgSnap.empty
      ? SEED_HEALTH_PACKAGES
      : pkgSnap.docs.map((d) => ({ ...d.data(), id: d.id } as HealthPackage));
    const diagnostics = diagSnap.empty
      ? SEED_DIAGNOSTICS
      : diagSnap.docs.map((d) => ({ ...d.data(), id: d.id } as DiagnosticService));
    const articles = artSnap.empty
      ? SEED_ARTICLES
      : artSnap.docs.map((d) => ({ ...d.data(), id: d.id } as Article));
    const jobs = jobSnap.empty
      ? SEED_JOBS
      : jobSnap.docs.map((d) => ({ ...d.data(), id: d.id } as JobListing));
    const settings = settingsSnap.exists()
      ? (settingsSnap.data() as WebsiteSettings)
      : DEFAULT_WEBSITE_SETTINGS;

    return { doctors, departments, packages, diagnostics, articles, jobs, settings };
  } catch (error) {
    console.warn('Using fallback hospital catalog:', error);
    return {
      doctors: SEED_DOCTORS,
      departments: SEED_DEPARTMENTS,
      packages: SEED_HEALTH_PACKAGES,
      diagnostics: SEED_DIAGNOSTICS,
      articles: SEED_ARTICLES,
      jobs: SEED_JOBS,
      settings: DEFAULT_WEBSITE_SETTINGS,
    };
  }
}

export async function seedCatalogToFirestore(): Promise<void> {
  const batch = writeBatch(db);
  for (const docItem of SEED_DOCTORS) {
    batch.set(doc(db, 'doctors', docItem.id), { ...docItem, updatedAt: serverTimestamp() });
  }
  for (const dept of SEED_DEPARTMENTS) {
    batch.set(doc(db, 'departments', dept.id), { ...dept, updatedAt: serverTimestamp() });
  }
  for (const pkg of SEED_HEALTH_PACKAGES) {
    batch.set(doc(db, 'healthPackages', pkg.id), { ...pkg, updatedAt: serverTimestamp() });
  }
  for (const diag of SEED_DIAGNOSTICS) {
    batch.set(doc(db, 'diagnosticServices', diag.id), { ...diag, updatedAt: serverTimestamp() });
  }
  for (const art of SEED_ARTICLES) {
    batch.set(doc(db, 'articles', art.id), { ...art, updatedAt: serverTimestamp() });
  }
  for (const job of SEED_JOBS) {
    batch.set(doc(db, 'jobListings', job.id), { ...job, updatedAt: serverTimestamp() });
  }
  batch.set(doc(db, 'websiteSettings', 'main'), {
    ...DEFAULT_WEBSITE_SETTINGS,
    updatedAt: serverTimestamp(),
  });
  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'catalogSeed');
  }
}

export async function isSlotAvailableInCloud(
  doctorId: string,
  preferredDate: string,
  timeSlot: string
): Promise<boolean> {
  const slotKey = buildSlotKey(doctorId, preferredDate, timeSlot);
  const localBooked = getPreviewAppointments().some(
    (a) => a.slotKey === slotKey && a.status !== 'cancelled' && a.status !== 'rejected'
  );
  if (localBooked) return false;

  try {
    const snap = await getDoc(doc(db, 'appointmentSlots', slotKey));
    if (!snap.exists()) return true;
    return snap.data()?.status === 'released';
  } catch {
    return true;
  }
}

export async function submitAppointmentRequest(
  input: AppointmentFormInput,
  doctor: Doctor,
  department: Department,
  currentUser: User | null
): Promise<AppointmentRequest> {
  const validation = validateAppointmentForm(input);
  if (!validation.valid) {
    const firstMsg = Object.values(validation.errors)[0] || 'Invalid appointment fields.';
    throw new Error(firstMsg);
  }

  const slotKey = buildSlotKey(doctor.id, input.preferredDate, input.timeSlot);
  const appointmentId = `appt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const referenceNumber = await fetchServerReference('NCH');
  const nowIso = new Date().toISOString();

  // Check local session slots first
  const localExisting = getPreviewAppointments();
  if (
    localExisting.some(
      (a) => a.slotKey === slotKey && a.status !== 'cancelled' && a.status !== 'rejected'
    )
  ) {
    throw new Error(
      `The ${input.timeSlot} slot on ${input.preferredDate} for ${doctor.name} is already requested. Please choose another slot.`
    );
  }

  if (currentUser && currentUser.emailVerified) {
    const apptRef = doc(db, 'appointments', appointmentId);
    const slotRef = doc(db, 'appointmentSlots', slotKey);
    const notifId = `notif_${appointmentId}`;

    try {
      await runTransaction(db, async (tx) => {
        const slotSnap = await tx.get(slotRef);
        if (slotSnap.exists() && slotSnap.data()?.status === 'booked') {
          throw new Error(
            `Slot conflict: ${input.timeSlot} on ${input.preferredDate} has already been reserved. Please choose another time.`
          );
        }

        const payload = {
          id: appointmentId,
          referenceNumber,
          userId: currentUser.uid,
          patientName: sanitizeText(input.patientName, 120),
          dateOfBirth: sanitizeText(input.dateOfBirth, 20),
          gender: input.gender as 'Male' | 'Female' | 'Other',
          phone: sanitizeText(input.phone, 32),
          email: sanitizeText(input.email, 160),
          departmentId: department.id,
          departmentName: sanitizeText(department.name, 100),
          doctorId: doctor.id,
          doctorName: sanitizeText(doctor.name, 120),
          preferredDate: input.preferredDate,
          timeSlot: input.timeSlot,
          consultationType: input.consultationType as 'In-Person' | 'Online Video',
          message: sanitizeText(input.message || '', 1000),
          status: 'pending' as const,
          slotKey,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        if (slotSnap.exists()) {
          // Released slot cannot be overwritten by a different user due to rules unless admin;
          // Create deterministic secondary slot check or update if same user
          if (slotSnap.data()?.bookedByUid === currentUser.uid) {
            tx.update(slotRef, {
              status: 'booked',
              updatedAt: serverTimestamp(),
            });
          } else {
            throw new Error(
              `This slot is currently locked in review. Please select another available slot.`
            );
          }
        } else {
          tx.set(slotRef, {
            doctorId: doctor.id,
            preferredDate: input.preferredDate,
            timeSlot: input.timeSlot,
            bookedByUid: currentUser.uid,
            appointmentId,
            status: 'booked',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }

        tx.set(apptRef, payload);
      });

      await setDoc(doc(db, 'notifications', notifId), {
        id: notifId,
        userId: currentUser.uid,
        title: `Appointment Request Received (${referenceNumber})`,
        message: `Requested ${doctor.name} (${department.name}) on ${input.preferredDate} at ${input.timeSlot}.`,
        category: 'appointment',
        isRead: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return {
        id: appointmentId,
        referenceNumber,
        userId: currentUser.uid,
        patientName: sanitizeText(input.patientName, 120),
        dateOfBirth: input.dateOfBirth,
        gender: input.gender as 'Male' | 'Female' | 'Other',
        phone: sanitizeText(input.phone, 32),
        email: sanitizeText(input.email, 160),
        departmentId: department.id,
        departmentName: department.name,
        doctorId: doctor.id,
        doctorName: doctor.name,
        preferredDate: input.preferredDate,
        timeSlot: input.timeSlot,
        consultationType: input.consultationType as 'In-Person' | 'Online Video',
        message: sanitizeText(input.message || '', 1000),
        status: 'pending',
        slotKey,
        createdAt: nowIso,
        updatedAt: nowIso,
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes('Slot')) {
        throw error;
      }
      handleFirestoreError(error, OperationType.WRITE, `appointments/${appointmentId}`);
    }
  }

  // Preview session fallback when user has not signed in with Google yet
  const previewRecord: AppointmentRequest = {
    id: appointmentId,
    referenceNumber,
    userId: 'preview-guest',
    patientName: sanitizeText(input.patientName, 120),
    dateOfBirth: input.dateOfBirth,
    gender: input.gender as 'Male' | 'Female' | 'Other',
    phone: sanitizeText(input.phone, 32),
    email: sanitizeText(input.email, 160),
    departmentId: department.id,
    departmentName: department.name,
    doctorId: doctor.id,
    doctorName: doctor.name,
    preferredDate: input.preferredDate,
    timeSlot: input.timeSlot,
    consultationType: input.consultationType as 'In-Person' | 'Online Video',
    message: sanitizeText(input.message || '', 1000),
    status: 'pending',
    slotKey,
    createdAt: nowIso,
    updatedAt: nowIso,
    isLocalPreview: true,
  };

  safeStorageSet(PREVIEW_APPTS_KEY, JSON.stringify([previewRecord, ...localExisting]));
  return previewRecord;
}

export async function fetchUserAppointments(user: User | null): Promise<AppointmentRequest[]> {
  const local = getPreviewAppointments();
  if (!user || !user.emailVerified) return local;
  try {
    const q = query(
      collection(db, 'appointments'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    const cloud = snap.docs.map((d) => {
      const data = d.data();
      return {
        ...(data as AppointmentRequest),
        id: d.id,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : String(data.createdAt || ''),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : String(data.updatedAt || ''),
      };
    });
    return [...cloud, ...local];
  } catch (error) {
    // If composite index isn't ready yet, fallback without orderBy
    try {
      const qSimple = query(collection(db, 'appointments'), where('userId', '==', user.uid));
      const snap = await getDocs(qSimple);
      const cloud = snap.docs.map((d) => {
        const data = d.data();
        return {
          ...(data as AppointmentRequest),
          id: d.id,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : new Date().toISOString(),
        };
      });
      return [...cloud.sort((a, b) => b.createdAt.localeCompare(a.createdAt)), ...local];
    } catch (innerError) {
      handleFirestoreError(innerError, OperationType.LIST, 'appointments');
    }
  }
}

export async function cancelAppointment(
  appt: AppointmentRequest,
  user: User | null
): Promise<void> {
  if (appt.isLocalPreview || !user) {
    const list = getPreviewAppointments().map((item) =>
      item.id === appt.id
        ? { ...item, status: 'cancelled' as const, updatedAt: new Date().toISOString() }
        : item
    );
    safeStorageSet(PREVIEW_APPTS_KEY, JSON.stringify(list));
    return;
  }

  const apptRef = doc(db, 'appointments', appt.id);
  const slotRef = doc(db, 'appointmentSlots', appt.slotKey);
  try {
    await runTransaction(db, async (tx) => {
      const slotSnap = await tx.get(slotRef);
      tx.update(apptRef, {
        status: 'cancelled',
        updatedAt: serverTimestamp(),
      });
      if (slotSnap.exists() && slotSnap.data()?.bookedByUid === user.uid) {
        tx.update(slotRef, {
          status: 'released',
          updatedAt: serverTimestamp(),
        });
      }
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `appointments/${appt.id}`);
  }
}

export async function rescheduleAppointment(
  appt: AppointmentRequest,
  newDate: string,
  newSlot: string,
  user: User | null
): Promise<void> {
  const newSlotKey = buildSlotKey(appt.doctorId, newDate, newSlot);
  if (appt.isLocalPreview || !user) {
    const list = getPreviewAppointments();
    if (
      list.some(
        (a) =>
          a.id !== appt.id &&
          a.slotKey === newSlotKey &&
          a.status !== 'cancelled' &&
          a.status !== 'rejected'
      )
    ) {
      throw new Error('Selected reschedule slot is already taken.');
    }
    const updated = list.map((item) =>
      item.id === appt.id
        ? {
            ...item,
            preferredDate: newDate,
            timeSlot: newSlot,
            slotKey: newSlotKey,
            status: 'reschedule_requested' as const,
            updatedAt: new Date().toISOString(),
          }
        : item
    );
    safeStorageSet(PREVIEW_APPTS_KEY, JSON.stringify(updated));
    return;
  }

  const apptRef = doc(db, 'appointments', appt.id);
  const newSlotRef = doc(db, 'appointmentSlots', newSlotKey);
  const oldSlotRef = doc(db, 'appointmentSlots', appt.slotKey);

  try {
    await runTransaction(db, async (tx) => {
      const newSlotSnap = await tx.get(newSlotRef);
      if (newSlotSnap.exists() && newSlotSnap.data()?.status === 'booked') {
        throw new Error('Selected reschedule time slot is already reserved.');
      }
      if (newSlotSnap.exists() && newSlotSnap.data()?.bookedByUid !== user.uid) {
        throw new Error('Selected reschedule time slot is locked by another request.');
      }
      const oldSlotSnap = await tx.get(oldSlotRef);
      if (oldSlotSnap.exists() && oldSlotSnap.data()?.bookedByUid === user.uid) {
        tx.update(oldSlotRef, {
          status: 'released',
          updatedAt: serverTimestamp(),
        });
      }
      if (newSlotSnap.exists()) {
        tx.update(newSlotRef, {
          status: 'booked',
          updatedAt: serverTimestamp(),
        });
      } else {
        tx.set(newSlotRef, {
          doctorId: appt.doctorId,
          preferredDate: newDate,
          timeSlot: newSlot,
          bookedByUid: user.uid,
          appointmentId: appt.id,
          status: 'booked',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      tx.update(apptRef, {
        status: 'reschedule_requested',
        preferredDate: newDate,
        timeSlot: newSlot,
        slotKey: newSlotKey,
        updatedAt: serverTimestamp(),
      });
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('reschedule')) {
      throw error;
    }
    handleFirestoreError(error, OperationType.UPDATE, `appointments/${appt.id}`);
  }
}

export async function submitPackageBooking(
  data: {
    pkg: HealthPackage;
    patientName: string;
    phone: string;
    email: string;
    preferredDate: string;
  },
  user: User | null
): Promise<PackageBooking> {
  const id = `pkgb_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const referenceNumber = await fetchServerReference('PKG');
  const nowIso = new Date().toISOString();

  if (user && user.emailVerified) {
    try {
      await setDoc(doc(db, 'packageBookings', id), {
        id,
        referenceNumber,
        userId: user.uid,
        packageId: data.pkg.id,
        packageName: sanitizeText(data.pkg.name, 140),
        patientName: sanitizeText(data.patientName, 120),
        phone: sanitizeText(data.phone, 32),
        email: sanitizeText(data.email, 160),
        preferredDate: data.preferredDate,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return {
        id,
        referenceNumber,
        userId: user.uid,
        packageId: data.pkg.id,
        packageName: data.pkg.name,
        patientName: data.patientName,
        phone: data.phone,
        email: data.email,
        preferredDate: data.preferredDate,
        status: 'pending',
        createdAt: nowIso,
        updatedAt: nowIso,
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `packageBookings/${id}`);
    }
  }

  const preview: PackageBooking = {
    id,
    referenceNumber,
    userId: 'preview-guest',
    packageId: data.pkg.id,
    packageName: data.pkg.name,
    patientName: sanitizeText(data.patientName, 120),
    phone: sanitizeText(data.phone, 32),
    email: sanitizeText(data.email, 160),
    preferredDate: data.preferredDate,
    status: 'pending',
    createdAt: nowIso,
    updatedAt: nowIso,
    isLocalPreview: true,
  };
  safeStorageSet(PREVIEW_PACKAGES_KEY, JSON.stringify([preview, ...getPreviewPackageBookings()]));
  return preview;
}

export async function fetchUserPackageBookings(user: User | null): Promise<PackageBooking[]> {
  const local = getPreviewPackageBookings();
  if (!user || !user.emailVerified) return local;
  try {
    const q = query(collection(db, 'packageBookings'), where('userId', '==', user.uid));
    const snap = await getDocs(q);
    const cloud = snap.docs.map((d) => {
      const data = d.data();
      return {
        ...(data as PackageBooking),
        id: d.id,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : new Date().toISOString(),
      };
    });
    return [...cloud, ...local];
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'packageBookings');
  }
}

export async function submitInquiry(
  data: {
    type: Inquiry['type'];
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
  },
  user: User | null
): Promise<Inquiry> {
  const id = `inq_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const nowIso = new Date().toISOString();
  if (user && user.emailVerified) {
    try {
      await setDoc(doc(db, 'inquiries', id), {
        id,
        userId: user.uid,
        type: data.type,
        name: sanitizeText(data.name, 120),
        email: sanitizeText(data.email, 160),
        phone: sanitizeText(data.phone, 32),
        subject: sanitizeText(data.subject, 180),
        message: sanitizeText(data.message, 2000),
        status: 'new',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return {
        id,
        userId: user.uid,
        ...data,
        status: 'new',
        createdAt: nowIso,
        updatedAt: nowIso,
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `inquiries/${id}`);
    }
  }
  const preview: Inquiry = {
    id,
    userId: 'preview-guest',
    type: data.type,
    name: sanitizeText(data.name, 120),
    email: sanitizeText(data.email, 160),
    phone: sanitizeText(data.phone, 32),
    subject: sanitizeText(data.subject, 180),
    message: sanitizeText(data.message, 2000),
    status: 'new',
    createdAt: nowIso,
    updatedAt: nowIso,
    isLocalPreview: true,
  };
  safeStorageSet(PREVIEW_INQUIRIES_KEY, JSON.stringify([preview, ...getPreviewInquiries()]));
  return preview;
}

export async function submitFeedback(
  data: {
    patientName: string;
    departmentName: string;
    rating: number;
    comment: string;
  },
  user: User | null
): Promise<PatientFeedback> {
  const id = `fb_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const nowIso = new Date().toISOString();
  if (user && user.emailVerified) {
    try {
      await setDoc(doc(db, 'feedback', id), {
        id,
        userId: user.uid,
        patientName: sanitizeText(data.patientName, 120),
        departmentName: sanitizeText(data.departmentName, 100),
        rating: Math.min(5, Math.max(1, Number(data.rating) || 5)),
        comment: sanitizeText(data.comment, 1500),
        status: 'submitted',
        createdAt: serverTimestamp(),
      });
      return {
        id,
        userId: user.uid,
        ...data,
        status: 'submitted',
        createdAt: nowIso,
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `feedback/${id}`);
    }
  }
  const preview: PatientFeedback = {
    id,
    userId: 'preview-guest',
    patientName: sanitizeText(data.patientName, 120),
    departmentName: sanitizeText(data.departmentName, 100),
    rating: Math.min(5, Math.max(1, Number(data.rating) || 5)),
    comment: sanitizeText(data.comment, 1500),
    status: 'submitted',
    createdAt: nowIso,
    isLocalPreview: true,
  };
  safeStorageSet(PREVIEW_FEEDBACK_KEY, JSON.stringify([preview, ...getPreviewFeedback()]));
  return preview;
}

export async function submitJobApplication(
  data: {
    job: JobListing;
    applicantName: string;
    email: string;
    phone: string;
    cvFileName: string;
    coverNote: string;
  },
  user: User | null
): Promise<JobApplication> {
  const id = `app_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const nowIso = new Date().toISOString();
  if (user && user.emailVerified) {
    try {
      await setDoc(doc(db, 'jobApplications', id), {
        id,
        userId: user.uid,
        jobId: data.job.id,
        jobTitle: sanitizeText(data.job.title, 140),
        applicantName: sanitizeText(data.applicantName, 120),
        email: sanitizeText(data.email, 160),
        phone: sanitizeText(data.phone, 32),
        cvFileName: sanitizeText(data.cvFileName, 160),
        coverNote: sanitizeText(data.coverNote, 2000),
        status: 'received',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return {
        id,
        userId: user.uid,
        jobId: data.job.id,
        jobTitle: data.job.title,
        applicantName: data.applicantName,
        email: data.email,
        phone: data.phone,
        cvFileName: data.cvFileName,
        coverNote: data.coverNote,
        status: 'received',
        createdAt: nowIso,
        updatedAt: nowIso,
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `jobApplications/${id}`);
    }
  }
  const preview: JobApplication = {
    id,
    userId: 'preview-guest',
    jobId: data.job.id,
    jobTitle: data.job.title,
    applicantName: sanitizeText(data.applicantName, 120),
    email: sanitizeText(data.email, 160),
    phone: sanitizeText(data.phone, 32),
    cvFileName: sanitizeText(data.cvFileName, 160),
    coverNote: sanitizeText(data.coverNote, 2000),
    status: 'received',
    createdAt: nowIso,
    updatedAt: nowIso,
    isLocalPreview: true,
  };
  safeStorageSet(PREVIEW_JOBS_KEY, JSON.stringify([preview, ...getPreviewJobApplications()]));
  return preview;
}

export async function fetchUserJobApplications(user: User | null): Promise<JobApplication[]> {
  const local = getPreviewJobApplications();
  if (!user || !user.emailVerified) return local;
  try {
    const q = query(collection(db, 'jobApplications'), where('userId', '==', user.uid));
    const snap = await getDocs(q);
    const cloud = snap.docs.map((d) => {
      const data = d.data();
      return {
        ...(data as JobApplication),
        id: d.id,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : new Date().toISOString(),
      };
    });
    return [...cloud, ...local];
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'jobApplications');
  }
}

export async function fetchUserReports(user: User | null): Promise<DiagnosticReport[]> {
  if (!user || !user.emailVerified) return [];
  try {
    const q = query(collection(db, 'reports'), where('userId', '==', user.uid));
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        ...(data as DiagnosticReport),
        id: d.id,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
      };
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'reports');
  }
}

export async function fetchUserNotifications(user: User | null): Promise<PatientNotification[]> {
  if (!user || !user.emailVerified) return [];
  try {
    const q = query(collection(db, 'notifications'), where('userId', '==', user.uid));
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => {
        const data = d.data();
        return {
          ...(data as PatientNotification),
          id: d.id,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : new Date().toISOString(),
        };
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'notifications');
  }
}

export async function markNotificationRead(id: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'notifications', id), {
      isRead: true,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `notifications/${id}`);
  }
}

// ------------------------------------------------------------------
// Admin Operations (Enforced by Firestore Rules isAdmin())
// ------------------------------------------------------------------
export async function fetchAdminOverviewData(): Promise<{
  appointments: AppointmentRequest[];
  inquiries: Inquiry[];
  feedback: PatientFeedback[];
  users: PatientProfile[];
  packageBookings: PackageBooking[];
}> {
  try {
    const [apptSnap, inqSnap, fbSnap, userSnap, pkgSnap] = await Promise.all([
      getDocs(collection(db, 'appointments')),
      getDocs(collection(db, 'inquiries')),
      getDocs(collection(db, 'feedback')),
      getDocs(collection(db, 'users')),
      getDocs(collection(db, 'packageBookings')),
    ]);

    const mapDate = (v: unknown) =>
      v && typeof v === 'object' && 'toDate' in v && typeof (v as { toDate: () => Date }).toDate === 'function'
        ? (v as { toDate: () => Date }).toDate().toISOString()
        : new Date().toISOString();

    return {
      appointments: [
        ...apptSnap.docs.map((d) => ({
          ...(d.data() as AppointmentRequest),
          id: d.id,
          createdAt: mapDate(d.data().createdAt),
          updatedAt: mapDate(d.data().updatedAt),
        })),
        ...getPreviewAppointments(),
      ],
      inquiries: [
        ...inqSnap.docs.map((d) => ({
          ...(d.data() as Inquiry),
          id: d.id,
          createdAt: mapDate(d.data().createdAt),
          updatedAt: mapDate(d.data().updatedAt),
        })),
        ...getPreviewInquiries(),
      ],
      feedback: [
        ...fbSnap.docs.map((d) => ({
          ...(d.data() as PatientFeedback),
          id: d.id,
          createdAt: mapDate(d.data().createdAt),
        })),
        ...getPreviewFeedback(),
      ],
      users: userSnap.docs.map((d) => ({
        ...(d.data() as PatientProfile),
        uid: d.id,
        createdAt: mapDate(d.data().createdAt),
        updatedAt: mapDate(d.data().updatedAt),
      })),
      packageBookings: [
        ...pkgSnap.docs.map((d) => ({
          ...(d.data() as PackageBooking),
          id: d.id,
          createdAt: mapDate(d.data().createdAt),
          updatedAt: mapDate(d.data().updatedAt),
        })),
        ...getPreviewPackageBookings(),
      ],
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'adminOverview');
  }
}

export async function adminSaveDoctor(doctor: Doctor): Promise<void> {
  try {
    await setDoc(doc(db, 'doctors', doctor.id), {
      id: doctor.id,
      slug: sanitizeText(doctor.slug, 128),
      name: sanitizeText(doctor.name, 120),
      designation: sanitizeText(doctor.designation, 140),
      departmentId: doctor.departmentId,
      departmentName: sanitizeText(doctor.departmentName, 100),
      qualifications: sanitizeText(doctor.qualifications, 180),
      experienceYears: Number(doctor.experienceYears) || 0,
      bio: sanitizeText(doctor.bio, 2000),
      consultationDays: doctor.consultationDays.slice(0, 7),
      availableSlots: doctor.availableSlots.slice(0, 16),
      consultationFeeDemo: Number(doctor.consultationFeeDemo) || 0,
      photoUrl: sanitizeText(doctor.photoUrl || '', 300),
      isFeatured: Boolean(doctor.isFeatured),
      isAvailableToday: Boolean(doctor.isAvailableToday),
      languages: doctor.languages.slice(0, 6),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `doctors/${doctor.id}`);
  }
}

export async function adminDeleteDoctor(doctorId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'doctors', doctorId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `doctors/${doctorId}`);
  }
}

export async function adminSaveDepartment(dept: Department): Promise<void> {
  try {
    await setDoc(doc(db, 'departments', dept.id), {
      id: dept.id,
      slug: sanitizeText(dept.slug, 128),
      name: sanitizeText(dept.name, 100),
      nameBn: sanitizeText(dept.nameBn || '', 140),
      category: sanitizeText(dept.category, 80),
      bodyRegion: dept.bodyRegion,
      overview: sanitizeText(dept.overview, 2500),
      services: dept.services.slice(0, 25),
      commonConditions: dept.commonConditions.slice(0, 25),
      diagnostics: dept.diagnostics.slice(0, 20),
      relatedSlugs: dept.relatedSlugs.slice(0, 10),
      isActive: Boolean(dept.isActive),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `departments/${dept.id}`);
  }
}

export async function adminDeleteDepartment(departmentId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'departments', departmentId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `departments/${departmentId}`);
  }
}

export async function adminUpdateAppointmentStatus(
  appt: AppointmentRequest,
  status: AppointmentStatus
): Promise<void> {
  if (appt.isLocalPreview) {
    const list = getPreviewAppointments().map((item) =>
      item.id === appt.id ? { ...item, status, updatedAt: new Date().toISOString() } : item
    );
    safeStorageSet(PREVIEW_APPTS_KEY, JSON.stringify(list));
    return;
  }
  try {
    await updateDoc(doc(db, 'appointments', appt.id), {
      status,
      updatedAt: serverTimestamp(),
    });
    if (status === 'cancelled' || status === 'rejected') {
      const slotRef = doc(db, 'appointmentSlots', appt.slotKey);
      const slotSnap = await getDoc(slotRef);
      if (slotSnap.exists()) {
        await updateDoc(slotRef, { status: 'released', updatedAt: serverTimestamp() });
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `appointments/${appt.id}`);
  }
}

export async function adminSaveHealthPackage(pkg: HealthPackage): Promise<void> {
  try {
    await setDoc(doc(db, 'healthPackages', pkg.id), {
      id: pkg.id,
      slug: sanitizeText(pkg.slug, 128),
      name: sanitizeText(pkg.name, 140),
      category: sanitizeText(pkg.category, 80),
      description: sanitizeText(pkg.description, 2000),
      targetAudience: sanitizeText(pkg.targetAudience || '', 200),
      priceDemo: Number(pkg.priceDemo) || 0,
      includedTests: pkg.includedTests.slice(0, 40),
      preparation: sanitizeText(pkg.preparation || '', 1000),
      imageUrl: sanitizeText(pkg.imageUrl || '', 300),
      isPublished: Boolean(pkg.isPublished),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `healthPackages/${pkg.id}`);
  }
}

export async function adminSaveArticle(article: Article): Promise<void> {
  try {
    await setDoc(doc(db, 'articles', article.id), {
      id: article.id,
      slug: sanitizeText(article.slug, 128),
      title: sanitizeText(article.title, 200),
      kind: article.kind,
      category: sanitizeText(article.category, 80),
      summary: sanitizeText(article.summary, 500),
      content: sanitizeText(article.content, 10000),
      author: sanitizeText(article.author || '', 120),
      publishedDate: sanitizeText(article.publishedDate || '', 30),
      imageUrl: sanitizeText(article.imageUrl || '', 300),
      isPublished: Boolean(article.isPublished),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `articles/${article.id}`);
  }
}

export async function adminDeleteArticle(articleId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'articles', articleId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `articles/${articleId}`);
  }
}

export async function adminUpdateInquiryStatus(
  inquiry: Inquiry,
  status: Inquiry['status']
): Promise<void> {
  if (inquiry.isLocalPreview) {
    const list = getPreviewInquiries().map((item) =>
      item.id === inquiry.id ? { ...item, status, updatedAt: new Date().toISOString() } : item
    );
    safeStorageSet(PREVIEW_INQUIRIES_KEY, JSON.stringify(list));
    return;
  }
  try {
    await updateDoc(doc(db, 'inquiries', inquiry.id), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `inquiries/${inquiry.id}`);
  }
}

export async function adminSaveWebsiteSettings(settings: WebsiteSettings): Promise<void> {
  try {
    await setDoc(doc(db, 'websiteSettings', 'main'), {
      hospitalName: sanitizeText(settings.hospitalName, 100),
      emergencyNotice: sanitizeText(settings.emergencyNotice, 500),
      emergencyContactLabel: sanitizeText(settings.emergencyContactLabel, 120),
      generalPhoneLabel: sanitizeText(settings.generalPhoneLabel || '', 120),
      contactEmail: sanitizeText(settings.contactEmail, 160),
      address: sanitizeText(settings.address, 300),
      defaultLanguage: settings.defaultLanguage,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'websiteSettings/main');
  }
}
