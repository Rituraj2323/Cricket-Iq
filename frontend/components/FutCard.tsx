'use client';

import React from 'react';
import { WcHeroPlayer } from '../lib/types';

const COUNTRY_FLAGS: Record<string, string> = {
  Australia: '🇦🇺',
  India: '🇮🇳',
  'West Indies': '🌴',
  Pakistan: '🇵🇰',
  England: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'Sri Lanka': '🇱🇰',
  'South Africa': '🇿🇦',
  'New Zealand': '🇳🇿',
  Bangladesh: '🇧🇩',
  Zimbabwe: '🇿🇼',
  Kenya: '🇰🇪',
  Ireland: '🇮🇪',
  Netherlands: '🇳🇱',
  Afghanistan: '🇦🇫',
  Scotland: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  Canada: '🇨🇦',
  'United Arab Emirates': '🇦🇪',
  Bermuda: '🇧🇲',
  Namibia: '🇳🇦',
  'East Africa': '🌍',
};

const ROLE_SHORT: Record<string, string> = {
  Batter: 'BAT',
  'Fast Bowler': 'BOW',
  Bowler: 'BOW',
  'Spin Bowler': 'SPN',
  'All-Rounder': 'ALL',
  'Wicketkeeper-Batter': 'WKB',
  'Wicket-keeper Batsman': 'WKB',
  Wicketkeeper: 'WKB',
};

interface FutCardProps {
  player: WcHeroPlayer | any;
  onClick?: (player: any) => void;
  isSelected?: boolean;
  showCompareBtn?: boolean;
  onCompare?: (player: any) => void;
  scale?: number;
}

export default function FutCard({
  player,
  onClick,
  isSelected,
  showCompareBtn,
  onCompare,
  scale = 1,
}: FutCardProps) {
  if (!player) return null;

  const ovr = player.OVR || player.ovr || 88;
  const tier = player.tier || (player.card_tier === 'ICON' ? 'WC Icon' : player.card_tier === 'HERO' ? 'Team of Tournament' : 'Gold Rare');

  const THEME_MAP: Record<string, string> = {
    'WC Icon': 'fut-card-icon',
    ICON: 'fut-card-icon',
    'Team of Tournament': 'fut-card-tot',
    HERO: 'fut-card-tot',
    'Gold Rare': 'fut-card-gold',
    GOLD_RARE: 'fut-card-gold',
    Silver: 'fut-card-silver',
    Bronze: 'fut-card-bronze',
  };
  const cardThemeClass = THEME_MAP[String(tier)] || 'fut-card-gold';

  const flag = COUNTRY_FLAGS[player.country] || '🏏';
  const roleCode = ROLE_SHORT[player.role] || (player.role?.includes('All') ? 'ALL' : player.role?.includes('Bowl') ? 'BOW' : player.role?.includes('Wicket') ? 'WKB' : 'BAT');

  const attrs = player.attributes || {
    BAT: player.ea_stats?.BAT || 85,
    BOW: player.ea_stats?.BWL || 70,
    POW: player.ea_stats?.PWR || 82,
    CTL: player.ea_stats?.CLU || 80,
    FLD: player.ea_stats?.FLD || 78,
    IMP: player.ea_stats?.PHY || 84,
  };

  return (
    <div
      onClick={() => onClick && onClick(player)}
      style={{
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: 'top center',
      }}
      className={`relative w-64 h-96 p-4 rounded-xl cursor-pointer select-none transition-all duration-300 fut-card-shape ${cardThemeClass} ${
        isSelected ? 'ring-4 ring-yellow-400 scale-105 z-10 shadow-2xl' : ''
      }`}
    >
      {/* Glossy sheen reflection */}
      <div className="fut-shine" />

      {/* Top Banner Header */}
      <div className="flex justify-between items-start border-b border-black/15 pb-2">
        <div className="flex flex-col items-center">
          <span className="text-4xl font-extrabold tracking-tighter drop-shadow-md leading-none">
            {ovr}
          </span>
          <span className="text-[11px] font-black uppercase tracking-wider opacity-90 mt-0.5">
            {roleCode}
          </span>
          <span className="text-xl mt-1 drop-shadow-sm">{flag}</span>
        </div>
        <div className="text-right flex flex-col items-end">
          <span className="text-[11px] font-black tracking-widest px-2.5 py-0.5 rounded-md bg-black/25 backdrop-blur-xs uppercase border border-black/15">
            {player.year || 'WC'}
          </span>
          <div className="flex gap-1 mt-1.5">
            {player.is_pot && (
              <span
                title="Player of the Tournament"
                className="text-base bg-amber-400/30 p-0.5 rounded-full border border-amber-300/40"
              >
                🏆
              </span>
            )}
            {player.won_wc && (
              <span
                title="World Cup Champion"
                className="text-base bg-yellow-300/30 p-0.5 rounded-full border border-yellow-200/40"
              >
                🥇
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Player Full Name */}
      <div className="my-3 flex flex-col items-center justify-center relative min-h-[130px] px-1">
        <h3 className="font-black text-2xl tracking-tighter leading-none uppercase drop-shadow-md text-center break-words w-full px-2">
          {player.name}
        </h3>
        <p className="text-[11px] uppercase tracking-widest font-extrabold opacity-85 mt-2.5 border-t border-black/20 pt-1 px-4">
          {player.country}
        </p>
      </div>

      {/* 6 Key World Cup Attributes Grid */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 pt-2 border-t border-black/15 text-xs font-black">
        <div className="flex justify-between px-2 py-0.5 rounded bg-black/15">
          <span className="opacity-80">BAT</span>
          <span className="font-black">{attrs.BAT || attrs.bat || 80}</span>
        </div>
        <div className="flex justify-between px-2 py-0.5 rounded bg-black/15">
          <span className="opacity-80">BOW</span>
          <span className="font-black">{attrs.BOW || attrs.bow || 70}</span>
        </div>
        <div className="flex justify-between px-2 py-0.5 rounded bg-black/15">
          <span className="opacity-80">POW</span>
          <span className="font-black">{attrs.POW || attrs.pow || 80}</span>
        </div>
        <div className="flex justify-between px-2 py-0.5 rounded bg-black/15">
          <span className="opacity-80">CTL</span>
          <span className="font-black">{attrs.CTL || attrs.ctl || 75}</span>
        </div>
        <div className="flex justify-between px-2 py-0.5 rounded bg-black/15">
          <span className="opacity-80">FLD</span>
          <span className="font-black">{attrs.FLD || attrs.fld || 78}</span>
        </div>
        <div className="flex justify-between px-2 py-0.5 rounded bg-black/15">
          <span className="opacity-80">IMP</span>
          <span className="font-black">{attrs.IMP || attrs.imp || 85}</span>
        </div>
      </div>

      {/* Compare Mode action overlay if enabled */}
      {showCompareBtn && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCompare && onCompare(player);
          }}
          className="mt-2 w-full py-1 text-[10px] font-black uppercase tracking-wider bg-black/40 hover:bg-black/60 rounded-lg text-white border border-white/20 transition-all"
        >
          Compare ⚖️
        </button>
      )}
    </div>
  );
}
