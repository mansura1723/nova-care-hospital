export type Language = 'en' | 'bn';
export type ThemeMode = 'light' | 'dark';

export interface Doctor {
  id: string;
  slug: string;
  name: string;
  designation: string;
  departmentId: string;
  departmentName: string;
  qualifications: string;
  experienceYears: number;
  bio: string;
  consultationDays: string[];
  availableSlots: string[];
  consultationFeeDemo: number;
  photoUrl: string;
  isFeatured: boolean;
  isAvailableToday: boolean;
  languages: string[];
  updatedAt?: string;
}

export type BodyRegion =
  | 'head'
  | 'chest'
  | 'abdomen'
  | 'musculoskeletal'
  | 'reproductive'
  | 'pediatric'
  | 'systemic';

export interface Department {
  id: string;
  slug: string;
  name: string;
  nameBn: string;
  category: string;
  bodyRegion: BodyRegion;
  overview: string;
  services: string[];
  commonConditions: string[];
  diagnostics: string[];
  relatedSlugs: string[];
  isActive: boolean;
  updatedAt?: string;
}

export type AppointmentStatus =
  | 'pending'
  | 'approved'
  | 'reschedule_requested'
  | 'cancelled'
  | 'rejected'
  | 'completed';

export interface AppointmentRequest {
  id: string;
  referenceNumber: string;
  userId: string;
  patientName: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  email: string;
  departmentId: string;
  departmentName: string;
  doctorId: string;
  doctorName: string;
  preferredDate: string;
  timeSlot: string;
  consultationType: 'In-Person' | 'Online Video';
  message: string;
  status: AppointmentStatus;
  slotKey: string;
  createdAt: string;
  updatedAt: string;
  isLocalPreview?: boolean;
}

export interface HealthPackage {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  targetAudience: string;
  priceDemo: number;
  includedTests: string[];
  preparation: string;
  imageUrl: string;
  isPublished: boolean;
  updatedAt?: string;
}

export interface PackageBooking {
  id: string;
  referenceNumber: string;
  userId: string;
  packageId: string;
  packageName: string;
  patientName: string;
  phone: string;
  email: string;
  preferredDate: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  isLocalPreview?: boolean;
}

export interface DiagnosticService {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  preparation: string;
  turnaroundTime: string;
  priceDemo: number;
  updatedAt?: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  kind: 'news' | 'article' | 'event' | 'story' | 'press';
  category: string;
  summary: string;
  content: string;
  author: string;
  publishedDate: string;
  imageUrl: string;
  isPublished: boolean;
  updatedAt?: string;
}

export interface Inquiry {
  id: string;
  userId: string;
  type: 'general' | 'diagnostic' | 'ambulance' | 'international';
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'new' | 'in_review' | 'resolved';
  createdAt: string;
  updatedAt: string;
  isLocalPreview?: boolean;
}

export interface PatientFeedback {
  id: string;
  userId: string;
  patientName: string;
  departmentName: string;
  rating: number;
  comment: string;
  status: 'submitted' | 'reviewed';
  createdAt: string;
  isLocalPreview?: boolean;
}

export interface PatientNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  category: 'appointment' | 'report' | 'system';
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface JobListing {
  id: string;
  title: string;
  department: string;
  employmentType: string;
  location: string;
  description: string;
  isOpen: boolean;
  updatedAt?: string;
}

export interface JobApplication {
  id: string;
  userId: string;
  jobId: string;
  jobTitle: string;
  applicantName: string;
  email: string;
  phone: string;
  cvFileName: string;
  coverNote: string;
  status: 'received' | 'shortlisted' | 'archived';
  createdAt: string;
  updatedAt: string;
  isLocalPreview?: boolean;
}

export interface DiagnosticReport {
  id: string;
  userId: string;
  reportCode: string;
  testName: string;
  category: string;
  reportDate: string;
  status: 'Ready' | 'Processing' | 'Sample Collected';
  summary: string;
  createdAt: string;
}

export interface PatientProfile {
  uid: string;
  displayName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  bloodGroup: string;
  role: 'patient';
  createdAt: string;
  updatedAt: string;
}

export interface WebsiteSettings {
  hospitalName: string;
  emergencyNotice: string;
  emergencyContactLabel: string;
  generalPhoneLabel: string;
  contactEmail: string;
  address: string;
  defaultLanguage: Language;
  updatedAt?: string;
}

export interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}
