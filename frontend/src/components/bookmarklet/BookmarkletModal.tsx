import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Bookmark,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  HelpCircle,
  Download,
  ShieldCheck,
  ChevronRight,
  Globe,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface BookmarkletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BookmarkletModal: React.FC<BookmarkletModalProps> = ({ isOpen, onClose }) => {
  const { token, user } = useAuth();
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState<'bookmarklet' | 'extension'>('bookmarklet');

  if (!isOpen) return null;

  // The bookmarklet loader script that injects the hosted script with active token and user session
  const userJson = user ? JSON.stringify({ id: user.id, name: user.name, email: user.email, role: user.role }) : null;
  const bookmarkletCode = token
    ? `javascript:(function(){window.__LF_TOKEN='${token}';${userJson ? `window.__LF_USER=${userJson};` : ''}const s=document.createElement('script');s.src='http://localhost:5173/leadfinder-bookmarklet.js?v='+Date.now();document.body.appendChild(s);})();`
    : `javascript:(function(){const s=document.createElement('script');s.src='http://localhost:5173/leadfinder-bookmarklet.js?v='+Date.now();document.body.appendChild(s);})();`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(bookmarkletCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-10 max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 px-6 py-5 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-white text-sm">
                LF
              </div>
              <div>
                <h3 className="font-semibold text-base tracking-tight">Extract Leads Without Store Fees</h3>
                <p className="text-xs text-blue-100">100% Free, zero-cost Google Maps lead extraction</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Tab Selector */}
          <div className="flex border-b border-gray-100 bg-gray-50/80 px-6 pt-3">
            <button
              onClick={() => setActiveTab('bookmarklet')}
              className={`pb-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
                activeTab === 'bookmarklet'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <Bookmark size={14} />
              <span>1-Click Bookmarklet (Recommended)</span>
            </button>
            <button
              onClick={() => setActiveTab('extension')}
              className={`pb-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
                activeTab === 'extension'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <Download size={14} />
              <span>Direct Extension (.ZIP)</span>
            </button>
          </div>

          <div className="p-6 overflow-y-auto space-y-6">
            {activeTab === 'bookmarklet' ? (
              <>
                {/* Highlight banner */}
                <div className="p-3.5 bg-blue-50 border border-blue-200/80 rounded-xl flex items-start gap-3">
                  <Sparkles size={18} className="text-blue-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-900 leading-relaxed">
                    <span className="font-semibold">Zero install required:</span> A bookmarklet runs directly in your browser. It uses your authentic Google session and IP, so Google will never block you.
                  </div>
                </div>

                {/* The Draggable Button */}
                <div className="text-center py-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="text-xs font-medium text-gray-600 mb-2.5">
                    Drag this button to your browser's Bookmarks Bar:
                  </div>

                  <a
                    href={bookmarkletCode}
                    onClick={(e) => {
                      // Prevent navigation if clicked directly on this page
                      e.preventDefault();
                      alert("Don't click here! Drag this button into your browser Bookmarks Bar, or copy the code below.");
                    }}
                    className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 cursor-grab active:cursor-grabbing hover:scale-105 transition-all select-none border border-blue-400/30"
                  >
                    <Bookmark size={16} />
                    <span>📍 LeadFinder Extractor</span>
                  </a>

                  <p className="text-[11px] text-gray-400 mt-2">
                    (Press <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded font-mono text-[10px] text-gray-700">Ctrl + Shift + B</kbd> or <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded font-mono text-[10px] text-gray-700">⌘ + Shift + B</kbd> if bookmarks bar is hidden)
                  </p>
                </div>

                {/* 3 Step Walkthrough */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">How to use it:</h4>

                  <div className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-xl">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                      1
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-900">Drag to Bookmarks Bar</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        Click & drag the blue <strong>📍 LeadFinder Extractor</strong> button into your browser bookmarks bar.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-xl">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                      2
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-900">Open Google Maps & Search</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        Go to Google Maps and type what you want to extract (e.g. <em>"Plumbers in Dallas"</em>).
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-xl">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                      3
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-900">Click Bookmark & Start Scraping</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        Click the bookmark in your bar. The LeadFinder HUD will appear on Google Maps. Hit <strong>"Start Scraping"</strong> and watch leads sync to your CRM!
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fallback Manual Copy */}
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-600 font-medium">Can't drag? Copy Bookmarklet Code manually:</span>
                    <button
                      onClick={handleCopyCode}
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      {copiedCode ? (
                        <>
                          <Check size={13} className="text-emerald-500" />
                          <span className="text-emerald-600">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={13} />
                          <span>Copy Code</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="p-2.5 bg-gray-900 text-gray-300 font-mono text-[11px] rounded-lg truncate select-all">
                    {bookmarkletCode}
                  </div>
                </div>

                {/* Test on Maps button */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                    <ShieldCheck size={16} />
                    <span>Safe & Stealth: 100% Client-Side</span>
                  </div>
                  <a
                    href={token ? `https://www.google.com/maps/search/roofers+in+dallas#lf_token=${encodeURIComponent(token)}` : 'https://www.google.com/maps/search/roofers+in+dallas'}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                  >
                    <span>Test on Google Maps</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
              </>
            ) : (
              /* Extension Tab */
              <div className="space-y-4">
                <div className="p-3.5 bg-emerald-50 border border-emerald-200/80 rounded-xl text-xs text-emerald-900 leading-relaxed">
                  <span className="font-semibold">Keep the full Chrome Extension for $0:</span> You do not have to pay the $5 Google Web Store fee. You can install your own extension directly using Chrome's built-in Developer Mode.
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                    <div className="font-semibold text-xs text-gray-900 mb-1">Step 1: Download Extension Folder</div>
                    <p className="text-xs text-gray-600">
                      The extension is located inside this project in the <code className="bg-white px-1.5 py-0.5 border rounded text-[11px]">extension/</code> directory.
                    </p>
                  </div>

                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                    <div className="font-semibold text-xs text-gray-900 mb-1">Step 2: Open Extensions in Chrome</div>
                    <p className="text-xs text-gray-600">
                      Open <code className="bg-white px-1.5 py-0.5 border rounded text-[11px]">chrome://extensions</code> in your Chrome address bar.
                    </p>
                  </div>

                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                    <div className="font-semibold text-xs text-gray-900 mb-1">Step 3: Enable Developer Mode & Load</div>
                    <p className="text-xs text-gray-600">
                      Toggle <strong>"Developer mode"</strong> in the top-right corner. Then click <strong>"Load unpacked"</strong> and select the <code className="bg-white px-1.5 py-0.5 border rounded text-[11px]">extension</code> folder.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-slate-900 text-white rounded-xl text-xs flex items-center justify-between">
                  <span>Folder Path:</span>
                  <code className="text-blue-300 font-mono text-[11px]">/home/anubhav/Public/LeadFinder/extension</code>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
