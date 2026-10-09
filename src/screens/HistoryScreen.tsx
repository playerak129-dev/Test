import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ConversationRecord } from '../types';
import {
  History,
  Trash2,
  ArrowRight,
  Calendar,
  AlertTriangle,
  MessageSquare,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { getStyleSummaryText } from '../utils/styleBalancing';

export const HistoryScreen: React.FC = () => {
  const { history, deleteConversation, clearAllHistory, openHistoryItem, themePalette, setCurrentScreen } =
    useApp();

  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [deleteIdTarget, setDeleteIdTarget] = useState<string | null>(null);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-5 pb-28 pt-2">
      {/* En-tête avec compteur & action d'effacement */}
      <div className="flex items-center justify-between px-1">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-extrabold text-neutral-900 dark:text-white uppercase tracking-wider">
              Historique Local ({history.length})
            </h2>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
              localforage
            </span>
          </div>
          <p className="text-[11px] text-neutral-500">
            Stocké 100% sur ton appareil en IndexedDB. Accessible hors ligne.
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={() => setConfirmClearAll(true)}
            className="text-xs font-semibold text-rose-500 hover:text-rose-600 flex items-center gap-1 active:scale-95 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Tout effacer</span>
          </button>
        )}
      </div>

      {/* Modale confirmation suppression totale */}
      {confirmClearAll && (
        <div className="ios-card p-4 rounded-2xl border border-rose-500/20 bg-rose-500/5 space-y-3 animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <div className="font-bold text-neutral-900 dark:text-white">
                Effacer tout l'historique ?
              </div>
              <p className="text-neutral-500 dark:text-neutral-400">
                Cette action supprimera définitivement toutes les conversations analysées sauvegardées sur cet appareil.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              onClick={() => setConfirmClearAll(false)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium bg-neutral-200/60 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
            >
              Annuler
            </button>
            <button
              onClick={() => {
                clearAllHistory();
                setConfirmClearAll(false);
              }}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-rose-600 active:scale-95 transition-all"
            >
              Confirmer la suppression
            </button>
          </div>
        </div>
      )}

      {/* Liste des conversations */}
      {history.length === 0 ? (
        <div className="ios-card p-10 rounded-3xl text-center border border-black/5 dark:border-white/5 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto text-neutral-400">
            <History className="w-7 h-7 stroke-[1.5]" />
          </div>
          <div className="space-y-1">
            <div className="text-sm font-bold text-neutral-900 dark:text-white">
              Historique vide
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-xs mx-auto leading-relaxed">
              « Tes conversations analysées apparaîtront ici. »
            </p>
          </div>
          <button
            onClick={() => setCurrentScreen('analyze')}
            className="mt-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-xs"
            style={{ backgroundColor: themePalette.primary }}
          >
            Faire ma première analyse
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((record) => (
            <div
              key={record.id}
              className="ios-card p-4 rounded-3xl border border-black/5 dark:border-white/5 space-y-3 hover:border-black/10 transition-all group"
            >
              {/* Header de la carte */}
              <div className="flex items-center justify-between text-xs border-b border-black/5 dark:border-white/5 pb-2.5">
                <div className="flex items-center gap-1.5 text-neutral-400 text-[11px]">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatDate(record.timestamp)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                    {record.analysis.tonDetecte}
                  </span>
                  <button
                    onClick={() => setDeleteIdTarget(record.id)}
                    className="p-1 rounded-full text-neutral-400 hover:text-rose-500 transition-colors"
                    aria-label="Supprimer cette conversation"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Dialogue confirmation suppression élément individuel */}
              {deleteIdTarget === record.id ? (
                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs space-y-2">
                  <p className="text-neutral-800 dark:text-neutral-200 font-medium">
                    Supprimer cette conversation de l'historique ?
                  </p>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setDeleteIdTarget(null)}
                      className="px-2.5 py-1 rounded-lg text-[11px] bg-neutral-200 dark:bg-neutral-800"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={() => {
                        deleteConversation(record.id);
                        setDeleteIdTarget(null);
                      }}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-white bg-rose-600"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Contenu analysé */}
                  <div
                    onClick={() => openHistoryItem(record)}
                    className="cursor-pointer space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-neutral-900 dark:text-white line-clamp-2">
                        « {record.analysis.transcription || record.inputContent} »
                      </p>
                      <span className="text-xs font-black text-neutral-800 dark:text-neutral-200 shrink-0">
                        {record.analysis.engagementEstime} %
                      </span>
                    </div>

                    {record.context && (
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 italic">
                        Contexte : {record.context}
                      </p>
                    )}
                  </div>

                  {/* Bouton pour rouvrir l'analyse et voir les 4 réponses */}
                  <div className="pt-1 flex items-center justify-between">
                    <div className="text-[10px] text-neutral-400">
                      {record.responses.length} réponses générées • Intensité {record.intensity}%
                    </div>
                    <button
                      onClick={() => openHistoryItem(record)}
                      className="text-xs font-bold flex items-center gap-1 hover:underline"
                      style={{ color: themePalette.primary }}
                    >
                      <span>Voir les réponses</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
