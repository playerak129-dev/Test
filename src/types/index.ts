/**
 * Types & Modèles de données de RIZZ AI
 * Phase 1 (Core) + Phase 2 (Échiquier) + Phase 3 (Version Finale & Production)
 */

export type StyleType = 'humour' | 'charo' | 'romantique' | 'calculateur';

export interface StyleWeights {
  humour: number;
  charo: number;
  romantique: number;
  calculateur: number;
}

export type IntensityCategory = 'subtil' | 'naturel' | 'confiant' | 'audacieux' | 'très audacieux';

export type ResponseLength = 'courte' | 'normale' | 'développée';
export type FlirtLevel = 'subtil' | 'normal' | 'élevé';

export type UserSituation =
  | 'premiere_conversation'
  | 'on_se_connait'
  | 'flirt'
  | 'apres_rendez_vous'
  | 'discussion_normale'
  | 'autre';

export type UserObjective =
  | 'faire_rire'
  | 'flirter'
  | 'curiosite'
  | 'approfondir'
  | 'proposer_rencontre'
  | 'repondre_naturellement'
  | 'terminer_elegamment';

export interface StructuredContext {
  situation?: UserSituation;
  objective?: UserObjective;
  details?: string;
}

export interface StyleProfile {
  id: string;
  name: string;
  styleWeights: StyleWeights;
  intensity: number;
  responseLength: ResponseLength;
  flirtLevel: FlirtLevel;
  isDefault?: boolean;
}

export interface ImageItem {
  id: string;
  previewUrl: string;
  base64: string;
  mimeType: string;
  name?: string;
}

export interface Message {
  id: string;
  sender: 'user' | 'other';
  text: string;
  timestamp?: number;
}

export interface ConversationAnalysis {
  tonDetecte: string;
  engagementEstime: number; // 0 à 100
  dynamique: string;
  intentionProbable: string;
  objectifRecommande: string;
  transcription?: string;
}

export interface ResponseOption {
  id: string;
  style: StyleType;
  title: string;
  text: string;
  explanation?: string;
  coachWhy?: string; // Mode Coach: explication psychologique & dynamique
  isRegenerating?: boolean;
}

// ==========================================
// PHASE 2 & 3 : TYPES DU MOTEUR D'ANTICIPATION
// ==========================================

export type AnticipationDepth = 1 | 2 | 3 | 4;

export type ConversationalObjective =
  | 'continuer'
  | 'curiosite'
  | 'flirt'
  | 'humour'
  | 'approfondir'
  | 'rencontre'
  | 'ralentir'
  | 'terminer';

export interface DynamicsScore {
  interetEstime: number; // 0 à 100%
  engagement: number; // 0 à 100%
  flirt: number; // 0 à 100%
  momentum: number; // Ex: +12, -4, etc.
  compatibiliteTon: number; // 0 à 100%
  explications?: {
    interet?: string;
    engagement?: string;
    flirt?: string;
    momentum?: string;
    compatibiliteTon?: string;
  };
}

export interface CounterMove {
  id: string;
  style: StyleType;
  title: string;
  text: string;
  coachWhy: string;
  // Profondeur 3 & 4
  nextPredictedReaction?: string;
  nextFollowUpMove?: string;
}

export interface PredictionBranch {
  id: string;
  label: string; // Ex: "A — « Pourquoi ? »"
  reactionText: string;
  probability: number; // Ex: 48 (0-100)
  rationale?: string;
  counterMoves: CounterMove[];
  isExpanded?: boolean;
}

export interface BestMoveCriteria {
  coherenceTon: string;
  potentielEngagement: string;
  naturel: string;
  niveauFlirt: string;
  risqueInsistant: string;
}

export interface BestMoveRecommendation {
  branchId: string;
  recommendedCounterMoveText: string;
  style: StyleType;
  why: string;
  criteria: BestMoveCriteria;
}

export interface PredictionVsReality {
  actualResponseReceived: string;
  closestPredictedBranchLabel: string;
  closestPredictedProbability: number;
  gapAnalysis: string;
  strategicAdjustment: string;
}

export interface ConversationTurn {
  id: string;
  timestamp: number;
  userSentMessage: string;
  otherReceivedMessage?: string;
  note?: string;
}

export interface AnticipationTree {
  id: string;
  timestamp: number;
  currentMove: string;
  depth: AnticipationDepth;
  objective: ConversationalObjective;
  positionActuelle?: string; // Phase 3 : résumé de position
  dynamics: DynamicsScore;
  branches: PredictionBranch[];
  bestMove: BestMoveRecommendation;
  comparison?: PredictionVsReality;
}

export interface ConversationRecord {
  id: string;
  title?: string;
  timestamp: number;
  inputMethod: 'text' | 'screenshot';
  inputContent: string;
  context?: string;
  structuredContext?: StructuredContext;
  images?: ImageItem[];
  analysis: ConversationAnalysis;
  responses: ResponseOption[];
  styleWeights: StyleWeights;
  intensity: number;
  responseLength?: ResponseLength;
  flirtLevel?: FlirtLevel;
  anticipationTree?: AnticipationTree;
  turns?: ConversationTurn[];
}

export type AppearanceMode = 'light' | 'dark' | 'auto';

export interface AppSettings {
  appearance: AppearanceMode;
  accentColor: string; // Ex: #007AFF
  animatedGradient: boolean;
  defaultStyle: StyleType;
  defaultIntensity: number;
  defaultDepth: AnticipationDepth;
  responseLength: ResponseLength;
  flirtLevel: FlirtLevel;
  lockPin?: string | null;
  onboardingCompleted: boolean;
}

export interface GenerationSettings {
  intensity: number; // 1-100
  styleWeights: StyleWeights;
  responseLength?: ResponseLength;
  flirtLevel?: FlirtLevel;
}

/**
 * Phase 4 — Authentification Réelle & Compte Utilisateur C4RL3NTZ
 */
export interface User {
  id: string;
  email: string;
  createdAt: number;
  displayName?: string;
  edition: string; // Ex: 'C4RL3NTZ'
}

export interface AuthSession {
  token: string;
  user: User;
  expiresAt: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  currentUser: User | null;
  isLoading: boolean;
  session: AuthSession | null;
  authError: string | null;
  isOfflineSession: boolean;
}

