'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getPlayer, getSimilarPlayers } from '../../../lib/api';
import { Player, SimilarPlayer } from '../../../lib/types';
import { getPlayerPhoto, getCountryFlag } from '../../../lib/playerPhotos';
import ScoreBar from '../../../components/ScoreBar';
import PlayerCard from '../../../components/PlayerCard';
import LoadingSpinner from '../../../components/LoadingSpinner';
import Link from 'next/link';

export default function PlayerProfilePage() {
  const params = useParams();
  const id = params?.id as string;
  const [player, setPlayer] = useState<Player | null>(null);
  const [similar, setSimilar] = useState<SimilarPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFormat, setActiveFormat] = useState<'t20i' | 'odi'>('t20i');

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      const p = await getPlayer(id);
      if (p) {
        setPlayer(p);
        const sim = await getSimilarPlayers(p.id, 4);
        setSimilar(sim);
      }
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <LoadingSpinner message="Loading player profile & analytics..." />;
  if (!player) return (
    <div className="text-center py-24">
      <div className="text-6xl mb-4">🏏</div>
      <p className="text-red-400 font-semibold mb-4">Player not found</p>
      <Link href="/" className="text-emerald-400 underline text-sm">← Back to dashboard</Link>
    </div>
  );

  const stats = activeFormat === 't20i' ? player.t20i : player.odi;
  const isBowler = player.role.toLowerCase().includes('bowler');
  const isAllRounder = player.role.toLowerCase().includes('all-rounder');
  const photo = getPlayerPhoto(player.id, player.name, player.country);
  const flag = getCountryFlag(player.country);

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-10">

      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white transition-colors mb-6"
      >
        ← Back to Analytics Dashboard
      </Link>

      {/* ── HERO PROFILE CARD ── */}
      <div
        className="rounded-3xl overflow-hidden mb-8 border border-[#173d4a] shadow-2xl"
        style={{ background: 'linear-gradient(160deg, #0d2833 0%, #07171e 100%)' }}
      >
        {/* Top cyan strip */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#00f2fe] via-[#22c55e] to-[#facc15]" />

        <div className="p-8 md:p-12 relative flex flex-col md:flex-row items-center md:items-start gap-8">
          {/* Player Photo */}
          <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-3xl overflow-hidden bg-black/60 border-2 border-cyan-400/40 shadow-2xl flex-shrink-0">
            <img
              src={photo}
              alt={player.name}
              className="w-full h-full object-cover object-top"
            />
            <span className="absolute bottom-2 right-2 text-2xl filter drop-shadow">
              {flag}
            </span>
          </div>

          <div className="flex-1 min-w-0 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-3">
              <span className="text-xs font-black uppercase px-3 py-1 rounded-full bg-[#135760] text-cyan-300 border border-cyan-500/30">
                {player.role}
              </span>
              <span className="text-xs font-bold text-gray-300">
                {flag} {player.country} {player.ipl_team ? `• ${player.ipl_team}` : ''}
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-2">
              {player.name}
            </h1>

            <p className="text-sm text-gray-400">
              {player.batting_style} {player.bowling_style ? `| ${player.bowling_style}` : ''}
            </p>
          </div>

          {/* Overall Rating Box */}
          <div className="rounded-2xl p-5 text-center flex-shrink-0 bg-black/40 border border-white/10 min-w-[140px]">
            <div className="text-[11px] text-emerald-400 font-extrabold uppercase tracking-widest mb-1">
              Overall Rating
            </div>
            <div className="text-4xl font-black text-yellow-400">
              {player.overall_score.toFixed(0)}
            </div>
            <div className="text-[10px] text-gray-500 font-mono mt-1">/ 100 INDEX</div>
          </div>
        </div>

        {/* ── STATS SECTION ── */}
        <div className="border-t border-[#13323e] bg-[#06141a] p-6 md:p-10">
          {/* Format selector */}
          <div className="flex gap-2 mb-8 border-b border-[#14323e] pb-4">
            {['t20i', 'odi'].map(f => (
              <button
                key={f}
                onClick={() => setActiveFormat(f as 't20i' | 'odi')}
                className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all ${
                  activeFormat === f
                    ? 'bg-[#0d5c63] text-[#00f2fe] border border-[#14919b]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {f} Statistics
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Batting Column */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-4 flex items-center gap-1.5">
                <span>🏏</span> Batting Metrics
              </h3>
              <div className="grid grid-cols-2 gap-3 font-mono">
                {[
                  { label: 'Matches', val: stats?.matches },
                  { label: 'Runs', val: stats?.runs },
                  { label: 'Batting Avg', val: stats?.avg?.toFixed(2), highlight: '#22c55e' },
                  { label: 'Strike Rate', val: stats?.sr?.toFixed(2), highlight: '#facc15' },
                  { label: 'Fifties / 100s', val: `${stats?.fifties} / ${stats?.hundreds}` },
                  { label: 'Boundary %', val: `${stats?.boundary_pct || 50}%`, highlight: '#38bdf8' },
                ].map(s => (
                  <div key={s.label} className="bg-black/40 border border-white/5 p-3 rounded-xl">
                    <div className="text-[10px] text-gray-500">{s.label}</div>
                    <div className="text-base font-bold" style={{ color: s.highlight || '#ffffff' }}>
                      {s.val ?? '—'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bowling Column */}
            {(isBowler || isAllRounder) && (
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-cyan-400 mb-4 flex items-center gap-1.5">
                  <span>🎳</span> Bowling Metrics
                </h3>
                <div className="grid grid-cols-2 gap-3 font-mono">
                  {[
                    { label: 'Wickets', val: activeFormat === 't20i' ? player.bowling?.wickets_t20i : player.bowling?.wickets_odi },
                    {
                      label: 'Economy Rate',
                      val: activeFormat === 't20i' ? player.bowling?.t20i_economy?.toFixed(2) : player.bowling?.odi_economy?.toFixed(2),
                      highlight: '#22c55e',
                    },
                  ].map(s => (
                    <div key={s.label} className="bg-black/40 border border-white/5 p-3 rounded-xl">
                      <div className="text-[10px] text-gray-500">{s.label}</div>
                      <div className="text-base font-bold" style={{ color: s.highlight || '#ffffff' }}>
                        {s.val ?? '—'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Phase Breakdown */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-yellow-400 mb-4 flex items-center gap-1.5">
                <span>⚡</span> Phase & Form Analysis
              </h3>
              <div className="space-y-4">
                <ScoreBar label="Powerplay SR" value={player.power_play_sr || 135} max={200} color="#22c55e" />
                <ScoreBar label="Middle Overs SR" value={player.middle_overs_sr || 140} max={200} color="#38bdf8" />
                <ScoreBar label="Death Overs SR" value={player.death_over_sr || 185} max={250} color="#f59e0b" />
                <ScoreBar label="Recent Form Index" value={player.recent_form || 90} color="#a855f7" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── SIMILAR BENCHMARK PLAYERS ── */}
      {similar.length > 0 && (
        <div className="mt-12">
          <div className="flex items-center gap-3 mb-6">
            <h3 className="text-xl font-black text-white">
              Players Stylistically Similar to <span className="text-[#00f2fe]">{player.name}</span>
            </h3>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {similar.map(sp => (
              <PlayerCard
                key={sp.player.id}
                player={sp.player}
                format={activeFormat}
                similarity_score={Math.round(sp.similarity_score * 100)}
                compact
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
