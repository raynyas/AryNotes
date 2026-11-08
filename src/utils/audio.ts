/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BUILTIN_SOUNDS } from '../constants';
import { CustomSound } from '../types';
import { sendAndroidSystemNotification, requestAndroidNotificationPermission } from './notifications';

let audioContext: AudioContext | null = null;
let stopCurrentSoundFn: (() => void) | null = null;
let loopTimer: ReturnType<typeof setTimeout> | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioContext) {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      audioContext = new AudioCtx();
    }
  }
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume().catch(() => {});
  }
  return audioContext;
}

export function stopAudioPlayback(): void {
  if (stopCurrentSoundFn) {
    try {
      stopCurrentSoundFn();
    } catch {
      // ignore
    }
    stopCurrentSoundFn = null;
  }
  if (loopTimer) {
    clearTimeout(loopTimer);
    loopTimer = null;
  }
}

export function playAudioSound(
  soundId: string,
  loop = false,
  customSounds: CustomSound[] = [],
  onEnd?: () => void
): void {
  stopAudioPlayback();

  // Check if it's a custom uploaded sound
  const custom = customSounds.find((s) => s.id === soundId);
  if (custom) {
    const audio = new Audio(custom.u);
    audio.loop = loop;
    audio.play().catch((err) => {
      console.warn('Playback blocked or failed:', err);
    });

    if (!loop && onEnd) {
      audio.onended = () => {
        onEnd();
      };
    }

    stopCurrentSoundFn = () => {
      audio.pause();
      audio.currentTime = 0;
    };
    return;
  }

  // Synthesizer built-in sound
  const soundDef = BUILTIN_SOUNDS[soundId] || BUILTIN_SOUNDS.beep;
  const ctx = getAudioContext();
  if (!ctx) return;

  let isPlaying = true;

  const playSequence = () => {
    if (!isPlaying || !ctx) return;
    const now = ctx.currentTime;
    let cursor = now;

    soundDef.s.forEach(([freq, duration]) => {
      if (freq > 0 && ctx) {
        try {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = soundDef.w;
          osc.frequency.setValueAtTime(freq, cursor);

          gain.gain.setValueAtTime(0.3, cursor);
          gain.gain.exponentialRampToValueAtTime(0.0001, cursor + duration);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(cursor);
          osc.stop(cursor + duration);
        } catch (e) {
          console.warn('Synth error:', e);
        }
      }
      cursor += duration;
    });

    const totalDurationMs = Math.max(200, (cursor - ctx.currentTime) * 1000);

    if (loop && isPlaying) {
      loopTimer = setTimeout(playSequence, totalDurationMs);
    } else if (!loop && onEnd) {
      loopTimer = setTimeout(() => {
        if (isPlaying && onEnd) onEnd();
      }, totalDurationMs);
    }
  };

  playSequence();

  stopCurrentSoundFn = () => {
    isPlaying = false;
    if (loopTimer) {
      clearTimeout(loopTimer);
      loopTimer = null;
    }
  };
}

export function triggerVibration(pattern: number[] = [400, 200, 400]): void {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  } catch {
    // ignore
  }
}

export function requestNotificationPermission(): void {
  requestAndroidNotificationPermission();
}

export function sendSystemNotification(title: string, options?: NotificationOptions): void {
  sendAndroidSystemNotification(title, {
    body: options?.body,
    tag: options?.tag,
  });
}
