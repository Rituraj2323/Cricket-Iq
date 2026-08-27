'use client';

import React from 'react';
import { Player } from '../lib/types';

interface Props {
  players: Player[];
  onSelectPlayer: (player: Player) => void;
  format?: 't20i' | 'odi';
}

export default function ScatterQuadrantPlot({ players, onSelectPlayer, format = 't20i' }: Props) {
  const isBowlerMode = players.length > 0 && players.filter(p => p.role.toLowerCase().includes('bowler')).length > players.length / 2;

  // Filter valid players with non-zero stats
  const validPlayers = players.filter(p => {
    if (isBowlerMode) {
      return (p.bowling?.t20i_economy || 0) > 0 && (p.bowling?.wickets_t20i || 0) > 0;
    }
    const st = format === 't20i' ? p.t20i : p.odi;
    return (st?.avg || 0) > 0 && (st?.sr || 0) > 0;
  });

  const displayList = validPlayers.slice(0, 14);

  // Bounds for batting: Avg (15 to 65), SR (110 to 200)
  // Bounds for bowling: Economy (5 to 11), Wickets (10 to 140)
  const minX = isBowlerMode ? 5.0 : 15.0;
  const maxX = isBowlerMode ? 11.0 : 65.0;
  const minY = isBowlerMode ? 10.0 : 110.0;
  const maxY = isBowlerMode ? 140.0 : 200.0;

  const getPosition = (player: Player) => {
    if (isBowlerMode) {
      const eco = player.bowling?.t20i_economy || 7.5;
      const wkts = player.bowling?.wickets_t20i || 30;
      // Invert economy so lower eco is on the right
      const xPct = Math.max(0, Math.min(100, ((11.0 - eco) / (11.0 - 5.0)) * 100));
      const yPct = Math.max(0, Math.min(100, ((wkts - minY) / (maxY - minY)) * 100));
      return { x: xPct, y: 100 - yPct };
    } else {
      const st = format === 't20i' ? player.t20i : player.odi;
      const avg = st?.avg || 30.0;
      const sr = st?.sr || 135.0;
      const xPct = Math.max(0, Math.min(100, ((avg - minX) / (maxX - minX)) * 100));
      const yPct = Math.max(0, Math.min(100, ((sr - minY) / (maxY - minY)) * 100));
      return { x: xPct, y: 100 - yPct };
    }
  };

  return (
    <div className="bg-[#0b121e] border border-[#16293d] rounded-2xl p-5 shadow-xl relative overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>📊</span>
            <span>{isBowlerMode ? 'Economy vs Wicket Rate Matrix' : 'Strike Rate vs Batting Average Matrix'}</span>
          </h3>
          <p className="text-[11px] text-gray-400">
            {isBowlerMode ? 'Top Right = Low Economy & High Wickets' : 'Top Right = High Impact & Consistency (Elite Quadrant)'}
          </p>
        </div>
        <div className="text-[10px] uppercase font-extrabold px-2.5 py-1 rounded bg-[#103548] text-cyan-300 border border-cyan-500/30">
          Quadrant Matrix
        </div>
      </div>

      {/* Plot Area */}
      <div className="relative flex-1 min-h-[260px] border border-dashed border-[#1f3750] rounded-xl bg-[#070c14] p-6 overflow-hidden">
        {/* Grid lines */}
        <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 pointer-events-none">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="border-r border-b border-white/[0.03]" />
          ))}
        </div>

        {/* Median / Benchmark divider lines */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-cyan-500/20 border-r border-dashed border-cyan-400/30" />
        <div className="absolute top-1/2 left-0 right-0 h-px bg-cyan-500/20 border-b border-dashed border-cyan-400/30" />

        {/* Y Axis Label */}
        <div className="absolute top-2 left-2 text-[10px] font-mono font-bold text-gray-500 tracking-wider">
          {isBowlerMode ? '▲ WICKETS' : '▲ STRIKE RATE (180+)'}
        </div>
        <div className="absolute bottom-2 left-2 text-[10px] font-mono font-bold text-gray-500">
          {isBowlerMode ? '▼ WICKETS' : '▼ (120)'}
        </div>

        {/* X Axis Label */}
        <div className="absolute bottom-2 right-4 text-[10px] font-mono font-bold text-gray-500">
          {isBowlerMode ? 'LOW ECONOMY ▶' : 'BATTING AVG (50+) ▶'}
        </div>

        {/* High Impact Quadrant Tag */}
        <div className="absolute top-3 right-3 text-[10px] font-bold text-emerald-400/60 bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-500/20 pointer-events-none">
          ELITE PERFORMANCE
        </div>

        {/* Scatter Dots */}
        {displayList.map((player) => {
          const pos = getPosition(player);
          const st = format === 't20i' ? player.t20i : player.odi;
          return (
            <div
              key={player.id}
              onClick={() => onSelectPlayer(player)}
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              className="absolute z-10 group cursor-pointer"
            >
              {/* Glowing Dot */}
              <div 
                className="w-4 h-4 rounded-full bg-[#facc15] border-2 border-black group-hover:bg-emerald-400 group-hover:scale-150 transition-all duration-200 shadow-md shadow-yellow-500/40"
              />
              
              {/* Player Label (Matching reference UI) */}
              <div className="absolute left-5 top-1/2 -translate-y-1/2 whitespace-nowrap text-[11px] font-bold text-gray-200 group-hover:text-yellow-300 transition-colors pointer-events-none bg-black/60 px-1.5 py-0.5 rounded border border-white/5">
                {player.name}
              </div>

              {/* Tooltip on hover */}
              <div className="hidden group-hover:block absolute bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap z-30 bg-[#061e24] border border-cyan-400 text-white rounded-lg px-2.5 py-1 text-[10px] font-semibold shadow-2xl">
                {!isBowlerMode ? (
                  <>
                    <span className="text-yellow-400 font-bold">{player.name}</span> · Avg: {st?.avg?.toFixed(1)} · SR: {st?.sr?.toFixed(1)}
                  </>
                ) : (
                  <>
                    <span className="text-yellow-400 font-bold">{player.name}</span> · Eco: {player.bowling?.t20i_economy} · Wkts: {player.bowling?.wickets_t20i}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
