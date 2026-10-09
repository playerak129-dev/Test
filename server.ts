import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { authStore } from './src/server/auth.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Configuration CORS stricte par liste d'autorisations (Allowlist)
// Conçue pour Capacitor Android (capacitor://localhost, https://localhost) et l'environnement Web
const ALLOWED_ORIGIN_SET = new Set<string>([
  'capacitor://localhost',
  'https://localhost',
  'http://localhost',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
]);

if (process.env.APP_URL) {
  try {
    const parsed = new URL(process.env.APP_URL);
    ALLOWED_ORIGIN_SET.add(parsed.origin);
  } catch {
    ALLOWED_ORIGIN_SET.add(process.env.APP_URL.replace(/\/+$/, ''));
  }
}

if (process.env.ALLOWED_ORIGINS) {
  process.env.ALLOWED_ORIGINS.split(/[,;\s]+/).forEach((entry) => {
    const cleaned = entry.trim().replace(/^['"]|['"]$/g, '').replace(/\/+$/, '');
    if (cleaned) {
      try {
        const parsed = new URL(cleaned);
        ALLOWED_ORIGIN_SET.add(parsed.origin);
      } catch {
        ALLOWED_ORIGIN_SET.add(cleaned);
      }
    }
  });
}

function isOriginAllowed(origin: string, reqHost?: string): boolean {
  if (!origin) return false;
  if (ALLOWED_ORIGIN_SET.has(origin)) return true;
  if (/^https?:\/\/localhost(:\d+)?$/.test(origin)) return true;
  if (/^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)) return true;
  // Préserver le domaine web courant via le header Host
  if (reqHost) {
    if (origin === `https://${reqHost}` || origin === `http://${reqHost}`) return true;
  }
  return false;
}

app.use((req, res, next) => {
  const origin = req.headers.origin;
  const host = req.headers.host;

  if (origin) {
    if (isOriginAllowed(origin, host)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.setHeader('Access-Control-Max-Age', '86400');
    } else {
      // Rejeter explicitement les pré-vols OPTIONS pour les origines non autorisées
      if (req.method === 'OPTIONS') {
        return res.status(403).json({ error: 'CORS: Origine non autorisée.' });
      }
    }
  }

  // Répondre immédiatement aux requêtes preflight OPTIONS autorisées
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

app.use(express.json({ limit: '25mb' }));

// Initialize Gemini client strictly on server-side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

async function callGeminiWithRetry<T>(fn: () => Promise<T>, retries = 2, delayMs = 1500): Promise<T> {
  try {
    return await fn();
  } catch (err: any) {
    const isTransient =
      err?.status === 503 ||
      err?.status === 429 ||
      err?.message?.includes('503') ||
      err?.message?.includes('high demand') ||
      err?.message?.includes('UNAVAILABLE') ||
      err?.message?.includes('RESOURCE_EXHAUSTED');

    if (retries > 0 && isTransient) {
      console.warn(`Modèle temporairement sollicité (${err?.status || '503'}). Nouvel essai dans ${delayMs}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return callGeminiWithRetry(fn, retries - 1, delayMs * 1.5);
    }
    throw err;
  }
}

async function generateWithModelFallback(params: any): Promise<any> {
  const models = ['gemini-3.8-flash', 'gemini-flash-latest'];
  let lastError: any = null;

  for (const model of models) {
    try {
      return await callGeminiWithRetry(
        () => ai.models.generateContent({ model, ...params }),
        1,
        1200
      );
    } catch (err: any) {
      lastError = err;
      const isUnavailable =
        err?.status === 503 ||
        err?.status === 429 ||
        err?.message?.includes('503') ||
        err?.message?.includes('high demand') ||
        err?.message?.includes('UNAVAILABLE');
      if (isUnavailable) {
        console.warn(`Modèle ${model} indisponible (503/429), tentative avec modèle de repli...`);
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: Date.now(),
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Helper pour extraire le token Bearer
function getBearerToken(req: express.Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.substring(7).trim();
}

// ----------------------------------------------------
// Endpoints Authentification Réelle & Profil (Phase 4)
// ----------------------------------------------------

app.post('/api/auth/register', (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;

    if (!email || typeof email !== 'string' || !email.includes('@') || !email.includes('.')) {
      return res.status(400).json({ error: 'Adresse email invalide.' });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'Le mot de passe est trop court (6 caractères minimum).' });
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({ error: 'Les mots de passe ne correspondent pas.' });
    }

    const sessionData = authStore.createUser(email, password);
    return res.status(201).json(sessionData);
  } catch (err: any) {
    return res.status(400).json({ error: err?.message || 'Erreur lors de l\'inscription.' });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Veuillez renseigner votre email et mot de passe.' });
    }

    const sessionData = authStore.verifyCredentials(email, password);
    return res.json(sessionData);
  } catch (err: any) {
    return res.status(401).json({ error: err?.message || 'Identifiants invalides.' });
  }
});

app.get('/api/auth/me', (req, res) => {
  const token = getBearerToken(req);
  if (!token) {
    return res.status(401).json({ error: 'Session non authentifiée.' });
  }

  const user = authStore.validateSession(token);
  if (!user) {
    return res.status(401).json({ error: 'Session expirée ou invalide.' });
  }

  return res.json({ user });
});

app.post('/api/auth/logout', (req, res) => {
  const token = getBearerToken(req) || req.body?.token;
  if (token) {
    authStore.revokeSession(token);
  }
  return res.json({ success: true, message: 'Déconnexion réussie.' });
});

app.post('/api/auth/change-password', (req, res) => {
  try {
    const token = getBearerToken(req);
    if (!token) {
      return res.status(401).json({ error: 'Non autorisé.' });
    }

    const user = authStore.validateSession(token);
    if (!user) {
      return res.status(401).json({ error: 'Session expirée.' });
    }

    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Le nouveau mot de passe doit comporter au moins 6 caractères.' });
    }

    authStore.changePassword(user.id, oldPassword, newPassword);
    return res.json({ success: true, message: 'Mot de passe modifié avec succès.' });
  } catch (err: any) {
    return res.status(400).json({ error: err?.message || 'Erreur lors de la modification du mot de passe.' });
  }
});

const handleDeleteAccountHandler = (req: express.Request, res: express.Response) => {
  try {
    const token = getBearerToken(req);
    if (!token) {
      return res.status(401).json({ error: 'Non autorisé.' });
    }

    const user = authStore.validateSession(token);
    if (!user) {
      return res.status(401).json({ error: 'Session expirée.' });
    }

    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: 'Veuillez saisir votre mot de passe pour confirmer la suppression.' });
    }

    authStore.deleteUser(user.id, password);
    return res.json({ success: true, message: 'Compte et données définitivement supprimés.' });
  } catch (err: any) {
    return res.status(400).json({ error: err?.message || 'Erreur lors de la suppression du compte.' });
  }
};

app.delete('/api/auth/delete-account', handleDeleteAccountHandler);
app.delete('/api/auth/account', handleDeleteAccountHandler);

// Synchronisation cloud sécurisée des données de l'utilisateur
app.get('/api/user/sync', (req, res) => {
  const token = getBearerToken(req);
  if (!token) {
    return res.status(401).json({ error: 'Non autorisé.' });
  }

  const user = authStore.validateSession(token);
  if (!user) {
    return res.status(401).json({ error: 'Session expirée.' });
  }

  const data = authStore.getUserData(user.id);
  return res.json({ data });
});

app.post('/api/user/sync', (req, res) => {
  const token = getBearerToken(req);
  if (!token) {
    return res.status(401).json({ error: 'Non autorisé.' });
  }

  const user = authStore.validateSession(token);
  if (!user) {
    return res.status(401).json({ error: 'Session expirée.' });
  }

  const { backup } = req.body;
  if (backup) {
    authStore.setUserData(user.id, backup);
  }
  return res.json({ success: true, timestamp: Date.now() });
});


app.post('/api/analyze', async (req, res) => {
  try {
    const {
      text,
      imageBase64,
      images,
      mimeType = 'image/jpeg',
      context,
      structuredContext,
      styleWeights,
      intensity = 50,
      responseLength = 'normale',
      flirtLevel = 'normal',
    } = req.body;

    const hasImages = (Array.isArray(images) && images.length > 0) || Boolean(imageBase64);
    if (!text && !hasImages) {
      return res.status(400).json({ error: 'Veuillez fournir une ou plusieurs captures d\'écran ou un message.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'Clé API Gemini non configurée sur le serveur. Veuillez vérifier vos variables d\'environnement.',
      });
    }

    const intensityNum = Number(intensity) || 50;
    const intensityDesc =
      intensityNum <= 20
        ? 'subtil (très naturel, léger, sans pression)'
        : intensityNum <= 40
        ? 'naturel (décontracté, fluide, sans forcer)'
        : intensityNum <= 60
        ? 'confiant (affirmé, attirant, percutant)'
        : intensityNum <= 80
        ? 'audacieux (punchy, joueur, piquant)'
        : 'très audacieux (très direct, maximal impact, audace assumée)';

    const weights = styleWeights || {
      humour: 25,
      charo: 25,
      romantique: 25,
      calculateur: 25,
    };

    const systemPrompt = `Tu es le cœur analytique de RIZZ AI (v2.5 - Version Finale), le copilote expert en dynamique relationnelle et conversation par message.
Ta mission est d'analyser la conversation ou le message fourni et de produire :
1. Une analyse perspicace et réaliste (Ton détecté, Intérêt estimé en %, Dynamique, Intention probable, Objectif recommandé).
2. EXACTEMENT 4 réponses distinctes, naturelles, non génériques et parfaitement calibrées selon les paramètres :
   - HUMOUR : taquin, plein d'esprit, léger, autodérision subtile ou taquinerie charmante.
   - CHARO : confiant, direct, séducteur sans filtre mais élégant, jamais vulgaire ni oppressant.
   - ROMANTIQUE : chaleureux, complice, sensible, séduisant avec sincérité et profondeur.
   - CALCULATEUR : stratégique, observateur, mesuré, calibré au mot près, préserve le mystère et renverse la dynamique.

PARAMÈTRES DE PERSONNALITÉ DU PROFIL :
- Longueur demandée : ${responseLength} (courte = 1 phrase percutante, normale = 1-2 phrases, développée = 2-3 phrases).
- Niveau de flirt : ${flirtLevel} (subtil = tension sous-jacente fine, normal = équilibré et charmeur, élevé = tension assumée sans ambiguïté).
- Niveau d'intensité : ${intensityNum}/100 -> Ton : ${intensityDesc}.
- Proportions des styles du profil :
  * Humour : ${weights.humour}%
  * Charo : ${weights.charo}%
  * Romantique : ${weights.romantique}%
  * Calculateur : ${weights.calculateur}%
Chaque catégorie doit garder son identité propre mais s'imprégner de l'intensité et du calibrage global.

RÈGLE D'OR DE SÉCURITÉ ET RESPECT :
Si la conversation montre un refus clair, catégorique ou une volonté d'arrêter (ex: "laisse-moi tranquille", "non merci", "j'ai quelqu'un"), NE PROPOSE AUCUNE stratégie pour contourner ce refus. Analyse la dynamique comme un refus clair et propose des réponses dignes, respectueuses et élégantes qui acceptent le refus sans insistance.`;

    const contents: Array<any> = [];

    let userPromptText = `Voici les données à analyser :\n`;
    if (structuredContext) {
      if (structuredContext.situation) userPromptText += `Situation relationnelle : ${structuredContext.situation}\n`;
      if (structuredContext.objective) userPromptText += `Objectif visé : ${structuredContext.objective}\n`;
      if (structuredContext.details) userPromptText += `Précisions : ${structuredContext.details}\n`;
    }
    if (context) {
      userPromptText += `Contexte général fourni : "${context}"\n`;
    }

    if (text) {
      userPromptText += `Message ou échange texte : """${text}"""\n`;
    }

    // Gestion multi-captures ou capture unique
    const allImages: Array<{ base64: string; mimeType: string }> = [];
    if (Array.isArray(images) && images.length > 0) {
      images.forEach((img: any) => {
        if (img.base64) {
          allImages.push({
            base64: img.base64.replace(/^data:image\/[a-zA-Z+]+;base64,/, ''),
            mimeType: img.mimeType || 'image/jpeg',
          });
        }
      });
    } else if (imageBase64) {
      allImages.push({
        base64: imageBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, ''),
        mimeType: mimeType || 'image/jpeg',
      });
    }

    if (allImages.length > 0) {
      userPromptText += `${allImages.length} capture(s) d'écran de conversation jointe(s). Reconstitue chronologiquement le fil de discussion, distingue les interlocuteurs, note les emojis, repère le dernier message reçu auquel répondre, et signale si une image est tronquée ou difficile à lire.\n`;
      allImages.forEach((img) => {
        contents.push({
          inlineData: {
            mimeType: img.mimeType,
            data: img.base64,
          },
        });
      });
    }

    userPromptText += `Génère l'analyse complète et les 4 réponses en français sous le format JSON requis.`;
    contents.push({ text: userPromptText });

    const response = await generateWithModelFallback({
      contents: { parts: contents },
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.8,
        responseMimeType: 'application/json',
        responseSchema: {
            type: Type.OBJECT,
            properties: {
              transcription: {
                type: Type.STRING,
                description: 'Transcription synthétique de l\'échange ou du dernier message reçu.',
              },
              tonDetecte: {
                type: Type.STRING,
                description: 'Ton détecté (ex: Joueur / taquin, Distant, Curieux, Enthousiaste, Refroidi).',
              },
              engagementEstime: {
                type: Type.NUMBER,
                description: 'Pourcentage estimé d\'intérêt ou d\'engagement (0 à 100). Estimation indicative.',
              },
              dynamique: {
                type: Type.STRING,
                description: 'Dynamique globale (ex: Positive et ouverte, En attente de relance, Asymétrique, Favorable).',
              },
              intentionProbable: {
                type: Type.STRING,
                description: 'Intention probable de l\'autre personne (ex: Teste ta répartie, Curiosité sincère, Relance timide).',
              },
              objectifRecommande: {
                type: Type.STRING,
                description: 'Objectif tactique recommandé (ex: Créer de la curiosité, Proposer un rendez-vous léger, Casser le rythme).',
              },
              imageQualityNote: {
                type: Type.STRING,
                description: 'Note éventuelle si une capture est tronquée ou partiellement lisible, sinon vide.',
              },
              responses: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    style: {
                      type: Type.STRING,
                      description: 'Doit être exactement: humour, charo, romantique, ou calculateur.',
                    },
                    title: {
                      type: Type.STRING,
                      description: 'Titre du style en majuscules (HUMOUR, CHARO, ROMANTIQUE, CALCULATEUR).',
                    },
                    text: {
                      type: Type.STRING,
                      description: 'Le message textuel prêt à envoyer, adapté à la longueur et au niveau de flirt.',
                    },
                    explanation: {
                      type: Type.STRING,
                      description: 'Courte explication stratégique en une phrase de l\'effet escompté.',
                    },
                  },
                  required: ['style', 'title', 'text'],
                },
              },
            },
            required: [
              'tonDetecte',
              'engagementEstime',
              'dynamique',
              'intentionProbable',
              'objectifRecommande',
              'responses',
            ],
          },
        },
      }
    );

    const rawText = response.text || '{}';
    const parsed = JSON.parse(rawText);

    // Ensure we have all 4 styles cleanly mapped
    const requiredStyles = ['humour', 'charo', 'romantique', 'calculateur'];
    const formattedResponses = requiredStyles.map((styleKey) => {
      const found = parsed.responses?.find((r: any) => r.style?.toLowerCase() === styleKey);
      if (found) {
        return {
          id: `${styleKey}-${Date.now()}`,
          style: styleKey,
          title: styleKey.toUpperCase(),
          text: found.text,
          explanation: found.explanation || '',
        };
      }
      return {
        id: `${styleKey}-${Date.now()}`,
        style: styleKey,
        title: styleKey.toUpperCase(),
        text: `Réponse ${styleKey} calibrée.`,
        explanation: 'Réponse générée sur mesure.',
      };
    });

    return res.json({
      transcription: parsed.transcription || text || 'Message analysé',
      tonDetecte: parsed.tonDetecte || 'Joueur et réceptif',
      engagementEstime: Math.min(100, Math.max(0, Math.round(parsed.engagementEstime ?? 70))),
      dynamique: parsed.dynamique || 'Positive',
      intentionProbable: parsed.intentionProbable || 'Créer de la complicité',
      objectifRecommande: parsed.objectifRecommande || 'Relancer avec curiosité',
      responses: formattedResponses,
    });
  } catch (err: any) {
    console.error('Erreur /api/analyze:', err);
    res.status(500).json({
      error: err?.message || 'Erreur lors de l\'analyse de la conversation. Veuillez réessayer.',
    });
  }
});

