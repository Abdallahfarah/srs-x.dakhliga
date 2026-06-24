import React from "react";
import { 
  Plus, LayoutDashboard, Store, Receipt, Users, Settings, 
  HelpCircle, LogOut, Building2
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface SidebarProps {
  onAddShop: () => void;
}

export function Sidebar({ onAddShop }: SidebarProps) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isAdmin = currentUser?.role === "ADMIN";
  const prefix = isAdmin ? "/admin" : "/super-admin";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname.includes(path);

  return (
    <aside className="w-64 bg-[#0B0C0E] text-[#8A8F98] shrink-0 hidden md:flex flex-col justify-between border-r border-[#1F2124] h-screen sticky top-0 font-sans">
      <div className="flex flex-col flex-1">
        {/* Logo Header */}
        <div className="p-4 flex items-center gap-3 border-b border-[#1F2124]">
          <div className="w-8 h-8 bg-[#4F46E5] rounded flex items-center justify-center text-white font-heavy text-xs shrink-0 shadow-sm shadow-[#4F46E5]/30">
            SX
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-white text-xs font-semibold leading-none tracking-tight truncate">SRS X.Dakhliga</span>
            <span className="text-[9px] text-[#5E6269] mt-1 font-semibold tracking-wider uppercase">HQ Console</span>
          </div>
        </div>

        {/* Quick Action button in sidebar */}
        <div className="p-3">
          <button
            onClick={onAddShop}
            className="w-full py-1.5 px-3 bg-[#4F46E5] hover:bg-[#4338CA] text-[11px] font-semibold text-white rounded transition shadow-sm flex items-center justify-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            Add New Shop
          </button>
        </div>

        {/* Nav Item Stack */}
        <nav className="flex-1 px-3 mt-4 space-y-1">
          <div className="text-[10px] font-bold text-[#5E6269] uppercase tracking-wider mb-2 px-2">Workspace</div>
          
          <button
            onClick={() => navigate(`${prefix}/dashboard`)}
            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-xs transition-colors text-left ${
              isActive("dashboard") ? "bg-[#1F2124] text-white font-medium" : "text-[#8A8F98] hover:bg-[#1F2124] hover:text-white"
            }`}
          >
            <LayoutDashboard className="h-3.5 w-3.5 opacity-80 shrink-0" />
            Dashboard
          </button>

          <button
            onClick={() => navigate(`${prefix}/shops`)}
            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-xs transition-colors text-left ${
              isActive("shops") ? "bg-[#1F2124] text-white font-medium" : "text-[#8A8F98] hover:bg-[#1F2124] hover:text-white"
            }`}
          >
            <Store className="h-3.5 w-3.5 opacity-80 shrink-0" />
            Shop Management
          </button>

          <button
            onClick={() => navigate(`${prefix}/${isAdmin ? "history" : "payments"}`)}
            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-xs transition-colors text-left ${
              isActive("history") || isActive("payments") ? "bg-[#1F2124] text-white font-medium" : "text-[#8A8F98] hover:bg-[#1F2124] hover:text-white"
            }`}
          >
            <Receipt className="h-3.5 w-3.5 opacity-80 shrink-0" />
            {isAdmin ? "Payment History" : "Payment Logs"}
          </button>

          {!isAdmin && (
            <>
              <button
                onClick={() => navigate(`${prefix}/dagmos`)}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-xs transition-colors text-left ${
                  isActive("dagmos") ? "bg-[#1F2124] text-white font-medium" : "text-[#8A8F98] hover:bg-[#1F2124] hover:text-white"
                }`}
              >
                <Building2 className="h-3.5 w-3.5 opacity-80 shrink-0" />
                Dagmos
              </button>

              <button
                onClick={() => navigate(`${prefix}/users`)}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-xs transition-colors text-left ${
                  isActive("users") ? "bg-[#1F2124] text-white font-medium" : "text-[#8A8F98] hover:bg-[#1F2124] hover:text-white"
                }`}
              >
                <Users className="h-3.5 w-3.5 opacity-80 shrink-0" />
                User Access
              </button>

              <button
                onClick={() => navigate(`${prefix}/audit-logs`)}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-xs transition-colors text-left ${
                  isActive("audit-logs") ? "bg-[#1F2124] text-white font-medium" : "text-[#8A8F98] hover:bg-[#1F2124] hover:text-white"
                }`}
              >
                <Settings className="h-3.5 w-3.5 opacity-80 shrink-0" />
                Audit Logs
              </button>

              <button
                onClick={() => navigate(`${prefix}/settings`)}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-xs transition-colors text-left ${
                  isActive("settings") ? "bg-[#1F2124] text-white font-medium" : "text-[#8A8F98] hover:bg-[#1F2124] hover:text-white"
                }`}
              >
                <Settings className="h-3.5 w-3.5 opacity-80 shrink-0" />
                Settings
              </button>
            </>
          )}

          {isAdmin && (
            <button
              onClick={() => navigate(`${prefix}/profile`)}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-xs transition-colors text-left ${
                isActive("profile") ? "bg-[#1F2124] text-white font-medium" : "text-[#8A8F98] hover:bg-[#1F2124] hover:text-white"
              }`}
            >
              <Settings className="h-3.5 w-3.5 opacity-80 shrink-0" />
              Profile
            </button>
          )}

        </nav>
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-[#1F2124] space-y-2">
        <a href="#" className="flex items-center gap-2 px-2 py-1 text-xs text-[#8A8F98] hover:text-white transition-colors">
          <HelpCircle className="h-3.5 w-3.5 opacity-80" />
          Support
        </a>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-2 py-1 text-xs text-rose-500 hover:text-rose-400 font-medium hover:bg-[#1F2124]/30 rounded transition-colors text-left"
        >
          <LogOut className="h-3.5 w-3.5 opacity-80" />
          Logout
        </button>
      </div>
    </aside>
  );
}
