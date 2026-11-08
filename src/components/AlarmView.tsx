/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  Plus,
  Trash2,
  Volume2,
  VolumeX,
  Music,
  ChevronDown,
  ChevronUp,
  Upload,
  Clock,
  Play,
  Square,
  Timer,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AlarmItem, CustomSound } from '../types';
import { BUILTIN_SOUNDS, TRANSLATIONS } from '../constants';
import { TimeWheel } from './TimeWheel';
import { Stopwatch } from './Stopwatch';

interface AlarmViewProps {
  alarms: AlarmItem[];
  customSounds: CustomSound[];
  selectedSound: string;
  onSelectSound: (soundId: string) => void;
  onAddAlarm: (h: number, m: number, s: number, soundId: string) => void;
  onToggleAlarm: (id: number) => void;
  onDeleteAlarm: (id: number) => void;
  onUploadSound: (file: File) => void;
  onDeleteCustomSound: (id: string) => void;
  onPreviewSound: (soundId: string) => void;
  onStopPreviewSound: () => void;
  isPlayingPreview: boolean;
  lang: 'id' | 'en';
}

export const AlarmView: React.FC<AlarmViewProps> = ({
  alarms,
  customSounds,
  selectedSound,
  onSelectSound,
  onAddAlarm,
  onToggleAlarm,
  onDeleteAlarm,
  onUploadSound,
  onDeleteCustomSound,
  onPreviewSound,
  onStopPreviewSound,
  isPlayingPreview,
  lang,
}) => {
  const now = new Date();
  const [subTab, setSubTab] = useState<'alarm' | 'stopwatch'>('alarm');
  const [hour, setHour] = useState(now.getHours());
  const [minute, setMinute] = useState(now.getMinutes());
  const [second, setSecond] = useState(0);
  const [isSoundPickerOpen, setIsSoundPickerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = TRANSLATIONS[lang];

  const getSoundName = (id: string): string => {
    if (BUILTIN_SOUNDS[id]) return BUILTIN_SOUNDS[id].n;
    const custom = customSounds.find((c) => c.id === id);
    return custom ? custom.n : 'Beep';
  };

  const handleCreateAlarm = () => {
    onAddAlarm(hour, minute, second, selectedSound);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadSound(file);
      e.target.value = '';
    }
  };

  const activeAlarmCount = alarms.filter((a) => a.on).length;

  return (
    <div className="flex-1 min-h-0 flex flex-col relative z-10 px-4 pb-24 overflow-y-auto custom-scroll">
      {/* Sub-tab Navigation: Alarm vs Stopwatch */}
      <div className="flex-none p-1 rounded-2xl bg-black/5 dark:bg-white/5 border border-white/20 dark:border-white/10 backdrop-blur-md flex items-center justify-between gap-1 mb-4 select-none relative shadow-sm">
        <button
          type="button"
          onClick={() => setSubTab('alarm')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-colors relative cursor-pointer flex items-center justify-center gap-1.5 ${
            subTab === 'alarm' ? 'text-white' : 'text-[var(--mu)] hover:text-[var(--tx)]'
          }`}
        >
          {subTab === 'alarm' && (
            <motion.div
              layoutId="timeSubTabIndicator"
              className="absolute inset-0 rounded-xl -z-0"
              style={{
                background:
                  'linear-gradient(135deg, var(--ac), color-mix(in srgb, var(--ac) 60%, #ff7ad9))',
                boxShadow:
                  '0 4px 14px -3px color-mix(in srgb, var(--ac) 70%, transparent)',
              }}
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            />
          )}
          <Clock className="w-3.5 h-3.5 relative z-10" />
          <span className="relative z-10">{t.alarmSub}</span>
          {activeAlarmCount > 0 && (
            <span
              className={`relative z-10 text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                subTab === 'alarm'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'bg-[var(--ac)] text-white'
              }`}
            >
              {activeAlarmCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setSubTab('stopwatch')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-colors relative cursor-pointer flex items-center justify-center gap-1.5 ${
            subTab === 'stopwatch' ? 'text-white' : 'text-[var(--mu)] hover:text-[var(--tx)]'
          }`}
        >
          {subTab === 'stopwatch' && (
            <motion.div
              layoutId="timeSubTabIndicator"
              className="absolute inset-0 rounded-xl -z-0"
              style={{
                background:
                  'linear-gradient(135deg, var(--ac), color-mix(in srgb, var(--ac) 60%, #ff7ad9))',
                boxShadow:
                  '0 4px 14px -3px color-mix(in srgb, var(--ac) 70%, transparent)',
              }}
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            />
          )}
          <Timer className="w-3.5 h-3.5 relative z-10" />
          <span className="relative z-10">{t.stopwatch}</span>
        </button>
      </div>

      {/* Animated Content Panels */}
      <AnimatePresence mode="wait" initial={false}>
        {subTab === 'alarm' ? (
          <motion.div
            key="alarm-panel"
            initial={{ opacity: 0, y: 12, filter: 'blur(3px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -12, filter: 'blur(3px)' }}
            transition={{
              type: 'spring',
              stiffness: 350,
              damping: 30,
              mass: 0.8,
            }}
            className="flex flex-col space-y-4"
          >
            {/* Time Wheel Picker Card */}
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[var(--ac)]" />
                  <h2 className="text-sm font-bold text-[var(--tx)]">{t.newAlarm}</h2>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-[var(--ac)]/15 text-[var(--ac)]">
                  {String(hour).padStart(2, '0')}:{String(minute).padStart(2, '0')}:
                  {String(second).padStart(2, '0')}
                </span>
              </div>

              <div className="flex items-center justify-center gap-2 py-2">
                <TimeWheel label={t.hr} max={23} value={hour} onChange={setHour} />
                <span className="text-2xl font-bold text-[var(--mu)] -mt-2">:</span>
                <TimeWheel label={t.mi} max={59} value={minute} onChange={setMinute} />
                <span className="text-2xl font-bold text-[var(--mu)] -mt-2">:</span>
                <TimeWheel label={t.se} max={59} value={second} onChange={setSecond} />
              </div>

              {/* Add Alarm Action Button */}
              <button
                type="button"
                onClick={handleCreateAlarm}
                className="w-full mt-4 py-3 rounded-2xl text-sm font-bold text-white shadow-md flex items-center justify-center gap-2 transition-all transform active:scale-98 cursor-pointer"
                style={{
                  background:
                    'linear-gradient(135deg, var(--ac), color-mix(in srgb, var(--ac) 65%, #ffffff))',
                  boxShadow: '0 8px 20px -6px var(--ac)',
                }}
              >
                <Plus className="w-5 h-5 stroke-[2.5]" />
                <span>{t.newAlarm}</span>
              </button>
            </div>

            {/* Sound Selection Card */}
            <div className="glass-card p-4">
              <div
                onClick={() => {
                  if (isSoundPickerOpen) onStopPreviewSound();
                  setIsSoundPickerOpen(!isSoundPickerOpen);
                }}
                className="flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center gap-2">
                  <Music className="w-4 h-4 text-[var(--ac)]" />
                  <span className="text-sm font-semibold text-[var(--tx)]">
                    {t.sound}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-[var(--mu)]">
                  <span>{getSoundName(selectedSound)}</span>
                  {isSoundPickerOpen ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </div>

              {isSoundPickerOpen && (
                <div className="mt-4 pt-3 border-t border-[var(--ln)] space-y-2">
                  {/* Built-in sounds */}
                  <div className="text-[11px] font-bold text-[var(--mu)] uppercase tracking-wider mb-1">
                    Built-in
                  </div>
                  {Object.keys(BUILTIN_SOUNDS).map((soundKey) => {
                    const item = BUILTIN_SOUNDS[soundKey];
                    const isSelected = selectedSound === soundKey;
                    return (
                      <div
                        key={soundKey}
                        onClick={() => {
                          onSelectSound(soundKey);
                          onPreviewSound(soundKey);
                        }}
                        className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-[var(--ac)]/15 border border-[var(--ac)]/30'
                            : 'hover:bg-black/5 dark:hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              isSelected
                                ? 'border-[var(--ac)] bg-[var(--ac)]'
                                : 'border-[var(--mu)]'
                            }`}
                          >
                            {isSelected && (
                              <div className="w-1.5 h-1.5 rounded-full bg-white" />
                            )}
                          </div>
                          <span className="text-sm font-medium text-[var(--tx)]">
                            {item.n}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isPlayingPreview && isSelected) {
                              onStopPreviewSound();
                            } else {
                              onSelectSound(soundKey);
                              onPreviewSound(soundKey);
                            }
                          }}
                          className="p-1 text-[var(--mu)] hover:text-[var(--ac)] transition-colors cursor-pointer"
                          title={isPlayingPreview && isSelected ? t.stopSound : t.testSound}
                        >
                          {isPlayingPreview && isSelected ? (
                            <Square className="w-4 h-4 fill-current text-[var(--ac)]" />
                          ) : (
                            <Play className="w-4 h-4 fill-current" />
                          )}
                        </button>
                      </div>
                    );
                  })}

                  {/* Custom sounds */}
                  {customSounds.length > 0 && (
                    <>
                      <div className="text-[11px] font-bold text-[var(--mu)] uppercase tracking-wider mt-3 mb-1">
                        Custom
                      </div>
                      {customSounds.map((sound) => {
                        const isSelected = selectedSound === sound.id;
                        return (
                          <div
                            key={sound.id}
                            onClick={() => {
                              onSelectSound(sound.id);
                              onPreviewSound(sound.id);
                            }}
                            className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-[var(--ac)]/15 border border-[var(--ac)]/30'
                                : 'hover:bg-black/5 dark:hover:bg-white/5 border border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                  isSelected
                                    ? 'border-[var(--ac)] bg-[var(--ac)]'
                                    : 'border-[var(--mu)]'
                                }`}
                              >
                                {isSelected && (
                                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                )}
                              </div>
                              <span className="text-sm font-medium text-[var(--tx)] truncate">
                                {sound.n}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (isPlayingPreview && isSelected) {
                                    onStopPreviewSound();
                                  } else {
                                    onSelectSound(sound.id);
                                    onPreviewSound(sound.id);
                                  }
                                }}
                                className="p-1 text-[var(--mu)] hover:text-[var(--ac)] cursor-pointer"
                              >
                                {isPlayingPreview && isSelected ? (
                                  <Square className="w-4 h-4 fill-current text-[var(--ac)]" />
                                ) : (
                                  <Play className="w-4 h-4 fill-current" />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteCustomSound(sound.id);
                                }}
                                className="p-1 text-[var(--mu)] hover:text-red-500 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}

                  {/* Upload Custom Sound button */}
                  <label className="flex items-center justify-center gap-2 w-full py-2.5 mt-2 rounded-xl border border-dashed border-[var(--ln)] hover:border-[var(--ac)] text-xs font-semibold text-[var(--tx)] cursor-pointer transition-all hover:bg-black/5 dark:hover:bg-white/5">
                    <Upload className="w-4 h-4 text-[var(--ac)]" />
                    <span>+ {t.addS}</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="audio/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Alarms List */}
            <div>
              <div className="flex items-center justify-between px-1 mb-2">
                <h3 className="text-xs font-bold text-[var(--mu)] uppercase tracking-wider">
                  {t.alarmSub}
                </h3>
                <span className="text-[11px] font-semibold text-[var(--mu)]">
                  {alarms.length}
                </span>
              </div>

              {alarms.length === 0 ? (
                <div className="glass-card text-center py-10 px-4">
                  <VolumeX className="w-10 h-10 text-[var(--mu)] mx-auto mb-2 opacity-50" />
                  <p className="text-xs text-[var(--mu)]">{t.noal}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {alarms.map((alarm) => (
                    <div
                      key={alarm.i}
                      className="glass-card flex items-center justify-between p-4 transition-all hover:border-[var(--ac)]/30 group"
                    >
                      <div>
                        <div className="text-2xl font-bold font-mono tracking-tight text-[var(--tx)] tabular-nums">
                          {String(alarm.h).padStart(2, '0')}:
                          {String(alarm.m).padStart(2, '0')}:
                          {String(alarm.s).padStart(2, '0')}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5 text-xs text-[var(--mu)]">
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>{getSoundName(alarm.snd)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={Boolean(alarm.on)}
                          onChange={() => onToggleAlarm(alarm.i)}
                          className="custom-switch cursor-pointer"
                          aria-label="Toggle alarm on/off"
                        />
                        <button
                          type="button"
                          onClick={() => onDeleteAlarm(alarm.i)}
                          className="p-1.5 text-[var(--mu)] hover:text-red-500 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          title="Delete alarm"
                          aria-label="Delete alarm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="stopwatch-panel"
            initial={{ opacity: 0, y: 12, filter: 'blur(3px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -12, filter: 'blur(3px)' }}
            transition={{
              type: 'spring',
              stiffness: 350,
              damping: 30,
              mass: 0.8,
            }}
          >
            <Stopwatch lang={lang} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
