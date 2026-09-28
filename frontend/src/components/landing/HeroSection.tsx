import React from 'react';
import { motion } from 'framer-motion';
import { Phone, Play, ArrowRight } from 'lucide-react';
import { HeroMapBackground } from './HeroMapBackground';

interface HeroSectionProps {
  onLaunchCrm: () => void;
  onScrollToSection: (sectionId: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onLaunchCrm, onScrollToSection }) => {
  return (
    <section id="hero" className="relative pt-32 pb-12 sm:pt-36 sm:pb-16 overflow-hidden min-h-[100dvh] flex flex-col justify-between">
      {/* Full-bleed authentic ESRI Google Maps cartographic background */}
      <HeroMapBackground />

      {/* Main Hero Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Floating Lead Cards & Central Content Wrapper */}
        <div className="relative w-full flex justify-center">

          {/* FLOATING LEAD CARDS (Positioned far out on the flanks with guaranteed zero overlap) */}
          
          {/* Card 1: Top Left */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0, y: [0, -6, 0] }}
            transition={{
              opacity: { duration: 0.5, delay: 0.2 },
              y: { repeat: Infinity, duration: 4.5, ease: 'easeInOut' },
            }}
            className="hidden xl:flex absolute top-2 left-0 2xl:left-6 items-center gap-3 p-3 bg-white/95 backdrop-blur-md border border-gray-200/90 rounded-2xl shadow-lg hover:shadow-xl transition-all pointer-events-auto z-20 text-left w-52 2xl:w-60"
          >
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-xs shrink-0">
              SD
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-gray-900 truncate">Sarah D.</span>
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              </div>
              <div className="text-[11px] text-gray-500 truncate">Dentist &amp; Orthodontics</div>
              <div className="text-[10px] text-blue-600 font-medium mt-0.5">Review complaints</div>
            </div>
            <Phone size={12} className="text-gray-400 shrink-0" />
          </motion.div>

          {/* Card 2: Bottom Left (Over 170px vertical space below Card 1) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0, y: [0, -8, 0] }}
            transition={{
              opacity: { duration: 0.5, delay: 0.4 },
              y: { repeat: Infinity, duration: 5, ease: 'easeInOut', delay: 1 },
            }}
            className="hidden xl:flex absolute top-[230px] left-0 2xl:left-6 items-center gap-3 p-3 bg-white/95 backdrop-blur-md border border-gray-200/90 rounded-2xl shadow-lg hover:shadow-xl transition-all pointer-events-auto z-20 text-left w-52 2xl:w-60"
          >
            <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-xs shrink-0">
              EW
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-gray-900 truncate">Emma W.</span>
                <span className="w-2 h-2 rounded-full bg-blue-600" />
              </div>
              <div className="text-[11px] text-gray-500 truncate">Chiropractor Clinic</div>
              <div className="text-[10px] text-indigo-600 font-medium mt-0.5">Verified email ready</div>
            </div>
            <Phone size={12} className="text-gray-400 shrink-0" />
          </motion.div>

          {/* Center Column: Typography & CTAs (Strictly constrained to prevent collision with side cards) */}
          <div className="w-full max-w-lg lg:max-w-xl 2xl:max-w-2xl flex flex-col items-center text-center px-2">
            {/* Top Trust Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/90 backdrop-blur-md border border-gray-200 rounded-full shadow-sm text-xs font-medium text-gray-700 mb-5"
            >
              <span className="text-gray-900 font-semibold">Trusted by 500+ agencies worldwide</span>
              <div className="flex items-center text-amber-500">
                {'★★★★★'.split('').map((star, i) => (
                  <span key={i} className="text-xs leading-none">★</span>
                ))}
              </div>
            </motion.div>

            {/* Centered H1 Headline with Blue Accent */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-950 tracking-tight leading-[1.15] max-w-[18ch]"
            >
              Extract Google Maps Leads and Close Them with{' '}
              <span className="relative inline-block text-blue-600">
                AI Outreach
                <svg
                  className="absolute left-0 -bottom-1 w-full h-2 text-blue-400 opacity-70"
                  viewBox="0 0 100 10"
                  preserveAspectRatio="none"
                >
                  <path d="M0 5 Q 50 10, 100 5" stroke="currentColor" strokeWidth="3" fill="none" />
                </svg>
              </span>
            </motion.h1>

            {/* Centered Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-5 text-sm sm:text-base text-gray-600 leading-relaxed max-w-[48ch]"
            >
              Scan Google Maps, detect website issues, analyze review complaints, uncover contact
              emails, and let AI start and manage conversations until the deal is closed.
            </motion.p>

            {/* CTA Buttons in Blue Theme */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-7 flex flex-wrap items-center justify-center gap-3.5"
            >
              <button
                onClick={onLaunchCrm}
                className="inline-flex items-center gap-2 px-7 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-full shadow-lg shadow-blue-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Find Leads &amp; Start Outreach</span>
                <ArrowRight size={15} />
              </button>

              <button
                onClick={() => onScrollToSection('simulator')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/90 hover:bg-white text-gray-800 border border-gray-200 text-sm font-semibold rounded-full shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Play size={13} className="fill-gray-800" />
                <span>Watch demo</span>
              </button>
            </motion.div>

            {/* Subtle subtext */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-3 text-xs text-gray-500 font-medium"
            >
              Cancel anytime · No lock-in · 100% Client-Side ($0 Google API bills)
            </motion.div>
          </div>

          {/* Card 3: Top Right */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0, y: [0, -7, 0] }}
            transition={{
              opacity: { duration: 0.5, delay: 0.3 },
              y: { repeat: Infinity, duration: 4.8, ease: 'easeInOut', delay: 0.5 },
            }}
            className="hidden xl:flex absolute top-2 right-0 2xl:right-6 items-center gap-3 p-3 bg-white/95 backdrop-blur-md border border-gray-200/90 rounded-2xl shadow-lg hover:shadow-xl transition-all pointer-events-auto z-20 text-left w-52 2xl:w-60"
          >
            <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center font-bold text-amber-700 text-xs shrink-0">
              MR
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-gray-900 truncate">Mike R.</span>
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              </div>
              <div className="text-[11px] text-gray-500 truncate">Roofing Contractor</div>
              <div className="text-[10px] text-amber-600 font-medium mt-0.5">No website (+45 pts)</div>
            </div>
            <Phone size={12} className="text-gray-400 shrink-0" />
          </motion.div>

          {/* Card 4: Bottom Right (Over 170px vertical space below Card 3) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0, y: [0, -9, 0] }}
            transition={{
              opacity: { duration: 0.5, delay: 0.5 },
              y: { repeat: Infinity, duration: 5.2, ease: 'easeInOut', delay: 1.5 },
            }}
            className="hidden xl:flex absolute top-[230px] right-0 2xl:right-6 items-center gap-3 p-3 bg-white/95 backdrop-blur-md border border-gray-200/90 rounded-2xl shadow-lg hover:shadow-xl transition-all pointer-events-auto z-20 text-left w-52 2xl:w-60"
          >
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-xs shrink-0">
              DL
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-gray-900 truncate">David L.</span>
                <span className="w-2 h-2 rounded-full bg-blue-600" />
              </div>
              <div className="text-[11px] text-gray-500 truncate">Commercial Plumber</div>
              <div className="text-[10px] text-blue-600 font-medium mt-0.5">Website issues · Score 95</div>
            </div>
            <Phone size={12} className="text-gray-400 shrink-0" />
          </motion.div>

        </div>
      </div>

      {/* BOTTOM LEADS CRM DASHBOARD PREVIEW CARD */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4 }}
        className="relative z-20 max-w-6xl mx-auto px-4 w-full mt-14"
      >
        {/* Soft Ambient Glow Aura in Blue Theme */}
        <div className="absolute -inset-2 bg-gradient-to-r from-blue-600/10 via-indigo-600/15 to-blue-600/10 rounded-3xl blur-2xl pointer-events-none" />

        <div className="relative bg-white/95 backdrop-blur-xl border border-gray-200/90 rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8">
          {/* Dashboard Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-100 gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="font-bold text-lg text-gray-950">Leads CRM</span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
                  LIVE INGESTION
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Browse, score, and dispatch automated outreach to your extracted Google Maps leads
              </p>
            </div>

            <button
              onClick={onLaunchCrm}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
            >
              <span>Open Full CRM Workspace</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {/* 5 Stats Cards Row */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6">
            <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl flex flex-col">
              <span className="text-xs text-gray-500 font-medium">New Leads</span>
              <span className="text-2xl font-bold text-gray-950 mt-1">244</span>
              <span className="text-[10px] text-blue-600 mt-0.5 font-medium">+18 this session</span>
            </div>

            <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl flex flex-col">
              <span className="text-xs text-gray-500 font-medium">Contacted</span>
              <span className="text-2xl font-bold text-gray-950 mt-1">19</span>
              <span className="text-[10px] text-blue-600 mt-0.5 font-medium">SMS carrier queue</span>
            </div>

            <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl flex flex-col">
              <span className="text-xs text-gray-500 font-medium">In Negotiation</span>
              <span className="text-2xl font-bold text-gray-950 mt-1">6</span>
              <span className="text-[10px] text-amber-600 mt-0.5 font-medium">Proposal review</span>
            </div>

            <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl flex flex-col">
              <span className="text-xs text-gray-500 font-medium">No Website</span>
              <span className="text-2xl font-bold text-gray-950 mt-1">82</span>
              <span className="text-[10px] text-blue-600 mt-0.5 font-medium">Prime targets</span>
            </div>

            <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl flex flex-col col-span-2 sm:col-span-1">
              <span className="text-xs text-gray-500 font-medium">High Score (≥70)</span>
              <span className="text-2xl font-bold text-gray-950 mt-1">58</span>
              <span className="text-[10px] text-indigo-600 mt-0.5 font-medium">Avg score 88.4</span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};
