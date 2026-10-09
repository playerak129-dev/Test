import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Enregistrement du Service Worker pour fonctionnement complet hors-ligne (PWA)
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('[PWA] Nouvelle version disponible.');
  },
  onOfflineReady() {
    console.log('[PWA] Application prête et mise en cache pour le mode hors ligne.');
  },
});

createRoot(document.getElementById('root')!).render(<App />);

