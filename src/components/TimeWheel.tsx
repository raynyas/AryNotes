/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface TimeWheelProps {
  label: string;
  max: number; // e.g. 23 for hour, 59 for min/sec
  value: number;
  onChange: (val: number) => void;
}

export const TimeWheel: React.FC<TimeWheelProps> = ({
  label,
  max,
  value,
  onChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);

  const items = Array.from({ length: max + 1 }, (_, i) => i);
  const itemHeight = 50;

  // Sync scroll position when value changes externally
  useEffect(() => {
    if (isScrollingRef.current) return;
    const el = containerRef.current;
    if (el) {
      const targetScroll = value * itemHeight;
      if (Math.abs(el.scrollTop - targetScroll) > 2) {
        el.scrollTo({ top: targetScroll, behavior: 'smooth' });
      }
    }
  }, [value]);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    isScrollingRef.current = true;
    const index = Math.round(el.scrollTop / itemHeight);
    const clamped = Math.max(0, Math.min(max, index));
    if (clamped !== value) {
      onChange(clamped);
    }
    clearTimeout((handleScroll as any).timer);
    (handleScroll as any).timer = setTimeout(() => {
      isScrollingRef.current = false;
    }, 150);
  };

  const step = (delta: number) => {
    const next = (value + delta + (max + 1)) % (max + 1);
    onChange(next);
  };

  return (
    <div className="flex-1 flex flex-col items-center">
      <span className="text-xs font-semibold text-[var(--mu)] mb-1 uppercase tracking-wider">
        {label}
      </span>

      {/* Up stepper button */}
      <button
        type="button"
        onClick={() => step(-1)}
        className="w-full py-1 flex items-center justify-center text-[var(--mu)] hover:text-[var(--tx)] active:scale-95 transition-all"
        aria-label={`Decrease ${label}`}
      >
        <ChevronUp className="w-4 h-4" />
      </button>

      {/* Scroll wheel */}
      <div className="w-full wheel-wrapper">
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="wheel-scroll select-none"
        >
          {items.map((i) => (
            <div
              key={i}
              onClick={() => onChange(i)}
              className={`wheel-item font-bold transition-all cursor-pointer ${
                value === i
                  ? 'text-[var(--tx)] scale-110'
                  : 'text-[var(--mu)] opacity-40 hover:opacity-75 scale-95'
              }`}
            >
              {String(i).padStart(2, '0')}
            </div>
          ))}
        </div>
      </div>

      {/* Down stepper button */}
      <button
        type="button"
        onClick={() => step(1)}
        className="w-full py-1 flex items-center justify-center text-[var(--mu)] hover:text-[var(--tx)] active:scale-95 transition-all"
        aria-label={`Increase ${label}`}
      >
        <ChevronDown className="w-4 h-4" />
      </button>
    </div>
  );
};
