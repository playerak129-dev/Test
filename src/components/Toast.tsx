import React from 'react';
import { useApp } from '../context/AppContext';
import { Check } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toastMessage, themePalette } = useApp();

  if (!toastMessage) return null;

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-300 animate-in fade-in slide-in-from-top-4">
      <div className="px-4 py-2 rounded-full ios-glass shadow-xl border border-white/40 dark:border-white/10 flex items-center gap-2 text-xs font-semibold text-neutral-900 dark:text-white">
        <div
          className="w-4 h-4 rounded-full flex items-center justify-center text-white"
          style={{ backgroundColor: themePalette.primary }}
        >
          <Check className="w-2.5 h-2.5 stroke-[3]" />
        </div>
        <span>{toastMessage}</span>
      </div>
    </div>
  );
};
