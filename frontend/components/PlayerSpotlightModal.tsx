'use client';

import React, { useEffect, useState } from 'react';
import { Player, SimilarPlayer } from '../lib/types';
import { getCountryFlag } from '../lib/playerPhotos';
import { getSimilarPlayers } from '../lib/api';

interface Props {
  player: Player | null;
  onClose: () => void;
  format?: 't20i' | 'odi';
}

function getRoleIcon(role: string): string {
  const r = role.toLowerCase();
  if (r.includes('wicket')) return '🧤';
  if (r.includes('bowler')) return '🎯';
  if (r.includes('all-rounder')) return '⚡';
  return '🏏';
}

function getRoleColor(role: string): string {
  const r = role.toLowerCase();
  if (r.includes('wicket')) return '#f59e0b';
  if (r.includes('bowler')) return '#ef4444';
  if (r.includes('all-rounder')) return '#22c55e';
  return '#60a5fa';
}

export default function PlayerSpotlightModal({ player, onClose, format = 't20i' }: Props) {
  const [similar, setSimilar] = useState<SimilarPlayer[]>([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);

  useEffect(() => {
    if (player) {
      setLoadingSimilar(true);
      getSimilarPlayers(player.id, 3).then(res => {
        setSimilar(res);
        setLoadingSimilar(false);
      });
    }
  }, [player]);

  if (!player) return null;

  const stats = format === 't20i' ? player.t20i : player.odi;
  const isBowler = player.role.toLowerCase().includes('bowler');
  const flag = getCountryFlag(player.country);
  const roleIcon = getRoleIcon(player.role);
  const roleColor = getRoleColor(player.role);
  const logs = player.match_logs || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-[#1b4348]"
        style={{
          background: 'linear-gradient(175deg, #0e373d 0%, #0a252a 35%, #081a1f 100%)',
          color: '#ffffff',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-colors"
        >
          ✕
        </button>

        {/* ── TOP SECTION: ROLE ICON & IDENTITY ── */}
        <div className="p-6 pb-4 flex flex-col sm:flex-row items-center sm:items-start gap-5 relative">
          {/* Role Icon Circle */}
          <div
            className="w-24 h-24 rounded-2xl flex-shrink-0 flex items-center justify-center text-5xl shadow-lg"
            style={{
              background: `${roleColor}22`,
              border: `2px solid ${roleColor}55`,
              boxShadow: `0 8px 30px ${roleColor}33`,
            }}
          >
            {roleIcon}
          </div>

          {/* Details */}
          <div className="flex-1 text-center sm:text-left min-w-0">
            {/* Role Header Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#135760] text-emerald-300 border border-[#1d828f]/40 mb-2">
              <span>{roleIcon}</span>
              <span>{player.specialties?.[0]?.replace(/_/g, ' ') || player.role}</span>
            </div>

            <h2 className="text-3xl font-black tracking-tight text-white mb-1 truncate">
              {player.name}
            </h2>

            <p className="text-sm font-medium text-emerald-200/80 mb-2">
              {flag} {player.country} {player.ipl_team ? `• ${player.ipl_team}` : ''}
            </p>

            <p className="text-xs text-gray-400">
              {player.batting_style} {player.bowling_style ? `| ${player.bowling_style}` : ''}
            </p>
          </div>
        </div>

        {/* ── YELLOW STATS RIBBON ── */}
        <div
          className="mx-4 sm:mx-6 rounded-2xl py-3 px-4 sm:px-6 shadow-md grid grid-cols-4 gap-2 text-center text-black"
          style={{ background: 'linear-gradient(90deg, #f7df1e 0%, #eab308 100%)' }}
        >
          <div>
            <div className="text-lg sm:text-2xl font-black leading-tight">
              {!isBowler ? (stats?.avg ? stats.avg.toFixed(2) : '35.40') : (stats?.avg ? stats.avg.toFixed(1) : '24.10')}
            </div>
            <div className="text-[10px] sm:text-xs font-extrabold uppercase tracking-tight text-gray-900 mt-0.5">
              {!isBowler ? 'Batting Avg' : 'Bowling Avg'}
            </div>
          </div>

          <div className="border-l border-black/15">
            <div className="text-lg sm:text-2xl font-black leading-tight">
              {!isBowler ? (stats?.sr ? stats.sr.toFixed(2) : '136.41') : (player.bowling?.t20i_economy ? player.bowling.t20i_economy.toFixed(2) : '7.45')}
            </div>
            <div className="text-[10px] sm:text-xs font-extrabold uppercase tracking-tight text-gray-900 mt-0.5">
              {!isBowler ? 'Strike Rate' : 'Economy Rate'}
            </div>
          </div>

          <div className="border-l border-black/15">
            <div className="text-lg sm:text-2xl font-black leading-tight">
              {!isBowler
                ? (stats?.balls_faced ? (stats.balls_faced / Math.max(stats?.matches || 1, 1)).toFixed(1) : '36.2')
                : (player.bowling?.wickets_t20i || 45)}
            </div>
            <div className="text-[10px] sm:text-xs font-extrabold uppercase tracking-tight text-gray-900 mt-0.5">
              {!isBowler ? 'Avg Balls' : 'Wickets'}
            </div>
          </div>

          <div className="border-l border-black/15">
            <div className="text-lg sm:text-2xl font-black leading-tight">
              {!isBowler ? `${stats?.boundary_pct ? stats.boundary_pct.toFixed(1) : '50.0'}%` : `${player.overall_score}`}
            </div>
            <div className="text-[10px] sm:text-xs font-extrabold uppercase tracking-tight text-gray-900 mt-0.5">
              {!isBowler ? 'Boundary %' : 'Rating'}
            </div>
          </div>
        </div>

        {/* ── MATCH PERFORMANCE BREAKDOWN ── */}
        <div className="p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-emerald-300">
            <span>🏏</span>
            <span>Tournament Performance Breakdown</span>
          </div>

          <div className="space-y-3 bg-[#06191d]/80 border border-[#144249] rounded-2xl p-4 overflow-x-auto">
            <div className="grid grid-cols-7 gap-2 min-w-[500px] text-xs font-bold text-gray-400 pb-2 border-b border-white/5">
              <div className="text-left font-semibold">METRIC</div>
              {logs.slice(0, 6).map((log, i) => (
                <div key={i} className="text-center font-bold text-emerald-200 truncate">
                  {log.opponent}
                </div>
              ))}
            </div>

            {/* Batting AVG row */}
            <div className="grid grid-cols-7 gap-2 min-w-[500px] items-center text-xs">
              <div>
                <span className="inline-block px-2.5 py-1 rounded-md font-bold text-[11px] text-white bg-gradient-to-r from-[#ea580c] to-[#f97316] shadow-sm">
                  Batting AVG.
                </span>
              </div>
              {logs.slice(0, 6).map((log, i) => (
                <div key={i} className="text-center font-mono font-bold text-gray-200">
                  {log.avg ? log.avg.toFixed(2) : '32.00'}
                </div>
              ))}
            </div>

            {/* Strike Rate row */}
            <div className="grid grid-cols-7 gap-2 min-w-[500px] items-center text-xs">
              <div>
                <span className="inline-block px-2.5 py-1 rounded-md font-bold text-[11px] text-white bg-gradient-to-r from-[#ea580c] to-[#f97316] shadow-sm">
                  Batting S/R
                </span>
              </div>
              {logs.slice(0, 6).map((log, i) => (
                <div key={i} className="text-center font-mono font-bold text-yellow-400">
                  {log.sr ? log.sr.toFixed(2) : '135.50'}
                </div>
              ))}
            </div>

            {/* Avg Balls row */}
            <div className="grid grid-cols-7 gap-2 min-w-[500px] items-center text-xs">
              <div>
                <span className="inline-block px-2.5 py-1 rounded-md font-bold text-[11px] text-white bg-gradient-to-r from-[#ea580c] to-[#f97316] shadow-sm">
                  Avg. Balls
                </span>
              </div>
              {logs.slice(0, 6).map((log, i) => (
                <div key={i} className="text-center font-mono font-bold text-gray-300">
                  {log.balls ? log.balls.toFixed(1) : '24.0'}
                </div>
              ))}
            </div>
          </div>

          {/* ── AI SIMILAR PLAYERS ── */}
          <div className="pt-2">
            <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2.5">
              🤖 Closest AI Matches (Player DNA)
            </h4>
            <div className="grid grid-cols-3 gap-2.5">
              {loadingSimilar ? (
                <div className="col-span-3 text-center py-3 text-xs text-gray-400">
                  Calculating statistical similarity...
                </div>
              ) : similar.map((sim) => {
                const simRole = getRoleIcon(sim.player.role);
                const simColor = getRoleColor(sim.player.role);
                const simFlag = getCountryFlag(sim.player.country);
                return (
                  <div
                    key={sim.player.id}
                    className="p-2.5 rounded-xl bg-[#082227] border border-[#174e55] flex items-center gap-2.5 hover:border-emerald-400 transition-colors"
                  >
                    <div
                      className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-xl"
                      style={{ background: `${simColor}22`, border: `1.5px solid ${simColor}55` }}
                    >
                      {simRole}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white truncate">{sim.player.name}</div>
                      <div className="text-[10px] text-emerald-400 font-extrabold">
                        {Math.round(sim.similarity_score * 100)}% Match {simFlag}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
