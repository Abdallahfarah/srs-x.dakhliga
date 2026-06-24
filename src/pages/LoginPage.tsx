import React, { useState } from "react";
import { Mail, Lock, Loader2, ArrowRight, User as UserIcon } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "../contexts/ToastContext";

export function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const fullIdentity = identifier.trim().toLowerCase().includes("@") 
        ? identifier.trim().toLowerCase() 
        : `${identifier.trim().toLowerCase()}@srs.local`;
        
      await login(fullIdentity, password);
      
      // Update local state so browser saves the full email as the username
      setIdentifier(fullIdentity);
      
      showToast("Access granted. Initializing terminal...", "success");
    } catch (err: any) {
      showToast(err.message || "Invalid credentials", "error");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0C0E] flex items-center justify-center p-4 font-sans selection:bg-[#4F46E5]/30">
      <div className="w-full max-w-md animate-fade-in">
        
        {/* Logo Container */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-12 h-12 bg-[#4F46E5] rounded-xl flex items-center justify-center text-white font-heavy text-xl shadow-lg shadow-[#4F46E5]/40 mb-4 transform hover:scale-110 transition-transform duration-300">
            SX
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">SRS X.Dakhliga</h1>
          <p className="text-[#8A8F98] text-xs mt-2 font-medium tracking-wide">ENTERPRISE SAAS TERMINAL</p>
        </div>

        {/* Login Card */}
        <div className="bg-[#16181D] border border-[#1F2124] rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#4F46E5] to-transparent opacity-50"></div>
          
          <div className="mb-8">
            <h2 className="text-white text-lg font-semibold">Staff Identity</h2>
            <p className="text-[#5E6269] text-xs mt-1">Please enter your assigned staff username to access the terminal.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#5E6269] uppercase tracking-wider ml-1">Username</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5E6269] group-focus-within:text-[#4F46E5] transition-colors">
                  <UserIcon className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full bg-[#0B0C0E] border border-[#1F2124] text-white text-[13px] rounded-xl pl-10 pr-4 py-3 outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]/20 transition-all placeholder:text-[#373A40]"
                  placeholder="e.g. ahmed01"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-bold text-[#5E6269] uppercase tracking-wider">Password</label>
                <button type="button" className="text-[10px] font-bold text-[#4F46E5] hover:text-[#4338CA] uppercase tracking-wider transition-colors">Forgot?</button>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5E6269] group-focus-within:text-[#4F46E5] transition-colors">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0B0C0E] border border-[#1F2124] text-white text-[13px] rounded-xl pl-10 pr-4 py-3 outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]/20 transition-all placeholder:text-[#373A40]"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#4F46E5] hover:bg-[#4338CA] disabled:opacity-50 disabled:cursor-not-allowed text-white text-[13px] font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-[#4F46E5]/20 flex items-center justify-center gap-2 group mt-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Sign in to Workspace
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center">
          <p className="text-[#5E6269] text-[10px] tracking-wide font-medium">
            SECURE MULTI-TENANT ENVIRONMENT
          </p>
          <div className="flex items-center justify-center gap-4 mt-3">
            <span className="w-1.5 h-1.5 bg-[#2E7D32] rounded-full"></span>
            <span className="text-[#373A40] text-[9px] font-bold uppercase tracking-widest">System Operational v1.2.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
