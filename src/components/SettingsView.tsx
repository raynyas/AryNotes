/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  Globe,
  Palette,
  Bell,
  Image as ImageIcon,
  Plus,
  Trash2,
  Check,
  RotateCcw,
  Sliders,
} from 'lucide-react';
import { AppSettings, WallpaperItem } from '../types';
import { ACCENT_SWATCHES, TRANSLATIONS } from '../constants';

interface SettingsViewProps {
  settings: AppSettings;
  wallpapers: WallpaperItem[];
  onUpdateSettings: (updates: Partial<AppSettings>) => void;
  onAddWallpaper: (file: File) => void;
  onDeleteWallpaper: (id: string) => void;
  onUpdateWallpaperParams: (
    id: string,
    params: { x?: number; y?: number; z?: number }
  ) => void;
  onResetWallpaper: () => void;
  onApplyWallpaper: (id: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  wallpapers,
  onUpdateSettings,
  onAddWallpaper,
  onDeleteWallpaper,
  onUpdateWallpaperParams,
  onResetWallpaper,
  onApplyWallpaper,
}) => {
  const [previewId, setPreviewId] = useState<string | null>(settings.wp);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = TRANSLATIONS[settings.lang];
  const locale = settings.lang === 'id' ? 'id-ID' : 'en-GB';

  // Weekdays for custom reminder: Mon=1, Tue=2, Wed=3, Thu=4, Fri=5, Sat=6, Sun=0
  const daysOfWeek = [1, 2, 3, 4, 5, 6, 0];

  const getDayName = (dayNum: number) => {
    // 2024-01-01 is Monday (1)
    const date = new Date(2024, 0, dayNum === 0 ? 7 : dayNum);
    return date.toLocaleDateString(locale, { weekday: 'short' });
  };

  const selectedWallpaper = wallpapers.find((w) => w.id === previewId);

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onAddWallpaper(file);
      e.target.value = '';
    }
  };

  const toggleCustomDay = (day: number) => {
    const current = settings.cd || [];
    const next = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day];
    onUpdateSettings({ cd: next });
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col relative z-10 px-4 pb-24 overflow-y-auto custom-scroll space-y-4">
      {/* Language */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-[var(--ac)]" />
            <span className="text-sm font-semibold text-[var(--tx)]">
              {t.lang}
            </span>
          </div>
          <select
            value={settings.lang}
            onChange={(e) =>
              onUpdateSettings({ lang: e.target.value as 'id' | 'en' })
            }
            className="px-3 py-1.5 rounded-xl bg-[var(--bg)] border border-[var(--ln)] text-xs font-semibold text-[var(--tx)] focus:outline-none focus:ring-2 focus:ring-[var(--ac)] cursor-pointer"
          >
            <option value="id">Bahasa Indonesia</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>

      {/* Theme */}
      <div className="glass-card p-4">
        <div className="text-sm font-semibold text-[var(--tx)] mb-2">
          {t.theme}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onUpdateSettings({ theme: 'light' })}
            className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
              settings.theme === 'light'
                ? 'bg-[var(--ac)] text-white border-[var(--ac)] shadow-sm'
                : 'border-[var(--ln)] text-[var(--tx)] hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            {t.light}
          </button>
          <button
            type="button"
            onClick={() => onUpdateSettings({ theme: 'dark' })}
            className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
              settings.theme === 'dark'
                ? 'bg-[var(--ac)] text-white border-[var(--ac)] shadow-sm'
                : 'border-[var(--ln)] text-[var(--tx)] hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            {t.dark}
          </button>
        </div>
      </div>

      {/* Accent Color */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Palette className="w-4 h-4 text-[var(--ac)]" />
          <span className="text-sm font-semibold text-[var(--tx)]">
            {t.color}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          {ACCENT_SWATCHES.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => onUpdateSettings({ ac: color })}
              className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 flex items-center justify-center ${
                settings.ac.toLowerCase() === color.toLowerCase()
                  ? 'border-[var(--tx)] scale-110 shadow-md ring-2 ring-white/50'
                  : 'border-transparent'
              }`}
              style={{ backgroundColor: color }}
              aria-label={`Color ${color}`}
            >
              {settings.ac.toLowerCase() === color.toLowerCase() && (
                <Check className="w-4 h-4 text-white stroke-[3]" />
              )}
            </button>
          ))}

          {/* Native color picker */}
          <div className="relative">
            <input
              type="color"
              value={settings.ac}
              onChange={(e) => onUpdateSettings({ ac: e.target.value })}
              className="w-8 h-8 rounded-full cursor-pointer border border-[var(--ln)] p-0 bg-transparent"
              title="Custom Color"
            />
          </div>
        </div>
      </div>

      {/* Reminder Notification */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-2">
          <Bell className="w-4 h-4 text-[var(--ac)]" />
          <span className="text-sm font-semibold text-[var(--tx)]">
            {t.rem}
          </span>
        </div>

        <select
          value={settings.rem}
          onChange={(e) =>
            onUpdateSettings({
              rem: e.target.value as 'daily' | 'weekly' | 'custom',
              last: Date.now(),
            })
          }
          className="w-full px-3 py-2 rounded-xl bg-[var(--bg)] border border-[var(--ln)] text-xs font-semibold text-[var(--tx)] focus:outline-none focus:ring-2 focus:ring-[var(--ac)] cursor-pointer mb-3"
        >
          <option value="daily">{t.daily}</option>
          <option value="weekly">{t.weekly}</option>
          <option value="custom">{t.custom}</option>
        </select>

        {settings.rem === 'custom' && (
          <div className="pt-2 border-t border-[var(--ln)] space-y-3 animate-in fade-in">
            <div className="flex flex-wrap gap-1.5">
              {daysOfWeek.map((day) => {
                const isSelected = (settings.cd || []).includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleCustomDay(day)}
                    className={`py-1.5 px-2.5 rounded-xl text-xs font-semibold border transition-all ${
                      isSelected
                        ? 'bg-[var(--ac)] text-white border-[var(--ac)] shadow-sm'
                        : 'border-[var(--ln)] text-[var(--mu)] hover:text-[var(--tx)]'
                    }`}
                  >
                    {getDayName(day)}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <span className="text-[10px] font-bold text-[var(--mu)] uppercase block mb-1">
                  {t.hr}
                </span>
                <select
                  value={settings.ch ?? 9}
                  onChange={(e) =>
                    onUpdateSettings({ ch: parseInt(e.target.value, 10) })
                  }
                  className="w-full px-2 py-1.5 rounded-xl bg-[var(--bg)] border border-[var(--ln)] text-xs text-[var(--tx)]"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>
                      {String(i).padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <span className="text-[10px] font-bold text-[var(--mu)] uppercase block mb-1">
                  {t.mi}
                </span>
                <select
                  value={settings.cm ?? 0}
                  onChange={(e) =>
                    onUpdateSettings({ cm: parseInt(e.target.value, 10) })
                  }
                  className="w-full px-2 py-1.5 rounded-xl bg-[var(--bg)] border border-[var(--ln)] text-xs text-[var(--tx)]"
                >
                  {Array.from({ length: 60 }, (_, i) => (
                    <option key={i} value={i}>
                      {String(i).padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <span className="text-[10px] font-bold text-[var(--mu)] uppercase block mb-1">
                  {t.se}
                </span>
                <select
                  value={settings.cs ?? 0}
                  onChange={(e) =>
                    onUpdateSettings({ cs: parseInt(e.target.value, 10) })
                  }
                  className="w-full px-2 py-1.5 rounded-xl bg-[var(--bg)] border border-[var(--ln)] text-xs text-[var(--tx)]"
                >
                  {Array.from({ length: 60 }, (_, i) => (
                    <option key={i} value={i}>
                      {String(i).padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>



      {/* Wallpaper Manager */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-[var(--ac)]" />
            <span className="text-sm font-semibold text-[var(--tx)]">
              {t.wall}
            </span>
          </div>

          <label className="btn-icon w-8 h-8 cursor-pointer" title={t.uploadWallpaper}>
            <Plus className="w-4 h-4" />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageFile}
              className="hidden"
            />
          </label>
        </div>

        {/* Wallpaper Thumbnails Grid */}
        {wallpapers.length > 0 ? (
          <div className="grid grid-cols-3 gap-2.5 mb-4">
            {wallpapers.map((w) => {
              const isActive = settings.wp === w.id;
              const isSelected = previewId === w.id;
              return (
                <div
                  key={w.id}
                  onClick={() => setPreviewId(w.id)}
                  className={`aspect-square rounded-2xl bg-cover bg-center relative cursor-pointer border-2 transition-all overflow-hidden ${
                    isSelected
                      ? 'border-[var(--ac)] ring-2 ring-[var(--ac)]/40 shadow-md scale-102'
                      : 'border-transparent hover:border-black/20 dark:hover:border-white/20'
                  }`}
                  style={{ backgroundImage: `url(${w.u})` }}
                >
                  {isActive && (
                    <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-[var(--ac)] text-white text-[9px] font-bold shadow-sm">
                      {t.activeTag}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (previewId === w.id) setPreviewId(null);
                      onDeleteWallpaper(w.id);
                    }}
                    className="absolute left-1.5 bottom-1.5 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm"
                    title="Delete"
                    aria-label="Delete wallpaper"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-[var(--mu)] border border-dashed border-[var(--ln)] rounded-2xl mb-3">
            {settings.lang === 'id'
              ? 'Belum ada wallpaper yang diunggah'
              : 'No wallpapers uploaded yet'}
          </div>
        )}

        {/* Wallpaper Live Preview & Adjustments */}
        {selectedWallpaper && (
          <div className="pt-3 border-t border-[var(--ln)] space-y-3 animate-in fade-in">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--mu)]">
              <Sliders className="w-3.5 h-3.5" />
              <span>{t.previewMockup}</span>
            </div>

            {/* Phone mockup */}
            <div className="phone-mock">
              <div className="phone-wallpaper-mask">
                <div
                  className="w-full h-full bg-cover transition-all"
                  style={{
                    backgroundImage: `url(${selectedWallpaper.u})`,
                    backgroundPosition: `${selectedWallpaper.x ?? 50}% ${
                      selectedWallpaper.y ?? 50
                    }%`,
                    transform: `scale(${(selectedWallpaper.z ?? 100) / 100})`,
                    transformOrigin: `${selectedWallpaper.x ?? 50}% ${
                      selectedWallpaper.y ?? 50
                    }%`,
                  }}
                />
              </div>

              {/* Mockup app elements */}
              <div className="absolute left-3 top-2.5 text-[11px] font-extrabold gradient-text">
                AryNotes
              </div>
              <div className="mock-bar top-8 h-4 opacity-50" />
              <div className="mock-bar top-14 h-5" />
              <div className="mock-bar top-21 h-6" />
              <div className="mock-bar top-29 h-6" />
              <div className="mock-bar bottom-2.5 h-6 rounded-full" />
            </div>

            {/* Slider controls */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-24 text-[var(--mu)] shrink-0">{t.zoom}</span>
                <input
                  type="range"
                  min="100"
                  max="300"
                  value={selectedWallpaper.z ?? 100}
                  onChange={(e) =>
                    onUpdateWallpaperParams(selectedWallpaper.id, {
                      z: parseInt(e.target.value, 10),
                    })
                  }
                  className="flex-1 accent-[var(--ac)] cursor-pointer"
                />
                <span className="w-10 text-right font-mono text-[var(--mu)]">
                  {selectedWallpaper.z ?? 100}%
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-24 text-[var(--mu)] shrink-0">{t.posx}</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={selectedWallpaper.x ?? 50}
                  onChange={(e) =>
                    onUpdateWallpaperParams(selectedWallpaper.id, {
                      x: parseInt(e.target.value, 10),
                    })
                  }
                  className="flex-1 accent-[var(--ac)] cursor-pointer"
                />
                <span className="w-10 text-right font-mono text-[var(--mu)]">
                  {selectedWallpaper.x ?? 50}%
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-24 text-[var(--mu)] shrink-0">{t.posy}</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={selectedWallpaper.y ?? 50}
                  onChange={(e) =>
                    onUpdateWallpaperParams(selectedWallpaper.id, {
                      y: parseInt(e.target.value, 10),
                    })
                  }
                  className="flex-1 accent-[var(--ac)] cursor-pointer"
                />
                <span className="w-10 text-right font-mono text-[var(--mu)]">
                  {selectedWallpaper.y ?? 50}%
                </span>
              </div>
            </div>

            {/* Apply / Cancel buttons */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  onApplyWallpaper(selectedWallpaper.id);
                }}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white shadow-md transition-all active:scale-98"
                style={{
                  background:
                    'linear-gradient(135deg, var(--ac), color-mix(in srgb, var(--ac) 65%, #ffffff))',
                }}
              >
                {t.use}
              </button>
              <button
                type="button"
                onClick={() => setPreviewId(null)}
                className="py-2.5 px-4 rounded-xl border border-[var(--ln)] text-xs font-semibold text-[var(--tx)] hover:bg-black/5 dark:hover:bg-white/5 transition-all"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        )}

        {/* Reset / Clear wallpaper */}
        {settings.wp && (
          <button
            type="button"
            onClick={onResetWallpaper}
            className="w-full mt-3 py-2.5 rounded-xl border border-[var(--ln)] text-xs font-semibold text-red-500 hover:bg-red-500/10 transition-all flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.reset}</span>
          </button>
        )}
      </div>
    </div>
  );
};
