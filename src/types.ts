/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Task {
  i: number; // ID / timestamp
  n: string; // Title / Name
  d: number; // Completed timestamp (0 = incomplete)
  e: number; // Deadline timestamp (0 = no deadline)
  nt?: number; // Flag indicating overdue notification was shown
}

export interface AlarmItem {
  i: number; // ID
  h: number; // Hour (0 - 23)
  m: number; // Minute (0 - 59)
  s: number; // Second (0 - 59)
  on: number; // 1 = active, 0 = inactive
  snd: string; // Sound id: 'beep' | 'digital' | 'chime' | 'melody' | 'radar' | custom sound ID
}

export interface WallpaperItem {
  id: string;
  u: string; // Base64 data URL
  x?: number; // Horizontal position % (0 - 100, default 50)
  y?: number; // Vertical position % (0 - 100, default 50)
  z?: number; // Zoom % (100 - 300, default 100)
}

export interface CustomSound {
  id: string;
  n: string; // Name
  u: string; // Data URL
}

export interface AppSettings {
  lang: 'id' | 'en';
  theme: 'light' | 'dark';
  ac: string; // Accent color hex
  rem: 'daily' | 'weekly' | 'custom';
  last: number; // Last reminder timestamp
  cd: number[]; // Custom reminder days: 0 = Sun, 1 = Mon, ..., 6 = Sat
  ch: number; // Custom reminder hour
  cm: number; // Custom reminder minute
  cs: number; // Custom reminder second
  snd: string; // Default alarm sound
  wp: string | null; // Active wallpaper ID
}

export type AppPage = 'dash' | 'alarm' | 'set';
