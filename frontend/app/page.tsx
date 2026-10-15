'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { login, isLoggedIn } from '../lib/auth';

const INTERACTIVE_SCENARIOS = [
  {
    id: 't20-ar',
    title: '💥 T20 Middle-Order Power Hitter',
    subtitle: 'Scenario: Need a fast scoring all-rounder for death overs',
    query: { format: 'T20', role: 'All-Rounder', position: 'Middle Order / Finisher', priority: 'High Strike Rate' },
    topPick: {
      name: 'Hardik Pandya',
      country: 'India',
      flag: '🇮🇳',
      role: 'All-Rounder',
      score: '92%',
      sr: '141.2',
      avg: '28.4',
      eco: '7.8',
      form: '88/100',
      why: [
        'Elite finishing strike rate in death overs (172+ SR in overs 16-20)',
        'Delivers 2-4 crucial middle/death overs with reliable seam variations',
        'Strong recent tournament form in high-pressure match scenarios',
      ],
    },
    runnersUp: [
      { name: 'Glenn Maxwell', flag: '🇦🇺', score: '89%', reason: 'Explosive 150+ SR with handy spin' },
      { name: 'Liam Livingstone', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', score: '86%', reason: 'Dual spin bowling + maximum boundary %' },
      { name: 'Ravindra Jadeja', flag: '🇮🇳', score: '84%', reason: 'Economical 7.1 eco with left-arm agility' },
    ],
  },
  {
    id: 'matchup-aus',
    title: '🆚 Ind vs Aus @ Ahmedabad Match-Up',
    subtitle: 'Scenario: Select the most dangerous wicket-taker on a dry pitch',
    query: { format: 'ODI / T20', role: 'Bowler', opponent: 'Australia', venue: 'Ahmedabad (Dry/Flat)' },
    topPick: {
      name: 'Jasprit Bumrah',
      country: 'India',
      flag: '🇮🇳',
      role: 'Fast Bowler',
      score: '96%',
      sr: '—',
      avg: '19.2',
      eco: '6.2',
      form: '95/100',
      why: [
        'Dominant historical record against top-order Australian batters',
        'Exceptional yorker accuracy and economy under 6.5 RPO in subcontinental conditions',
        'Proven match-winner at Narendra Modi Stadium across multiple tournament finals',
      ],
    },
    runnersUp: [
      { name: 'Kuldeep Yadav', flag: '🇮🇳', score: '91%', reason: 'Left-arm wrist spin deceives middle order' },
      { name: 'Mitchell Starc', flag: '🇦🇺', score: '88%', reason: 'Lethal opening inswingers against right-handers' },
      { name: 'Rashid Khan', flag: '🇦🇫', score: '87%', reason: 'Sub-6.0 economy with unpickable googly' },
    ],
  },
  {
    id: 'odi-anchor',
    title: '⚓ ODI Classical Run-Chaser',
    subtitle: 'Scenario: Dependable #3 batter to control high-target run chases',
    query: { format: 'ODI', role: 'Top Order Batter', position: 'Anchor (#3)', priority: 'Consistency & Avg' },
    topPick: {
      name: 'Virat Kohli',
      country: 'India',
      flag: '🇮🇳',
      role: 'Top-Order Batsman',
      score: '98%',
      sr: '93.5',
      avg: '58.7',
      eco: '—',
      form: '96/100',
      why: [
        'Highest successful run-chase conversion rate in cricket history',
        'Peerless 58.7 batting average over 290+ matches with 50 ODI centuries',
        'Seamlessly rotates strike against both pace and spin in middle overs',
      ],
    },
    runnersUp: [
      { name: 'Babar Azam', flag: '🇵🇰', score: '93%', reason: 'Exceptional 56+ average with classic strokeplay' },
      { name: 'Kane Williamson', flag: '🇳🇿', score: '90%', reason: 'Calm leader and spin-neutral anchor' },
      { name: 'Joe Root', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', score: '88%', reason: 'Consistent accumulator with 85%+ contact rate' },
    ],
  },
  {
    id: 'wc-eafc-icon',
    title: '👑 EA FC World Cup Icon & Hall of Fame',
    subtitle: 'Scenario: 94+ OVR Tournament Winning Icons from 1975–2025 World Cup Archive',
    query: { format: 'ICC World Cup', role: 'Tournament Icon', position: 'World Cup Legend', priority: 'Clutch & Knockout MVPs' },
    topPick: {
      name: 'MS Dhoni',
      country: 'India',
      flag: '🇮🇳',
      role: 'World Cup Icon (95 OVR)',
      score: '99%',
      sr: '87.6',
      avg: '50.6',
      eco: '—',
      form: '98/100',
      why: [
        '2011 ODI World Cup Final Match-Winner (91* off 79) & 2007 T20 World Cup Winning Captain',
        'EA FC Clutch Rating 98/99 with unmatched death-overs chase execution',
        'Pioneer of white-ball cricket leadership with ICC Triple-Crown victories',
      ],
    },
    runnersUp: [
      { name: 'Virat Kohli', flag: '🇮🇳', score: '98%', reason: '2023 ODI Player of the Tournament (765 runs) & 94 OVR Icon' },
      { name: 'Jasprit Bumrah', flag: '🇮🇳', score: '96%', reason: '2024 T20 World Cup MVP with 4.17 tournament economy & 96 OVR' },
      { name: 'Mitchell Starc', flag: '🇦🇺', score: '95%', reason: '2015 ODI World Cup MVP with 22 tournament wickets & lethal yorkers' },
    ],
  },
];

export default function LandingPage() {
  const router = useRouter();
  const [activeScenario, setActiveScenario] = useState(0);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('cricket123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn()) {
      router.replace('/dashboard');
    }
  }, [router]);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    await new Promise((r) => setTimeout(r, 300));
    const ok = login(username.trim(), password.trim());
    if (ok) {
      router.replace('/dashboard');
    } else {
      setError('Invalid credentials. Try admin / cricket123');
      setLoading(false);
    }
  };

  const scenario = INTERACTIVE_SCENARIOS[activeScenario];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #050b12 0%, #0a1628 50%, #060d18 100%)',
        color: '#f1f5f9',
        fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
      }}
    >
      {/* Top Bar */}
      <header style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0.9rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(10,14,26,0.72)', backdropFilter: 'blur(18px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span className="font-serif" style={{ fontSize: 26, color: '#fff' }}>11<em style={{ color: '#8892a4' }}>-0</em></span>
          <span className="pill-live" style={{ padding: '3px 9px' }}><span className="dot" />Live</span>
        </div>
        <button onClick={() => handleLogin()} className="btn-solid">Launch demo ↗</button>
      </header>

      {/* Editorial hero */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '5rem 1.5rem 2rem', textAlign: 'center' }}>
        <div className="mono-label" style={{ position: 'absolute', top: 24, left: 32, color: 'rgba(255,255,255,0.18)' }}>{'// SYS_INITIALIZE'}</div>
        <div className="mono-label" style={{ position: 'absolute', top: 24, right: 32, color: 'rgba(255,255,255,0.18)' }}>{'[MATRIX_LOADED]'}</div>
        <p className="outline-word rise-in" style={{ position: 'absolute', left: 0, right: 0, top: '2.5rem', pointerEvents: 'none', zIndex: 0 }}>Selection</p>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 980, margin: '0 auto' }}>
          <span className="pill-live rise-in" style={{ marginBottom: 28 }}><span className="dot" />Intelligence layer for cricket</span>
          <h1 className="rise-in" style={{ fontSize: 'clamp(2.6rem, 7vw, 5.5rem)', lineHeight: 1.04, margin: '0 0 1.4rem', animationDelay: '0.15s' }}>
            Picking the XI with <em>explainable</em> analytics &amp; applied AI.
          </h1>
          <p className="rise-in" style={{ fontSize: 'clamp(1rem, 2vw, 1.15rem)', color: '#8892a4', maxWidth: 640, margin: '0 auto 2rem', lineHeight: 1.65, animationDelay: '0.3s' }}>
            Describe what your team needs. 11-0 scans 100+ players, computes tactical match-ups, and tells you exactly <strong style={{ color: '#e2e8f0' }}>why</strong> each player is picked.
          </p>
          <div className="rise-in" style={{ height: 1, maxWidth: 260, margin: '0 auto', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)', animationDelay: '0.45s' }} />
        </div>
      </section>

      {/* Main Container */}
      <main style={{ maxWidth: 1300, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        {/* ── INTERACTIVE LIVE PREVIEW WORKBENCH ── */}
        <div
          style={{
            background: 'rgba(11,19,32,0.95)',
            border: '1.5px solid rgba(0,242,254,0.25)',
            borderRadius: 24,
            padding: '2rem',
            boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
            marginBottom: '3rem',
          }}
        >
          {/* Step 1: Scenario Switcher Tabs */}
          <div style={{ marginBottom: '1.75rem' }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: 10,
              }}
            >
              👉 Step 1: Select A Match Requirement To Test
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10 }}>
              {INTERACTIVE_SCENARIOS.map((sc, idx) => {
                const isActive = activeScenario === idx;
                return (
                  <button
                    key={sc.id}
                    onClick={() => setActiveScenario(idx)}
                    style={{
                      padding: '12px 16px',
                      borderRadius: 14,
                      textAlign: 'left',
                      background: isActive ? 'rgba(0,242,254,0.12)' : 'rgba(255,255,255,0.03)',
                      border: `1.5px solid ${isActive ? '#00f2fe' : 'rgba(255,255,255,0.08)'}`,
                      color: isActive ? '#f1f5f9' : '#94a3b8',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ fontWeight: 800, fontSize: 14, color: isActive ? '#00f2fe' : '#f1f5f9' }}>
                      {sc.title}
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>{sc.subtitle}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: What User Inputted vs What AI Returned */}
          <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '2rem', alignItems: 'start' }}>
            {/* Input Box */}
            <div
              style={{
                background: 'rgba(5,11,18,0.85)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 18,
                padding: '1.4rem',
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: '#00f2fe',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: 12,
                }}
              >
                📥 User Input Query
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                {Object.entries(scenario.query).map(([k, v]) => (
                  <div
                    key={k}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      paddingBottom: 6,
                    }}
                  >
                    <span style={{ color: '#64748b', textTransform: 'capitalize' }}>{k.replace('_', ' ')}:</span>
                    <span style={{ fontWeight: 700, color: '#f1f5f9' }}>{v}</span>
                  </div>
                ))}
              </div>

              <div
                style={{
                  marginTop: 16,
                  padding: '10px 12px',
                  background: 'rgba(34,197,94,0.1)',
                  borderRadius: 10,
                  border: '1px solid rgba(34,197,94,0.25)',
                  fontSize: 12,
                  color: '#4ade80',
                  lineHeight: 1.5,
                }}
              >
                ⚡ Model scanned 104 players & ranked by tactical compatibility.
              </div>
            </div>

            {/* AI Output / Explanation Card */}
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: '#22c55e',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: 12,
                }}
              >
                🎯 AI Recommendation Output (#1 Top Pick)
              </div>

              {/* Top Pick Highlight Card */}
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(11,19,32,0.9) 100%)',
                  border: '1.5px solid rgba(34,197,94,0.4)',
                  borderRadius: 18,
                  padding: '1.5rem',
                  marginBottom: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        background: 'rgba(34,197,94,0.2)',
                        border: '2px solid #22c55e',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 22,
                      }}
                    >
                      🏏
                    </div>
                    <div>
                      <div style={{ fontSize: 20, fontWeight: 900, color: '#fff' }}>
                        {scenario.topPick.name} <span style={{ fontSize: 16 }}>{scenario.topPick.flag}</span>
                      </div>
                      <div style={{ fontSize: 12, color: '#94a3b8' }}>
                        {scenario.topPick.country} · {scenario.topPick.role}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 28, fontWeight: 900, color: '#22c55e', lineHeight: 1 }}>
                      {scenario.topPick.score}
                    </div>
                    <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                      Match Score
                    </div>
                  </div>
                </div>

                {/* Why Picked Box */}
                <div style={{ marginTop: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#22c55e', textTransform: 'uppercase', marginBottom: 6 }}>
                    Why {scenario.topPick.name}?
                  </div>
                  {scenario.topPick.why.map((reason, i) => (
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
                      <span style={{ color: '#22c55e', flexShrink: 0, fontWeight: 900 }}>✓</span>
                      {reason}
                    </div>
                  ))}
                </div>
              </div>

              {/* Runners Up */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: 8 }}>
                  Alternative Top Contenders
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
                  {scenario.runnersUp.map((r, i) => (
                    <div
                      key={r.name}
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 12,
                        padding: '10px 14px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontWeight: 800, fontSize: 13, color: '#f1f5f9' }}>
                          #{i + 2} {r.name} {r.flag}
                        </span>
                        <span style={{ fontWeight: 900, color: '#f59e0b', fontSize: 13 }}>{r.score}</span>
                      </div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{r.reason}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 3 PLATFORM MODULES SUMMARY + LOGIN PROMPT ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'center' }}>
          {/* Module descriptions */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(0,242,254,0.2)',
                borderRadius: 18,
                padding: '1.4rem',
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}>🎯</div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#00f2fe', margin: '0 0 6px' }}>CRIC-SELECT</h3>
              <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                Custom filter by format, position, strike rate, and role with complete explainability.
              </p>
            </div>

            <div
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(245,158,11,0.2)',
                borderRadius: 18,
                padding: '1.4rem',
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}>⚡</div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#f59e0b', margin: '0 0 6px' }}>Match-Up Engine</h3>
              <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                Recommends players tailored against specific opponent squads and stadium pitches.
              </p>
            </div>

            <div
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(34,197,94,0.2)',
                borderRadius: 18,
                padding: '1.4rem',
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#22c55e', margin: '0 0 6px' }}>Dashboard & 11s</h3>
              <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                Explore 104+ players, interactive scatter plots, and build full playing XIs.
              </p>
            </div>

            <div
              style={{
                background: 'rgba(245,158,11,0.05)',
                border: '1px solid rgba(245,158,11,0.3)',
                borderRadius: 18,
                padding: '1.4rem',
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}>🎲</div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#f59e0b', margin: '0 0 6px' }}>11–0 Dice Drafter</h3>
              <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                Roll random dice packs, draft legendary World Cup heroes, and simulate 11-match campaigns.
              </p>
            </div>
          </div>

          {/* Quick 1-Click Access Card */}
          <div
            style={{
              background: 'rgba(11,19,32,0.95)',
              border: '1.5px solid rgba(0,242,254,0.3)',
              borderRadius: 20,
              padding: '1.75rem',
              textAlign: 'center',
            }}
          >
            <h3 style={{ fontSize: 18, fontWeight: 900, margin: '0 0 6px' }}>Ready to Explore?</h3>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 1.25rem' }}>
              Sign in with 1-click to access the full tool suite.
            </p>

            <form onSubmit={handleLogin}>
              <div style={{ display: 'none' }}>
                <input value={username} onChange={(e) => setUsername(e.target.value)} />
                <input value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>

              {error && <div style={{ color: '#f87171', fontSize: 12, marginBottom: 8 }}>{error}</div>}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: loading ? 'rgba(34,197,94,0.4)' : 'linear-gradient(135deg, #22c55e, #16a34a)',
                  color: '#000',
                  fontWeight: 900,
                  fontSize: 15,
                  borderRadius: 12,
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 6px 20px rgba(34,197,94,0.3)',
                }}
              >
                {loading ? '🔄 Signing In...' : '🏏 Enter Full Platform'}
              </button>
            </form>

            <div style={{ marginTop: 12, fontSize: 11, color: '#475569' }}>
              Demo access: <strong style={{ color: '#00f2fe' }}>admin</strong> / <strong style={{ color: '#00f2fe' }}>cricket123</strong>
            </div>
          </div>
        </div>
      </main>

      <footer
        style={{
          borderTop: '1px solid rgba(255,255,255,0.05)',
          padding: '1.5rem',
          textAlign: 'center',
          color: '#475569',
          fontSize: 12,
          marginTop: '3rem',
        }}
      >
        11-0 — Intelligent Cricket Player Recommendation Engine & Sports Analytics Platform
      </footer>
    </div>
  );
}
