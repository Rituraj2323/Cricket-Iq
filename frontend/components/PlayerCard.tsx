'use client';

import React from 'react';
import Link from 'next/link';
import { Player } from '../lib/types';
import { getPlayerPhoto, getCountryFlag } from '../lib/playerPhotos';
import ScoreBar from './ScoreBar';

interface Props {
  player: Player;
  format?: 't20i' | 'odi';
  similarity_score?: number;
  explanation?: string;
  rank?: number;
  compact?: boolean;
}

export default function PlayerCard({ player, format = 't20i', similarity_score, explanation, rank, compact }: Props) {
  const stats = format === 't20i' ? player.t20i : player.odi;
  const isBowler = player.role.toLowerCase().includes('bowler');
  const isAllRounder = player.role.toLowerCase().includes('all-rounder');
  const isWK = player.role.toLowerCase().includes('wicket');
  const photo = getPlayerPhoto(player.id, player.name, player.country);
  const flag = getCountryFlag(player.country);

  return (
    <div
      className="card-hover relative flex flex-col h-full rounded-2xl overflow-hidden shadow-xl border border-[#1b2f44] transition-all duration-200"
      style={{
        background: 'linear-gradient(170deg, #0f1c2b 0%, #0a1420 100%)',
      }}
    >
      {/* Role colored top line */}
      <div
        className="h-1 w-full"
        style={{
          background: isWK
            ? 'linear-gradient(90deg, #f59e0b, transparent)'
            : isAR(player)
            ? 'linear-gradient(90deg, #22c55e, transparent)'
            : isBowler
            ? 'linear-gradient(90deg, #ef4444, transparent)'
            : 'linear-gradient(90deg, #38bdf8, transparent)',
        }}
      />

      <div className="p-5 flex flex-col h-full space-y-4">
        {/* Header row: Photo + Identity */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Rank badge */}
            {rank && (
              <span className="w-6 h-6 rounded-full bg-[#facc15] text-black font-black text-xs flex items-center justify-center flex-shrink-0 shadow-md">
                #{rank}
              </span>
            )}

            {/* Photo Thumbnail */}
            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-black/60 border border-cyan-500/30 flex-shrink-0 shadow-md">
              <img
                src={photo}
                alt={player.name}
                className="w-full h-full object-cover object-top"
              />
              <span className="absolute bottom-0 right-0 text-xs">
                {flag}
              </span>
            </div>

            {/* Name and tags */}
            <div className="min-w-0 flex-1">
              <Link
                href={`/player/${player.id}`}
                className="text-sm font-black text-white hover:text-[#f7df1e] truncate block transition-colors"
              >
                {player.name}
              </Link>
              <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-[#133c4a] text-cyan-300 border border-cyan-500/20">
                  {player.role.replace('-keeper Batsman', 'K')}
                </span>
                <span className="text-[10px] text-gray-400">
                  {player.country}
                </span>
              </div>
            </div>
          </div>

          {/* Similarity match badge */}
          {similarity_score !== undefined && (
            <div className="flex-shrink-0 text-center px-2 py-1 rounded-xl bg-emerald-950/80 border border-emerald-500/40">
              <div className="text-sm font-black text-emerald-400">{similarity_score}%</div>
              <div className="text-[9px] uppercase font-bold text-emerald-600">DNA</div>
            </div>
          )}
        </div>

        {/* Stats Grid (Yellow / Green accents) */}
        {!compact && (
          <div className="grid grid-cols-2 gap-2 text-center text-xs bg-black/40 border border-white/5 p-2.5 rounded-xl font-mono">
            {(!isBowler || isAllRounder) && (
              <>
                <div>
                  <div className="text-[10px] text-gray-500">AVG</div>
                  <div className="font-bold text-white text-sm">{stats?.avg?.toFixed(1) || '—'}</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-500">SR</div>
                  <div className="font-bold text-[#facc15] text-sm">{stats?.sr?.toFixed(0) || '—'}</div>
                </div>
              </>
            )}
            {(isBowler || isAllRounder) && (
              <>
                <div>
                  <div className="text-[10px] text-gray-500">ECO</div>
                  <div className="font-bold text-emerald-400 text-sm">
                    {format === 't20i'
                      ? player.bowling?.t20i_economy?.toFixed(2) || '—'
                      : player.bowling?.odi_economy?.toFixed(2) || '—'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-500">WKTS</div>
                  <div className="font-bold text-white text-sm">
                    {format === 't20i'
                      ? player.bowling?.wickets_t20i || '—'
                      : player.bowling?.wickets_odi || '—'}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Score Bars */}
        <div className="space-y-2 mt-auto">
          <ScoreBar label="Overall Rating" value={player.overall_score} color="#22c55e" />
          <ScoreBar label="Recent Form" value={player.recent_form} color="#38bdf8" />
        </div>

        {/* Explanation text */}
        {explanation && (
          <div className="text-[11px] text-gray-400 italic bg-black/20 p-2.5 rounded-lg border border-white/5 leading-relaxed">
            "{explanation}"
          </div>
        )}
      </div>
    </div>
  );
}

function isAR(player: Player): boolean {
  return player.role.toLowerCase().includes('all-rounder');
}
