import React, { useState } from "react";
import { Search, Download, Plus, ArrowLeft, Store, Save, X, Calendar, Ban, Edit2, Eye, Filter, ShieldCheck, Check } from "lucide-react";
import { Shop, Dagmo, Seedka, ShopStatus, Payment } from "../types";
import { useToast } from "../contexts/ToastContext";

interface ShopManagementProps {
  shops: Shop[];
  payments: Payment[];
  dagmos: Dagmo[];
  seedkas: Seedka[];
  isAddingNew: boolean;
  setIsAddingNew: (val: boolean) => void;
  currentUserRole: string;
  onAddShop: (shop: Omit<Shop, "id" | "createdDate" | "createdBy">) => void;
  onDeleteShop: (id: string) => Promise<void>;
  onRestoreShop: (id: string) => Promise<void>;
  onAddPayment: (payment: Omit<Payment, "id" | "isLocked" | "auditTrailId">) => Promise<void>;
  onDeletePayment: (id: string) => Promise<void>;
  currentActorEmail: string;
}

export function ShopManagement({
  shops,
  payments,
  dagmos,
  seedkas,
  isAddingNew,
  setIsAddingNew,
  currentUserRole,
  onAddShop,
  onDeleteShop,
  onRestoreShop,
  onAddPayment,
  onDeletePayment,
  currentActorEmail
}: ShopManagementProps) {
  // Filter States
  const [search, setSearch] = useState("");
  const [selectedDagmo, setSelectedDagmo] = useState("All");
  const [selectedSeedka, setSelectedSeedka] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [visibilityFilter, setVisibilityFilter] = useState<"Standard" | "Archived" | "All">("Standard");
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  // Form States
  const [formName, setFormName] = useState("");
  const [formDagmo, setFormDagmo] = useState("");
  const [formSeedka, setFormSeedka] = useState("");
  const [formOwner, setFormOwner] = useState("");
  const [formTNumber, setFormTNumber] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formType, setFormType] = useState("");
  const [formCustomType, setFormCustomType] = useState("");
  const [formStatus, setFormStatus] = useState<ShopStatus>("Active");

  // Collect Payment States
  const [collectShop, setCollectShop] = useState<Shop | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentNotes, setPaymentNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Confirmation Modals
  const [confirmDeletePaymentId, setConfirmDeletePaymentId] = useState<string | null>(null);
  const [confirmDeleteShopId, setConfirmDeleteShopId] = useState<string | null>(null);
  const [isDeletingShop, setIsDeletingShop] = useState(false);
  
  const { showToast } = useToast();

  // Error state
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formDagmo || !formSeedka || !formOwner.trim() || !formType || !formPhone.trim() || !formTNumber.trim()) {
      showToast("All fields, including T-Number and Phone, are required.", "error");
      return;
    }

    if (formTNumber.trim().length < 5 || formTNumber.trim().length > 30) {
      showToast("T-Number must be between 5 and 30 characters.", "error");
      return;
    }

    if (formType === "Other" && (!formCustomType.trim() || formCustomType.trim().length < 3)) {
      showToast("Please enter a valid Custom Shop Type (min 3 characters).", "error");
      return;
    }

    const finalType = formType === "Other" ? formCustomType.trim() : formType;

    setIsSubmitting(true);
    try {
      await onAddShop({
        name: formName,
        code: "SHP-" + Math.floor(1000 + Math.random() * 9000), 
        dagmoId: formDagmo,
        seedkaId: formSeedka,
        ownerName: formOwner,
        tNumber: formTNumber.trim(),
        phone: formPhone,
        type: finalType,
        status: formStatus,
        createdById: "" // Will be set by context
      });

      showToast(`Shop "${formName}" (${finalType}) registered successfully.`, "success");
      setFormName("");
      setFormOwner("");
      setFormTNumber("");
      setFormPhone("");
      setFormDagmo("");
      setFormSeedka("");
      setFormType("");
      setFormCustomType("");
      setFormStatus("Active");
      setIsAddingNew(false);
    } catch (err: any) {
      showToast(err.message || "Failed to register shop.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCollectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectShop || !onAddPayment) return;
    
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      showToast("Invalid payment amount.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const currentMonth = new Date().toLocaleString('en-US', { month: 'long' });
      const currentYear = new Date().getFullYear().toString();
      
      await onAddPayment({
        amount,
        month: currentMonth,
        year: currentYear,
        status: "Paid",
        paidDate: new Date(paymentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        notes: paymentNotes,
        shopId: collectShop.id,
        dagmoId: collectShop.dagmoId,
        seedkaId: collectShop.seedkaId,
        createdBy: currentActorEmail,
        createdById: "" // Will be set by context
      });

      showToast(`Payment of ${amount} ETB collected from ${collectShop.name}.`, "success");
      setCollectShop(null);
      setPaymentAmount("");
      setPaymentNotes("");
    } catch (err: any) {
      showToast(err.message || "Failed to process payment.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkNotPaid = async () => {
    if (!confirmDeletePaymentId) return;
    setIsSubmitting(true);
    try {
      await onDeletePayment(confirmDeletePaymentId);
      showToast("Payment record removed and status updated to Not Paid.", "success");
      setConfirmDeletePaymentId(null);
    } catch (err: any) {
      showToast(err.message || "Failed to update payment status.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteShop = async () => {
    if (!confirmDeleteShopId) return;
    setIsDeletingShop(true);
    try {
      await onDeleteShop(confirmDeleteShopId);
      showToast("Shop successfully soft-deleted and moved to archives.", "success");
      setConfirmDeleteShopId(null);
    } catch (err: any) {
      showToast(err.message || "Failed to delete shop.", "error");
    } finally {
      setIsDeletingShop(false);
    }
  };

  const handleRestoreShop = async (id: string, name: string) => {
    setIsSubmitting(true);
    try {
      await onRestoreShop(id);
      showToast(`Shop "${name}" has been successfully restored.`, "success");
    } catch (err: any) {
      showToast(err.message || "Failed to restore shop.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter list of seedkas based on chosen dagmo when creating
  const filteredSeedkasForForm = formDagmo 
    ? seedkas.filter(s => s.dagmoId === formDagmo) 
    : seedkas;

  // Filter actual shop inventory
  const filteredShops = shops.filter(shop => {
    const matchesSearch = shop.name.toLowerCase().includes(search.toLowerCase()) ||
                          shop.ownerName.toLowerCase().includes(search.toLowerCase()) ||
                          shop.type.toLowerCase().includes(search.toLowerCase()) ||
                          shop.tNumber.toLowerCase().includes(search.toLowerCase()) ||
                          shop.code.toLowerCase().includes(search.toLowerCase());
    
    const matchesDagmo = selectedDagmo === "All" || shop.dagmoId === selectedDagmo;
    const matchesSeedka = selectedSeedka === "All" || shop.seedkaId === selectedSeedka;
    const matchesStatus = selectedStatus === "All" || shop.status === selectedStatus;
    const matchesType = selectedType === "All" || shop.type === selectedType;

    let matchesVisibility = true;
    if (visibilityFilter === "Standard") matchesVisibility = !shop.deletedAt;
    else if (visibilityFilter === "Archived") matchesVisibility = !!shop.deletedAt;

    return matchesSearch && matchesDagmo && matchesSeedka && matchesStatus && matchesType && matchesVisibility;
  });

  // Pagination calculations
  const totalItems = filteredShops.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginatedShops = filteredShops.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleExport = () => {
    // Elegant simulated download action
    const headers = "ID,Shop Name,T-Number,Type,Phone,Dagmo,Seedka,Owner,Status,Payment Status,Created Date\n";
    const currentMonth = new Date().toLocaleString('en-US', { month: 'long' });
    const currentYear = new Date().getFullYear().toString();

    const rows = filteredShops.map(s => {
      const dName = dagmos.find(d => d.id === s.dagmoId)?.name || "Unknown";
      const sName = seedkas.find(sd => sd.id === s.seedkaId)?.name || "Unknown";
      const isPaid = payments.some(p => p.shopId === s.id && p.month === currentMonth && p.year === currentYear && p.status === 'Paid');
      return `"${s.id}","${s.name}","${s.tNumber}","${s.type}","${s.phone}","${dName}","${sName}","${s.ownerName}","${s.status}","${isPaid ? 'Paid' : 'Not Paid'}","${s.createdDate}"`;
    }).join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", `PrecisionLedger-Shops-Export.csv`);
    a.click();
  };

  return (
    <div className="space-y-6 animate-fade-in text-[#1A1D21] font-sans">
      {!isAddingNew ? (
        // TABLE VIEW
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Admin Shops
              </h1>
              <p className="text-xs text-[#5E6269] mt-1">
                Read-only view of all registered shops and regional enterprises.
              </p>
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={handleExport}
                className="py-1.5 px-3 bg-white border border-[#E1E4E8] hover:bg-[#F9FAFB] text-xs font-semibold text-gray-700 rounded flex items-center gap-1.5 transition-all text-xs"
              >
                <Download className="h-4 w-4" />
                Export List
              </button>
              <button
                onClick={() => setIsAddingNew(true)}
                className="py-1.5 px-3 bg-[#4F46E5] hover:bg-[#4338CA] text-xs font-semibold text-white rounded flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Plus className="h-4 w-4" />
                Add New Shop
              </button>
            </div>
          </div>

          {/* Filter Bar Grid (Notion + Linear Style) */}
          <div className="bg-white border border-[#E1E4E8] p-4 rounded space-y-3 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search shops..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#E1E4E8] rounded text-xs focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#EEF2FF]"
                />
              </div>

              {/* Dagmo Select */}
              <div>
                <select
                  value={selectedDagmo}
                  onChange={(e) => { setSelectedDagmo(e.target.value); setPage(1); }}
                  className="w-full py-1.5 px-2 bg-white border border-[#E1E4E8] rounded text-xs text-gray-700 focus:outline-none focus:border-[#4F46E5]"
                >
                  <option value="All">All Dagmos</option>
                  {dagmos.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              {/* Seedka Select */}
              <div>
                <select
                  value={selectedSeedka}
                  onChange={(e) => { setSelectedSeedka(e.target.value); setPage(1); }}
                  className="w-full py-1.5 px-2 bg-white border border-[#E1E4E8] rounded text-xs text-gray-700 focus:outline-none focus:border-[#4F46E5]"
                >
                  <option value="All">All Seedkas</option>
                  {seedkas.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Status Select */}
              <div>
                <select
                  value={selectedStatus}
                  onChange={(e) => { setSelectedStatus(e.target.value); setPage(1); }}
                  className="w-full py-1.5 px-2 bg-white border border-[#E1E4E8] rounded text-xs text-gray-700 focus:outline-none focus:border-[#4F46E5]"
                >
                  <option value="All">Status (All)</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>

              {/* Type Filter */}
              <div>
                <select
                  value={selectedType}
                  onChange={(e) => { setSelectedType(e.target.value); setPage(1); }}
                  className="w-full py-1.5 px-2 bg-white border border-[#E1E4E8] rounded text-xs text-gray-700 focus:outline-none focus:border-[#4F46E5]"
                >
                  <option value="All">All Types</option>
                  {Array.from(new Set(shops.map(s => s.type))).sort().map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* Visibility Filter */}
              <div className="relative">
                <Filter className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
                <select
                  value={visibilityFilter}
                  onChange={(e) => setVisibilityFilter(e.target.value as any)}
                  className="w-full pl-9 pr-3 py-2 bg-[#F9FAFB] border border-[#E1E4E8] rounded text-xs focus:outline-none focus:border-[#4F46E5] appearance-none text-gray-700 font-medium"
                >
                  <option value="Standard">Standard (Active Only)</option>
                  <option value="Archived">Archived (Deleted Only)</option>
                  <option value="All">Full Ledger (All)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Shop Inventory Table Card */}
          <div className="bg-white border border-[#E1E4E8] rounded overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#E1E4E8] bg-[#F9FAFB]">
                    <th className="py-2.5 px-4 text-[10px] uppercase font-bold text-[#5E6269] tracking-wider">
                      SHOP NAME
                    </th>
                    <th className="py-2.5 px-4 text-[10px] uppercase font-bold text-[#5E6269] tracking-wider">
                      T-NUMBER
                    </th>
                    <th className="py-2.5 px-4 text-[10px] uppercase font-bold text-[#5E6269] tracking-wider">
                      TYPE
                    </th>
                    <th className="py-2.5 px-4 text-[10px] uppercase font-bold text-[#5E6269] tracking-wider">
                      DAGMO
                    </th>
                    <th className="py-2.5 px-4 text-[10px] uppercase font-bold text-[#5E6269] tracking-wider">
                      SEEDKA
                    </th>
                    <th className="py-2.5 px-4 text-[10px] uppercase font-bold text-[#5E6269] tracking-wider text-center">
                      STATUS
                    </th>
                    <th className="py-2.5 px-4 text-[10px] uppercase font-bold text-[#5E6269] tracking-wider text-center border-l border-[#F1F3F5]">
                      PAYMENT
                    </th>
                    <th className="py-2.5 px-4 text-[10px] uppercase font-bold text-[#5E6269] tracking-wider text-right">
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F3F5]">
                  {paginatedShops.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-gray-400">
                        No shops matching active filters. Register a new location.
                      </td>
                    </tr>
                  ) : (
                    paginatedShops.map((shop) => {
                      const dName = dagmos.find(d => d.id === shop.dagmoId)?.name || "Unknown Regional";
                      const sName = seedkas.find(sd => sd.id === shop.seedkaId)?.name || "Unknown Office";
                      const currentMonth = new Date().toLocaleString('en-US', { month: 'long' });
                      const currentYear = new Date().getFullYear().toString();
                      const currentPayment = payments.find(p => p.shopId === shop.id && p.month === currentMonth && p.year === currentYear && p.status === 'Paid');
                      const isPaid = !!currentPayment;

                      return (
                        <tr key={shop.id} className={`hover:bg-[#F9FAFB] transition-all duration-150 ${shop.deletedAt ? 'opacity-60 bg-gray-50/50' : ''}`}>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${shop.deletedAt ? 'bg-gray-100 text-gray-400' : 'bg-[#EEF2FF] text-[#4F46E5]'}`}>
                                {shop.name.charAt(0)}
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">{shop.name}</div>
                                <div className="text-[10px] text-gray-400 font-mono mt-0.5">Code: {shop.code}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-700 font-medium">
                             {shop.tNumber}
                          </td>
                          <td className="py-3 px-4">
                             <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                               {shop.type}
                             </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {dName}
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {sName}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`text-[10px] font-bold py-0.5 px-2 bg-stone-100 rounded inline-block ${
                                shop.status === "Active"
                                  ? "bg-[#E8F5E9] text-[#2E7D32]"
                                  : shop.status === "Inactive"
                                  ? "bg-rose-50 text-rose-700"
                                  : "bg-[#FFF3E0] text-amber-700"
                              }`}
                            >
                              {shop.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center border-l border-[#F1F3F5]">
                            <span
                              className={`text-[10px] font-bold py-0.5 px-2 rounded inline-block ${
                                isPaid
                                  ? "bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]"
                                  : "bg-rose-50 text-rose-700 border border-rose-100"
                              }`}
                            >
                              {isPaid ? "Paid" : "Not Paid"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {!shop.deletedAt ? (
                                <>
                                  {!isPaid ? (
                                    <button
                                      onClick={() => setCollectShop(shop)}
                                      className="py-1 px-3 bg-[#EEF2FF] hover:bg-[#4F46E5] text-[#4F46E5] hover:text-white text-[10px] font-bold uppercase tracking-wider rounded transition-colors"
                                    >
                                      Collect Payment
                                    </button>
                                  ) : currentUserRole === "SUPER_ADMIN" ? (
                                    <button
                                      onClick={() => setConfirmDeletePaymentId(currentPayment.id)}
                                      className="py-1 px-3 bg-rose-50 hover:bg-rose-500 text-rose-600 hover:text-white text-[10px] font-bold uppercase tracking-wider rounded transition-colors"
                                    >
                                      Mark Not Paid
                                    </button>
                                  ) : (
                                    <span className="text-[10px] font-bold text-[#2E7D32] uppercase tracking-widest bg-slate-50 px-3 py-1 rounded">
                                      Confirmed
                                    </span>
                                  )}
                                  
                                  <button className="p-1 text-gray-400 hover:text-gray-600 transition">
                                    <Edit2 className="h-3.5 w-3.5" />
                                  </button>
                                  
                                  {currentUserRole === 'SUPER_ADMIN' && (
                                    <button 
                                      onClick={() => setConfirmDeleteShopId(shop.id)}
                                      className="p-1 text-gray-400 hover:text-rose-600 transition"
                                    >
                                      <X className="h-3.5 w-3.5" />
                                    </button>
                                  )}
                                </>
                              ) : (
                                <>
                                  <button className="p-1 text-gray-400 hover:text-gray-600 transition">
                                      <Eye className="h-4 w-4" />
                                  </button>
                                  {currentUserRole === 'SUPER_ADMIN' && (
                                    <button 
                                      onClick={() => handleRestoreShop(shop.id, shop.name)}
                                      className="py-1 px-3 bg-emerald-50 hover:bg-emerald-500 text-emerald-600 hover:text-white text-[10px] font-bold uppercase tracking-wider rounded transition-colors border border-emerald-100"
                                    >
                                      Restore Shop
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
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
      ) : (
        // CREATION FLOW (Slide 9 form layout mockup replica)
        <div className="max-w-xl mx-auto space-y-4">
          <div className="flex items-center justify-between border-b border-[#E1E4E8] pb-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsAddingNew(false)}
                className="p-1 hover:bg-gray-100 rounded text-gray-500 transition"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div>
                <h1 className="text-xl font-bold tracking-tight">Register New Shop</h1>
                <p className="text-[11px] text-[#5E6269]">Add a new retail endpoint to the centralized system</p>
              </div>
            </div>
            <Store className="h-6 w-6 text-[#4F46E5]" />
          </div>

          <form onSubmit={handleSubmit} className="bg-white border border-[#E1E4E8] rounded p-5 space-y-4 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">SHOP NAME</label>
                <input
                  type="text"
                  placeholder="e.g. Apex Retail Central"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full py-1.5 px-2 bg-white border border-[#E1E4E8] rounded text-xs focus:outline-none focus:border-[#4F46E5]"
                />
              </div>

              {/* Owner */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">OWNER NAME</label>
                <input
                  type="text"
                  placeholder="e.g. Eleanor Vance"
                  value={formOwner}
                  onChange={(e) => setFormOwner(e.target.value)}
                  className="w-full py-1.5 px-2 bg-white border border-[#E1E4E8] rounded text-xs focus:outline-none focus:border-[#4F46E5]"
                />
              </div>

              {/* T-Number */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">T-Number *</label>
                <input
                  type="text"
                  placeholder="Enter T-Number (e.g. 1000123456)"
                  value={formTNumber}
                  onChange={(e) => setFormTNumber(e.target.value)}
                  className="w-full py-1.5 px-2 bg-white border border-[#E1E4E8] rounded text-xs focus:outline-none focus:border-[#4F46E5]"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">PHONE NUMBER *</label>
                <input
                  type="tel"
                  placeholder="e.g. +251 9xx xxx xxx"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full py-1.5 px-2 bg-white border border-[#E1E4E8] rounded text-xs focus:outline-none focus:border-[#4F46E5]"
                />
              </div>

              {/* Shop Type */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">SHOP TYPE *</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  className="w-full py-1.5 px-2 bg-white border border-[#E1E4E8] rounded text-xs focus:outline-none focus:border-[#4F46E5] text-gray-700"
                >
                  <option value="">Select Type...</option>
                  {["Grocery", "Restaurant", "Cafe", "Pharmacy", "Electronics", "Clothing", "Hotel", "Salon", "Hardware", "Wholesale", "Retail", "Other"].map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* Custom Shop Type (Dynamic) */}
              {formType === "Other" && (
                <div className="space-y-1 animate-in fade-in slide-in-from-top-1 duration-200">
                  <label className="text-[10px] font-bold text-[#4F46E5] uppercase">Custom Shop Type *</label>
                  <input
                    type="text"
                    placeholder="e.g. Book Store"
                    value={formCustomType}
                    onChange={(e) => setFormCustomType(e.target.value)}
                    className="w-full py-1.5 px-2 bg-white border border-[#4F46E5]/30 rounded text-xs focus:outline-none focus:border-[#4F46E5] shadow-sm"
                  />
                  <p className="text-[9px] text-gray-400">Enter specific category (e.g. Printing Center)</p>
                </div>
              )}

              {/* Dagmo Select */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">DAGMO OFFICE</label>
                <select
                  value={formDagmo}
                  onChange={(e) => { setFormDagmo(e.target.value); setFormSeedka(""); }}
                  className="w-full py-1.5 px-2 bg-white border border-[#E1E4E8] rounded text-xs focus:outline-none focus:border-[#4F46E5]"
                >
                  <option value="">Select Dagmo Option...</option>
                  {dagmos.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                  ))}
                </select>
              </div>

              {/* Seedka Select */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">SEEDKA APPOINTMENT OFFICE</label>
                <select
                  value={formSeedka}
                  onChange={(e) => setFormSeedka(e.target.value)}
                  className="w-full py-1.5 px-2 bg-white border border-[#E1E4E8] rounded text-xs focus:outline-none focus:border-[#4F46E5] text-gray-700"
                  disabled={!formDagmo}
                >
                  <option value="">
                    {formDagmo ? "Select Seedka..." : "Choose Dagmo first"}
                  </option>
                  {filteredSeedkasForForm.map(sd => (
                    <option key={sd.id} value={sd.id}>{sd.name} ({sd.code})</option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div className="space-y-1 lg:col-span-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase">INITIAL STATUS</label>
                <div className="flex gap-3">
                  {(["Active", "Inactive", "Pending"] as ShopStatus[]).map((status) => (
                    <label key={status} className="flex-1 border border-[#E1E4E8] rounded p-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition">
                      <span className="text-xs font-semibold text-gray-700">{status}</span>
                      <input
                        type="radio"
                        name="shop_status"
                        checked={formStatus === status}
                        onChange={() => setFormStatus(status)}
                        className="h-3.5 w-3.5 text-[#4F46E5] focus:ring-[#EEF2FF]"
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#E1E4E8]">
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="py-1.5 px-4 bg-white border border-[#E1E4E8] hover:bg-slate-50 text-xs font-semibold text-gray-700 rounded transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="py-1.5 px-4 bg-[#4F46E5] hover:bg-[#4338CA] text-xs font-semibold text-white rounded transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {isSubmitting ? "Registering..." : "Register Enterprise"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Collect Payment Modal */}
      {collectShop && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded border border-[#E1E4E8] p-5 max-w-sm w-full shadow-md space-y-4 my-auto max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-[#F1F3F5] pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">Collect Payment</h3>
              <button onClick={() => { setCollectShop(null); setPaymentAmount(""); setPaymentNotes(""); }} className="text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <form onSubmit={handleCollectSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">SHOP DETAILS</label>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-xs text-gray-600 font-medium">
                  {collectShop.name} <br/>
                  <span className="text-[10px] text-gray-400">
                    {dagmos.find(d => d.id === collectShop.dagmoId)?.name} 
                    {" / "}
                    {seedkas.find(s => s.id === collectShop.seedkaId)?.name}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">PERIOD</label>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-[11px] text-gray-600 font-bold font-mono">
                    {new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">PAYMENT DATE</label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full py-2 px-2 border border-[#E1E4E8] rounded text-[11px] focus:outline-none focus:border-[#4F46E5]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">PAYMENT AMOUNT (ETB)</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full py-2 px-3 border border-[#E1E4E8] rounded focus:outline-none focus:border-[#4F46E5] text-sm font-mono text-gray-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">ADMIN NOTES (OPTIONAL)</label>
                <textarea
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="Enter any specific details..."
                  className="w-full py-2 px-3 border border-[#E1E4E8] rounded text-xs focus:outline-none focus:border-[#4F46E5] min-h-[60px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#F1F3F5]">
                <button
                  type="button"
                  onClick={() => { setCollectShop(null); setPaymentAmount(""); setPaymentNotes(""); }}
                  className="py-1.5 px-3 border border-[#E1E4E8] rounded text-xs font-semibold text-gray-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="py-1.5 px-4 bg-[#2E7D32] hover:bg-[#1B5E20] text-xs font-bold text-white uppercase tracking-wider rounded shadow-sm transition flex items-center gap-1 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {isSubmitting ? "RECORDING..." : "Complete Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mark Not Paid Confirmation Modal */}
      {confirmDeletePaymentId && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded border border-rose-100 p-6 max-w-sm w-full shadow-xl space-y-4 my-auto max-h-[95vh] overflow-y-auto">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 bg-rose-50 rounded-full">
                <Ban className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold">Reverse Payment?</h3>
            </div>
            
            <p className="text-xs text-gray-600 leading-relaxed">
              This will <strong>permanently delete</strong> the payment record for the current month. The shop will be marked as <strong>Not Paid</strong> instantly.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                disabled={isSubmitting}
                onClick={() => setConfirmDeletePaymentId(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 rounded transition"
              >
                No, Keep Paid
              </button>
              <button
                disabled={isSubmitting}
                onClick={handleMarkNotPaid}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider rounded shadow-lg transition disabled:opacity-50"
              >
                {isSubmitting ? "UPDATING..." : "Yes, Mark Not Paid"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Shop Confirmation Modal */}
      {confirmDeleteShopId && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded border border-[#E1E4E8] p-5 max-w-sm w-full space-y-4 shadow-xl my-auto max-h-[95vh] overflow-y-auto">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center">
                <X className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider">Delete Shop</h3>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Are you sure you want to delete this shop? It will be moved to the archives and can be restored later. Historical payments will be preserved.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteShopId(null)}
                className="py-1.5 px-3.5 text-xs font-semibold text-gray-600 bg-white border border-[#E1E4E8] rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteShop}
                disabled={isDeletingShop}
                className="py-1.5 px-4 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded transition shadow-sm disabled:opacity-50"
              >
                {isDeletingShop ? "Deleting..." : "Delete Shop"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
