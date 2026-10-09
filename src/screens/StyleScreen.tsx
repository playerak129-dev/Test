import React from 'react';
import { useApp } from '../context/AppContext';
import { StyleType, StyleWeights } from '../types';
import {
  SlidersHorizontal,
  Flame,
  ShieldCheck,
  Check,
  RotateCcw,
  Sparkles,
  Zap,
} from 'lucide-react';
import { getIntensityCategory, getStyleSummaryText } from '../utils/styleBalancing';

export const StyleScreen: React.FC = () => {
  const {
    styleWeights,
    setStyleWeight,
    intensity,
    setIntensity,
    themePalette,
    setCurrentScreen,
    showToast,
  } = useApp();

  const intensityInfo = getIntensityCategory(intensity);
  const total =
    styleWeights.humour +
    styleWeights.charo +
    styleWeights.romantique +
    styleWeights.calculateur;

  const styleItems: {
    key: StyleType;
    label: string;
    description: string;
    color: string;
    badgeBg: string;
  }[] = [
    {
      key: 'humour',
      label: 'HUMOUR',
      description: 'Taquin, léger, plein d\'esprit et autodérision subtile.',
      color: '#F59E0B',
      badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    },
    {
      key: 'charo',
      label: 'CHARO',
      description: 'Confiant, direct, audacieux et séducteur sans filtre.',
      color: '#F43F5E',
      badgeBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    },
    {
      key: 'romantique',
      label: 'ROMANTIQUE',
      description: 'Chaleureux, complice, sensible et sincèrement séduisant.',
      color: '#A855F7',
      badgeBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    },
    {
      key: 'calculateur',
      label: 'CALCULATEUR',
      description: 'Stratégique, observateur, calibré et préserve le mystère.',
      color: '#0284C7',
      badgeBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
    },
  ];

  const presets: { name: string; weights: StyleWeights }[] = [
    {
      name: 'Équilibré',
      weights: { humour: 25, charo: 25, romantique: 25, calculateur: 25 },
    },
    {
      name: 'Charo 60% + Humour 40%',
      weights: { humour: 40, charo: 60, romantique: 0, calculateur: 0 },
    },
    {
      name: 'Calculateur 65% + Charo 35%',
      weights: { humour: 0, charo: 35, romantique: 0, calculateur: 65 },
    },
    {
      name: 'Romantique 70% + Humour 30%',
      weights: { humour: 30, charo: 0, romantique: 70, calculateur: 0 },
    },
  ];

  const applyPreset = (p: typeof presets[0]) => {
    (Object.keys(p.weights) as StyleType[]).forEach((k) => {
      setStyleWeight(k, p.weights[k]);
    });
    showToast(`Preset « ${p.name} » appliqué`);
  };

  return (
    <div className="space-y-6 pb-28 pt-2">
      {/* SECTION 9 : MÉLANGE DES STYLES */}
      <section className="ios-card p-5 rounded-3xl border border-black/5 dark:border-white/5 space-y-4">
        <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white"
              style={{ backgroundColor: themePalette.primary }}
            >
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-neutral-900 dark:text-white">
                MÉLANGE DES STYLES
              </h2>
            </div>
          </div>

          <div
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-black ${
              total === 100
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'bg-rose-500/10 text-rose-600'
            }`}
          >
            Total : {total} %
          </div>
        </div>

        {/* Affichage en temps réel du STYLE ACTUEL */}
        <div className="p-3.5 rounded-2xl bg-neutral-100/70 dark:bg-neutral-800/60 border border-neutral-200/40 dark:border-neutral-700/40 space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            STYLE ACTUEL
          </div>
          <div className="text-sm font-bold text-neutral-900 dark:text-white">
            « {getStyleSummaryText(styleWeights)} »
          </div>
        </div>

        {/* 4 curseurs indépendants auto-équilibrés */}
        <div className="space-y-4 pt-1">
          {styleItems.map((item) => {
            const val = styleWeights[item.key];

            return (
              <div key={item.key} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-md ${item.badgeBg}`}
                    >
                      {item.label}
                    </span>
                    <span className="text-[11px] text-neutral-400 hidden sm:inline">
                      {item.description}
                    </span>
                  </div>
                  <span className="font-black text-sm text-neutral-900 dark:text-white">
                    {val} %
                  </span>
                </div>

                <div className="relative flex items-center">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={val}
                    onChange={(e) => setStyleWeight(item.key, Number(e.target.value))}
                    className="w-full h-2 rounded-lg bg-neutral-200 dark:bg-neutral-700 appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, ${item.color} 0%, ${item.color} ${val}%, rgba(150,150,150,0.2) ${val}%, rgba(150,150,150,0.2) 100%)`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Presets rapides */}
        <div className="space-y-2 pt-2 border-t border-black/5 dark:border-white/5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Combinaisons suggérées
          </div>
          <div className="grid grid-cols-2 gap-2">
            {presets.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => applyPreset(p)}
                className="py-2 px-3 rounded-xl text-left text-[11px] font-medium bg-neutral-100/70 dark:bg-neutral-800/60 hover:bg-neutral-200/80 dark:hover:bg-neutral-700/80 active:scale-[0.98] transition-all text-neutral-700 dark:text-neutral-300 truncate"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 10 : INTENSITÉ */}
      <section className="ios-card p-5 rounded-3xl border border-black/5 dark:border-white/5 space-y-4">
        <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white"
              style={{ backgroundColor: themePalette.primary }}
            >
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-neutral-900 dark:text-white">
                INTENSITÉ
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${intensityInfo.badgeClass}`}
            >
              {intensityInfo.label}
            </span>
            <span className="text-sm font-black text-neutral-900 dark:text-white">
              {intensity} / 100
            </span>
          </div>
        </div>

        {/* Curseur 1 à 100 */}
        <div className="space-y-3">
          <div className="relative flex items-center">
            <input
              type="range"
              min="1"
              max="100"
              step="1"
              value={intensity}
              onChange={(e) => setIntensity(Number(e.target.value))}
              className="w-full h-2.5 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, ${themePalette.primary} 0%, ${themePalette.primary} ${intensity}%, rgba(150,150,150,0.2) ${intensity}%, rgba(150,150,150,0.2) 100%)`,
              }}
            />
          </div>

          {/* Échelle des 5 paliers */}
          <div className="grid grid-cols-5 text-center text-[10px] text-neutral-400 font-medium pt-1">
            <span className={intensity <= 20 ? 'font-bold text-neutral-900 dark:text-white' : ''}>
              1-20
              <br />
              Subtil
            </span>
            <span
              className={intensity > 20 && intensity <= 40 ? 'font-bold text-neutral-900 dark:text-white' : ''}
            >
              21-40
              <br />
              Naturel
            </span>
            <span
              className={intensity > 40 && intensity <= 60 ? 'font-bold text-neutral-900 dark:text-white' : ''}
            >
              41-60
              <br />
              Confiant
            </span>
            <span
              className={intensity > 60 && intensity <= 80 ? 'font-bold text-neutral-900 dark:text-white' : ''}
            >
              61-80
              <br />
              Audacieux
            </span>
            <span className={intensity > 80 ? 'font-bold text-neutral-900 dark:text-white' : ''}>
              81-100
              <br />
              Très audacieux
            </span>
          </div>

          <p className="text-xs text-neutral-600 dark:text-neutral-400 italic bg-neutral-100/50 dark:bg-neutral-800/40 p-3 rounded-2xl">
            {intensityInfo.description}
          </p>
        </div>

        {/* Règle de respect des limites explicites */}
        <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            Même à très haute intensité, RIZZ AI applique des règles éthiques strictes et respecte toujours les limites explicites de l'autre personne.
          </p>
        </div>
      </section>

      {/* Bouton d'action */}
      <button
        onClick={() => setCurrentScreen('analyze')}
        className="w-full py-4 px-6 rounded-2xl font-bold text-sm text-white shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        style={{
          background: themePalette.gradient,
          boxShadow: themePalette.glow,
        }}
      >
        <Sparkles className="w-4 h-4" />
        <span>ANALYSER AVEC CE PROFIL DE STYLE</span>
      </button>
    </div>
  );
};
