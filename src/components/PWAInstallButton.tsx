import React, { useState } from 'react';
import { usePWAInstall } from '../utils/usePWAInstall';
import { Download, Share2, PlusSquare, X } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

export const PWAInstallButton: React.FC<{ variant?: 'header' | 'banner' | 'card' }> = ({ variant = 'banner' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // Masquer si déjà installé en PWA autonome
  if (isInstalled) {
    return null;
  }

  // Ne rien afficher si ni installable ni iOS
  if (!isInstallable && !isIOS) {
    return null;
  }

  const handleInstallClick = async () => {
    triggerHaptic('medium');
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  if (variant === 'header') {
    return (
      <>
        <button
          onClick={handleInstallClick}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-600 text-white shadow-xs hover:bg-blue-700 active:scale-95 transition-all"
          title="Installer l'application RIZZ AI"
        >
          <Download className="w-3 h-3 stroke-[2.5]" />
          <span>Installer</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-neutral-900 p-6 shadow-2xl border border-black/10 dark:border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  Installer RIZZ AI sur iPhone
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-full text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-neutral-600 dark:text-neutral-300">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800">
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 shrink-0">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-neutral-900 dark:text-white">1. Appuie sur Partager</span>
                    <p className="text-[11px] text-neutral-500 mt-0.5">Dans la barre de navigation Safari en bas de l'écran.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800">
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 shrink-0">
                    <PlusSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-neutral-900 dark:text-white">2. « Sur l'écran d'accueil »</span>
                    <p className="text-[11px] text-neutral-500 mt-0.5">Fais défiler et sélectionne "Sur l'écran d'accueil".</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 rounded-xl bg-neutral-200 dark:bg-neutral-800 text-xs font-bold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-300 transition-colors"
              >
                Compris
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <div className="ios-card p-3 rounded-2xl border border-blue-500/20 bg-blue-500/5 flex items-center justify-between gap-3 animate-in fade-in">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Download className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-neutral-900 dark:text-white">
              Installer RIZZ AI
            </div>
            <div className="text-[10px] text-neutral-500 dark:text-neutral-400">
              Accès instantané & 100% autonome hors ligne
            </div>
          </div>
        </div>

        <button
          onClick={handleInstallClick}
          className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-xs hover:bg-blue-700 active:scale-95 transition-all shrink-0"
        >
          {isIOS ? 'Instructions' : 'Installer'}
        </button>
      </div>

      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-neutral-900 p-6 shadow-2xl border border-black/10 dark:border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                Installer RIZZ AI sur iPhone
              </h3>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-neutral-600 dark:text-neutral-300">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 shrink-0">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-neutral-900 dark:text-white">1. Appuie sur Partager</span>
                  <p className="text-[11px] text-neutral-500 mt-0.5">Dans la barre de navigation Safari en bas de l'écran.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 shrink-0">
                  <PlusSquare className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-neutral-900 dark:text-white">2. « Sur l'écran d'accueil »</span>
                  <p className="text-[11px] text-neutral-500 mt-0.5">Fais défiler et sélectionne "Sur l'écran d'accueil".</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 rounded-xl bg-neutral-200 dark:bg-neutral-800 text-xs font-bold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-300 transition-colors"
            >
              Compris
            </button>
          </div>
        </div>
      )}
    </>
  );
};
