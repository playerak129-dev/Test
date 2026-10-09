import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AnticipationDepth, ConversationalObjective, StyleType, PredictionBranch, CounterMove } from '../types';
import {
  Sparkles,
  GitBranch,
  ArrowDown,
  ArrowRight,
  TrendingUp,
  Target,
  ShieldCheck,
  Check,
  Copy,
  Info,
  HelpCircle,
  RefreshCw,
  PlusCircle,
  Compass,
  Zap,
  MessageCircle,
  Scale,
  Award,
} from 'lucide-react';
import { getStyleSummaryText } from '../utils/styleBalancing';

export const AnticipateScreen: React.FC = () => {
  const {
    anticipationTree,
    isAnticipating,
    anticipationError,
    anticipationDepth,
    setAnticipationDepth,
    anticipationObjective,
    setAnticipationObjective,
    targetMoveForAnticipation,
    setTargetMoveForAnticipation,
    runAnticipation,
    addTurnAndRecalculate,
    copyResponse,
    themePalette,
    styleWeights,
    intensity,
    setCurrentScreen,
    currentRecord,
  } = useApp();

  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [showCoachModal, setShowCoachModal] = useState<CounterMove | null>(null);
  const [showDynamicsInfo, setShowDynamicsInfo] = useState(false);
  const [showRealReplyInput, setShowRealReplyInput] = useState(false);
  const [actualReplyText, setActualReplyText] = useState('');

  const objectivesList: { key: ConversationalObjective; label: string; desc: string }[] = [
    { key: 'continuer', label: 'Continuer', desc: 'Maintenir la fluidité' },
    { key: 'curiosite', label: 'Curiosité', desc: 'Créer du mystère' },
    { key: 'flirt', label: 'Flirt', desc: 'Monter la tension' },
    { key: 'humour', label: 'Humour', desc: 'Faire rire & détendre' },
    { key: 'approfondir', label: 'Approfondir', desc: 'Connexion émotionnelle' },
    { key: 'rencontre', label: 'Rencontre', desc: 'Proposer un date subtil' },
    { key: 'ralentir', label: 'Ralentir', desc: 'Temporiser l\'échange' },
    { key: 'terminer', label: 'Terminer', desc: 'Sortie digne & élégante' },
  ];

  const depthList: AnticipationDepth[] = [1, 2, 3, 4];

  const handleDepthChange = (d: AnticipationDepth) => {
    setAnticipationDepth(d);
    runAnticipation(undefined, d, undefined);
  };

  const handleObjectiveChange = (obj: ConversationalObjective) => {
    setAnticipationObjective(obj);
    runAnticipation(undefined, undefined, obj);
  };

  const handleAddRealReply = async () => {
    if (!actualReplyText.trim()) return;
    await addTurnAndRecalculate(actualReplyText.trim());
    setActualReplyText('');
    setShowRealReplyInput(false);
  };

  const branches = anticipationTree?.branches || [];
  const activeBranch = branches.find((b) => b.id === selectedBranchId) || branches[0];

  const getStyleTheme = (style: StyleType) => {
    switch (style) {
      case 'humour':
        return {
          title: 'HUMOUR',
          badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
          color: '#F59E0B',
        };
      case 'charo':
        return {
          title: 'CHARO',
          badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
          color: '#F43F5E',
        };
      case 'romantique':
        return {
          title: 'ROMANTIQUE',
          badge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
          color: '#A855F7',
        };
      case 'calculateur':
        return {
          title: 'CALCULATEUR',
          badge: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
          color: '#0284C7',
        };
    }
  };

  return (
    <div className="space-y-6 pb-28 pt-2">
      {/* En-tête : Coup analysé & Contrôles tactiques */}
      <section className="ios-card p-5 rounded-3xl border border-black/5 dark:border-white/5 space-y-4">
        <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: themePalette.primary }}
            >
              ♟
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-neutral-900 dark:text-white uppercase tracking-wider">
                Échiquier Conversationnel
              </h2>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Copilote à plusieurs coups d'avance
              </p>
            </div>
          </div>

          <button
            onClick={() => runAnticipation()}
            disabled={isAnticipating}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs flex items-center gap-1.5 active:scale-95 transition-all disabled:opacity-50"
            style={{ backgroundColor: themePalette.primary }}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAnticipating ? 'animate-spin' : ''}`} />
            <span>Recalculer</span>
          </button>
        </div>

        {/* Coup actuel analysé */}
        <div className="p-3.5 rounded-2xl bg-neutral-100/70 dark:bg-neutral-800/60 border border-neutral-200/40 dark:border-neutral-700/40 space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1">
            <span>TON COUP ACTUEL</span>
          </div>
          <p className="text-sm font-bold text-neutral-900 dark:text-white leading-snug">
            « {targetMoveForAnticipation || currentRecord?.responses[0]?.text || currentRecord?.inputContent || 'Premier message'} »
          </p>
        </div>

        {/* Réglage de profondeur (1 à 4 coups) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-neutral-700 dark:text-neutral-300">Profondeur de l'anticipation</span>
            <span className="text-neutral-900 dark:text-white font-black">
              {anticipationDepth} {anticipationDepth > 1 ? 'COUPS D\'AVANCE' : 'COUP'}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1.5 p-1 rounded-2xl bg-neutral-200/50 dark:bg-neutral-800/60">
            {depthList.map((d) => (
              <button
                key={d}
                onClick={() => handleDepthChange(d)}
                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                  anticipationDepth === d
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {d} {d > 1 ? 'Coups' : 'Coup'}
              </button>
            ))}
          </div>
        </div>

        {/* Sélecteur d'objectif conversationnel */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-neutral-700 dark:text-neutral-300">Objectif tactique</span>
            <span
              className="text-xs font-bold capitalize"
              style={{ color: themePalette.primary }}
            >
              {anticipationObjective}
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {objectivesList.map((obj) => (
              <button
                key={obj.key}
                onClick={() => handleObjectiveChange(obj.key)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold whitespace-nowrap shrink-0 transition-all ${
                  anticipationObjective === obj.key
                    ? 'text-white'
                    : 'bg-neutral-100/80 dark:bg-neutral-800/80 text-neutral-600 dark:text-neutral-400'
                }`}
                style={{
                  backgroundColor: anticipationObjective === obj.key ? themePalette.primary : undefined,
                }}
              >
                {obj.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Message d'erreur s'il y a lieu */}
      {anticipationError && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{anticipationError}</span>
        </div>
      )}

      {/* SECTION 8 : SCORE DE DYNAMIQUE CONVERSATIONNELLE */}
      {anticipationTree && (
        <section className="ios-card p-5 rounded-3xl border border-black/5 dark:border-white/5 space-y-3.5">
          <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-2.5">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-neutral-900 dark:text-white">
                Score de Dynamique
              </h3>
            </div>
            <button
              onClick={() => setShowDynamicsInfo(!showDynamicsInfo)}
              className="text-[11px] font-semibold flex items-center gap-1 text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{showDynamicsInfo ? 'Masquer détails' : 'Comprendre'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div className="p-2.5 rounded-2xl bg-neutral-100/70 dark:bg-neutral-800/60">
              <div className="text-[10px] uppercase font-bold text-neutral-400">Intérêt estimé</div>
              <div className="text-xl font-black text-neutral-900 dark:text-white mt-0.5">
                {anticipationTree.dynamics.interetEstime} %
              </div>
            </div>

            <div className="p-2.5 rounded-2xl bg-neutral-100/70 dark:bg-neutral-800/60">
              <div className="text-[10px] uppercase font-bold text-neutral-400">Engagement</div>
              <div className="text-xl font-black text-neutral-900 dark:text-white mt-0.5">
                {anticipationTree.dynamics.engagement} %
              </div>
            </div>

            <div className="p-2.5 rounded-2xl bg-neutral-100/70 dark:bg-neutral-800/60">
              <div className="text-[10px] uppercase font-bold text-neutral-400">Flirt</div>
              <div className="text-xl font-black text-neutral-900 dark:text-white mt-0.5">
                {anticipationTree.dynamics.flirt} %
              </div>
            </div>

            <div className="p-2.5 rounded-2xl bg-neutral-100/70 dark:bg-neutral-800/60">
              <div className="text-[10px] uppercase font-bold text-neutral-400">Momentum</div>
              <div className={`text-xl font-black mt-0.5 ${
                anticipationTree.dynamics.momentum >= 0 ? 'text-emerald-500' : 'text-rose-500'
              }`}>
                {anticipationTree.dynamics.momentum >= 0 ? `+${anticipationTree.dynamics.momentum}` : anticipationTree.dynamics.momentum}
              </div>
            </div>
          </div>

          {/* Explications dépliables des dynamiques */}
          {showDynamicsInfo && (
            <div className="p-3.5 rounded-2xl bg-neutral-100/60 dark:bg-neutral-800/50 space-y-2 text-xs text-neutral-600 dark:text-neutral-300 animate-in fade-in">
              <div>
                <span className="font-bold">Compatibilité du ton :</span> {anticipationTree.dynamics.compatibiliteTon}% — {anticipationTree.dynamics.explications?.compatibiliteTon}
              </div>
              <div>
                <span className="font-bold">Momentum :</span> {anticipationTree.dynamics.explications?.momentum}
              </div>
              <p className="text-[10px] text-neutral-400 italic">
                * Les pourcentages sont des estimations indicatives calculées par l'IA.
              </p>
            </div>
          )}
        </section>
      )}

      {/* SECTION 7 : « MEILLEUR COUP » */}
      {anticipationTree?.bestMove && (
        <section className="ios-card p-5 rounded-3xl border border-black/5 dark:border-white/5 space-y-3.5 bg-gradient-to-br from-amber-500/5 to-transparent">
          <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-2.5">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <h3 className="text-xs font-black uppercase tracking-wider text-neutral-900 dark:text-white">
                MEILLEUR COUP IDENTIFIÉ
              </h3>
            </div>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
              Style {anticipationTree.bestMove.style}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-neutral-900/80 border border-neutral-200/50 dark:border-neutral-700/50 space-y-2">
            <p className="text-sm font-bold text-neutral-900 dark:text-white leading-relaxed">
              « {anticipationTree.bestMove.recommendedCounterMoveText} »
            </p>
            <div className="flex items-center justify-end">
              <button
                onClick={() => copyResponse(anticipationTree.bestMove.recommendedCounterMoveText)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 active:scale-95 transition-all"
                style={{ backgroundColor: themePalette.primary }}
              >
                <Copy className="w-3.5 h-3.5" />
                <span>COPIER CE COUP</span>
              </button>
            </div>
          </div>

          {/* Explication du « Pourquoi ? » selon les 5 critères */}
          <div className="space-y-1.5 text-xs">
            <div className="font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-neutral-400" />
              <span>Pourquoi ce coup est recommandé ?</span>
            </div>
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed pl-5">
              {anticipationTree.bestMove.why}
            </p>

            <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] pl-5">
              <div><span className="font-semibold">Cohérence :</span> {anticipationTree.bestMove.criteria.coherenceTon}</div>
              <div><span className="font-semibold">Naturel :</span> {anticipationTree.bestMove.criteria.naturel}</div>
              <div><span className="font-semibold">Potentiel :</span> {anticipationTree.bestMove.criteria.potentielEngagement}</div>
              <div><span className="font-semibold">Risque insistant :</span> {anticipationTree.bestMove.criteria.risqueInsistant}</div>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 6 : INTERFACE « ÉCHIQUIER » & ARBRE DE SCÉNARIOS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <GitBranch className="w-4 h-4 text-neutral-500" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              RÉACTIONS ANTICIPÉES & CONTRE-COUPS
            </h3>
          </div>
          <span className="text-[11px] text-neutral-400 font-medium">
            {branches.length} branches
          </span>
        </div>

        {/* Représentation visuelle des branches (Cartes + Probabilités + Lignes) */}
        <div className="space-y-3">
          {branches.map((branch, idx) => {
            const isSelected = activeBranch.id === branch.id;

            return (
              <div
                key={branch.id}
                className={`ios-card rounded-3xl border transition-all ${
                  isSelected
                    ? 'border-blue-500/50 shadow-md ring-1 ring-blue-500/20'
                    : 'border-black/5 dark:border-white/5 opacity-85 hover:opacity-100'
                }`}
              >
                {/* En-tête de branche : Réaction possible & Probabilité estimée */}
                <button
                  type="button"
                  onClick={() => setSelectedBranchId(branch.id)}
                  className="w-full p-4 text-left flex items-center justify-between gap-3 active:scale-[0.99] transition-all"
                >
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-neutral-200/70 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                        Branche {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                        « {branch.reactionText} »
                      </span>
                    </div>
                    {branch.rationale && (
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-1">
                        {branch.rationale}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <span className="text-sm font-black text-neutral-900 dark:text-white">
                        {branch.probability} %
                      </span>
                      <div className="text-[9px] uppercase font-bold text-neutral-400">
                        Probabilité
                      </div>
                    </div>
                    <ArrowDown
                      className={`w-4 h-4 text-neutral-400 transition-transform ${
                        isSelected ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>

                {/* Si la branche est développée : Afficher les 4 contre-coups */}
                {isSelected && (
                  <div className="px-4 pb-4 pt-1 space-y-3 border-t border-black/5 dark:border-white/5 animate-in fade-in">
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">
                      SI ELLE / IL RÉPOND : « {branch.reactionText} », TES 4 CONTRE-COUPS :
                    </div>

                    <div className="grid grid-cols-1 gap-2.5">
                      {branch.counterMoves.map((cm) => {
                        const styleTheme = getStyleTheme(cm.style);

                        return (
                          <div
                            key={cm.id || cm.style}
                            className="p-3.5 rounded-2xl bg-neutral-100/70 dark:bg-neutral-800/60 border border-neutral-200/50 dark:border-neutral-700/50 space-y-2.5"
                          >
                            <div className="flex items-center justify-between">
                              <span
                                className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${styleTheme.badge}`}
                              >
                                {styleTheme.title}
                              </span>

                              <button
                                onClick={() => setShowCoachModal(cm)}
                                className="text-[11px] font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1"
                              >
                                <HelpCircle className="w-3 h-3" />
                                <span>POURQUOI ?</span>
                              </button>
                            </div>

                            <p className="text-xs font-semibold text-neutral-900 dark:text-white leading-relaxed">
                              « {cm.text} »
                            </p>

                            {/* Profondeur 3 & 4 (Projection suivante) */}
                            {cm.nextPredictedReaction && (
                              <div className="p-2 rounded-xl bg-white/60 dark:bg-neutral-900/60 border border-black/5 dark:border-white/5 text-[11px] text-neutral-500 space-y-1">
                                <div className="font-semibold text-neutral-700 dark:text-neutral-300">
                                  ↳ Réaction suivante probable (Coup 3) :
                                </div>
                                <p className="italic">« {cm.nextPredictedReaction} »</p>

                                {cm.nextFollowUpMove && (
                                  <div className="pt-1 text-blue-600 dark:text-blue-400">
                                    <span className="font-semibold">↳ Nouveau coup final (Coup 4) :</span> « {cm.nextFollowUpMove} »
                                  </div>
                                )}
                              </div>
                            )}

                            <div className="flex items-center justify-end pt-0.5">
                              <button
                                onClick={() => copyResponse(cm.text)}
                                className="px-3 py-1.5 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 active:scale-95 transition-all"
                                style={{ backgroundColor: themePalette.primary }}
                              >
                                <Copy className="w-3.5 h-3.5" />
                                <span>COPIER CE COUP</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 9 & 10 : MÉMOIRE DE CONVERSATION & COMPARAISON PRÉVISION / RÉALITÉ */}
      <section className="ios-card p-5 rounded-3xl border border-black/5 dark:border-white/5 space-y-4">
        <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-2.5">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-blue-500" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-neutral-900 dark:text-white">
              Continuer la conversation
            </h3>
          </div>
          <button
            onClick={() => setShowRealReplyInput(!showRealReplyInput)}
            className="text-xs font-semibold flex items-center gap-1"
            style={{ color: themePalette.primary }}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Ajouter réponse réelle</span>
          </button>
        </div>

        {/* Comparaison Prévision vs Réalité si disponible */}
        {anticipationTree?.comparison && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-300">
              <span>COMPARAISON PRÉVISION / RÉALITÉ</span>
              <span>{anticipationTree.comparison.closestPredictedProbability}% estimé</span>
            </div>
            <div className="text-xs text-neutral-800 dark:text-neutral-200 space-y-1">
              <div>
                <span className="font-semibold">Réponse réelle reçue :</span> « {anticipationTree.comparison.actualResponseReceived} »
              </div>
              <div>
                <span className="font-semibold">Prévision correspondante :</span> {anticipationTree.comparison.closestPredictedBranchLabel}
              </div>
              <p className="text-[11px] text-neutral-600 dark:text-neutral-400 italic pt-1">
                {anticipationTree.comparison.gapAnalysis}
              </p>
              <p className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 pt-0.5">
                Stratégie adaptée : {anticipationTree.comparison.strategicAdjustment}
              </p>
            </div>
          </div>
        )}

        {/* Formulaire pour ajouter la vraie réponse */}
        {showRealReplyInput ? (
          <div className="space-y-3 pt-1">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Que vient-elle / il de te répondre réellement ?
            </label>
            <textarea
              value={actualReplyText}
              onChange={(e) => setActualReplyText(e.target.value)}
              placeholder="Ex: « 😂 pourquoi tu dis ça ? »"
              rows={2}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-neutral-100/70 dark:bg-neutral-800/60 border border-neutral-200/50 dark:border-neutral-700/50 focus:outline-none focus:border-blue-500 transition-all resize-none text-neutral-900 dark:text-white"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowRealReplyInput(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium bg-neutral-200 dark:bg-neutral-800"
              >
                Annuler
              </button>
              <button
                onClick={handleAddRealReply}
                disabled={!actualReplyText.trim() || isAnticipating}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white active:scale-95 transition-all disabled:opacity-50"
                style={{ backgroundColor: themePalette.primary }}
              >
                {isAnticipating ? 'Recalcul…' : 'Recalculer l\'échiquier'}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-neutral-500 leading-relaxed">
            Reçois-tu une réponse après avoir envoyé ton coup ? Ajoute-la pour recalculer la suite avec tout le contexte historique.
          </p>
        )}
      </section>

      {/* MODALE DU MODE COACH [ POURQUOI ? ] */}
      {showCoachModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="ios-card max-w-sm w-full p-5 rounded-3xl border border-black/10 dark:border-white/10 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-2.5">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-blue-500" />
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-neutral-900 dark:text-white">
                  Mode Coach : Pourquoi ce coup ?
                </h4>
              </div>
              <button
                onClick={() => setShowCoachModal(null)}
                className="text-xs font-bold text-neutral-400 hover:text-neutral-900"
              >
                Fermer
              </button>
            </div>

            <p className="text-xs font-bold text-neutral-900 dark:text-white leading-relaxed">
              « {showCoachModal.text} »
            </p>

            <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
              {showCoachModal.coachWhy}
            </div>

            <button
              onClick={() => setShowCoachModal(null)}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-white"
              style={{ backgroundColor: themePalette.primary }}
            >
              Compris
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
