# Precision Ledger

## Project Status

Current Status: UI Approved

Architecture: Planned

Database: Supabase PostgreSQL

Authentication: Supabase Auth

Frontend: React + TypeScript + Vite

---

# Core Rule

The existing UI is approved and is the source of truth.

Do not redesign existing screens.

Do not replace approved layouts.

Do not change visual identity without explicit approval.

---

# Product Purpose

Precision Ledger is a tenant payment tracking platform.

The system manages:

* Dagmos
* Seedkas
* Shops
* Monthly Payments
* Admin Users
* Audit Logs

---

# User Roles

## SUPER_ADMIN

System Owner.

Permissions:

* Manage Users
* Manage Shops
* Manage Dagmos
* Manage Seedkas
* View All Payments
* View Reports
* View Audit Logs
* Manage Settings

Access Scope:

All Records

---

## ADMIN

Field Collection Officer.

Permissions:

* Create Shops
* View Assigned Shops
* Collect Payments
* View Payment History
* Manage Profile

Restrictions:

* No User Management
* No Audit Logs
* No Reports
* No Settings
* No Access To Other Admin Data

Access Scope:

Owned Records Only

---

# Business Hierarchy

Dagmo
→ Seedka
→ Shop
→ Monthly Payment

Relationships:

One Dagmo → Many Seedkas

One Seedka → Many Shops

One Shop → Many Payments

One Admin → Many Shops

One Admin → Many Payments

---

# Application Flow

/login

↓

Authenticate User

↓

Load User Role

↓

SUPER_ADMIN Dashboard

OR

ADMIN Dashboard

---

# Required Routes

## Public

/login

---

## Admin

/admin/dashboard

/admin/shops

/admin/history

/admin/profile

---

## Super Admin

/super-admin/dashboard

/super-admin/shops

/super-admin/payments

/super-admin/users

/super-admin/audit-logs

/super-admin/settings

---

# Existing Components

Do Not Remove

* AdminOverview
* SuperAdminDashboard
* ShopManagement
* PaymentLogs
* UserAccess
* AuditLogs
* ProfileSettings

Extend existing components before creating new ones.

---

# Required Login Screen

Fields:

* Email
* Password

Actions:

* Sign In

Links:

* Forgot Password

Must match existing design system.

---

# Admin Sidebar

* Dashboard
* Shops
* Payment History
* Profile
* Logout

Admin must not see:

* Users
* Audit Logs
* Settings

---

# Super Admin Sidebar

* Dashboard
* Shops
* Payments
* Users
* Audit Logs
* Settings
* Logout

---

# Shops Screen

Columns:

* Shop Name
* Owner Name
* Phone
* Dagmo
* Seedka
* Status

Actions:

* View
* Collect Payment

Collect Payment is the primary Admin action.

---

# Collect Payment Workflow

Admin

↓

Open Shops

↓

Select Shop

↓

Collect Payment

↓

Enter Amount

↓

Complete Payment

System Auto-Fills:

* Shop
* Dagmo
* Seedka
* Current Month

User Inputs:

* Amount

---

# Payment History

Columns:

* Shop
* Month
* Amount
* Status
* Date

Admin only sees their own payment history.

---

# Database

Provider:

Supabase PostgreSQL

Tables:

profiles

dagmos

seedkas

shops

payments

audit_logs

---

# Authentication

Provider:

Supabase Auth

Required Features:

* Login
* Logout
* Password Reset
* Session Management
* Email Verification

Do not implement custom authentication.

Use Supabase Auth.

---

# Authorization

Role Based Access Control

Roles:

* SUPER_ADMIN
* ADMIN

Role stored in:

profiles.role

---

# Multi-Tenant Security

Use Supabase Row Level Security (RLS).

Admin can access:

records.created_by = auth.uid()

Admin cannot access:

Other Admin Records

Super Admin can access:

All Records

RLS policies are mandatory.

---

# Development Rules

1. Preserve Existing UI
2. Do Not Redesign Approved Screens
3. Reuse Existing Components
4. Extend Before Replacing
5. Implement Role-Based Navigation
6. Use Supabase Auth
7. Use Supabase RLS
8. Keep Mobile Friendly
9. Avoid Breaking Existing Functionality
10. Prefer Small Incremental Changes

---

# Not Allowed In Current Phase

* UI Redesign
* Component Replacement
* Major Refactors
* Custom Auth System
* Unapproved Layout Changes

---

# Success Criteria

✓ Login Screen Exists

✓ Role Detection Works

✓ Admin Dashboard Works

✓ Super Admin Dashboard Works

✓ Shop Creation Works

✓ Payment Collection Works

✓ Payment History Works

✓ User Management Works

✓ Audit Logs Work

✓ Supabase Auth Works

✓ RLS Policies Enforced

✓ Existing UI Preserved

✓ Production Ready
