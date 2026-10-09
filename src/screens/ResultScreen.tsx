import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ResponseOption, StyleType } from '../types';
import {
  Copy,
  RotateCcw,
  Sparkles,
  SlidersHorizontal,
  ChevronLeft,
  Info,
  TrendingUp,
  Target,
  ArrowRight,
  HelpCircle,
  Compass,
} from 'lucide-react';
import { getIntensityCategory } from '../utils/styleBalancing';
import { triggerHaptic } from '../utils/haptics';

export const ResultScreen: React.FC = () => {
  const {
    currentRecord,
    regenerateSingle,
    copyResponse,
    setCurrentScreen,
    startAnticipationFromResponse,
    themePalette,
    intensity,
  } = useApp();

  const [activeCoachExplanation, setActiveCoachExplanation] = useState<string | null>(null);

  if (!currentRecord) {
    return (
      <div className="py-16 text-center space-y-4">
        <p className="text-sm text-neutral-500">Aucune analyse active.</p>
        <button
          onClick={() => setCurrentScreen('analyze')}
          className="px-5 py-2.5 rounded-xl text-xs font-bold text-white"
          style={{ backgroundColor: themePalette.primary }}
        >
          Analyser une conversation
        </button>
      </div>
    );
  }

  const { analysis, responses } = currentRecord;
  const intensityInfo = getIntensityCategory(currentRecord.intensity || intensity);

  // Style badge colors
  const getStyleTheme = (style: StyleType) => {
    switch (style) {
      case 'humour':
        return {
          title: 'HUMOUR',
          subtitle: 'Taquin, léger & plein d\'esprit',
          badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
          coachTip: 'Désamorce la tension en jouant sur l\'autodérision ou une taquinerie élégante sans blesser.',
        };
      case 'charo':
        return {
          title: 'CHARO',
          subtitle: 'Confiant, direct & affirmé',
          badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
          coachTip: 'Assume totalement son attirance, inverse le rapport de force et brise la friendzone.',
        };
      case 'romantique':
        return {
          title: 'ROMANTIQUE',
          subtitle: 'Chaleureux, sincère & séduisant',
          badge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
          coachTip: 'Crée une vraie connexion émotionnelle en montrant une attention sincère et valorisante.',
        };
      case 'calculateur':
        return {
          title: 'CALCULATEUR',
          subtitle: 'Stratégique, mesuré & intrigant',
          badge: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
          coachTip: 'Garde le contrôle du tempo, suscite la curiosité et oblige l\'autre à s\'investir davantage.',
        };
    }
  };

  return (
    <div className="space-y-6 pb-28 pt-2">
      {/* Barre supérieure d'action rapide */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentScreen('analyze')}
          className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1 active:scale-95 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Nouvelle analyse</span>
        </button>

        <button
          onClick={() => setCurrentScreen('style')}
          className="text-xs font-semibold px-2.5 py-1 rounded-full ios-glass border border-black/5 dark:border-white/5 flex items-center gap-1.5 hover:border-black/20 transition-all"
          style={{ color: themePalette.primary }}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Ajuster les styles</span>
        </button>
      </div>

      {/* BOUTON PRINCIPAL PHASE 2 : [ ♟ ANTICIPER ] */}
      <section>
        <button
          onClick={() => startAnticipationFromResponse(responses[0]?.text || currentRecord.inputContent)}
          className="w-full py-4 px-5 rounded-3xl font-extrabold text-white shadow-xl active:scale-[0.98] transition-all flex items-center justify-between group"
          style={{
            background: themePalette.gradient,
            boxShadow: themePalette.glow,
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-lg font-black">
              ♟
            </div>
            <div className="text-left">
              <div className="text-[10px] uppercase tracking-wider text-white/80 font-bold">
                Échiquier Conversationnel
              </div>
              <div className="text-base font-extrabold">
                ANTICIPER LES SCÉNARIOS
              </div>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </section>

      {/* SECTION 7 : ANALYSE DE LA CONVERSATION */}
      <section className="ios-card p-5 rounded-3xl border border-black/5 dark:border-white/5 space-y-4">
        <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white"
              style={{ backgroundColor: themePalette.primary }}
            >
              <TrendingUp className="w-4 h-4" />
            </div>
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-neutral-900 dark:text-white">
              ANALYSE DE LA CONVERSATION
            </h2>
          </div>
          <span className="text-[10px] font-medium text-neutral-400 px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800">
            Intensité {intensityInfo.label} ({currentRecord.intensity}%)
          </span>
        </div>

        {/* Grille des métriques clés */}
        <div className="grid grid-cols-2 gap-3">
          {/* Intérêt estimé */}
          <div className="p-3 rounded-2xl bg-neutral-100/70 dark:bg-neutral-800/60 border border-neutral-200/40 dark:border-neutral-700/40 space-y-1.5">
            <div className="text-[10px] uppercase font-bold text-neutral-500 dark:text-neutral-400 tracking-wider">
              INTÉRÊT ESTIMÉ
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-neutral-900 dark:text-white">
                {analysis.engagementEstime} %
              </span>
              <span className="text-[10px] text-neutral-400 font-medium">estimé</span>
            </div>
            <div className="w-full bg-neutral-200 dark:bg-neutral-700 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${analysis.engagementEstime}%`,
                  backgroundColor: themePalette.primary,
                }}
              />
            </div>
          </div>

          {/* Ton détecté */}
          <div className="p-3 rounded-2xl bg-neutral-100/70 dark:bg-neutral-800/60 border border-neutral-200/40 dark:border-neutral-700/40 space-y-1">
            <div className="text-[10px] uppercase font-bold text-neutral-500 dark:text-neutral-400 tracking-wider">
              TON
            </div>
            <div className="text-sm font-bold text-neutral-900 dark:text-white leading-tight">
              {analysis.tonDetecte}
            </div>
            <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Style détecté
            </div>
          </div>

          {/* Dynamique */}
          <div className="p-3 rounded-2xl bg-neutral-100/70 dark:bg-neutral-800/60 border border-neutral-200/40 dark:border-neutral-700/40 space-y-1">
            <div className="text-[10px] uppercase font-bold text-neutral-500 dark:text-neutral-400 tracking-wider">
              DYNAMIQUE
            </div>
            <div className="text-sm font-bold text-neutral-900 dark:text-white leading-tight">
              {analysis.dynamique}
            </div>
            <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Équilibre de l'échange
            </div>
          </div>

          {/* Objectif recommandé */}
          <div className="p-3 rounded-2xl bg-neutral-100/70 dark:bg-neutral-800/60 border border-neutral-200/40 dark:border-neutral-700/40 space-y-1">
            <div className="text-[10px] uppercase font-bold text-neutral-500 dark:text-neutral-400 tracking-wider">
              OBJECTIF
            </div>
            <div className="text-sm font-bold text-neutral-900 dark:text-white leading-tight">
              {analysis.objectifRecommande}
            </div>
            <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Tactique suggérée
            </div>
          </div>
        </div>

        {/* Intention probable & Synthèse */}
        {analysis.intentionProbable && (
          <div className="p-3 rounded-2xl bg-neutral-100/50 dark:bg-neutral-800/40 text-xs text-neutral-600 dark:text-neutral-300 flex items-start gap-2">
            <Target className="w-4 h-4 shrink-0 text-neutral-400 mt-0.5" />
            <div>
              <span className="font-bold text-neutral-800 dark:text-neutral-200">
                Intention probable :{' '}
              </span>
              {analysis.intentionProbable}
            </div>
          </div>
        )}

        <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 dark:text-neutral-500 px-1 pt-1">
          <Info className="w-3 h-3 shrink-0" />
          <span>
            Les pourcentages sont des estimations indicatives de l'IA, jamais des certitudes absolues.
          </span>
        </div>
      </section>

      {/* SECTION 8 : LES 4 RÉPONSES AVEC BOUTON ANTICIPER DÉDIÉ */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs uppercase font-extrabold tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>4 RÉPONSES SUR MESURE</span>
          </h2>
          <span className="text-[11px] text-neutral-400 font-medium">Prêtes à copier ou anticiper</span>
        </div>

        <div className="space-y-3.5">
          {responses.map((item) => {
            const conf = getStyleTheme(item.style);
            const isRegenerating = item.isRegenerating;

            return (
              <div
                key={item.style}
                className="ios-card p-4.5 rounded-3xl border border-black/5 dark:border-white/5 space-y-3 transition-all hover:border-black/10 dark:hover:border-white/10"
              >
                {/* En-tête de catégorie */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-xl border ${conf.badge}`}
                    >
                      {conf.title}
                    </span>
                    <span className="text-xs text-neutral-400 dark:text-neutral-500 font-medium">
                      {conf.subtitle}
                    </span>
                  </div>

                  {/* Mode Coach [ POURQUOI ? ] */}
                  <button
                    onClick={() =>
                      setActiveCoachExplanation(
                        activeCoachExplanation === item.style ? null : item.style
                      )
                    }
                    className="text-[11px] font-bold text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1"
                  >
                    <HelpCircle className="w-3 h-3" />
                    <span>POURQUOI ?</span>
                  </button>
                </div>

                {/* Bulle de message générée */}
                <div className="p-3.5 rounded-2xl bg-neutral-100/70 dark:bg-neutral-800/60 border border-neutral-200/50 dark:border-neutral-700/50 relative group">
                  <p className="text-sm font-semibold text-neutral-900 dark:text-white leading-relaxed select-text">
                    {isRegenerating ? (
                      <span className="italic text-neutral-400 animate-pulse flex items-center gap-2">
                        <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                        Génération d'une nouvelle version {conf.title}…
                      </span>
                    ) : (
                      item.text
                    )}
                  </p>
                </div>

                {item.explanation && (
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 italic px-1">
                    Effet : {item.explanation}
                  </p>
                )}

                {/* Explication Coach Dépliée */}
                {activeCoachExplanation === item.style && (
                  <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-900 dark:text-blue-200 space-y-1 animate-in fade-in">
                    <div className="font-bold flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5" />
                      <span>Analyse du Coach :</span>
                    </div>
                    <p className="leading-relaxed">{conf.coachTip}</p>
                  </div>
                )}

                {/* Bouton clé : [ ♟ ANTICIPER CE COUP ] */}
                <button
                  onClick={() => {
                    triggerHaptic('medium');
                    startAnticipationFromResponse(item.text);
                  }}
                  className="w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <span>♟ ANTICIPER LES RÉACTIONS À CE COUP</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                {/* Boutons classiques : [ COPIER ] & [ RÉGÉNÉRER ] */}
                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  <button
                    onClick={() => {
                      triggerHaptic('light');
                      copyResponse(item.text);
                    }}
                    disabled={isRegenerating}
                    className="py-2.5 px-4 rounded-xl text-xs font-bold text-white shadow-xs active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    style={{ backgroundColor: themePalette.primary }}
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>COPIER</span>
                  </button>

                  <button
                    onClick={() => {
                      triggerHaptic('light');
                      regenerateSingle(item.style);
                    }}
                    disabled={isRegenerating}
                    className="py-2.5 px-4 rounded-xl text-xs font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 border border-black/5 dark:border-white/5 disabled:opacity-50"
                  >
                    <RotateCcw
                      className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`}
                    />
                    <span>RÉGÉNÉRER</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
