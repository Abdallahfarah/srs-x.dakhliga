import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  // Map URLs back to current "tab" strings for compatible component logic
  const path = location.pathname.split('/').pop() || 'overview';
  
  const handleTabChange = (tab: string) => {
    navigate(tab);
    setIsSidebarOpen(false); // Close sidebar on navigation
  };

  const handleAddShop = () => {
    navigate('shops', { state: { openAddModal: true } });
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex text-[#1A1D21] selection:bg-[#4F46E5]/20 select-none overflow-hidden h-screen">
      <Sidebar 
        onAddShop={handleAddShop} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <div className="flex-1 flex flex-col min-w-0 h-screen relative overflow-hidden">
        <Header 
          activeTab={path} 
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
