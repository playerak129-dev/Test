import React from 'react';
import { useApp } from '../context/AppContext';

export const BackgroundGlow: React.FC = () => {
  const { settings, themePalette } = useApp();

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Fond de base */}
      <div className="absolute inset-0 bg-[#f8fafc] dark:bg-[#090d16] transition-colors duration-500" />

      {/* Dégradé dynamique fluide Blanc + Accent (par défaut Blanc + Bleu) */}
      <div
        className={`absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl opacity-35 dark:opacity-25 transition-all duration-700 ${
          settings.animatedGradient ? 'ambient-blob-1' : ''
        }`}
        style={{
          background: `radial-gradient(circle, ${themePalette.primary} 0%, rgba(255,255,255,0) 70%)`,
        }}
      />

      <div
        className={`absolute top-1/3 -right-32 w-96 h-96 rounded-full blur-3xl opacity-25 dark:opacity-20 transition-all duration-700 ${
          settings.animatedGradient ? 'ambient-blob-2' : ''
        }`}
        style={{
          background: `radial-gradient(circle, rgba(${themePalette.rgb}, 0.7) 0%, rgba(255,255,255,0) 70%)`,
        }}
      />

      <div
        className={`absolute -bottom-32 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 dark:opacity-15 transition-all duration-700 ${
          settings.animatedGradient ? 'ambient-blob-1' : ''
        }`}
        style={{
          background: `radial-gradient(circle, ${themePalette.primary} 0%, rgba(255,255,255,0) 70%)`,
        }}
      />

      {/* Voile subtil pour unifier */}
      <div className="absolute inset-0 bg-white/20 dark:bg-black/20 backdrop-blur-[1px]" />
    </div>
  );
};
