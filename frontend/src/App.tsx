import React, { useState, useEffect } from 'react';
import { LandingView } from './views/LandingView';
import { DashboardView } from './views/DashboardView';

export const App: React.FC = () => {
  // Read initial view from URL hash or default to 'landing'
  const getInitialView = (): 'landing' | 'crm' => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#crm' || hash === '#dashboard') {
        return 'crm';
      }
    }
    return 'landing';
  };

  const [currentView, setCurrentView] = useState<'landing' | 'crm'>(getInitialView);

  // Sync hash changes (e.g. browser back/forward buttons or direct hash links)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#crm' || hash === '#dashboard') {
        setCurrentView('crm');
      } else if (hash === '#landing' || hash === '' || hash.startsWith('#hero') || hash.startsWith('#features')) {
        // If it's an anchor on the landing page, keep landing view
        if (currentView !== 'landing' && (hash === '#landing' || hash === '')) {
          setCurrentView('landing');
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentView]);

  const handleNavigateToCrm = () => {
    setCurrentView('crm');
    window.location.hash = 'crm';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToLanding = () => {
    setCurrentView('landing');
    window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {currentView === 'landing' ? (
        <LandingView onLaunchCrm={handleNavigateToCrm} />
      ) : (
        <DashboardView onNavigateLanding={handleNavigateToLanding} />
      )}
    </>
  );
};

export default App;
