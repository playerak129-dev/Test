import localforage from 'localforage';
import { AppSettings, ConversationRecord, StyleProfile, StyleWeights } from '../types';

let currentUserId: string | null = null;

function getKey(base: string): string {
  if (currentUserId) {
    return `rizz_ai_u_${currentUserId}_${base}`;
  }
  return `rizz_ai_${base}`;
}

// Instance dédiée localforage pour la persistance IndexedDB haute capacité et hors ligne
const chatStore = localforage.createInstance({
  name: 'rizz_ai_db',
  storeName: 'chat_data_history',
  description: 'Cache localforage IndexedDB pour les conversations, historiques et métadonnées hors ligne',
});

const DEFAULT_SETTINGS: AppSettings = {
  appearance: 'auto',
  accentColor: '#007AFF', // Bleu iOS signature par défaut
  animatedGradient: true,
  defaultStyle: 'humour',
  defaultIntensity: 50,
  defaultDepth: 2,
  responseLength: 'normale',
  flirtLevel: 'normal',
  lockPin: null,
  onboardingCompleted: false,
};

const DEFAULT_STYLE_WEIGHTS: StyleWeights = {
  humour: 25,
  charo: 25,
  romantique: 25,
  calculateur: 25,
};

const INITIAL_PROFILES: StyleProfile[] = [
  {
    id: 'profile_equilibre',
    name: 'Équilibré Naturel',
    styleWeights: { humour: 25, charo: 25, romantique: 25, calculateur: 25 },
    intensity: 50,
    responseLength: 'normale',
    flirtLevel: 'normal',
    isDefault: true,
  },
  {
    id: 'profile_charo_punchy',
    name: 'Charo Confiant',
    styleWeights: { humour: 25, charo: 50, romantique: 10, calculateur: 15 },
    intensity: 75,
    responseLength: 'courte',
    flirtLevel: 'élevé',
  },
  {
    id: 'profile_stratege_taquin',
    name: 'Stratège Mystère',
    styleWeights: { humour: 30, charo: 15, romantique: 10, calculateur: 45 },
    intensity: 60,
    responseLength: 'normale',
    flirtLevel: 'subtil',
  },
  {
    id: 'profile_romantique_doux',
    name: 'Romantique Complice',
    styleWeights: { humour: 25, charo: 10, romantique: 55, calculateur: 10 },
    intensity: 40,
    responseLength: 'normale',
    flirtLevel: 'normal',
  },
];

const memoryStore: Record<string, string> = {};

const safeStorage = {
  getItem(key: string): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        return window.localStorage.getItem(key);
      } catch {
        return memoryStore[key] || null;
      }
    }
    return memoryStore[key] || null;
  },
  setItem(key: string, value: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(key, value);
        return;
      } catch {
        memoryStore[key] = value;
      }
    }
    memoryStore[key] = value;
  },
  removeItem(key: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.removeItem(key);
        return;
      } catch {
        delete memoryStore[key];
      }
    }
    delete memoryStore[key];
  },
};

