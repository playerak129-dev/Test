import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Camera, Edit3, Sparkles, ArrowRight, Clock, MessageSquare, Clipboard, GitBranch, Zap, ShieldCheck } from 'lucide-react';
import { getStyleSummaryText } from '../utils/styleBalancing';
import { triggerHaptic } from '../utils/haptics';

export const HomeScreen: React.FC = () => {
  const {
    setCurrentScreen,
    setInputMode,
    setInputText,
    inputText,
    history,
    openHistoryItem,
    themePalette,
    styleWeights,
    intensity,
    showToast,
    openOnboarding,
  } = useApp();

  const [quickPaste, setQuickPaste] = useState('');

  const handleStartCapture = () => {
    triggerHaptic('light');
    setInputMode('screenshot');
    setCurrentScreen('analyze');
  };

  const handleStartText = () => {
    triggerHaptic('light');
    setInputMode('text');
    setCurrentScreen('analyze');
  };

  const handleQuickPasteAndGo = () => {
    if (!quickPaste.trim()) return;
    triggerHaptic('medium');
    setInputMode('text');
    setInputText(quickPaste.trim());
    setCurrentScreen('analyze');
  };

  const handleClipboardPaste = async () => {
    triggerHaptic('light');
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setQuickPaste(text);
          showToast('Texte collé');
        }
      }
    } catch {
      // Permission non accordée ou indisponible
    }
  };

  const recentItems = history.slice(0, 4);

  return (
    <div className="space-y-6 pb-24 pt-2">
      {/* Hero Header */}
      <section className="text-center px-2 pt-4 pb-2">
        <div
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-3 shadow-xs"
          style={{
            backgroundColor: themePalette.lightBg,
            color: themePalette.primary,
          }}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>C4RL3NTZ Engine • Copilote & Échiquier v4.0</span>
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
          RIZZ AI
        </h1>
        <p className="text-base text-neutral-500 dark:text-neutral-400 mt-1.5 font-medium">
          « Ton copilote de conversation. »
        </p>
      </section>

      {/* Action Principale & Méthodes */}
      <section className="space-y-3">
        {/* Bouton Principal Analyser */}
        <button
          onClick={() => setCurrentScreen('analyze')}
          className="w-full py-4 px-6 rounded-2xl font-bold text-white shadow-lg active:scale-[0.98] transition-all flex items-center justify-between group"
          style={{
            background: themePalette.gradient,
            boxShadow: themePalette.glow,
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <div className="text-xs uppercase tracking-wider text-white/80 font-semibold">
                Action Principale
              </div>
              <div className="text-base font-bold">ANALYSER UNE CONVERSATION</div>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Nouveautés Phase 2 : Échiquier & Rizz Rapide */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setCurrentScreen('anticipate')}
            className="ios-card p-3.5 rounded-2xl text-left active:scale-[0.97] transition-all border border-blue-500/20 hover:border-blue-500/40 group"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2 font-bold text-base">
              ♟
            </div>
            <div className="font-extrabold text-xs text-neutral-900 dark:text-white">
              ÉCHIQUIER CONVERSATIONNEL
            </div>
            <div className="text-[10px] text-neutral-500 mt-0.5">
              Anticiper les réactions
            </div>
          </button>

          <button
            onClick={() => setCurrentScreen('quick')}
            className="ios-card p-3.5 rounded-2xl text-left active:scale-[0.97] transition-all border border-amber-500/20 hover:border-amber-500/40 group"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2">
              <Zap className="w-4 h-4" />
            </div>
            <div className="font-extrabold text-xs text-neutral-900 dark:text-white">
              RIZZ RAPIDE
            </div>
            <div className="text-[10px] text-neutral-500 mt-0.5">
              Flux express 1 clic
            </div>
          </button>
        </div>

        {/* Les 2 Méthodes classiques : Capture & Écrire */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleStartCapture}
            className="ios-card p-4 rounded-2xl text-left active:scale-[0.97] transition-all border border-black/5 dark:border-white/5 hover:border-blue-500/30 group"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-105"
              style={{ backgroundColor: themePalette.lightBg, color: themePalette.primary }}
            >
              <Camera className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="font-bold text-sm text-neutral-900 dark:text-white">
              CAPTURE D'ÉCRAN
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Importer depuis galerie
            </div>
          </button>

          <button
            onClick={handleStartText}
            className="ios-card p-4 rounded-2xl text-left active:scale-[0.97] transition-all border border-black/5 dark:border-white/5 hover:border-blue-500/30 group"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-105"
              style={{ backgroundColor: themePalette.lightBg, color: themePalette.primary }}
            >
              <Edit3 className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="font-bold text-sm text-neutral-900 dark:text-white">
              ÉCRIRE LE MESSAGE
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Saisie libre & contexte
            </div>
          </button>
        </div>
      </section>

      {/* Zone de collage direct */}
      <section className="ios-card p-4 rounded-2xl border border-black/5 dark:border-white/5 space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
            <Clipboard className="w-3.5 h-3.5 text-neutral-400" />
            <span>Coller directement du texte</span>
          </label>
          <button
            type="button"
            onClick={handleClipboardPaste}
            className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white underline decoration-dotted"
          >
            Coller depuis le presse-papiers
          </button>
        </div>

        <div className="relative">
          <textarea
            value={quickPaste}
            onChange={(e) => setQuickPaste(e.target.value)}
            placeholder="« Elle m'a envoyé : 'T'es toujours aussi long à répondre ?' »"
            rows={2}
            className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-neutral-100/70 dark:bg-neutral-800/60 border border-transparent focus:border-blue-500/40 focus:bg-white dark:focus:bg-neutral-900 focus:outline-none transition-all resize-none text-neutral-900 dark:text-white placeholder:text-neutral-400"
          />
        </div>

        {quickPaste.trim().length > 0 && (
          <button
            onClick={handleQuickPasteAndGo}
            className="w-full py-2.5 rounded-xl text-xs font-bold text-white active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            style={{ backgroundColor: themePalette.primary }}
          >
            <span>Analyser ce message maintenant</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </section>

      {/* Résumé de configuration active */}
      <section
        onClick={() => setCurrentScreen('style')}
        className="px-4 py-3 rounded-2xl bg-neutral-200/40 dark:bg-neutral-800/30 border border-neutral-300/30 dark:border-neutral-700/30 flex items-center justify-between cursor-pointer active:scale-[0.99] transition-all"
      >
        <div className="text-xs space-y-0.5">
          <div className="text-[10px] uppercase font-bold text-neutral-400 dark:text-neutral-500 tracking-wider">
            Configuration active
          </div>
          <div className="font-semibold text-neutral-800 dark:text-neutral-200">
            {getStyleSummaryText(styleWeights)}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-neutral-600 dark:text-neutral-400">
            Intensité {intensity}%
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
        </div>
      </section>

      {/* Historique Récent */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs uppercase font-bold tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Historique récent</span>
          </h2>
          {history.length > 0 && (
            <button
              onClick={() => setCurrentScreen('history')}
              className="text-xs font-semibold hover:underline"
              style={{ color: themePalette.primary }}
            >
              Voir tout ({history.length})
            </button>
          )}
        </div>

        {recentItems.length === 0 ? (
          <div className="ios-card p-8 rounded-2xl text-center border border-black/5 dark:border-white/5">
            <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-3 text-neutral-400">
              <MessageSquare className="w-6 h-6 stroke-[1.5]" />
            </div>
            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 leading-relaxed">
              « Tes conversations analysées apparaîtront ici. »
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentItems.map((item) => (
              <button
                key={item.id}
                onClick={() => openHistoryItem(item)}
                className="w-full ios-card p-3.5 rounded-2xl text-left border border-black/5 dark:border-white/5 hover:border-black/10 active:scale-[0.98] transition-all flex items-center justify-between"
              >
                <div className="space-y-1 min-w-0 flex-1 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                      {item.analysis.tonDetecte}
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      {new Date(item.timestamp).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                    {item.anticipationTree && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        ♟ Anticipé
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-medium text-neutral-800 dark:text-neutral-200 truncate">
                    {item.analysis.transcription || item.inputContent}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    {item.analysis.engagementEstime}%
                  </span>
                  <ArrowRight className="w-4 h-4 text-neutral-400" />
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
