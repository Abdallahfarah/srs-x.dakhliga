import React from "react";
import { Store, FileText, Wallet, Clock, CheckCircle2, RefreshCw, Layers } from "lucide-react";
import { Payment, Shop, AuditLog } from "../types";

interface AdminOverviewProps {
  payments: Payment[];
  shops: Shop[];
  logs: AuditLog[];
  onNavigate: (tab: string) => void;
  onViewPaymentDetail: (id: string) => void;
}

export function AdminOverview({ payments, shops, logs, onNavigate, onViewPaymentDetail }: AdminOverviewProps) {
  // Compute active figures
  const myShopsCount = shops.filter(s => s.status === "Active").length;
  const paymentsProcCount = payments.length;
  
  const paidThisMonthTotal = payments
    .filter(p => p.status === "Paid")
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingThisMonthTotal = payments
    .filter(p => p.status === "Pending" || p.status === "Overdue")
    .reduce((sum, p) => sum + p.amount, 0);

  // Format currency
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
          Admin Overview
        </h1>
        <p className="text-xs text-[#5E6269] mt-1">
          Welcome back. Here is the summary of your managed entities.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white border border-[#E1E4E8] rounded p-5 hover:border-[#4F46E5]/40 transition-all shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] uppercase font-bold text-[#5E6269] tracking-wider mb-1">My Active Shops</p>
              <h2 className="text-2xl font-semibold text-[#1A1D21] tracking-tight">{myShopsCount}</h2>
            </div>
            <div className="p-2.5 bg-[#EEF2FF] text-[#4F46E5] rounded">
              <Store className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-center">
            <span className="text-[10px] font-bold bg-[#E8F5E9] text-[#2E7D32] py-0.5 px-2 rounded-full">
              +2 this month
            </span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white border border-[#E1E4E8] rounded p-5 hover:border-[#4F46E5]/40 transition-all shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] uppercase font-bold text-[#5E6269] tracking-wider mb-1">Processed Payments</p>
              <h2 className="text-2xl font-semibold text-[#1A1D21] tracking-tight">
                {paymentsProcCount.toLocaleString()}
              </h2>
            </div>
            <div className="p-2.5 bg-[#EEF2FF] text-[#4F46E5] rounded">
              <FileText className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-center">
            <span className="text-[10px] text-[#5E6269]">
              Stable system flow
            </span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white border border-[#E1E4E8] rounded p-5 hover:border-[#4F46E5]/40 transition-all shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] uppercase font-bold text-[#5E6269] tracking-wider mb-1">Paid This Month</p>
              <h2 className="text-2xl font-semibold text-[#2f8540] tracking-tight">
                {formatCurrency(paidThisMonthTotal)}
              </h2>
            </div>
            <div className="p-2.5 bg-[#E8F5E9] text-[#2f8540] rounded">
              <Wallet className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-center">
            <span className="text-[10px] text-[#5E6269]">
              Immediate settlement
            </span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white border border-[#E1E4E8] rounded p-5 hover:border-[#4F46E5]/40 transition-all shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] uppercase font-bold text-[#5E6269] tracking-wider mb-1">Pending This Month</p>
              <h2 className="text-2xl font-semibold text-amber-600 tracking-tight">
                {formatCurrency(pendingThisMonthTotal)}
              </h2>
            </div>
            <div className="p-2.5 bg-[#FFF3E0] text-amber-600 rounded">
              <Clock className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-center">
            <span className="text-[10px] text-[#5E6269]">
              Awaiting confirmation
            </span>
          </div>
        </div>
      </div>

      {/* NEW: Category Breakdown Card */}
      <div className="bg-white border border-[#E1E4E8] rounded p-5 shadow-sm">
        <h3 className="font-bold text-xs uppercase tracking-wider text-[#1A1D21] mb-4 flex items-center gap-2">
          <Layers className="h-4 w-4 text-[#4F46E5]" />
          Shop Category Breakdown
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {["Grocery", "Restaurant", "Cafe", "Pharmacy", "Electronics", "Clothing", "Hotel", "Salon", "Hardware", "Wholesale", "Retail"].map(type => {
            const count = shops.filter(s => s.type === type).length;
            if (count === 0 && (type !== "Grocery" && type !== "Retail")) return null; 
            return (
              <div key={type} className="p-3 bg-slate-50 border border-[#F1F3F5] rounded text-center">
                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-tighter mb-0.5">{type}</p>
                <p className="text-lg font-bold text-[#1A1D21]">{count}</p>
              </div>
            );
          })}
          {/* Custom Types Rollup */}
          {(() => {
            const standardTypes = ["Grocery", "Restaurant", "Cafe", "Pharmacy", "Electronics", "Clothing", "Hotel", "Salon", "Hardware", "Wholesale", "Retail"];
            const customCount = shops.filter(s => !standardTypes.includes(s.type)).length;
            if (customCount > 0) {
              return (
                <div className="p-3 bg-indigo-50 border border-indigo-100 rounded text-center">
                  <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-tighter mb-0.5">Specialized</p>
                  <p className="text-lg font-bold text-indigo-700">{customCount}</p>
                </div>
              );
            }
            return null;
          })()}
        </div>
      </div>

      {/* Recent Activity List container */}
      <div className="bg-white border border-[#E1E4E8] rounded overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 border-b border-[#E1E4E8] flex justify-between items-center bg-white">
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#1A1D21]">
            Recent Activity (Your Actions)
          </h3>
          <button
            onClick={() => onNavigate("payments")}
            className="text-xs font-semibold text-[#4F46E5] hover:text-[#4338CA] hover:underline"
          >
            View All
          </button>
        </div>

        <div className="divide-y divide-[#F1F3F5] text-xs">
          {recentLogs.length > 0 ? recentLogs.map((log) => (
            <div key={log.id} className="p-4 flex items-center justify-between hover:bg-[#F9FAFB] transition-all">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#EEF2FF] text-[#4F46E5] rounded-full shrink-0">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-gray-700">
                    <span className="font-semibold text-[#1A1D21] uppercase text-[10px]">{log.action}:</span> {log.entityInfo}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {getRelativeTime(log.timestamp)} · System verified
                  </p>
                </div>
              </div>
            </div>
          )) : (
            <div className="p-10 text-center text-gray-400 italic">
              No recent actions recorded for your account.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
