import {
  AnticipationDepth,
  AnticipationTree,
  ConversationAnalysis,
  ConversationTurn,
  ConversationalObjective,
  FlirtLevel,
  ImageItem,
  ResponseLength,
  ResponseOption,
  StructuredContext,
  StyleType,
  StyleWeights,
} from '../types';
import { offlineEngine } from './offlineEngine';
import { getApiEndpoint } from '../config/apiConfig';

export interface AnalyzeRequest {
  text?: string;
  imageBase64?: string;
  images?: ImageItem[];
  mimeType?: string;
  context?: string;
  structuredContext?: StructuredContext;
  styleWeights: StyleWeights;
  intensity: number;
  responseLength?: ResponseLength;
  flirtLevel?: FlirtLevel;
}

export interface AnalyzeResult {
  transcription?: string;
  analysis: ConversationAnalysis;
  responses: ResponseOption[];
  imageQualityNote?: string;
  isOffline?: boolean;
}

export interface RegenerateRequest {
  conversationText: string;
  context?: string;
  style: StyleType;
  styleWeights: StyleWeights;
  intensity: number;
  existingText: string;
}

export interface AnticipateRequest {
  conversation?: string;
  currentMove: string;
  context?: string;
  styleWeights: StyleWeights;
  intensity: number;
  depth: AnticipationDepth;
  objective?: ConversationalObjective;
  turns?: ConversationTurn[];
  realResponse?: string;
}

export interface AIService {
  analyzeConversation(req: AnalyzeRequest): Promise<AnalyzeResult>;
  regenerateResponse(req: RegenerateRequest): Promise<string>;
  anticipateConversation(req: AnticipateRequest): Promise<AnticipationTree>;
  checkHealth(): Promise<{ status: string; hasApiKey: boolean }>;
}

class RemoteAIServiceImpl implements AIService {
  private timeoutMs = 45000;

  private isActuallyOnline(): boolean {
    return typeof navigator === 'undefined' || navigator.onLine;
  }

  async checkHealth(): Promise<{ status: string; hasApiKey: boolean }> {
    if (!this.isActuallyOnline()) {
      return { status: 'offline', hasApiKey: false };
    }
    const res = await fetch(getApiEndpoint('/api/health'));
    if (!res.ok) throw new Error('Erreur de diagnostic serveur');
    return res.json();
  }