export const storageService = {
  setActiveUser(userId: string | null): void {
    currentUserId = userId;
    // Déclencher une resynchronisation asynchrone transparente avec localforage
    this.syncFromLocalForage().catch((e) => console.warn('[localforage] sync user error:', e));
  },

  getActiveUser(): string | null {
    return currentUserId;
  },

  /**
   * Initialise et synchronise le cache localforage avec le stockage local
   */
  async init(): Promise<void> {
    try {
      await this.syncFromLocalForage();
    } catch (e) {
      console.warn('[localforage] Init sync error:', e);
    }
  },

  /**
   * Synchronise l'état entre localforage (IndexedDB) et la mémoire/localStorage
   */
  async syncFromLocalForage(): Promise<void> {
    try {
      const historyKey = getKey('conversations_v1');
      const cached = await chatStore.getItem<ConversationRecord[]>(historyKey);
      
      const localData = safeStorage.getItem(historyKey);
      const localList: ConversationRecord[] = localData ? JSON.parse(localData) : [];

      if (cached && Array.isArray(cached) && cached.length > 0) {
        // Fusionner intelligemment par identifiant unique et horodatage
        const map = new Map<string, ConversationRecord>();
        // Insérer d'abord les locaux
        for (const item of localList) {
          map.set(item.id, item);
        }
        // Fusionner les données localforage
        for (const item of cached) {
          if (!map.has(item.id) || (item.timestamp && item.timestamp > (map.get(item.id)?.timestamp || 0))) {
            map.set(item.id, item);
          }
        }
        const merged = Array.from(map.values())
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 100);

        safeStorage.setItem(historyKey, JSON.stringify(merged));
        await chatStore.setItem(historyKey, merged);
      } else if (localList.length > 0) {
        // Si localforage n'avait pas encore les données existantes de localStorage, les répliquer
        await chatStore.setItem(historyKey, localList);
      }
    } catch (err) {
      console.warn('[localforage] Synchronisation non-bloquante:', err);
    }
  },

  migrateGuestDataToUser(userId: string): void {
    try {
      const userKey = `rizz_ai_u_${userId}_conversations_v1`;
      const existingUserHistory = safeStorage.getItem(userKey);
      if (!existingUserHistory) {
        const guestHistory = safeStorage.getItem('rizz_ai_conversations_v1');
        if (guestHistory) {
          safeStorage.setItem(userKey, guestHistory);
          const parsed = JSON.parse(guestHistory);
          chatStore.setItem(userKey, parsed).catch(() => {});
        }
      }
    } catch (e) {
      console.warn('Erreur migration données invité:', e);
    }
  },

  /**
   * Récupère l'historique de manière synchrone pour les rendus React instantanés
   */
  getHistory(): ConversationRecord[] {
    try {
      const data = safeStorage.getItem(getKey('conversations_v1'));
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  /**
   * Récupère l'historique complet depuis localforage (IndexedDB)
   */
  async getHistoryAsync(): Promise<ConversationRecord[]> {
    try {
      const historyKey = getKey('conversations_v1');
      const cached = await chatStore.getItem<ConversationRecord[]>(historyKey);
      if (cached && Array.isArray(cached)) {
        return cached;
      }
      return this.getHistory();
    } catch {
      return this.getHistory();
    }
  },

  searchHistory(query: string): ConversationRecord[] {
    const list = this.getHistory();
    if (!query || !query.trim()) return list;

    const q = query.toLowerCase().trim();
    return list.filter((item) => {
      const matchTitle = item.title?.toLowerCase().includes(q);
      const matchInput = item.inputContent?.toLowerCase().includes(q);
      const matchContext = item.context?.toLowerCase().includes(q);
      const matchTranscription = item.analysis?.transcription?.toLowerCase().includes(q);
      const matchTone = item.analysis?.tonDetecte?.toLowerCase().includes(q);
      const matchResponses = item.responses?.some((r) => r.text.toLowerCase().includes(q));

      return matchTitle || matchInput || matchContext || matchTranscription || matchTone || matchResponses;
    });
  },

  /**
   * Sauvegarde une conversation à la fois dans le cache rapide et dans localforage
   */
  saveConversation(record: ConversationRecord): void {
    try {
      const current = this.getHistory();
      if (!record.title) {
        const preview = record.analysis.transcription || record.inputContent || 'Conversation';
        record.title = preview.slice(0, 32) + (preview.length > 32 ? '…' : '');
      }
      const updated = [record, ...current.filter((item) => item.id !== record.id)];
      const trimmed = updated.slice(0, 80);
      
      const key = getKey('conversations_v1');
      safeStorage.setItem(key, JSON.stringify(trimmed));

      // Persistance asynchrone haute capacité dans localforage IndexedDB
      chatStore.setItem(key, trimmed).catch((e) => console.warn('[localforage] Erreur save conversation:', e));
      chatStore.setItem(getKey(`item_${record.id}`), record).catch(() => {});
    } catch (e) {
      console.error('Erreur lors de la sauvegarde de la conversation:', e);
    }
  },

  async saveConversationAsync(record: ConversationRecord): Promise<void> {
    this.saveConversation(record);
    const key = getKey('conversations_v1');
    const current = this.getHistory();
    await chatStore.setItem(key, current);
    await chatStore.setItem(getKey(`item_${record.id}`), record);
  },

  deleteConversation(id: string): void {
    try {
      const current = this.getHistory();
      const filtered = current.filter((item) => item.id !== id);
      const key = getKey('conversations_v1');
      safeStorage.setItem(key, JSON.stringify(filtered));

      chatStore.setItem(key, filtered).catch((e) => console.warn('[localforage] Erreur suppression:', e));
      chatStore.removeItem(getKey(`item_${id}`)).catch(() => {});
    } catch (e) {
      console.error('Erreur lors de la suppression de la conversation:', e);
    }
  },

  clearAllHistory(): void {
    try {
      const key = getKey('conversations_v1');
      safeStorage.removeItem(key);
      chatStore.removeItem(key).catch((e) => console.warn('[localforage] Erreur vidage historique:', e));
    } catch (e) {
      console.error('Erreur lors du nettoyage de l\'historique:', e);
    }
  },

  /**
   * Mise en cache générique de données de chat (ex: brouillons, suggestions hors ligne)
   */
  async cacheChatData<T>(subKey: string, data: T): Promise<void> {
    try {
      await chatStore.setItem(getKey(`cache_${subKey}`), data);
    } catch (e) {
      console.warn('[localforage] Erreur cacheChatData:', e);
    }
  },

  async getCachedChatData<T>(subKey: string): Promise<T | null> {
    try {
      return await chatStore.getItem<T>(getKey(`cache_${subKey}`));
    } catch {
      return null;
    }
  },

  getSettings(): AppSettings {
    try {
      const data = safeStorage.getItem(getKey('settings_v1'));
      if (!data) return DEFAULT_SETTINGS;
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: Partial<AppSettings>): AppSettings {
    try {
      const current = this.getSettings();
      const updated = { ...current, ...settings };
      const key = getKey('settings_v1');
      safeStorage.setItem(key, JSON.stringify(updated));
      chatStore.setItem(key, updated).catch(() => {});
      return updated;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  getProfiles(): StyleProfile[] {
    try {
      const data = safeStorage.getItem(getKey('style_profiles_v1'));
      if (!data) return INITIAL_PROFILES;
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_PROFILES;
    } catch {
      return INITIAL_PROFILES;
    }
  },

  saveProfile(profile: StyleProfile): StyleProfile[] {
    try {
      const current = this.getProfiles();
      const updated = [profile, ...current.filter((p) => p.id !== profile.id)];
      const key = getKey('style_profiles_v1');
      const sliced = updated.slice(0, 16);
      safeStorage.setItem(key, JSON.stringify(sliced));
      chatStore.setItem(key, sliced).catch(() => {});
      return updated;
    } catch {
      return INITIAL_PROFILES;
    }
  },

  deleteProfile(id: string): StyleProfile[] {
    try {
      const current = this.getProfiles();
      const updated = current.filter((p) => p.id !== id);
      const finalList = updated.length > 0 ? updated : INITIAL_PROFILES;
      const key = getKey('style_profiles_v1');
      safeStorage.setItem(key, JSON.stringify(finalList));
      chatStore.setItem(key, finalList).catch(() => {});
      return finalList;
    } catch {
      return INITIAL_PROFILES;
    }
  },

  getSavedWeights(): StyleWeights {
    try {
      const data = safeStorage.getItem(getKey('style_weights_v1'));
      if (!data) return DEFAULT_STYLE_WEIGHTS;
      const parsed = JSON.parse(data);
      const sum = (parsed.humour || 0) + (parsed.charo || 0) + (parsed.romantique || 0) + (parsed.calculateur || 0);
      if (sum === 100) return parsed;
      return DEFAULT_STYLE_WEIGHTS;
    } catch {
      return DEFAULT_STYLE_WEIGHTS;
    }
  },

  saveWeights(weights: StyleWeights): void {
    try {
      const key = getKey('style_weights_v1');
      safeStorage.setItem(key, JSON.stringify(weights));
      chatStore.setItem(key, weights).catch(() => {});
    } catch (e) {
      console.error('Erreur de sauvegarde des poids:', e);
    }
  },

  getSavedIntensity(): number {
    try {
      const data = safeStorage.getItem(getKey('intensity_v1'));
      if (data === null) return 50;
      const num = Number(data);
      return isNaN(num) ? 50 : Math.max(1, Math.min(100, num));
    } catch {
      return 50;
    }
  },

  saveIntensity(intensity: number): void {
    try {
      const key = getKey('intensity_v1');
      safeStorage.setItem(key, String(intensity));
      chatStore.setItem(key, intensity).catch(() => {});
    } catch (e) {
      console.error('Erreur de sauvegarde de l\'intensité:', e);
    }
  },

  getPin(): string | null {
    try {
      return safeStorage.getItem(getKey('pin_lock_v1'));
    } catch {
      return null;
    }
  },

  setPin(pin: string | null): void {
    try {
      const key = getKey('pin_lock_v1');
      if (pin) {
        safeStorage.setItem(key, pin);
        chatStore.setItem(key, pin).catch(() => {});
      } else {
        safeStorage.removeItem(key);
        chatStore.removeItem(key).catch(() => {});
      }
    } catch (e) {
      console.error('Erreur de configuration du PIN:', e);
    }
  },

  exportBackup(): string {
    const backupData = {
      app: 'RIZZ_AI',
      version: '4.0',
      userId: currentUserId,
      edition: 'C4RL3NTZ',
      storageEngine: 'localforage+indexeddb',
      exportedAt: new Date().toISOString(),
      history: this.getHistory(),
      settings: this.getSettings(),
      profiles: this.getProfiles(),
      weights: this.getSavedWeights(),
      intensity: this.getSavedIntensity(),
    };
    return JSON.stringify(backupData, null, 2);
  },

  importBackup(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (!data || typeof data !== 'object') return false;

      if (Array.isArray(data.history)) {
        const histKey = getKey('conversations_v1');
        const trimmed = data.history.slice(0, 100);
        safeStorage.setItem(histKey, JSON.stringify(trimmed));
        chatStore.setItem(histKey, trimmed).catch(() => {});
      }
      if (data.settings && typeof data.settings === 'object') {
        const setKey = getKey('settings_v1');
        safeStorage.setItem(setKey, JSON.stringify(data.settings));
        chatStore.setItem(setKey, data.settings).catch(() => {});
      }
      if (Array.isArray(data.profiles) && data.profiles.length > 0) {
        const profKey = getKey('style_profiles_v1');
        safeStorage.setItem(profKey, JSON.stringify(data.profiles));
        chatStore.setItem(profKey, data.profiles).catch(() => {});
      }
      if (data.weights && typeof data.weights === 'object') {
        const wKey = getKey('style_weights_v1');
        safeStorage.setItem(wKey, JSON.stringify(data.weights));
        chatStore.setItem(wKey, data.weights).catch(() => {});
      }
      if (typeof data.intensity === 'number') {
        const intKey = getKey('intensity_v1');
        safeStorage.setItem(intKey, String(data.intensity));
        chatStore.setItem(intKey, data.intensity).catch(() => {});
      }
      return true;
    } catch (e) {
      console.error('Erreur lors de l\'importation de la sauvegarde:', e);
      return false;
    }
  },
};

// Initialiser automatiquement la synchronisation au chargement
if (typeof window !== 'undefined') {
  storageService.init().catch(() => {});
}
