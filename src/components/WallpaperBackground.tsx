/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { WallpaperItem } from '../types';

interface WallpaperBackgroundProps {
  wallpaper: WallpaperItem | null;
  isVisible: boolean;
}

export const WallpaperBackground: React.FC<WallpaperBackgroundProps> = ({
  wallpaper,
  isVisible,
}) => {
  if (!isVisible || !wallpaper) return null;

  const posX = wallpaper.x ?? 50;
  const posY = wallpaper.y ?? 50;
  const zoom = (wallpaper.z ?? 100) / 100;

  return (
    <div
      id="dashboard-wallpaper"
      className="absolute inset-0 z-0 overflow-hidden pointer-events-none transition-opacity duration-500"
      style={{
        WebkitMaskImage: 'linear-gradient(transparent 0%, #000 12%, #000 82%, transparent 100%)',
        maskImage: 'linear-gradient(transparent 0%, #000 12%, #000 82%, transparent 100%)',
      }}
    >
      <div
        className="w-full h-full bg-cover bg-no-repeat transition-all duration-150"
        style={{
          backgroundImage: `url(${wallpaper.u})`,
          backgroundPosition: `${posX}% ${posY}%`,
          transform: `scale(${zoom})`,
          transformOrigin: `${posX}% ${posY}%`,
          opacity: 0.85,
        }}
      />
    </div>
  );
};
