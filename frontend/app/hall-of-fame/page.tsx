'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import EAFCCard from '../../components/EAFCCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Player, TournamentRecord } from '../../lib/types';
import { getAllPlayers, getTournaments } from '../../lib/api';

export default function WorldCupHallOfFamePage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [tournaments, setTournaments] = useState<TournamentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTournamentType, setSelectedTournamentType] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('ALL');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [pData, tData] = await Promise.all([
          getAllPlayers(),
          getTournaments(),
        ]);
        setPlayers(pData);
        setTournaments(tData);
      } catch (err) {
        console.error('Error loading Hall of Fame data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredTournaments = tournaments.filter((t) => {
    if (selectedTournamentType === 'all') return true;
    return t.Tournament.toLowerCase().includes(selectedTournamentType.toLowerCase());
  });

  const filteredPlayers = players.filter((p) => {
    if (tierFilter === 'ALL') return true;
    return p.card_tier?.toUpperCase() === tierFilter.toUpperCase();
  }).sort((a, b) => (b.ovr || 85) - (a.ovr || 85));

  const icons = players.filter((p) => p.card_tier === 'ICON');
  const heroes = players.filter((p) => p.card_tier === 'HERO');
  const totw = players.filter((p) => p.card_tier === 'TOTW');

  return (
    <div className="min-h-screen bg-[#070b12] text-gray-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        {/* Header Showcase Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0f172a] via-[#1e1b4b] to-[#172554] border border-indigo-500/30 p-8 mb-10 shadow-2xl">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">
                🏆 ICC WORLD CUP (1975–2025) & EA FC CRICKET 24
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
                World Cup Hall of Fame & EA FC Ratings
              </h1>
              <p className="text-gray-300 text-sm md:text-base mt-2 max-w-2xl leading-relaxed">
                Explore 50 years of ICC World Cup history alongside authentic EA FC Ultimate Team player ratings, 6-stat attribute radars, and World Cup Icon editions.
              </p>
            </div>

            {/* Quick Stats Banner */}
            <div className="flex items-center gap-4 bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/10 shrink-0">
              <div className="text-center px-3 border-r border-white/10">
                <div className="text-2xl font-black text-amber-400">31</div>
                <div className="text-[11px] uppercase font-bold text-gray-400">World Cups</div>
              </div>
              <div className="text-center px-3 border-r border-white/10">
                <div className="text-2xl font-black text-indigo-400">{icons.length}</div>
                <div className="text-[11px] uppercase font-bold text-gray-400">FUT Icons</div>
              </div>
              <div className="text-center px-3">
                <div className="text-2xl font-black text-emerald-400">{players.length}</div>
                <div className="text-[11px] uppercase font-bold text-gray-400">Rated Stars</div>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            {/* Section 1: EA FC 24 Ultimate Team Showcase */}
            <div className="mb-14">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-black text-white flex items-center gap-2">
                    <span>🎴</span> EA FC 24 Ultimate Team Cards
                  </h2>
                  <p className="text-gray-400 text-xs mt-1">
                    Authentic 6-stat attribute ratings: <strong>BAT</strong>, <strong>PWR</strong>, <strong>BWL</strong>, <strong>CLU</strong>, <strong>FLD</strong>, <strong>PHY</strong>
                  </p>
                </div>

                {/* Tier Filter Chips */}
                <div className="flex items-center gap-2 bg-[#0d1522] p-1.5 rounded-2xl border border-gray-800 self-start md:self-auto overflow-x-auto">
                  {['ALL', 'ICON', 'HERO', 'TOTW', 'GOLD_RARE'].map((tier) => (
                    <button
                      key={tier}
                      onClick={() => setTierFilter(tier)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                        tierFilter === tier
                          ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {tier === 'ALL' ? 'All Cards' : tier === 'GOLD_RARE' ? 'Gold Rare' : tier}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {filteredPlayers.slice(0, 20).map((player) => (
                  <div key={player.id} className="flex justify-center">
                    <EAFCCard
                      player={player}
                      size="md"
                      onClick={() => setSelectedPlayer(player)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Section 2: ICC World Cup History & Finals (1975–2025) */}
            <div className="mb-14 bg-[#0a101d] rounded-3xl border border-gray-800 p-6 md:p-8 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-black text-white flex items-center gap-2">
                    <span>🏆</span> ICC World Cup Tournament History (1975–2025)
                  </h2>
                  <p className="text-gray-400 text-xs mt-1">
                    Complete records of Finals, Match-Winners, and Tournament MVPs from your historical archive
                  </p>
                </div>

                {/* Tournament Type Selector */}
                <div className="flex items-center gap-2 bg-[#121c2d] p-1 rounded-xl border border-gray-700 text-xs font-bold">
                  {[
                    { key: 'all', label: 'All Cups' },
                    { key: 'ODI', label: 'ODI World Cup' },
                    { key: 'T20', label: 'T20 World Cup' },
                    { key: 'Champions', label: 'Champions Trophy' },
                  ].map((t) => (
                    <button
                      key={t.key}
                      onClick={() => setSelectedTournamentType(t.key)}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        selectedTournamentType === t.key
                          ? 'bg-emerald-500 text-black'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tournaments Table */}
              <div className="overflow-x-auto rounded-2xl border border-gray-800">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#121b2a] text-gray-400 uppercase font-black tracking-wider border-b border-gray-800">
                      <th className="py-3 px-4">Year</th>
                      <th className="py-3 px-4">Tournament</th>
                      <th className="py-3 px-4">Host Venue</th>
                      <th className="py-3 px-4">🏆 Champions</th>
                      <th className="py-3 px-4">🥈 Runner-Up</th>
                      <th className="py-3 px-4">⭐ Final Match-Winner</th>
                      <th className="py-3 px-4">🎖️ Player of the Tournament</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60 font-medium">
                    {filteredTournaments.map((t, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-white/[0.03] transition-colors"
                      >
                        <td className="py-3 px-4 font-black text-amber-400">{t.Year}</td>
                        <td className="py-3 px-4 font-bold text-white">{t.Tournament}</td>
                        <td className="py-3 px-4 text-gray-400">{t.Venue}</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/30">
                            🏆 {t.Winner}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-300">{t['Runner-up'] || t.Runner_up || '-'}</td>
                        <td className="py-3 px-4 font-bold text-amber-300">
                          {t.Match_Winner_Final || '-'}
                        </td>
                        <td className="py-3 px-4 font-bold text-indigo-300">
                          {t.Player_of_Tournament || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
