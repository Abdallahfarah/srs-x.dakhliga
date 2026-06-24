import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  // Map URLs back to current "tab" strings for compatible component logic
  // This is a temporary measure to keep existing components working without refactoring their onTabChange logic.
  const path = location.pathname.split('/').pop() || 'overview';
  
  const handleTabChange = (tab: string) => {
    navigate(tab);
  };

  const handleAddShop = () => {
    // We can navigate to shops and set a query param or state
    navigate('shops', { state: { openAddModal: true } });
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex text-[#1A1D21] selection:bg-[#4F46E5]/20 select-none">
      <Sidebar 
        onAddShop={handleAddShop} 
      />
      
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-y-auto relative">
        <Header activeTab={path} />
        
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
