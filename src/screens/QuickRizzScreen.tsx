import React, { useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Camera, Clipboard, ArrowRight, Copy, RotateCcw } from 'lucide-react';

export const QuickRizzScreen: React.FC = () => {
  const {
    inputText,
    setInputText,
    runAnalysis,
    isAnalyzing,
    currentRecord,
    regenerateSingle,
    copyResponse,
    startAnticipationFromResponse,
    themePalette,
    showToast,
  } = useApp();

  const [quickInput, setQuickInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleQuickPaste = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setQuickInput(text);
          showToast('Collé');
        }
      }
    } catch {}
  };

  const handleLaunchQuickAnalysis = async () => {
    if (!quickInput.trim()) return;
    setInputText(quickInput.trim());
    await runAnalysis();
  };

  return (
    <div className="space-y-5 pb-28 pt-2">
      {/* Header Rizz Rapide */}
      <section className="text-center px-2 pt-2">
        <div
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-2"
          style={{ backgroundColor: themePalette.lightBg, color: themePalette.primary }}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Flux Express</span>
        </div>
        <h2 className="text-2xl font-black text-neutral-900 dark:text-white">
          RIZZ RAPIDE
        </h2>
        <p className="text-xs text-neutral-500 mt-1">
          Colle ou importe → 4 réponses → Anticipe d'un clic
        </p>
      </section>

      {/* Saisie rapide sans friction */}
      <section className="ios-card p-4 rounded-3xl border border-black/5 dark:border-white/5 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase text-neutral-600 dark:text-neutral-400">
            Message reçu
          </label>
          <button
            onClick={handleQuickPaste}
            className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1"
          >
            <Clipboard className="w-3 h-3" />
            <span>Coller</span>
          </button>
        </div>

        <textarea
          value={quickInput}
          onChange={(e) => setQuickInput(e.target.value)}
          placeholder="Ex: « Pourquoi tu réponds jamais à l'heure ? »"
          rows={2}
          className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-neutral-100/70 dark:bg-neutral-800/60 border border-neutral-200/50 dark:border-neutral-700/50 focus:outline-none focus:border-blue-500 transition-all resize-none text-neutral-900 dark:text-white"
        />

        <button
          onClick={handleLaunchQuickAnalysis}
          disabled={!quickInput.trim() || isAnalyzing}
          className="w-full py-3 rounded-2xl text-xs font-bold text-white shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          style={{ backgroundColor: themePalette.primary }}
        >
          <Sparkles className="w-4 h-4" />
          <span>{isAnalyzing ? 'Analyse express…' : 'Générer & Anticiper'}</span>
        </button>
      </section>

      {/* Résultats immédiats si disponibles */}
      {currentRecord && (
        <section className="space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-extrabold uppercase text-neutral-400">
              4 Réponses & Anticipation
            </span>
            <span className="text-[10px] text-neutral-400">
              Ton : {currentRecord.analysis.tonDetecte}
            </span>
          </div>

          <div className="space-y-2.5">
            {currentRecord.responses.map((resp) => (
              <div
                key={resp.style}
                className="ios-card p-3.5 rounded-2xl border border-black/5 dark:border-white/5 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-neutral-500">
                    {resp.title}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => copyResponse(resp.text)}
                      className="px-2 py-1 rounded-lg text-[10px] font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copier</span>
                    </button>
                    <button
                      onClick={() => regenerateSingle(resp.style)}
                      className="p-1 rounded-lg text-neutral-400 hover:text-neutral-900"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <p className="text-xs font-semibold text-neutral-900 dark:text-white">
                  « {resp.text} »
                </p>

                {/* Le bouton clé de Phase 2 : [ ♟ ANTICIPER ] */}
                <button
                  onClick={() => startAnticipationFromResponse(resp.text)}
                  className="w-full py-2 rounded-xl text-xs font-extrabold text-white flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-xs"
                  style={{ backgroundColor: themePalette.primary }}
                >
                  <span>♟ ANTICIPER LES RÉACTIONS À CE COUP</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
