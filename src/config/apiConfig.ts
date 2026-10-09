import { Capacitor } from '@capacitor/core';

/**
 * Configuration centralisée des endpoints API pour RIZZ AI (Phase 5.2).
 * Distingue l'environnement Web navigateur (requêtes relatives /api/...)
 * de l'environnement natif Android (URL HTTPS distante VITE_API_BASE_URL).
 */

export const isNativePlatform = (): boolean => {
  try {
    if (Capacitor.isNativePlatform()) return true;
    const platform = Capacitor.getPlatform();
    if (platform === 'android' || platform === 'ios') return true;
    if (typeof window !== 'undefined' && window.location) {
      const origin = window.location.origin || '';
      if (origin.startsWith('capacitor://') || (origin === 'https://localhost' && (window as any).Capacitor)) {
        return true;
      }
    }
  } catch {
    // fallback
  }
  return false;
};

export const getPlatformName = (): string => {
  try {
    return Capacitor.getPlatform();
  } catch {
    return 'web';
  }
};

/**
 * Retourne l'URL de base du backend API.
 * - Mode Web navigateur : chaîne vide "" (chemins relatifs directs selon l'architecture existante)
 * - Mode Android natif : lit VITE_API_BASE_URL (ex: https://mon-serveur-backend.run.app)
 */
export const getApiBaseUrl = (forceAndroid?: boolean): string => {
  const isAndroid = forceAndroid !== undefined ? forceAndroid : isNativePlatform();
  const envUrl = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL || '').trim();

  if (isAndroid) {
    if (envUrl) {
      return envUrl.replace(/\/+$/, '');
    }
    return '';
  }

  // Web navigateur : préserver les chemins relatifs par défaut
  return '';
};

/**
 * Construit l'URL complète pour un endpoint donné (ex: "/api/auth/login")
 * - Web : `/api/...`
 * - Android : `${VITE_API_BASE_URL}/api/...`
 */
export const getApiEndpoint = (path: string, forceAndroid?: boolean): string => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const baseUrl = getApiBaseUrl(forceAndroid);
  if (!baseUrl) {
    return normalizedPath;
  }
  return `${baseUrl}${normalizedPath}`;
};

export const apiConfig = {
  isNative: isNativePlatform(),
  platform: getPlatformName(),
  getBaseUrl: getApiBaseUrl,
  getEndpoint: getApiEndpoint,
  hasConfiguredBackendUrl: (): boolean => {
    const envUrl = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL || '').trim();
    return envUrl.length > 0;
  },
};
