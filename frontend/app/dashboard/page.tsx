'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAllPlayers, buildTeam } from '../../lib/api';
import { Player, TeamPlayer } from '../../lib/types';
import { getCountryFlag } from '../../lib/playerPhotos';
import PlayerSpotlightModal from '../../components/PlayerSpotlightModal';
import ScatterQuadrantPlot from '../../components/ScatterQuadrantPlot';
import PerformanceTrendChart from '../../components/PerformanceTrendChart';
import Final11PitchView from '../../components/Final11PitchView';
import LoadingSpinner from '../../components/LoadingSpinner';
import Navbar from '../../components/Navbar';
import { isLoggedIn } from '../../lib/auth';

const CATEGORIES = [
  { id: 'power_hitters', label: 'Power Hitters', roleFilter: 'power_hitter', title: 'Power Hitters / Slog Overs' },
  { id: 'anchors', label: 'Anchors', roleFilter: 'anchor', title: 'Anchors / Middle Order' },
  { id: 'finishers', label: 'Finishers', roleFilter: 'finisher', title: 'Finishers / Death Batsmen' },
  { id: 'all_rounders', label: 'All Rounders', roleFilter: 'allrounder', title: 'All-Rounders' },
  { id: 'death_bowlers', label: 'Death Bowlers', roleFilter: 'death_bowler', title: 'Death Over Specialists' },
  { id: 'spinners', label: 'Spinners', roleFilter: 'spinner', title: 'Spin Bowlers' },
  { id: 'all', label: 'All Players', roleFilter: '', title: 'All Players' },
];

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace('/');
    }
  }, [router]);

  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [spotlightOpen, setSpotlightOpen] = useState(false);
  const [teamXI, setTeamXI] = useState<TeamPlayer[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [activeTab, setActiveTab] = useState<'analysis' | 'final11'>('analysis');
  const [category, setCategory] = useState('all');
  const [format, setFormat] = useState<'t20i' | 'odi'>('t20i');
  const [pitchType, setPitchType] = useState('flat');
  const [conditions, setConditions] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function initData() {
      setLoading(true);
      setApiError(false);
      const data = await getAllPlayers('T20I');
      if (data.length === 0) {
        setApiError(true);
      } else {
        setAllPlayers(data);
        const defaultP = data.find((p) => p.id === 'virat_kohli') || data[0];
        setSelectedPlayer(defaultP);
      }
      setLoading(false);
    }
    initData();
  }, []);

  const handlePlayerClick = (player: Player) => {
    setSelectedPlayer(player);
    setSpotlightOpen(true);
  };

  const handleBuildTeam = async () => {
    setLoadingTeam(true);
    const team = await buildTeam(format.toUpperCase(), pitchType, conditions);
    setTeamXI(team);
    setLoadingTeam(false);
  };

  const activeCat = CATEGORIES.find((c) => c.id === category);
  const filteredPlayers = allPlayers.filter((p) => {
    const matchesCat =
      !activeCat?.roleFilter ||
      p.specialties?.includes(activeCat.roleFilter) ||
      p.role?.toLowerCase().includes(activeCat.roleFilter);
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.country.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });
  const displayPlayers = filteredPlayers.slice(0, 30);

  const card = (border = 'rgba(255,255,255,0.07)') => ({
    background: 'rgba(11,19,32,0.9)',
    border: `1px solid ${border}`,
    borderRadius: 20,
    padding: '1.5rem',
  });

  return (
    <div
      style={{
        background: '#0a0f18',
        color: '#f1f5f9',
        fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
        minHeight: '100vh',
      }}
    >
      <Navbar />
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '1.5rem' }}>
        {/* Subheader Navigation */}
        <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem' }}>
          {(['analysis', 'final11'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '10px 24px',
                borderRadius: 12,
                fontWeight: 800,
                fontSize: 14,
                border: `1.5px solid ${activeTab === tab ? '#00f2fe' : 'rgba(255,255,255,0.1)'}`,
                background: activeTab === tab ? 'rgba(0,242,254,0.1)' : 'transparent',
                color: activeTab === tab ? '#00f2fe' : '#64748b',
                cursor: 'pointer',
              }}
            >
              {tab === 'analysis' ? '📊 Player Analysis' : '⚡ Final 11 Pitch View'}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingSpinner message="Loading sports intelligence dashboard..." />
        ) : apiError ? (
          <div style={{ ...card(), textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔌</div>
            <h2 style={{ color: '#f87171', fontWeight: 900, margin: '0 0 8px' }}>Backend Not Reachable</h2>
            <p style={{ color: '#9ca3af' }}>
              Cannot connect to <code style={{ color: '#f7df1e' }}>http://localhost:8000</code>
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: 16,
                background: '#22c55e',
                color: '#000',
                fontWeight: 800,
                padding: '10px 24px',
                borderRadius: 12,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Retry
            </button>
          </div>
        ) : activeTab === 'analysis' ? (
          <>
            {/* Category pills & search bar */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '1rem', alignItems: 'center' }}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 999,
                    fontWeight: 700,
                    fontSize: 13,
                    border: `1.5px solid ${category === cat.id ? '#00f2fe' : 'rgba(255,255,255,0.1)'}`,
                    background: category === cat.id ? 'rgba(0,242,254,0.1)' : 'transparent',
                    color: category === cat.id ? '#00f2fe' : '#64748b',
                    cursor: 'pointer',
                  }}
                >
                  {cat.label}
                </button>
              ))}
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="🔍 Search player..."
                style={{
                  padding: '8px 14px',
                  borderRadius: 999,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#f1f5f9',
                  fontSize: 13,
                  outline: 'none',
                  marginLeft: 'auto',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem', alignItems: 'start' }}>
              {/* Player Table */}
              <div style={card()}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                        {['#', 'Player', 'Country', 'Style', 'Matches', 'Runs / Wkts', 'Avg', 'S/R or Eco', 'Rating'].map(
                          (h) => (
                            <th
                              key={h}
                              style={{
                                padding: '10px 12px',
                                textAlign: 'left',
                                fontSize: 11,
                                fontWeight: 800,
                                color: '#475569',
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {h}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {displayPlayers.map((player, idx) => {
                        const flag = getCountryFlag(player.country);
                        const stats = format === 't20i' ? player.t20i : player.odi;
                        const isSelected = selectedPlayer?.id === player.id;
                        const isBowler = player.role.toLowerCase().includes('bowler');
                        const isWK = player.role.toLowerCase().includes('wicket');
                        const isAR = player.role.toLowerCase().includes('all-rounder');
                        const roleIcon = isWK ? '🧤' : isBowler ? '🎯' : isAR ? '⚡' : '🏏';
                        const roleColor = isWK ? '#f59e0b' : isBowler ? '#ef4444' : isAR ? '#22c55e' : '#60a5fa';
                        return (
                          <tr
                            key={player.id}
                            onClick={() => setSelectedPlayer(player)}
                            style={{
                              borderBottom: '1px solid rgba(255,255,255,0.04)',
                              cursor: 'pointer',
                              background: isSelected ? 'rgba(0,242,254,0.08)' : 'transparent',
                              transition: 'background 0.15s',
                            }}
                          >
                            <td style={{ padding: '10px 12px', color: '#475569', fontSize: 12 }}>{idx + 1}</td>
                            <td style={{ padding: '10px 12px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div
                                  style={{
                                    width: 34,
                                    height: 34,
                                    borderRadius: '50%',
                                    background: `${roleColor}22`,
                                    border: `1.5px solid ${roleColor}44`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 16,
                                    flexShrink: 0,
                                  }}
                                >
                                  {roleIcon}
                                </div>
                                <div>
                                  <div
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handlePlayerClick(player);
                                    }}
                                    style={{ fontWeight: 800, color: '#f1f5f9', cursor: 'pointer' }}
                                    onMouseEnter={(e) => (e.currentTarget.style.color = '#f7df1e')}
                                    onMouseLeave={(e) => (e.currentTarget.style.color = '#f1f5f9')}
                                  >
                                    {player.name}
                                  </div>
                                  <div style={{ fontSize: 11, color: '#475569' }}>{player.role}</div>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '10px 12px', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                              {flag} {player.country}
                            </td>
                            <td style={{ padding: '10px 12px', color: '#64748b', fontSize: 12 }}>
                              {player.batting_style?.replace('-hand bat', '')}
                            </td>
                            <td style={{ padding: '10px 12px', color: '#94a3b8', textAlign: 'center' }}>
                              {stats?.matches ?? '—'}
                            </td>
                            <td
                              style={{
                                padding: '10px 12px',
                                color: '#f7df1e',
                                fontWeight: 700,
                                textAlign: 'center',
                              }}
                            >
                              {isBowler ? player.bowling?.wickets_t20i ?? stats?.runs ?? '—' : stats?.runs ?? '—'}
                            </td>
                            <td style={{ padding: '10px 12px', color: '#94a3b8', textAlign: 'center' }}>
                              {stats?.avg?.toFixed(1) ?? '—'}
                            </td>
                            <td
                              style={{
                                padding: '10px 12px',
                                color: isBowler ? '#22c55e' : '#00f2fe',
                                fontWeight: 700,
                                textAlign: 'center',
                              }}
                            >
                              {isBowler
                                ? player.bowling?.t20i_economy?.toFixed(1) ?? '—'
                                : stats?.sr?.toFixed(1) ?? '—'}
                            </td>
                            <td style={{ padding: '10px 12px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <div
                                  style={{
                                    flex: 1,
                                    height: 4,
                                    background: 'rgba(255,255,255,0.06)',
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                  }}
                                >
                                  <div
                                    style={{
                                      height: '100%',
                                      width: `${Math.min(player.overall_score, 100)}%`,
                                      background: 'linear-gradient(90deg, #22c55e, #00f2fe)',
                                      borderRadius: 2,
                                    }}
                                  />
                                </div>
                                <span style={{ fontSize: 12, color: '#94a3b8', minWidth: 28 }}>
                                  {player.overall_score}
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Sidebar: Spotlight + Scatter */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {selectedPlayer && (
                  <>
                    <div
                      style={{ ...card('rgba(0,242,254,0.2)'), cursor: 'pointer' }}
                      onClick={() => setSpotlightOpen(true)}
                    >
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 800,
                          color: '#00f2fe',
                          marginBottom: 8,
                          textTransform: 'uppercase',
                          letterSpacing: '0.1em',
                        }}
                      >
                        ⭐ Selected Spotlight
                      </div>
                      <h3 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 900 }}>{selectedPlayer.name}</h3>
                      <p style={{ margin: '0 0 12px', color: '#64748b', fontSize: 13 }}>
                        {getCountryFlag(selectedPlayer.country)} {selectedPlayer.country} · {selectedPlayer.role}
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        {[
                          ['Avg', selectedPlayer.t20i?.avg?.toFixed(1)],
                          ['SR', selectedPlayer.t20i?.sr?.toFixed(1)],
                          ['Matches', selectedPlayer.t20i?.matches],
                          ['Rating', selectedPlayer.overall_score],
                        ].map(([label, val]) => (
                          <div
                            key={label as string}
                            style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: '10px', textAlign: 'center' }}
                          >
                            <div style={{ fontSize: 18, fontWeight: 900, color: '#f1f5f9' }}>{val ?? '—'}</div>
                            <div style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase' }}>{label}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ marginTop: 12, fontSize: 12, color: '#475569', textAlign: 'center' }}>
                        Click to view complete modal analysis →
                      </div>
                    </div>

                    {selectedPlayer.match_logs && selectedPlayer.match_logs.length > 0 && (
                      <div style={card()}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', marginBottom: 8 }}>
                          📈 PERFORMANCE TREND
                        </div>
                        <PerformanceTrendChart player={selectedPlayer} format={format} />
                      </div>
                    )}
                  </>
                )}

                <div style={card()}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', marginBottom: 8 }}>
                    📊 SCATTER QUADRANT
                  </div>
                  <ScatterQuadrantPlot
                    players={allPlayers.slice(0, 40)}
                    format={format}
                    onSelectPlayer={setSelectedPlayer}
                  />
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Final 11 Pitch View Tab */
          <div>
            <div style={{ ...card(), marginBottom: '1.5rem' }}>
              <h2 style={{ margin: '0 0 1rem', fontSize: 18, fontWeight: 800 }}>⚡ Build Your Match XI</h2>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: '#64748b', fontWeight: 700, marginBottom: 6 }}>
                    Format
                  </label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value as 't20i' | 'odi')}
                    style={{
                      padding: '10px 14px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 10,
                      color: '#f1f5f9',
                      fontSize: 13,
                      outline: 'none',
                    }}
                  >
                    <option value="t20i">T20I</option>
                    <option value="odi">ODI</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: '#64748b', fontWeight: 700, marginBottom: 6 }}>
                    Pitch Type
                  </label>
                  <select
                    value={pitchType}
                    onChange={(e) => setPitchType(e.target.value)}
                    style={{
                      padding: '10px 14px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 10,
                      color: '#f1f5f9',
                      fontSize: 13,
                      outline: 'none',
                    }}
                  >
                    {['flat', 'seaming', 'spinning', 'bouncy'].map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: '#64748b', fontWeight: 700, marginBottom: 6 }}>
                    Conditions
                  </label>
                  <select
                    value={conditions}
                    onChange={(e) => setConditions(e.target.value)}
                    style={{
                      padding: '10px 14px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 10,
                      color: '#f1f5f9',
                      fontSize: 13,
                      outline: 'none',
                    }}
                  >
                    {['all', 'subcontinent', 'overseas'].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleBuildTeam}
                  disabled={loadingTeam}
                  style={{
                    padding: '11px 24px',
                    background: loadingTeam
                      ? 'rgba(34,197,94,0.3)'
                      : 'linear-gradient(135deg,#22c55e,#16a34a)',
                    color: '#000',
                    fontWeight: 900,
                    fontSize: 14,
                    borderRadius: 12,
                    border: 'none',
                    cursor: loadingTeam ? 'not-allowed' : 'pointer',
                  }}
                >
                  {loadingTeam ? '🔄 Assembling Team...' : '⚡ Generate Final 11'}
                </button>
              </div>
            </div>
            {teamXI.length > 0 && (
              <Final11PitchView
                team={teamXI}
                onSelectPlayer={handlePlayerClick}
                format={format}
                pitchType={pitchType}
              />
            )}
          </div>
        )}
      </div>

      {/* Spotlight Modal */}
      {spotlightOpen && selectedPlayer && (
        <PlayerSpotlightModal player={selectedPlayer} onClose={() => setSpotlightOpen(false)} format={format} />
      )}
    </div>
  );
}
