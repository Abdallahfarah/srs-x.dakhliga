import React, { useState } from "react";
import { Search, Info, ShieldAlert, AlignJustify, Download, SlidersHorizontal, Check } from "lucide-react";
import { AuditLog } from "../types";

interface AuditLogsProps {
  logs: AuditLog[];
}

export function AuditLogs({ logs }: AuditLogsProps) {
  const [search, setSearch] = useState("");
  const [timeframe, setTimeframe] = useState("Last 24 Hours");
  const [density, setDensity] = useState<"compact" | "cozy">("cozy");
  const [page, setPage] = useState(1);
  const itemsPerPage = density === "compact" ? 8 : 5;

  const filteredLogs = logs.filter(log => {
    return (
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.userEmail.toLowerCase().includes(search.toLowerCase()) ||
      log.entityInfo.toLowerCase().includes(search.toLowerCase()) ||
      log.ipAddress.includes(search)
    );
  });

  const totalItems = 1248 + (filteredLogs.length - 5); // baseline simulation
  const paginatedLogs = filteredLogs.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1;

  // Dot color helper depending on action
  const getActionStyle = (action: string) => {
    switch (action) {
      case "DELETE_SHOP":
        return { bg: "bg-red-50 text-red-700 border-red-100", dot: "bg-red-600" };
      case "SYSTEM_CONFIG_CHANGE":
        return { bg: "bg-amber-50 text-amber-700 border-amber-100", dot: "bg-amber-500" };
      case "CREATE_API_KEY":
        return { bg: "bg-blue-50 text-blue-700 border-blue-100", dot: "bg-blue-600" };
      case "UPDATE_ROLE":
        return { bg: "bg-slate-100 text-slate-700 border-slate-200", dot: "bg-slate-500" };
      case "LOGIN_SUCCESS":
      default:
        return { bg: "bg-emerald-50 text-emerald-700 border-emerald-100", dot: "bg-emerald-600" };
    }
  };

  const handleExportCSV = () => {
    const headers = "ID,Timestamp,Action,User,Entity Info,IP Address\n";
    const rows = filteredLogs.map(l => {
      return `"${l.id}","${l.timestamp}","${l.action}","${l.userEmail}","${l.entityInfo.replace(/"/g, '""')}","${l.ipAddress}"`;
    }).join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `PrecisionLedger-AuditLogs-Export.csv`;
    link.click();
  };

  return (
    <div className="space-y-6 animate-fade-in text-[#1A1D21] font-sans">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Super Admin Audit Logs
          </h1>
          <p className="text-xs text-[#5E6269] mt-1">
            Immutable trace recording of all administrative operations executed across the network platform.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleExportCSV}
            className="py-1.5 px-3 bg-white border border-[#E1E4E8] hover:bg-[#F9FAFB] text-xs font-semibold text-gray-700 rounded flex items-center gap-1.5 transition-all text-xs"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
          <button className="py-1.5 px-3 bg-white border border-[#E1E4E8] hover:bg-[#F9FAFB] text-xs font-semibold text-gray-700 rounded flex items-center gap-1.5 transition-all text-xs">
            <SlidersHorizontal className="h-4 w-4" />
            Filter
          </button>
        </div>
      </div>

      {/* Grid Filter Bar panel */}
      <div className="bg-white border border-[#E1E4E8] p-4 rounded flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="relative w-full md:w-96 shrink-0">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Action, User, or IP..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#E1E4E8] rounded text-xs focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#EEF2FF]"
          />
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto justify-end">
          {/* Timeframe selector */}
          <div className="flex items-center gap-2 text-xs text-gray-500 shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Timeframe:</span>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="py-1.25 px-2 bg-white border border-[#E1E4E8] rounded text-xs text-gray-700 focus:outline-none focus:border-[#4F46E5]"
            >
              <option value="Last 24 Hours">Last 24 Hours</option>
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 30 Days">Last 30 Days</option>
            </select>
          </div>

          <div className="h-4 w-px bg-[#E1E4E8] hidden sm:block" />

          {/* Density toggle buttons */}
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mr-1.5">Density:</span>
            <button
              onClick={() => { setDensity("compact"); setPage(1); }}
              className={`p-1.5 rounded border transition ${
                density === "compact"
                  ? "bg-[#EEF2FF] text-[#4F46E5] border-[#EEF2FF] font-bold"
                  : "bg-white border-gray-200 text-gray-400 hover:text-gray-700"
              }`}
              title="Compact View"
            >
              <AlignJustify className="h-3.5 w-3.5 shrink-0" />
            </button>
            <button
              onClick={() => { setDensity("cozy"); setPage(1); }}
              className={`p-1.5 rounded border transition ${
                density === "cozy"
                  ? "bg-[#EEF2FF] text-[#4F46E5] border-[#EEF2FF] font-bold"
                  : "bg-white border-gray-200 text-gray-400 hover:text-gray-700"
              }`}
              title="Comfortable View"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 shrink-0" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid Table Board */}
      <div className="bg-white border border-[#E1E4E8] rounded overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E1E4E8] bg-[#F9FAFB]">
                <th className="py-2.5 px-4 text-[10px] uppercase font-bold text-[#5E6269] tracking-wider">
                  TIMESTAMP
                </th>
                <th className="py-2.5 px-4 text-[10px] uppercase font-bold text-[#5E6269] tracking-wider">
                  ACTION
                </th>
                <th className="py-2.5 px-4 text-[10px] uppercase font-bold text-[#5E6269] tracking-wider">
                  USER
                </th>
                <th className="py-2.5 px-4 text-[10px] uppercase font-bold text-[#5E6269] tracking-wider">
                  ENTITY INFO
                </th>
                <th className="py-2.5 px-4 text-[10px] uppercase font-bold text-[#5E6269] tracking-wider">
                  IP ADDRESS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F3F5]">
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-gray-450">
                    No tracing records matching search keywords.
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => {
                  const style = getActionStyle(log.action);
                  const initials = log.userEmail.split("@")[0].substring(0, 2).toUpperCase();

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-[#F9FAFB] transition-all"
                    >
                      {/* Timestamp */}
                      <td className={`px-4 text-gray-550 font-mono text-[11px] ${
                        density === "compact" ? "py-1.5" : "py-2.5"
                      }`}>
                        {log.timestamp}
                      </td>

                      {/* Action dot pill */}
                      <td className="px-4">
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 border rounded-md inline-flex items-center gap-1 font-mono leading-none ${style.bg}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full inline-block ${style.dot}`} />
                          {log.action}
                        </span>
                      </td>

                      {/* User metadata */}
                      <td className="px-4">
                        <div className="flex items-center gap-2">
                          <span className="h-5 w-5 rounded-full bg-[#1A1D21] text-white flex items-center justify-center font-bold text-[8px]">
                            {initials}
                          </span>
                          <span className="text-xs font-semibold text-gray-800">
                            {log.userEmail}
                          </span>
                        </div>
                      </td>

                      {/* Entity code */}
                      <td className="px-4 text-xs text-gray-600">
                        {log.entityInfo}
                      </td>

                      {/* IP address monospace */}
                      <td className="px-4 text-slate-500 font-mono text-[11px]">
                        {log.ipAddress}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer pagination */}
        <div className="px-4 py-3 border-t border-[#E1E4E8] bg-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <div>
            Showing <span className="font-semibold text-gray-900">1</span> to{" "}
            <span className="font-semibold text-gray-900">{filteredLogs.length}</span> of{" "}
            <span className="font-semibold text-gray-900">{totalItems.toLocaleString()}</span> entries
          </div>

          <div className="flex items-center gap-1.5">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="py-1 px-2.5 border border-[#E1E4E8] rounded hover:bg-[#F9FAFB] disabled:opacity-40 disabled:hover:bg-white text-[11px] font-semibold text-gray-700 transition"
            >
              Prev
            </button>
            <button className="h-6.5 w-6.5 rounded text-[11px] font-bold bg-[#4F46E5] text-white">
              {page}
            </button>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="py-1 px-2.5 border border-[#E1E4E8] rounded hover:bg-[#F9FAFB] disabled:opacity-40 disabled:hover:bg-white text-[11px] font-semibold text-gray-700 transition"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
