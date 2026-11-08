/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Flag, Timer } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TRANSLATIONS } from '../constants';
import { triggerVibration } from '../utils/audio';

interface LapItem {
  id: number;
  lapNumber: number;
  lapTime: number;
  overallTime: number;
}

interface StopwatchProps {
  lang: 'id' | 'en';
}

export const Stopwatch: React.FC<StopwatchProps> = ({ lang }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [laps, setLaps] = useState<LapItem[]>([]);

  const startTimeRef = useRef<number>(0);
  const accumulatedTimeRef = useRef<number>(0);
  const requestRef = useRef<number | null>(null);

  const t = TRANSLATIONS[lang];

  // High precision timer loop via requestAnimationFrame
  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = performance.now();
      const updateTimer = () => {
        const now = performance.now();
        const currentElapsed = accumulatedTimeRef.current + (now - startTimeRef.current);
        setElapsedTime(currentElapsed);
        requestRef.current = requestAnimationFrame(updateTimer);
      };
      requestRef.current = requestAnimationFrame(updateTimer);
    } else {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
    }

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
    };
  }, [isRunning]);

  const handleStart = () => {
    triggerVibration([30]);
    setIsRunning(true);
  };

  const handlePause = () => {
    triggerVibration([30]);
    accumulatedTimeRef.current = elapsedTime;
    setIsRunning(false);
  };

  const handleReset = () => {
    triggerVibration([40]);
    setIsRunning(false);
    accumulatedTimeRef.current = 0;
    setElapsedTime(0);
    setLaps([]);
  };

  const handleLap = () => {
    triggerVibration([25]);
    const previousTotal = laps.length > 0 ? laps[0].overallTime : 0;
    const currentLapTime = elapsedTime - previousTotal;

    const newLap: LapItem = {
      id: Date.now(),
      lapNumber: laps.length + 1,
      lapTime: Math.max(0, currentLapTime),
      overallTime: elapsedTime,
    };

    setLaps((prev) => [newLap, ...prev]);
  };

  // Time formatter
  const formatTimeParts = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const centiseconds = Math.floor((ms % 1000) / 10);

    return {
      hours: hours > 0 ? String(hours).padStart(2, '0') : null,
      minutes: String(minutes).padStart(2, '0'),
      seconds: String(seconds).padStart(2, '0'),
      centiseconds: String(centiseconds).padStart(2, '0'),
    };
  };

  const formatLapTime = (ms: number) => {
    const p = formatTimeParts(ms);
    if (p.hours) {
      return `${p.hours}:${p.minutes}:${p.seconds}.${p.centiseconds}`;
    }
    return `${p.minutes}:${p.seconds}.${p.centiseconds}`;
  };

  // Gauge calculation: 60-second rotation circle
  const currentSecondFraction = (elapsedTime % 60000) / 60000;
  const radius = 94;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - currentSecondFraction * circumference;

  // Fastest & Slowest Lap calculation
  let fastestLapNumber: number | null = null;
  let slowestLapNumber: number | null = null;

  if (laps.length >= 2) {
    let minTime = Infinity;
    let maxTime = -Infinity;

    laps.forEach((lap) => {
      if (lap.lapTime < minTime) {
        minTime = lap.lapTime;
        fastestLapNumber = lap.lapNumber;
      }
      if (lap.lapTime > maxTime) {
        maxTime = lap.lapTime;
        slowestLapNumber = lap.lapNumber;
      }
    });

    if (minTime === maxTime) {
      fastestLapNumber = null;
      slowestLapNumber = null;
    }
  }

  const mainTime = formatTimeParts(elapsedTime);
  const currentLapDuration =
    elapsedTime - (laps.length > 0 ? laps[0].overallTime : 0);
  const currentLapParts = formatTimeParts(Math.max(0, currentLapDuration));

  return (
    <div className="flex-1 min-h-0 flex flex-col relative z-10 space-y-4">
      {/* Stopwatch Circular Dial Card */}
      <div className="glass-card p-6 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Ambient background glow when running */}
        <motion.div
          animate={{
            opacity: isRunning ? [0.15, 0.35, 0.15] : 0.08,
            scale: isRunning ? [0.95, 1.05, 0.95] : 1,
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute w-56 h-56 rounded-full pointer-events-none -z-0 blur-3xl"
          style={{
            background:
              'radial-gradient(circle, var(--ac) 0%, color-mix(in srgb, var(--ac) 30%, #ff7ad9) 70%, transparent 100%)',
          }}
        />

        {/* Circular Gauge */}
        <div className="relative w-56 h-56 flex items-center justify-center select-none">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 220 220">
            {/* Background Track */}
            <circle
              cx="110"
              cy="110"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="5"
              className="text-black/10 dark:text-white/10"
            />
            {/* Animated Progress Arc */}
            <circle
              cx="110"
              cy="110"
              r={radius}
              fill="none"
              stroke="var(--ac)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{
                filter: isRunning ? 'drop-shadow(0 0 8px var(--ac))' : 'none',
                transition: isRunning ? 'none' : 'stroke-dashoffset 0.2s ease-out',
              }}
            />
          </svg>

          {/* Glowing Progress Needle / Orbiting Dot */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{
              transform: `rotate(${currentSecondFraction * 360}deg)`,
              transition: isRunning ? 'none' : 'transform 0.2s ease-out',
            }}
          >
            <div
              className="w-3.5 h-3.5 rounded-full -translate-y-[94px] border-2 border-white shadow-lg transition-transform"
              style={{
                backgroundColor: 'var(--ac)',
                boxShadow: '0 0 12px 2px var(--ac)',
                transform: isRunning ? 'scale(1.2)' : 'scale(1)',
              }}
            />
          </div>

          {/* Central Digital Time Display */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            {/* Current Lap sub-display if laps exist */}
            {laps.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[11px] font-mono font-semibold text-[var(--mu)] mb-1"
              >
                {t.lapNum} {laps.length + 1}: {currentLapParts.minutes}:
                {currentLapParts.seconds}.{currentLapParts.centiseconds}
              </motion.div>
            )}

            {/* Main Time Readout */}
            <div className="flex items-baseline justify-center font-mono font-black tracking-tight text-[var(--tx)] tabular-nums">
              {mainTime.hours && (
                <>
                  <span className="text-3xl sm:text-4xl">{mainTime.hours}</span>
                  <span className="text-2xl text-[var(--mu)] mx-0.5">:</span>
                </>
              )}
              <span className="text-4xl sm:text-5xl">{mainTime.minutes}</span>
              <span className="text-3xl text-[var(--mu)] mx-0.5 animate-pulse">:</span>
              <span className="text-4xl sm:text-5xl">{mainTime.seconds}</span>
              <span
                className="text-2xl sm:text-3xl font-extrabold ml-1"
                style={{
                  color: 'var(--ac)',
                  textShadow: '0 0 10px color-mix(in srgb, var(--ac) 60%, transparent)',
                }}
              >
                .{mainTime.centiseconds}
              </span>
            </div>

            {/* Status indicator */}
            <div className="flex items-center gap-1.5 mt-2">
              <span
                className={`w-2 h-2 rounded-full transition-colors ${
                  isRunning
                    ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]'
                    : elapsedTime > 0
                    ? 'bg-amber-500'
                    : 'bg-[var(--mu)] opacity-40'
                }`}
              />
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--mu)]">
                {isRunning ? t.start : elapsedTime > 0 ? t.pause : t.stopwatch}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls Row */}
        <div className="w-full flex items-center justify-between gap-4 mt-6 max-w-xs">
          {/* Secondary Action: Lap / Reset */}
          <div className="flex-1 flex justify-center">
            {isRunning ? (
              <motion.button
                type="button"
                onClick={handleLap}
                whileTap={{ scale: 0.92 }}
                whileHover={{ scale: 1.05 }}
                className="w-16 h-16 rounded-full border-2 border-[var(--ln)] bg-white/70 dark:bg-white/10 text-[var(--tx)] flex flex-col items-center justify-center gap-0.5 shadow-md active:scale-95 transition-all cursor-pointer backdrop-blur-md"
                aria-label={t.lap}
              >
                <Flag className="w-4 h-4 text-[var(--ac)]" />
                <span className="text-[10px] font-bold">{t.lap}</span>
              </motion.button>
            ) : elapsedTime > 0 ? (
              <motion.button
                type="button"
                onClick={handleReset}
                whileTap={{ scale: 0.92 }}
                whileHover={{ scale: 1.05 }}
                className="w-16 h-16 rounded-full border border-red-500/30 bg-red-500/10 text-red-500 flex flex-col items-center justify-center gap-0.5 shadow-md active:scale-95 transition-all cursor-pointer backdrop-blur-md"
                aria-label={t.resetStopwatch}
              >
                <RotateCcw className="w-4 h-4" />
                <span className="text-[10px] font-bold">{t.resetStopwatch}</span>
              </motion.button>
            ) : (
              <div
                className="w-16 h-16 rounded-full border border-[var(--ln)] opacity-30 flex flex-col items-center justify-center gap-0.5 cursor-not-allowed"
                aria-disabled="true"
              >
                <Flag className="w-4 h-4 text-[var(--mu)]" />
                <span className="text-[10px] font-bold text-[var(--mu)]">{t.lap}</span>
              </div>
            )}
          </div>

          {/* Primary Action: Start / Pause */}
          <div className="flex-1 flex justify-center">
            {isRunning ? (
              <motion.button
                type="button"
                onClick={handlePause}
                whileTap={{ scale: 0.92 }}
                whileHover={{ scale: 1.05 }}
                className="w-16 h-16 rounded-full bg-amber-500 text-white flex flex-col items-center justify-center gap-0.5 shadow-lg shadow-amber-500/30 active:scale-95 transition-all cursor-pointer"
                aria-label={t.pause}
              >
                <Pause className="w-5 h-5 fill-current" />
                <span className="text-[10px] font-bold">{t.pause}</span>
              </motion.button>
            ) : (
              <motion.button
                type="button"
                onClick={handleStart}
                whileTap={{ scale: 0.92 }}
                whileHover={{ scale: 1.05 }}
                className="w-16 h-16 rounded-full text-white flex flex-col items-center justify-center gap-0.5 shadow-xl transition-all cursor-pointer"
                style={{
                  background:
                    'linear-gradient(135deg, var(--ac), color-mix(in srgb, var(--ac) 60%, #ff7ad9))',
                  boxShadow:
                    '0 8px 24px -4px color-mix(in srgb, var(--ac) 70%, transparent)',
                }}
                aria-label={t.start}
              >
                <Play className="w-5 h-5 fill-current ml-0.5" />
                <span className="text-[10px] font-bold">{elapsedTime > 0 ? t.resume : t.start}</span>
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Laps Record Card */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4 text-[var(--ac)]" />
            <h3 className="text-xs font-bold text-[var(--tx)] uppercase tracking-wider">
              {t.laps}
            </h3>
          </div>
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-[var(--ac)]/15 text-[var(--ac)]">
            {laps.length}
          </span>
        </div>

        {laps.length === 0 ? (
          <div className="text-center py-6 text-xs text-[var(--mu)] border border-dashed border-[var(--ln)] rounded-2xl">
            {t.noLaps}
          </div>
        ) : (
          <div className="space-y-1.5 max-h-56 overflow-y-auto custom-scroll pr-1">
            <AnimatePresence initial={false}>
              {laps.map((lap) => {
                const isFastest = fastestLapNumber === lap.lapNumber;
                const isSlowest = slowestLapNumber === lap.lapNumber;

                return (
                  <motion.div
                    key={lap.id}
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-mono transition-colors ${
                      isFastest
                        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold'
                        : isSlowest
                        ? 'border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold'
                        : 'border-[var(--ln)] bg-black/5 dark:bg-white/5 text-[var(--tx)]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-14 font-semibold text-[var(--mu)]">
                        {t.lapNum} {String(lap.lapNumber).padStart(2, '0')}
                      </span>
                      {isFastest && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500 text-white font-sans font-bold">
                          {t.fastest}
                        </span>
                      )}
                      {isSlowest && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500 text-white font-sans font-bold">
                          {t.slowest}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      <span className="font-semibold tabular-nums">
                        +{formatLapTime(lap.lapTime)}
                      </span>
                      <span className="text-[var(--mu)] tabular-nums text-[11px] w-20">
                        {formatLapTime(lap.overallTime)}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};
