import React, { useState, useEffect } from "react";
import { Landmark, Store, Shield, Receipt, UserPlus, CreditCard, Ban, Activity } from "lucide-react";
import { Payment, Shop, User, AuditLog } from "../types";

interface SuperAdminDashboardProps {
  payments: Payment[];
  shops: Shop[];
  users: User[];
  logs: AuditLog[];
  metrics: {
    totalRevenue: number;
    totalShops: number;
    totalUsers: number;
    totalPaymentsProc: number;
    pendingRevenue: number;
    paidShopsMonth: number;
    unpaidShopsMonth: number;
    monthlyRevenue: number;
  };
  onNavigate: (tab: string) => void;
}

export function SuperAdminDashboard({ payments, shops, users, logs, metrics, onNavigate }: SuperAdminDashboardProps) {
  const formatCurrency = (val: number) => {
    return "ETB " + val.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diff = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return then.toLocaleDateString();
  };

  const recentLogs = [...logs].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  ).slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#1A1D21]">
          Super Admin Dashboard
        </h1>
        <p className="text-xs text-[#5E6269] mt-1">
          Platform-wide analytics and system health.
        </p>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white border border-[#E1E4E8] rounded p-5 shadow-sm hover:border-[#4F46E5]/40 transition-all">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[#5E6269] tracking-wider uppercase">
                TOTAL REVENUE
              </span>
              <h2 className="text-xl xl:text-2xl font-bold text-[#1A1D21] font-mono tracking-tight mt-1">
                {formatCurrency(metrics.totalRevenue)}
              </h2>
            </div>
            <div className="p-2.5 bg-[#EEF2FF] text-[#4F46E5] rounded shrink-0">
              <Landmark className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-center">
            <span className="text-[10px] font-bold text-[#4F46E5] bg-[#EEF2FF] px-2 py-0.5 rounded-full">
              Real-time Summary
            </span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white border border-[#E1E4E8] rounded p-5 shadow-sm hover:border-[#4F46E5]/40 transition-all">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[#5E6269] tracking-wider uppercase">
                TOTAL SHOPS
              </span>
              <h2 className="text-xl xl:text-2xl font-bold text-[#1A1D21] font-mono mt-1">
                {metrics.totalShops.toLocaleString()}
              </h2>
            </div>
            <div className="p-2.5 bg-[#E8F5E9] text-[#2E7D32] rounded shrink-0">
              <Store className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-center">
            <span className="text-[10px] text-[#5E6269]">
              Active managed entities
            </span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white border border-[#E1E4E8] rounded p-5 shadow-sm hover:border-[#4F46E5]/40 transition-all">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[#5E6269] tracking-wider uppercase">
                TOTAL ADMIN USERS
              </span>
              <h2 className="text-xl xl:text-2xl font-bold text-[#1A1D21] font-mono mt-1">
                {metrics.totalUsers.toLocaleString()}
              </h2>
            </div>
            <div className="p-2.5 bg-[#EEF2FF] text-[#4F46E5] rounded shrink-0">
              <Shield className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-center">
            <span className="text-[10px] text-[#5E6269]">
              Authenticated profiles
            </span>
          </div>
        </div>

        {/* Card 4 (Updated for Monthly Revenue) */}
        <div className="bg-white border border-[#E1E4E8] rounded p-5 shadow-sm hover:border-[#4F46E5]/40 transition-all">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[#5E6269] tracking-wider uppercase">
                THIS MONTH (COLLECTED)
              </span>
              <h2 className="text-xl xl:text-2xl font-bold text-[#2E7D32] font-mono mt-1">
                {formatCurrency(metrics.monthlyRevenue)}
              </h2>
            </div>
            <div className="p-2.5 bg-slate-100 text-[#1A1D21] rounded shrink-0">
              <Activity className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-[10px] font-medium text-[#2E7D32] bg-[#E8F5E9] px-2 py-0.5 rounded-full">
              {metrics.paidShopsMonth} Paid
            </span>
            <span className="text-[10px] font-medium text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
              {metrics.unpaidShopsMonth} Unpaid
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Left Column: Recent Activity (2/3 width) */}
        <div className="lg:col-span-2 bg-white border border-[#E1E4E8] rounded overflow-hidden shadow-sm">
          <div className="px-5 py-3 border-b border-[#E1E4E8] flex justify-between items-center bg-white">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#1A1D21]">
              Recent Activity
            </h3>
            <span className="text-[10px] text-[#5E6269] font-mono uppercase tracking-wider">Database Feed</span>
          </div>

          <div className="divide-y divide-[#F1F3F5] text-xs">
            {recentLogs.length > 0 ? recentLogs.map((log) => (
              <div key={log.id} className="p-4 flex items-center gap-3 hover:bg-[#F9FAFB] transition-all">
                <div className={`p-2 rounded-full shrink-0 ${
                  log.action.includes('CREATE') ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-[#EEF2FF] text-[#4F46E5]'
                }`}>
                  {log.action.includes('PAYMENT') ? <CreditCard className="h-4 w-4" /> : <Activity className="h-4 w-4" />}
                </div>
                <div className="flex-1">
                  <p className="text-gray-700">
                    <span className="font-semibold text-[#1A1D21]">{log.action}:</span> {log.entityInfo} by <span className="text-[#4F46E5] font-medium tracking-tight">{log.userEmail}</span>
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">{getRelativeTime(log.timestamp)}</p>
                </div>
              </div>
            )) : (
              <div className="p-10 text-center text-gray-400">
                No recent activity recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: System Health (1/3 width) */}
        <div className="bg-white border border-[#E1E4E8] rounded p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Activity className="h-4.5 w-4.5 text-[#2E7D32]" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#1A1D21]">
                System Health
              </h3>
            </div>

            <div className="space-y-4">
              {/* Health 1 */}
              <div>
                <div className="flex justify-between items-center text-[10px] font-bold mb-1.5 text-[#5E6269] uppercase tracking-wider">
                  <span>API Uptime</span>
                  <span className="text-[#2E7D32]">99.99%</span>
                </div>
                <div className="w-full bg-[#F1F3F5] h-1.5 rounded overflow-hidden">
                  <div className="bg-[#2E7D32] h-1.5 rounded w-[99.99%]" />
                </div>
              </div>

              {/* Health 2 */}
              <div>
                <div className="flex justify-between items-center text-[10px] font-bold mb-1.5 text-[#5E6269] uppercase tracking-wider">
                  <span className="text-[#4F46E5] font-heavy tracking-widest">OPTIMAL</span>
                </div>
                <div className="w-full bg-[#F1F3F5] h-1.5 rounded overflow-hidden">
                  <div 
                    className="bg-[#4F46E5] h-1.5 rounded w-[12%]" 
                  />
                </div>
              </div>

              {/* Health 3 */}
              <div>
                <div className="flex justify-between items-center text-[10px] font-bold mb-1.5 text-[#5E6269] uppercase tracking-wider">
                  <span>Edge Latency</span>
                  <span className="text-amber-600 font-mono tracking-widest">ACTIVE</span>
                </div>
                <div className="w-full bg-[#F1F3F5] h-1.5 rounded overflow-hidden">
                  <div 
                    className="bg-amber-500 h-1.5 rounded w-[8%]" 
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-[#E1E4E8]">
            <button className="w-full text-center py-1.5 px-3 bg-[#F1F3F5] hover:bg-slate-200 text-[10px] font-bold text-gray-700 rounded transition duration-150 uppercase tracking-widest">
              View Diagnostics
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
