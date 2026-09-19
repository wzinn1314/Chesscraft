import { getCache } from '../service/cache';

type SoundKind = 'move' | 'capture' | 'preview';

export const playSound = (kind: SoundKind = 'move'): void => {
  if (getCache('prefs:soundOn') === false || typeof window === 'undefined') return;

  try {
    const browserWindow = window as typeof window & { webkitAudioContext?: typeof AudioContext };
    const AudioContextConstructor = browserWindow.AudioContext || browserWindow.webkitAudioContext;
    if (!AudioContextConstructor) return;
    const context = new AudioContextConstructor();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = kind === 'capture' ? 'triangle' : 'sine';
    oscillator.frequency.value = kind === 'capture' ? 260 : kind === 'preview' ? 620 : 440;
    gain.gain.setValueAtTime(0.05, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.11);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.12);
    oscillator.addEventListener('ended', () => void context.close());
  } catch {
    // O som é opcional e não deve impedir uma jogada.
  }
};
