'use client';

import React from 'react';
import { Player } from '../lib/types';

interface EAFCCardProps {
  player: Player;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showDetails?: boolean;
  onClick?: () => void;
  className?: string;
}

export default function EAFCCard({
  player,
  size = 'md',
  showDetails = true,
  onClick,
  className = '',
}: EAFCCardProps) {
  const ovr = player.ovr || 85;
  const tier = (player.card_tier || (ovr >= 93 ? 'ICON' : ovr >= 88 ? 'HERO' : ovr >= 83 ? 'TOTW' : 'GOLD_RARE')).toUpperCase();
  const ea = player.ea_stats || {
    BAT: 85,
    PWR: 82,
    BWL: 45,
    CLU: 88,
    FLD: 84,
    PHY: 86,
  };

  const isBowler = player.role?.toLowerCase().includes('bowler');
  const isAR = player.role?.toLowerCase().includes('all-rounder') || player.role?.toLowerCase().includes('allrounder');
  const isWK = player.role?.toLowerCase().includes('wicket') || player.role?.toLowerCase().includes('keeper');

  // Role abbreviation in EA FC style
  const roleCode = isWK ? 'WK' : isBowler ? 'BWL' : isAR ? 'ALL' : 'BAT';

  // Card theme styling
  let cardBg = 'from-[#d4af37] via-[#f7d070] to-[#aa7c11] text-black border-[#ffe082] shadow-[#d4af37]/30'; // Gold Rare
  let badgeBg = 'bg-black/80 text-[#f59e0b] border border-[#f59e0b]/40';
  let bannerText = 'GOLD RARE';
  let bannerBg = 'bg-gradient-to-r from-amber-600 to-yellow-500 text-black';
  let glowEffect = 'shadow-[0_0_25px_rgba(212,175,55,0.35)]';

  if (tier === 'ICON') {
    cardBg = 'from-[#111827] via-[#1e293b] to-[#0f172a] text-[#f8fafc] border-[#f59e0b]';
    badgeBg = 'bg-gradient-to-br from-amber-400 to-yellow-600 text-black font-black border border-amber-300';
    bannerText = '👑 WORLD CUP ICON';
    bannerBg = 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-black font-extrabold';
    glowEffect = 'shadow-[0_0_35px_rgba(245,158,11,0.45)] ring-1 ring-amber-400/50';
  } else if (tier === 'HERO') {
    cardBg = 'from-[#1e1b4b] via-[#312e81] to-[#1e1b4b] text-[#f8fafc] border-[#818cf8]';
    badgeBg = 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold border border-indigo-400';
    bannerText = '⚡ WORLD CUP HERO';
    bannerBg = 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-extrabold';
    glowEffect = 'shadow-[0_0_35px_rgba(129,140,248,0.45)] ring-1 ring-indigo-400/50';
  } else if (tier === 'TOTW') {
    cardBg = 'from-[#09090b] via-[#18181b] to-[#09090b] text-[#fbbf24] border-[#fbbf24]';
    badgeBg = 'bg-black text-[#fbbf24] font-black border border-[#fbbf24]';
    bannerText = '🔥 IN-FORM (TOTW)';
    bannerBg = 'bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 text-black font-bold';
    glowEffect = 'shadow-[0_0_30px_rgba(251,191,36,0.35)] ring-1 ring-yellow-400/40';
  }

  // Size constraints
  const sizeClasses = {
    sm: 'w-[140px] p-2.5 rounded-xl text-xs',
    md: 'w-[195px] p-3.5 rounded-2xl text-xs',
    lg: 'w-[240px] p-4.5 rounded-3xl text-sm',
    hero: 'w-[280px] p-5 rounded-3xl text-sm',
  }[size];

  const roleEmoji = isWK ? '🧤' : isBowler ? '🎯' : isAR ? '⚡' : '🏏';

  return (
    <div
      onClick={onClick}
      className={`relative select-none cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1.5 ${glowEffect} bg-gradient-to-b ${cardBg} border-2 overflow-hidden flex flex-col justify-between ${sizeClasses} ${className}`}
      style={{
        clipPath: 'polygon(0% 4%, 4% 0%, 96% 0%, 100% 4%, 100% 96%, 96% 100%, 4% 100%, 0% 96%)',
      }}
    >
      {/* Metallic Hologram Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-transparent pointer-events-none" />
      <div className="absolute -top-12 -right-12 w-28 h-28 bg-amber-400/10 rounded-full blur-xl pointer-events-none" />

      {/* Header: Rating + Position + Country Flag/Badge */}
      <div className="flex items-start justify-between relative z-10">
        <div className="flex flex-col items-center">
          <span className="text-2xl md:text-3xl font-black tracking-tighter leading-none drop-shadow">
            {ovr}
          </span>
          <span className="text-[11px] font-black uppercase tracking-wider opacity-90">
            {roleCode}
          </span>
          <span className="text-sm mt-0.5" title={player.country}>
            {player.country === 'India' ? '🇮🇳' :
             player.country === 'Australia' ? '🇦🇺' :
             player.country === 'England' ? '🏴󠁧󠁢󠁥󠁮󠁧󠁿' :
             player.country === 'Pakistan' ? '🇵🇰' :
             player.country === 'South Africa' ? '🇿🇦' :
             player.country === 'New Zealand' ? '🇳🇿' :
             player.country === 'West Indies' ? '🌴' :
             player.country === 'Sri Lanka' ? '🇱🇰' : '🏏'}
          </span>
        </div>

        {/* Player Avatar Emblem Circle */}
        <div className="flex flex-col items-center">
          <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-xl md:text-2xl shadow-inner ${badgeBg}`}>
            {roleEmoji}
          </div>
          {player.ipl_team && (
            <span className="text-[9px] font-semibold text-gray-300/80 mt-1 truncate max-w-[80px]">
              {player.ipl_team.split(' ').pop()}
            </span>
          )}
        </div>
      </div>

      {/* Player Name */}
      <div className="text-center my-2 relative z-10">
        <div className="font-extrabold uppercase tracking-tight truncate text-sm md:text-base drop-shadow-md">
          {player.name}
        </div>
        <div className="text-[10px] uppercase font-bold opacity-80 flex items-center justify-center gap-1">
          <span>{player.country}</span>
          <span>•</span>
          <span>{player.batting_style?.split('-')[0]}</span>
        </div>
      </div>

      {/* Tier Ribbon */}
      <div className={`text-center py-0.5 px-2 rounded-full text-[9px] uppercase tracking-wider shadow-sm mb-2.5 relative z-10 ${bannerBg}`}>
        {bannerText}
      </div>

      {/* 6 Core EA FC Attributes (BAT, PWR, BWL, CLU, FLD, PHY) */}
      {showDetails && (
        <div className="grid grid-cols-2 gap-x-2 gap-y-1 bg-black/40 backdrop-blur-md p-2 rounded-xl border border-white/10 text-[11px] relative z-10 font-bold">
          <div className="flex items-center justify-between border-b border-white/5 pb-0.5">
            <span className="text-gray-400">BAT</span>
            <span className={ea.BAT >= 90 ? 'text-amber-400 font-extrabold' : 'text-white'}>{ea.BAT}</span>
          </div>
          <div className="flex items-center justify-between border-b border-white/5 pb-0.5">
            <span className="text-gray-400">PWR</span>
            <span className={ea.PWR >= 90 ? 'text-amber-400 font-extrabold' : 'text-white'}>{ea.PWR}</span>
          </div>
          <div className="flex items-center justify-between border-b border-white/5 pb-0.5">
            <span className="text-gray-400">BWL</span>
            <span className={ea.BWL >= 90 ? 'text-emerald-400 font-extrabold' : 'text-white'}>{ea.BWL}</span>
          </div>
          <div className="flex items-center justify-between border-b border-white/5 pb-0.5">
            <span className="text-gray-400">CLU</span>
            <span className={ea.CLU >= 90 ? 'text-amber-400 font-extrabold' : 'text-white'}>{ea.CLU}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">FLD</span>
            <span className={ea.FLD >= 90 ? 'text-cyan-400 font-extrabold' : 'text-white'}>{ea.FLD}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">PHY</span>
            <span className={ea.PHY >= 90 ? 'text-green-400 font-extrabold' : 'text-white'}>{ea.PHY}</span>
          </div>
        </div>
      )}
    </div>
  );
}
