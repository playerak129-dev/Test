import {
  AnticipationDepth,
  AnticipationTree,
  ConversationAnalysis,
  ConversationalObjective,
  ResponseOption,
  StyleType,
  StyleWeights,
} from '../types';

/**
 * Moteur Heuristique Autonome Hors Ligne (Phase 3)
 * Permet à RIZZ AI de continuer à fonctionner même sans connexion Internet.
 */
export const offlineEngine = {
  analyzeText(text: string, context?: string): ConversationAnalysis {
    const lower = (text + ' ' + (context || '')).toLowerCase();

    // Détection d'indicateurs de ton
    const hasEmojis = /[\u{1F300}-\u{1F9FF}]/u.test(text);
    const hasQuestion = text.includes('?');
    const hasExclamation = text.includes('!');
    const isShort = text.trim().length < 15;
    const isCold =
      lower.includes('ok') ||
      lower.includes('d\'accord') ||
      lower.includes('comme tu veux') ||
      lower.includes('ouais') ||
      (isShort && !hasEmojis);

    let tonDetecte = 'Taquin et ouvert';
    let engagementEstime = 65;
    let dynamique = 'Positive et réceptive';
    let intentionProbable = 'Créer du lien et voir ta répartie';
    let objectifRecommande = 'Répondre avec légèreté pour attiser la curiosité';

    if (isCold) {
      tonDetecte = 'Réservé ou distant';
      engagementEstime = 42;
      dynamique = 'Ralentie';
      intentionProbable = 'Tester ton investissement ou manque de temps';
      objectifRecommande = 'Recadrer avec détachement sans forcer';
    } else if (hasEmojis && (lower.includes('haha') || lower.includes('mdr') || lower.includes('lol'))) {
      tonDetecte = 'Complice et joueur';
      engagementEstime = 88;
      dynamique = 'Excellente dynamique';
      intentionProbable = 'Entretenir la complicité et rire ensemble';
      objectifRecommande = 'Poursuivre le jeu et glisser une accroche séduisante';
    } else if (hasQuestion) {
      tonDetecte = 'Curieux et intéressé';
      engagementEstime = 78;
      dynamique = 'Ouverture d\'échange';
      intentionProbable = 'En savoir plus sur toi';
      objectifRecommande = 'Répondre avec esprit puis retourner une question intrigante';
    }

    return {
      tonDetecte,
      engagementEstime,
      dynamique,
      intentionProbable,
      objectifRecommande,
      transcription: text || 'Message analysé en mode autonome',
    };
  },

  generateResponses(params: {
    text: string;
    context?: string;
    styleWeights: StyleWeights;
    intensity: number;
    responseLength?: 'courte' | 'normale' | 'développée';
    flirtLevel?: 'subtil' | 'normal' | 'élevé';
  }): ResponseOption[] {
    const { text, context, intensity, responseLength = 'normale', flirtLevel = 'normal' } = params;
    const timestamp = Date.now();
    const isAudacious = intensity > 60;
    const isSubtle = intensity < 35;

    // Modèles intelligents par style
    const responsesByStyle: Record<StyleType, { text: string; explanation: string; coachWhy: string }> = {
      humour: {
        text: isAudacious
          ? "Je devrais probablement te facturer le temps que tu passes à hanter mes pensées, mais je te fais un tarif d'ami."
          : isSubtle
          ? "J'avoue que ta répartie marque des points, mais attend de voir la suite."
          : "C'est audacieux comme message. Mais j'aime bien les gens qui ont du goût.",
        explanation: "Désamorce la tension par une taquinerie élégante sans prise de tête.",
        coachWhy: "L'autodérision ou la vanne taquine crée un pic de dopamine sans risque de paraître nécessiteux.",
      },
      charo: {
        text: isAudacious
          ? "Arrête de faire semblant, on sait tous les deux que ce café ensemble est déjà inévitable."
          : isSubtle
          ? "Tu as un charme indéniable quand tu t'y mets. C'est presque dangereux."
          : "J'aime ton énergie. On devrait continuer cette conversation autour d'un verre cette semaine.",
        explanation: "Assume l'attirance et pose un cadre clair avec assurance.",
        coachWhy: "La clarté de l'intention attire quand elle est accompagnée de décontraction et d'assurance.",
      },
      romantique: {
        text: isAudacious
          ? "Tu as ce don rare de rendre une simple notification beaucoup plus intéressante que tout le reste de ma journée."
          : isSubtle
          ? "C'est agréable de discuter avec quelqu'un qui a une vraie sensibilité."
          : "Il y a une vraie complicité dans nos échanges, et honnêtement ça fait plaisir.",
        explanation: "Met en avant la connexion émotionnelle et la sincérité des échanges.",
        coachWhy: "Valide l'autre personne de façon spécifique pour renforcer le sentiment de complicité unique.",
      },
      calculateur: {
        text: isAudacious
          ? "Je te laisse deviner si je suis impressionné ou si j'attends encore ton vrai meilleur coup."
          : isSubtle
          ? "Bien joué. Je garde cette remarque sous le coude pour le moment opportun."
          : "Pas mal. Mais je ne dévoile pas toutes mes cartes dès le premier tour.",
        explanation: "Garde le mystère, temporise et place l'autre en position d'obtenir votre validation.",
        coachWhy: "L'effet d'incomplétude (Zeigarnik) pousse l'interlocuteur à relancer pour en savoir davantage.",
      },
    };

    const styles: StyleType[] = ['humour', 'charo', 'romantique', 'calculateur'];
    return styles.map((style) => {
      const data = responsesByStyle[style];
      let finalText = data.text;

      // Ajustement de la longueur si courte
      if (responseLength === 'courte' && finalText.length > 50) {
        finalText = finalText.split(',')[0] + '.';
      }

      return {
        id: `${style}_offline_${timestamp}`,
        style,
        title: style.toUpperCase(),
        text: finalText,
        explanation: data.explanation + ' (Généré par le moteur hors ligne)',
        coachWhy: data.coachWhy,
      };
    });
  },

  anticipateOffline(params: {
    currentMove: string;
    depth: AnticipationDepth;
    objective?: ConversationalObjective;
    styleWeights: StyleWeights;
    intensity: number;
  }): AnticipationTree {
    const { currentMove, depth = 2, objective = 'continuer' } = params;

    return {
      id: `offline_tree_${Date.now()}`,
      timestamp: Date.now(),
      currentMove: currentMove || 'Message analysé hors ligne',
      depth,
      objective,
      positionActuelle: "Position solide : initiative conservée avec un équilibre taquin.",
      dynamics: {
        interetEstime: 74,
        engagement: 76,
        flirt: 65,
        momentum: 12,
        compatibiliteTon: 82,
        explications: {
          interet: "Attirance équilibrée, propice à une relance mesurée.",
          engagement: "Rythme de discussion favorable.",
          flirt: "Tension présente mais à doser avec finesse.",
          momentum: "+12 : Accélération positive de l'échange.",
          compatibiliteTon: "Bonne résonance des styles.",
        },
      },
      branches: [
        {
          id: 'branch-a',
          label: 'A — Réaction curieuse / interrogative',
          reactionText: '« Pourquoi tu dis ça ? 👀 »',
          probability: 45,
          rationale: "La curiosité est la réaction humaine la plus prévisible face à un message énigmatique.",
          counterMoves: [
            {
              id: 'cm-a1',
              style: 'humour',
              title: 'HUMOUR',
              text: "Parce que j'aime bien vérifier si tu es aussi attentive en vrai que par message.",
              coachWhy: "Transforme sa question en jeu tout en gardant le contrôle du rythme.",
              nextPredictedReaction: depth >= 3 ? "« Haha je suis encore pire en vrai »" : undefined,
              nextFollowUpMove: depth >= 4 ? "« Parfait, prépare-toi pour jeudi soir alors. »" : undefined,
            },
            {
              id: 'cm-a2',
              style: 'charo',
              title: 'CHARO',
              text: "Tu le sauras quand on se verra cette semaine.",
              coachWhy: "Crée une transition directe vers la proposition de rencontre.",
              nextPredictedReaction: depth >= 3 ? "« Ah oui ? Tu es si confiant que ça ? »" : undefined,
              nextFollowUpMove: depth >= 4 ? "« Toujours quand l'enjeu en vaut la peine. »" : undefined,
            },
            {
              id: 'cm-a3',
              style: 'romantique',
              title: 'ROMANTIQUE',
              text: "Parce que discuter avec toi sort vraiment de l'ordinaire.",
              coachWhy: "Apporte une validation chaleureuse.",
            },
            {
              id: 'cm-a4',
              style: 'calculateur',
              title: 'CALCULATEUR',
              text: "Disons que j'observe d'abord avant de tout révéler.",
              coachWhy: "Maintient l'asymétrie d'information.",
            },
          ],
        },
        {
          id: 'branch-b',
          label: 'B — Réaction rieuse / complice',
          reactionText: '« Hahaha t\'es pas possible 😂 »',
          probability: 35,
          rationale: "Si la personne apprécie l'humour, elle valide par le rire sans trop en dire.",
          counterMoves: [
            {
              id: 'cm-b1',
              style: 'humour',
              title: 'HUMOUR',
              text: "Au moins on ne s'ennuie pas. Tu devrais me remercier.",
              coachWhy: "Capitalise sur le rire pour ancrer la valeur perçue.",
            },
            {
              id: 'cm-b2',
              style: 'charo',
              title: 'CHARO',
              text: "C'est pour ça que tu continues à me parler.",
              coachWhy: "Inverse la validation avec aplomb.",
            },
            {
              id: 'cm-b3',
              style: 'romantique',
              title: 'ROMANTIQUE',
              text: "Si je te fais sourire, ma mission du jour est accomplie.",
              coachWhy: "Tonalité douce et flatteuse.",
            },
            {
              id: 'cm-b4',
              style: 'calculateur',
              title: 'CALCULATEUR',
              text: "Attends, le meilleur reste encore à venir.",
              coachWhy: "Crée une boucle ouverte future.",
            },
          ],
        },
        {
          id: 'branch-c',
          label: 'C — Réaction plus timide / courte',
          reactionText: '« Haha oui peut-être 🙂 »',
          probability: 20,
          rationale: "L'autre personne temporise ou n'ose pas trop s'avancer.",
          counterMoves: [
            {
              id: 'cm-c1',
              style: 'humour',
              title: 'HUMOUR',
              text: "Ce 'peut-être' est suspect. Je mène l'enquête.",
              coachWhy: "Relance légère sans mettre de pression.",
            },
            {
              id: 'cm-c2',
              style: 'charo',
              title: 'CHARO',
              text: "Je prends ça pour un oui assumé à 90%.",
              coachWhy: "Avance sans demander d'autorisation excessive.",
            },
            {
              id: 'cm-c3',
              style: 'romantique',
              title: 'ROMANTIQUE',
              text: "Prends ton temps, les meilleures choses ne se précipitent pas.",
              coachWhy: "Rassure et apporte de la sécurité.",
            },
            {
              id: 'cm-c4',
              style: 'calculateur',
              title: 'CALCULATEUR',
              text: "On verra bien comment tu te débrouilles au prochain tour.",
              coachWhy: "Donne un challenge amical.",
            },
          ],
        },
      ],
      bestMove: {
        branchId: 'branch-a',
        recommendedCounterMoveText: "Parce que j'aime bien vérifier si tu es aussi attentive en vrai que par message.",
        style: 'humour',
        why: "Maintient la dynamique haute en ouvrant naturellement la porte à un date tout en restant dans le jeu.",
        criteria: {
          coherenceTon: 'Excellente',
          potentielEngagement: 'Très élevé',
          naturel: 'Fluide',
          niveauFlirt: 'Parfaitement dosé',
          risqueInsistant: 'Négligeable',
        },
      },
    };
  },
};
