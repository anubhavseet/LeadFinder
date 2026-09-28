import React, { useState, useEffect } from 'react';

interface LandingNavbarProps {
  onLaunchCrm: () => void;
  onScrollToSection: (sectionId: string) => void;
}

export const LandingNavbar: React.FC<LandingNavbarProps> = ({ onLaunchCrm, onScrollToSection }) => {
  const [scrolled, setScrolled] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

          {/* CTA */}
          <button
            onClick={onLaunchCrm}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors active:scale-[0.98]"
          >
            Open dashboard
          </button>
        </div>
      </div>
    </header>
  );
};
