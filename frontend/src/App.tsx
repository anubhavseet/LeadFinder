import React, { useState, useEffect } from 'react';
import { LandingView } from './views/LandingView';
import { DashboardView } from './views/DashboardView';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthModal } from './components/auth/AuthModal';
import { ProfileModal } from './components/auth/ProfileModal';

export const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading, openAuthModal } = useAuth();

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

  // Sync and protect hash changes
  useEffect(() => {
    if (isLoading) return;

    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#crm' || hash === '#dashboard') {
        if (!isAuthenticated) {
          setCurrentView('landing');
          window.location.hash = '';
          openAuthModal('login');
        } else {
          setCurrentView('crm');
        }
      } else if (hash === '#landing' || hash === '' || hash.startsWith('#hero') || hash.startsWith('#features')) {
        if (currentView !== 'landing' && (hash === '#landing' || hash === '')) {
          setCurrentView('landing');
        }
      }
    };

    // Initial check when auth finishes loading
    if (currentView === 'crm' && !isAuthenticated) {
      setCurrentView('landing');
      window.location.hash = '';
      openAuthModal('login');
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentView, isAuthenticated, isLoading, openAuthModal]);

  const handleNavigateToCrm = () => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
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
      <AuthModal />
      <ProfileModal />
    </>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
