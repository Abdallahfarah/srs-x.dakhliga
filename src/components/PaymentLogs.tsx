import React, { useState } from "react";
import { Search, Download, Plus, ArrowLeft, Lock, Info, Landmark, Terminal, CheckCircle, Save, X, RotateCcw } from "lucide-react";
import { Payment, Shop, Dagmo, Seedka, PaymentStatus, User } from "../types";

interface PaymentLogsProps {
  payments: Payment[];
  shops: Shop[];
  dagmos: Dagmo[];
  seedkas: Seedka[];
  currentUser: User;
  onAddPayment: (payment: Omit<Payment, "id" | "isLocked" | "auditTrailId">) => void;
  onModifyPayment: (id: string, updated: Partial<Payment>) => void;
  onDeletePayment: (id: string) => void;
}

export function PaymentLogs({
  payments,
  shops,
  dagmos,
  seedkas,
  currentUser,
  onAddPayment,
  onModifyPayment,
  onDeletePayment
}: PaymentLogsProps) {
  // Navigation states within this subtab
  const [viewState, setViewState] = useState<"LIST" | "ADD" | "DETAIL">("LIST");
  const [selectedPayId, setSelectedPayId] = useState<string | null>(null);

  // Filters state
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  // Add Payment Form States
  const [formShopId, setFormShopId] = useState("");
  const [formDagmoId, setFormDagmoId] = useState("");
  const [formSeedkaId, setFormSeedkaId] = useState("");
  const [formMonth, setFormMonth] = useState(new Date().toLocaleString('en-US', { month: 'long' }));
  const [formYear, setFormYear] = useState(new Date().getFullYear().toString());
  const [formAmount, setFormAmount] = useState("");
  const [formStatus, setFormStatus] = useState<PaymentStatus>("Pending");
  const [formError, setFormError] = useState("");

  // Edit State (Only when Super Admin unlocks a payment)
  const [isEditing, setIsEditing] = useState(false);
  const [editAmount, setEditAmount] = useState("");
  const [editStatus, setEditStatus] = useState<PaymentStatus>("Paid");
  const [editNotes, setEditNotes] = useState("");
  const [editPaidDate, setEditPaidDate] = useState("");

  // Lock Confirmation
  const [showLockConfirm, setShowLockConfirm] = useState(false);

  // Purge Confirmation (two-step)
  const [showPurgeStep1, setShowPurgeStep1] = useState(false);
  const [showPurgeStep2, setShowPurgeStep2] = useState(false);
  const [purgeTyped, setPurgeTyped] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Filter implementation
  const filteredPayments = payments.filter((pay) => {
    const shop = shops.find((s) => s.id === pay.shopId);
    const shopName = shop ? shop.name.toLowerCase() : "";
    const shopCode = shop ? shop.code.toLowerCase() : "";
    const payId = pay.id.toLowerCase();
    
    const matchesSearch =
      shopName.includes(search.toLowerCase()) ||
      shopCode.includes(search.toLowerCase()) ||
      payId.includes(search.toLowerCase());

    const matchesStatus = selectedStatus === "All" || pay.status === selectedStatus;
    const matchesMonth = selectedMonth === "All" || pay.month === selectedMonth;

    return matchesSearch && matchesStatus && matchesMonth;
  });

  // Pagination calculation
  const totalItems = filteredPayments.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginatedPayments = filteredPayments.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  // Find active billing item for detail view
  const detailPay = payments.find((p) => p.id === selectedPayId);
  const detailShop = detailPay ? shops.find((s) => s.id === detailPay.shopId) : null;
  const detailDagmo = detailPay ? dagmos.find((d) => d.id === detailPay.dagmoId) : null;
  const detailSeedka = detailPay ? seedkas.find((s) => s.id === detailPay.seedkaId) : null;

  // Handle auto filling Dagmo/Seedka when selecting shop in add form
  const handleShopSelect = (sId: string) => {
    setFormShopId(sId);
    const shop = shops.find((s) => s.id === sId);
    if (shop) {
      setFormDagmoId(shop.dagmoId);
      setFormSeedkaId(shop.seedkaId);
    } else {
      setFormDagmoId("");
      setFormSeedkaId("");
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formShopId || !formAmount.trim() || Number(formAmount) <= 0) {
      setFormError("Please select a physical shop location and define positive payment amount.");
      return;
    }
    setFormError("");

    onAddPayment({
      shopId: formShopId,
      amount: parseFloat(formAmount),
      dagmoId: formDagmoId,
      seedkaId: formSeedkaId,
      month: formMonth,
      year: formYear,
      status: formStatus,
      paidDate: formStatus === "Paid" ? new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "--",
      createdBy: currentUser.email,
      createdById: currentUser.id
    });

    // Reset Form
    setFormShopId("");
    setFormDagmoId("");
    setFormSeedkaId("");
    setFormMonth("October");
    setFormYear("2023");
    setFormAmount("");
    setFormStatus("Pending");
    setViewState("LIST");
  };

  // ===== PAYMENT DETAIL ACTION HANDLERS =====
  const handleSaveEdit = async () => {
    if (!detailPay) return;
    setActionLoading(true);
    try {
      await onModifyPayment(detailPay.id, {
        amount: parseFloat(editAmount) || detailPay.amount,
        status: editStatus,
        notes: editNotes,
        paidDate: editPaidDate || detailPay.paidDate,
      });
      setIsEditing(false);
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleLockRecord = async () => {
    if (!detailPay) return;
    setActionLoading(true);
    try {
      await onModifyPayment(detailPay.id, {
        isLocked: true,
        lockedDate: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      });
      setShowLockConfirm(false);
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnlockRecord = async () => {
    if (!detailPay) return;
    setActionLoading(true);
    try {
      await onModifyPayment(detailPay.id, {
        isLocked: false,
        lockedDate: undefined,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!detailPay) return;
    setActionLoading(true);
    try {
      await onDeletePayment(detailPay.id);
      setShowPurgeStep2(false);
      setPurgeTyped("");
      setSelectedPayId(null);
      setViewState("LIST");
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportCSV = () => {
    const headers = "ID,Shop Name,Dagmo,Seedka,Month,Year,Amount,Status,Paid Date,Audit Hash\n";
    const rows = filteredPayments
      .map((p) => {
        const sName = shops.find((s) => s.id === p.shopId)?.name || "Unknown";
        const dName = dagmos.find((d) => d.id === p.dagmoId)?.name || "Unknown";
        const sdName = seedkas.find((sd) => sd.id === p.seedkaId)?.name || "Unknown";
        return `"${p.id}","${sName}","${dName}","${sdName}","${p.month}","${p.year}",${p.amount},"${p.status}","${p.paidDate}","${p.auditTrailId}"`;
      })
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `PrecisionLedger-Payments-Export.csv`;
    link.click();
  };



  return (
    <div className="space-y-6 animate-fade-in text-[#1A1D21] font-sans">
      {viewState === "LIST" && (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Payment Logs
              </h1>
              <p className="text-xs text-[#5E6269] mt-1">
                Review and manage financial transactions across administrative networks.
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
              <button
                onClick={() => {
                  setViewState("ADD");
                  setFormError("");
                }}
                className="py-1.5 px-3 bg-[#4F46E5] hover:bg-[#4338CA] text-xs font-semibold text-white rounded flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Plus className="h-4 w-4" />
                Add Payment
              </button>
            </div>
          </div>

          {/* Filters (Notion-theme Stripe-Like) */}
          <div className="bg-white border border-[#E1E4E8] p-4 rounded shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by Shop ID or Name..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#E1E4E8] rounded text-xs focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#EEF2FF]"
                />
              </div>

              {/* Status Select */}
              <div>
                <select
                  value={selectedStatus}
                  onChange={(e) => { setSelectedStatus(e.target.value); setPage(1); }}
                  className="w-full py-1.5 px-2 bg-white border border-[#E1E4E8] rounded text-xs text-gray-700 focus:outline-none focus:border-[#4F46E5]"
                >
                  <option value="All">All Statuses</option>
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Failed">Failed</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>

              {/* Month Select */}
              <div>
                <select
                  value={selectedMonth}
                  onChange={(e) => { setSelectedMonth(e.target.value); setPage(1); }}
                  className="w-full py-1.5 px-2 bg-white border border-[#E1E4E8] rounded text-xs text-gray-700 focus:outline-none focus:border-[#4F46E5]"
                >
                  <option value="All">All Months</option>
                  <option value="January">January</option>
                  <option value="February">February</option>
                  <option value="March">March</option>
                  <option value="April">April</option>
                  <option value="May">May</option>
                  <option value="June">June</option>
                  <option value="July">July</option>
                  <option value="August">August</option>
                  <option value="September">September</option>
                  <option value="October">October</option>
                  <option value="November">November</option>
                  <option value="December">December</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table representation */}
          <div className="bg-white border border-[#E1E4E8] rounded overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#E1E4E8] bg-[#F9FAFB]">
                    <th className="py-2.5 px-4 text-[10px] uppercase font-bold text-[#5E6269] tracking-wider">SHOP</th>
                    <th className="py-2.5 px-4 text-[10px] uppercase font-bold text-[#5E6269] tracking-wider">DAGMO</th>
                    <th className="py-2.5 px-4 text-[10px] uppercase font-bold text-[#5E6269] tracking-wider">SEEDKA</th>
                    <th className="py-2.5 px-4 text-[10px] uppercase font-bold text-[#5E6269] tracking-wider">PERIOD</th>
                    <th className="py-2.5 px-4 text-[10px] uppercase font-bold text-[#5E6269] tracking-wider text-right">AMOUNT</th>
                    <th className="py-2.5 px-4 text-[10px] uppercase font-bold text-[#5E6269] tracking-wider text-center">STATUS</th>
                    <th className="py-2.5 px-4 text-[10px] uppercase font-bold text-[#5E6269] tracking-wider">PAID DATE</th>
                    <th className="py-2.5 px-4 text-[10px] uppercase font-bold text-[#5E6269] tracking-wider text-center">LOCK</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F3F5]">
                  {paginatedPayments.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-gray-400">
                        No financial transactions matching the selected filters.
                      </td>
                    </tr>
                  ) : (
                    paginatedPayments.map((p) => {
                      const shop = shops.find((s) => s.id === p.shopId);
                      const dName = dagmos.find((d) => d.id === p.dagmoId)?.name || "Unknown";
                      const sdName = seedkas.find((s) => s.id === p.seedkaId)?.name || "Unknown";

                      return (
                        <tr
                          key={p.id}
                          onClick={() => {
                            setSelectedPayId(p.id);
                            setViewState("DETAIL");
                            setIsEditing(false);
                          }}
                          className="hover:bg-[#F9FAFB] cursor-pointer transition-all"
                        >
                          <td className="py-3 px-4">
                            <div className="font-semibold text-gray-900">{shop ? shop.name : "Store #" + p.id.split("-")[1]}</div>
                            <div className="text-[10px] text-gray-400 font-mono mt-0.5">{p.id}</div>
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {dName}
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {sdName}
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {p.month} {p.year}
                          </td>
                          <td className="py-3 px-4 font-semibold font-mono text-gray-900 text-right">
                            {new Intl.NumberFormat("en-US", {
                              style: "currency",
                              currency: "ETB",
                              minimumFractionDigits: 2
                            }).format(p.amount).replace("ETB", "ETB ")}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`text-[10px] font-bold py-0.5 px-2 rounded inline-block ${
                                p.status === "Paid"
                                  ? "bg-[#E8F5E9] text-[#2E7D32]"
                                  : p.status === "Pending"
                                  ? "bg-[#FFF3E0] text-amber-700"
                                  : "bg-rose-50 text-rose-700"
                              }`}
                            >
                              {p.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-500">
                            {p.paidDate}
                          </td>
                          <td className="py-3 px-4 text-center text-gray-400">
                            {p.isLocked ? (
                              <Lock className="h-3.5 w-3.5 text-slate-400 mx-auto" />
                            ) : (
                              <span className="text-[9px] text-[#4F46E5] bg-[#EEF2FF] py-0.5 px-2 rounded font-bold uppercase tracking-wider">
                                Open
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div className="px-4 py-3 border-t border-[#E1E4E8] bg-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
              <div>
                Showing <span className="font-semibold text-gray-900">{totalItems === 0 ? 0 : (page - 1) * itemsPerPage + 1}</span> to{" "}
                <span className="font-semibold text-gray-900">
                  {Math.min(page * itemsPerPage, totalItems)}
                </span>{" "}
                of <span className="font-semibold text-gray-900">{totalItems}</span> entries
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="py-1 px-2.5 border border-[#E1E4E8] rounded hover:bg-[#F9FAFB] disabled:opacity-40 disabled:hover:bg-white text-[11px] font-semibold text-gray-700 transition"
                >
                  Prev
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`h-6.5 w-6.5 rounded text-[11px] font-bold transition ${
                      page === i + 1
                        ? "bg-[#4F46E5] text-white"
                        : "border border-[#E1E4E8] hover:bg-[#F9FAFB] text-gray-700"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
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
        </>
      )}

      {viewState === "ADD" && (
        // ADD PAYMENT FORM SUBPANEL (Exact replica of Slide 1)
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-[#E1E4E8]">
            <button
              onClick={() => setViewState("LIST")}
              className="p-1 hover:bg-gray-100 rounded text-gray-500 transition"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <span className="text-[10px] text-[#4F46E5] font-bold tracking-wider uppercase">
                Payment Tracker
              </span>
              <h1 className="text-xl font-bold tracking-tight text-[#1A1D21]">
                Add Payment
              </h1>
              <p className="text-[11px] text-[#5E6269] mt-0.5">
                Record a new payment transaction into the ledger.
              </p>
            </div>
          </div>

          <form onSubmit={handleAddSubmit} className="bg-white border border-[#E1E4E8] rounded p-5 space-y-5 shadow-sm">
            {formError && (
              <div className="p-2.5 bg-rose-50 text-rose-600 border border-rose-100 rounded text-xs font-semibold flex items-center gap-2">
                <X className="h-3.5 w-3.5" />
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Shop Select */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">
                  Shop
                </label>
                <select
                  value={formShopId}
                  onChange={(e) => handleShopSelect(e.target.value)}
                  className="w-full py-1.5 px-2 bg-white border border-[#E1E4E8] rounded text-xs text-gray-800 focus:outline-none focus:border-[#4F46E5]"
                >
                  <option value="">Select a Shop</option>
                  {shops.filter(s => s.status === "Active").map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Month Selector */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">
                  Month
                </label>
                <select
                  value={formMonth}
                  onChange={(e) => setFormMonth(e.target.value)}
                  className="w-full py-1.5 px-2 bg-white border border-[#E1E4E8] rounded text-xs text-gray-800 focus:outline-none focus:border-[#4F46E5]"
                >
                  <option value="January">January</option>
                  <option value="February">February</option>
                  <option value="March">March</option>
                  <option value="April">April</option>
                  <option value="May">May</option>
                  <option value="June">June</option>
                  <option value="July">July</option>
                  <option value="August">August</option>
                  <option value="September">September</option>
                  <option value="October">October</option>
                  <option value="November">November</option>
                  <option value="December">December</option>
                </select>
              </div>

              {/* Dagmo (Auto Set based on Active Shop) */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">
                  Dagmo
                </label>
                <select
                  value={formDagmoId}
                  onChange={(e) => setFormDagmoId(e.target.value)}
                  disabled // locks/matches from the selected shop
                  className="w-full py-1.5 px-2 bg-slate-50 border border-[#E1E4E8] rounded text-xs text-slate-500 focus:outline-none cursor-not-allowed"
                >
                  <option value="">Select Dagmo</option>
                  {dagmos.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Year */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">
                  Year
                </label>
                <input
                  type="number"
                  placeholder="2023"
                  value={formYear}
                  onChange={(e) => setFormYear(e.target.value)}
                  className="w-full py-1.5 px-2 bg-white border border-[#E1E4E8] rounded text-xs text-gray-800 focus:outline-none focus:border-[#4F46E5]"
                />
              </div>

              {/* Seedka (Auto Set based on Active Shop) */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">
                  Seedka
                </label>
                <select
                  value={formSeedkaId}
                  onChange={(e) => setFormSeedkaId(e.target.value)}
                  disabled // locks/matches from the selected shop
                  className="w-full py-1.5 px-2 bg-slate-50 border border-[#E1E4E8] rounded text-xs text-slate-500 focus:outline-none cursor-not-allowed"
                >
                  <option value="">Select Seedka</option>
                  {seedkas.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount ($ 0.00 monospace) */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1.5 text-[10px] text-gray-400 font-mono">
                    ETB
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="w-full pl-6 pr-2 py-1.5 bg-white border border-[#E1E4E8] rounded text-xs font-mono text-gray-800 focus:outline-none focus:border-[#4F46E5]"
                  />
                </div>
              </div>

              {/* Empty placeholder column to balance bottom Status */}
              <div className="hidden md:block" />

              {/* Status Selector */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">
                  Status
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as PaymentStatus)}
                  className="w-full py-1.5 px-2 bg-white border border-[#E1E4E8] rounded text-xs text-gray-800 focus:outline-none focus:border-[#4F46E5]"
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E1E4E8] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setViewState("LIST")}
                className="py-1.5 px-4 bg-white border border-[#E1E4E8] hover:bg-slate-50 text-xs font-semibold text-gray-700 rounded transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-1.5 px-4 bg-[#4F46E5] hover:bg-[#4338CA] text-xs font-semibold text-white rounded transition-all shadow-sm"
              >
                Create Payment
              </button>
            </div>
          </form>
        </div>
      )}

      {viewState === "DETAIL" && detailPay && (
        // METADATA PAYMENT DETAIL SCREEN MOCKUP (Exact replica of Slide 7)
        <div className="space-y-4 max-w-4xl mx-auto">
          {/* Breadcrumb Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-[#E1E4E8]">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setViewState("LIST")}
                className="p-1 hover:bg-gray-100 rounded text-gray-500 transition"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div>
                <p className="text-[10px] text-gray-400">
                  Payment Logs / Record {detailPay.id}
                </p>
                <h1 className="text-xl font-bold tracking-tight text-[#1A1D21] flex items-center gap-2">
                  Payment Detail
                  {detailPay.isLocked ? (
                    <span className="text-[9px] font-bold bg-[#F1F3F5] text-slate-700 border border-slate-300 py-0.5 px-2 rounded flex items-center gap-1 leading-none tracking-wider uppercase">
                      <Lock className="h-2.5 w-2.5 shrink-0 text-slate-500" />
                      LOCKED
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold bg-[#E8F5E9] text-[#2E7D32] border border-[#C5E0B4] py-0.5 px-2 rounded flex items-center gap-1 leading-none tracking-wider uppercase">
                      UNLOCKED
                    </span>
                  )}
                </h1>
              </div>
            </div>
          </div>

          {/* Top locked status warning banner of slide 7 */}
          {detailPay.isLocked && (
            <div className="p-3 bg-[#F1F3F5] border border-slate-300 rounded flex items-center gap-3 text-xs text-slate-700 shadow-xs">
              <div className="p-1.5 bg-[#E2E8F0] text-slate-600 rounded-full shrink-0">
                <Info className="h-4 w-4" />
              </div>
              <p className="flex-1 text-[11px]">
                This payment record is locked. Editing and deletion are not allowed under global sovereign compliance.
              </p>
            </div>
          )}

          {/* Dashboard detail cards split */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            {/* Left Primary Information Column */}
            <div className="lg:col-span-2 bg-white border border-[#E1E4E8] rounded p-5 space-y-5 shadow-sm">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A1D21] border-b border-gray-100 pb-1.5">
                  Payment Information
                </h3>
              </div>

              {isEditing ? (
                // IF UNDER unlocked EDIT STATE
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase">AMOUNT</label>
                      <input
                        type="number"
                        value={editAmount}
                        onChange={(e) => setEditAmount(e.target.value)}
                        className="w-full py-1.5 px-2 bg-white border border-[#E1E4E8] rounded text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase">STATUS</label>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value as PaymentStatus)}
                        className="w-full py-1.5 px-2 bg-white border border-[#E1E4E8] rounded text-xs"
                      >
                        <option value="Paid">Paid</option>
                        <option value="Pending">Pending</option>
                        <option value="Failed">Failed</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end pt-3">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="py-1 px-3 border border-gray-200 text-xs font-semibold rounded text-gray-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      className="py-1 px-3 bg-[#4F46E5] text-xs font-semibold rounded text-white hover:bg-[#4338CA] flex items-center gap-1"
                    >
                      <Save className="h-3.5 w-3.5" />
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-xs">
                  {/* Item 1 */}
                  <div>
                    <span className="text-[10px] text-gray-400 block uppercase font-bold tracking-wider">SHOP</span>
                    <span className="text-xs font-semibold text-gray-800 mt-0.5 block">
                      {detailShop ? detailShop.name : "Downtown Espresso Bar"}
                    </span>
                  </div>

                  {/* Item 2 Amount */}
                  <div>
                    <span className="text-[10px] text-gray-400 block uppercase font-bold tracking-wider">AMOUNT</span>
                    <span className="text-xl font-bold text-gray-900 font-mono tracking-tight mt-0.5 block">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "ETB",
                        minimumFractionDigits: 2
                      }).format(detailPay.amount).replace("ETB", "ETB ")}
                    </span>
                  </div>

                  {/* Item 3 */}
                  <div>
                    <span className="text-[10px] text-gray-400 block uppercase font-bold tracking-wider">DAGMO</span>
                    <span className="text-xs font-medium text-gray-800 mt-0.5 block">
                      {detailDagmo ? detailDagmo.name : "Regional Dist-A"}
                    </span>
                  </div>

                  {/* Item 4 */}
                  <div>
                    <span className="text-[10px] text-gray-400 block uppercase font-bold tracking-wider">STATUS</span>
                    <span className="mt-1 block">
                      <span className={`text-[10px] font-bold py-0.5 px-2 rounded inline-block ${
                        detailPay.status === "Paid"
                          ? "bg-[#E8F5E9] text-[#2E7D32]"
                          : "bg-[#FFF3E0] text-amber-800"
                      }`}>
                        {detailPay.status === "Paid" ? "Completed" : detailPay.status}
                      </span>
                    </span>
                  </div>

                  {/* Item 5 */}
                  <div>
                    <span className="text-[10px] text-gray-400 block uppercase font-bold tracking-wider">SEEDKA</span>
                    <span className="text-xs font-medium text-gray-800 mt-0.5 block">
                      {detailSeedka ? detailSeedka.name : "Coffee Beans Premium"}
                    </span>
                  </div>

                  {/* Item 6 */}
                  <div>
                    <span className="text-[10px] text-gray-400 block uppercase font-bold tracking-wider">PAID DATE</span>
                    <span className="text-xs text-gray-800 mt-0.5 block">
                      {detailPay.paidDate}
                    </span>
                  </div>

                  {/* Item 7 */}
                  <div className="md:col-span-2">
                    <span className="text-[10px] text-gray-400 block uppercase font-bold tracking-wider">MONTH APPLIED</span>
                    <span className="text-xs font-medium text-gray-800 mt-0.5 block">
                      {detailPay.month} {detailPay.year}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Right audit tracing column */}
            <div className="space-y-4">
              
              {/* System Audit Card */}
              <div className="bg-white border border-[#E1E4E8] rounded p-4 space-y-4 shadow-sm text-xs">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A1D21] border-b border-gray-100 pb-1.5 flex items-center gap-1.5">
                    <Terminal className="h-4.5 w-4.5 text-[#4F46E5]" />
                    System Audit
                  </h3>
                </div>

                <div className="space-y-3">
                  {/* Row */}
                  <div>
                    <span className="text-[10px] text-gray-400 block uppercase font-bold tracking-wider">RECORD STATUS</span>
                    <span className="text-xs text-gray-800 font-mono mt-0.5 font-semibold flex items-center gap-1">
                      <Lock className="h-3 w-3 text-slate-500" />
                      {detailPay.isLocked ? "LOCKED_IMMUTABLE" : "UNLOCKED_MUTABLE"}
                    </span>
                  </div>

                  {/* Row */}
                  <div>
                    <span className="text-[10px] text-gray-400 block uppercase font-bold tracking-wider">LOCKED DATE</span>
                    <span className="block mt-0.5 text-slate-700 font-medium">
                      {detailPay.lockedDate || "N/A - Open Registry"}
                    </span>
                  </div>

                  {/* Row */}
                  <div>
                    <span className="text-[10px] text-gray-400 block uppercase font-bold tracking-wider">CREATED BY</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="h-5 w-5 rounded-full bg-[#1A1D21] text-white flex items-center justify-center font-bold text-[9px]">
                        JS
                      </span>
                      <span className="font-semibold text-gray-800">
                        {detailPay.createdBy}
                      </span>
                    </div>
                  </div>

                  {/* Row */}
                  <div className="pt-3 border-t border-gray-100">
                    <span className="text-[10px] text-gray-400 block uppercase font-bold tracking-wider mb-1">Audit Trail ID</span>
                    <span className="font-mono text-[9px] text-gray-500 bg-[#F1F3F5] px-2 py-0.5 rounded block border border-[#E1E4E8] text-center truncate">
                      {detailPay.auditTrailId}
                    </span>
                  </div>
                </div>
              </div>

              {/* Super Admin Actions Panel (RBAC protection) */}
              {currentUser.role === "SUPER_ADMIN" && (
                <div className="bg-white border border-[#ba1a1a]/15 rounded p-4 shadow-sm space-y-3">
                  <h4 className="text-[10px] font-bold text-[#ba1a1a] tracking-wider uppercase">
                    Admin Sovereign Privileges
                  </h4>
                  <p className="text-[10px] text-[#5E6269] leading-relaxed">
                    As a Director/Super Admin, you have sovereign privileges to run mutations on compliance-locked hashes.
                  </p>

                  <div className="space-y-1.5">
                    {detailPay.isLocked ? (
                      <button
                        onClick={handleUnlockRecord}
                        className="w-full py-1.5 bg-white hover:bg-[#F9FAFB] border border-[#E1E4E8] text-xs font-semibold text-gray-700 rounded transition-all"
                      >
                        Unlock Record
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setIsEditing(true);
                            setEditAmount(detailPay.amount.toString());
                            setEditStatus(detailPay.status);
                            setEditNotes(detailPay.notes || "");
                            setEditPaidDate(detailPay.paidDate || "");
                          }}
                          disabled={isEditing}
                          className="w-full py-1.5 bg-[#EEF2FF] text-[#4F46E5] border border-[#EEF2FF] hover:bg-[#E0E7FF] text-xs font-semibold rounded transition"
                        >
                          Modify Parameters
                        </button>
                        <button
                          onClick={() => setShowLockConfirm(true)}
                          className="w-full py-1.5 bg-slate-850 hover:bg-black text-white text-xs font-semibold rounded transition"
                        >
                          Relock Record
                        </button>
                        <button
                          onClick={() => setShowPurgeStep1(true)}
                          className="w-full py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 text-xs font-semibold rounded transition"
                        >
                          Permanently Purge Record
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ===== EDIT PAYMENT MODAL ===== */}
      {isEditing && detailPay && (
        <div className="fixed inset-0 bg-[#1A1D21]/40 backdrop-blur-[2px] flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg overflow-hidden border border-[#E1E4E8] animate-in zoom-in-95 duration-200 my-auto max-h-[95vh] overflow-y-auto">
            <div className="bg-[#4F46E5] p-4 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Modify Payment Parameters</h3>
              <button onClick={() => setIsEditing(false)} className="text-white/70 hover:text-white"><X className="h-4 w-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              {/* Read-only fields */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div><span className="text-[10px] text-gray-400 uppercase font-bold block">Payment ID</span><span className="font-mono text-gray-600">{detailPay.id}</span></div>
                <div><span className="text-[10px] text-gray-400 uppercase font-bold block">Shop</span><span className="text-gray-700 font-medium">{detailShop?.name || "Unknown"}</span></div>
                <div><span className="text-[10px] text-gray-400 uppercase font-bold block">Dagmo</span><span className="text-gray-700">{detailDagmo?.name || "N/A"}</span></div>
                <div><span className="text-[10px] text-gray-400 uppercase font-bold block">Seedka</span><span className="text-gray-700">{detailSeedka?.name || "N/A"}</span></div>
                <div><span className="text-[10px] text-gray-400 uppercase font-bold block">Created By</span><span className="text-gray-700">{detailPay.createdBy}</span></div>
                <div><span className="text-[10px] text-gray-400 uppercase font-bold block">Period</span><span className="text-gray-700">{detailPay.month} {detailPay.year}</span></div>
              </div>
              <hr className="border-[#F1F3F5]" />
              {/* Editable fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Amount (ETB) *</label>
                  <input type="number" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} className="w-full py-1.5 px-2 bg-white border border-[#E1E4E8] rounded text-xs focus:outline-none focus:border-[#4F46E5]" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Status *</label>
                  <select value={editStatus} onChange={(e) => setEditStatus(e.target.value as PaymentStatus)} className="w-full py-1.5 px-2 bg-white border border-[#E1E4E8] rounded text-xs focus:outline-none focus:border-[#4F46E5]">
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Failed">Failed</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Payment Date</label>
                  <input type="text" placeholder="e.g. Jun 24, 2026" value={editPaidDate} onChange={(e) => setEditPaidDate(e.target.value)} className="w-full py-1.5 px-2 bg-white border border-[#E1E4E8] rounded text-xs focus:outline-none focus:border-[#4F46E5]" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Notes</label>
                  <input type="text" placeholder="Optional notes..." value={editNotes} onChange={(e) => setEditNotes(e.target.value)} className="w-full py-1.5 px-2 bg-white border border-[#E1E4E8] rounded text-xs focus:outline-none focus:border-[#4F46E5]" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-[#F1F3F5]">
                <button onClick={() => setIsEditing(false)} className="py-1.5 px-3 border border-[#E1E4E8] text-xs font-semibold rounded text-gray-600 hover:bg-[#F9FAFB]">Cancel</button>
                <button onClick={handleSaveEdit} disabled={actionLoading} className="py-1.5 px-3 bg-[#4F46E5] text-xs font-semibold text-white rounded hover:bg-[#4338CA] disabled:opacity-50">{actionLoading ? "Saving..." : "Save Changes"}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== LOCK CONFIRMATION MODAL ===== */}
      {showLockConfirm && detailPay && (
        <div className="fixed inset-0 bg-[#1A1D21]/40 backdrop-blur-[2px] flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm overflow-hidden border border-[#E1E4E8] animate-in zoom-in-95 duration-200 my-auto max-h-[95vh] overflow-y-auto">
            <div className="bg-[#1A1D21] p-4 text-white">
              <h3 className="font-bold text-sm flex items-center gap-2"><Lock className="h-4 w-4" /> Lock Payment Record</h3>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-xs text-gray-600 leading-relaxed">This record will become <strong>read-only</strong>. Locked payments cannot be edited or deleted. Only a Super Admin can unlock later.</p>
              <div className="text-xs bg-slate-50 border border-[#E1E4E8] rounded p-3 font-mono text-gray-600">
                Payment: {detailPay.id}<br/>Amount: ETB {detailPay.amount.toFixed(2)}
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-[#F1F3F5]">
                <button onClick={() => setShowLockConfirm(false)} className="py-1.5 px-3 border border-[#E1E4E8] text-xs font-semibold rounded text-gray-600 hover:bg-[#F9FAFB]">Cancel</button>
                <button onClick={handleLockRecord} disabled={actionLoading} className="py-1.5 px-3 bg-[#1A1D21] text-xs font-semibold text-white rounded hover:bg-black disabled:opacity-50">{actionLoading ? "Locking..." : "Lock Record"}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== PURGE STEP 1 MODAL ===== */}
      {showPurgeStep1 && detailPay && (
        <div className="fixed inset-0 bg-[#1A1D21]/40 backdrop-blur-[2px] flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm overflow-hidden border border-rose-200 animate-in zoom-in-95 duration-200 my-auto max-h-[95vh] overflow-y-auto">
            <div className="bg-rose-600 p-4 text-white">
              <h3 className="font-bold text-sm">Delete Payment?</h3>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-xs text-gray-600 leading-relaxed">Are you sure you want to permanently delete this payment record? This action <strong>cannot be undone</strong>.</p>
              <div className="text-xs bg-rose-50 border border-rose-100 rounded p-3 font-mono text-rose-700">
                {detailPay.id} — ETB {detailPay.amount.toFixed(2)} — {detailPay.month} {detailPay.year}
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-[#F1F3F5]">
                <button onClick={() => setShowPurgeStep1(false)} className="py-1.5 px-3 border border-[#E1E4E8] text-xs font-semibold rounded text-gray-600 hover:bg-[#F9FAFB]">Cancel</button>
                <button onClick={() => { setShowPurgeStep1(false); setShowPurgeStep2(true); setPurgeTyped(""); }} className="py-1.5 px-3 bg-rose-600 text-xs font-semibold text-white rounded hover:bg-rose-700">Continue</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== PURGE STEP 2 MODAL (Type DELETE) ===== */}
      {showPurgeStep2 && detailPay && (
        <div className="fixed inset-0 bg-[#1A1D21]/40 backdrop-blur-[2px] flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm overflow-hidden border border-rose-200 animate-in zoom-in-95 duration-200 my-auto max-h-[95vh] overflow-y-auto">
            <div className="bg-rose-700 p-4 text-white">
              <h3 className="font-bold text-sm">Final Confirmation Required</h3>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-xs text-gray-600 leading-relaxed">Type <strong className="font-mono bg-rose-50 text-rose-700 px-1 py-0.5 rounded">DELETE</strong> to permanently purge this payment record:</p>
              <input
                type="text"
                placeholder="Type DELETE"
                value={purgeTyped}
                onChange={(e) => setPurgeTyped(e.target.value)}
                className="w-full py-2 px-3 bg-white border border-rose-200 rounded text-sm font-mono focus:outline-none focus:border-rose-500 text-center uppercase tracking-wider"
              />
              <div className="flex justify-end gap-2 pt-2 border-t border-[#F1F3F5]">
                <button onClick={() => { setShowPurgeStep2(false); setPurgeTyped(""); }} className="py-1.5 px-3 border border-[#E1E4E8] text-xs font-semibold rounded text-gray-600 hover:bg-[#F9FAFB]">Cancel</button>
                <button onClick={handleDelete} disabled={purgeTyped !== "DELETE" || actionLoading} className="py-1.5 px-3 bg-rose-700 text-xs font-semibold text-white rounded hover:bg-rose-800 disabled:opacity-40 disabled:cursor-not-allowed">{actionLoading ? "Purging..." : "Permanently Purge"}</button>
              </div>
            </div>
          </div>
        </div>
      )}

  </div>
  );
}
