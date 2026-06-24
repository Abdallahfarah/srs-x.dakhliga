import React, { useState } from "react";
import { Building2, Search, Plus, Eye, Pencil, Trash2, X, Check, ChevronRight, MapPin } from "lucide-react";
import { useData } from "../contexts/DataContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "../contexts/ToastContext";

export function DagmoManagement() {
  const { dagmos, seedkas, shops, handleAddDagmo, handleAddSeedka, handleUpdateDagmo, handleDeleteDagmo } = useData();
  const navigate = useNavigate();

  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editDagmo, setEditDagmo] = useState<{ id: string; name: string; status: string } | null>(null);

  // Create form state
  const [formName, setFormName] = useState("");
  const [formStatus, setFormStatus] = useState("Active");
  const [seedkaInput, setSeedkaInput] = useState("");
  const [pendingSeedkas, setPendingSeedkas] = useState<string[]>([]);
  const [seedkaError, setSeedkaError] = useState("");

  const [errorMsg, setErrorMsg] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filtered = dagmos.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setFormName("");
    setFormStatus("Active");
    setSeedkaInput("");
    setPendingSeedkas([]);
    setSeedkaError("");
    setErrorMsg("");
    setShowCreateModal(true);
  };

  const handleAddPendingSeedka = () => {
    const name = seedkaInput.trim();
    if (!name) { setSeedkaError("Seedka name cannot be empty."); return; }
    if (pendingSeedkas.some(s => s.toLowerCase() === name.toLowerCase())) {
      setSeedkaError("Duplicate Seedka name.");
      return;
    }
    setPendingSeedkas(prev => [...prev, name]);
    setSeedkaInput("");
    setSeedkaError("");
  };

  const handleRemovePendingSeedka = (index: number) => {
    setPendingSeedkas(prev => prev.filter((_, i) => i !== index));
  };

  const openEdit = (dagmo: typeof dagmos[0]) => {
    setEditDagmo({ id: dagmo.id, name: dagmo.name, status: dagmo.status });
    setErrorMsg("");
  };

  const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) { setErrorMsg("Dagmo name is required."); return; }
    const duplicate = dagmos.find(d => d.name.toLowerCase() === formName.trim().toLowerCase());
    if (duplicate) { setErrorMsg("A Dagmo with this name already exists."); return; }
    if (pendingSeedkas.length === 0) { setErrorMsg("At least one Seedka is required."); return; }

    setIsSubmitting(true);
    try {
      // Step 1: Create the Dagmo record
      await handleAddDagmo(formName.trim(), formStatus);

      // Step 2: Retrieve the newly created Dagmo's ID directly from Supabase
      const { supabase } = await import("../lib/supabase");
      const { data: newDagmo, error: fetchErr } = await supabase
        .from("dagmos")
        .select("id")
        .eq("name", formName.trim())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (fetchErr) throw fetchErr;

      if (newDagmo?.id) {
        // Step 3: Create all Seedkas linked to the new Dagmo
        for (const seedkaName of pendingSeedkas) {
          await handleAddSeedka(newDagmo.id, seedkaName, "Active");
        }
      }

      showToast(`Dagmo "${formName}" and ${pendingSeedkas.length} Seedkas created.`, "success");
      setShowCreateModal(false);
    } catch (err: any) {
      showToast(err.message || "Failed to create Dagmo.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editDagmo || !editDagmo.name.trim()) { showToast("Dagmo name is required.", "error"); return; }
    setIsSubmitting(true);
    try {
      await handleUpdateDagmo(editDagmo.id, editDagmo.name.trim(), editDagmo.status);
      showToast("Dagmo updated successfully.", "success");
      setEditDagmo(null);
    } catch (err: any) {
      showToast(err.message || "Failed to update Dagmo.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this Dagmo?")) return;
    const result = await handleDeleteDagmo(id);
    if (result.error) {
      showToast(result.error, "error");
    } else {
      showToast("Dagmo deleted successfully.", "success");
    }
  };

  return (
    <div className="p-6 font-sans">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-[#5E6269] text-xs mb-1">
            <Building2 className="h-3.5 w-3.5" />
            <span>Location Hierarchy</span>
            <ChevronRight className="h-3 w-3 opacity-50" />
            <span className="text-[#1A1D21] font-semibold">Dagmo Management</span>
          </div>
          <h1 className="text-xl font-bold text-[#1A1D21]">Dagmos</h1>
          <p className="text-[#8A8F98] text-xs mt-0.5">Manage all regional Dagmo divisions and their Seedkas.</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold rounded-lg transition-colors shadow-sm">
          <Plus className="h-3.5 w-3.5" />
          Create Dagmo
        </button>
      </div>

      {deleteError && (
        <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-600 text-xs px-4 py-2.5 rounded-lg flex items-center justify-between">
          <span>{deleteError}</span>
          <button onClick={() => setDeleteError("")}><X className="h-3.5 w-3.5" /></button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-[#E1E4E8] rounded-xl overflow-hidden shadow-sm">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#E1E4E8]">
          <Search className="h-3.5 w-3.5 text-[#8A8F98]" />
          <input type="text" placeholder="Search dagmos..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 text-xs text-[#1A1D21] placeholder:text-[#8A8F98] outline-none bg-transparent" />
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-[#F7F8FA] border-b border-[#E1E4E8]">
              <th className="px-4 py-3 text-left text-[10px] font-bold text-[#8A8F98] uppercase tracking-wider">Dagmo Name</th>
              <th className="px-4 py-3 text-left text-[10px] font-bold text-[#8A8F98] uppercase tracking-wider">Total Seedkas</th>
              <th className="px-4 py-3 text-left text-[10px] font-bold text-[#8A8F98] uppercase tracking-wider">Total Shops</th>
              <th className="px-4 py-3 text-left text-[10px] font-bold text-[#8A8F98] uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-[10px] font-bold text-[#8A8F98] uppercase tracking-wider">Created</th>
              <th className="px-4 py-3 text-right text-[10px] font-bold text-[#8A8F98] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E1E4E8]">
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-[#8A8F98]">No dagmos found.</td></tr>
            ) : filtered.map(dagmo => {
              const seedkaCount = seedkas.filter(s => s.dagmoId === dagmo.id).length;
              const shopCount = shops.filter(s => s.dagmoId === dagmo.id).length;
              return (
                <tr key={dagmo.id} className="hover:bg-[#F7F8FA] transition-colors">
                  <td className="px-4 py-3 font-semibold text-[#1A1D21]">{dagmo.name}</td>
                  <td className="px-4 py-3 text-[#5E6269]">{seedkaCount}</td>
                  <td className="px-4 py-3 text-[#5E6269]">{shopCount}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                      dagmo.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-stone-100 text-[#5E6269] border-stone-200'
                    }`}>{dagmo.status}</span>
                  </td>
                  <td className="px-4 py-3 text-[#5E6269]">{dagmo.createdAt ? new Date(dagmo.createdAt).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => navigate(`/super-admin/dagmos/${dagmo.id}`)}
                        className="p-1.5 text-[#8A8F98] hover:text-[#4F46E5] hover:bg-[#EEF2FF] rounded-lg transition-colors" title="View">
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => openEdit(dagmo)}
                        className="p-1.5 text-[#8A8F98] hover:text-[#1A1D21] hover:bg-[#F1F3F5] rounded-lg transition-colors" title="Edit">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => handleDelete(dagmo.id)}
                        className="p-1.5 text-[#8A8F98] hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors" title="Delete">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* CREATE MODAL — with Seedkas */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E1E4E8] shrink-0">
              <h2 className="text-sm font-bold text-[#1A1D21]">Create Dagmo</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-[#8A8F98] hover:text-[#1A1D21] transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSubmitCreate} className="p-6 space-y-4 overflow-y-auto flex-1">
              {errorMsg && (
                <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs px-3 py-2 rounded-lg">{errorMsg}</div>
              )}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#5E6269] uppercase tracking-wider">Dagmo Name *</label>
                <input type="text" required value={formName} onChange={e => setFormName(e.target.value)}
                  placeholder="e.g. Jigjiga"
                  className="w-full border border-[#E1E4E8] rounded-lg px-3 py-2 text-xs text-[#1A1D21] placeholder:text-[#8A8F98] outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]/20 transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#5E6269] uppercase tracking-wider">Status</label>
                <select value={formStatus} onChange={e => setFormStatus(e.target.value)}
                  className="w-full border border-[#E1E4E8] rounded-lg px-3 py-2 text-xs text-[#1A1D21] outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]/20 transition-all bg-white">
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>

              {/* Seedkas Section */}
              <div className="border-t border-[#E1E4E8] pt-4 space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-[#4F46E5]" />
                  <label className="text-[10px] font-bold text-[#5E6269] uppercase tracking-wider">Seedkas *</label>
                  <span className="text-[9px] text-[#8A8F98] font-medium">(min. 1 required)</span>
                </div>
                <div className="flex gap-2">
                  <input type="text" value={seedkaInput}
                    onChange={e => { setSeedkaInput(e.target.value); setSeedkaError(""); }}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleAddPendingSeedka(); } }}
                    placeholder="e.g. Kebele A"
                    className="flex-1 border border-[#E1E4E8] rounded-lg px-3 py-2 text-xs text-[#1A1D21] placeholder:text-[#8A8F98] outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]/20 transition-all" />
                  <button type="button" onClick={handleAddPendingSeedka}
                    className="px-3 py-2 bg-[#F1F3F5] hover:bg-[#EEF2FF] text-[#4F46E5] text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 shrink-0 border border-[#E1E4E8]">
                    <Plus className="h-3.5 w-3.5" /> Add
                  </button>
                </div>
                {seedkaError && <p className="text-rose-500 text-[11px] font-medium">{seedkaError}</p>}
                {pendingSeedkas.length > 0 ? (
                  <div className="bg-[#F7F8FA] border border-[#E1E4E8] rounded-lg divide-y divide-[#E1E4E8] overflow-hidden">
                    {pendingSeedkas.map((name, idx) => (
                      <div key={idx} className="flex items-center justify-between px-3 py-2">
                        <div className="flex items-center gap-2">
                          <Check className="h-3 w-3 text-emerald-500 shrink-0" />
                          <span className="text-xs text-[#1A1D21] font-medium">{name}</span>
                        </div>
                        <button type="button" onClick={() => handleRemovePendingSeedka(idx)}
                          className="text-[#8A8F98] hover:text-rose-500 transition-colors p-0.5 rounded">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-[#8A8F98] italic">No Seedkas added yet.</p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-[#E1E4E8] text-[#5E6269] text-xs font-semibold rounded-lg hover:bg-[#F7F8FA] transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50">
                  {isSubmitting ? "Creating..." : "Create Dagmo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editDagmo && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E1E4E8]">
              <h2 className="text-sm font-bold text-[#1A1D21]">Edit Dagmo</h2>
              <button onClick={() => setEditDagmo(null)} className="text-[#8A8F98] hover:text-[#1A1D21] transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSubmitEdit} className="p-6 space-y-4">
              {errorMsg && (
                <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs px-3 py-2 rounded-lg">{errorMsg}</div>
              )}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#5E6269] uppercase tracking-wider">Dagmo Name *</label>
                <input type="text" required value={editDagmo.name}
                  onChange={e => setEditDagmo({ ...editDagmo, name: e.target.value })}
                  className="w-full border border-[#E1E4E8] rounded-lg px-3 py-2 text-xs text-[#1A1D21] outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]/20 transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#5E6269] uppercase tracking-wider">Status</label>
                <select value={editDagmo.status} onChange={e => setEditDagmo({ ...editDagmo, status: e.target.value })}
                  className="w-full border border-[#E1E4E8] rounded-lg px-3 py-2 text-xs text-[#1A1D21] outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]/20 transition-all bg-white">
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditDagmo(null)}
                  className="flex-1 px-4 py-2 border border-[#E1E4E8] text-[#5E6269] text-xs font-semibold rounded-lg hover:bg-[#F7F8FA] transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50">
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
