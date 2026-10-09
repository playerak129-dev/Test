import React, { useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { AppearanceMode, AnticipationDepth, StyleType } from '../types';
import {
  Sun,
  Moon,
  Laptop,
  Palette,
  Sparkles,
  Sliders,
  ShieldCheck,
  Trash2,
  CheckCircle2,
  PlayCircle,
  HelpCircle,
  Zap,
  Lock,
  KeyRound,
  Download,
  Upload,
  Info,
  BookOpen,
  User,
  LogOut,
  Cloud,
  ShieldAlert,
  Database,
} from 'lucide-react';
import { runAllPhase2Tests } from '../utils/anticipation.test';
import { storageService } from '../services/storageService';
import { triggerHaptic } from '../utils/haptics';
import { PWAInstallButton } from '../components/PWAInstallButton';

export const SettingsScreen: React.FC = () => {
  const {
    settings,
    updateSettings,
    themePalette,
    clearAllHistory,
    history,
    showToast,
    setCurrentScreen,
    isOnline,
    hasPin,
    setAppPin,
    setShowPrivacyModal,
    openOnboarding,
    currentUser,
    isAuthenticated,
    isOfflineSession,
    logout,
    changePassword,
    deleteAccount,
    syncWithCloud,
    openAuth,
  } = useApp();

  const [testResults, setTestResults] = useState<{
    ran: boolean;
    tests: { id: string; name: string; passed: boolean; details: string }[];
  } | null>(null);

  const [isEditingPin, setIsEditingPin] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modales Compte & Sécurité
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassInput, setDeletePassInput] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Palettes suggérées
  const presetColors = [
    { name: 'Bleu Royal (Défaut)', hex: '#007AFF' },
    { name: 'Rouge Rubis', hex: '#FF3B30' },
    { name: 'Violet Orchidée', hex: '#AF52DE' },
    { name: 'Vert Émeraude', hex: '#34C759' },
    { name: 'Rose Bonbon', hex: '#FF2D55' },
    { name: 'Orange Sunset', hex: '#FF9500' },
    { name: 'Cyan Lagon', hex: '#00C7BE' },
    { name: 'Graphite Minimal', hex: '#3A3A3C' },
  ];

  // Sauvegarde & Export
  const handleExportData = () => {
    triggerHaptic('medium');
    const jsonStr = storageService.exportBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rizz_ai_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Sauvegarde exportée (JSON)');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    triggerHaptic('light');
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = storageService.importBackup(content);
      if (success) {
        triggerHaptic('success');
        showToast('Données importées avec succès');
        setTimeout(() => window.location.reload(), 800);
      } else {
        triggerHaptic('warning');
        showToast('Fichier de sauvegarde invalide');
      }
    };
    reader.readAsText(file);
  };

  const handleSavePin = () => {
    if (pinInput.length === 4 && /^\d{4}$/.test(pinInput)) {
      triggerHaptic('success');
      setAppPin(pinInput);
      setIsEditingPin(false);
      setPinInput('');
      showToast('Code PIN configuré avec succès');
    } else {
      triggerHaptic('warning');
      showToast('Le code PIN doit comporter 4 chiffres');
    }
  };

  const handleRemovePin = () => {
    triggerHaptic('medium');
    setAppPin(null);
    showToast('Code PIN désactivé');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    if (!oldPassword || !newPassword || newPassword.length < 6) {
      setPasswordError('Le nouveau mot de passe doit comporter au moins 6 caractères.');
      triggerHaptic('warning');
      return;
    }
    try {
      await changePassword(oldPassword, newPassword);
      setShowChangePasswordModal(false);
      setOldPassword('');
      setNewPassword('');
      triggerHaptic('success');
    } catch (err: any) {
      setPasswordError(err?.message || 'Erreur lors de la modification.');
      triggerHaptic('warning');
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError(null);
    if (!deletePassInput) {
      setDeleteError('Veuillez saisir votre mot de passe pour confirmer.');
      triggerHaptic('warning');
      return;
    }
    try {
      await deleteAccount(deletePassInput);
      setShowDeleteModal(false);
      setDeletePassInput('');
      triggerHaptic('success');
    } catch (err: any) {
      setDeleteError(err?.message || 'Erreur lors de la suppression.');
      triggerHaptic('warning');
    }
  };

  // Exécution de la suite de tests requise en Section 23 & 24 (Phase 1, 2, 3 & 4)
  const runValidationTestSuite = () => {
    triggerHaptic('medium');
    const tests = runAllPhase2Tests();
    setTestResults({ ran: true, tests });
    showToast('Tests de conformité Phase 1, 2, 3 & 4 exécutés');
  };

  return (
    <div className="space-y-6 pb-28 pt-2">
      {/* 0. Compte Utilisateur & Session Réelle (Phase 4) */}
      <section className="ios-card p-5 rounded-3xl border border-black/5 dark:border-white/5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-2.5">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-neutral-500" />
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-neutral-900 dark:text-white">
              Compte & Session
            </h2>
          </div>
          <span
            className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
              isAuthenticated
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
            }`}
          >
            {isAuthenticated ? 'CONNECTÉ' : 'MODE INVITÉ'}
          </span>
        </div>

        {isAuthenticated && currentUser ? (
          <div className="space-y-3.5">
            {/* Carte Profil */}
            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-neutral-100/70 dark:bg-neutral-800/60">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-black text-white shadow-sm shrink-0"
                style={{ backgroundColor: themePalette.primary }}
              >
                {currentUser.email.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                  {currentUser.email}
                </div>
                <div className="text-[10px] text-neutral-500 flex items-center gap-2">
                  <span>Inscrit le {new Date(currentUser.createdAt).toLocaleDateString('fr-FR')}</span>
                  <span>•</span>
                  <span className="font-mono text-neutral-400">ID: {currentUser.id.slice(0, 10)}…</span>
                </div>
              </div>
            </div>

            {/* État de synchronisation et de session */}
            <div className="flex items-center justify-between text-xs px-1">
              <span className="text-neutral-500">Statut de session :</span>
              <span
                className={`font-semibold ${
                  isOfflineSession
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {isOfflineSession ? 'Hors ligne (Session locale)' : 'Cloud Connecté (En ligne)'}
              </span>
            </div>

            {/* Actions Compte */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => {
                  triggerHaptic('light');
                  syncWithCloud().catch((e) => showToast(e.message));
                }}
                className="py-2.5 px-3 rounded-xl text-xs font-bold bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <Cloud className="w-3.5 h-3.5 text-blue-500" />
                <span>Synchroniser Cloud</span>
              </button>

              <button
                onClick={() => {
                  triggerHaptic('light');
                  setShowChangePasswordModal(true);
                }}
                className="py-2.5 px-3 rounded-xl text-xs font-bold bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5 text-neutral-500" />
                <span>Mot de passe</span>
              </button>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-black/5 dark:border-white/5">
              <button
                onClick={() => {
                  triggerHaptic('medium');
                  setShowLogoutModal(true);
                }}
                className="text-xs font-bold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1.5 py-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Se déconnecter</span>
              </button>

              <button
                onClick={() => {
                  triggerHaptic('warning');
                  setShowDeleteModal(true);
                }}
                className="text-xs font-bold text-rose-500 hover:text-rose-600 py-1"
              >
                Supprimer le compte
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Connectez-vous pour isoler vos conversations sous votre propre identifiant et synchroniser vos échiquiers en toute sécurité.
            </p>
            <button
              onClick={() => {
                triggerHaptic('medium');
                openAuth();
              }}
              className="w-full py-3 px-4 rounded-2xl text-xs font-extrabold text-white shadow-sm active:scale-98 transition-all flex items-center justify-center gap-2"
              style={{ backgroundColor: themePalette.primary }}
            >
              <User className="w-4 h-4" />
              <span>SE CONNECTER / CRÉER UN COMPTE</span>
            </button>
          </div>
        )}
      </section>

      {/* 1. Apparence */}
      <section className="ios-card p-5 rounded-3xl border border-black/5 dark:border-white/5 space-y-3">
        <div className="flex items-center gap-2 border-b border-black/5 dark:border-white/5 pb-2.5">
          <Palette className="w-4 h-4 text-neutral-500" />
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-neutral-900 dark:text-white">
            Apparence
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { mode: 'light' as AppearanceMode, label: 'Clair', icon: Sun },
            { mode: 'dark' as AppearanceMode, label: 'Sombre', icon: Moon },
            { mode: 'auto' as AppearanceMode, label: 'Auto', icon: Laptop },
          ].map((item) => {
            const isSelected = settings.appearance === item.mode;
            const Icon = item.icon;

            return (
              <button
                key={item.mode}
                onClick={() => updateSettings({ appearance: item.mode })}
                className={`py-3 px-2 rounded-2xl text-xs font-bold flex flex-col items-center gap-1.5 transition-all active:scale-95 ${
                  isSelected
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-md'
                    : 'bg-neutral-100/70 dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. Couleur d'accent & Dégradé */}
      <section className="ios-card p-5 rounded-3xl border border-black/5 dark:border-white/5 space-y-4">
        <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-2.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-neutral-500" />
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-neutral-900 dark:text-white">
              Couleur d'accent
            </h2>
          </div>
          <span className="text-[11px] font-mono text-neutral-400 uppercase">
            {settings.accentColor}
          </span>
        </div>

        {/* Nuancier de palettes cohérentes */}
        <div className="grid grid-cols-4 gap-2.5">
          {presetColors.map((color) => {
            const isSelected = settings.accentColor.toLowerCase() === color.hex.toLowerCase();
            return (
              <button
                key={color.hex}
                onClick={() => updateSettings({ accentColor: color.hex })}
                className="group relative flex flex-col items-center gap-1 p-2 rounded-2xl hover:bg-neutral-100 dark:hover:bg-neutral-800/50 transition-all active:scale-95"
              >
                <div
                  className={`w-9 h-9 rounded-full shadow-sm flex items-center justify-center transition-transform group-hover:scale-105 ${
                    isSelected ? 'ring-2 ring-offset-2 ring-neutral-900 dark:ring-white' : ''
                  }`}
                  style={{ backgroundColor: color.hex }}
                >
                  {isSelected && <span className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <span className="text-[10px] text-neutral-500 truncate max-w-[64px] text-center">
                  {color.name.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Sélecteur personnalisé libre */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-neutral-100/70 dark:bg-neutral-800/60">
          <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
            Couleur personnalisée (Hex)
          </span>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={settings.accentColor}
              onChange={(e) => updateSettings({ accentColor: e.target.value })}
              className="w-8 h-8 rounded-full cursor-pointer bg-transparent border-0 p-0"
            />
          </div>
        </div>

        {/* Dégradé animé : ON / OFF */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-neutral-100/70 dark:bg-neutral-800/60">
          <div>
            <div className="text-xs font-bold text-neutral-900 dark:text-white">
              Dégradé animé dynamique
            </div>
            <div className="text-[11px] text-neutral-500">
              Animation fluide et subtile iOS 26 (non distrayante)
            </div>
          </div>
          <button
            type="button"
            onClick={() => updateSettings({ animatedGradient: !settings.animatedGradient })}
            className={`w-12 h-7 rounded-full transition-colors relative p-0.5 ${
              settings.animatedGradient ? 'bg-emerald-500' : 'bg-neutral-300 dark:bg-neutral-700'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full bg-white shadow-sm transition-transform ${
                settings.animatedGradient ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </section>

      {/* 3. Style & Intensité par défaut */}
      <section className="ios-card p-5 rounded-3xl border border-black/5 dark:border-white/5 space-y-4">
        <div className="flex items-center gap-2 border-b border-black/5 dark:border-white/5 pb-2.5">
          <Sliders className="w-4 h-4 text-neutral-500" />
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-neutral-900 dark:text-white">
            Préférences par défaut
          </h2>
        </div>

        {/* Style par défaut */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            Style par défaut
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: 'humour' as StyleType, label: 'Humour' },
              { key: 'charo' as StyleType, label: 'Charo' },
              { key: 'romantique' as StyleType, label: 'Romantique' },
              { key: 'calculateur' as StyleType, label: 'Calculateur' },
            ].map((s) => (
              <button
                key={s.key}
                onClick={() => updateSettings({ defaultStyle: s.key })}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all text-left flex items-center justify-between ${
                  settings.defaultStyle === s.key
                    ? 'text-white'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                }`}
                style={{
                  backgroundColor: settings.defaultStyle === s.key ? themePalette.primary : undefined,
                }}
              >
                <span>{s.label}</span>
                {settings.defaultStyle === s.key && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
              </button>
            ))}
          </div>
        </div>

        {/* Intensité par défaut */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-neutral-700 dark:text-neutral-300">Intensité par défaut</span>
            <span className="text-neutral-900 dark:text-white font-black">
              {settings.defaultIntensity} / 100
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="100"
            value={settings.defaultIntensity}
            onChange={(e) => updateSettings({ defaultIntensity: Number(e.target.value) })}
            className="w-full h-2 rounded-lg bg-neutral-200 dark:bg-neutral-700 appearance-none cursor-pointer"
          />
        </div>

        {/* Profondeur d'anticipation par défaut */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-neutral-700 dark:text-neutral-300">Profondeur d'anticipation par défaut</span>
            <span className="text-neutral-900 dark:text-white font-black">
              {settings.defaultDepth || 2} {(settings.defaultDepth || 2) > 1 ? 'coups' : 'coup'}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1.5 p-1 rounded-2xl bg-neutral-100 dark:bg-neutral-800">
            {([1, 2, 3, 4] as AnticipationDepth[]).map((d) => (
              <button
                key={d}
                onClick={() => updateSettings({ defaultDepth: d })}
                className={`py-1.5 rounded-xl text-xs font-bold transition-all ${
                  (settings.defaultDepth || 2) === d
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {d} {d > 1 ? 'coups' : 'coup'}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Gestion de l'historique */}
      <section className="ios-card p-5 rounded-3xl border border-black/5 dark:border-white/5 space-y-3">
        <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-2.5">
          <div className="flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-neutral-500" />
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-neutral-900 dark:text-white">
              Historique local ({history.length})
            </h2>
          </div>
          <button
            onClick={() => setCurrentScreen('history')}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Gérer
          </button>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs text-neutral-500 max-w-[220px]">
            Toutes les analyses et arbres d'anticipation sont conservés uniquement sur cet appareil.
          </p>
          <button
            onClick={clearAllHistory}
            disabled={history.length === 0}
            className="px-3 py-2 rounded-xl text-xs font-bold text-rose-600 bg-rose-500/10 hover:bg-rose-500/20 active:scale-95 transition-all disabled:opacity-40"
          >
            Effacer tout
          </button>
        </div>
      </section>

      {/* 5. Sécurité & Verrouillage PIN (Phase 3) */}
      <section className="ios-card p-5 rounded-3xl border border-black/5 dark:border-white/5 space-y-4">
        <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-2.5">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-neutral-500" />
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-neutral-900 dark:text-white">
              Sécurité & Code PIN
            </h2>
          </div>
          <span
            className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
              hasPin
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-500'
            }`}
          >
            {hasPin ? 'PIN ACTIF' : 'DÉSACTIVÉ'}
          </span>
        </div>

        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Protégez vos conversations, captures et échiquiers des regards indiscrets avec un code PIN à 4 chiffres.
        </p>

        {isEditingPin ? (
          <div className="p-3.5 rounded-2xl bg-neutral-100/80 dark:bg-neutral-800/80 space-y-3">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">
              Entrez votre code à 4 chiffres :
            </label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              pattern="\d*"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
              placeholder="••••"
              className="w-full text-center tracking-[1em] text-2xl font-bold py-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 focus:outline-none"
            />
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleSavePin}
                className="flex-1 py-2 rounded-xl text-xs font-bold text-white shadow-xs"
                style={{ backgroundColor: themePalette.primary }}
              >
                Confirmer le PIN
              </button>
              <button
                onClick={() => {
                  setIsEditingPin(false);
                  setPinInput('');
                }}
                className="px-3 py-2 rounded-xl text-xs font-medium text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700"
              >
                Annuler
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                triggerHaptic('light');
                setIsEditingPin(true);
              }}
              className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{hasPin ? 'Modifier le code PIN' : 'Configurer un code PIN'}</span>
            </button>

            {hasPin && (
              <button
                onClick={handleRemovePin}
                className="py-2.5 px-3 rounded-xl text-xs font-bold text-rose-600 bg-rose-500/10 hover:bg-rose-500/20 active:scale-95 transition-all"
              >
                Supprimer
              </button>
            )}
          </div>
        )}
      </section>

      {/* 6. Sauvegarde & Exportation 100% Locale (Phase 3) */}
      <section className="ios-card p-5 rounded-3xl border border-black/5 dark:border-white/5 space-y-3">
        <div className="flex items-center gap-2 border-b border-black/5 dark:border-white/5 pb-2.5">
          <Download className="w-4 h-4 text-neutral-500" />
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-neutral-900 dark:text-white">
            Sauvegarde & Exportation
          </h2>
        </div>

        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Sauvegardez l’intégralité de vos conversations, profils de styles et réglages dans un fichier JSON pour changer d'appareil sans perte.
        </p>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleExportData}
            className="py-2.5 px-3 rounded-xl text-xs font-bold bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exporter (JSON)</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic('light');
              fileInputRef.current?.click();
            }}
            className="py-2.5 px-3 rounded-xl text-xs font-bold bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Importer</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportFile}
            accept=".json,application/json"
            className="hidden"
          />
        </div>

        {/* Indicateur de Cache Localforage & PWA */}
        <div className="pt-2 border-t border-black/5 dark:border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-bold text-neutral-900 dark:text-white">
              <Database className="w-3.5 h-3.5 text-blue-500" />
              <span>Cache localforage & Service Worker</span>
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              Actif (IndexedDB)
            </span>
          </div>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
            Toutes vos conversations, réponses et réglages sont mis en cache localement pour garantir un fonctionnement hors ligne instantané sans dépendance au réseau.
          </p>
          <PWAInstallButton variant="banner" />
        </div>
      </section>

      {/* 7. Confidentialité & Guide interactif (Phase 3) */}
      <section className="ios-card p-5 rounded-3xl border border-black/5 dark:border-white/5 space-y-3">
        <div className="flex items-center gap-2 border-b border-black/5 dark:border-white/5 pb-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-neutral-900 dark:text-white">
            Confidentialité & Aide
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              triggerHaptic('light');
              setShowPrivacyModal(true);
            }}
            className="py-2.5 px-3 rounded-xl text-xs font-bold bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Charte Sécurité</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic('light');
              openOnboarding();
            }}
            className="py-2.5 px-3 rounded-xl text-xs font-bold bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-500" />
            <span>Guide d'accueil</span>
          </button>
        </div>
      </section>

      {/* 8. Suite de tests Section 23 & 24 (Phase 1, 2, 3 & 4) */}
      <section className="ios-card p-5 rounded-3xl border border-black/5 dark:border-white/5 space-y-3">
        <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-2.5">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-neutral-900 dark:text-white">
              Suite de Validation & Diagnostics
            </h2>
          </div>
          <button
            onClick={runValidationTestSuite}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs flex items-center gap-1.5 active:scale-95 transition-all"
            style={{ backgroundColor: themePalette.primary }}
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span>Lancer les diagnostics</span>
          </button>
        </div>

        <p className="text-xs text-neutral-500">
          Valide automatiquement l'ensemble des spécifications : invariance 100%, 4 styles, échiquier 1-4 coups, probabilités, mode hors ligne autonome, sauvegarde JSON, sécurité PIN, chiffrement scrypt, isolation multi-comptes et signature C4RL3NTZ.
        </p>

        {testResults && (
          <div className="space-y-2 pt-2 animate-in fade-in">
            <div className="text-[11px] font-bold text-neutral-500 flex items-center justify-between pb-1">
              <span>Résultats d'exécution :</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                {testResults.tests.filter((t) => t.passed).length} / {testResults.tests.length} validés
              </span>
            </div>
            {testResults.tests.map((t) => (
              <div
                key={t.id}
                className="p-3 rounded-2xl bg-neutral-100/70 dark:bg-neutral-800/60 border border-neutral-200/40 dark:border-neutral-700/40 flex items-start justify-between gap-2"
              >
                <div className="text-xs space-y-0.5">
                  <div className="font-bold text-neutral-900 dark:text-white">{t.name}</div>
                  <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    {t.details}
                  </div>
                </div>
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${
                    t.passed
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'bg-rose-500/10 text-rose-600'
                  }`}
                >
                  {t.passed ? 'PASSÉ' : 'ÉCHEC'}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 9. Identité & Vision C4RL3NTZ (Phase 4) */}
      <section className="ios-card p-6 rounded-3xl border border-black/5 dark:border-white/10 space-y-3 bg-gradient-to-br from-neutral-500/5 to-blue-500/5">
        <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-2.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-neutral-900 dark:text-white">
              Identité & Vision — C4RL3NTZ
            </h2>
          </div>
          <span className="text-[10px] font-black tracking-widest px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 uppercase">
            C4RL3NTZ EDITION
          </span>
        </div>

        <blockquote className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 italic leading-relaxed pt-1">
          « RIZZ AI est une création originale propulsée par la vision C4RL3NTZ. »
        </blockquote>

        <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
          Conçu pour une maîtrise relationnelle et conversationnelle absolue. Combine un moteur heuristique autonome 100% hors ligne et une intelligence prédictive à profondeur multiple.
        </p>

        <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/5 text-[11px] text-neutral-400">
          <span className="font-mono">RIZZ AI v4.0.0 (C4RL3NTZ Build)</span>
          <span className="font-bold text-neutral-600 dark:text-neutral-300">Built with precision by C4RL3NTZ</span>
        </div>
      </section>

      {/* Modal Changement de Mot de Passe */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="ios-card w-full max-w-sm p-6 rounded-3xl border border-black/10 dark:border-white/10 shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-neutral-900 dark:text-white">
              Modifier le mot de passe
            </h3>
            {passwordError && (
              <p className="text-xs font-semibold text-rose-500 bg-rose-500/10 p-2.5 rounded-xl">
                {passwordError}
              </p>
            )}
            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Ancien mot de passe
                </label>
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white focus:outline-none"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Nouveau mot de passe (min. 6 caractères)
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white focus:outline-none"
                  placeholder="••••••••"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white"
                  style={{ backgroundColor: themePalette.primary }}
                >
                  Confirmer
                </button>
                <button
                  type="button"
                  onClick={() => setShowChangePasswordModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-medium text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmation Déconnexion */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="ios-card w-full max-w-sm p-6 rounded-3xl border border-black/10 dark:border-white/10 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-neutral-800 dark:text-neutral-100">
              <LogOut className="w-5 h-5 text-neutral-500" />
              <h3 className="text-base font-extrabold">
                Voulez-vous vous déconnecter ?
              </h3>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
              Votre session active sera terminée. Les données locales stockées sur cet appareil sont préservées et ne sont pas effacées automatiquement.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowLogoutModal(false);
                  triggerHaptic('medium');
                  logout();
                }}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-neutral-900 dark:bg-white dark:text-neutral-900"
              >
                Se déconnecter
              </button>
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-medium text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Suppression de Compte */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="ios-card w-full max-w-sm p-6 rounded-3xl border border-rose-500/30 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-rose-500">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="text-base font-extrabold">
                Supprimer le compte ?
              </h3>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
              Cette action supprimera votre compte et les données associées au serveur. Les données uniquement stockées sur cet appareil peuvent nécessiter une suppression séparée.
            </p>
            {deleteError && (
              <p className="text-xs font-semibold text-rose-500 bg-rose-500/10 p-2.5 rounded-xl">
                {deleteError}
              </p>
            )}
            <form onSubmit={handleDeleteAccount} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Confirmez avec votre mot de passe
                </label>
                <input
                  type="password"
                  required
                  value={deletePassInput}
                  onChange={(e) => setDeletePassInput(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white focus:outline-none"
                  placeholder="••••••••"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700"
                >
                  Supprimer définitivement
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-medium text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
