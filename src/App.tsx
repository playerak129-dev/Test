/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { BackgroundGlow } from './components/BackgroundGlow';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { Toast } from './components/Toast';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PinLockOverlay } from './components/PinLockOverlay';
import { OnboardingModal } from './components/OnboardingModal';
import { PrivacyModal } from './components/PrivacyModal';

import { HomeScreen } from './screens/HomeScreen';
import { AnalyzeScreen } from './screens/AnalyzeScreen';
import { ResultScreen } from './screens/ResultScreen';
import { AnticipateScreen } from './screens/AnticipateScreen';
import { QuickRizzScreen } from './screens/QuickRizzScreen';
import { StyleScreen } from './screens/StyleScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { AuthScreen } from './screens/AuthScreen';

const MainContent: React.FC = () => {
  const { currentScreen, setCurrentScreen } = useApp();

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen />;
      case 'analyze':
        return <AnalyzeScreen />;
      case 'results':
        return <ResultScreen />;
      case 'anticipate':
        return <AnticipateScreen />;
      case 'quick':
        return <QuickRizzScreen />;
      case 'style':
        return <StyleScreen />;
      case 'history':
        return <HistoryScreen />;
      case 'settings':
        return <SettingsScreen />;
      case 'auth':
        return (
          <AuthScreen
            onSuccess={() => setCurrentScreen('home')}
            onContinueAsGuest={() => setCurrentScreen('home')}
          />
        );
      default:
        return <HomeScreen />;
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between max-w-md mx-auto px-4">
      {/* Top Header */}
      <Header />

      {/* Dynamic Screen View */}
      <main className="flex-1 w-full pt-2">
        {renderScreen()}
      </main>

      {/* iOS 26 Bottom Navigation */}
      <BottomNav />

      {/* Toast Feedback */}
      <Toast />

      {/* Indicateur mode hors ligne & cache local */}
      <OfflineIndicator />

      {/* Modales & Verrouillage (Phase 3) */}
      <PinLockOverlay />
      <OnboardingModal />
      <PrivacyModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <div className="relative min-h-screen w-full font-sans antialiased text-neutral-900 dark:text-neutral-100">
        <BackgroundGlow />
        <MainContent />
      </div>
    </AppProvider>
  );
}
