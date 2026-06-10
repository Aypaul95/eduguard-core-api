# EduGuard ERD (Entity Relationship Documentation)

## Overview
EduGuard is a multi-tenant school management system where **School** is the root tenant entity.
All data is scoped using `schoolId` to enforce strict isolation between schools.

---

# 1. Core Multi-Tenant Structure

## School (Root Entity)
- A School is the highest-level entity in the system.
- Every record belongs to a school via `schoolId`.

Relationships:
- School → Users (1:M)
- School → Roles (1:M)
- School → Students (1:M)
- School → Parents (1:M)
- School → Classes (1:M)
- School → Academic Sessions (1:M)
- School → Financial Records (1:M)
- School → System Logs (1:M)

---

## User
Represents staff, admin, teachers, accountants, students, parents.

Relationships:
- User → School (M:1)
- User → UserRoleAssignment (1:M)
- User → AuditLog (1:M)
- User → Tokens (1:M)

---

## Role & Permission System (RBAC)

### Role
- Defined per school

Relationships:
- Role → School (M:1)
- Role → UserRoleAssignment (1:M)
- Role → RolePermission (1:M)

### Permission
- Fine-grained access control (e.g. `student.create`)

Relationships:
- Permission → RolePermission (1:M)

### UserRoleAssignment
- Bridges User and Role

Relationships:
- UserRoleAssignment → User (M:1)
- UserRoleAssignment → Role (M:1)

---

# 2. Academic Structure

## Student
Core learner entity.

Relationships:
- Student → School (M:1)
- Student → ParentStudent (M:M via join)
- Student → Enrollment (1:M)
- Student → AttendanceRecord (1:M)
- Student → Result (1:M)
- Student → ReportCard (1:M)
- Student → Invoice (1:M)
- Student → Scholarship (1:M)

---

## Parent
Represents guardians.

Relationships:
- Parent → School (M:1)
- Parent → ParentStudent (1:M)

---

## ParentStudent (Join Table)
Connects parents and students.

---

## Class
Represents academic classes (JSS1, SS2, etc.)

Relationships:
- Class → School (M:1)
- Class → Enrollment (1:M)
- Class → Attendance (1:M)

---

## Enrollment
Tracks student-class assignment per academic year.

Relationships:
- Enrollment → Student (M:1)
- Enrollment → Class (M:1)

---

# 3. Academic Intelligence System

## AcademicSession
Represents academic years (e.g. 2025/2026)

Relationships:
- AcademicSession → School (M:1)
- AcademicSession → Term (1:M)
- AcademicSession → ReportCard (1:M)

---

## Term
Each session has 3 terms.

Relationships:
- Term → AcademicSession (M:1)
- Term → Exam (1:M)
- Term → ReportCard (1:M)

---

## Subject
Academic subjects per school.

Relationships:
- Subject → School (M:1)
- Subject → Exam (1:M)

---

## Exam
Assessments (CA, MIDTERM, EXAM)

Relationships:
- Exam → School (M:1)
- Exam → Term (M:1)
- Exam → Subject (M:1)
- Exam → Result (1:M)

---

## Result
Stores student scores per exam.

Relationships:
- Result → Student (M:1)
- Result → Exam (M:1)

---

## ReportCard
Aggregated academic performance.

Relationships:
- ReportCard → Student (M:1)
- ReportCard → AcademicSession (M:1)
- ReportCard → Term (M:1)
- ReportCard → ReportCardComment (1:M)

---

# 4. Revenue Protection System

## FeeCategory
(e.g. Tuition, Transport, PTA)

Relationships:
- FeeCategory → School (M:1)
- FeeCategory → FeeStructure (1:M)

---

## FeeStructure
Defines fee amounts per class or category.

Relationships:
- FeeStructure → School (M:1)
- FeeStructure → FeeCategory (M:1)
- FeeStructure → StudentFeeAssignment (1:M)

---

## StudentFeeAssignment
Assigns fees to students.

Relationships:
- StudentFeeAssignment → Student (M:1)
- StudentFeeAssignment → FeeStructure (M:1)

---

## Invoice
Billing record for students.

Relationships:
- Invoice → School (M:1)
- Invoice → Student (M:1)
- Invoice → InvoiceItem (1:M)
- Invoice → Payment (1:M)

---

## Payment
Payments made for invoices.

Relationships:
- Payment → School (M:1)
- Payment → Invoice (M:1)
- Payment → PaymentTransaction (1:1)

---

## PaymentTransaction
Gateway-level payment tracking.

Relationships:
- PaymentTransaction → Payment (1:1)

---

## Discount & Scholarship
Financial relief mechanisms.

Relationships:
- Scholarship → Student (M:1)
- Discount → School (M:1)

---

## ExpenseCategory & Expense
School expenses tracking.

Relationships:
- ExpenseCategory → School (M:1)
- Expense → ExpenseCategory (M:1)

---

# 5. System Intelligence Layer

## Notification
System messaging hub.

Relationships:
- Notification → School (M:1)
- Notification → NotificationRecipient (1:M)

---

## NotificationRecipient
Tracks delivery/read status.

Relationships:
- NotificationRecipient → Notification (M:1)

---

## AuditLog
Tracks all system actions.

Relationships:
- AuditLog → School (M:1)
- AuditLog → User (M:1)

---

## SystemEvent
Global event tracking system.

Relationships:
- SystemEvent → School (optional M:1)

---

## Snapshots (Analytics Layer)

### RevenueSnapshot
- Financial summaries per period

### AttendanceSnapshot
- Attendance analytics per class

### AcademicSnapshot
- Academic performance metrics

All snapshots:
- Belong to School (M:1)
- Used for reporting and dashboards

---

## SchoolSetting
Key-value configuration store per school.

Relationships:
- SchoolSetting → School (M:1)

---

# 6. Multi-Tenant Rule (CRITICAL)

## Every record MUST obey:
- `schoolId` is required (except system-level logs)
- Data isolation is enforced at query level
- No cross-school data access allowed

---

# 7. Key Design Principles

- 🏫 School = Tenant (NO tenant terminology used)
- 🔐 Strict RBAC via Role → Permission
- 📊 Separation of Academic + Financial domains
- ⚡ Snapshot tables for analytics performance
- 🧱 Fully normalized relational structure
- 🔒 Multi-tenant isolation enforced everywhere

---

# 8. Summary

EduGuard is designed as a **school-first multi-tenant SaaS platform** with:

- Academic Intelligence Layer
- Revenue Protection System
- Role-Based Access Control
- Financial Tracking System
- System-wide Audit Logging

All data is isolated using:
> `schoolId`