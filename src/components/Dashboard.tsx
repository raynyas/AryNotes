/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, Plus, Trash2, Clock, Check, AlertCircle, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { Task } from '../types';
import { TRANSLATIONS } from '../constants';

interface DashboardProps {
  tasks: Task[];
  onToggleTask: (id: number) => void;
  onDeleteTask: (id: number) => void;
  onOpenAddModal: () => void;
  onQuickAdd: (name: string) => void;
  lang: 'id' | 'en';
  theme: 'light' | 'dark';
}

export const Dashboard: React.FC<DashboardProps> = ({
  tasks,
  onToggleTask,
  onDeleteTask,
  onOpenAddModal,
  onQuickAdd,
  lang,
  theme,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [quickInput, setQuickInput] = useState('');
  const t = TRANSLATIONS[lang];
  const locale = lang === 'id' ? 'id-ID' : 'en-GB';

  const isOverdue = (task: Task) => Boolean(task.e && !task.d && Date.now() > task.e);

  const formatDeadline = (ts: number) => {
    return new Date(ts).toLocaleString(locale, {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCreationDate = (ts: number) => {
    return new Date(ts).toLocaleDateString(locale, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const query = searchQuery.toLowerCase().trim();
  const filtered = tasks.filter((x) => x.n.toLowerCase().includes(query));
  const activeTasks = filtered.filter((x) => !x.d);
  const completedTasks = filtered.filter((x) => x.d);

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    onQuickAdd(quickInput.trim());
    setQuickInput('');
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col relative z-10">
      {/* Top action row */}
      <div className="px-4 pt-2 pb-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search
              className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${
                theme === 'dark' ? 'text-gray-400' : 'text-slate-400'
              }`}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.search}
              className={`w-full pl-10 pr-4 py-2.5 rounded-2xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[var(--ac)] backdrop-blur-md ${
                theme === 'dark'
                  ? 'bg-[#202328]/80 border border-white/10 text-white placeholder:text-gray-400 shadow-md'
                  : 'bg-white/95 border border-black/10 text-slate-800 placeholder:text-slate-400 shadow-sm'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs p-1 transition-colors ${
                  theme === 'dark'
                    ? 'text-gray-400 hover:text-white'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                ✕
              </button>
            )}
          </div>

          <motion.button
            type="button"
            onClick={onOpenAddModal}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.88 }}
            className="btn-icon relative overflow-hidden group cursor-pointer"
            aria-label="Add Task"
            title={t.add}
          >
            {/* Subtle glow ring on hover */}
            <motion.div
              className="absolute inset-0 rounded-full -z-0 opacity-0 group-hover:opacity-100 transition-opacity"
              animate={{ scale: [1, 1.25, 1], opacity: [0.2, 0.5, 0.2] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
              style={{
                background:
                  'radial-gradient(circle, color-mix(in srgb, var(--ac) 80%, #ff7ad9) 0%, transparent 70%)',
              }}
            />
            <motion.div
              className="relative z-10 flex items-center justify-center"
              whileTap={{ rotate: 90 }}
              transition={{ type: 'spring', stiffness: 450, damping: 22 }}
            >
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </motion.div>
          </motion.button>
        </div>

        {/* Quick inline add input */}
        <form onSubmit={handleQuickSubmit} className="mt-2.5">
          <input
            type="text"
            value={quickInput}
            onChange={(e) => setQuickInput(e.target.value)}
            placeholder={t.quickAddPrompt}
            className={`w-full px-4 py-2 rounded-xl text-xs transition-all focus:outline-none focus:ring-1 focus:ring-[var(--ac)] ${
              theme === 'dark'
                ? 'bg-white/5 border border-white/10 text-white placeholder:text-gray-400'
                : 'bg-white/90 border border-black/10 text-slate-800 placeholder:text-slate-400 shadow-xs'
            }`}
          />
        </form>
      </div>

      {/* Task list container */}
      <div className="flex-1 overflow-y-auto px-4 pb-24 custom-scroll" id="lst">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center select-none">
            {/* Logo Icon with Subtle Soft Glow */}
            <div
              className="w-14 h-14 rounded-2xl bg-[var(--ac)]/15 border border-[var(--ac)]/25 flex items-center justify-center text-[var(--ac)] mb-3 transition-transform hover:scale-105"
              style={{
                boxShadow:
                  '0 6px 18px -4px color-mix(in srgb, var(--ac) 30%, transparent)',
              }}
            >
              <Sparkles className="w-7 h-7 text-[var(--ac)]" />
            </div>

            {/* Title with Subtle Clean Shadow */}
            <p
              className="font-bold text-base sm:text-lg text-[var(--tx)]"
              style={{
                textShadow: '0 1px 3px rgba(0, 0, 0, 0.25)',
              }}
            >
              {t.empty}
            </p>

            {/* Description with Clean Legibility */}
            <p
              className="text-xs font-medium text-[var(--mu)] mt-1.5 max-w-xs leading-relaxed"
              style={{
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.15)',
              }}
            >
              {lang === 'id'
                ? 'Mulai atur harimu dengan menambahkan tugas pertama!'
                : 'Start organizing your day by adding your first task!'}
            </p>

            {/* Button */}
            <motion.button
              type="button"
              onClick={onOpenAddModal}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all cursor-pointer flex items-center gap-1.5"
              style={{
                background:
                  'linear-gradient(135deg, var(--ac), color-mix(in srgb, var(--ac) 65%, #ffffff))',
                boxShadow:
                  '0 6px 18px -4px var(--ac)',
              }}
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>{t.add}</span>
            </motion.button>
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="text-center py-12 text-sm font-semibold text-[var(--mu)]"
            style={{
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.15)',
            }}
          >
            {t.nf}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Active / To Do */}
            {activeTasks.length > 0 && (
              <div>
                <div className="flex items-center justify-between px-1 mb-2">
                  <h3 className="text-xs font-bold text-[var(--mu)] uppercase tracking-wider">
                    {t.todo}
                  </h3>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-[var(--mu)]">
                    {activeTasks.length}
                  </span>
                </div>

                <div className="space-y-2">
                  {activeTasks.map((task) => {
                    const overdue = isOverdue(task);
                    return (
                      <div
                        key={task.i}
                        className="glass-card flex items-start gap-3 p-3.5 transition-all hover:border-[var(--ac)]/40 group"
                      >
                        <button
                          type="button"
                          onClick={() => onToggleTask(task.i)}
                          className="mt-0.5 w-6 h-6 rounded-lg border-2 border-[var(--mu)]/60 hover:border-[var(--ac)] flex items-center justify-center transition-colors shrink-0"
                          aria-label="Mark completed"
                        >
                          {task.d ? <Check className="w-4 h-4 text-[var(--ac)] stroke-[3]" /> : null}
                        </button>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[var(--tx)] break-words leading-snug">
                            {task.n}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-[11px] text-[var(--mu)]">
                            <span>{formatCreationDate(task.i)}</span>
                            {task.e ? (
                              <span
                                className={`flex items-center gap-1 font-medium ${
                                  overdue ? 'text-red-500 font-bold' : ''
                                }`}
                              >
                                {overdue ? (
                                  <AlertCircle className="w-3 h-3 text-red-500" />
                                ) : (
                                  <Clock className="w-3 h-3" />
                                )}
                                <span>
                                  {overdue ? `${t.late}: ` : ''}
                                  {formatDeadline(task.e)}
                                </span>
                              </span>
                            ) : null}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => onDeleteTask(task.i)}
                          className="p-1.5 text-[var(--mu)] hover:text-red-500 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Delete"
                          aria-label="Delete task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Completed / Done */}
            {completedTasks.length > 0 && (
              <div>
                <div className="flex items-center justify-between px-1 mb-2 mt-4">
                  <h3 className="text-xs font-bold text-[var(--mu)] uppercase tracking-wider">
                    {t.done}
                  </h3>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    {completedTasks.length}
                  </span>
                </div>

                <div className="space-y-2 opacity-75">
                  {completedTasks.map((task) => (
                    <div
                      key={task.i}
                      className="glass-card flex items-start gap-3 p-3.5 transition-all group"
                    >
                      <button
                        type="button"
                        onClick={() => onToggleTask(task.i)}
                        className="mt-0.5 w-6 h-6 rounded-lg bg-[var(--ac)] text-white flex items-center justify-center transition-colors shrink-0 shadow-sm"
                        aria-label="Mark incomplete"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </button>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[var(--mu)] line-through break-words leading-snug">
                          {task.n}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-[var(--mu)]">
                          <span>{formatCreationDate(task.i)}</span>
                          {task.d ? (
                            <span className="text-emerald-600 dark:text-emerald-400">
                              ✓ {new Date(task.d).toLocaleDateString(locale)}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onDeleteTask(task.i)}
                        className="p-1.5 text-[var(--mu)] hover:text-red-500 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete"
                        aria-label="Delete task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
