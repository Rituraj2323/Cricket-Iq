'use client';

import { useState, useEffect, useRef } from 'react';
import { searchPlayers, getSimilarPlayers } from '../../lib/api';
import { Player, SimilarPlayer } from '../../lib/types';
import { getPlayerPhoto, getCountryFlag } from '../../lib/playerPhotos';
import PlayerCard from '../../components/PlayerCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import ScoreBar from '../../components/ScoreBar';

export default function SimilarPlayersPage() {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [similarPlayers, setSimilarPlayers] = useState<SimilarPlayer[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length > 1) {
        const results = await searchPlayers(query);
        setSearchResults(results);
        setShowDropdown(results.length > 0);
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = async (player: Player) => {
    setSelectedPlayer(player);
    setQuery('');
    setShowDropdown(false);
    setLoading(true);
    const results = await getSimilarPlayers(player.id, 6);
    setSimilarPlayers(results);
    setLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <p className="text-xs text-[#00f2fe] font-black uppercase tracking-widest mb-2">Statistical DNA Matching</p>
        <h1 className="text-4xl font-black text-white mb-3">Player Similarity & Lookalike Engine</h1>
        <p className="text-gray-400 max-w-md mx-auto text-sm">
          Discover who plays most like your selected cricketer using multidimensional cosine similarity across 14+ statistical metrics.
        </p>
      </div>

      {/* Search */}
      <div className="max-w-xl mx-auto mb-16" ref={dropdownRef}>
        <div className="relative">
          <div
            className="flex items-center gap-3 rounded-2xl px-5 py-4 transition-all"
            style={{
              background: '#0d1826',
              border: '1px solid rgba(20, 145, 155, 0.4)',
            }}
          >
            <span className="text-[#00f2fe] text-lg">🔍</span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search player name — e.g. Virat Kohli, Travis Head, Bumrah..."
              className="flex-1 bg-transparent text-white text-sm placeholder-gray-500 border-none outline-none font-semibold"
            />
            {query && (
              <button
                onClick={() => { setQuery(''); setShowDropdown(false); }}
                className="text-gray-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Dropdown with Photos */}
          {showDropdown && searchResults.length > 0 && (
            <div
              className="absolute top-full left-0 right-0 mt-2 rounded-2xl overflow-hidden shadow-2xl z-30 max-h-96 overflow-y-auto"
              style={{ background: '#091522', border: '1px solid rgba(0, 242, 254, 0.3)' }}
            >
              {searchResults.map((p, i) => {
                const photo = getPlayerPhoto(p.id, p.name, p.country);
                const flag = getCountryFlag(p.country);
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelect(p)}
                    className="w-full px-5 py-3 flex items-center justify-between text-left transition-colors hover:bg-[#10273b] border-b border-white/5 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <img src={photo} alt={p.name} className="w-8 h-8 rounded-full object-cover bg-black/50 border border-cyan-500/30" />
                      <div>
                        <p className="text-sm font-bold text-white">{p.name}</p>
                        <p className="text-xs text-gray-400">{flag} {p.country}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-[#134352] text-cyan-300">
                      {p.role}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {!selectedPlayer && (
          <p className="text-center text-xs text-gray-500 mt-3">
            Popular: Virat Kohli · Travis Head · Jasprit Bumrah · Heinrich Klaasen · Rashid Khan
          </p>
        )}
      </div>

      {/* Selected reference player feature card */}
      {selectedPlayer && (
        <div className="mb-12">
          <p className="text-xs text-emerald-400 font-extrabold uppercase tracking-widest mb-3 text-center">
            Reference Benchmark Player
          </p>
          <div
            className="max-w-2xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-[#145763]"
            style={{
              background: 'linear-gradient(135deg, #0d343c 0%, #081d22 100%)',
            }}
          >
            <div className="p-6 flex flex-col sm:flex-row items-center gap-6">
              {/* Photo */}
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-black/50 border-2 border-emerald-400/40 flex-shrink-0 shadow-lg">
                <img
                  src={getPlayerPhoto(selectedPlayer.id, selectedPlayer.name, selectedPlayer.country)}
                  alt={selectedPlayer.name}
                  className="w-full h-full object-cover object-top"
                />
              </div>

              <div className="flex-1 min-w-0 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                  <span className="text-xs font-black uppercase px-2.5 py-0.5 rounded-full bg-[#135760] text-cyan-300">
                    {selectedPlayer.role}
                  </span>
                  <span className="text-xs text-gray-300">{getCountryFlag(selectedPlayer.country)} {selectedPlayer.country}</span>
                </div>
                <h2 className="text-2xl font-black text-white">{selectedPlayer.name}</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {selectedPlayer.batting_style} {selectedPlayer.bowling_style ? `· ${selectedPlayer.bowling_style}` : ''}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center flex-shrink-0 bg-black/40 p-3.5 rounded-2xl border border-white/5 font-mono">
                <div>
                  <div className="text-lg font-black text-white">{selectedPlayer.t20i?.avg?.toFixed(1) || '—'}</div>
                  <div className="text-[10px] text-gray-400">T20I AVG</div>
                </div>
                <div>
                  <div className="text-lg font-black text-yellow-400">{selectedPlayer.t20i?.sr?.toFixed(0) || '—'}</div>
                  <div className="text-[10px] text-gray-400">T20I SR</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Similar players grid */}
      {loading ? (
        <LoadingSpinner message={`Running DNA similarity on ${selectedPlayer?.name}...`} />
      ) : selectedPlayer && similarPlayers.length > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-8 pb-3 border-b border-[#1b3447]">
            <div>
              <p className="text-xs text-emerald-400 font-extrabold uppercase tracking-widest">Cosine Similarity Engine</p>
              <h2 className="text-2xl font-black text-white">
                Players Similar to <span className="text-[#00f2fe]">{selectedPlayer.name}</span>
              </h2>
            </div>
            <div className="text-xs font-bold text-gray-400">
              Top {similarPlayers.length} matches
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {similarPlayers.map((sp, idx) => (
              <div key={sp.player.id} className="relative flex flex-col">
                <PlayerCard
                  player={sp.player}
                  similarity_score={Math.round(sp.similarity_score * 100)}
                  explanation={sp.explanation}
                  rank={idx + 1}
                />
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
