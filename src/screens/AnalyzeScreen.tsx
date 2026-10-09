import React, { useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Camera,
  Edit3,
  Upload,
  X,
  Sparkles,
  AlertCircle,
  RefreshCw,
  SlidersHorizontal,
  Mic,
  MicOff,
  Plus,
  WifiOff,
} from 'lucide-react';
import { getStyleSummaryText } from '../utils/styleBalancing';
import { triggerHaptic } from '../utils/haptics';

export const AnalyzeScreen: React.FC = () => {
  const {
    inputMode,
    setInputMode,
    inputText,
    setInputText,
    inputContext,
    setInputContext,
    selectedImages,
    addImages,
    removeImage,
    clearImages,
    runAnalysis,
    isAnalyzing,
    analyzeError,
    setAnalyzeError,
    imageQualityWarning,
    themePalette,
    styleWeights,
    intensity,
    setCurrentScreen,
    isOnline,
    showToast,
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const quickStarters = [
    { label: '🔥 Premier Match', ctx: 'Premier message sur Tinder / Bumble / Hinge' },
    { label: '👀 Après un Vu', ctx: 'Discussion arrêtée depuis 2 jours après un message sans réponse' },
    { label: '📸 Réponse Story', ctx: 'Réaction spontanée à sa story Instagram' },
    { label: '☕ Proposer un date', ctx: 'Moment propice pour passer du virtuel au réel' },
    { label: '😏 Vanne taquine', ctx: 'Désamorcer sa pique avec autodérision et charme' },
  ];

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    triggerHaptic('light');
    const valid = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (valid.length === 0) {
      setAnalyzeError('Veuillez sélectionner un fichier image valide (JPG, PNG, WEBP).');
      return;
    }
    setAnalyzeError(null);
    await addImages(valid);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      await handleFiles(e.dataTransfer.files);
    }
  };

  // Dictée vocale avec Web Speech API
  const toggleSpeechRecognition = () => {
    triggerHaptic('medium');
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRec) {
      showToast('Dictée vocale non prise en charge par ce navigateur');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.lang = 'fr-FR';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsRecording(true);
        showToast('Écoute en cours... Parlez maintenant');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText(inputText ? `${inputText} ${transcript}` : transcript);
          triggerHaptic('success');
          showToast('Texte dicté ajouté');
        }
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch {
      setIsRecording(false);
      showToast('Impossible de démarrer la reconnaissance vocale');
    }
  };

  const handleAnalyzeClick = async () => {
    triggerHaptic('medium');
    await runAnalysis();
  };

  return (
    <div className="space-y-5 pb-24 pt-2">
      {/* Sélecteur de mode iOS segmented */}
      <div className="p-1 rounded-2xl bg-neutral-200/60 dark:bg-neutral-800/60 flex items-center gap-1 border border-black/5 dark:border-white/5">
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            setInputMode('text');
            setAnalyzeError(null);
          }}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            inputMode === 'text'
              ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
              : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>ÉCRIRE LE MESSAGE</span>
        </button>

        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            setInputMode('screenshot');
            setAnalyzeError(null);
          }}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            inputMode === 'screenshot'
              ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
              : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>CAPTURE D'ÉCRAN</span>
        </button>
      </div>

      {/* Mode 1: Saisie Manuelle */}
      {inputMode === 'text' && (
        <div className="space-y-4">
          <div className="ios-card p-4 rounded-2xl border border-black/5 dark:border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300">
                « Que t'a-t-elle / il dit ? »
              </label>

              {/* Bouton Microphone */}
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                className={`p-1.5 rounded-full transition-colors ${
                  isRecording
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-300'
                }`}
                title="Dictée vocale"
              >
                {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              </button>
            </div>

            <textarea
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                if (analyzeError) setAnalyzeError(null);
              }}
              rows={5}
              placeholder="Ex: « Haha t'es trop sûr de toi, tu dis ça à toutes les filles ? » ou colle l'échange complet..."
              className="w-full px-3.5 py-3 text-sm rounded-xl bg-neutral-100/70 dark:bg-neutral-800/60 border border-neutral-200/50 dark:border-neutral-700/50 focus:border-blue-500/50 focus:bg-white dark:focus:bg-neutral-900 focus:outline-none transition-all resize-none text-neutral-900 dark:text-white placeholder:text-neutral-400"
            />
          </div>

          {/* Raccourcis / Brise-glace */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-semibold text-neutral-500 px-1">
              Suggestions de contexte rapides :
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {quickStarters.map((qs) => (
                <button
                  key={qs.label}
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setInputContext(qs.ctx);
                    showToast(`Contexte appliqué : ${qs.label}`);
                  }}
                  className="px-2.5 py-1 rounded-xl text-[11px] font-bold shrink-0 bg-neutral-200/50 dark:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-700 active:scale-95 transition-all"
                >
                  {qs.label}
                </button>
              ))}
            </div>
          </div>

          <div className="ios-card p-4 rounded-2xl border border-black/5 dark:border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300">
                Contexte <span className="text-neutral-400 font-normal lowercase">(facultatif)</span>
              </label>
            </div>
            <input
              type="text"
              value={inputContext}
              onChange={(e) => setInputContext(e.target.value)}
              placeholder="Ex : « On parle depuis 3 jours. » ou « Premier message sur Tinder. »"
              className="w-full px-3.5 py-3 text-xs rounded-xl bg-neutral-100/70 dark:bg-neutral-800/60 border border-neutral-200/50 dark:border-neutral-700/50 focus:border-blue-500/50 focus:bg-white dark:focus:bg-neutral-900 focus:outline-none transition-all text-neutral-900 dark:text-white placeholder:text-neutral-400"
            />
          </div>
        </div>
      )}

      {/* Mode 2: Capture d'écran (Multi-images jusqu'à 5) */}
      {inputMode === 'screenshot' && (
        <div className="space-y-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleFiles(e.target.files)}
            accept="image/*"
            multiple
            className="hidden"
          />

          {selectedImages.length === 0 ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="ios-card p-8 rounded-2xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all text-center cursor-pointer active:scale-[0.99] group space-y-3"
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto transition-transform group-hover:scale-105"
                style={{ backgroundColor: themePalette.lightBg, color: themePalette.primary }}
              >
                <Upload className="w-7 h-7 stroke-[2]" />
              </div>

              <div>
                <div className="text-sm font-bold text-neutral-900 dark:text-white">
                  Sélectionner des captures d'écran
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-xs mx-auto">
                  Tinder, Instagram, WhatsApp, Bumble, SMS... Glisse une ou plusieurs images.
                </p>
              </div>

              <div
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white shadow-xs"
                style={{ backgroundColor: themePalette.primary }}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Ouvrir la galerie</span>
              </div>
            </div>
          ) : (
            <div className="ios-card p-4 rounded-2xl border border-black/5 dark:border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300">
                  Captures sélectionnées ({selectedImages.length}/5)
                </span>
                <button
                  onClick={() => {
                    triggerHaptic('light');
                    clearImages();
                  }}
                  className="text-xs text-rose-500 hover:underline font-semibold"
                >
                  Tout effacer
                </button>
              </div>

              {/* Grille des miniatures */}
              <div className="grid grid-cols-2 gap-2.5">
                {selectedImages.map((img) => (
                  <div
                    key={img.id}
                    className="relative rounded-xl overflow-hidden bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 group aspect-3/4 max-h-48"
                  >
                    <img
                      src={img.previewUrl}
                      alt="Miniature capture"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerHaptic('light');
                        removeImage(img.id);
                      }}
                      className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 text-white hover:bg-rose-500 transition-colors"
                      title="Supprimer cette capture"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {selectedImages.length < 5 && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 flex flex-col items-center justify-center p-4 hover:border-blue-500/50 transition-colors text-neutral-500 active:scale-95 aspect-3/4 max-h-48"
                  >
                    <Plus className="w-6 h-6 mb-1" />
                    <span className="text-[11px] font-bold">Ajouter</span>
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="ios-card p-4 rounded-2xl border border-black/5 dark:border-white/5 space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300">
              Contexte <span className="text-neutral-400 font-normal lowercase">(facultatif)</span>
            </label>
            <input
              type="text"
              value={inputContext}
              onChange={(e) => setInputContext(e.target.value)}
              placeholder="Ex : « On parle depuis 3 jours. » ou « Elle est un peu distante. »"
              className="w-full px-3.5 py-3 text-xs rounded-xl bg-neutral-100/70 dark:bg-neutral-800/60 border border-neutral-200/50 dark:border-neutral-700/50 focus:border-blue-500/50 focus:bg-white dark:focus:bg-neutral-900 focus:outline-none transition-all text-neutral-900 dark:text-white placeholder:text-neutral-400"
            />
          </div>
        </div>
      )}

      {/* Raccourci vers le réglage de style et intensité */}
      <div
        onClick={() => {
          triggerHaptic('light');
          setCurrentScreen('style');
        }}
        className="px-4 py-3 rounded-2xl bg-neutral-200/40 dark:bg-neutral-800/30 border border-neutral-300/30 dark:border-neutral-700/30 flex items-center justify-between cursor-pointer active:scale-[0.99] transition-all"
      >
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-neutral-500" />
          <div className="text-xs">
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
              {getStyleSummaryText(styleWeights)}
            </span>
            <span className="text-neutral-400 ml-1.5 font-medium">({intensity}%)</span>
          </div>
        </div>
        <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">Modifier</span>
      </div>

      {/* Note d'avertissement qualité d'image */}
      {imageQualityWarning && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{imageQualityWarning}</div>
        </div>
      )}

      {/* Message d'erreur */}
      {analyzeError && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">Attention : </span>
            {analyzeError}
          </div>
        </div>
      )}

      {/* Bouton d'action [ ANALYSER ] */}
      <button
        onClick={handleAnalyzeClick}
        disabled={isAnalyzing}
        className="w-full py-4 px-6 rounded-2xl font-bold text-base text-white shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 disabled:opacity-60 cursor-pointer"
        style={{
          background: themePalette.gradient,
          boxShadow: themePalette.glow,
        }}
      >
        {isAnalyzing ? (
          <>
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Analyse de la conversation…</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            <span>ANALYSER {isOnline ? '' : '(MODE AUTONOME)'}</span>
          </>
        )}
      </button>

      {/* État de chargement propre et immersif si en cours d'analyse */}
      {isAnalyzing && (
        <div className="ios-card p-6 rounded-2xl text-center border border-black/5 dark:border-white/5 space-y-3 animate-in fade-in">
          <div className="relative w-12 h-12 mx-auto">
            <div
              className="absolute inset-0 rounded-full animate-ping opacity-25"
              style={{ backgroundColor: themePalette.primary }}
            />
            <div
              className="relative w-12 h-12 rounded-full flex items-center justify-center text-white"
              style={{ background: themePalette.gradient }}
            >
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm font-bold text-neutral-900 dark:text-white">
              Analyse de la conversation en cours…
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-xs mx-auto">
              {isOnline
                ? "Détection du ton, calibration de l'intérêt et génération des 4 réponses avec Gemini..."
                : "Moteur autonome local actif : calcul heuristique des 4 styles..."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
