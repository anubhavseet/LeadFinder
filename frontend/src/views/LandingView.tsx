import React from 'react';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { HeroSection } from '../components/landing/HeroSection';
import { MetricsRibbon } from '../components/landing/MetricsRibbon';
import { InteractiveExtractorPlayground } from '../components/landing/InteractiveExtractorPlayground';
import { BentoFeatures } from '../components/landing/BentoFeatures';
import { WorkflowSection } from '../components/landing/WorkflowSection';
import { RoiCalculator } from '../components/landing/RoiCalculator';
import { LandingFooter } from '../components/landing/LandingFooter';

interface LandingViewProps {
  onLaunchCrm: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onLaunchCrm }) => {
  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-[100dvh] bg-page text-ink font-sans antialiased selection:bg-blue-600 selection:text-white">
      <LandingNavbar onLaunchCrm={onLaunchCrm} onScrollToSection={scrollToSection} />

      <main>
        <HeroSection onLaunchCrm={onLaunchCrm} onScrollToSection={scrollToSection} />
        <MetricsRibbon />
        <InteractiveExtractorPlayground onLaunchCrm={onLaunchCrm} />
        <BentoFeatures />
        <WorkflowSection onLaunchCrm={onLaunchCrm} />
        <RoiCalculator onLaunchCrm={onLaunchCrm} />
      </main>

      <LandingFooter onLaunchCrm={onLaunchCrm} onScrollToSection={scrollToSection} />
    </div>
  );
};
