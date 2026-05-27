import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import axios from 'axios';
import { Lock, Mail, RefreshCw, AlertCircle } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const res = await axios.post('/api/auth/login', formData);
      
      if (res.data.success) {
        login(res.data.token, res.data.user);
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login window drop out:', err);
      setError(err.response?.data?.message || 'Invalid email credentials or password authentication failure.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12 selection:bg-blue-500/30 text-slate-100">
      {/* Background ambient glow shapes */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-emerald-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl space-y-6 relative z-10">
        
        {/* Header Segment */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">
            Welcome Back
          </h2>
          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
            Access the Cooperative Core Network
          </p>
        </div>

        {/* Error Alert panel */}
        {error && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Interactive Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email input field set */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Corporate Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                name="email"
                required
                disabled={loading}
                placeholder="name@coop-system.com"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full pl-9 pr-3 py-2.5 border border-white/10 rounded-xl text-xs bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:bg-white/10 transition font-medium disabled:opacity-50"
              />
            </div>
          </div>

          {/* Password input field set */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Security Authentication Key
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                name="password"
                required
                disabled={loading}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full pl-9 pr-3 py-2.5 border border-white/10 rounded-xl text-xs bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:bg-white/10 transition font-medium disabled:opacity-50"
              />
            </div>
          </div>

          {/* Action trigger button panel */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:from-blue-600/50 disabled:to-blue-500/50 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition shadow-[0_4px_14px_rgba(37,99,235,0.2)] hover:shadow-[0_4px_20px_rgba(37,99,235,0.4)] cursor-pointer disabled:cursor-not-allowed select-none"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <span>Authenticate Session</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}