import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppPage } from '../types';
import { TRANSLATIONS } from '../constants';

interface HeaderProps {
  currentPage: AppPage;
  lang: 'id' | 'en';
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onNavigate?: (page: AppPage) => void;
  activeAlarmCount?: number;
  pendingTaskCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  lang,
  theme,
  onToggleTheme,
}) => {
  const t = TRANSLATIONS[lang];
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setTimeStr(
        d.toLocaleTimeString(lang === 'id' ? 'id-ID' : 'en-GB', {
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [lang]);

  return (
    <header className="flex-none shrink-0 relative z-20 px-4 pt-3.5 pb-2 select-none">
      {/* Top row: Brand + Clock + Theme toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight leading-none">
            <span className="gradient-text">AryNotes</span>
          </h1>
          <div className="h-4 overflow-hidden mt-0.5">
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={currentPage}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="text-[11px] font-semibold text-[var(--mu)] tracking-wide"
              >
                {t[currentPage]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-[var(--mu)] tabular-nums">
            {timeStr}
          </span>
          <motion.button
            type="button"
            onClick={onToggleTheme}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.88, rotate: theme === 'dark' ? 180 : -180 }}
            className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all cursor-pointer shadow-sm relative overflow-hidden ${
              theme === 'dark'
                ? 'border-white/15 bg-[#202328]/90 text-amber-400 shadow-amber-400/10'
                : 'border-black/10 bg-white/90 text-indigo-600 shadow-black/5'
            }`}
            title={theme === 'dark' ? t.light : t.dark}
            aria-label="Toggle Theme"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={theme}
                initial={{ y: -10, opacity: 0, rotate: -90, scale: 0.6 }}
                animate={{ y: 0, opacity: 1, rotate: 0, scale: 1 }}
                exit={{ y: 10, opacity: 0, rotate: 90, scale: 0.6 }}
                transition={{ type: 'spring', stiffness: 450, damping: 25 }}
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400 filter drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]" />
                ) : (
                  <Moon className="w-4 h-4 text-indigo-600 filter drop-shadow-[0_0_6px_rgba(79,70,229,0.4)]" />
                )}
              </motion.div>
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </header>
  );
};
