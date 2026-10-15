'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import FutCard from '../../components/FutCard';
import DraftEngine from '../../components/DraftEngine';
import MatchSimulator from '../../components/MatchSimulator';
import PlayerCompare from '../../components/PlayerCompare';
import DailyChallenge from '../../components/DailyChallenge';
import Achievements from '../../components/Achievements';
import { WcHeroPlayer, DraftData } from '../../lib/types';
import heroesData from '../../lib/data/wc_heroes.json';
import { isLoggedIn } from '../../lib/auth';
import { useRouter } from 'next/navigation';

const YEARS = [1975, 1979, 1983, 1987, 1992, 1996, 1999, 2003, 2007, 2011, 2015, 2019, 2023];

const COUNTRIES = [
  'All',
  'Australia',
  'India',
  'West Indies',
  'Pakistan',
  'England',
  'Sri Lanka',
  'South Africa',
  'New Zealand',
  'Bangladesh',
  'Zimbabwe',
  'Kenya',
  'Ireland',
  'Netherlands',
  'Afghanistan',
  'Scotland',
  'Canada',
  'United Arab Emirates',
  'Bermuda',
  'Namibia',
  'East Africa',
];

const ROLES = ['All', 'Batter', 'Fast Bowler', 'Spin Bowler', 'All-Rounder', 'Wicketkeeper-Batter'];
const TIERS = ['All', 'WC Icon', 'Team of Tournament', 'Gold Rare', 'Silver', 'Bronze'];

