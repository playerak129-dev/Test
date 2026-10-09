import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, Delete, Shield, Fingerprint } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

export const PinLockOverlay: React.FC = () => {
  const { isLocked, unlockWithPin, themePalette, showToast } = useApp();
  const [enteredPin, setEnteredPin] = useState('');
  const [shake, setShake] = useState(false);

  if (!isLocked) return null;

  const handleDigit = (digit: string) => {
    triggerHaptic('light');
    if (enteredPin.length < 4) {
      const nextPin = enteredPin + digit;
      setEnteredPin(nextPin);

      if (nextPin.length === 4) {
        setTimeout(() => {
          const success = unlockWithPin(nextPin);
          if (success) {
            triggerHaptic('success');
            setEnteredPin('');
          } else {
            triggerHaptic('warning');
            setShake(true);
            setTimeout(() => {
              setShake(false);
              setEnteredPin('');
            }, 500);
          }
        }, 120);
      }
    }
  };

  const handleDelete = () => {
    triggerHaptic('light');
    setEnteredPin((prev) => prev.slice(0, -1));
  };

  const handleBiometricSim = () => {
    triggerHaptic('success');
    showToast('Biométrie validée (Empreinte / Visage)');
    unlockWithPin(enteredPin); // will check savedPin or unlock
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between p-6 bg-neutral-900/90 dark:bg-black/95 backdrop-blur-2xl text-white select-none animate-in fade-in duration-200">
      {/* Top Header & Shield */}
      <div className="pt-12 flex flex-col items-center text-center space-y-3">
        <div
          className="w-16 h-16 rounded-3xl flex items-center justify-center shadow-lg"
          style={{ background: themePalette.gradient }}
        >
          <Lock className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">RIZZ AI Sécurisé</h2>
        <p className="text-xs text-neutral-400 font-medium max-w-xs">
          Vos conversations et analyses sont protégées par votre code d'accès local.
        </p>
      </div>

      {/* 4 PIN Dots */}
      <div className={`flex items-center gap-4 my-6 ${shake ? 'animate-bounce' : ''}`}>
        {[0, 1, 2, 3].map((index) => {
          const isFilled = enteredPin.length > index;
          return (
            <div
              key={index}
              className={`w-4 h-4 rounded-full transition-all duration-200 ${
                isFilled
                  ? 'bg-white scale-110 shadow-[0_0_12px_rgba(255,255,255,0.7)]'
                  : 'border-2 border-white/40 bg-transparent'
              }`}
            />
          );
        })}
      </div>

      {/* Numeric Keypad */}
      <div className="w-full max-w-xs pb-10 space-y-3">
        <div className="grid grid-cols-3 gap-3">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleDigit(digit)}
              className="h-16 rounded-3xl bg-white/10 hover:bg-white/20 active:scale-90 active:bg-white/30 transition-all font-semibold text-2xl flex items-center justify-center backdrop-blur-md"
            >
              {digit}
            </button>
          ))}
          {/* Biometrics */}
          <button
            onClick={handleBiometricSim}
            className="h-16 rounded-3xl bg-white/5 hover:bg-white/15 active:scale-90 transition-all flex items-center justify-center text-neutral-400 hover:text-white"
            title="Déverrouillage biométrique"
          >
            <Fingerprint className="w-6 h-6" />
          </button>
          {/* Zero */}
          <button
            onClick={() => handleDigit('0')}
            className="h-16 rounded-3xl bg-white/10 hover:bg-white/20 active:scale-90 active:bg-white/30 transition-all font-semibold text-2xl flex items-center justify-center backdrop-blur-md"
          >
            0
          </button>
          {/* Delete */}
          <button
            onClick={handleDelete}
            disabled={enteredPin.length === 0}
            className="h-16 rounded-3xl bg-white/5 hover:bg-white/15 active:scale-90 transition-all flex items-center justify-center text-neutral-400 hover:text-white disabled:opacity-20"
          >
            <Delete className="w-6 h-6" />
          </button>
        </div>

        <div className="text-center pt-2">
          <button
            onClick={() => {
              triggerHaptic('light');
              showToast('En cas d\'oubli, réinitialisez le code dans les paramètres de votre navigateur');
            }}
            className="text-xs text-neutral-400 hover:text-neutral-200 underline font-medium"
          >
            Code PIN oublié ?
          </button>
        </div>
      </div>
    </div>
  );
};
