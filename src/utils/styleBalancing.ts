import { IntensityCategory, StyleType, StyleWeights } from '../types';

/**
 * Ajuste les poids des 4 styles pour garantir à chaque instant que:
 * humour + charo + romantique + calculateur = 100 (%)
 */
export function rebalanceStyles(
  currentWeights: StyleWeights,
  changedKey: StyleType,
  rawNewValue: number
): StyleWeights {
  const keys: StyleType[] = ['humour', 'charo', 'romantique', 'calculateur'];
  const targetVal = Math.max(0, Math.min(100, Math.round(rawNewValue)));

  const otherKeys = keys.filter((k) => k !== changedKey);
  const remaining = 100 - targetVal;

  if (remaining === 0) {
    return {
      humour: changedKey === 'humour' ? 100 : 0,
      charo: changedKey === 'charo' ? 100 : 0,
      romantique: changedKey === 'romantique' ? 100 : 0,
      calculateur: changedKey === 'calculateur' ? 100 : 0,
    };
  }

  const currentOtherSum = otherKeys.reduce((acc, k) => acc + currentWeights[k], 0);

  const nextWeights: Record<StyleType, number> = {
    ...currentWeights,
    [changedKey]: targetVal,
  };

  if (currentOtherSum === 0) {
    // Si tous les autres étaient à 0, répartir équitablement le reste
    const baseShare = Math.floor(remaining / otherKeys.length);
    let remainder = remaining % otherKeys.length;

    otherKeys.forEach((k) => {
      nextWeights[k] = baseShare + (remainder > 0 ? 1 : 0);
      if (remainder > 0) remainder--;
    });
  } else {
    // Répartition proportionnelle
    let distributedSum = 0;
    otherKeys.forEach((k) => {
      const share = Math.round((currentWeights[k] / currentOtherSum) * remaining);
      nextWeights[k] = share;
      distributedSum += share;
    });

    // Corriger les écarts d'arrondi pour faire exactement 100%
    let diff = remaining - distributedSum;
    if (diff !== 0) {
      // Ajuster sur la plus grande valeur parmi les autres pour minimiser la distorsion
      const sortedOthers = [...otherKeys].sort((a, b) => nextWeights[b] - nextWeights[a]);
      for (const k of sortedOthers) {
        if (diff === 0) break;
        if (diff > 0) {
          nextWeights[k] += 1;
          diff -= 1;
        } else if (diff < 0 && nextWeights[k] > 0) {
          nextWeights[k] -= 1;
          diff += 1;
        }
      }
    }
  }

  // Vérification de sécurité finale : clamp et somme stricte
  let total = keys.reduce((acc, k) => acc + nextWeights[k], 0);
  if (total !== 100) {
    const delta = 100 - total;
    // Trouver une clé autre que changedKey pouvant encaisser l'ajustement
    const adjustKey = otherKeys.find((k) => nextWeights[k] + delta >= 0) || changedKey;
    nextWeights[adjustKey] += delta;
  }

  return {
    humour: Math.max(0, nextWeights.humour),
    charo: Math.max(0, nextWeights.charo),
    romantique: Math.max(0, nextWeights.romantique),
    calculateur: Math.max(0, nextWeights.calculateur),
  };
}

/**
 * Retourne le texte lisible du style actuel (ex: "Charo 35 % + Calculateur 65 %")
 */
export function getStyleSummaryText(weights: StyleWeights): string {
  const nameMap: Record<StyleType, string> = {
    humour: 'Humour',
    charo: 'Charo',
    romantique: 'Romantique',
    calculateur: 'Calculateur',
  };

  const active = (['humour', 'charo', 'romantique', 'calculateur'] as StyleType[])
    .filter((k) => weights[k] > 0)
    .sort((a, b) => weights[b] - weights[a])
    .map((k) => `${nameMap[k]} ${weights[k]} %`);

  if (active.length === 0) return 'Équilibré (25% chaque)';
  return active.join(' + ');
}

/**
 * Calcul de la catégorie d'intensité (1-100)
 */
export function getIntensityCategory(intensity: number): {
  category: IntensityCategory;
  label: string;
  badgeClass: string;
  description: string;
} {
  const val = Math.max(1, Math.min(100, Math.round(intensity)));

  if (val <= 20) {
    return {
      category: 'subtil',
      label: 'Subtil',
      badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      description: 'Léger, poli, naturel et sans pression perceptible.',
    };
  }
  if (val <= 40) {
    return {
      category: 'naturel',
      label: 'Naturel',
      badgeClass: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
      description: 'Fluide, décontracté et authentique.',
    };
  }
  if (val <= 60) {
    return {
      category: 'confiant',
      label: 'Confiant',
      badgeClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      description: 'Affirmé, charismatique et engageant.',
    };
  }
  if (val <= 80) {
    return {
      category: 'audacieux',
      label: 'Audacieux',
      badgeClass: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      description: 'Direct, taquin et piquant sans ambiguïté.',
    };
  }
  return {
    category: 'très audacieux',
    label: 'Très audacieux',
    badgeClass: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    description: 'Impact maximal, séduction frontale et assumée.',
  };
}

/**
 * Convertit un hex en valeurs RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

/**
 * Génère le système de couleurs cohérent à partir de la couleur d'accent
 */
export function generateThemePalette(accentHex: string) {
  const { r, g, b } = hexToRgb(accentHex || '#007AFF');
  return {
    primary: accentHex,
    rgb: `${r}, ${g}, ${b}`,
    lightBg: `rgba(${r}, ${g}, ${b}, 0.08)`,
    subtleBorder: `rgba(${r}, ${g}, ${b}, 0.18)`,
    glow: `0 8px 28px rgba(${r}, ${g}, ${b}, 0.22)`,
    gradient: `linear-gradient(135deg, rgba(${r}, ${g}, ${b}, 0.95), rgba(${Math.min(255, r + 40)}, ${Math.max(0, g - 20)}, ${Math.min(255, b + 30)}, 0.9))`,
  };
}