export default function Draft11Page() {
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace('/');
    }
  }, [router]);

  const [activeTab, setActiveTab] = useState<'game' | 'cards' | 'daily' | 'achievements'>('game');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [selectedRole, setSelectedRole] = useState('All');
  const [selectedTier, setSelectedTier] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('OVR');

  // Game Engine State
  const [draftData, setDraftData] = useState<DraftData | null>(null);
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>(['First Draft']);

  // Modal & Compare State
  const [selectedPlayer, setSelectedPlayer] = useState<WcHeroPlayer | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareSlots, setCompareSlots] = useState<[WcHeroPlayer | null, WcHeroPlayer | null]>([null, null]);

  const allHeroes = heroesData as unknown as WcHeroPlayer[];

  // Filtered & Sorted Players
  const filteredPlayers = useMemo(() => {
    return allHeroes
      .filter((p) => {
        if (selectedYear && p.year !== parseInt(selectedYear) && String(p.year) !== selectedYear) return false;
        if (selectedCountry !== 'All' && p.country !== selectedCountry) return false;
        if (selectedRole !== 'All' && !p.role.includes(selectedRole)) return false;
        if (selectedTier !== 'All' && p.tier !== selectedTier) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchCountry = p.country.toLowerCase().includes(q);
          const matchNotes = p.notes ? p.notes.toLowerCase().includes(q) : false;
          if (!matchName && !matchCountry && !matchNotes) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'OVR') return b.OVR - a.OVR;
        if (sortBy === 'runs') return (b.stats?.runs || 0) - (a.stats?.runs || 0);
        if (sortBy === 'wickets') return (b.stats?.wickets || 0) - (a.stats?.wickets || 0);
        return 0;
      });
  }, [allHeroes, selectedYear, selectedCountry, selectedRole, selectedTier, searchQuery, sortBy]);

  const handleCardClick = (player: WcHeroPlayer) => {
    if (compareMode) {
      if (!compareSlots[0]) {
        setCompareSlots([player, null]);
      } else if (!compareSlots[1] && compareSlots[0].id !== player.id) {
        setCompareSlots([compareSlots[0], player]);
      } else {
        setCompareSlots([player, null]);
      }
    } else {
      setSelectedPlayer(player);
    }
  };

  const handleUnlockBadge = (badgeId: string) => {
    if (!unlockedBadges.includes(badgeId)) {
      setUnlockedBadges((prev) => [...prev, badgeId]);
    }
  };

  return (
    <div className="min-h-screen bg-[#040812] text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-[#0d1527] to-[#162035] border border-amber-500/30 p-6 md:p-8 mb-8 shadow-2xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-yellow-500 to-amber-300 p-0.5 shadow-lg shadow-yellow-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-3xl">🎲</span>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-yellow-400 tracking-widest block">
                  Interactive Draft Engine & FUT Cards
                </span>
                <h1 className="text-2xl md:text-3xl font-black uppercase text-white tracking-tight flex items-center gap-2 mt-0.5">
                  Making That Final 11 <span className="text-yellow-400">with Random Dice</span>
                </h1>
                <p className="text-xs text-slate-400 font-medium mt-1">
                  Roll random player packs • Place into your starting XI • Play World Cup tournaments • Compare Ultimate cards
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setCompareMode(!compareMode);
                  setCompareSlots([null, null]);
                }}
                className={`px-4 py-2 border rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  compareMode
                    ? 'bg-yellow-400 text-slate-950 border-yellow-400 shadow-lg shadow-yellow-400/20'
                    : 'bg-slate-900 hover:bg-slate-800 text-yellow-400 border-yellow-500/30'
                }`}
              >
                {compareMode ? '⚡ Comparing Active' : '⚖️ Compare Mode'}
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 mb-6 gap-6 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('game')}
            className={`pb-3 text-xs md:text-sm font-black uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'game'
                ? 'border-yellow-400 text-yellow-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            🎲 11–0 Dice Draft & Simulator
          </button>
          <button
            onClick={() => setActiveTab('cards')}
            className={`pb-3 text-xs md:text-sm font-black uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'cards'
                ? 'border-yellow-400 text-yellow-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            🎴 Ultimate Cards ({filteredPlayers.length})
          </button>
          <button
            onClick={() => setActiveTab('daily')}
            className={`pb-3 text-xs md:text-sm font-black uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'daily'
                ? 'border-yellow-400 text-yellow-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            🗓️ M Daily Draft
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`pb-3 text-xs md:text-sm font-black uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'achievements'
                ? 'border-yellow-400 text-yellow-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            🎖️ Trophies ({unlockedBadges.length})
          </button>
        </div>

        {/* Tab 1: 11-0 World Cup Draft & Simulator */}
        {activeTab === 'game' && (
          <div>
            {!draftData ? (
              <DraftEngine
                allPlayers={allHeroes}
                onCompleteDraft={(data) => {
                  setDraftData(data);
                  handleUnlockBadge('First Draft');
                  if (data.squadOvr >= 90) handleUnlockBadge('90+ Squad Rating');
                  if (data.squadOvr < 80) handleUnlockBadge('Underdog Triumph');
                }}
              />
            ) : (
              <MatchSimulator
                draftData={draftData}
                onResetDraft={() => setDraftData(null)}
                onUnlockAchievement={handleUnlockBadge}
              />
            )}
          </div>
        )}

        {/* Tab 2: FUT Cards & Explorer */}
        {activeTab === 'cards' && (
          <div>
            {/* Filters */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl mb-8 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Search Player, Country or Feat
                  </label>
                  <input
                    type="text"
                    placeholder="Search Sachin, Richards, Kapil, Starc..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-medium text-white focus:outline-none focus:border-yellow-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                    World Cup Edition
                  </label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-yellow-500"
                  >
                    <option value="">All Editions (1975–2023)</option>
                    {YEARS.map((y) => (
                      <option key={y} value={y}>
                        {y} World Cup
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Country
                  </label>
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-yellow-500"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Role
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-yellow-500"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Card Tier
                  </label>
                  <select
                    value={selectedTier}
                    onChange={(e) => setSelectedTier(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-yellow-500"
                  >
                    {TIERS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {compareMode && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-2xl mb-6 flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="text-xs text-yellow-400 font-bold">
                  {compareSlots[0] && compareSlots[1]
                    ? `Ready to compare: ${compareSlots[0].name} vs ${compareSlots[1].name}`
                    : compareSlots[0]
                    ? `Selected #1: ${compareSlots[0].name} — Now click a second player card`
                    : 'Click any two player cards below to compare them side-by-side!'}
                </div>
                {compareSlots[0] && compareSlots[1] && (
                  <button
                    onClick={() => {}}
                    className="px-4 py-1.5 bg-yellow-400 text-slate-950 font-black uppercase text-xs rounded-xl shadow"
                  >
                    Viewing Comparison Below ⬇
                  </button>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 justify-items-center">
              {filteredPlayers.map((player) => (
                <FutCard
                  key={player.id}
                  player={player}
                  onClick={handleCardClick}
                  isSelected={
                    (compareSlots[0]?.id === player.id || compareSlots[1]?.id === player.id) ||
                    selectedPlayer?.id === player.id
                  }
                  showCompareBtn={compareMode}
                  onCompare={(p) => {
                    if (!compareSlots[0]) setCompareSlots([p, null]);
                    else if (!compareSlots[1]) setCompareSlots([compareSlots[0], p]);
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Daily Challenge */}
        {activeTab === 'daily' && (
          <DailyChallenge
            players={allHeroes}
            onStartSimulation={(data) => {
              setDraftData(data);
              setActiveTab('game');
            }}
          />
        )}

        {/* Tab 4: Achievements */}
        {activeTab === 'achievements' && <Achievements unlockedBadges={unlockedBadges} />}

        {/* Compare Modal */}
        {compareSlots[0] && compareSlots[1] && (
          <PlayerCompare
            p1={compareSlots[0]}
            p2={compareSlots[1]}
            onClose={() => setCompareSlots([null, null])}
          />
        )}
      </main>
    </div>
  );
}
