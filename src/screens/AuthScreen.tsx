import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, UserPlus, LogIn, AlertCircle, WifiOff } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface AuthScreenProps {
  onSuccess?: () => void;
  onContinueAsGuest?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess, onContinueAsGuest }) => {
  const { login, register, authError, isAuthLoading, isOnline, themePalette, showToast } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const validate = (): boolean => {
    setValidationError(null);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !emailRegex.test(email.trim())) {
      setValidationError('Adresse email invalide.');
      triggerHaptic('warning');
      return false;
    }

    if (!password || password.length < 6) {
      setValidationError('Le mot de passe est trop court (6 caractères minimum).');
      triggerHaptic('warning');
      return false;
    }

    if (mode === 'register') {
      if (password !== confirmPassword) {
        setValidationError('Les mots de passe ne correspondent pas.');
        triggerHaptic('warning');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    triggerHaptic('medium');
    try {
      if (mode === 'login') {
        await login(email.trim(), password);
        showToast('Connexion réussie');
      } else {
        await register(email.trim(), password, confirmPassword);
        showToast('Compte C4RL3NTZ créé');
      }
      if (onSuccess) onSuccess();
    } catch {
      triggerHaptic('warning');
    }
  };

  return (
    <div className="min-h-full flex flex-col justify-center px-4 py-8 max-w-md mx-auto animate-in fade-in zoom-in-95 duration-300">
      {/* Signature C4RL3NTZ en tête */}
      <div className="text-center mb-8 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 backdrop-blur-md border border-black/5 dark:border-white/10 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          <span className="text-[11px] font-black uppercase tracking-widest text-neutral-600 dark:text-neutral-300">
            C4RL3NTZ ENGINE
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-neutral-900 dark:text-white">
          RIZZ AI
        </h1>
        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
          Ton copilote de conversation.
        </p>

        {!isOnline && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold mt-2">
            <WifiOff className="w-3.5 h-3.5" />
            <span>Mode hors ligne actif — Session locale disponible</span>
          </div>
        )}
      </div>

      {/* Carte iOS 26 Verre Dépoli */}
      <div className="ios-card p-6 sm:p-7 rounded-3xl border border-black/5 dark:border-white/10 shadow-xl backdrop-blur-2xl">
        {/* Sélecteur Mode : Connexion / Inscription */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 mb-6">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setMode('login');
              setValidationError(null);
            }}
            className={`py-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
              mode === 'login'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Connexion</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setMode('register');
              setValidationError(null);
            }}
            className={`py-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
              mode === 'register'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Inscription</span>
          </button>
        </div>

        {/* Message d'erreur s'il y a lieu */}
        {(validationError || authError) && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-start gap-2 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{validationError || authError}</span>
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 ml-1">
              Adresse email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nom@exemple.com"
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-neutral-100/80 dark:bg-neutral-800/80 border border-transparent focus:border-blue-500/50 dark:focus:border-blue-400/50 focus:bg-white dark:focus:bg-neutral-900 text-sm font-medium text-neutral-900 dark:text-white focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Mot de passe */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 ml-1">
              Mot de passe
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 rounded-2xl bg-neutral-100/80 dark:bg-neutral-800/80 border border-transparent focus:border-blue-500/50 dark:focus:border-blue-400/50 focus:bg-white dark:focus:bg-neutral-900 text-sm font-medium text-neutral-900 dark:text-white focus:outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirmation (Inscription seulement) */}
          {mode === 'register' && (
            <div className="space-y-1.5 animate-in fade-in duration-200">
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 ml-1">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-neutral-100/80 dark:bg-neutral-800/80 border border-transparent focus:border-blue-500/50 dark:focus:border-blue-400/50 focus:bg-white dark:focus:bg-neutral-900 text-sm font-medium text-neutral-900 dark:text-white focus:outline-none transition-all"
                />
              </div>
            </div>
          )}

          {/* Bouton de validation principal */}
          <button
            type="submit"
            disabled={isAuthLoading}
            className="w-full mt-2 py-3.5 px-4 rounded-2xl text-sm font-extrabold text-white shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ backgroundColor: themePalette.primary }}
          >
            {isAuthLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>{mode === 'login' ? 'SE CONNECTER' : 'CRÉER UN COMPTE'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Mot de passe oublié & Mode Invité */}
        <div className="mt-5 pt-4 border-t border-black/5 dark:border-white/5 flex flex-col gap-3 text-center">
          {mode === 'login' && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setShowForgotModal(true);
              }}
              className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              Mot de passe oublié ?
            </button>
          )}

          {onContinueAsGuest && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                onContinueAsGuest();
              }}
              className="text-xs font-extrabold text-blue-600 dark:text-blue-400 hover:underline transition-colors"
            >
              Continuer en mode Invité (local)
            </button>
          )}
        </div>
      </div>

      {/* Garantie de sécurité & Badge signature C4RL3NTZ */}
      <div className="mt-6 text-center space-y-2">
        <div className="flex items-center justify-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Hachage cryptographique scrypt sécurisé • Zéro revente</span>
        </div>
        <p className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500">
          Édition C4RL3NTZ • Architecture Session Hybride Offline/Online
        </p>
      </div>

      {/* Dialogue Mot de passe oublié */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="ios-card w-full max-w-sm p-6 rounded-3xl border border-black/10 dark:border-white/10 shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-neutral-900 dark:text-white">
              Mot de passe oublié
            </h3>
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-semibold">
              La récupération par email n'est pas encore configurée.
            </div>
            <p className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-300">
              Conformément à la politique de confidentialité locale et aux standards cryptographiques C4RL3NTZ, vos mots de passe sont protégés par hachage scrypt irréversible et ne sont jamais stockés en clair.
            </p>
            <p className="text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
              Vous pouvez réinitialiser vos données locales, créer un nouveau compte ou continuer en mode Invité pour profiter de l'Offline Engine et de l'Échiquier sans interruption.
            </p>
            <button
              onClick={() => setShowForgotModal(false)}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-white"
              style={{ backgroundColor: themePalette.primary }}
            >
              Compris
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
