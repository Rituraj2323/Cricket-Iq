'use client';

import React, { useState } from 'react';
import { WcHeroPlayer, DraftData } from '../lib/types';

interface DailyChallengeProps {
  players: WcHeroPlayer[];
  onStartSimulation: (data: DraftData) => void;
}

export default function DailyChallenge({ players, onStartSimulation }: DailyChallengeProps) {
  const [budget] = useState(100);
  const [selectedPlayers, setSelectedPlayers] = useState<WcHeroPlayer[]>([]);

  const getPlayerCost = (ovr: number) => Math.max(4, Math.round((ovr - 50) * 0.45));

  const totalSpent = selectedPlayers.reduce((acc, p) => acc + getPlayerCost(p.OVR), 0);
  const remainingBudget = budget - totalSpent;

  const toggleSelectPlayer = (player: WcHeroPlayer) => {
    const isAlreadySelected = selectedPlayers.some((p) => p.id === player.id);
    if (isAlreadySelected) {
      setSelectedPlayers(selectedPlayers.filter((p) => p.id !== player.id));
    } else {
      const cost = getPlayerCost(player.OVR);
      if (cost <= remainingBudget && selectedPlayers.length < 11) {
        setSelectedPlayers([...selectedPlayers, player]);
      }
    }
  };

  const isComplete = selectedPlayers.length === 11;
  const teamOvr =
    selectedPlayers.length > 0
      ? Math.round(selectedPlayers.reduce((acc, p) => acc + p.OVR, 0) / selectedPlayers.length)
      : 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 text-slate-100">
      <div className="flex flex-col md:flex-row justify-between items-center pb-4 border-b border-slate-800 gap-4">
        <div>
          <span className="text-[10px] font-black uppercase text-yellow-400 tracking-widest block">
            🗓️ Today's Tactical World Cup Challenge
          </span>
          <h2 className="text-2xl font-black uppercase text-white tracking-tight mt-1">
            M Budget Cap Final 11
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Draft an 11-player squad under the M salary budget to achieve the 11–0 undefeated run!
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-500 uppercase font-extrabold block">
              Budget Remaining
            </span>
            <span
              className={`text-xl font-black ${
                remainingBudget < 10 ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              ${remainingBudget}M
            </span>
          </div>

          <div className="bg-yellow-500/10 px-4 py-2 rounded-2xl border border-yellow-500/30 text-center">
            <span className="text-[10px] text-yellow-400 uppercase font-extrabold block">
              Squad ({selectedPlayers.length}/11)
            </span>
            <span className="text-2xl font-black text-yellow-400">{teamOvr} OVR</span>
          </div>
        </div>
      </div>

      {isComplete && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl flex justify-between items-center">
          <p className="text-xs text-emerald-400 font-bold">
            ✅ Budget Squad Complete! Total OVR: {teamOvr} • Budget Spent: ${totalSpent}M
          </p>
          <button
            onClick={() =>
              onStartSimulation({
                squad: selectedPlayers,
                squadOvr: teamOvr,
                captain: selectedPlayers[0],
                tactic: {
                  id: 'balanced',
                  name: 'Balanced Champions',
                  desc: 'Standard synergy boost',
                  boost: { BAT: 3, BOW: 3, CTL: 3, IMP: 3 },
                },
              })
            }
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black uppercase rounded-xl transition-all shadow-lg"
          >
            🚀 Launch 11–0 Campaign
          </button>
        </div>
      )}

      {/* Available Players Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[500px] overflow-y-auto pr-1">
        {players.map((p) => {
          const cost = getPlayerCost(p.OVR);
          const isSelected = selectedPlayers.some((sp) => sp.id === p.id);
          const canAfford = cost <= remainingBudget;

          return (
            <div
              key={p.id}
              onClick={() => toggleSelectPlayer(p)}
              className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                isSelected
                  ? 'bg-yellow-400/20 border-yellow-400 ring-2 ring-yellow-400/30'
                  : canAfford
                  ? 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                  : 'bg-slate-950/30 border-slate-900 opacity-40 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl font-black text-yellow-400">{p.OVR}</span>
                <div>
                  <p className="font-extrabold text-xs text-white">{p.name}</p>
                  <p className="text-[10px] text-slate-400">
                    {p.country} ({p.year})
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-emerald-400">${cost}M</span>
                {isSelected && (
                  <span className="block text-[9px] text-yellow-400 font-bold uppercase">
                    Picked
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
