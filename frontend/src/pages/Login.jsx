import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import {
  Building2,
  Lock,
  Mail,
  RefreshCw,
  Key,
  ShieldCheck,
} from "lucide-react";

export default function Login() {
  const { login, error: authError } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please provide your corporate email and password.");
      return;
    }

    try {
      setError(null);
      setLoading(true);

      await login(email, password);
    } catch (err) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  // Quick login helper
  const handleQuickLogin = (roleEmail, rolePass) => {
    setEmail(roleEmail);
    setPassword(rolePass);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans antialiased text-slate-100 relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-15%] w-[550px] h-[550px] bg-blue-600/15 rounded-full blur-[130px]"></div>

        <div className="absolute bottom-[-10%] right-[-15%] w-[650px] h-[650px] bg-emerald-600/10 rounded-full blur-[160px]"></div>
      </div>

      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex flex-col items-center">
          <div className="bg-blue-600/20 text-blue-300 border border-blue-500/30 p-3 rounded-2xl shadow-[0_0_20px_rgba(37,99,235,0.25)] mb-4 flex items-center justify-center animate-pulse">
            <Building2 className="w-8 h-8" />
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-white drop-shadow-md">
            DAB Enterprise Ltd
          </h1>

          <p className="mt-2 text-xs font-bold tracking-widest text-[#a5b4fc] uppercase">
            Business Management System
          </p>
        </div>
      </div>

      {/* Login Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/5 backdrop-blur-xl py-8 px-6 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.37)] rounded-2xl space-y-6 sm:px-10">
          
          <h2 className="text-lg font-bold text-white tracking-wide leading-tight border-b border-white/5 pb-2">
            Corporate Sign-In
          </h2>

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            
            {/* Error Box */}
            {(error || authError) && (
              <div className="bg-red-500/10 border border-red-500/35 text-red-300 p-3.5 rounded-xl text-xs font-bold leading-normal">
                {error || authError}
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs font-bold uppercase tracking-wider text-slate-300"
              >
                Email Address
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@dab.com"
                  className="block w-full pl-10 pr-3 py-2.5 border border-white/10 rounded-xl text-sm font-medium bg-white/5 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white/10 focus:ring-1 focus:ring-blue-500 transition"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-bold uppercase tracking-wider text-slate-300"
              >
                Password
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>

                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-2.5 border border-white/10 rounded-xl text-sm font-medium bg-white/5 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white/10 focus:ring-1 focus:ring-blue-500 transition"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-2.5 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold text-sm tracking-wide rounded-xl shadow-[0_4px_20px_rgba(37,99,235,0.25)] hover:shadow-[0_4px_24px_rgba(37,99,235,0.4)] transition cursor-pointer disabled:opacity-50"
            >
              {loading && (
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              )}

              {loading ? "Authenticating..." : "Sign In"}
            </button>
          </form>

          {/* Quick Login */}
          <div className="pt-6 border-t border-white/5">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-3 font-bold uppercase tracking-wide">
              <Key className="w-3.5 h-3.5 text-blue-400" />
              <span>Reviewer Fast Access Credentials</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              
              {/* Admin */}
              <button
                type="button"
                onClick={() =>
                  handleQuickLogin("admin@dab.com", "admin123")
                }
                className="p-3 border border-white/10 bg-white/5 hover:bg-white/15 hover:border-red-500/20 rounded-xl text-left transition select-none group cursor-pointer"
              >
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-red-300 group-hover:text-red-200">
                  <ShieldCheck className="w-3 h-3 text-red-400" />
                  <span>Admin Panel</span>
                </div>

                <p className="text-xs font-mono font-bold mt-1 text-white">
                  admin@dab.com
                </p>

                <p className="text-[10px] text-slate-400 font-medium group-hover:text-slate-300">
                  pass: admin123
                </p>
              </button>

              {/* Manager */}
              <button
                type="button"
                onClick={() =>
                  handleQuickLogin("manager@dab.com", "manager123")
                }
                className="p-3 border border-white/10 bg-white/5 hover:bg-white/15 hover:border-blue-500/20 rounded-xl text-left transition select-none group cursor-pointer"
              >
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-300 group-hover:text-blue-200">
                  <ShieldCheck className="w-3 h-3 text-blue-400" />
                  <span>Manager View</span>
                </div>

                <p className="text-xs font-mono font-bold mt-1 text-white">
                  manager@dab.com
                </p>

                <p className="text-[10px] text-slate-400 font-medium group-hover:text-slate-300">
                  pass: manager123
                </p>
              </button>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}