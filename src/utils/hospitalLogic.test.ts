import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildSlotKey,
  detectUrgentSymptoms,
  filterDoctors,
  filterHealthPackages,
  isSlotBooked,
  runGlobalSearch,
  sanitizeText,
  validateAppointmentForm,
} from './hospitalLogic';
import type { AppointmentRequest, Doctor, HealthPackage } from '../types/hospital';

test('validateAppointmentForm rejects invalid fields and past dates', () => {
  const result = validateAppointmentForm(
    {
      patientName: 'A',
      dateOfBirth: '2030-01-01',
      gender: '',
      phone: '123',
      email: 'not-an-email',
      departmentId: '',
      doctorId: '',
      preferredDate: '2026-11-20',
      timeSlot: '',
      consultationType: '',
      message: '',
    },
    '2026-11-26'
  );
  assert.equal(result.valid, false);
  assert.ok(result.errors.patientName);
  assert.ok(result.errors.dateOfBirth);
  assert.ok(result.errors.phone);
  assert.ok(result.errors.email);
  assert.ok(result.errors.preferredDate);
});

test('validateAppointmentForm accepts valid complete appointment request', () => {
  const result = validateAppointmentForm(
    {
      patientName: 'Nadia Rahman',
      dateOfBirth: '1992-05-14',
      gender: 'Female',
      phone: '+8801711000000',
      email: 'nadia@example.com',
      departmentId: 'cardiology',
      doctorId: 'dr-priya-sharma',
      preferredDate: '2026-12-02',
      timeSlot: '10:00 AM',
      consultationType: 'In-Person',
      message: 'Annual cardiac checkup follow-up',
    },
    '2026-11-26'
  );
  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, {});
});

test('buildSlotKey and isSlotBooked prevent duplicate slot reservations while ignoring cancelled slots', () => {
  const key = buildSlotKey('dr-priya-sharma', '2026-12-02', '10:00 AM');
  assert.match(key, /^[a-zA-Z0-9_-]+$/);

  const existing: AppointmentRequest[] = [
    {
      id: 'appt-1',
      referenceNumber: 'NCH-20261126-ABCD',
      userId: 'u1',
      patientName: 'Test',
      dateOfBirth: '1990-01-01',
      gender: 'Male',
      phone: '01700000000',
      email: 't@example.com',
      departmentId: 'cardiology',
      departmentName: 'Cardiology',
      doctorId: 'dr-priya-sharma',
      doctorName: 'Dr. Priya Sharma',
      preferredDate: '2026-12-02',
      timeSlot: '10:00 AM',
      consultationType: 'In-Person',
      message: '',
      status: 'pending',
      slotKey: key,
      createdAt: '2026-11-26T00:00:00Z',
      updatedAt: '2026-11-26T00:00:00Z',
    },
    {
      id: 'appt-2',
      referenceNumber: 'NCH-20261126-EFGH',
      userId: 'u2',
      patientName: 'Test 2',
      dateOfBirth: '1990-01-01',
      gender: 'Female',
      phone: '01700000001',
      email: 't2@example.com',
      departmentId: 'cardiology',
      departmentName: 'Cardiology',
      doctorId: 'dr-priya-sharma',
      doctorName: 'Dr. Priya Sharma',
      preferredDate: '2026-12-02',
      timeSlot: '11:30 AM',
      consultationType: 'In-Person',
      message: '',
      status: 'cancelled',
      slotKey: buildSlotKey('dr-priya-sharma', '2026-12-02', '11:30 AM'),
      createdAt: '2026-11-26T00:00:00Z',
      updatedAt: '2026-11-26T00:00:00Z',
    },
  ];

  assert.equal(isSlotBooked(existing, 'dr-priya-sharma', '2026-12-02', '10:00 AM'), true);
  assert.equal(isSlotBooked(existing, 'dr-priya-sharma', '2026-12-02', '11:30 AM'), false);
});

test('detectUrgentSymptoms identifies emergency phrases in English and Bangla', () => {
  assert.equal(detectUrgentSymptoms('I have severe chest pain and difficulty breathing'), true);
  assert.equal(detectUrgentSymptoms('আমার বুকে ব্যথা হচ্ছে'), true);
  assert.equal(detectUrgentSymptoms('What are the visiting hours for cardiology?'), false);
});

test('filterDoctors and filterHealthPackages and runGlobalSearch filter accurately', () => {
  const docs: Doctor[] = [
    {
      id: 'd1',
      slug: 'dr-priya-sharma',
      name: 'Dr. Priya Sharma',
      designation: 'Senior Consultant',
      departmentId: 'cardiology',
      departmentName: 'Cardiology',
      qualifications: 'MBBS, MD',
      experienceYears: 18,
      bio: 'Cardiology specialist bio',
      consultationDays: ['Sun', 'Tue'],
      availableSlots: ['09:30 AM'],
      consultationFeeDemo: 1500,
      photoUrl: '',
      isFeatured: true,
      isAvailableToday: true,
      languages: ['English'],
    },
    {
      id: 'd2',
      slug: 'dr-david-chen',
      name: 'Dr. David Chen',
      designation: 'Chief Neurologist',
      departmentId: 'neurology',
      departmentName: 'Neurology',
      qualifications: 'MBBS, FCPS',
      experienceYears: 22,
      bio: 'Neurology specialist bio',
      consultationDays: ['Mon'],
      availableSlots: ['10:00 AM'],
      consultationFeeDemo: 1800,
      photoUrl: '',
      isFeatured: true,
      isAvailableToday: false,
      languages: ['English'],
    },
  ];

  assert.equal(filterDoctors(docs, { availableOnly: true }).length, 1);
  assert.equal(filterDoctors(docs, { sortBy: 'experience' })[0].id, 'd2');

  const pkgs: HealthPackage[] = [
    {
      id: 'p1',
      slug: 'cardiac-check',
      name: 'Cardiac Check',
      category: 'Cardiac Check',
      description: 'Heart screening',
      targetAudience: 'Adults',
      priceDemo: 8500,
      includedTests: ['ECG', 'Lipid Profile'],
      preparation: 'Fasting 8h',
      imageUrl: '',
      isPublished: true,
    },
    {
      id: 'p2',
      slug: 'draft-pkg',
      name: 'Draft Package',
      category: 'General Health Check',
      description: 'Hidden',
      targetAudience: 'Adults',
      priceDemo: 2000,
      includedTests: ['CBC'],
      preparation: 'None',
      imageUrl: '',
      isPublished: false,
    },
  ];

  assert.equal(filterHealthPackages(pkgs, {}).length, 1);
  const searchRes = runGlobalSearch('Cardio', {
    doctors: docs,
    departments: [],
    packages: pkgs,
    diagnostics: [],
    articles: [],
    faqs: [],
  });
  assert.equal(searchRes.doctors.length, 1);
});

test('sanitizeText strips angle brackets and enforces maxLength', () => {
  assert.equal(sanitizeText('<script>alert(1)</script> Hello', 15), 'scriptalert(1)/');
});
