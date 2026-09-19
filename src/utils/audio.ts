import { getCache } from '../service/cache';

type SoundKind = 'move' | 'capture' | 'preview';

export const MUSIC_TRACKS = [
  { id: 'quiet-square', title: 'Casa Silenciosa', style: 'Piano minimalista' },
  { id: 'golden-lines', title: 'Linhas Douradas', style: 'Barroco suave' },
  { id: 'night-file', title: 'Arquivo Noturno', style: 'Piano romântico' },
  { id: 'deep-calculation', title: 'Cálculo Profundo', style: 'Piano dramático' },
  { id: 'moon-board', title: 'Tabuleiro Lunar', style: 'Ambient impressionista' },
  { id: 'daylight-study', title: 'Estudo ao Amanhecer', style: 'Cordas ambientais' },
  { id: 'white-clouds', title: 'Nuvens Claras', style: 'Piano contemporâneo' },
  { id: 'still-room', title: 'Sala Imóvel', style: 'Minimalismo calmo' },
  { id: 'midnight-blitz', title: 'Blitz da Meia-noite', style: 'Lo-fi instrumental' },
  { id: 'open-terminal', title: 'Terminal Aberto', style: 'Ambient expansivo' },
] as const;

export type MusicTrackId = typeof MUSIC_TRACKS[number]['id'];
export type MusicChoice = 'off' | 'random' | MusicTrackId;

const PROGRESSIONS: Record<MusicTrackId, number[][]> = {
  'quiet-square': [[261.63, 329.63, 392], [293.66, 369.99, 440], [220, 277.18, 329.63], [246.94, 311.13, 369.99]],
  'golden-lines': [[293.66, 369.99, 440], [329.63, 415.3, 493.88], [261.63, 329.63, 392], [220, 277.18, 329.63]],
  'night-file': [[220, 277.18, 329.63], [261.63, 311.13, 392], [196, 246.94, 293.66], [246.94, 311.13, 369.99]],
  'deep-calculation': [[196, 246.94, 293.66], [220, 261.63, 329.63], [174.61, 220, 261.63], [196, 246.94, 329.63]],
  'moon-board': [[261.63, 311.13, 392], [293.66, 349.23, 440], [246.94, 293.66, 369.99], [220, 277.18, 329.63]],
  'daylight-study': [[261.63, 392, 523.25], [246.94, 369.99, 493.88], [293.66, 440, 587.33], [220, 329.63, 440]],
  'white-clouds': [[329.63, 392, 493.88], [293.66, 369.99, 440], [261.63, 329.63, 415.3], [246.94, 311.13, 392]],
  'still-room': [[220, 329.63], [246.94, 369.99], [196, 293.66], [220, 329.63]],
  'midnight-blitz': [[110, 164.81, 220], [123.47, 185, 246.94], [98, 146.83, 196], [103.83, 155.56, 207.65]],
  'open-terminal': [[130.81, 196, 261.63], [146.83, 220, 293.66], [110, 164.81, 220], [123.47, 185, 246.94]],
};

const TRACK_PROFILES: Record<MusicTrackId, { tempo: number; melody: number[]; wave: OscillatorType }> = {
  'quiet-square': { tempo: 720, melody: [0, 1, 2, 1, 0, 2], wave: 'sine' },
  'golden-lines': { tempo: 430, melody: [0, 1, 2, 1, 2, 1, 0, 1], wave: 'triangle' },
  'night-file': { tempo: 680, melody: [2, 1, 0, 1, 2, 0], wave: 'sine' },
  'deep-calculation': { tempo: 540, melody: [0, 0, 2, 1, 0, 2, 1, 1], wave: 'triangle' },
  'moon-board': { tempo: 760, melody: [1, 2, 1, 0, 2, 1], wave: 'sine' },
  'daylight-study': { tempo: 610, melody: [0, 2, 1, 2, 0, 1, 2, 1], wave: 'triangle' },
  'white-clouds': { tempo: 500, melody: [2, 1, 2, 0, 1, 2, 1, 0], wave: 'sine' },
  'still-room': { tempo: 1050, melody: [0, 1, 0, 1], wave: 'sine' },
  'midnight-blitz': { tempo: 350, melody: [0, 1, 2, 1, 0, 2, 1, 2], wave: 'square' },
  'open-terminal': { tempo: 820, melody: [0, 2, 1, 0, 1, 2], wave: 'triangle' },
};

let ambientContext: AudioContext | null = null;
let ambientTimer: number | null = null;

const chooseTrack = (choice: Exclude<MusicChoice, 'off'>): MusicTrackId =>
  choice === 'random' ? MUSIC_TRACKS[Math.floor(Math.random() * MUSIC_TRACKS.length)].id : choice;

const playChord = (context: AudioContext, notes: number[], loFi: boolean) => {
  notes.forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = loFi && index === 0 ? 'square' : index === 0 ? 'sine' : 'triangle';
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(loFi ? 0.035 : index === 0 ? 0.065 : 0.028, context.currentTime + 0.22);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 2.1);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 2.2);
  });
};

const playNote = (context: AudioContext, frequency: number, wave: OscillatorType, volume: number, duration: number) => {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = wave;
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0.0001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(volume, context.currentTime + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + duration + 0.03);
};

export const startAmbientMusic = (choice: Exclude<MusicChoice, 'off'> = 'random'): MusicTrackId | null => {
  if (getCache('prefs:soundOn') === false) return null;
  if (ambientContext) return null;
  try {
    const browserWindow = window as typeof window & { webkitAudioContext?: typeof AudioContext };
    const AudioContextConstructor = browserWindow.AudioContext || browserWindow.webkitAudioContext;
    if (!AudioContextConstructor) return null;
    const trackId = chooseTrack(choice);
    const progression = PROGRESSIONS[trackId];
    const profile = TRACK_PROFILES[trackId];
    ambientContext = new AudioContextConstructor();
    void ambientContext.resume();
    let step = 0;
    const playNext = () => {
      if (!ambientContext) return;
      const chord = progression[Math.floor(step / 4) % progression.length];
      const melodyIndex = profile.melody[step % profile.melody.length] % chord.length;
      if (step % 4 === 0) playChord(ambientContext, chord, trackId === 'midnight-blitz');
      playNote(ambientContext, chord[melodyIndex] * 2, profile.wave, trackId === 'midnight-blitz' ? 0.035 : 0.045, profile.tempo / 1000 * 0.72);
      if (step % 2 === 0) playNote(ambientContext, chord[0] / 2, 'sine', 0.05, profile.tempo / 1000 * 0.5);
      step += 1;
    };
    playNext();
    ambientTimer = window.setInterval(playNext, profile.tempo);
    return trackId;
  } catch {
    stopAmbientMusic();
    return null;
  }
};

export const stopAmbientMusic = (): void => {
  if (ambientTimer !== null) window.clearInterval(ambientTimer);
  ambientTimer = null;
  if (ambientContext) void ambientContext.close();
  ambientContext = null;
};

export const playSound = (kind: SoundKind = 'move'): void => {
  if (getCache('prefs:soundOn') === false || typeof window === 'undefined') return;
  try {
    const browserWindow = window as typeof window & { webkitAudioContext?: typeof AudioContext };
    const AudioContextConstructor = browserWindow.AudioContext || browserWindow.webkitAudioContext;
    if (!AudioContextConstructor) return;
    const context = new AudioContextConstructor();
    void context.resume();
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
  } catch {  }
};
