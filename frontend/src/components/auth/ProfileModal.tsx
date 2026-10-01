import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  Key,
  Copy,
  Check,
  RefreshCw,
  LogOut,
  Shield,
  Calendar,
  Lock,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ProfileModal: React.FC = () => {
  const { user, isProfileModalOpen, closeProfileModal, logout, updateProfile, regenerateApiKey } = useAuth();

  const [copiedKey, setCopiedKey] = useState(false);
  const [isRegeneratingKey, setIsRegeneratingKey] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  React.useEffect(() => {
    if (user) {
      setName(user.name);
    }
  }, [user]);

  if (!isProfileModalOpen || !user) return null;

  const handleCopyKey = () => {
    if (!user.apiKey) return;
    navigator.clipboard.writeText(user.apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleRegenerateKey = async () => {
    if (!window.confirm('Are you sure you want to regenerate your API key? Any Chrome Extension using the old key will need to be reconfigured.')) {
      return;
    }
    setIsRegeneratingKey(true);
    try {
      await regenerateApiKey();
      setStatusMessage({ type: 'success', text: 'New API key generated successfully.' });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Failed to regenerate API key' });
    } finally {
      setIsRegeneratingKey(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setStatusMessage(null);

    try {
      const updateData: any = {};
      if (name.trim() && name !== user.name) {
        updateData.name = name.trim();
      }
      if (newPassword) {
        if (!currentPassword) {
          throw new Error('Please enter your current password to set a new password');
        }
        updateData.currentPassword = currentPassword;
        updateData.newPassword = newPassword;
      }

      if (Object.keys(updateData).length === 0) {
        setStatusMessage({ type: 'error', text: 'No changes detected to update.' });
        setIsUpdating(false);
        return;
      }

      await updateProfile(updateData);
      setCurrentPassword('');
      setNewPassword('');
      setStatusMessage({ type: 'success', text: 'Profile updated successfully.' });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Failed to update profile' });
    } finally {
      setIsUpdating(false);
    }
  };

  const getInitials = (nameStr: string) => {
    return nameStr
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeProfileModal}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-10 max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white text-base shadow-sm">
                {getInitials(user.name || 'User')}
              </div>
              <div>
                <h3 className="font-semibold text-base tracking-tight">{user.name}</h3>
                <p className="text-xs text-slate-400">{user.email}</p>
              </div>
            </div>
            <button
              onClick={closeProfileModal}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-6 overflow-y-auto space-y-6">
            {/* Status alerts */}
            {statusMessage && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 ${
                  statusMessage.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}
              >
                {statusMessage.type === 'success' ? (
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                ) : (
                  <AlertCircle size={16} className="text-red-500 shrink-0" />
                )}
                <span>{statusMessage.text}</span>
              </div>
            )}

            {/* Account Details Pills */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl flex items-center gap-2.5">
                <Shield size={16} className="text-blue-600 shrink-0" />
                <div>
                  <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Role</div>
                  <div className="text-xs font-semibold text-gray-800">{user.role || 'Member'}</div>
                </div>
              </div>
              <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl flex items-center gap-2.5">
                <Calendar size={16} className="text-indigo-600 shrink-0" />
                <div>
                  <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Member Since</div>
                  <div className="text-xs font-semibold text-gray-800">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active'}
                  </div>
                </div>
              </div>
            </div>

            {/* API Key Box for Chrome Extension */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                  <Key size={14} className="text-blue-600" />
                  <span>Chrome Extension API Key</span>
                </div>
                <button
                  type="button"
                  onClick={handleRegenerateKey}
                  disabled={isRegeneratingKey}
                  className="inline-flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-900 transition-colors"
                >
                  <RefreshCw size={11} className={isRegeneratingKey ? 'animate-spin' : ''} />
                  <span>Regenerate</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-1.5 font-mono text-xs text-gray-700 select-all overflow-x-auto truncate">
                  {user.apiKey || 'No key generated'}
                </div>
                <button
                  type="button"
                  onClick={handleCopyKey}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0"
                >
                  {copiedKey ? (
                    <>
                      <Check size={14} />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                Use this API key in the LeadFinder Chrome Extension options to synchronize leads straight to your account.
              </p>
            </div>

            {/* Profile update form */}
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Account Settings</h4>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Display Name</label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100">
                <div className="text-xs font-medium text-gray-700 mb-2">Change Password</div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <Lock size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      placeholder="Current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full pl-8 pr-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="relative">
                    <Lock size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      placeholder="New password (min 6)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-8 pr-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3">
                <button
                  type="button"
                  onClick={logout}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut size={14} />
                  <span>Log out</span>
                </button>

                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isUpdating && <Loader2 size={13} className="animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
