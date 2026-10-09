import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, X, Database, Lock, EyeOff, FileText, CheckCircle2 } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

export const PrivacyModal: React.FC = () => {
  const { showPrivacyModal, setShowPrivacyModal, themePalette } = useApp();

  if (!showPrivacyModal) return null;

  const handleClose = () => {
    triggerHaptic('light');
    setShowPrivacyModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-3xl ios-card p-6 border border-white/20 shadow-2xl relative flex flex-col max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/5">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
              style={{ background: themePalette.gradient }}
            >
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                Charte de Confidentialité
              </h3>
              <p className="text-[10px] text-neutral-400">RIZZ AI — Architecture Sécurisée</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        {/* Content list */}
        <div className="space-y-4 py-4 text-xs text-neutral-600 dark:text-neutral-300">
          <div className="flex items-start gap-3">
            <Database className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-neutral-900 dark:text-white">Stockage 100% Local</div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                Vos captures d’écran, messages et historiques sont enregistrés exclusivement dans la mémoire locale de votre appareil.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <EyeOff className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-neutral-900 dark:text-white">Zéro Publicité ni Vente</div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                Aucun pistage, aucun tracker commercial ni revente de vos données personnelles à des tiers.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-neutral-900 dark:text-white">Clé IA Sécurisée côté Serveur</div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                Les requêtes transitent par un proxy Express sécurisé : votre clé API et vos identifiants ne sont jamais exposés dans le navigateur client.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-neutral-900 dark:text-white">Éthique & Respect du Consentement</div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                Si un échange indique un refus clair (« Non », « Laisse-moi »), RIZZ AI privilégie une sortie élégante et refuse toute stratégie de manipulation.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2">
          <button
            onClick={handleClose}
            className="w-full py-3 px-4 rounded-2xl font-bold text-white shadow-sm active:scale-[0.98] transition-all"
            style={{ background: themePalette.gradient }}
          >
            J'ai compris
          </button>
        </div>
      </div>
    </div>
  );
};
