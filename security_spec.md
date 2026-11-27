# Nova Care Hospital — Firestore Security Specification

## 1. Data Invariants

1. **PII Isolation**: Patient profiles (`users/{userId}`), appointment requests (`appointments/{appointmentId}`), package bookings (`packageBookings/{bookingId}`), inquiries (`inquiries/{inquiryId}`), feedback (`feedback/{feedbackId}`), job applications (`jobApplications/{applicationId}`), notifications (`notifications/{notificationId}`), and diagnostic reports (`reports/{reportId}`) are strictly restricted to the authenticated owner (`resource.data.userId == request.auth.uid`) or a verified admin (`isAdmin()`).
2. **No Self-Assigned Privileges**: Users cannot write `role: "admin"` to `users/{userId}` or create documents in `admins/{uid}` unless already an admin or bootstrapped via the verified runtime email (`mansuramim439@gmail.com` with `email_verified == true`).
3. **Slot Uniqueness & Transactional Integrity**: Every appointment creation targeting `appointments/{appointmentId}` must reference a valid `slotKey` (`appointmentSlots/{slotKey}`) owned by the same `request.auth.uid` atomically (`existsAfter` / `getAfter`).
4. **Immutable Ownership & Timestamps**: `userId`, `createdAt`, and `referenceNumber` cannot be altered after creation. Timestamps `createdAt` (on create) and `updatedAt` (on create/update) must equal `request.time`.
5. **Email Verification Gate**: All authenticated write operations require `request.auth != null && request.auth.token.email_verified == true`.
6. **Admin Override & Terminal State Protection**: Non-admin patients can only submit cancellation or reschedule requests on non-terminal appointments (`pending`, `approved`) using `affectedKeys().hasOnly(['status', 'preferredDate', 'timeSlot', 'slotKey', 'updatedAt'])`. Terminal states (`cancelled`, `rejected`, `completed`) are locked to non-admins.
7. **Strict Path & Field Bounds**: All path IDs match `^[a-zA-Z0-9_-]{1,128}$`. Every string and bounded array enforces explicit `.size()` constraints. Shadow fields are blocked via `keys().hasOnly(...)` on create and `affectedKeys().hasOnly(...)` on update.

## 2. The "Dirty Dozen" Attack Payloads (All Must Return `PERMISSION_DENIED`)

1. **Self-Role Escalation**: Patient creates `users/{uid}` with `role: "admin"`.
2. **Admin Collection Poisoning**: Non-admin user writes `admins/{uid}` with `email: "attacker@example.com"`.
3. **Unverified Email Spoof**: User with `email: "mansuramim439@gmail.com"` and `email_verified: false` attempts admin write to `doctors/{id}`.
4. **Cross-User PII Read (`get`)**: User A reads `users/{userB}` or `appointments/{apptOfB}` or `reports/{reportOfB}`.
5. **Blanket List Scraping**: User A runs an unfiltered `list` query on `appointments` or `reports` without matching `userId == auth.uid`.
6. **Shadow Field Injection on Create**: User creates `appointments/{id}` including an extra `isApprovedByDirector: true` field.
7. **Identity Spoofing on Create**: User A creates `appointments/{id}` with `userId: "userB"`.
8. **Orphaned Appointment Without Atomic Slot Lock**: User A creates `appointments/{id}` without creating `appointmentSlots/{slotKey}` in the same transaction.
9. **Client Timestamp Forgery**: User creates `appointments/{id}` with backdated `createdAt` instead of `request.time`.
10. **Terminal State Bypass**: Patient updates a `cancelled` or `completed` appointment back to `approved`.
11. **Path ID Poisoning**: User attempts to write `appointments/` with a 300-character or slash/symbol-laden ID.
12. **Oversized Array / String DoW**: User writes a 10,000-character `message` into `inquiries/{id}` or `appointments/{id}`.