app.post('/api/regenerate', async (req, res) => {
  try {
    const { conversationText, context, style, styleWeights, intensity = 50, existingText } = req.body;

    if (!style) {
      return res.status(400).json({ error: 'Style manquant.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ error: 'Clé API non configurée.' });
    }

    const intensityNum = Number(intensity) || 50;
    const styleDescriptions: Record<string, string> = {
      humour: 'Humoristique, taquin, léger, plein d esprit, autodérision subtile ou taquinerie charmante',
      charo: 'Charo, confiant, direct, séducteur affirmé, sans détour mais élégant',
      romantique: 'Romantique, chaleureux, complice, touchant, sincère et séduisant',
      calculateur: 'Calculateur, stratégique, mesuré, observateur, calibré et intrigant',
    };

    const styleDesc = styleDescriptions[style.toLowerCase()] || 'Séduisant et naturel';

    const systemPrompt = `Tu es RIZZ AI. Tu dois générer UNE SEULE nouvelle réponse alternative pour la conversation suivante.
Style obligatoire : ${style.toUpperCase()} (${styleDesc}).
Intensité : ${intensityNum}/100.
RÈGLES :
- Réponse courte, percutante, prête à envoyer.
- Complètement différente de la version précédente : "${existingText || ''}".
- Naturelle, sans clichés, sans emojis excessifs (1 emoji max).
- Renvoie uniquement le texte du message à envoyer, sans guillemets ni introduction.`;

    const userPrompt = `Conversation ou dernier message : """${conversationText}"""
${context ? `Contexte : "${context}"` : ''}
Génère la nouvelle variante ${style.toUpperCase()} :`;

    const response = await generateWithModelFallback({
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.95,
      },
    });

    const newText = response.text?.trim().replace(/^["']|["']$/g, '') || 'Nouvelle variante prête.';

    res.json({ text: newText });
  } catch (err: any) {
    console.error('Erreur /api/regenerate:', err);
    res.status(500).json({ error: err?.message || 'Erreur lors de la régénération.' });
  }
});

// ==========================================
// PHASE 2 : ENDPOINT D'ANTICIPATION
// ==========================================
app.post('/api/anticipate', async (req, res) => {
  try {
    const {
      conversation,
      currentMove,
      context,
      styleWeights,
      intensity = 50,
      depth = 2,
      objective = 'continuer',
      turns = [],
      realResponse,
    } = req.body;

    if (!currentMove && !conversation) {
      return res.status(400).json({ error: 'Veuillez spécifier le message ou la conversation à anticiper.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ error: 'Clé API Gemini non configurée sur le serveur.' });
    }

    const intensityNum = Math.max(1, Math.min(100, Number(intensity) || 50));
    const depthNum = Math.max(1, Math.min(4, Number(depth) || 2));
    const weights = styleWeights || { humour: 25, charo: 25, romantique: 25, calculateur: 25 };

    const systemPrompt = `Tu es le Moteur d'Anticipation et l'Échiquier Conversationnel de RIZZ AI (v2.0).
Ton rôle est d'analyser la dynamique d'une conversation amoureuse / séduction avec PLUSIEURS COUPS D'AVANCE comme un grand maître d'échecs relationnel.

DONNÉES DU COUP :
- Coup actuel joué ou envisagé : "${currentMove || conversation}"
- Contexte général : "${context || 'Discussion récente'}"
- Historique des tours précédents : ${JSON.stringify(turns)}
- Objectif tactique choisi : ${objective}
- Profondeur d'anticipation demandée : ${depthNum} COUP(S)
- Poids des styles : Humour ${weights.humour}%, Charo ${weights.charo}%, Romantique ${weights.romantique}%, Calculateur ${weights.calculateur}%
- Intensité : ${intensityNum}/100

${realResponse ? `ATTENTION : L'utilisateur vient de recevoir la réponse RÉELLE de l'autre personne : "${realResponse}". Compare cette réponse réelle avec les prédictions antérieures et ajuste la dynamique.` : ''}

RÈGLES CRITIQUES D'ÉTHIQUE ET RESPECT :
Si la conversation ou la réaction montre un refus catégorique, clair ou une volonté explicite d'arrêter (ex: "Laisse-moi tranquille", "J'ai un copain", "Non merci"), NE JAMAIS créer de stratégie de manipulation ou de harcèlement pour contourner ce refus. Recommander une sortie élégante et digne qui respecte ses limites.

STRUCTURE REQUISE DU RÉSULTAT JSON :
1. "dynamics" :
   - interetEstime (0-100)
   - engagement (0-100)
   - flirt (0-100)
   - momentum (entre -20 et +30, ex: +14)
   - compatibiliteTon (0-100)
   - explications détaillées (interet, engagement, flirt, momentum, compatibiliteTon)
2. "branches" : 3 à 4 branches prédictives (A, B, C, D) représentant les réactions les plus probables de l'autre personne.
   - Les probabilités doivent totaliser environ 100%.
   - Pour chaque branche, générer 4 contre-réponses réelles dans les 4 styles : HUMOUR, CHARO, ROMANTIQUE, CALCULATEUR.
   - Chaque contre-réponse contient une explication "coachWhy" (Mode Coach : pourquoi ce coup fonctionne psychologiquement).
   ${depthNum >= 3 ? '- Pour profondeur >= 3, inclure pour les contre-réponses recommandées : "nextPredictedReaction" (réaction suivante probable).' : ''}
   ${depthNum >= 4 ? '- Pour profondeur = 4, inclure en plus : "nextFollowUpMove" (nouveau coup final pour sceller l\'échange).' : ''}
3. "bestMove" :
   - branchId ciblé
   - recommendedCounterMoveText
   - style (humour, charo, romantique ou calculateur)
   - why : explication globale synthétique
   - criteria : évaluation selon 5 critères précis :
     * coherenceTon
     * potentielEngagement
     * naturel
     * niveauFlirt
     * risqueInsistant (faible, modéré, etc.)
${realResponse ? '4. "comparison" : Analyse comparative entre la prévision la plus proche et la réponse réelle reçue.' : ''}`;

    const promptText = `Analyse le coup actuel et construis l'échiquier conversationnel prédictif à ${depthNum} coups d'avance.
Renvoie strictement la réponse au format JSON conforme.`;

    const response = await generateWithModelFallback({
      contents: promptText,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.85,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
            properties: {
              dynamics: {
                type: Type.OBJECT,
                properties: {
                  interetEstime: { type: Type.NUMBER },
                  engagement: { type: Type.NUMBER },
                  flirt: { type: Type.NUMBER },
                  momentum: { type: Type.NUMBER },
                  compatibiliteTon: { type: Type.NUMBER },
                  explications: {
                    type: Type.OBJECT,
                    properties: {
                      interet: { type: Type.STRING },
                      engagement: { type: Type.STRING },
                      flirt: { type: Type.STRING },
                      momentum: { type: Type.STRING },
                      compatibiliteTon: { type: Type.STRING },
                    },
                  },
                },
                required: ['interetEstime', 'engagement', 'flirt', 'momentum', 'compatibiliteTon'],
              },
              branches: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    label: { type: Type.STRING },
                    reactionText: { type: Type.STRING },
                    probability: { type: Type.NUMBER },
                    rationale: { type: Type.STRING },
                    counterMoves: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          id: { type: Type.STRING },
                          style: { type: Type.STRING },
                          title: { type: Type.STRING },
                          text: { type: Type.STRING },
                          coachWhy: { type: Type.STRING },
                          nextPredictedReaction: { type: Type.STRING },
                          nextFollowUpMove: { type: Type.STRING },
                        },
                        required: ['style', 'title', 'text', 'coachWhy'],
                      },
                    },
                  },
                  required: ['id', 'label', 'reactionText', 'probability', 'counterMoves'],
                },
              },
              bestMove: {
                type: Type.OBJECT,
                properties: {
                  branchId: { type: Type.STRING },
                  recommendedCounterMoveText: { type: Type.STRING },
                  style: { type: Type.STRING },
                  why: { type: Type.STRING },
                  criteria: {
                    type: Type.OBJECT,
                    properties: {
                      coherenceTon: { type: Type.STRING },
                      potentielEngagement: { type: Type.STRING },
                      naturel: { type: Type.STRING },
                      niveauFlirt: { type: Type.STRING },
                      risqueInsistant: { type: Type.STRING },
                    },
                    required: ['coherenceTon', 'potentielEngagement', 'naturel', 'niveauFlirt', 'risqueInsistant'],
                  },
                },
                required: ['recommendedCounterMoveText', 'style', 'why', 'criteria'],
              },
              comparison: {
                type: Type.OBJECT,
                properties: {
                  actualResponseReceived: { type: Type.STRING },
                  closestPredictedBranchLabel: { type: Type.STRING },
                  closestPredictedProbability: { type: Type.NUMBER },
                  gapAnalysis: { type: Type.STRING },
                  strategicAdjustment: { type: Type.STRING },
                },
              },
            },
            required: ['dynamics', 'branches', 'bestMove'],
          },
        },
      }
    );

    const parsed = JSON.parse(response.text || '{}');

    // Assurer la normalisation des probabilités des branches
    if (Array.isArray(parsed.branches) && parsed.branches.length > 0) {
      const sumProb = parsed.branches.reduce((acc: number, b: any) => acc + (Number(b.probability) || 0), 0);
      if (sumProb > 0 && Math.abs(sumProb - 100) > 3) {
        parsed.branches = parsed.branches.map((b: any) => ({
          ...b,
          probability: Math.round((Number(b.probability) / sumProb) * 100),
        }));
      }
    }

    const tree = {
      id: `tree_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      currentMove: currentMove || conversation || 'Coup initial',
      depth: depthNum,
      objective,
      dynamics: {
        interetEstime: Math.min(100, Math.max(0, Math.round(parsed.dynamics?.interetEstime ?? 72))),
        engagement: Math.min(100, Math.max(0, Math.round(parsed.dynamics?.engagement ?? 80))),
        flirt: Math.min(100, Math.max(0, Math.round(parsed.dynamics?.flirt ?? 65))),
        momentum: Number(parsed.dynamics?.momentum ?? 12),
        compatibiliteTon: Math.min(100, Math.max(0, Math.round(parsed.dynamics?.compatibiliteTon ?? 85))),
        explications: parsed.dynamics?.explications || {
          interet: 'Indique l\'attirance et la curiosité ressentie par l\'autre personne.',
          engagement: 'Mesure la rapidité et la longueur de ses réponses.',
          flirt: 'Niveau d\'espièglerie et de tension romantique présente.',
          momentum: 'Vitesse d\'accélération positive de la conversation.',
          compatibiliteTon: 'Alignement entre votre répartie et son style d\'humour.',
        },
      },
      branches: parsed.branches || [],
      bestMove: parsed.bestMove || {
        branchId: parsed.branches?.[0]?.id || 'branch-1',
        recommendedCounterMoveText: 'Excellente ouverture.',
        style: 'charo',
        why: 'Maintient le cadre tout en invitant au dialogue.',
        criteria: {
          coherenceTon: 'Très aligné',
          potentielEngagement: 'Élevé',
          naturel: 'Fluide',
          niveauFlirt: 'Équilibré',
          risqueInsistant: 'Très faible',
        },
      },
      comparison: parsed.comparison || undefined,
    };

    return res.json(tree);
  } catch (err: any) {
    console.error('Erreur /api/anticipate:', err);
    res.status(500).json({ error: err?.message || 'Erreur lors du calcul d\'anticipation.' });
  }
});

// Middleware Vite pour dev ou static pour prod
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Serveur RIZZ AI démarré sur http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Impossible de démarrer le serveur:', err);
});
