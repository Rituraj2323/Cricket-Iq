'use client';

import React from 'react';
import { Player } from '../lib/types';

interface Props {
  selectedPlayer: Player | null;
}

export default function PerformanceTrendChart({ selectedPlayer }: Props) {
  if (!selectedPlayer) {
    return (
      <div className="bg-[#0b121e] border border-[#16293d] rounded-2xl p-5 shadow-xl flex items-center justify-center text-center text-gray-500 h-full">
        Select a player to view match-by-match trend curves
      </div>
    );
  }

  const logs = selectedPlayer.match_logs || [];
  const points = logs.slice(0, 6);

  // SVG dimensions
  const width = 460;
  const height = 90;
  const padding = 25;

  // Max values
  const maxAvg = Math.max(...points.map(p => p.avg || 30), 70);
  const maxSr = Math.max(...points.map(p => p.sr || 120), 200);

  const getPoints = (isAvg: boolean) => {
    return points.map((p, idx) => {
      const x = padding + (idx / Math.max(points.length - 1, 1)) * (width - 2 * padding);
      const val = isAvg ? (p.avg || 30) : (p.sr || 120);
      const max = isAvg ? maxAvg : maxSr;
      const y = height - padding - (val / max) * (height - 2 * padding);
      return { x, y, val, opponent: p.opponent };
    });
  };

  const avgPoints = getPoints(true);
  const srPoints = getPoints(false);

  const createSvgPath = (pts: Array<{ x: number; y: number }>) => {
    if (pts.length === 0) return '';
    return pts.reduce((acc, curr, idx) => {
      return idx === 0 ? `M ${curr.x},${curr.y}` : `${acc} L ${curr.x},${curr.y}`;
    }, '');
  };

  return (
    <div className="bg-[#0b121e] border border-[#16293d] rounded-2xl p-5 shadow-xl flex flex-col justify-between h-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>📈</span>
            <span>Match-by-Match Trend Curve ({selectedPlayer.name})</span>
          </h3>
          <p className="text-[11px] text-gray-400">Progression across recent tournament games</p>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
          Form: {selectedPlayer.recent_form}/100
        </span>
      </div>

      {/* Chart 1: Batting Avg */}
      <div className="bg-[#070c14] border border-[#172535] rounded-xl p-3 relative">
        <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 mb-1">
          <span className="text-emerald-400">Batting Avg Trend</span>
          <span className="text-[10px] font-mono text-gray-500">Max: {maxAvg.toFixed(0)}</span>
        </div>
        <div className="relative h-[80px] w-full">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
            {/* Grid line */}
            <line x1="20" y1="45" x2={width - 20} y2="45" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
            
            {/* Area gradient under line */}
            <defs>
              <linearGradient id="avgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#22c55e" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d={`${createSvgPath(avgPoints)} L ${avgPoints[avgPoints.length - 1]?.x || 0},${height} L ${avgPoints[0]?.x || 0},${height} Z`}
              fill="url(#avgGrad)"
            />

            {/* Line path */}
            <path
              d={createSvgPath(avgPoints)}
              fill="none"
              stroke="#22c55e"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Dots */}
            {avgPoints.map((pt, i) => (
              <g key={i}>
                <circle cx={pt.x} cy={pt.y} r="3.5" fill="#facc15" stroke="#000" strokeWidth="1.5" />
                <text
                  x={pt.x}
                  y={pt.y - 7}
                  fill="#ffffff"
                  fontSize="8.5"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {pt.val.toFixed(0)}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* Chart 2: Strike Rate */}
      <div className="bg-[#070c14] border border-[#172535] rounded-xl p-3 relative">
        <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 mb-1">
          <span className="text-yellow-400">Strike Rate Trend</span>
          <span className="text-[10px] font-mono text-gray-500">Max: {maxSr.toFixed(0)}</span>
        </div>
        <div className="relative h-[80px] w-full">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
            {/* Grid line */}
            <line x1="20" y1="45" x2={width - 20} y2="45" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
            
            {/* Area gradient under line */}
            <defs>
              <linearGradient id="srGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d={`${createSvgPath(srPoints)} L ${srPoints[srPoints.length - 1]?.x || 0},${height} L ${srPoints[0]?.x || 0},${height} Z`}
              fill="url(#srGrad)"
            />

            {/* Line path */}
            <path
              d={createSvgPath(srPoints)}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Dots */}
            {srPoints.map((pt, i) => (
              <g key={i}>
                <circle cx={pt.x} cy={pt.y} r="3.5" fill="#38bdf8" stroke="#000" strokeWidth="1.5" />
                <text
                  x={pt.x}
                  y={pt.y - 7}
                  fill="#ffffff"
                  fontSize="8.5"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {pt.val.toFixed(0)}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
}
