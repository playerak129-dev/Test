import React from 'react';
import { useApp, ScreenType } from '../context/AppContext';
import { ChevronLeft, Wifi, WifiOff, Sparkles, SlidersHorizontal, Settings, Lock, User as UserIcon } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';
import { PWAInstallButton } from './PWAInstallButton';

export const Header: React.FC = () => {
  const {
    currentScreen,
    setCurrentScreen,
    isOnline,
    themePalette,
    hasPin,
    currentUser,
    isAuthenticated,
    openAuth,
    showToast,
  } = useApp();

  const getTitle = () => {
    switch (currentScreen) {
      case 'home':
        return 'RIZZ AI';
      case 'analyze':
        return 'Analyser';
      case 'results':
        return 'Réponses IA';
      case 'anticipate':
        return 'Échiquier';
      case 'quick':
        return 'Rizz Rapide';
      case 'style':
        return 'Mixeur de Style';
      case 'history':
        return 'Historique';
      case 'settings':
        return 'Paramètres';
      case 'auth':
        return 'Compte & Session';
      default:
        return 'RIZZ AI';
    }
  };

  const showBackButton = currentScreen !== 'home';

  const handleLockNow = () => {
    triggerHaptic('medium');
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-30 w-full px-4 pt-3 pb-2.5 ios-glass border-b border-black/5 dark:border-white/5 transition-all">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          {showBackButton ? (
            <button
              onClick={() => {
                triggerHaptic('light');
                setCurrentScreen('home');
              }}
              className="p-1.5 -ml-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all text-neutral-700 dark:text-neutral-200"
              aria-label="Retour à l'accueil"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          ) : (
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-sm"
              style={{ background: themePalette.gradient }}
            >
              <Sparkles className="w-4 h-4" />
            </div>
          )}

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white leading-tight">
                {getTitle()}
              </h1>
              {currentScreen === 'home' && (
                <span className="text-[9px] font-black tracking-widest px-1.5 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-neutral-500 uppercase">
                  C4RL3NTZ
                </span>
              )}
            </div>
            {currentScreen === 'home' && (
              <p className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                Ton copilote de conversation
              </p>
            )}
          </div>
        </div>

        {/* Indicateur de connectivité discret & actions rapides */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              triggerHaptic('light');
              showToast(
                isOnline
                  ? 'Connecté au réseau — Modèle neuronal Gemini actif'
                  : 'Mode Hors Ligne — Moteur heuristique autonome actif'
              );
            }}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors ${
              isOnline
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
            }`}
          >
            {isOnline ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>En ligne</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3" />
                <span>Hors ligne</span>
              </>
            )}
          </button>

          {/* Bouton installation PWA */}
          <PWAInstallButton variant="header" />

          {/* Bouton Compte / Connexion */}
          {isAuthenticated ? (
            <button
              onClick={() => {
                triggerHaptic('light');
                setCurrentScreen('settings');
              }}
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-xs"
              style={{ backgroundColor: themePalette.primary }}
              title={`Compte: ${currentUser?.email}`}
            >
              {currentUser?.email?.charAt(0).toUpperCase() || 'U'}
            </button>
          ) : (
            <button
              onClick={() => {
                triggerHaptic('light');
                openAuth();
              }}
              className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-300 transition-colors"
              title="Se connecter"
            >
              <UserIcon className="w-4 h-4" />
            </button>
          )}

          {hasPin && (
            <button
              onClick={handleLockNow}
              className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-300 transition-colors"
              title="Verrouiller l'application"
            >
              <Lock className="w-4 h-4" />
            </button>
          )}

          {currentScreen !== 'settings' && (
            <button
              onClick={() => {
                triggerHaptic('light');
                setCurrentScreen('settings');
              }}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-300 transition-colors"
              aria-label="Ouvrir les paramètres"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

