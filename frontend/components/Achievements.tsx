'use client';

import React from 'react';

const BADGES = [
  {
    id: '11-0 Undefeated Champion',
    name: '👑 The Perfect 11–0',
    desc: 'Win all 11 World Cup matches in a single campaign without dropping a match.',
    icon: '🏆',
  },
  {
    id: 'World Cup Winner',
    name: '🥇 World Cup Winner',
    desc: 'Win the Grand World Cup Final.',
    icon: '🥇',
  },
  {
    id: 'First Draft',
    name: '📋 Master Drafter',
    desc: 'Complete your first 11-player squad draft using the random dice.',
    icon: '🎲',
  },
  {
    id: '90+ Squad Rating',
    name: '⭐ Superteam (90+ OVR)',
    desc: 'Build a squad with an overall average OVR of 90 or higher.',
    icon: '🌟',
  },
  {
    id: 'Underdog Triumph',
    name: '🛡️ Underdog Triumph',
    desc: 'Win the World Cup with a squad under 80 OVR.',
    icon: '⚔️',
  },
];

export default function Achievements({ unlockedBadges = [] }: { unlockedBadges?: string[] }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 text-slate-100">
      <div className="pb-4 border-b border-slate-800">
        <span className="text-[10px] font-black uppercase text-yellow-400 tracking-widest block">
          🎖️ Hall of Fame Badges
        </span>
        <h2 className="text-2xl font-black uppercase text-white tracking-tight mt-1">
          Your 11–0 Campaign Trophies ({unlockedBadges.length} / {BADGES.length})
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {BADGES.map((b) => {
          const isUnlocked = unlockedBadges.includes(b.id);

          return (
            <div
              key={b.id}
              className={`p-4 rounded-2xl border transition-all flex items-center gap-4 ${
                isUnlocked
                  ? 'bg-yellow-500/10 border-yellow-500/40 shadow-lg shadow-yellow-500/10'
                  : 'bg-slate-950/40 border-slate-800/80 opacity-50 grayscale'
              }`}
            >
              <div className="text-4xl">{b.icon}</div>
              <div>
                <h4 className="font-extrabold text-xs text-white flex items-center gap-2">
                  <span>{b.name}</span>
                  {isUnlocked && (
                    <span className="text-[9px] bg-yellow-400 text-slate-950 font-black px-1.5 py-0.5 rounded">
                      UNLOCKED
                    </span>
                  )}
                </h4>
                <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{b.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
