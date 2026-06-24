import React, { useState } from "react";
import { User, Lock, Mail, Phone, Upload, CheckCircle, AlertCircle } from "lucide-react";
import { User as UserType } from "../types";
import { useToast } from "../contexts/ToastContext";

interface ProfileSettingsProps {
  currentUser: UserType;
  onUpdateCurrentUser: (updated: Partial<UserType>) => Promise<void>;
}

export function ProfileSettings({ currentUser, onUpdateCurrentUser }: ProfileSettingsProps) {
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [phone, setPhone] = useState(currentUser.phone);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();
  const [toastMessage, setToastMessage] = useState("");
  const [showPassModal, setShowPassModal] = useState(false);
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [passError, setPassError] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onUpdateCurrentUser({
        name,
        email,
        phone
      });
      showToast("Profile configuration saved and synced successfully!", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to update profile.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPass || !newPass) {
      setPassError("All fields are required.");
      return;
    }
    if (newPass.length < 8) {
      setPassError("New password must be at least 8 characters long.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { supabase } = await import("../lib/supabase");
      const { error } = await supabase.auth.updateUser({ password: newPass });
      if (error) throw error;

      showToast("Password updated successfully.", "success");
      setShowPassModal(false);
      setCurrentPass("");
      setNewPass("");
      setPassError("");
    } catch (err: any) {
      setPassError(err.message || "Failed to update password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-[#1A1D21] max-w-3xl mx-auto font-sans">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Profile Settings
        </h1>
        <p className="text-xs text-[#5E6269] mt-1">
          Manage your administrative account details and credentials.
        </p>
      </div>

      {/* Main Profile Info Card (Slide 6 layout style) */}
      <form onSubmit={handleSave} className="bg-white border border-[#E1E4E8] rounded p-5 space-y-6 shadow-sm">
        {/* Avatar block */}
        <div className="flex flex-col sm:flex-row items-center gap-4 pb-4 border-b border-[#F1F3F5]">
          <div className="relative">
            <img
              src={currentUser.avatar}
              alt="Avatar"
              className="h-14 w-14 rounded-full object-cover border border-[#E1E4E8]"
            />
          </div>
          <div className="text-center sm:text-left space-y-0.5">
            <h3 className="font-bold text-xs uppercase tracking-wider text-gray-900">Admin Avatar</h3>
            <p className="text-[10px] text-gray-400">JPG, GIF or PNG. Max size of 800K</p>
            <button
              type="button"
              className="mt-1 text-[10px] font-bold uppercase tracking-wider py-1 px-2 bg-white border border-[#E1E4E8] hover:bg-[#F9FAFB] text-gray-700 rounded transition"
            >
              Upload New
            </button>
          </div>
        </div>

        {/* Inputs layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full py-1.5 px-2 bg-white border border-[#E1E4E8] rounded text-xs focus:outline-none focus:border-[#4F46E5]"
            />
          </div>

          {/* Role (ReadOnly disabled in Slide 6 mockup) */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase">Role</label>
            <input
              type="text"
              value={currentUser.role === "SUPER_ADMIN" ? "Global System Director" : "Tenant-Isolated System Administrator"}
              disabled
              className="w-full py-1.5 px-2 bg-slate-50 border border-[#E1E4E8] text-slate-500 rounded text-xs cursor-not-allowed"
            />
          </div>

          {/* Username (Identity) */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase">Profile Identity</label>
            <div className="flex items-center gap-2 py-1.5 px-2 bg-slate-50 border border-[#E1E4E8] rounded text-xs text-slate-500 cursor-not-allowed">
              <span className="font-mono italic">@{currentUser.username}</span>
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full py-1.5 px-2 bg-white border border-[#E1E4E8] rounded text-xs focus:outline-none focus:border-[#4F46E5]"
            />
          </div>
        </div>

        {/* Buttons flow */}
        <div className="flex justify-end gap-2 pt-3 border-t border-[#F1F3F5]">
          <button
            type="button"
            className="py-1.5 px-3.5 bg-white border border-[#E1E4E8] hover:bg-slate-50 text-xs font-semibold text-gray-650 rounded transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="py-1.5 px-4 bg-[#4F46E5] hover:bg-[#4338CA] text-xs font-semibold text-white rounded transition-all shadow-sm disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>

      {/* Security Block Card */}
      <div className="bg-white border border-[#E1E4E8] rounded p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1 max-w-lg">
          <h3 className="font-bold text-xs uppercase tracking-wider text-gray-900 flex items-center gap-1.5">
            <Lock className="h-4 w-4 text-gray-500" />
            Security
          </h3>
          <p className="text-[11px] text-[#5E6269] leading-relaxed">
            Ensure your account is using a long, random password to stay secure against active network scans and corporate audit trials.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowPassModal(true);
            setPassError("");
          }}
          className="py-1.5 px-3 border border-[#E1E4E8] hover:bg-[#F9FAFB] text-xs font-semibold rounded transition text-gray-700 shrink-0"
        >
          Change Password
        </button>
      </div>

      {showPassModal && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded border border-[#E1E4E8] p-5 max-w-xs w-full space-y-3.5 shadow-md my-auto max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-[#F1F3F5]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">Change Password</h3>
              <button onClick={() => setShowPassModal(false)} className="text-gray-400 hover:text-gray-600 font-bold">×</button>
            </div>
            <form onSubmit={handlePassSubmit} className="space-y-3">
              {passError && <p className="text-xs text-[#BA1A1A] bg-rose-50 p-2 border border-rose-100 rounded">{passError}</p>}
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-500 uppercase block">CURRENT PASSWORD</label>
                <input
                  type="password"
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  className="w-full py-1.5 px-2 border border-[#E1E4E8] text-xs rounded focus:outline-none focus:border-[#4F46E5]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-500 uppercase block">NEW PASSWORD</label>
                <input
                  type="password"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className="w-full py-1.5 px-2 border border-[#E1E4E8] text-xs rounded focus:outline-none focus:border-[#4F46E5]"
                />
              </div>
              <div className="flex justify-end gap-1.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPassModal(false)}
                  className="py-1 px-2.5 text-xs font-semibold text-gray-600 border border-[#E1E4E8] rounded hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-1 px-2.5 text-xs font-semibold text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded shadow-sm"
                >
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
