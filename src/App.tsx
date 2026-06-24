import React, { useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { DataProvider, useData } from "./contexts/DataContext";
import { ToastProvider } from "./contexts/ToastContext";
import { LoginPage } from "./pages/LoginPage";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Existing Components (unchanged)
import { AdminOverview } from "./components/AdminOverview";
import { SuperAdminDashboard } from "./components/SuperAdminDashboard";
import { ShopManagement } from "./components/ShopManagement";
import { PaymentLogs } from "./components/PaymentLogs";
import { UserAccess } from "./components/UserAccess";
import { ProfileSettings } from "./components/ProfileSettings";
import { AuditLogs } from "./components/AuditLogs";
import { DagmoManagement } from "./components/DagmoManagement";
import { DagmoDetail } from "./components/DagmoDetail";

// Wrapper components that bridge context → props for each existing component
function OverviewPage() {
  const { currentUser } = useAuth();
  const { payments, shops, usersList, metrics, auditLogs } = useData();
  const navigate = useNavigate();

  if (currentUser?.role === "SUPER_ADMIN") {
    return (
      <SuperAdminDashboard 
        payments={payments} 
        shops={shops} 
        users={usersList}
        metrics={metrics}
        logs={auditLogs}
        onNavigate={(tab) => navigate(`/${tab}`)} 
      />
    );
  }

  return (
    <AdminOverview 
      payments={payments} 
      shops={shops} 
      logs={auditLogs.filter(l => l.userEmail === currentUser?.email)}
      onNavigate={(tab) => navigate(`/${tab}`)} 
      onViewPaymentDetail={() => {}} 
    />
  );
}

function ShopsPage() {
  const { currentUser } = useAuth();
  const { shops, payments, dagmos, seedkas, handleAddShop, handleDeleteShop, handleRestoreShop, handleAddPayment, handleDeletePayment } = useData();
  const [isAddingNew, setIsAddingNew] = useState(false);

  return (
    <ShopManagement
      shops={shops}
      payments={payments}
      dagmos={dagmos}
      seedkas={seedkas}
      isAddingNew={isAddingNew}
      setIsAddingNew={setIsAddingNew}
      currentUserRole={currentUser?.role || "ADMIN"}
      onAddShop={(shop) => handleAddShop(shop, currentUser?.email || "")}
      onDeleteShop={handleDeleteShop}
      onRestoreShop={handleRestoreShop}
      onAddPayment={handleAddPayment}
      onDeletePayment={handleDeletePayment}
      currentActorEmail={currentUser?.email || ""}
    />
  );
}

function PaymentsPage() {
  const { currentUser } = useAuth();
  const { payments, shops, dagmos, seedkas, handleAddPayment, handleModifyPayment, handleDeletePayment } = useData();

  // If ADMIN, only show payments they collected
  const filteredPayments = currentUser?.role === "ADMIN" 
    ? payments.filter(p => p.createdById === currentUser.id)
    : payments;

  return (
    <PaymentLogs
      payments={filteredPayments}
      shops={shops}
      dagmos={dagmos}
      seedkas={seedkas}
      currentUser={currentUser!}
      onAddPayment={handleAddPayment}
      onModifyPayment={handleModifyPayment}
      onDeletePayment={handleDeletePayment}
    />
  );
}

function UsersPage() {
  const { currentUser } = useAuth();
  const { usersList, shops, payments, dagmos, handleAddUser, handleToggleUserStatus, handleUpdateUser, handleLogAudit, handleResetPassword } = useData();

  return (
    <UserAccess
      users={usersList}
      shops={shops}
      payments={payments}
      dagmos={dagmos}
      currentUserId={currentUser?.id || ""}
      currentUserRole={currentUser?.role || "ADMIN"}
      onAddUser={handleAddUser}
      onUpdateUser={handleUpdateUser}
      onToggleUserStatus={handleToggleUserStatus}
      onLogAudit={handleLogAudit}
      onResetPassword={handleResetPassword}
    />
  );
}

function ProfilePage() {
  const { currentUser } = useAuth();
  const { handleUpdateCurrentUser } = useData();

  return (
    <ProfileSettings
      currentUser={currentUser!}
      onUpdateCurrentUser={(updated) => handleUpdateCurrentUser(currentUser!.id, updated)}
    />
  );
}

function SettingsPage() {
  const { auditLogs } = useData();
  return <AuditLogs logs={auditLogs} />;
}

function AppContent() {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === "ADMIN";
  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";

  if (!currentUser) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Navigate to={isAdmin ? "/admin/dashboard" : "/super-admin/dashboard"} replace />} />
      
      {/* Protected Routes Wrapper */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          
          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
            <Route path="/admin/dashboard" element={<OverviewPage />} />
            <Route path="/admin/shops" element={<ShopsPage />} />
            <Route path="/admin/history" element={<PaymentsPage />} />
            <Route path="/admin/profile" element={<ProfilePage />} />
          </Route>

          {/* Super Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={["SUPER_ADMIN"]} />}>
            <Route path="/super-admin/dashboard" element={<OverviewPage />} />
            <Route path="/super-admin/dagmos" element={<DagmoManagement />} />
            <Route path="/super-admin/dagmos/:id" element={<DagmoDetail />} />
            <Route path="/super-admin/shops" element={<ShopsPage />} />
            <Route path="/super-admin/payments" element={<PaymentsPage />} />
            <Route path="/super-admin/users" element={<UsersPage />} />
            <Route path="/super-admin/audit-logs" element={<SettingsPage />} />
            <Route path="/super-admin/settings" element={<SettingsPage />} />
          </Route>

          {/* Default Redirect */}
          <Route path="/" element={<Navigate to={isAdmin ? "/admin/dashboard" : "/super-admin/dashboard"} replace />} />
          <Route path="*" element={<Navigate to={isAdmin ? "/admin/dashboard" : "/super-admin/dashboard"} replace />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <DataProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </DataProvider>
  );
}
