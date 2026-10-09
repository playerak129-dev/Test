import React from 'react';
import { useApp } from '../context/AppContext';
import { WifiOff, Database } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const { isOnline } = useApp();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 max-w-sm mx-auto flex items-center justify-between gap-2.5 px-3.5 py-2 rounded-2xl bg-neutral-900/90 dark:bg-neutral-800/90 text-white backdrop-blur-md border border-white/10 shadow-lg animate-in slide-in-from-bottom-2 duration-200">
      <div className="flex items-center gap-2 text-xs font-semibold">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        <WifiOff className="w-3.5 h-3.5 text-amber-400" />
        <span>Mode Hors Ligne Actif</span>
      </div>
      <div className="flex items-center gap-1 text-[11px] text-neutral-300">
        <Database className="w-3 h-3 text-blue-400" />
        <span>Données en cache local</span>
      </div>
    </div>
  );
};
