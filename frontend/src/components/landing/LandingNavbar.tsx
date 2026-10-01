import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, LogIn, UserPlus, Bookmark } from 'lucide-react';
import { BookmarkletModal } from '../bookmarklet/BookmarkletModal';

interface LandingNavbarProps {
  onLaunchCrm: () => void;
  onScrollToSection: (sectionId: string) => void;
}

export const LandingNavbar: React.FC<LandingNavbarProps> = ({ onLaunchCrm, onScrollToSection }) => {
  const [scrolled, setScrolled] = useState<boolean>(false);
  const { user, isAuthenticated, openAuthModal, openProfileModal } = useAuth();
  const [isBookmarkletOpen, setIsBookmarkletOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getInitials = (nameStr: string) => {
    return nameStr
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-xl border-b border-gray-200 py-3 shadow-sm'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand */}
          <div
            onClick={() => onScrollToSection('hero')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-sm">
              LF
            </div>
            <span className="font-semibold text-base text-ink tracking-tight">
              LeadFinder
            </span>
          </div>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-1 text-sm text-muted">
            <button
              onClick={() => onScrollToSection('hero')}
              className="hover:text-ink px-3 py-1.5 rounded-lg transition-colors"
            >
              Overview
            </button>
            <button
              onClick={() => onScrollToSection('simulator')}
              className="hover:text-ink px-3 py-1.5 rounded-lg transition-colors"
            >
              Simulator
            </button>
            <button
              onClick={() => onScrollToSection('features')}
              className="hover:text-ink px-3 py-1.5 rounded-lg transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => onScrollToSection('pipeline')}
              className="hover:text-ink px-3 py-1.5 rounded-lg transition-colors"
            >
              How it works
            </button>
            <button
              onClick={() => onScrollToSection('calculator')}
              className="hover:text-ink px-3 py-1.5 rounded-lg transition-colors"
            >
              Calculator
            </button>
          </nav>

          {/* Auth & CTA group */}
          <div className="flex items-center gap-2.5">
            {isAuthenticated && user ? (
              <button
                onClick={openProfileModal}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200/80 text-gray-800 text-xs font-semibold transition-colors border border-gray-200"
                title="Account Settings"
              >
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                  {getInitials(user.name)}
                </div>
                <span className="max-w-[100px] truncate">{user.name}</span>
              </button>
            ) : (
              <div className="hidden sm:flex items-center gap-1.5">
                <button
                  onClick={() => openAuthModal('login')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <LogIn size={13} />
                  <span>Sign in</span>
                </button>
                <button
                  onClick={() => openAuthModal('register')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/80 rounded-lg transition-colors"
                >
                  <UserPlus size={13} />
                  <span>Create account</span>
                </button>
              </div>
            )}

            <button
              onClick={() => setIsBookmarkletOpen(true)}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100/80 text-blue-700 text-xs font-semibold rounded-lg transition-colors border border-blue-200/60"
            >
              <Bookmark size={13} className="text-blue-600 fill-blue-600/20" />
              <span>Get Extractor (Free)</span>
            </button>

            <button
              onClick={onLaunchCrm}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors active:scale-[0.98] shadow-sm"
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>

      <BookmarkletModal
        isOpen={isBookmarkletOpen}
        onClose={() => setIsBookmarkletOpen(false)}
      />
    </header>
  );
};
