import type {
  AppointmentRequest,
  Article,
  Department,
  DiagnosticService,
  Doctor,
  FaqItem,
  HealthPackage,
} from '../types/hospital';

export interface AppointmentFormInput {
  patientName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  email: string;
  departmentId: string;
  doctorId: string;
  preferredDate: string;
  timeSlot: string;
  consultationType: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

const memoryStorageFallback = new Map<string, string>();

export function safeStorageGet(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch {
    // Restricted iframe / third-party storage blocked
  }
  return memoryStorageFallback.get(key) ?? null;
}

export function safeStorageSet(key: string, value: string): void {
  memoryStorageFallback.set(key, value);
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  } catch {
    // Restricted iframe / third-party storage blocked
  }
}

export function sanitizeText(value: string, maxLength: number): string {
  return value
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, maxLength);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/[^\d]/g, '');
  return digits.length >= 7 && digits.length <= 15 && /^[+\d\s\-()]+$/.test(phone.trim());
}

export function buildSlotKey(doctorId: string, preferredDate: string, timeSlot: string): string {
  const cleanDoc = doctorId.replace(/[^a-zA-Z0-9_-]/g, '-');
  const cleanDate = preferredDate.replace(/[^a-zA-Z0-9_-]/g, '-');
  const cleanSlot = timeSlot.replace(/[^a-zA-Z0-9_-]/g, '-').toLowerCase();
  return `${cleanDoc}_${cleanDate}_${cleanSlot}`.slice(0, 128);
}

