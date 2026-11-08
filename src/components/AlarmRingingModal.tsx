/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BellRing, CheckCircle2 } from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { Task } from '../types';

interface AlarmRingingModalProps {
  isOpen: boolean;
  onStop: () => void;
  lang: 'id' | 'en';
  soundName: string;
  unfinishedTasks: Task[];
}

export const AlarmRingingModal: React.FC<AlarmRingingModalProps> = ({
  isOpen,
  onStop,
  lang,
  soundName,
  unfinishedTasks,
}) => {
  if (!isOpen) return null;
  const t = TRANSLATIONS[lang];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl bg-[var(--cd)] p-6 text-center shadow-2xl border border-white/20 overflow-hidden">
        {/* Pulsing ring background glow */}
        <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none opacity-20">
          <div className="w-56 h-56 rounded-full bg-[var(--ac)] animate-ping" />
        </div>

        <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center bg-gradient-to-tr from-[var(--ac)] to-pink-500 text-white shadow-xl shadow-[var(--ac)]/40 mb-4 animate-bounce">
          <BellRing className="w-10 h-10 animate-pulse" />
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-[var(--tx)]">
          {t.ringTitle}
        </h2>
        <p className="text-sm font-medium text-[var(--mu)] mt-1">
          {soundName}
        </p>

        {unfinishedTasks.length > 0 && (
          <div className="my-4 p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-left text-xs text-[var(--tx)]">
            <div className="font-semibold text-red-500 mb-1 flex items-center gap-1.5">
              <span>⚠️</span> {t.remMsg} ({unfinishedTasks.length})
            </div>
            <ul className="space-y-1 max-h-24 overflow-y-auto custom-scroll pr-1">
              {unfinishedTasks.slice(0, 3).map((task) => (
                <li key={task.i} className="flex items-center gap-1 text-[var(--mu)] truncate">
                  <CheckCircle2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="truncate">{task.n}</span>
                </li>
              ))}
              {unfinishedTasks.length > 3 && (
                <li className="text-[10px] text-[var(--mu)] italic pl-5">
                  +{unfinishedTasks.length - 3} lainnya...
                </li>
              )}
            </ul>
          </div>
        )}

        <button
          onClick={onStop}
          className="w-full mt-4 py-3.5 px-6 rounded-2xl text-lg font-bold text-white shadow-xl transition-all transform active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #ef4444, #f43f5e)',
            boxShadow: '0 8px 24px -6px rgba(239, 68, 68, 0.6)',
          }}
        >
          {t.stop}
        </button>
      </div>
    </div>
  );
};
