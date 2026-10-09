/**
 * Retours tactiles et haptiques pour une expérience mobile native premium
 */
export function triggerHaptic(type: 'light' | 'medium' | 'success' | 'warning' = 'light') {
  if (typeof window === 'undefined' || !window.navigator || !window.navigator.vibrate) {
    return;
  }

  try {
    switch (type) {
      case 'light':
        window.navigator.vibrate(8);
        break;
      case 'medium':
        window.navigator.vibrate(18);
        break;
      case 'success':
        window.navigator.vibrate([10, 30, 15]);
        break;
      case 'warning':
        window.navigator.vibrate([20, 40, 20]);
        break;
      default:
        window.navigator.vibrate(10);
    }
  } catch {
    // Les navigateurs peuvent refuser si l'utilisateur n'a pas interagi
  }
}
