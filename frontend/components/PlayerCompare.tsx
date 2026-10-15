'use client';

import React from 'react';
import { WcHeroPlayer } from '../lib/types';

interface PlayerCompareProps {
  p1: WcHeroPlayer | any;
  p2: WcHeroPlayer | any;
  onClose: () => void;
}

export default function PlayerCompare({ p1, p2, onClose }: PlayerCompareProps) {
  if (!p1 || !p2) return null;

  const attrs = ['BAT', 'POW', 'BOW', 'CTL', 'FLD', 'IMP'] as const;
  const attrLabels: Record<string, string> = {
    BAT: 'Batting Ability',
    POW: 'Power & Strike Rate',
    BOW: 'Bowling Mastery',
    CTL: 'Control & Economy',
    FLD: 'Fielding & Keeping',
    IMP: 'Impact & Clutch',
  };

  const getAttr = (p: any, k: string) => {
    return p.attributes?.[k] || (p.ea_stats ? (p.ea_stats[k] || 75) : 75);
  };

  const getStat = (p: any) => {
    return p.stats || {
      matches: p.t20i?.matches || p.odi?.matches || 20,
      runs: p.t20i?.runs || p.odi?.runs || 600,
      bat_avg: p.t20i?.avg || p.odi?.avg || 35.0,
      bat_sr: p.t20i?.sr || p.odi?.sr || 130.0,
      fifties: p.t20i?.fifties || p.odi?.fifties || 4,
      hundreds: p.t20i?.hundreds || p.odi?.hundreds || 1,
      wickets: p.bowling?.wickets_t20i || p.bowling?.wickets_odi || 10,
      bow_avg: 24.5,
      econ: p.bowling?.t20i_economy || p.bowling?.odi_economy || 7.2,
    };
  };

  const s1 = getStat(p1);
  const s2 = getStat(p2);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-3xl p-6 md:p-8 shadow-2xl relative text-white">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white bg-slate-800 p-2.5 rounded-full transition-colors font-black"
        >
          ✕
        </button>

        <div className="text-center mb-6">
          <span className="text-[11px] font-black uppercase text-yellow-400 tracking-widest block">
            Head-to-Head Tactical Analysis
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-wider mt-1">
            World Cup Ultimate Cards Comparison
          </h2>
        </div>

        {/* Top Header: Player 1 vs Player 2 */}
        <div className="grid grid-cols-2 gap-4 pb-6 border-b border-slate-800">
          <div className="text-center p-4 bg-slate-950/70 rounded-2xl border border-slate-800">
            <span className="text-4xl md:text-5xl font-black text-yellow-400">
              {p1.OVR || p1.ovr || 88}
            </span>
            <h3 className="text-lg md:text-xl font-black uppercase tracking-tight mt-1 text-white">
              {p1.name}
            </h3>
            <p className="text-xs text-slate-400 font-bold">
              {p1.country} • {p1.year ? `WC ${p1.year}` : p1.role}
            </p>
            <span className="inline-block mt-2 text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md bg-yellow-400/20 text-yellow-400 font-extrabold border border-yellow-400/30">
              {p1.tier || (p1.card_tier || 'Gold Rare')}
            </span>
          </div>

          <div className="text-center p-4 bg-slate-950/70 rounded-2xl border border-slate-800">
            <span className="text-4xl md:text-5xl font-black text-yellow-400">
              {p2.OVR || p2.ovr || 88}
            </span>
            <h3 className="text-lg md:text-xl font-black uppercase tracking-tight mt-1 text-white">
              {p2.name}
            </h3>
            <p className="text-xs text-slate-400 font-bold">
              {p2.country} • {p2.year ? `WC ${p2.year}` : p2.role}
            </p>
            <span className="inline-block mt-2 text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md bg-yellow-400/20 text-yellow-400 font-extrabold border border-yellow-400/30">
              {p2.tier || (p2.card_tier || 'Gold Rare')}
            </span>
          </div>
        </div>

        {/* Attribute Bar Comparisons */}
        <div className="py-6 space-y-4">
          <h4 className="text-xs uppercase tracking-widest text-slate-400 text-center font-black">
            ⚡ 6 Core Attributes Breakdown
          </h4>
          {attrs.map((attr) => {
            const v1 = getAttr(p1, attr);
            const v2 = getAttr(p2, attr);
            const isP1Win = v1 > v2;
            const isP2Win = v2 > v1;

            return (
              <div key={attr} className="space-y-1.5">
                <div className="flex justify-between text-xs font-black">
                  <span className={isP1Win ? 'text-emerald-400 font-black' : 'text-slate-300'}>
                    {v1} {isP1Win && '▲'}
                  </span>
                  <span className="text-slate-400 uppercase tracking-wider font-extrabold">
                    {attrLabels[attr]} ({attr})
                  </span>
                  <span className={isP2Win ? 'text-emerald-400 font-black' : 'text-slate-300'}>
                    {isP2Win && '▲'} {v2}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-slate-800 h-2.5 rounded-full overflow-hidden flex justify-end">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isP1Win ? 'bg-emerald-400' : 'bg-yellow-500'
                      }`}
                      style={{ width: `${(v1 / 99) * 100}%` }}
                    />
                  </div>
                  <div className="flex-1 bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isP2Win ? 'bg-emerald-400' : 'bg-yellow-500'
                      }`}
                      style={{ width: `${(v2 / 99) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed Stats Comparison */}
        <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-950/70 p-4 rounded-xl space-y-1.5 border border-slate-800">
            <h5 className="font-black text-yellow-400 uppercase tracking-wider mb-2">
              Match Career Record
            </h5>
            <p className="flex justify-between">
              <span className="text-slate-400">Matches:</span> <span className="font-bold">{s1.matches}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-slate-400">Runs (Avg):</span>{' '}
              <span className="font-bold">
                {s1.runs} ({s1.bat_avg})
              </span>
            </p>
            <p className="flex justify-between">
              <span className="text-slate-400">Strike Rate:</span>{' '}
              <span className="font-bold text-emerald-400">{s1.bat_sr}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-slate-400">50s / 100s:</span>{' '}
              <span className="font-bold">
                {s1.fifties} / {s1.hundreds}
              </span>
            </p>
            <p className="flex justify-between">
              <span className="text-slate-400">Wickets:</span>{' '}
              <span className="font-bold">{s1.wickets}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-slate-400">Economy:</span>{' '}
              <span className="font-bold text-cyan-400">{s1.econ}</span>
            </p>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-xl space-y-1.5 border border-slate-800">
            <h5 className="font-black text-yellow-400 uppercase tracking-wider mb-2">
              Match Career Record
            </h5>
            <p className="flex justify-between">
              <span className="text-slate-400">Matches:</span> <span className="font-bold">{s2.matches}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-slate-400">Runs (Avg):</span>{' '}
              <span className="font-bold">
                {s2.runs} ({s2.bat_avg})
              </span>
            </p>
            <p className="flex justify-between">
              <span className="text-slate-400">Strike Rate:</span>{' '}
              <span className="font-bold text-emerald-400">{s2.bat_sr}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-slate-400">50s / 100s:</span>{' '}
              <span className="font-bold">
                {s2.fifties} / {s2.hundreds}
              </span>
            </p>
            <p className="flex justify-between">
              <span className="text-slate-400">Wickets:</span>{' '}
              <span className="font-bold">{s2.wickets}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-slate-400">Economy:</span>{' '}
              <span className="font-bold text-cyan-400">{s2.econ}</span>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={onClose}
            className="px-8 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black uppercase tracking-wider rounded-xl transition-all shadow-lg text-xs"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
}
