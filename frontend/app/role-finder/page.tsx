'use client';

import { useState } from 'react';
import { getTopByRole } from '../../lib/api';
import { RolePlayer } from '../../lib/types';
import PlayerCard from '../../components/PlayerCard';
import LoadingSpinner from '../../components/LoadingSpinner';

const ROLES = [
  { id: 'opener', label: 'Opener', icon: '🏏', desc: 'Sets the foundation', color: '#22c55e' },
  { id: 'anchor', label: 'Anchor', icon: '⚓', desc: 'Steadies the innings', color: '#3b82f6' },
  { id: 'power_hitter', label: 'Power Hitter', icon: '💥', desc: 'Maximum impact', color: '#f59e0b' },
  { id: 'finisher', label: 'Finisher', icon: '🎯', desc: 'Wins last-over battles', color: '#8b5cf6' },
  { id: 'death_bowler', label: 'Death Bowler', icon: '🎳', desc: 'Locks down death overs', color: '#ef4444' },
  { id: 'powerplay_bowler', label: 'Powerplay Bowler', icon: '🔥', desc: 'Dominates first 6', color: '#f97316' },
  { id: 'spinner', label: 'Spinner', icon: '🌀', desc: 'Turns & deceives', color: '#06b6d4' },
  { id: 'allrounder', label: 'All-rounder', icon: '⚡', desc: 'Bat + ball impact', color: '#a3e635' },
  { id: 'wicketkeeper', label: 'Wicket-keeper', icon: '🧤', desc: 'Gloves specialist', color: '#f59e0b' },
];

export default function RoleFinderPage() {
  const [format, setFormat] = useState('t20i');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [results, setResults] = useState<RolePlayer[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRoleMeta, setSelectedRoleMeta] = useState<typeof ROLES[0] | null>(null);

  const handleRoleSelect = async (role: typeof ROLES[0]) => {
    setSelectedRole(role.id);
    setSelectedRoleMeta(role);
    setLoading(true);
    const data = await getTopByRole(role.id, format, 8);
    setResults(data);
    setLoading(false);
  };

  const handleFormatChange = async (f: string) => {
    setFormat(f);
    if (selectedRole && selectedRoleMeta) {
      setLoading(true);
      const data = await getTopByRole(selectedRole, f, 8);
      setResults(data);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <p className="text-xs text-yellow-500 font-bold uppercase tracking-widest mb-2">Contextual Search</p>
        <h1 className="text-4xl font-black text-white mb-3">Role Finder</h1>
        <p className="text-gray-500 max-w-md mx-auto">
          Pick a role and a format to instantly rank the best-suited players with detailed AI reasoning.
        </p>
      </div>

      {/* Format Toggle */}
      <div className="flex justify-center mb-10">
        <div
          className="inline-flex p-1 rounded-2xl"
          style={{ background: '#0f1117', border: '1px solid rgba(30,35,51,0.9)' }}
        >
          {['t20i', 'odi'].map(f => (
            <button
              key={f}
              onClick={() => handleFormatChange(f)}
              className="px-8 py-2.5 rounded-xl text-sm font-bold uppercase transition-all"
              style={format === f
                ? { background: '#22c55e', color: '#000' }
                : { color: '#6b7280' }
              }
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Role grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3 mb-16">
        {ROLES.map(role => (
          <button
            key={role.id}
            onClick={() => handleRoleSelect(role)}
            className="relative text-left p-5 rounded-2xl transition-all duration-200 group overflow-hidden"
            style={selectedRole === role.id ? {
              background: `rgba(${hexToRgb(role.color)}, 0.1)`,
              border: `1px solid ${role.color}44`,
              transform: 'translateY(-2px)',
              boxShadow: `0 8px 24px ${role.color}14`,
            } : {
              background: '#0f1117',
              border: '1px solid rgba(30,35,51,0.9)',
            }}
            onMouseEnter={(e) => {
              if (selectedRole !== role.id) {
                e.currentTarget.style.borderColor = `${role.color}33`;
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedRole !== role.id) {
                e.currentTarget.style.borderColor = 'rgba(30,35,51,0.9)';
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            {/* Corner glow on active */}
            {selectedRole === role.id && (
              <div
                className="absolute -top-8 -right-8 w-24 h-24 rounded-full"
                style={{ background: `radial-gradient(circle, ${role.color}20 0%, transparent 70%)` }}
              />
            )}

            <div className="flex items-start gap-3 relative z-10">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 transition-transform group-hover:scale-110"
                style={{
                  background: selectedRole === role.id ? `${role.color}20` : 'rgba(30,35,51,0.6)',
                  border: `1px solid ${selectedRole === role.id ? role.color + '40' : 'rgba(30,35,51,0.9)'}`,
                }}
              >
                {role.icon}
              </div>
              <div>
                <h3
                  className="font-bold text-sm"
                  style={{ color: selectedRole === role.id ? role.color : '#e2e8f0' }}
                >
                  {role.label}
                </h3>
                <p className="text-xs text-gray-600 mt-0.5">{role.desc}</p>
              </div>
            </div>

            {selectedRole === role.id && (
              <div
                className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center text-xs"
                style={{ background: role.color, color: '#000' }}
              >
                ✓
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <LoadingSpinner message={`Finding top ${selectedRoleMeta?.label}s...`} />
      ) : selectedRole && results.length > 0 ? (
        <div>
          <div
            className="rounded-2xl p-5 mb-8 flex items-center gap-4"
            style={{
              background: `rgba(${hexToRgb(selectedRoleMeta?.color || '#22c55e')}, 0.06)`,
              border: `1px solid ${selectedRoleMeta?.color || '#22c55e'}28`,
            }}
          >
            <span className="text-3xl">{selectedRoleMeta?.icon}</span>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: selectedRoleMeta?.color }}>
                Top Picks
              </p>
              <h2 className="text-xl font-black text-white">
                Best {selectedRoleMeta?.label}s in {format.toUpperCase()}
              </h2>
            </div>
            <div className="ml-auto text-sm text-gray-600">
              {results.length} players ranked
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {results.map((rp, idx) => (
              <PlayerCard
                key={rp.player.id}
                player={rp.player}
                format={format as 't20i' | 'odi'}
                explanation={rp.explanation}
                rank={idx + 1}
              />
            ))}
          </div>
        </div>
      ) : selectedRole && !loading ? (
        <div className="text-center py-12 text-gray-600">
          No results found. Try a different format.
        </div>
      ) : null}
    </div>
  );
}

// Helper to convert hex to rgb for rgba()
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '34,197,94';
  return `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}`;
}
