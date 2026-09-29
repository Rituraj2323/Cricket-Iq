'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isLoggedIn } from '../../lib/auth';
import Navbar from '../../components/Navbar';
import { getClientCricSelectRecommendations } from '../../lib/clientEngine';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const FORMATS = ['T20I', 'ODI', 'Test'];
const ROLES = [
  { value: 'batter', label: 'Batter', icon: '🏏' },
  { value: 'bowler', label: 'Bowler', icon: '🎯' },
  { value: 'all-rounder', label: 'All-Rounder', icon: '⚡' },
  { value: 'wicketkeeper', label: 'Wicketkeeper', icon: '🧤' },
];
const POSITIONS = [
  { value: 'any', label: 'Any Position' },
  { value: 'opener', label: 'Opener' },
  { value: 'middle_order', label: 'Middle Order' },
  { value: 'finisher', label: 'Finisher' },
];
const PRIORITIES = [
  { value: 'balanced', label: 'Balanced Model', icon: '⚖️' },
  { value: 'recent_form', label: 'Recent Form', icon: '🔥' },
  { value: 'strike_rate', label: 'Strike Rate', icon: '💥' },
  { value: 'economy', label: 'Economy', icon: '🎯' },
  { value: 'consistency', label: 'Consistency', icon: '📈' },
  { value: 'match_up', label: 'Match-Up Focus', icon: '🆚' },
];

const SCORE_COLORS: Record<string, string> = {
  role_match: '#22c55e',
  recent_form: '#00f2fe',
  performance: '#f59e0b',
  requirements: '#a78bfa',
  consistency: '#f87171',
};

