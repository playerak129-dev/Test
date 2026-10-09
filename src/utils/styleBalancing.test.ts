import { rebalanceStyles, getIntensityCategory, generateThemePalette, getStyleSummaryText } from './styleBalancing';
import { StyleType, StyleWeights } from '../types';

export function runStyleTests(): { name: string; success: boolean; message: string }[] {
  const results: { name: string; success: boolean; message: string }[] = [];

  // 1. Test sum = 100% on start
  let weights: StyleWeights = { humour: 25, charo: 25, romantique: 25, calculateur: 25 };
  let sum = weights.humour + weights.charo + weights.romantique + weights.calculateur;
  results.push({
    name: 'Initial sum is 100%',
    success: sum === 100,
    message: `Initial sum = ${sum}%`,
  });

  // 2. Test user change to Charo 35%
  weights = rebalanceStyles(weights, 'charo', 35);
  sum = weights.humour + weights.charo + weights.romantique + weights.calculateur;
  results.push({
    name: 'Charo 35% rebalancing maintains 100%',
    success: sum === 100 && weights.charo === 35,
    message: `Charo: ${weights.charo}%, Total: ${sum}%`,
  });

  // 3. Test user change to Calculateur 65%
  weights = rebalanceStyles(weights, 'calculateur', 65);
  sum = weights.humour + weights.charo + weights.romantique + weights.calculateur;
  results.push({
    name: 'Calculateur 65% rebalancing maintains 100%',
    success: sum === 100 && weights.calculateur === 65,
    message: `Calculateur: ${weights.calculateur}%, Total: ${sum}%`,
  });

  // 4. Test 100% saturation
  const saturated = rebalanceStyles(weights, 'humour', 100);
  const saturatedSum = saturated.humour + saturated.charo + saturated.romantique + saturated.calculateur;
  results.push({
    name: '100% single style sets others to 0 and totals 100%',
    success: saturatedSum === 100 && saturated.humour === 100 && saturated.charo === 0,
    message: `Humour: ${saturated.humour}%, Others: 0%, Total: ${saturatedSum}%`,
  });

  // 5. Test random 100 iterations of random changes
  let allRandomPassed = true;
  let testW: StyleWeights = { humour: 25, charo: 25, romantique: 25, calculateur: 25 };
  const keys: StyleType[] = ['humour', 'charo', 'romantique', 'calculateur'];

  for (let i = 0; i < 100; i++) {
    const key = keys[i % 4];
    const target = Math.floor(Math.random() * 101);
    testW = rebalanceStyles(testW, key, target);
    const currSum = testW.humour + testW.charo + testW.romantique + testW.calculateur;
    if (currSum !== 100 || testW[key] !== target) {
      allRandomPassed = false;
      break;
    }
  }

  results.push({
    name: '100 random continuous adjustments always equal exact 100%',
    success: allRandomPassed,
    message: allRandomPassed ? 'All 100 randomized passes held sum === 100%' : 'Failed on random loop',
  });

  // 6. Test intensity brackets
  const i1 = getIntensityCategory(15).category === 'subtil';
  const i2 = getIntensityCategory(35).category === 'naturel';
  const i3 = getIntensityCategory(55).category === 'confiant';
  const i4 = getIntensityCategory(75).category === 'audacieux';
  const i5 = getIntensityCategory(95).category === 'très audacieux';

  results.push({
    name: 'Intensity 1-100 categories map correctly',
    success: i1 && i2 && i3 && i4 && i5,
    message: 'All 5 intensity tiers verified',
  });

  return results;
}
