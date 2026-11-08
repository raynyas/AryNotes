/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Bell } from 'lucide-react';

interface ToastProps {
  message: string | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div
      onClick={onClose}
      className="fixed left-4 right-4 top-4 z-50 flex items-center gap-3 p-3.5 rounded-2xl text-white text-sm font-medium shadow-2xl backdrop-blur-md cursor-pointer animate-in slide-in-from-top duration-300 max-w-md mx-auto"
      style={{
        background: 'linear-gradient(135deg, var(--ac), color-mix(in srgb, var(--ac) 65%, #000000))',
        boxShadow: '0 12px 30px -10px var(--ac)',
      }}
    >
      <Bell className="w-5 h-5 shrink-0 animate-pulse" />
      <span className="flex-1 break-words">{message}</span>
      <span className="text-xs opacity-75 font-normal">✕</span>
    </div>
  );
};
