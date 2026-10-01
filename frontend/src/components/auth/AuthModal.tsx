import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Eye, EyeOff, Sparkles, CheckCircle2, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, authModalTab, openAuthModal, login, register } = useAuth();

  const [tab, setTab] = useState<'login' | 'register'>(authModalTab);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sync tab with external caller trigger
  React.useEffect(() => {
    if (isAuthModalOpen) {
      setTab(authModalTab);
      setError(null);
      setSuccessMsg(null);
    }
  }, [isAuthModalOpen, authModalTab]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      if (tab === 'login') {
        await login({ email, password });
      } else {
        if (!name.trim()) {
          throw new Error('Please enter your full name');
        }
        await register({ name, email, password });
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await login({
        email: 'demo@leadfinder.io',
        password: 'password123',
      });
    } catch (err: any) {
      // If demo user wasn't registered yet in this DB, try registering it
      try {
        await register({
          name: 'Demo Founder',
          email: 'demo@leadfinder.io',
          password: 'password123',
        });
      } catch (innerErr: any) {
        setError(innerErr?.message || 'Could not log in with demo account');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeAuthModal}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-10"
        >
          {/* Top Brand Banner */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 px-6 pt-7 pb-6 text-white relative">
            <button
              onClick={closeAuthModal}
              className="absolute top-4 right-4 p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-white text-sm">
                LF
              </div>
              <span className="font-semibold text-lg tracking-tight">LeadFinder Account</span>
            </div>
            <p className="text-blue-100 text-xs leading-relaxed max-w-xs">
              {tab === 'login'
                ? 'Sign in to access your synced Google Maps leads, custom pitch templates, and API keys.'
                : 'Create your account to sync leads across devices and automate freelancing outreach.'}
            </p>
          </div>

          <div className="p-6">
            {/* Tab Switcher */}
            <div className="flex bg-gray-100 p-1 rounded-xl mb-6 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setTab('login');
                  setError(null);
                }}
                className={`flex-1 py-2 text-center rounded-lg transition-all ${
                  tab === 'login'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab('register');
                  setError(null);
                }}
                className={`flex-1 py-2 text-center rounded-lg transition-all ${
                  tab === 'register'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Error Notification */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-2.5 text-xs">
                <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Success Notification */}
            {successMsg && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl flex items-start gap-2.5 text-xs">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-500" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Main Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {tab === 'register' && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Full Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-gray-700">Password</label>
                  {tab === 'login' && (
                    <span className="text-[11px] text-blue-600 hover:text-blue-700 cursor-pointer">
                      Forgot?
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {tab === 'register' && (
                  <p className="text-[11px] text-gray-500 mt-1">Must be at least 6 characters</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-500/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    <span>{tab === 'login' ? 'Sign In to Dashboard' : 'Create Free Account'}</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Login Option */}
            <div className="mt-5 pt-5 border-t border-gray-100 text-center">
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={isLoading}
                className="w-full py-2 px-3 border border-dashed border-blue-300 bg-blue-50/60 hover:bg-blue-50 text-blue-700 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors group"
              >
                <Sparkles size={14} className="text-blue-500 group-hover:rotate-12 transition-transform" />
                <span>Test Drive with Demo Account (1-Click)</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
