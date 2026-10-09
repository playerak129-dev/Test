import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, SlidersHorizontal, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

const ChessIcon: React.FC<{ className?: string }> = ({ className = 'w-8 h-8' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 2a3 3 0 0 0-3 3c0 1.3.8 2.4 2 2.8V9a3 3 0 0 1-2 2.8V13h6v-1.2A3 3 0 0 1 13 9V7.8A3 3 0 0 0 12 2z" />
    <path d="M7 21h10a2 2 0 0 0 2-2H5a2 2 0 0 0 2 2z" />
    <path d="M8 17h8v2H8z" />
    <path d="M9 13h6v4H9z" />
  </svg>
);

export const OnboardingModal: React.FC = () => {
  const { showOnboarding, completeOnboarding, themePalette } = useApp();
  const [slide, setSlide] = useState(0);

  if (!showOnboarding) return null;

  const slides = [
    {
      icon: Sparkles,
      title: 'Ton copilote relationnel',
      subtitle: 'Style & Analyse iOS 26',
      description:
        'Importe une capture d’écran de conversation ou tape ton message. L’IA décrypte le ton, l’engagement et génère 4 réparties calibrées.',
      badge: 'Étape 1 sur 4',
    },
    {
      icon: SlidersHorizontal,
      title: 'Mixeur de Styles sur-mesure',
      subtitle: 'Humour • Charo • Romantique • Calculateur',
      description:
        'Ajuste les 4 curseurs selon ta personnalité. La répartition s’équilibre automatiquement à 100% avec intensité réglable de 1 à 100.',
      badge: 'Étape 2 sur 4',
    },
    {
      icon: ChessIcon,
      title: 'L’Échiquier Conversationnel',
      subtitle: 'Plusieurs coups d’avance',
      description:
        'Ne réponds plus au hasard : anticipe les réactions probables, obtiens des contre-coups parfaits et active le Mode Coach psychologique.',
      badge: 'Étape 3 sur 4',
    },
    {
      icon: ShieldCheck,
      title: '100% Local & Hors Ligne',
      subtitle: 'Confidentialité absolue',
      description:
        'Tes données restent exclusivement sur ton appareil. Moteur heuristique autonome hors ligne actif sans réseau et verrouillage par code PIN.',
      badge: 'Étape 4 sur 4',
    },
  ];

  const current = slides[slide];
  const Icon = current.icon;
  const isLast = slide === slides.length - 1;

  const handleNext = () => {
    triggerHaptic('light');
    if (isLast) {
      completeOnboarding();
    } else {
      setSlide((s) => s + 1);
    }
  };

  const handleSkip = () => {
    triggerHaptic('light');
    completeOnboarding();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-3xl ios-card p-6 border border-white/20 shadow-2xl relative flex flex-col justify-between min-h-[460px]">
        {/* Top Indicator & Skip */}
        <div className="flex items-center justify-between">
          <span
            className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
            style={{
              backgroundColor: themePalette.lightBg,
              color: themePalette.primary,
            }}
          >
            {current.badge}
          </span>
          {!isLast && (
            <button
              onClick={handleSkip}
              className="text-xs font-semibold text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
            >
              Passer
            </button>
          )}
        </div>

        {/* Center Illustration & Content */}
        <div className="text-center py-6 flex flex-col items-center">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center text-white mb-6 shadow-xl transform transition-transform duration-300"
            style={{ background: themePalette.gradient }}
          >
            <Icon className="w-10 h-10" />
          </div>

          <h3 className="text-xl font-black text-neutral-900 dark:text-white tracking-tight">
            {current.title}
          </h3>
          <p
            className="text-xs font-bold mt-1"
            style={{ color: themePalette.primary }}
          >
            {current.subtitle}
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-3 leading-relaxed px-2 font-medium">
            {current.description}
          </p>
        </div>

        {/* Bottom Pagination Dots & Next Button */}
        <div className="space-y-4 pt-2">
          {/* Dots */}
          <div className="flex items-center justify-center gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === slide ? 'w-6 bg-blue-600 dark:bg-blue-400' : 'w-1.5 bg-neutral-300 dark:bg-neutral-700'
                }`}
                style={{
                  backgroundColor: i === slide ? themePalette.primary : undefined,
                }}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="w-full py-3.5 px-4 rounded-2xl font-bold text-white shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            style={{ background: themePalette.gradient }}
          >
            <span>{isLast ? 'Commencer l’expérience' : 'Continuer'}</span>
            {isLast ? <Check className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
