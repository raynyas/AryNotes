/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Clock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TRANSLATIONS } from '../constants';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, deadline: number) => void;
  lang: 'id' | 'en';
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  lang,
}) => {
  const [taskName, setTaskName] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [selectedHour, setSelectedHour] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  const t = TRANSLATIONS[lang];
  const locale = lang === 'id' ? 'id-ID' : 'en-GB';

  // Generate month names
  const months = Array.from({ length: 12 }, (_, i) => {
    return new Date(2026, i, 1).toLocaleDateString(locale, { month: 'long' });
  });

  useEffect(() => {
    if (isOpen) {
      setTaskName('');
      setSelectedMonth('');
      setSelectedDay('');
      setSelectedHour('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSave = () => {
    const trimmed = taskName.trim();
    if (!trimmed) return;

    let deadline = 0;
    if (selectedMonth !== '' && selectedDay !== '') {
      const year = new Date().getFullYear();
      const monthIdx = parseInt(selectedMonth, 10);
      const day = parseInt(selectedDay, 10);
      const hour = selectedHour !== '' ? parseInt(selectedHour, 10) : 0;
      deadline = new Date(year, monthIdx, day, hour, 0, 0).getTime();
    }

    onAdd(trimmed, deadline);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            key="modal-sheet"
            initial={{ y: '100%', opacity: 0.7, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: '100%', opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350, mass: 0.9 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-[var(--cd)] p-6 shadow-2xl border border-white/20 dark:border-white/5 pb-[calc(24px+env(safe-area-inset-bottom,0px))]"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-[var(--tx)] m-0">
                {t.add}
              </h3>
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={onClose}
                className="p-1 rounded-full text-[var(--mu)] hover:text-[var(--tx)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            <input
              ref={inputRef}
              type="text"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t.add}
              className="w-full px-4 py-3 rounded-2xl bg-[var(--bg)] border border-[var(--ln)] text-[var(--tx)] placeholder:text-[var(--mu)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ac)] transition-all"
            />

            <div className="mt-4 mb-2 flex items-center gap-1.5 text-xs font-semibold text-[var(--mu)]">
              <Clock className="w-3.5 h-3.5 text-[var(--ac)]" />
              <span>{t.dl}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-6">
              {/* Month */}
              <div className="relative">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--ln)] text-[var(--tx)] text-xs focus:outline-none focus:ring-2 focus:ring-[var(--ac)] cursor-pointer"
                >
                  <option value="">{t.mo}</option>
                  {months.map((m, idx) => (
                    <option key={idx} value={idx}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div className="relative">
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--ln)] text-[var(--tx)] text-xs focus:outline-none focus:ring-2 focus:ring-[var(--ac)] cursor-pointer"
                >
                  <option value="">{t.dy}</option>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>
                      {String(d).padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Hour */}
              <div className="relative">
                <select
                  value={selectedHour}
                  onChange={(e) => setSelectedHour(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--ln)] text-[var(--tx)] text-xs focus:outline-none focus:ring-2 focus:ring-[var(--ac)] cursor-pointer"
                >
                  <option value="">{t.hr}</option>
                  {Array.from({ length: 24 }, (_, i) => i).map((h) => (
                    <option key={h} value={h}>
                      {String(h).padStart(2, '0')}:00
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <motion.button
                type="button"
                whileTap={{ scale: 0.94 }}
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-xl border border-[var(--ln)] text-sm font-semibold text-[var(--tx)] hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
              >
                {t.cancel}
              </motion.button>
              <motion.button
                type="button"
                whileTap={{ scale: 0.94 }}
                onClick={handleSave}
                disabled={!taskName.trim()}
                className="flex-1 py-3 px-4 rounded-xl text-sm font-bold text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                style={{
                  background:
                    'linear-gradient(135deg, var(--ac), color-mix(in srgb, var(--ac) 65%, #ffffff))',
                  boxShadow: '0 4px 16px -2px var(--ac)',
                }}
              >
                {t.save}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
