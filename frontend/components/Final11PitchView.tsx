'use client';

import React from 'react';
import { TeamPlayer, Player } from '../lib/types';
import { getCountryFlag } from '../lib/playerPhotos';

interface Props {
  team: TeamPlayer[];
  onSelectPlayer: (player: Player) => void;
  format: string;
  pitchType: string;
}

export default function Final11PitchView({ team, onSelectPlayer, format, pitchType }: Props) {
  if (!team || team.length === 0) {
    return (
      <div className="bg-[#0b121e] border border-[#16293d] rounded-2xl p-12 text-center text-gray-500">
        Generate a team XI to view tactical field positions.
      </div>
    );
  }

  // Calculate team balance metrics
  const wk = team.filter(t => t.player.role.toLowerCase().includes('wicket')).length;
  const bat = team.filter(t => t.player.role.toLowerCase().includes('bat') && !t.player.role.toLowerCase().includes('wicket')).length;
  const ar = team.filter(t => t.player.role.toLowerCase().includes('all-rounder')).length;
  const bowl = team.filter(t => t.player.role.toLowerCase().includes('bowler')).length;
  const avgScore = team.reduce((acc, t) => acc + t.context_score, 0) / Math.max(team.length, 1);

  return (
    <div className="space-y-6">
      {/* ── TOP STATS BAR ── */}
      <div 
        className="rounded-2xl p-5 border border-[#144249] flex flex-wrap items-center justify-between gap-4"
        style={{ background: 'linear-gradient(135deg, #09262b 0%, #06191d 100%)' }}
      >
        <div>
          <div className="text-xs font-extrabold uppercase tracking-widest text-emerald-400 mb-1">
            ⚡ AI Recommended Final 11
          </div>
          <h2 className="text-2xl font-black text-white">
            {format.toUpperCase()} Match XI · <span className="text-yellow-400 capitalize">{pitchType} Pitch</span>
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-black/40 border border-white/10 px-4 py-2 rounded-xl text-center">
            <div className="text-xs text-gray-400">Team Rating</div>
            <div className="text-xl font-black text-emerald-400">{avgScore.toFixed(1)}/150</div>
          </div>
          <div className="bg-black/40 border border-white/10 px-4 py-2 rounded-xl text-center">
            <div className="text-xs text-gray-400">Composition</div>
            <div className="text-xs font-bold text-white mt-1">
              <span className="text-yellow-400">WK:{wk}</span> · <span className="text-blue-400">BAT:{bat}</span> · <span className="text-emerald-400">AR:{ar}</span> · <span className="text-red-400">BOWL:{bowl}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── CRICKET PITCH GROUND DIAGRAM ── */}
      <div className="relative rounded-3xl p-6 sm:p-10 overflow-hidden border border-[#14532d]/40 shadow-2xl bg-[#061d15]">
        {/* Grass texture radial */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(ellipse at center, rgba(34, 197, 94, 0.15) 0%, rgba(6, 78, 59, 0.2) 50%, rgba(2, 44, 34, 0.8) 100%)',
          }}
        />

        {/* Outer 30-yard Circle Boundary Ring */}
        <div className="absolute inset-4 sm:inset-8 rounded-full border-2 border-dashed border-emerald-500/20 pointer-events-none" />
        
        {/* Pitch Rectangle in Center */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-28 sm:w-36 h-56 sm:h-64 rounded-xl bg-[#92400e]/30 border-2 border-[#b45309]/40 pointer-events-none shadow-inner flex flex-col justify-between p-2">
          {/* Stumps top */}
          <div className="w-8 h-1 bg-yellow-300 mx-auto rounded" />
          {/* Pitch crease marks */}
          <div className="w-full h-px bg-white/20" />
          <div className="w-8 h-1 bg-yellow-300 mx-auto rounded" />
        </div>

        {/* 11 Players Grid Layout on Pitch */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {team.map((t, idx) => {
            const flag = getCountryFlag(t.player.country);
            const isWK = t.player.role.toLowerCase().includes('wicket');
            const isBowl = t.player.role.toLowerCase().includes('bowler');
            const isAR = t.player.role.toLowerCase().includes('all-rounder');
            const roleIcon = isWK ? '🧤' : isBowl ? '🎯' : isAR ? '⚡' : '🏏';
            const roleColor = isWK ? '#f59e0b' : isBowl ? '#ef4444' : isAR ? '#22c55e' : '#60a5fa';

            return (
              <div
                key={t.player.id}
                onClick={() => onSelectPlayer(t.player)}
                className="group relative bg-[#071d22]/90 hover:bg-[#0c313a] border border-[#175660] hover:border-yellow-400 rounded-2xl p-3.5 flex items-center gap-3.5 transition-all duration-200 cursor-pointer shadow-lg hover:-translate-y-1"
              >
                {/* Jersey / Rank Badge */}
                <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-[#facc15] text-black font-black text-[11px] flex items-center justify-center shadow-md">
                  #{idx + 1}
                </div>

                {/* Role Icon */}
                <div
                  className="relative w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center text-2xl"
                  style={{ background: `${roleColor}22`, border: `1.5px solid ${roleColor}55` }}
                >
                  {roleIcon}
                  <span className="absolute -bottom-1 -right-1 text-xs">{flag}</span>
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span 
                      className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded ${
                        isWK ? 'bg-yellow-400/20 text-yellow-300' :
                        isAR ? 'bg-emerald-400/20 text-emerald-300' :
                        isBowl ? 'bg-red-400/20 text-red-300' : 'bg-blue-400/20 text-blue-300'
                      }`}
                    >
                      {t.team_role || t.player.role}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white truncate group-hover:text-yellow-300 transition-colors">
                    {t.player.name}
                  </h4>
                  <div className="flex items-center justify-between text-[10px] text-gray-400 mt-1">
                    <span>Score: <strong className="text-emerald-400">{t.context_score.toFixed(0)}</strong></span>
                    <span>{t.player.batting_style?.slice(0, 5)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