export function generateReferenceNumber(prefix = 'NCH'): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${y}${m}${d}-${rand}`;
}

export function validateAppointmentForm(
  input: AppointmentFormInput,
  todayIso?: string
): ValidationResult {
  const errors: Record<string, string> = {};
  const todayStr = todayIso || new Date().toISOString().slice(0, 10);

  if (sanitizeText(input.patientName, 120).length < 2) {
    errors.patientName = 'Please enter the patient full name (at least 2 characters).';
  }

  if (!input.dateOfBirth || !/^\d{4}-\d{2}-\d{2}$/.test(input.dateOfBirth)) {
    errors.dateOfBirth = 'Please select a valid date of birth.';
  } else if (input.dateOfBirth > todayStr) {
    errors.dateOfBirth = 'Date of birth cannot be in the future.';
  }

  if (!['Male', 'Female', 'Other'].includes(input.gender)) {
    errors.gender = 'Please select a gender option.';
  }

  if (!isValidPhone(input.phone)) {
    errors.phone = 'Please enter a valid contact phone number (7–15 digits).';
  }

  if (!isValidEmail(input.email)) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!input.departmentId) {
    errors.departmentId = 'Please choose a medical department.';
  }

  if (!input.doctorId) {
    errors.doctorId = 'Please choose a specialist.';
  }

  if (!input.preferredDate || !/^\d{4}-\d{2}-\d{2}$/.test(input.preferredDate)) {
    errors.preferredDate = 'Please select a preferred appointment date.';
  } else {
    if (input.preferredDate < todayStr) {
      errors.preferredDate = 'Preferred appointment date must be today or in the future.';
    } else {
      const start = new Date(todayStr + 'T00:00:00Z').getTime();
      const target = new Date(input.preferredDate + 'T00:00:00Z').getTime();
      const diffDays = (target - start) / (1000 * 60 * 60 * 24);
      if (diffDays > 90) {
        errors.preferredDate = 'Appointment requests can be made up to 90 days in advance.';
      }
    }
  }

  if (!input.timeSlot) {
    errors.timeSlot = 'Please select an available time slot.';
  }

  if (!['In-Person', 'Online Video'].includes(input.consultationType)) {
    errors.consultationType = 'Please choose In-Person or Online Video consultation.';
  }

  if (input.message && input.message.length > 1000) {
    errors.message = 'Additional notes must be under 1,000 characters.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function isSlotBooked(
  appointments: AppointmentRequest[],
  doctorId: string,
  preferredDate: string,
  timeSlot: string
): boolean {
  const key = buildSlotKey(doctorId, preferredDate, timeSlot);
  return appointments.some(
    (appt) =>
      appt.slotKey === key &&
      appt.status !== 'cancelled' &&
      appt.status !== 'rejected'
  );
}

const URGENT_SYMPTOM_PATTERNS = [
  /chest pain/i,
  /difficulty breathing/i,
  /shortness of breath/i,
  /can't breathe/i,
  /cannot breathe/i,
  /heart attack/i,
  /stroke/i,
  /unconscious/i,
  /severe bleeding/i,
  /heavy bleeding/i,
  /seizure/i,
  /suicid/i,
  /overdose/i,
  /anaphylaxis/i,
  /paralysis/i,
  /বুকে ব্যথা/,
  /শ্বাসকষ্ট/,
  /অজ্ঞান/,
  /স্ট্রোক/,
  /প্রচণ্ড রক্তপাত/,
];

export function detectUrgentSymptoms(message: string): boolean {
  return URGENT_SYMPTOM_PATTERNS.some((pattern) => pattern.test(message));
}

export function filterDoctors(
  doctors: Doctor[],
  options: {
    query?: string;
    departmentId?: string;
    availableOnly?: boolean;
    sortBy?: 'name' | 'experience';
  }
): Doctor[] {
  const q = (options.query || '').trim().toLowerCase();
  const filtered = doctors.filter((doc) => {
    if (options.departmentId && options.departmentId !== 'all' && doc.departmentId !== options.departmentId) {
      return false;
    }
    if (options.availableOnly && !doc.isAvailableToday) {
      return false;
    }
    if (!q) return true;
    return (
      doc.name.toLowerCase().includes(q) ||
      doc.departmentName.toLowerCase().includes(q) ||
      doc.qualifications.toLowerCase().includes(q) ||
      doc.designation.toLowerCase().includes(q)
    );
  });

  return [...filtered].sort((a, b) => {
    if (options.sortBy === 'experience') {
      return b.experienceYears - a.experienceYears;
    }
    return a.name.localeCompare(b.name);
  });
}

export function filterHealthPackages(
  packages: HealthPackage[],
  options: {
    query?: string;
    category?: string;
    includeUnpublished?: boolean;
  }
): HealthPackage[] {
  const q = (options.query || '').trim().toLowerCase();
  return packages.filter((pkg) => {
    if (!options.includeUnpublished && !pkg.isPublished) return false;
    if (options.category && options.category !== 'all' && pkg.category !== options.category) {
      return false;
    }
    if (!q) return true;
    return (
      pkg.name.toLowerCase().includes(q) ||
      pkg.category.toLowerCase().includes(q) ||
      pkg.description.toLowerCase().includes(q) ||
      pkg.includedTests.some((t) => t.toLowerCase().includes(q))
    );
  });
}

export interface GlobalSearchResults {
  doctors: Doctor[];
  departments: Department[];
  packages: HealthPackage[];
  diagnostics: DiagnosticService[];
  articles: Article[];
  faqs: FaqItem[];
}

export function runGlobalSearch(
  query: string,
  datasets: {
    doctors: Doctor[];
    departments: Department[];
    packages: HealthPackage[];
    diagnostics: DiagnosticService[];
    articles: Article[];
    faqs: FaqItem[];
  }
): GlobalSearchResults {
  const q = query.trim().toLowerCase();
  if (!q) {
    return {
      doctors: [],
      departments: [],
      packages: [],
      diagnostics: [],
      articles: [],
      faqs: [],
    };
  }
  return {
    doctors: datasets.doctors
      .filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.departmentName.toLowerCase().includes(q) ||
          d.designation.toLowerCase().includes(q)
      )
      .slice(0, 5),
    departments: datasets.departments
      .filter(
        (dept) =>
          dept.name.toLowerCase().includes(q) ||
          dept.overview.toLowerCase().includes(q) ||
          dept.commonConditions.some((c) => c.toLowerCase().includes(q))
      )
      .slice(0, 6),
    packages: datasets.packages
      .filter(
        (p) =>
          p.isPublished &&
          (p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
      )
      .slice(0, 4),
    diagnostics: datasets.diagnostics
      .filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q)
      )
      .slice(0, 4),
    articles: datasets.articles
      .filter(
        (a) =>
          a.isPublished &&
          (a.title.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q))
      )
      .slice(0, 4),
    faqs: datasets.faqs
      .filter(
        (f) =>
          f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q)
      )
      .slice(0, 4),
  };
}
