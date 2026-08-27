'use client';

import React from 'react';
import { getPlayerPhoto } from '../lib/playerPhotos';

interface PlayerAvatarProps {
  playerId: string;
  playerName: string;
  country?: string;
  className?: string;
  size?: number;
}

const COUNTRY_BG: Record<string, string> = {
  India: '1a56db',
  Australia: 'f59e0b',
  England: '0ea5e9',
  Pakistan: '16a34a',
  'South Africa': '1d4ed8',
  'New Zealand': '0f172a',
  'West Indies': 'b91c1c',
  Afghanistan: '166534',
  'Sri Lanka': '1e40af',
  Bangladesh: '15803d',
  Zimbabwe: 'b45309',
  USA: '1e3a8a',
};

export default function PlayerAvatar({ playerId, playerName, country, className, size }: PlayerAvatarProps) {
  const photo = getPlayerPhoto(playerId, playerName, country);
  const bg = COUNTRY_BG[country || ''] || '0d5c63';
  const fallback = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(playerName)}&backgroundColor=${bg}&fontWeight=800&textColor=ffffff&fontSize=38&chars=2`;

  return (
    <img
      src={photo}
      alt={playerName}
      className={className || 'w-full h-full object-cover object-top'}
      width={size}
      height={size}
      onError={(e) => {
        const img = e.target as HTMLImageElement;
        if (img.src !== fallback) {
          img.src = fallback;
        }
      }}
    />
  );
}
