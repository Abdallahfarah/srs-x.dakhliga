import React, { useState } from "react";
import { Building2, MapPin, Store, ChevronRight, Plus, Pencil, Trash2, X, ArrowLeft } from "lucide-react";
import { useData } from "../contexts/DataContext";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "../contexts/ToastContext";

export function DagmoDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { dagmos, seedkas, shops, handleAddSeedka, handleUpdateSeedka, handleDeleteSeedka } = useData();
  const { showToast } = useToast();

  const dagmo = dagmos.find(d => d.id === id);
  const dagmoSeedkas = seedkas.filter(s => s.dagmoId === id);
  const dagmoShops = shops.filter(s => s.dagmoId === id);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editSeedka, setEditSeedka] = useState<{ id: string; name: string; status: string } | null>(null);
  const [formName, setFormName] = useState("");
  const [formStatus, setFormStatus] = useState("Active");
  const [errorMsg, setErrorMsg] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!dagmo) {
    return (
      <div className="p-6 font-sans">
        <div className="text-center py-12 text-[#8A8F98]">
          <Building2 className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">Dagmo not found.</p>
          <button onClick={() => navigate('/super-admin/dagmos')} className="mt-3 text-[#4F46E5] text-xs hover:underline">Back to Dagmos</button>
        </div>
      </div>
    );
  }

  const openAdd = () => {
    setFormName("");
    setFormStatus("Active");
    setErrorMsg("");
    setShowAddModal(true);
  };

  const openEdit = (s: typeof dagmoSeedkas[0]) => {
    setEditSeedka({ id: s.id, name: s.name, status: s.status });
    setErrorMsg("");
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) { setErrorMsg("Seedka name is required."); return; }
    setIsSubmitting(true);
    try {
      await handleAddSeedka(dagmo.id, formName.trim(), formStatus);
      showToast(`Seedka "${formName}" added successfully.`, "success");
      setShowAddModal(false);
    } catch (err: any) {
      showToast(err.message || "Failed to create Seedka.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editSeedka || !editSeedka.name.trim()) { showToast("Seedka name is required.", "error"); return; }
    setIsSubmitting(true);
    try {
      await handleUpdateSeedka(editSeedka.id, editSeedka.name.trim(), editSeedka.status);
      showToast("Seedka updated successfully.", "success");
      setEditSeedka(null);
    } catch (err: any) {
      showToast(err.message || "Failed to update Seedka.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (seedkaId: string) => {
    if (!window.confirm("Are you sure you want to delete this Seedka?")) return;
    const result = await handleDeleteSeedka(seedkaId);
    if (result.error) {
      showToast(result.error, "error");
    } else {
      showToast("Seedka deleted successfully.", "success");
    }
  };

  return (
    <div className="p-6 font-sans">
      {/* Breadcrumb & Back */}
      <div className="flex items-center gap-2 text-[#5E6269] text-xs mb-4">
        <button onClick={() => navigate('/super-admin/dagmos')} className="flex items-center gap-1 hover:text-[#4F46E5] transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          Dagmos
        </button>
        <ChevronRight className="h-3 w-3 opacity-50" />
        <span className="text-[#1A1D21] font-semibold">{dagmo.name}</span>
      </div>

      {/* Dagmo Info Card */}
      <div className="bg-white border border-[#E1E4E8] rounded-xl p-5 shadow-sm mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#EEF2FF] rounded-xl flex items-center justify-center">
              <Building2 className="h-5 w-5 text-[#4F46E5]" />
            </div>
            <div>
              <h1 className="text-base font-bold text-[#1A1D21]">{dagmo.name}</h1>
              <p className="text-[10px] text-[#8A8F98] mt-0.5">
                Created {dagmo.createdAt ? new Date(dagmo.createdAt).toLocaleDateString() : '—'}
              </p>
            </div>
          </div>
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
            dagmo.status === 'Active'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-stone-100 text-[#5E6269] border-stone-200'
          }`}>{dagmo.status}</span>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-[#E1E4E8]">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[#8A8F98]" />
            <div>
              <p className="text-[10px] text-[#8A8F98] uppercase font-bold tracking-wider">Total Seedkas</p>
              <p className="text-lg font-bold text-[#1A1D21]">{dagmoSeedkas.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Store className="h-4 w-4 text-[#8A8F98]" />
            <div>
              <p className="text-[10px] text-[#8A8F98] uppercase font-bold tracking-wider">Total Shops</p>
              <p className="text-lg font-bold text-[#1A1D21]">{dagmoShops.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Seedka Management Section */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-bold text-[#1A1D21]">Seedka Management</h2>
          <p className="text-[10px] text-[#8A8F98]">Manage Seedkas within {dagmo.name}</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-3 py-1.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Seedka
        </button>
      </div>

      {deleteError && (
        <div className="mb-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs px-4 py-2.5 rounded-lg flex items-center justify-between">
          <span>{deleteError}</span>
          <button onClick={() => setDeleteError("")}><X className="h-3.5 w-3.5" /></button>
        </div>
      )}

      {/* Seedka Table */}
      <div className="bg-white border border-[#E1E4E8] rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-[#F7F8FA] border-b border-[#E1E4E8]">
              <th className="px-4 py-3 text-left text-[10px] font-bold text-[#8A8F98] uppercase tracking-wider">Seedka Name</th>
              <th className="px-4 py-3 text-left text-[10px] font-bold text-[#8A8F98] uppercase tracking-wider">Shops Count</th>
              <th className="px-4 py-3 text-left text-[10px] font-bold text-[#8A8F98] uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-[10px] font-bold text-[#8A8F98] uppercase tracking-wider">Created</th>
              <th className="px-4 py-3 text-right text-[10px] font-bold text-[#8A8F98] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E1E4E8]">
            {dagmoSeedkas.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-[#8A8F98]">No Seedkas in this Dagmo yet. Click "Add Seedka" to create one.</td></tr>
            ) : dagmoSeedkas.map(seedka => {
              const shopCount = shops.filter(s => s.seedkaId === seedka.id).length;
              return (
                <tr key={seedka.id} className="hover:bg-[#F7F8FA] transition-colors">
                  <td className="px-4 py-3 font-semibold text-[#1A1D21]">{seedka.name}</td>
                  <td className="px-4 py-3 text-[#5E6269]">{shopCount}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                      seedka.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-stone-100 text-[#5E6269] border-stone-200'
                    }`}>{seedka.status}</span>
                  </td>
                  <td className="px-4 py-3 text-[#5E6269]">
                    {seedka.createdAt ? new Date(seedka.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(seedka)}
                        className="p-1.5 text-[#8A8F98] hover:text-[#1A1D21] hover:bg-[#F1F3F5] rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(seedka.id)}
                        className="p-1.5 text-[#8A8F98] hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete"
                      >
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

      {/* Add Seedka Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E1E4E8]">
              <div>
                <h2 className="text-sm font-bold text-[#1A1D21]">Add Seedka</h2>
                <p className="text-[10px] text-[#8A8F98] mt-0.5">Adding to: <span className="font-semibold text-[#4F46E5]">{dagmo.name}</span></p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-[#8A8F98] hover:text-[#1A1D21] transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSubmitAdd} className="p-6 space-y-4">
              {errorMsg && (
                <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs px-3 py-2 rounded-lg">{errorMsg}</div>
              )}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#5E6269] uppercase tracking-wider">Seedka Name *</label>
                <input
                  type="text" required value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="e.g. Seedka A"
                  className="w-full border border-[#E1E4E8] rounded-lg px-3 py-2 text-xs text-[#1A1D21] placeholder:text-[#8A8F98] outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]/20 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#5E6269] uppercase tracking-wider">Status</label>
                <select value={formStatus} onChange={e => setFormStatus(e.target.value)}
                  className="w-full border border-[#E1E4E8] rounded-lg px-3 py-2 text-xs text-[#1A1D21] outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]/20 transition-all bg-white">
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2 border border-[#E1E4E8] text-[#5E6269] text-xs font-semibold rounded-lg hover:bg-[#F7F8FA] transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50">
                  {isSubmitting ? "Creating..." : "Create Seedka"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Seedka Modal */}
      {editSeedka && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E1E4E8]">
              <h2 className="text-sm font-bold text-[#1A1D21]">Edit Seedka</h2>
              <button onClick={() => setEditSeedka(null)} className="text-[#8A8F98] hover:text-[#1A1D21] transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSubmitEdit} className="p-6 space-y-4">
              {errorMsg && (
                <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs px-3 py-2 rounded-lg">{errorMsg}</div>
              )}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#5E6269] uppercase tracking-wider">Seedka Name *</label>
                <input
                  type="text" required value={editSeedka.name}
                  onChange={e => setEditSeedka({ ...editSeedka, name: e.target.value })}
                  className="w-full border border-[#E1E4E8] rounded-lg px-3 py-2 text-xs text-[#1A1D21] outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]/20 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#5E6269] uppercase tracking-wider">Status</label>
                <select value={editSeedka.status} onChange={e => setEditSeedka({ ...editSeedka, status: e.target.value })}
                  className="w-full border border-[#E1E4E8] rounded-lg px-3 py-2 text-xs text-[#1A1D21] outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]/20 transition-all bg-white">
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditSeedka(null)} className="flex-1 px-4 py-2 border border-[#E1E4E8] text-[#5E6269] text-xs font-semibold rounded-lg hover:bg-[#F7F8FA] transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50">
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
