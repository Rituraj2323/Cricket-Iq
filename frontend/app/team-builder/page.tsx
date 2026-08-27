'use client';

import { useState } from 'react';
import { buildTeam } from '../../lib/api';
import { TeamPlayer } from '../../lib/types';
import PlayerCard from '../../components/PlayerCard';
import LoadingSpinner from '../../components/LoadingSpinner';

const PITCH_OPTIONS = [
  { id: 'flat', label: 'Flat', icon: '🏞️', desc: 'Batting paradise' },
  { id: 'spinning', label: 'Spinning', icon: '🌀', desc: 'Spin friendly' },
  { id: 'seaming', label: 'Seaming', icon: '💨', desc: 'Seam movement' },
  { id: 'bouncy', label: 'Bouncy', icon: '⬆️', desc: 'High & quick' },
];

const CONDITIONS_OPTIONS = [
  { id: 'subcontinent', label: 'Subcontinent', flag: '🌏' },
  { id: 'overseas', label: 'Overseas', flag: '✈️' },
  { id: 'all', label: 'Neutral', flag: '⚖️' },
];

export default function TeamBuilderPage() {
  const [format, setFormat] = useState('t20i');
  const [pitchType, setPitchType] = useState('flat');
  const [conditions, setConditions] = useState('all');
  const [loading, setLoading] = useState(false);
  const [team, setTeam] = useState<TeamPlayer[]>([]);
  const [hasBuilt, setHasBuilt] = useState(false);

  const handleBuild = async () => {
    setLoading(true);
    setHasBuilt(true);
    const result = await buildTeam(format, pitchType, conditions);
    setTeam(result);
    setLoading(false);
  };

  const getComposition = () => {
    const counts = { wk: 0, bat: 0, ar: 0, bowl: 0 };
    team.forEach(tp => {
      const r = tp.player.role.toLowerCase();
      if (r.includes('wicket')) counts.wk++;
      else if (r.includes('all-rounder')) counts.ar++;
      else if (r.includes('bowler')) counts.bowl++;
      else counts.bat++;
    });
    return counts;
  };

  const comp = getComposition();

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Page header */}
      <div className="mb-10">
        <p className="text-xs text-green-500 font-bold uppercase tracking-widest mb-2">AI Team Selection</p>
        <h1 className="text-4xl font-black text-white">Team Builder</h1>
        <p className="text-gray-500 mt-2">Select match conditions to generate your ideal playing XI</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">

        {/* ── LEFT: Filters panel ── */}
        <div className="w-full lg:w-80 flex-shrink-0 space-y-6">

          {/* Format */}
          <div
            className="rounded-2xl p-6"
            style={{ background: '#0f1117', border: '1px solid rgba(30,35,51,0.9)' }}
          >
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Format</h3>
            <div className="grid grid-cols-2 gap-2">
              {['t20i', 'odi'].map(f => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className="chip text-center text-sm font-bold uppercase"
                  style={format === f ? {
                    background: 'rgba(34,197,94,0.12)',
                    borderColor: 'rgba(34,197,94,0.45)',
                    color: '#4ade80',
                  } : {}}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Pitch */}
          <div
            className="rounded-2xl p-6"
            style={{ background: '#0f1117', border: '1px solid rgba(30,35,51,0.9)' }}
          >
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Pitch Type</h3>
            <div className="grid grid-cols-2 gap-2">
              {PITCH_OPTIONS.map(p => (
                <button
                  key={p.id}
                  onClick={() => setPitchType(p.id)}
                  className="chip flex flex-col items-center gap-1 py-3"
                  style={pitchType === p.id ? {
                    background: 'rgba(34,197,94,0.12)',
                    borderColor: 'rgba(34,197,94,0.45)',
                    color: '#4ade80',
                  } : {}}
                >
                  <span className="text-xl">{p.icon}</span>
                  <span className="text-xs font-bold">{p.label}</span>
                  <span className="text-[10px] text-gray-600">{p.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Conditions */}
          <div
            className="rounded-2xl p-6"
            style={{ background: '#0f1117', border: '1px solid rgba(30,35,51,0.9)' }}
          >
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Conditions</h3>
            <div className="space-y-2">
              {CONDITIONS_OPTIONS.map(c => (
                <button
                  key={c.id}
                  onClick={() => setConditions(c.id)}
                  className="chip w-full text-left flex items-center gap-3"
                  style={conditions === c.id ? {
                    background: 'rgba(34,197,94,0.12)',
                    borderColor: 'rgba(34,197,94,0.45)',
                    color: '#4ade80',
                  } : {}}
                >
                  <span className="text-lg">{c.flag}</span>
                  <span className="font-semibold text-sm">{c.label}</span>
                  {conditions === c.id && <span className="ml-auto text-green-500 text-xs">✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Build button */}
          <button onClick={handleBuild} disabled={loading} className="btn-primary w-full">
            {loading ? 'Analysing...' : '⚡ Build My XI'}
          </button>
        </div>

        {/* ── RIGHT: Results ── */}
        <div className="flex-1 min-w-0">
          {!hasBuilt ? (
            <div
              className="h-full min-h-[500px] flex flex-col items-center justify-center rounded-2xl"
              style={{
                border: '2px dashed rgba(30,35,51,0.8)',
                background: 'radial-gradient(ellipse at center, rgba(34,197,94,0.02) 0%, transparent 70%)',
              }}
            >
              <div className="text-6xl mb-4 animate-float">🏏</div>
              <p className="text-gray-500 text-center max-w-xs leading-relaxed">
                Configure the match conditions on the left and hit <span className="text-green-400 font-semibold">Build My XI</span>
              </p>
            </div>
          ) : loading ? (
            <LoadingSpinner message="Selecting optimal players..." />
          ) : team.length > 0 ? (
            <div>
              {/* Team header */}
              <div
                className="rounded-2xl p-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.08) 0%, rgba(34,197,94,0.03) 100%)', border: '1px solid rgba(34,197,94,0.2)' }}
              >
                <div>
                  <p className="text-xs text-green-500 font-bold uppercase tracking-widest mb-1">Your Dream XI</p>
                  <h2 className="text-2xl font-black text-white">{format.toUpperCase()} · {pitchType.charAt(0).toUpperCase() + pitchType.slice(1)} Pitch</h2>
                </div>
                <div className="flex gap-3">
                  {[
                    { label: 'WK', val: comp.wk, color: '#f59e0b' },
                    { label: 'BAT', val: comp.bat, color: '#3b82f6' },
                    { label: 'AR', val: comp.ar, color: '#22c55e' },
                    { label: 'BOWL', val: comp.bowl, color: '#ef4444' },
                  ].map(c => (
                    <div key={c.label} className="text-center">
                      <div className="text-lg font-black" style={{ color: c.color }}>{c.val}</div>
                      <div className="text-xs text-gray-600">{c.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Team grid */}
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                {team.map((tp, idx) => (
                  <PlayerCard
                    key={tp.player.id}
                    player={tp.player}
                    format={format as 't20i' | 'odi'}
                    explanation={tp.explanation}
                    rank={idx + 1}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div
              className="text-center p-10 rounded-2xl"
              style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)' }}
            >
              <p className="text-red-400 font-semibold">Could not generate a team with these settings. Try different conditions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
