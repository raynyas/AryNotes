/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { AppPage } from '../types';
import { TRANSLATIONS } from '../constants';

interface NavbarProps {
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
  lang: 'id' | 'en';
  theme: 'light' | 'dark';
  activeAlarmCount: number;
  pendingTaskCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  lang,
  theme,
  activeAlarmCount,
  pendingTaskCount,
}) => {
  const t = TRANSLATIONS[lang];

  const navItems = [
    {
      id: 'dash' as AppPage,
      label: t.dash,
      badge: pendingTaskCount > 0 && currentPage !== 'dash' ? pendingTaskCount : null,
      icon: (
        <svg
          className="w-5 h-5 relative z-10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 11l9-8 9 8M5 10v10h14V10" />
        </svg>
      ),
    },
    {
      id: 'alarm' as AppPage,
      label: t.alarm,
      badge: activeAlarmCount > 0 ? activeAlarmCount : null,
      icon: (
        <svg
          className="w-5 h-5 relative z-10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="13" r="8" />
          <path d="M12 9v4l2.5 2M10 2h4" />
        </svg>
      ),
    },
    {
      id: 'set' as AppPage,
      label: t.set,
      badge: null,
      icon: (
        <svg
          className="w-5 h-5 relative z-10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
    },
  ];

  return (
    <nav
      className={`flex-none shrink-0 relative z-30 flex items-center justify-between gap-1.5 mx-4 mb-[calc(10px+env(safe-area-inset-bottom,0px))] p-1.5 rounded-[30px] backdrop-blur-xl transition-all duration-300 ${
        theme === 'dark'
          ? 'border border-white/10 bg-[#202328]/90 shadow-xl shadow-black/35'
          : 'border border-black/10 bg-white/95 shadow-lg shadow-black/8'
      }`}
      role="navigation"
      aria-label="Main Navigation"
    >
      {navItems.map((item) => {
        const isActive = currentPage === item.id;
        return (
          <motion.button
            key={item.id}
            type="button"
            onClick={() => onNavigate(item.id)}
            whileTap={{ scale: 0.94 }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-[24px] font-semibold text-xs transition-colors duration-200 relative cursor-pointer select-none ${
              isActive
                ? 'text-white'
                : theme === 'dark'
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            aria-label={item.label}
          >
            {/* Sliding Glowing Active Indicator Pill */}
            {isActive && (
              <motion.div
                layoutId="activeNavIndicator"
                className="absolute inset-0 rounded-[24px] -z-0"
                style={{
                  background:
                    'linear-gradient(135deg, var(--ac), color-mix(in srgb, var(--ac) 50%, #ff7ad9))',
                  boxShadow:
                    '0 0 20px 2px color-mix(in srgb, var(--ac) 60%, transparent), 0 0 35px 5px color-mix(in srgb, #ff7ad9 20%, transparent)',
                }}
                transition={{
                  type: 'spring',
                  stiffness: 380,
                  damping: 30,
                  mass: 0.8,
                }}
              />
            )}

            {/* Icon + Badge */}
            <motion.div
              className="relative flex items-center justify-center z-10"
              animate={isActive ? { scale: [1, 1.12, 1] } : { scale: 1 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              {item.icon}

              {item.badge !== null && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                  className={`absolute -top-1.5 -right-2 px-1.5 py-0.2 text-[9px] font-bold rounded-full ${
                    isActive
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'bg-red-500 text-white'
                  }`}
                >
                  {item.badge}
                </motion.span>
              )}
            </motion.div>

            {/* Label */}
            <span className="text-[11px] font-bold tracking-wide relative z-10">
              {item.label}
            </span>
          </motion.button>
        );
      })}
    </nav>
  );
};
