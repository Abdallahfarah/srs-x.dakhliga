import { Bell, Search, User as UserIcon, LogOut, ChevronRight, LayoutDashboard, Store, Receipt, Users, Settings, Menu } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface HeaderProps {
  activeTab: string;
  onMenuToggle?: () => void;
}

export function Header({ activeTab, onMenuToggle }: HeaderProps) {
  const { currentUser, logout } = useAuth();

  const getBreadcrumb = () => {
    switch (activeTab) {
      case "overview": return { icon: <LayoutDashboard className="h-3 w-3" />, label: "Terminal Dashboard" };
      case "shops": return { icon: <Store className="h-3 w-3" />, label: "Shop Management" };
      case "payments": return { icon: <Receipt className="h-3 w-3" />, label: "Payment Logs" };
      case "users": return { icon: <Users className="h-3 w-3" />, label: "User Access Control" };
      case "settings": return { icon: <Settings className="h-3 w-3" />, label: "System Settings" };
      default: return { icon: <LayoutDashboard className="h-3 w-3" />, label: "Dashboard" };
    }
  };

  const bc = getBreadcrumb();

  return (
    <header className="h-14 bg-white border-b border-[#E1E4E8] flex items-center justify-between px-4 md:px-6 sticky top-0 z-40 font-sans">
      {/* Menu Toggle & Search */}
      <div className="flex items-center gap-2 md:gap-6">
        <button 
          onClick={onMenuToggle}
          className="p-2 -ml-2 text-gray-500 hover:text-[#1A1D21] hover:bg-gray-50 rounded md:hidden transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="relative group hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 group-focus-within:text-[#4F46E5] transition-colors" />
          <input
            type="text"
            placeholder="Search terminal..."
            className="bg-[#F7F8FA] border-none rounded-full pl-9 pr-4 py-1.5 text-xs w-64 focus:ring-1 focus:ring-[#4F46E5]/20 focus:bg-white transition-all text-gray-600 outline-none"
          />
        </div>

        {/* Dynamic Breadcrumbs */}
        <div className="flex items-center gap-2 text-[#5E6269] text-[11px] font-medium border-l border-[#E1E4E8] pl-6 hidden lg:flex">
          <span className="hover:text-[#1A1D21] cursor-pointer transition-colors">SRS X.Dakhliga</span>
          <ChevronRight className="h-3 w-3 opacity-50" />
          <div className="flex items-center gap-1.5 text-[#1A1D21] bg-[#F1F3F5] px-2 py-0.5 rounded shadow-sm border border-[#E1E4E8]">
            {bc.icon}
            <span className="font-bold tracking-tight">{bc.label}</span>
          </div>
        </div>
      </div>

      {/* Global Actions */}
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-400 hover:text-[#1A1D21] hover:bg-gray-50 rounded-full transition-all">
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 border-2 border-white rounded-full"></span>
        </button>

        <div className="h-8 w-[1px] bg-[#E1E4E8] mx-1"></div>

        {/* User Context */}
        <div className="flex items-center gap-3 pl-1">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-xs font-bold text-[#1A1D21] leading-tight uppercase tracking-tight">{currentUser?.name}</span>
            <span className={`text-[9px] font-heavy px-1.5 rounded-sm border ${
              currentUser?.role === 'SUPER_ADMIN' 
                ? 'bg-[#EEF2FF] text-[#4F46E5] border-[#4F46E5]/20' 
                : 'bg-stone-100 text-[#5E6269] border-stone-200'
            }`}>
              {currentUser?.role}
            </span>
          </div>
          <button className="h-8 w-8 bg-[#F1F3F5] hover:bg-[#E1E4E8] text-[#5E6269] rounded-full flex items-center justify-center border border-[#E1E4E8] transition-all overflow-hidden group">
            <UserIcon className="h-4 w-4 opacity-70 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    </header>
  );
}
