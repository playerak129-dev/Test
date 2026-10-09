import React from 'react';
import { useApp, ScreenType } from '../context/AppContext';
import { Home, Sparkles, SlidersHorizontal, History, Settings } from 'lucide-react';

const ChessPawnIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
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

export const BottomNav: React.FC = () => {
  const { currentScreen, setCurrentScreen, themePalette } = useApp();

  const navItems: { screen: ScreenType; label: string; icon: React.FC<{ className?: string }> }[] = [
    { screen: 'home', label: 'Accueil', icon: Home },
    { screen: 'analyze', label: 'Analyser', icon: Sparkles },
    { screen: 'anticipate', label: 'Échiquier', icon: ChessPawnIcon },
    { screen: 'style', label: 'Style', icon: SlidersHorizontal },
    { screen: 'history', label: 'Historique', icon: History },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 ios-glass border-t border-black/5 dark:border-white/5 pb-[env(safe-area-inset-bottom,12px)] pt-1.5 transition-all">
      <div className="max-w-md mx-auto px-4 flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = currentScreen === item.screen;
          const Icon = item.icon;

          return (
            <button
              key={item.screen}
              onClick={() => setCurrentScreen(item.screen)}
              className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'text-neutral-900 dark:text-white font-semibold'
                  : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  isActive ? 'scale-105' : 'scale-100'
                }`}
                style={{
                  color: isActive ? themePalette.primary : undefined,
                  backgroundColor: isActive ? themePalette.lightBg : 'transparent',
                }}
              >
                <Icon className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span
                className="text-[10px] mt-0.5 tracking-tight"
                style={{
                  color: isActive ? themePalette.primary : undefined,
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