export default function CricSelectPage() {
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace('/');
    }
  }, [router]);

  const [format, setFormat] = useState('T20I');
  const [role, setRole] = useState('all-rounder');
  const [position, setPosition] = useState('middle_order');
  const [priority, setPriority] = useState('strike_rate');
  const [topK, setTopK] = useState(5);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<number | null>(1);
  const [hasSearched, setHasSearched] = useState(false);

  const search = async () => {
    setLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch(`${BASE_URL}/recommend/cric-select`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          format,
          batting_position: position,
          priority,
          top_k: topK,
        }),
      });
      if (!res.ok) throw new Error('API returned error');
      const data = await res.json();
      setResults(data);
      if (data.length > 0) setExpanded(1);
    } catch (e) {
      console.warn('Backend unavailable, running client-side CRIC-SELECT algorithm:', e);
      const fallbackData = getClientCricSelectRecommendations(role, format, position, priority, topK);
      setResults(fallbackData);
      if (fallbackData.length > 0) setExpanded(1);
    }
    setLoading(false);
  };

  useEffect(() => {
    // Initial run with default example
    search();
  }, []);

  const card = (bg = 'rgba(11,19,32,0.95)', border = 'rgba(255,255,255,0.08)') => ({
    background: bg,
    border: `1px solid ${border}`,
    borderRadius: 20,
    padding: '1.5rem',
  });

  const pill = (active: boolean, color = '#00f2fe') => ({
    padding: '8px 16px',
    borderRadius: 999,
    border: `1.5px solid ${active ? color : 'rgba(255,255,255,0.1)'}`,
    background: active ? `${color}18` : 'transparent',
    color: active ? color : '#94a3b8',
    fontWeight: 700,
    fontSize: 13,
    cursor: 'pointer' as const,
    transition: 'all 0.15s',
  });

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#050b12',
        color: '#f1f5f9',
        fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
      }}
    >
      <Navbar />
      <div style={{ maxWidth: 1300, margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '4px 14px',
              borderRadius: 999,
              background: 'rgba(34,197,94,0.1)',
              border: '1px solid rgba(34,197,94,0.3)',
              fontSize: 11,
              fontWeight: 800,
              color: '#22c55e',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: 12,
            }}
          >
            🎯 CRIC-SELECT
          </div>
          <h1
            style={{
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              fontWeight: 900,
              margin: '0 0 8px',
              letterSpacing: '-0.03em',
            }}
          >
            Who Should I Pick?
          </h1>
          <p style={{ color: '#64748b', fontSize: 15, margin: 0 }}>
            Intelligent player recommendation with weighted multi-factor scoring and full explainability.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '1.5rem', alignItems: 'start' }}>
          {/* LEFT: Selector Configuration Panel */}
          <div
            style={{
              ...card('rgba(11,19,32,0.95)', 'rgba(0,242,254,0.2)'),
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              position: 'sticky',
              top: 20,
            }}
          >
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#00f2fe' }}>⚙️ Team Requirement</h2>

            {/* Format Selection */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 11,
                  fontWeight: 800,
                  color: '#64748b',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: 8,
                }}
              >
                Format
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                {FORMATS.map((f) => (
                  <button key={f} onClick={() => setFormat(f)} style={pill(format === f)}>
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 11,
                  fontWeight: 800,
                  color: '#64748b',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: 8,
                }}
              >
                Target Role
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {ROLES.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => setRole(r.value)}
                    style={{
                      ...pill(role === r.value, '#22c55e'),
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      justifyContent: 'center',
                      padding: '10px 12px',
                    }}
                  >
                    {r.icon} {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Batting Position */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 11,
                  fontWeight: 800,
                  color: '#64748b',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: 8,
                }}
              >
                Batting Position
              </label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {POSITIONS.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setPosition(p.value)}
                    style={{ ...pill(position === p.value, '#a78bfa'), fontSize: 12 }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority Weighting */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 11,
                  fontWeight: 800,
                  color: '#64748b',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: 8,
                }}
              >
                Priority Metric
              </label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {PRIORITIES.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setPriority(p.value)}
                    style={{ ...pill(priority === p.value, '#f59e0b'), fontSize: 12 }}
                  >
                    {p.icon} {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Top K */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 11,
                  fontWeight: 800,
                  color: '#64748b',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: 8,
                }}
              >
                Top Results
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[3, 5, 10].map((k) => (
                  <button key={k} onClick={() => setTopK(k)} style={pill(topK === k, '#f87171')}>
                    Top {k}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={search}
              disabled={loading}
              style={{
                padding: '14px',
                background: loading ? 'rgba(34,197,94,0.3)' : 'linear-gradient(135deg,#22c55e,#16a34a)',
                color: '#000',
                fontWeight: 900,
                fontSize: 15,
                borderRadius: 14,
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {loading ? '🔄 Evaluating Model...' : '🎯 Recommend Best Players'}
            </button>

            {/* Formula box */}
            <div
              style={{
                padding: '12px',
                background: 'rgba(0,0,0,0.35)',
                borderRadius: 12,
                fontSize: 11,
                color: '#64748b',
                lineHeight: 2,
                fontFamily: 'monospace',
              }}
            >
              <div style={{ color: '#94a3b8', fontWeight: 700, marginBottom: 4 }}>SCORING DISTRIBUTION</div>
              <div>
                <span style={{ color: '#22c55e' }}>30%</span> Role Match
              </div>
              <div>
                + <span style={{ color: '#00f2fe' }}>25%</span> Recent Form
              </div>
              <div>
                + <span style={{ color: '#f59e0b' }}>20%</span> Performance
              </div>
              <div>
                + <span style={{ color: '#a78bfa' }}>15%</span> Requirements
              </div>
              <div>
                + <span style={{ color: '#f87171' }}>10%</span> Consistency
              </div>
            </div>
          </div>

          {/* RIGHT: Ranked Recommendations List */}
          <div>
            {!hasSearched ? (
              <div style={{ ...card(), textAlign: 'center', padding: '4rem 2rem' }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>🎯</div>
                <h2 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 8px' }}>Configure & Search</h2>
                <p style={{ color: '#64748b', margin: 0 }}>
                  Select format, role, and priority on the left, then click Recommend Best Players.
                </p>
              </div>
            ) : loading ? (
              <div style={{ ...card(), textAlign: 'center', padding: '4rem 2rem' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🏏</div>
                <p style={{ color: '#64748b' }}>Calculating multi-criteria player scores...</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>
                    Recommended {ROLES.find((r) => r.value === role)?.label}s
                  </h2>
                  <div style={{ fontSize: 12, color: '#64748b' }}>
                    {format} · {PRIORITIES.find((p) => p.value === priority)?.label}
                  </div>
                </div>

                {/* Table header */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '40px 1.2fr 90px 1.4fr',
                    gap: 12,
                    padding: '8px 16px',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: 12,
                    fontSize: 11,
                    fontWeight: 800,
                    color: '#475569',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  <div>#</div>
                  <div>Player</div>
                  <div style={{ textAlign: 'center' }}>Score</div>
                  <div>Why Recommended?</div>
                </div>

                {/* Player rows */}
                {results.map((r: any) => (
                  <div
                    key={r.rank}
                    style={{
                      ...card(
                        'rgba(11,19,32,0.95)',
                        expanded === r.rank ? 'rgba(34,197,94,0.45)' : 'rgba(255,255,255,0.08)'
                      ),
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onClick={() => setExpanded(expanded === r.rank ? null : r.rank)}
                  >
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '40px 1.2fr 90px 1.4fr',
                        gap: 12,
                        alignItems: 'center',
                      }}
                    >
                      {/* Rank badge */}
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background:
                            r.rank === 1
                              ? '#f59e0b'
                              : r.rank === 2
                              ? '#94a3b8'
                              : r.rank === 3
                              ? '#b45309'
                              : 'rgba(255,255,255,0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 14,
                          fontWeight: 900,
                          color: r.rank <= 3 ? '#000' : '#94a3b8',
                        }}
                      >
                        {r.rank}
                      </div>

                      {/* Name & Country */}
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 16, color: '#f1f5f9' }}>{r.player.name}</div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>
                          {r.player.country} · {r.player.role}
                        </div>
                      </div>

                      {/* Score Percentage */}
                      <div style={{ textAlign: 'center' }}>
                        <div
                          style={{
                            fontSize: 22,
                            fontWeight: 900,
                            color: r.score >= 80 ? '#22c55e' : r.score >= 65 ? '#f59e0b' : '#94a3b8',
                          }}
                        >
                          {r.score_pct}
                        </div>
                        <div style={{ fontSize: 10, color: '#475569' }}>Overall Match</div>
                      </div>

                      {/* Primary explanation badge */}
                      <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.4 }}>
                        <span style={{ color: '#22c55e', marginRight: 4 }}>✓</span>
                        {r.why[0]}
                        <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>
                          {expanded === r.rank ? '▴ Collapse breakdown' : '▾ Click for full math breakdown'}
                        </div>
                      </div>
                    </div>

                    {/* Expandable Explanation & Score Breakdown */}
                    {expanded === r.rank && (
                      <div
                        style={{
                          marginTop: '1.25rem',
                          paddingTop: '1.25rem',
                          borderTop: '1px solid rgba(255,255,255,0.07)',
                        }}
                      >
                        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '1.5rem' }}>
                          {/* Bullet reasons */}
                          <div>
                            <div
                              style={{
                                fontSize: 12,
                                fontWeight: 800,
                                color: '#22c55e',
                                marginBottom: 10,
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                              }}
                            >
                              Why {r.player.name}?
                            </div>
                            {r.why.map((reason: string, i: number) => (
                              <div
                                key={i}
                                style={{
                                  display: 'flex',
                                  alignItems: 'flex-start',
                                  gap: 8,
                                  marginBottom: 6,
                                  fontSize: 13,
                                  color: '#cbd5e1',
                                }}
                              >
                                <span style={{ color: '#22c55e', flexShrink: 0 }}>✓</span>
                                {reason}
                              </div>
                            ))}
                          </div>

                          {/* 5 component score breakdown bars */}
                          <div>
                            <div
                              style={{
                                fontSize: 12,
                                fontWeight: 800,
                                color: '#00f2fe',
                                marginBottom: 10,
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                              }}
                            >
                              Scoring Component Breakdown
                            </div>
                            {Object.entries(r.raw_scores).map(([key, val]: [string, any]) => (
                              <div key={key} style={{ marginBottom: 7 }}>
                                <div
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    fontSize: 11,
                                    marginBottom: 3,
                                  }}
                                >
                                  <span style={{ color: '#64748b', textTransform: 'capitalize' }}>
                                    {key.replace('_', ' ')}
                                  </span>
                                  <span
                                    style={{
                                      fontWeight: 700,
                                      color: SCORE_COLORS[key] || '#94a3b8',
                                    }}
                                  >
                                    {Number(val).toFixed(1)}/100
                                  </span>
                                </div>
                                <div
                                  style={{
                                    height: 5,
                                    background: 'rgba(255,255,255,0.06)',
                                    borderRadius: 3,
                                    overflow: 'hidden',
                                  }}
                                >
                                  <div
                                    style={{
                                      height: '100%',
                                      width: `${Math.min(Number(val), 100)}%`,
                                      background: SCORE_COLORS[key] || '#94a3b8',
                                      borderRadius: 3,
                                    }}
                                  />
                                </div>
                              </div>
                            ))}

                            <div
                              style={{
                                marginTop: 10,
                                padding: '8px 12px',
                                background: 'rgba(0,0,0,0.35)',
                                borderRadius: 8,
                                fontSize: 10,
                                color: '#64748b',
                                fontFamily: 'monospace',
                                lineHeight: 1.6,
                              }}
                            >
                              {r.breakdown_str}
                            </div>
                          </div>
                        </div>

                        {/* Player Quick Stat Tiles */}
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))',
                            gap: 8,
                            marginTop: '1.25rem',
                          }}
                        >
                          {[
                            ['T20 Avg', r.player.t20i?.avg?.toFixed(1)],
                            ['T20 SR', r.player.t20i?.sr?.toFixed(1)],
                            ['Economy', r.player.bowling?.t20i_economy?.toFixed(1)],
                            ['Overall Score', r.player.overall_score],
                            ['Recent Form', r.player.recent_form],
                          ].map(([label, val]) => (
                            <div
                              key={label as string}
                              style={{
                                background: 'rgba(255,255,255,0.04)',
                                borderRadius: 10,
                                padding: '8px 12px',
                                textAlign: 'center',
                              }}
                            >
                              <div style={{ fontSize: 16, fontWeight: 900, color: '#f1f5f9' }}>{val ?? '—'}</div>
                              <div
                                style={{
                                  fontSize: 10,
                                  color: '#64748b',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.08em',
                                }}
                              >
                                {label}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