  async analyzeConversation(req: AnalyzeRequest): Promise<AnalyzeResult> {
    // Si l'utilisateur est hors ligne ou n'a pas de connexion
    if (!this.isActuallyOnline()) {
      const textToAnalyze = req.text || (req.context ? `Contexte: ${req.context}` : 'Conversation');
      const analysis = offlineEngine.analyzeText(textToAnalyze, req.context);
      const responses = offlineEngine.generateResponses({
        text: textToAnalyze,
        context: req.context,
        styleWeights: req.styleWeights,
        intensity: req.intensity,
        responseLength: req.responseLength,
        flirtLevel: req.flirtLevel,
      });

      return {
        transcription: textToAnalyze,
        analysis,
        responses,
        imageQualityNote: req.images && req.images.length > 0
          ? 'Mode Hors Ligne : La transcription OCR neuronale des images requiert une connexion Internet. Utilisez la saisie de texte pour une précision maximale.'
          : undefined,
        isOffline: true,
      };
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(getApiEndpoint('/api/analyze'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req),
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Erreur serveur (${response.status}) : Impossible de réaliser l'analyse.`
        );
      }

      const data = await response.json();

      return {
        transcription: data.transcription,
        analysis: {
          tonDetecte: data.tonDetecte,
          engagementEstime: data.engagementEstime,
          dynamique: data.dynamique,
          intentionProbable: data.intentionProbable,
          objectifRecommande: data.objectifRecommande,
          transcription: data.transcription,
        },
        responses: data.responses,
        imageQualityNote: data.imageQualityNote,
        isOffline: false,
      };
    } catch (err: any) {
      clearTimeout(timer);

      // Si erreur réseau / backend inaccessible / hors-ligne, basculer sur le moteur local
      const isNetworkOrServerDown =
        err.name === 'TypeError' ||
        err.message?.includes('Failed to fetch') ||
        err.message?.includes('NetworkError') ||
        err.message?.includes('Load failed') ||
        err.message?.includes('502') ||
        err.message?.includes('503') ||
        err.message?.includes('504') ||
        !this.isActuallyOnline();

      if (isNetworkOrServerDown) {
        const textToAnalyze = req.text || 'Message analysé en local';
        const analysis = offlineEngine.analyzeText(textToAnalyze, req.context);
        const responses = offlineEngine.generateResponses({
          text: textToAnalyze,
          context: req.context,
          styleWeights: req.styleWeights,
          intensity: req.intensity,
          responseLength: req.responseLength,
          flirtLevel: req.flirtLevel,
        });

        return {
          transcription: textToAnalyze,
          analysis,
          responses,
          isOffline: true,
        };
      }

      if (err.name === 'AbortError') {
        throw new Error('Délai dépassé (Timeout) : Le modèle a mis trop de temps à répondre. Veuillez réessayer.');
      }
      throw err;
    }
  }

  async regenerateResponse(req: RegenerateRequest): Promise<string> {
    if (!this.isActuallyOnline()) {
      const localList = offlineEngine.generateResponses({
        text: req.conversationText,
        context: req.context,
        styleWeights: req.styleWeights,
        intensity: req.intensity,
      });
      const found = localList.find((r) => r.style === req.style);
      return found ? found.text : "Nouvelle répartie hors ligne.";
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(getApiEndpoint('/api/regenerate'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req),
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur lors de la régénération (${response.status})`);
      }

      const data = await response.json();
      return data.text;
    } catch (err: any) {
      clearTimeout(timer);

      const isNetworkOrServerDown =
        err.name === 'TypeError' ||
        err.message?.includes('Failed to fetch') ||
        err.message?.includes('NetworkError') ||
        err.message?.includes('Load failed') ||
        err.message?.includes('502') ||
        err.message?.includes('503') ||
        err.message?.includes('504') ||
        !this.isActuallyOnline();

      if (isNetworkOrServerDown) {
        const localList = offlineEngine.generateResponses({
          text: req.conversationText,
          context: req.context,
          styleWeights: req.styleWeights,
          intensity: req.intensity,
        });
        const found = localList.find((r) => r.style === req.style);
        return found ? found.text : "Nouvelle répartie générée hors ligne.";
      }

      if (err.name === 'AbortError') {
        throw new Error('Délai dépassé : La régénération a pris trop de temps.');
      }
      throw err;
    }
  }

  async anticipateConversation(req: AnticipateRequest): Promise<AnticipationTree> {
    if (!this.isActuallyOnline()) {
      return offlineEngine.anticipateOffline({
        currentMove: req.currentMove,
        depth: req.depth,
        objective: req.objective,
        styleWeights: req.styleWeights,
        intensity: req.intensity,
      });
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(getApiEndpoint('/api/anticipate'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req),
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur lors du calcul d'anticipation (${response.status})`);
      }

      const data = await response.json();
      return data as AnticipationTree;
    } catch (err: any) {
      clearTimeout(timer);

      const isNetworkOrServerDown =
        err.name === 'TypeError' ||
        err.message?.includes('Failed to fetch') ||
        err.message?.includes('NetworkError') ||
        err.message?.includes('Load failed') ||
        err.message?.includes('502') ||
        err.message?.includes('503') ||
        err.message?.includes('504') ||
        !this.isActuallyOnline();

      if (isNetworkOrServerDown) {
        return offlineEngine.anticipateOffline({
          currentMove: req.currentMove,
          depth: req.depth,
          objective: req.objective,
          styleWeights: req.styleWeights,
          intensity: req.intensity,
        });
      }

      if (err.name === 'AbortError') {
        throw new Error('Délai dépassé : Le calcul de l\'arbre d\'anticipation a pris trop de temps.');
      }
      throw err;
    }
  }
}

export const aiService: AIService = new RemoteAIServiceImpl();
