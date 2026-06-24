export type UserRole = "ADMIN" | "SUPER_ADMIN";
export type UserStatus = "Active" | "Suspended";
export type ShopStatus = "Active" | "Inactive" | "Pending";
export type PaymentStatus = "Paid" | "Pending" | "Failed" | "Overdue";

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  avatar: string;
  createdDate: string;
}

export interface Dagmo {
  id: string;
  name: string;
  code: string;
  status: string;
  createdAt: string;
}

export interface Seedka {
  id: string;
  name: string;
  code: string;
  dagmoId: string;
  status: string;
  createdAt: string;
}

export interface Shop {
  id: string;
  name: string;
  code: string;
  dagmoId: string;
  seedkaId: string;
  ownerName: string;
  tNumber: string;
  phone: string;
  type: string;
  status: ShopStatus;
  createdDate: string;
  createdBy: string; // email (internal)
  createdById: string; // UUID (primary)
  deletedAt?: string;
}

export interface Payment {
  id: string; // e.g. PAY-4293
  shopId: string;
  amount: number;
  dagmoId: string;
  seedkaId: string;
  month: string;
  year: string;
  status: PaymentStatus;
  paidDate: string; // e.g. 'Oct 15, 2023' or '--'
  notes?: string;
  createdBy: string; // email of the user who registered it
  createdById: string; // UUID of the user who registered it
  isLocked: boolean;
  lockedDate?: string;
  auditTrailId: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  userEmail: string;
  entityInfo: string;
  ipAddress: string;
}
