import React from 'react';
import { ArrowRight } from 'lucide-react';

interface LandingFooterProps {
  onLaunchCrm: () => void;
  onScrollToSection: (sectionId: string) => void;
}

export const LandingFooter: React.FC<LandingFooterProps> = ({ onLaunchCrm, onScrollToSection }) => {
  return (
    <footer className="bg-white border-t border-gray-200 py-16 text-gray-600 text-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col gap-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="flex flex-col gap-3 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded bg-blue-600 flex items-center justify-center font-bold text-white text-xs">
                LF
              </div>
              <span className="font-semibold text-base text-gray-950">LeadFinder</span>
            </div>
            <p className="text-gray-500 text-xs max-w-sm leading-relaxed">
              Google Maps extraction, opportunity gap scoring, and automated outreach pipeline
              built for freelance web designers and local agencies.
            </p>
            <div className="flex items-center gap-2 pt-1 text-gray-500 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Core systems operational · NestJS backend</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-2.5">
            <span className="font-medium text-gray-900 text-xs">
              Navigation
            </span>
            <button
              onClick={() => onScrollToSection('hero')}
              className="text-left text-gray-500 hover:text-gray-900 transition-colors"
            >
              Overview
            </button>
            <button
              onClick={() => onScrollToSection('simulator')}
              className="text-left text-gray-500 hover:text-gray-900 transition-colors"
            >
              Live simulator
            </button>
            <button
              onClick={() => onScrollToSection('features')}
              className="text-left text-gray-500 hover:text-gray-900 transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => onScrollToSection('pipeline')}
              className="text-left text-gray-500 hover:text-gray-900 transition-colors"
            >
              Pipeline
            </button>
            <button
              onClick={() => onScrollToSection('calculator')}
              className="text-left text-gray-500 hover:text-gray-900 transition-colors"
            >
              ROI calculator
            </button>
          </div>

          {/* App Actions */}
          <div className="flex flex-col gap-2.5">
            <span className="font-medium text-gray-900 text-xs">
              Workspace
            </span>
            <button
              onClick={onLaunchCrm}
              className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-medium text-left"
            >
              <span>Open CRM dashboard</span>
              <ArrowRight size={13} />
            </button>
            <span className="text-[11px] text-gray-400">
              Direct access via <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-700">#crm</code> in URL
            </span>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-100 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-gray-400 text-xs">
          <span>© {new Date().getFullYear()} LeadFinder. All rights reserved.</span>
          <div className="flex items-center gap-4 text-gray-500">
            <span>Client-side extraction</span>
            <span>·</span>
            <span>OSINT email discovery</span>
            <span>·</span>
            <span>Carrier SMS dispatch</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
