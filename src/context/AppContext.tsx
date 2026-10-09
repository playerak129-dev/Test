import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  AnticipationDepth,
  AnticipationTree,
  AppSettings,
  ConversationAnalysis,
  ConversationRecord,
  ConversationTurn,
  ConversationalObjective,
  FlirtLevel,
  ImageItem,
  ResponseLength,
  ResponseOption,
  StructuredContext,
  StyleProfile,
  StyleType,
  StyleWeights,
  User,
  AuthSession,
} from '../types';
import { aiService } from '../services/aiService';
import { storageService } from '../services/storageService';
import { authService } from '../services/authService';
import { generateThemePalette, rebalanceStyles } from '../utils/styleBalancing';

export type ScreenType =
  | 'home'
  | 'analyze'
  | 'results'
  | 'style'
  | 'history'
  | 'settings'
  | 'anticipate'
  | 'quick'
  | 'auth';

interface AppContextValue {
  currentScreen: ScreenType;
  setCurrentScreen: (screen: ScreenType) => void;

  // Authentification Réelle & Compte C4RL3NTZ (Phase 4)
  isAuthenticated: boolean;
  currentUser: User | null;
  session: AuthSession | null;
  isAuthLoading: boolean;
  authError: string | null;
  isOfflineSession: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, confirmPassword?: string) => Promise<void>;
  logout: () => Promise<void>;
  changePassword: (oldPass: string, newPass: string) => Promise<void>;
  deleteAccount: (pass: string) => Promise<void>;
  syncWithCloud: () => Promise<void>;
  openAuth: () => void;

  // Réseau
  isOnline: boolean;

  // Paramètres & Thème
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  themePalette: ReturnType<typeof generateThemePalette>;

  // Styles, Intensité & Profils
  styleWeights: StyleWeights;
  setStyleWeight: (key: StyleType, value: number) => void;
  intensity: number;
  setIntensity: (val: number) => void;
  responseLength: ResponseLength;
  setResponseLength: (len: ResponseLength) => void;
  flirtLevel: FlirtLevel;
  setFlirtLevel: (lvl: FlirtLevel) => void;
  profiles: StyleProfile[];
  activeProfileId: string | null;
  applyProfile: (profile: StyleProfile) => void;
  saveCurrentAsProfile: (name: string) => void;
  deleteProfile: (id: string) => void;

  // Données d'analyse courante
  inputText: string;
  setInputText: (text: string) => void;
  inputContext: string;
  setInputContext: (ctx: string) => void;
  structuredContext: StructuredContext;
  setStructuredContext: (ctx: StructuredContext) => void;
  selectedImages: ImageItem[];
  addImages: (files: File[]) => Promise<void>;
  removeImage: (id: string) => void;
  clearImages: () => void;
  inputMode: 'text' | 'screenshot';
  setInputMode: (mode: 'text' | 'screenshot') => void;

  // Résultat en cours
  currentRecord: ConversationRecord | null;
  setCurrentRecord: (record: ConversationRecord | null) => void;
  isAnalyzing: boolean;
  analyzeError: string | null;
  setAnalyzeError: (err: string | null) => void;
  imageQualityWarning: string | null;

  // Actions Phase 1 & 2
  runAnalysis: () => Promise<void>;
  regenerateSingle: (style: StyleType) => Promise<void>;
  copyResponse: (text: string) => Promise<void>;

  // Moteur d'anticipation
  anticipationTree: AnticipationTree | null;
  setAnticipationTree: (tree: AnticipationTree | null) => void;
  isAnticipating: boolean;
  anticipationError: string | null;
  setAnticipationError: (err: string | null) => void;
  anticipationDepth: AnticipationDepth;
  setAnticipationDepth: (depth: AnticipationDepth) => void;
  anticipationObjective: ConversationalObjective;
  setAnticipationObjective: (obj: ConversationalObjective) => void;
  targetMoveForAnticipation: string;
  setTargetMoveForAnticipation: (m: string) => void;
  runAnticipation: (
    moveOverride?: string,
    depthOverride?: AnticipationDepth,
    objectiveOverride?: ConversationalObjective
  ) => Promise<void>;
  startAnticipationFromResponse: (responseText: string) => void;
  addTurnAndRecalculate: (actualResponseReceived: string) => Promise<void>;

  // Historique & Recherche
  history: ConversationRecord[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filteredHistory: ConversationRecord[];
  deleteConversation: (id: string) => void;
  clearAllHistory: () => void;
  openHistoryItem: (record: ConversationRecord) => void;

  // Onboarding (Phase 3)
  showOnboarding: boolean;
  completeOnboarding: () => void;
  openOnboarding: () => void;

  // Verrouillage PIN (Phase 3)
  isLocked: boolean;
  hasPin: boolean;
  unlockWithPin: (pin: string) => boolean;
  setAppPin: (pin: string | null) => void;

  // Confidentialité
  showPrivacyModal: boolean;
  setShowPrivacyModal: (v: boolean) => void;

  // Feedback Toast
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Authentification Réelle & Compte Utilisateur C4RL3NTZ (Phase 4)
  const [session, setSession] = useState<AuthSession | null>(() => {
    const s = authService.getLocalSession();
    if (s && s.user) {
      storageService.setActiveUser(s.user.id);
    }
    return s;
  });
  const [currentUser, setCurrentUser] = useState<User | null>(() => session?.user || null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isOfflineSession, setIsOfflineSession] = useState<boolean>(false);

  // Paramètres & Thème (scopés par utilisateur actif)
  const [settings, setSettings] = useState<AppSettings>(() => storageService.getSettings());
  const themePalette = generateThemePalette(settings.accentColor);

  // Styles, Intensité, Longueur & Niveau de Flirt
  const [styleWeights, setStyleWeightsState] = useState<StyleWeights>(() => storageService.getSavedWeights());
  const [intensity, setIntensityState] = useState<number>(() => storageService.getSavedIntensity());
  const [responseLength, setResponseLengthState] = useState<ResponseLength>(() => settings.responseLength || 'normale');
  const [flirtLevel, setFlirtLevelState] = useState<FlirtLevel>(() => settings.flirtLevel || 'normal');

  // Profils de Style
  const [profiles, setProfiles] = useState<StyleProfile[]>(() => storageService.getProfiles());
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);

  // Saisie
  const [inputMode, setInputMode] = useState<'text' | 'screenshot'>('text');
  const [inputText, setInputText] = useState<string>('');
  const [inputContext, setInputContext] = useState<string>('');
  const [structuredContext, setStructuredContext] = useState<StructuredContext>({});
  const [selectedImages, setSelectedImages] = useState<ImageItem[]>([]);

  // Résultat d'analyse
  const [currentRecord, setCurrentRecord] = useState<ConversationRecord | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [imageQualityWarning, setImageQualityWarning] = useState<string | null>(null);

  // Anticipation
  const [anticipationTree, setAnticipationTree] = useState<AnticipationTree | null>(null);
  const [isAnticipating, setIsAnticipating] = useState<boolean>(false);
  const [anticipationError, setAnticipationError] = useState<string | null>(null);
  const [anticipationDepth, setAnticipationDepth] = useState<AnticipationDepth>(() => settings.defaultDepth || 2);
  const [anticipationObjective, setAnticipationObjective] = useState<ConversationalObjective>('continuer');
  const [targetMoveForAnticipation, setTargetMoveForAnticipation] = useState<string>('');

  // Historique & Recherche
  const [history, setHistory] = useState<ConversationRecord[]>(() => storageService.getHistory());
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Onboarding
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => !settings.onboardingCompleted);

  // Verrouillage PIN
  const [savedPin, setSavedPin] = useState<string | null>(() => storageService.getPin());
  const [isLocked, setIsLocked] = useState<boolean>(() => Boolean(storageService.getPin()));

  // Confidentialité modal
  const [showPrivacyModal, setShowPrivacyModal] = useState<boolean>(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Hydratation asynchrone depuis localforage (IndexedDB)
  useEffect(() => {
    storageService.syncFromLocalForage().then(() => {
      setHistory(storageService.getHistory());
      setProfiles(storageService.getProfiles());
      setSettings(storageService.getSettings());
    }).catch(() => {});
  }, [currentUser?.id]);

  // Détection connexion
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast('De retour en ligne — Données locales synchronisées');
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast('Mode hors ligne actif — Cache local & moteur autonome prêts');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Application du thème au DOM
  useEffect(() => {
    const root = document.documentElement;
    const isDark =
      settings.appearance === 'dark' ||
      (settings.appearance === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    root.style.setProperty('--accent-color', settings.accentColor);
    root.style.setProperty('--accent-rgb', themePalette.rgb);
  }, [settings.appearance, settings.accentColor, themePalette.rgb]);

  // Synchronisation et validation de session en arrière-plan (Phase 4)
  useEffect(() => {
    if (!session || !session.token) {
      setIsOfflineSession(false);
      return;
    }

    if (navigator.onLine) {
      authService
        .getMe(session.token)
        .then((freshUser) => {
          setCurrentUser(freshUser);
          setIsOfflineSession(false);
        })
        .catch((err) => {
          // Si token explicitement invalidé ou compte supprimé côté serveur
          if (err?.message?.includes('invalide') || err?.message?.includes('expirée')) {
            authService.clearLocalSession();
            setSession(null);
            setCurrentUser(null);
            storageService.setActiveUser(null);
            showToast('Session expirée, veuillez vous reconnecter');
          } else {
            // Serveur temporairement indisponible ou réseau instable : préserver la session hors ligne locale
            setIsOfflineSession(true);
          }
        });
    } else {
      setIsOfflineSession(true);
    }
  }, [session?.token]);

  // Réinitialise les états locaux en fonction de l'utilisateur actif
  const refreshUserContext = (userId: string | null) => {
    storageService.setActiveUser(userId);
    setHistory(storageService.getHistory());
    const newSettings = storageService.getSettings();
    setSettings(newSettings);
    setProfiles(storageService.getProfiles());
    setStyleWeightsState(storageService.getSavedWeights());
    setIntensityState(storageService.getSavedIntensity());
    const pin = storageService.getPin();
    setSavedPin(pin);
    setIsLocked(Boolean(pin));
  };

  const login = async (email: string, pass: string) => {
    setIsAuthLoading(true);
    setAuthError(null);
    try {
      const sess = await authService.login(email, pass);
      setSession(sess);
      setCurrentUser(sess.user);
      setIsOfflineSession(false);
      storageService.migrateGuestDataToUser(sess.user.id);
      refreshUserContext(sess.user.id);
      setCurrentScreen('home');
    } catch (err: any) {
      setAuthError(err?.message || 'Identifiants invalides.');
      throw err;
    } finally {
      setIsAuthLoading(false);
    }
  };

  const register = async (email: string, pass: string, confirmPass?: string) => {
    setIsAuthLoading(true);
    setAuthError(null);
    try {
      const sess = await authService.register(email, pass, confirmPass);
      setSession(sess);
      setCurrentUser(sess.user);
      setIsOfflineSession(false);
      storageService.migrateGuestDataToUser(sess.user.id);
      refreshUserContext(sess.user.id);
      setCurrentScreen('home');
    } catch (err: any) {
      setAuthError(err?.message || 'Erreur lors de l\'inscription.');
      throw err;
    } finally {
      setIsAuthLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (session?.token) {
        await authService.logout(session.token);
      }
    } catch {
      // ignore
    } finally {
      setSession(null);
      setCurrentUser(null);
      setIsOfflineSession(false);
      refreshUserContext(null);
      setCurrentScreen('auth');
      showToast('Déconnexion réussie');
    }
  };

  const changePassword = async (oldPass: string, newPass: string) => {
    if (!session?.token) throw new Error('Veuillez vous connecter.');
    await authService.changePassword(session.token, oldPass, newPass);
    showToast('Mot de passe mis à jour');
  };

  const deleteAccount = async (pass: string) => {
    if (!session?.token) throw new Error('Veuillez vous connecter.');
    await authService.deleteAccount(session.token, pass);
    storageService.clearAllHistory();
    setSession(null);
    setCurrentUser(null);
    setIsOfflineSession(false);
    refreshUserContext(null);
    setCurrentScreen('home');
    showToast('Compte définitivement supprimé');
  };

  const syncWithCloud = async () => {
    if (!session?.token) throw new Error('Veuillez vous connecter pour synchroniser.');
    const backupJson = storageService.exportBackup();
    await authService.syncWithCloud(session.token, JSON.parse(backupJson));
    showToast('Données synchronisées dans le Cloud C4RL3NTZ');
  };

  const openAuth = () => {
    setCurrentScreen('auth');
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    const updated = storageService.saveSettings(newSettings);
    setSettings(updated);
  };

  const setStyleWeight = (key: StyleType, value: number) => {
    const balanced = rebalanceStyles(styleWeights, key, value);
    setStyleWeightsState(balanced);
    storageService.saveWeights(balanced);
    setActiveProfileId(null);
  };

  const setIntensity = (val: number) => {
    const clamped = Math.max(1, Math.min(100, Math.round(val)));
    setIntensityState(clamped);
    storageService.saveIntensity(clamped);
  };

  const setResponseLength = (len: ResponseLength) => {
    setResponseLengthState(len);
    updateSettings({ responseLength: len });
  };

  const setFlirtLevel = (lvl: FlirtLevel) => {
    setFlirtLevelState(lvl);
    updateSettings({ flirtLevel: lvl });
  };

  // Profils
  const applyProfile = (profile: StyleProfile) => {
    setStyleWeightsState(profile.styleWeights);
    storageService.saveWeights(profile.styleWeights);
    setIntensityState(profile.intensity);
    storageService.saveIntensity(profile.intensity);
    setResponseLengthState(profile.responseLength);
    setFlirtLevelState(profile.flirtLevel);
    setActiveProfileId(profile.id);
    showToast(`Profil « ${profile.name} » appliqué`);
  };

  const saveCurrentAsProfile = (name: string) => {
    if (!name.trim()) return;
    const newProfile: StyleProfile = {
      id: `profile_${Date.now()}`,
      name: name.trim(),
      styleWeights: { ...styleWeights },
      intensity,
      responseLength,
      flirtLevel,
    };
    const updated = storageService.saveProfile(newProfile);
    setProfiles(updated);
    setActiveProfileId(newProfile.id);
    showToast(`Profil « ${name.trim()} » enregistré`);
  };

  const deleteProfile = (id: string) => {
    const updated = storageService.deleteProfile(id);
    setProfiles(updated);
    if (activeProfileId === id) setActiveProfileId(null);
    showToast('Profil supprimé');
  };

  // Images multiples
  const addImages = async (files: File[]) => {
    const imageFiles = files.filter((f) => f.type.startsWith('image/'));
    if (imageFiles.length === 0) return;

    const newItems: ImageItem[] = [];
    for (const file of imageFiles) {
      await new Promise<void>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          newItems.push({
            id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            previewUrl: result,
            base64: result,
            mimeType: file.type || 'image/jpeg',
            name: file.name,
          });
          resolve();
        };
        reader.readAsDataURL(file);
      });
    }

    setSelectedImages((prev) => [...prev, ...newItems].slice(0, 5));
    setAnalyzeError(null);
  };

  const removeImage = (id: string) => {
    setSelectedImages((prev) => prev.filter((img) => img.id !== id));
  };

  const clearImages = () => {
    setSelectedImages([]);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2400);
  };

  const copyResponse = async (text: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      showToast('Copié');
    } catch {
      showToast('Erreur de copie');
    }
  };

  // Onboarding
  const completeOnboarding = () => {
    setShowOnboarding(false);
    updateSettings({ onboardingCompleted: true });
  };

  const openOnboarding = () => {
    setShowOnboarding(true);
  };

  // PIN lock
  const unlockWithPin = (pin: string): boolean => {
    if (!savedPin || pin === savedPin) {
      setIsLocked(false);
      showToast('Déverrouillé');
      return true;
    }
    showToast('Code PIN incorrect');
    return false;
  };

  const setAppPin = (pin: string | null) => {
    storageService.setPin(pin);
    setSavedPin(pin);
    updateSettings({ lockPin: pin });
    if (!pin) {
      setIsLocked(false);
      showToast('Verrouillage désactivé');
    } else {
      showToast('Code PIN configuré');
    }
  };

  // Analyse
  const runAnalysis = async () => {
    if (!isOnline) {
      showToast('Mode Hors Ligne : Analyse par le moteur heuristique autonome');
    }

    if (inputMode === 'text' && !inputText.trim()) {
      setAnalyzeError('Veuillez saisir le message ou ce que l\'autre personne vous a dit.');
      return;
    }

    if (inputMode === 'screenshot' && selectedImages.length === 0) {
      setAnalyzeError('Veuillez sélectionner au moins une capture d\'écran de conversation.');
      return;
    }

    setIsAnalyzing(true);
    setAnalyzeError(null);
    setImageQualityWarning(null);

    try {
      const result = await aiService.analyzeConversation({
        text: inputMode === 'text' ? inputText : undefined,
        images: inputMode === 'screenshot' ? selectedImages : undefined,
        context: inputContext.trim() || undefined,
        structuredContext,
        styleWeights,
        intensity,
        responseLength,
        flirtLevel,
      });

      if (result.imageQualityNote) {
        setImageQualityWarning(result.imageQualityNote);
      }

      const rawPreview =
        inputMode === 'text'
          ? inputText
          : selectedImages[0]?.name || 'Capture de conversation';

      const autoTitle =
        rawPreview.length > 28 ? rawPreview.slice(0, 28) + '…' : rawPreview;

      const newRecord: ConversationRecord = {
        id: `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        title: autoTitle,
        timestamp: Date.now(),
        inputMethod: inputMode,
        inputContent: inputMode === 'text' ? inputText : selectedImages[0]?.previewUrl || 'Capture',
        context: inputContext.trim() || undefined,
        structuredContext,
        images: inputMode === 'screenshot' ? [...selectedImages] : undefined,
        analysis: result.analysis,
        responses: result.responses,
        styleWeights: { ...styleWeights },
        intensity,
        responseLength,
        flirtLevel,
        turns: [
          {
            id: `turn_1_${Date.now()}`,
            timestamp: Date.now(),
            userSentMessage: result.responses[0]?.text || '',
            otherReceivedMessage: result.analysis.transcription || (inputMode === 'text' ? inputText : 'Capture'),
          },
        ],
      };

      storageService.saveConversation(newRecord);
      setHistory(storageService.getHistory());
      setCurrentRecord(newRecord);
      setTargetMoveForAnticipation(result.responses[0]?.text || '');
      setCurrentScreen('results');
    } catch (err: any) {
      console.error('Erreur analyse:', err);
      setAnalyzeError(err.message || 'Impossible d\'analyser la conversation. Veuillez vérifier votre connexion.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const regenerateSingle = async (style: StyleType) => {
    if (!currentRecord) return;
    if (!isOnline) {
      showToast('Régénération autonome hors ligne');
    }

    setCurrentRecord((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        responses: prev.responses.map((r) => (r.style === style ? { ...r, isRegenerating: true } : r)),
      };
    });

    try {
      const targetExisting = currentRecord.responses.find((r) => r.style === style)?.text || '';
      const conversationText =
        currentRecord.analysis.transcription || currentRecord.inputContent || currentRecord.context || '';

      const newText = await aiService.regenerateResponse({
        conversationText,
        context: currentRecord.context,
        style,
        styleWeights: currentRecord.styleWeights,
        intensity: currentRecord.intensity,
        existingText: targetExisting,
      });

      setCurrentRecord((prev) => {
        if (!prev) return null;
        const updatedResponses = prev.responses.map((r) =>
          r.style === style ? { ...r, text: newText, isRegenerating: false } : r
        );
        const updatedRecord = { ...prev, responses: updatedResponses };
        storageService.saveConversation(updatedRecord);
        setHistory(storageService.getHistory());
        return updatedRecord;
      });

      showToast(`Réponse ${style.toUpperCase()} régénérée`);
    } catch {
      showToast('Échec de la régénération');
      setCurrentRecord((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          responses: prev.responses.map((r) => (r.style === style ? { ...r, isRegenerating: false } : r)),
        };
      });
    }
  };

  // Anticipation
  const runAnticipation = async (
    moveOverride?: string,
    depthOverride?: AnticipationDepth,
    objectiveOverride?: ConversationalObjective
  ) => {
    if (!isOnline) {
      showToast('Calcul d\'anticipation autonome hors ligne');
    }

    const move =
      moveOverride ||
      targetMoveForAnticipation ||
      currentRecord?.responses[0]?.text ||
      currentRecord?.analysis.transcription ||
      currentRecord?.inputContent ||
      inputText;

    if (!move.trim()) {
      setAnticipationError('Veuillez spécifier le message ou coup à anticiper.');
      return;
    }

    const depthToUse = depthOverride || anticipationDepth;
    const objectiveToUse = objectiveOverride || anticipationObjective;

    setIsAnticipating(true);
    setAnticipationError(null);

    try {
      const conversationContext =
        currentRecord?.analysis.transcription || currentRecord?.inputContent || inputText;

      const tree = await aiService.anticipateConversation({
        conversation: conversationContext,
        currentMove: move,
        context: currentRecord?.context || inputContext,
        styleWeights,
        intensity,
        depth: depthToUse,
        objective: objectiveToUse,
        turns: currentRecord?.turns || [],
      });

      setAnticipationTree(tree);
      setTargetMoveForAnticipation(move);

      if (currentRecord) {
        const updatedRecord: ConversationRecord = {
          ...currentRecord,
          anticipationTree: tree,
        };
        setCurrentRecord(updatedRecord);
        storageService.saveConversation(updatedRecord);
        setHistory(storageService.getHistory());
      }
    } catch (err: any) {
      console.error('Erreur anticipation:', err);
      setAnticipationError(err.message || 'Impossible de calculer les scénarios d\'anticipation.');
    } finally {
      setIsAnticipating(false);
    }
  };

  const startAnticipationFromResponse = (responseText: string) => {
    setTargetMoveForAnticipation(responseText);
    setCurrentScreen('anticipate');
    runAnticipation(responseText);
  };

  const addTurnAndRecalculate = async (actualResponseReceived: string) => {
    if (!actualResponseReceived.trim()) return;
    if (!isOnline) {
      showToast('Recalcul autonome hors ligne');
    }

    setIsAnticipating(true);
    setAnticipationError(null);

    try {
      const currentMovePlayed = targetMoveForAnticipation || currentRecord?.responses[0]?.text || 'Coup précédent';
      const newTurn: ConversationTurn = {
        id: `turn_${Date.now()}`,
        timestamp: Date.now(),
        userSentMessage: currentMovePlayed,
        otherReceivedMessage: actualResponseReceived,
      };

      const updatedTurns = [...(currentRecord?.turns || []), newTurn];

      const conversationContext = `${currentRecord?.analysis.transcription || currentRecord?.inputContent || ''}\nLui/Elle : "${actualResponseReceived}"`;

      const updatedTree = await aiService.anticipateConversation({
        conversation: conversationContext,
        currentMove: actualResponseReceived,
        context: currentRecord?.context || inputContext,
        styleWeights,
        intensity,
        depth: anticipationDepth,
        objective: anticipationObjective,
        turns: updatedTurns,
        realResponse: actualResponseReceived,
      });

      setAnticipationTree(updatedTree);
      setTargetMoveForAnticipation(actualResponseReceived);

      if (currentRecord) {
        const updatedRecord: ConversationRecord = {
          ...currentRecord,
          turns: updatedTurns,
          anticipationTree: updatedTree,
        };
        setCurrentRecord(updatedRecord);
        storageService.saveConversation(updatedRecord);
        setHistory(storageService.getHistory());
      }

      showToast('Échiquier recalculé avec succès');
    } catch (err: any) {
      setAnticipationError(err.message || 'Échec du recalcul après réponse réelle.');
    } finally {
      setIsAnticipating(false);
    }
  };

  // Historique & Recherche
  const filteredHistory = storageService.searchHistory(searchQuery);

  const deleteConversation = (id: string) => {
    storageService.deleteConversation(id);
    setHistory(storageService.getHistory());
    if (currentRecord?.id === id) {
      setCurrentRecord(null);
      setAnticipationTree(null);
      if (currentScreen === 'results' || currentScreen === 'anticipate') {
        setCurrentScreen('home');
      }
    }
    showToast('Conversation supprimée');
  };

  const clearAllHistory = () => {
    storageService.clearAllHistory();
    setHistory([]);
    setCurrentRecord(null);
    setAnticipationTree(null);
    showToast('Historique effacé');
  };

  const openHistoryItem = (record: ConversationRecord) => {
    if (isLocked) {
      showToast('Veuillez déverrouiller l\'historique avec votre PIN');
      return;
    }
    setCurrentRecord(record);
    if (record.anticipationTree) {
      setAnticipationTree(record.anticipationTree);
      setTargetMoveForAnticipation(record.anticipationTree.currentMove);
    } else {
      setAnticipationTree(null);
      setTargetMoveForAnticipation(record.responses[0]?.text || '');
    }
    setCurrentScreen('results');
  };

  return (
    <AppContext.Provider
      value={{
        currentScreen,
        setCurrentScreen,
        isOnline,
        settings,
        updateSettings,
        themePalette,
        styleWeights,
        setStyleWeight,
        intensity,
        setIntensity,
        responseLength,
        setResponseLength,
        flirtLevel,
        setFlirtLevel,
        profiles,
        activeProfileId,
        applyProfile,
        saveCurrentAsProfile,
        deleteProfile,
        inputText,
        setInputText,
        inputContext,
        setInputContext,
        structuredContext,
        setStructuredContext,
        selectedImages,
        addImages,
        removeImage,
        clearImages,
        inputMode,
        setInputMode,
        currentRecord,
        setCurrentRecord,
        isAnalyzing,
        analyzeError,
        setAnalyzeError,
        imageQualityWarning,
        runAnalysis,
        regenerateSingle,
        copyResponse,
        anticipationTree,
        setAnticipationTree,
        isAnticipating,
        anticipationError,
        setAnticipationError,
        anticipationDepth,
        setAnticipationDepth,
        anticipationObjective,
        setAnticipationObjective,
        targetMoveForAnticipation,
        setTargetMoveForAnticipation,
        runAnticipation,
        startAnticipationFromResponse,
        addTurnAndRecalculate,
        history,
        searchQuery,
        setSearchQuery,
        filteredHistory,
        deleteConversation,
        clearAllHistory,
        openHistoryItem,
        showOnboarding,
        completeOnboarding,
        openOnboarding,
        isLocked,
        hasPin: Boolean(savedPin),
        unlockWithPin,
        setAppPin,
        showPrivacyModal,
        setShowPrivacyModal,
        toastMessage,
        showToast,
        // Authentification Réelle & Compte Utilisateur C4RL3NTZ (Phase 4)
        isAuthenticated: Boolean(currentUser && session?.token),
        currentUser,
        session,
        isAuthLoading,
        authError,
        isOfflineSession,
        login,
        register,
        logout,
        changePassword,
        deleteAccount,
        syncWithCloud,
        openAuth,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp doit être utilisé au sein de AppProvider');
  }
  return context;
};
