import React, { useState, useEffect } from "react";
import { Users, Plus, Shield, ShieldCheck, Mail, Phone, Ban, Check, UserCheck, X, Eye, Edit2, Search, Filter, Calendar, Activity, Info, Key, Lock } from "lucide-react";
import { User, UserRole, Shop, Payment, Dagmo } from "../types";
import { useToast } from "../contexts/ToastContext";

interface UserAccessProps {
  users: User[];
  shops: Shop[];
  payments: Payment[];
  dagmos: Dagmo[];
  currentUserId: string;
  currentUserRole: UserRole;
  onAddUser: (user: any) => Promise<void>;
  onUpdateUser: (id: string, updated: Partial<User>) => Promise<void>;
  onToggleUserStatus: (id: string) => Promise<void>;
  onLogAudit: (action: string, entityType: string, entityId: string) => Promise<void>;
  onResetPassword: (userId: string, newPassword: string) => Promise<void>;
}

export function UserAccess({ 
  users, 
  shops, 
  payments, 
  dagmos, 
  currentUserId, 
  currentUserRole,
  onAddUser, 
  onUpdateUser,
  onToggleUserStatus,
  onLogAudit,
  onResetPassword
}: UserAccessProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Filter & Search State
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<"All" | UserRole>("All");
  const [filterStatus, setFilterStatus] = useState<"All" | "Active" | "Suspended">("All");

  // Form states (Add/Edit)
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<UserRole>("ADMIN");
  const [status, setStatus] = useState<"Active" | "Suspended">("Active");
  const [loading, setLoading] = useState(false);
  
  // Auto-username generation
  useEffect(() => {
    if (!name || isEditing) return;
    const firstName = name.split(" ")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
    if (firstName) {
      // Only generate if not already set or it matches previous generation pattern
      const randomNumber = Math.floor(Math.random() * 90) + 10;
      setUsername(`${firstName}${randomNumber}`);
    } else {
      setUsername("");
    }
  }, [name, isAdding]); // Add isAdding to reset when modal opens
  
  const { showToast } = useToast();

  const validateUsername = (val: string) => {
    const rules = {
      length: val.length >= 4,
      lowercase: /^[a-z0-9._]+$/.test(val),
      noSpaces: !/\s/.test(val)
    };
    return rules;
  };

  const validatePassword = (pw: string) => {
    return {
      length: pw.length >= 8,
      upper: /[A-Z]/.test(pw),
      lower: /[a-z]/.test(pw),
      digit: /[0-9]/.test(pw)
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const rules = validateUsername(username);
    if (!name || !phone || !password) {
      showToast("All fields are required.", "error");
      return;
    }
    // ensure username was generated
    if (!username) {
        showToast("Identity generation failed. Please enter a valid name.", "error");
        return;
    }
    if (!rules.length || !rules.lowercase || !rules.noSpaces) {
      showToast("Username does not meet security requirements.", "error");
      return;
    }

    setLoading(true);
    try {
      await onAddUser({
        name,
        username: username.toLowerCase(),
        password,
        phone,
        role,
        status: "Active",
        avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 500000)}?auto=format&fit=crop&q=80&w=150`
      });
      showToast("User credential generated successfully.", "success");
      setName("");
      setUsername("");
      setPassword("");
      setPhone("");
      setRole("ADMIN");
      setIsAdding(false);
    } catch (err: any) {
      showToast(err.message || "Failed to create user.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEditInit = (u: User) => {
    setSelectedUser(u);
    setName(u.name);
    setUsername(u.username);
    setPhone(u.phone);
    setRole(u.role);
    setStatus(u.status as "Active" | "Suspended");
    setIsEditing(true);
  };

  const handleResetInit = (u: User) => {
    setSelectedUser(u);
    setPassword("");
    setConfirmPassword("");
    setIsResetting(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setLoading(true);
    try {
      await onUpdateUser(selectedUser.id, {
        name,
        username,
        phone,
        role,
        status
      });
      showToast("User updated successfully.", "success");
      setIsEditing(false);
      setSelectedUser(null);
    } catch (err: any) {
      showToast(err.message || "Update failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    const v = validatePassword(password);
    if (!v.length || !v.upper || !v.lower || !v.digit) {
      showToast("Password must be 8+ chars and include upper, lower, and digit.", "error");
      return;
    }
    if (password !== confirmPassword) {
      showToast("Passwords do not match.", "error");
      return;
    }

    setLoading(true);
    try {
      await onResetPassword(selectedUser.id, password);
      showToast("Password updated successfully.", "success");
      setIsResetting(false);
      setSelectedUser(null);
    } catch (err: any) {
      showToast(err.message || "Password reset failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (u: User) => {
    setSelectedUser(u);
    setIsViewing(true);
    await onLogAudit("USER_VIEWED", "PROFILE", u.id);
  };

  // Logic: Filters & Search
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
                          u.username.toLowerCase().includes(search.toLowerCase()) ||
                          u.phone.includes(search);
    const matchesRole = filterRole === "All" || u.role === filterRole;
    const matchesStatus = filterStatus === "All" || u.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getUserStats = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return {
      shops: shops.filter(s => s.createdBy === user?.email).length, 
      payments: payments.filter(p => p.createdById === user?.id).length,
      dagmos: dagmos.length 
    };
  };

  if (currentUserRole !== "SUPER_ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center space-y-4">
        <Shield className="h-12 w-12 text-rose-500 opacity-20" />
        <h2 className="text-lg font-bold text-gray-900 tracking-tight">Access Restricted</h2>
        <p className="text-gray-500 text-sm max-w-xs mx-auto">
          User Management is reserved for Super Administrators only. Please contact your system administrator.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in text-[#1A1D21] font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            User Management
          </h1>
          <p className="text-xs text-[#5E6269] mt-1">
            Manage administrator access and system privileges.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="py-1.5 px-3 bg-[#4F46E5] hover:bg-[#4338CA] text-xs font-semibold text-white rounded flex items-center gap-1.5 transition-all shadow-sm shrink-0"
        >
          <Plus className="h-4 w-4" />
          Create User
        </button>
      </div>

      {isAdding && (
        <div className="bg-white border border-[#E1E4E8] rounded p-5 shadow-sm max-w-xl mx-auto space-y-4">
          <div className="flex justify-between items-center border-b border-[#F1F3F5] pb-3">
            <h3 className="font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="h-4 w-4 text-[#4F46E5]" />
              Add Administrator Account
            </h3>
            <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">FULL NAME *</label>
                <input
                  type="text"
                  placeholder="e.g. Eleanor Vance"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full py-1.5 px-2 bg-white border border-[#E1E4E8] rounded text-xs focus:outline-none focus:border-[#4F46E5]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">USERNAME</label>
                <div className="flex items-center bg-slate-50 border border-[#E1E4E8] rounded h-[31px] overflow-hidden">
                  <div className="pl-2 flex items-center">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  </div>
                  <span className="flex-1 px-2 text-xs font-mono font-bold text-gray-600 truncate">{username || "..." }</span>
                  <div className="bg-[#F1F3F5] px-2 h-full flex items-center border-l border-[#E1E4E8]">
                    <span className="text-[10px] font-mono font-bold text-gray-500">@srs.local</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px) font-bold text-gray-500 uppercase">PHONE NUMBER</label>
                <input
                  type="text"
                  placeholder="+251 ..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full py-1.5 px-2 bg-white border border-[#E1E4E8] rounded text-xs focus:outline-none focus:border-[#4F46E5]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">TEMPORARY PASSWORD</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full py-1.5 px-2 bg-white border border-[#E1E4E8] rounded text-xs focus:outline-none focus:border-[#4F46E5]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase">SYSTEM LEVEL ROLE</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full py-1.5 px-2 bg-white border border-[#E1E4E8] rounded text-xs text-gray-800 focus:outline-none focus:border-[#4F46E5]"
              >
                <option value="ADMIN">ADMINISTRATOR (Tenant Isolated)</option>
                <option value="SUPER_ADMIN">SUPER ADMIN (Global Access)</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#F1F3F5]">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="py-1.5 px-3 border border-[#E1E4E8] text-xs font-semibold rounded text-gray-650 hover:bg-[#F9FAFB]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="py-1.5 px-3 bg-[#4F46E5] text-xs font-semibold text-white rounded hover:bg-[#4338CA] shadow-sm flex items-center gap-1.5 disabled:opacity-50"
              >
                {loading ? "Generating..." : "Generate Credentials"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white border border-[#E1E4E8] rounded p-4 shadow-sm">
        <div className="sm:col-span-2 relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, username or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 py-2 bg-slate-50 border border-[#E1E4E8] rounded text-xs focus:outline-none focus:border-[#4F46E5] text-gray-700"
          />
        </div>
        <div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as any)}
            className="w-full py-2 px-3 bg-slate-50 border border-[#E1E4E8] rounded text-xs text-gray-700 focus:outline-none focus:border-[#4F46E5]"
          >
            <option value="All">All Roles</option>
            <option value="ADMIN">ADMIN</option>
            <option value="SUPER_ADMIN">SUPER ADMIN</option>
          </select>
        </div>
        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="w-full py-2 px-3 bg-slate-50 border border-[#E1E4E8] rounded text-xs text-gray-700 focus:outline-none focus:border-[#4F46E5]"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* User Table Header/Table */}
      <div className="bg-white border border-[#E1E4E8] rounded overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E1E4E8] bg-[#F9FAFB]">
                <th className="py-2.5 px-4 text-[10px] uppercase font-bold text-[#5E6269] tracking-wider">NAME</th>
                <th className="py-2.5 px-4 text-[10px] uppercase font-bold text-[#5E6269] tracking-wider">USERNAME</th>
                <th className="py-2.5 px-4 text-[10px) uppercase font-bold text-[#5E6269] tracking-wider">PHONE</th>
                <th className="py-2.5 px-4 text-[10px] uppercase font-bold text-[#5E6269] tracking-wider">STATUS</th>
                <th className="py-2.5 px-4 text-[10px] uppercase font-bold text-[#5E6269] tracking-wider text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F3F5]">
              {filteredUsers.map((u) => {
                const initials = u.name.split(" ").map(n => n[0]).join("").substring(0,2).toUpperCase();
                return (
                  <tr key={u.id} className="hover:bg-[#F9FAFB] transition-all duration-150">
                    <td className="py-2.5 px-4 flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs border border-[#E1E4E8]">
                        {initials}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 leading-tight">{u.name}</div>
                        <div className="text-[9px] font-bold uppercase mt-0.5 tracking-wider flex items-center gap-1">
                          {u.role === "SUPER_ADMIN" ? <span className="text-[#4F46E5]">SUPER ADMIN</span> : <span className="text-gray-500">ADMIN</span>}
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-gray-600 font-mono italic">{u.username}</td>
                    <td className="py-2.5 px-4 text-gray-600">{u.phone}</td>
                    <td className="py-2.5 px-4">
                      <span className={`text-[10px] font-bold py-0.5 px-2 rounded inline-block ${u.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button title="View Details" onClick={() => handleView(u)} className="p-1.5 text-gray-400 hover:text-[#4F46E5] bg-slate-50 border border-gray-100 rounded transition-all">
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button title="Edit User" onClick={() => handleEditInit(u)} className="p-1.5 text-gray-400 hover:text-amber-600 bg-slate-50 border border-gray-100 rounded transition-all">
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button title="Reset Password" onClick={() => handleResetInit(u)} className="p-1.5 text-gray-400 hover:text-indigo-600 bg-slate-50 border border-gray-100 rounded transition-all">
                          <Lock className="h-3.5 w-3.5" />
                        </button>
                        {u.id !== currentUserId && (
                          <button 
                            title={u.status === 'Active' ? 'Suspend Account' : 'Activate Account'}
                            onClick={async () => {
                              try {
                                await onToggleUserStatus(u.id);
                                showToast(`${u.status === 'Active' ? 'Suspended' : 'Activated'} user successfully.`, "success");
                              } catch(e:any) { showToast(e.message, "error"); }
                            }} 
                            className={`p-1.5 rounded border transition-all ${u.status === "Active" ? "text-rose-400 hover:text-rose-600 border-rose-100 bg-rose-50" : "text-emerald-400 hover:text-emerald-600 border-emerald-100 bg-emerald-50"}`}
                          >
                            {u.status === "Active" ? <Ban className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals: View & Edit */}
      {isViewing && selectedUser && (
        <div className="fixed inset-0 bg-[#1A1D21]/40 backdrop-blur-[2px] flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden border border-[#E1E4E8] animate-in zoom-in-95 duration-200 my-auto max-h-[95vh] overflow-y-auto">
            <div className="bg-[#4F46E5] p-6 text-white relative">
              <button onClick={() => setIsViewing(false)} className="absolute top-4 right-4 text-white/70 hover:text-white"><X className="h-5 w-5" /></button>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl font-bold border border-white/30">
                  {selectedUser.name[0]}
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight">{selectedUser.name}</h2>
                  <p className="text-white/70 text-xs font-mono">@{selectedUser.username}</p>
                </div>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5"><Info className="h-3 w-3" /> Account Information</h3>
                <div className="space-y-2.5">
                  {[
                    { label: "Phone", val: selectedUser.phone },
                    { label: "Role", val: selectedUser.role },
                    { label: "Status", val: selectedUser.status },
                    { label: "Joined", val: selectedUser.createdDate }
                  ].map(spec => (
                    <div key={spec.label} className="flex justify-between border-b border-slate-50 pb-1.5">
                      <span className="text-xs text-gray-400">{spec.label}</span>
                      <span className="text-xs font-semibold text-gray-700">{spec.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5"><Activity className="h-3 w-3" /> Activity Summary</h3>
                <div className="grid grid-cols-1 gap-3">
                  <div className="p-3 bg-slate-50 rounded border border-slate-100">
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Shops Created</p>
                    <p className="text-xl font-bold text-[#1A1D21]">{getUserStats(selectedUser.id).shops}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded border border-slate-100">
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Payments Managed</p>
                    <p className="text-xl font-bold text-[#1A1D21]">{getUserStats(selectedUser.id).payments}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 p-4 border-t border-[#E1E4E8] flex justify-end">
              <button onClick={() => setIsViewing(false)} className="py-1.5 px-4 bg-white border border-[#E1E4E8] text-xs font-bold rounded shadow-sm hover:bg-slate-100">Close Profile</button>
            </div>
          </div>
        </div>
      )}

      {isEditing && selectedUser && (
        <div className="fixed inset-0 bg-[#1A1D21]/40 backdrop-blur-[2px] flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded border border-[#E1E4E8] shadow-2xl w-full max-w-lg overflow-hidden animate-in slide-in-from-bottom-2 duration-300 my-auto max-h-[95vh] overflow-y-auto">
            <div className="p-4 border-b border-[#F1F3F5] flex justify-between items-center bg-slate-50">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A1D21]">Edit User: {selectedUser.name}</h3>
              <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600"><X className="h-4 w-4" /></button>
            </div>
            <form onSubmit={handleUpdate} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Full Name</label>
                  <input value={name} onChange={e => setName(e.target.value)} className="w-full py-1.5 px-2 bg-white border border-[#E1E4E8] rounded text-xs outline-none focus:border-[#4F46E5] shadow-sm font-semibold" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Username</label>
                  <input value={username} onChange={e => setUsername(e.target.value.toLowerCase())} className="w-full py-1.5 px-2 bg-white border border-[#E1E4E8] rounded text-xs outline-none focus:border-[#4F46E5] shadow-sm font-mono" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Phone</label>
                  <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full py-1.5 px-2 bg-white border border-[#E1E4E8] rounded text-xs outline-none focus:border-[#4F46E5] shadow-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Role</label>
                  <select value={role} onChange={e => setRole(e.target.value as any)} className="w-full py-1.5 px-2 bg-white border border-[#E1E4E8] rounded text-xs outline-none focus:border-[#4F46E5] shadow-sm">
                    <option value="ADMIN">ADMIN</option>
                    <option value="SUPER_ADMIN">SUPER ADMIN</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Account Status</label>
                <div className="flex gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="radio" name="st" checked={status === 'Active'} onChange={() => setStatus('Active')} className="accent-[#4F46E5]" />
                    <span className="text-xs font-semibold text-gray-700">Active</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="radio" name="st" checked={status === 'Suspended'} onChange={() => setStatus('Suspended')} className="accent-rose-500" />
                    <span className="text-xs font-semibold text-rose-600">Suspended</span>
                  </label>
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-2 border-t border-[#F1F3F5]">
                <button type="button" onClick={() => setIsEditing(false)} className="py-1.5 px-3 border border-gray-100 text-xs font-bold rounded hover:bg-slate-50 text-gray-500">Cancel</button>
                <button type="submit" disabled={loading} className="py-1.5 px-5 bg-[#4F46E5] text-white text-xs font-bold rounded hover:bg-[#4338CA] shadow-md shadow-indigo-100 disabled:opacity-50">{loading ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isResetting && selectedUser && (
        <div className="fixed inset-0 bg-[#1A1D21]/40 backdrop-blur-[2px] flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded border border-[#E1E4E8] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 my-auto max-h-[95vh] overflow-y-auto">
            <div className="p-4 border-b border-[#F1F3F5] flex justify-between items-center bg-slate-50">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A1D21] flex items-center gap-1.5">
                <Key className="h-4 w-4 text-[#4F46E5]" />
                Reset Password
              </h3>
              <button onClick={() => setIsResetting(false)} className="text-gray-400 hover:text-gray-600"><X className="h-4 w-4" /></button>
            </div>
            <form onSubmit={handleResetPasswordSubmit} className="p-5 space-y-4">
              <p className="text-[10px] text-gray-500 leading-relaxed">
                Enter a new password for <span className="font-bold text-[#1A1D21]">@{selectedUser.username}</span>. Ensure it meets all complexity requirements.
              </p>
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">New Password *</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  className="w-full py-2 px-3 bg-white border border-[#E1E4E8] rounded text-xs outline-none focus:border-[#4F46E5] shadow-sm"
                  placeholder="••••••••"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Confirm Password *</label>
                <input 
                  type="password" 
                  value={confirmPassword} 
                  onChange={e => setConfirmPassword(e.target.value)} 
                  className="w-full py-2 px-3 bg-white border border-[#E1E4E8] rounded text-xs outline-none focus:border-[#4F46E5] shadow-sm"
                  placeholder="••••••••"
                />
              </div>

              <div className="bg-blue-50 border border-blue-100 p-3 rounded space-y-1.5">
                <p className="text-[9px] font-bold text-blue-700 uppercase">Complexity Requirements:</p>
                <ul className="grid grid-cols-2 gap-x-2 gap-y-1">
                  {[
                    { label: '8+ Characters', met: validatePassword(password).length },
                    { label: 'Uppercase', met: validatePassword(password).upper },
                    { label: 'Lowercase', met: validatePassword(password).lower },
                    { label: 'Digit (0-9)', met: validatePassword(password).digit },
                  ].map(rule => (
                    <li key={rule.label} className={`text-[9px] flex items-center gap-1 font-semibold ${rule.met ? 'text-emerald-600' : 'text-gray-400'}`}>
                      <Check className={`h-2.5 w-2.5 ${rule.met ? 'opacity-100' : 'opacity-20'}`} /> {rule.label}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button type="submit" disabled={loading} className="w-full py-2 bg-[#4F46E5] text-white text-xs font-bold rounded hover:bg-[#4338CA] shadow-lg shadow-indigo-100 disabled:opacity-50">
                  {loading ? 'Processing...' : 'Update Password'}
                </button>
                <button type="button" onClick={() => setIsResetting(false)} className="w-full py-2 text-gray-400 hover:text-gray-600 text-[10px] font-bold">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
