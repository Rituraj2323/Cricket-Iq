'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import { isLoggedIn } from '../../lib/auth';
import data from '../../lib/data/icc_all_players.json';

type Fmt = 'all' | 'odi' | 't20' | 'ct';
const FMTS: { k: Fmt; label: string }[] = [
  { k: 'all', label: 'All events' },
  { k: 'odi', label: 'ODI World Cup' },
  { k: 't20', label: 'T20 World Cup' },
  { k: 'ct', label: 'Champions Trophy' },
];
const SORTS = [
  { k: 'runs', label: 'Runs' },
  { k: 'w', label: 'Wickets' },
  { k: 'm', label: 'Matches' },
  { k: 'avg', label: 'Bat avg' },
  { k: 'sr', label: 'Strike rate' },
  { k: '100', label: 'Hundreds' },
];
const PAGE = 50;

/* eslint-disable @typescript-eslint/no-explicit-any */
const players = data as any[];

function sum(p: any, f: Fmt, key: string): number {
  const keys = f === 'all' ? ['odi', 't20', 'ct'] : [f];
  return keys.reduce((a, k) => a + (p[k]?.[key] || 0), 0);
}
function weighted(p: any, f: Fmt, key: 'avg' | 'sr'): number {
  if (f !== 'all') return p[f]?.[key] || 0;
  const r = sum(p, f, 'runs');
  const keys = ['odi', 't20', 'ct'].filter((k) => p[k]);
  if (!keys.length || !r) return 0;
  return Math.round((keys.reduce((a, k) => a + (p[k][key] || 0) * (p[k].runs || 0), 0) / r) * 100) / 100;
}

export default function IccPlayersPage() {
  const router = useRouter();
  const [fmt, setFmt] = useState<Fmt>('all');
  const [sort, setSort] = useState('runs');
  const [q, setQ] = useState('');
  const [country, setCountry] = useState('');
  const [shown, setShown] = useState(PAGE);

  useEffect(() => {
    if (!isLoggedIn()) router.replace('/');
  }, [router]);

  const countries = useMemo(() => Array.from(new Set(players.map((p) => p.country))).sort(), []);

  const rows = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return players
      .filter((p) => (fmt === 'all' || p[fmt]) && (!country || p.country === country) && (!ql || p.name.toLowerCase().includes(ql)))
      .map((p) => ({
        p,
        m: sum(p, fmt, 'm'), runs: sum(p, fmt, 'runs'), w: sum(p, fmt, 'w'),
        avg: weighted(p, fmt, 'avg'), sr: weighted(p, fmt, 'sr'),
        '100': sum(p, fmt, '100'), '50': sum(p, fmt, '50'), ct: sum(p, fmt, 'ct'),
      }))
      .sort((a: any, b: any) => (b[sort] as number) - (a[sort] as number));
  }, [fmt, sort, q, country]);

  useEffect(() => setShown(PAGE), [fmt, sort, q, country]);

  const th: React.CSSProperties = { padding: '10px 12px', textAlign: 'right', whiteSpace: 'nowrap' };
  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <main style={{ maxWidth: 1300, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        <span className="pill-live"><span className="dot" />ICC archive · men&apos;s</span>
        <h1 style={{ fontSize: 'clamp(2.2rem,5vw,4rem)', margin: '16px 0 8px' }}>
          Every player. <em>Every World Cup.</em>
        </h1>
        <p style={{ color: '#8892a4', maxWidth: 680, lineHeight: 1.6 }}>
          {players.length.toLocaleString()} players who appeared in an ODI World Cup, T20 World Cup or Champions Trophy,
          with batting, bowling and fielding stats computed from ball-by-ball records (qualifiers excluded).
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, margin: '1.5rem 0' }}>
          {FMTS.map((f) => (
            <button key={f.k} onClick={() => setFmt(f.k)} className={`nav-link${fmt === f.k ? ' active' : ''}`} style={{ cursor: 'pointer', background: fmt === f.k ? 'rgba(255,255,255,0.07)' : 'transparent' }}>
              {f.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: '1.25rem' }}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search player…" style={inp} />
          <select value={country} onChange={(e) => setCountry(e.target.value)} style={inp}>
            <option value="">All countries</option>
            {countries.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value)} style={inp}>
            {SORTS.map((s) => <option key={s.k} value={s.k}>Sort: {s.label}</option>)}
          </select>
          <span className="mono-label" style={{ alignSelf: 'center', color: '#8892a4' }}>{rows.length} players</span>
        </div>

        <div style={{ overflowX: 'auto', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, background: 'rgba(10,14,26,0.8)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr className="mono-label" style={{ color: '#8892a4', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ ...th, textAlign: 'left' }}>#</th>
                <th style={{ ...th, textAlign: 'left' }}>Player</th>
                <th style={{ ...th, textAlign: 'left' }}>Team</th>
                {['Mat', 'Runs', 'Avg', 'SR', '100', '50', 'Wkts', 'Ct'].map((h) => <th key={h} style={th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, shown).map((r, i) => (
                <tr key={r.p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ ...th, textAlign: 'left', color: '#64748b' }}>{i + 1}</td>
                  <td style={{ ...th, textAlign: 'left', color: '#fff', fontWeight: 600 }}>{r.p.name}</td>
                  <td style={{ ...th, textAlign: 'left', color: '#8892a4' }}>{r.p.country}</td>
                  <td style={th}>{r.m}</td><td style={{ ...th, color: '#fff' }}>{r.runs}</td>
                  <td style={th}>{r.avg || '-'}</td><td style={th}>{r.sr || '-'}</td>
                  <td style={th}>{r['100']}</td><td style={th}>{r['50']}</td>
                  <td style={{ ...th, color: '#fff' }}>{r.w}</td><td style={th}>{r.ct}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {shown < rows.length && (
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <button className="btn-solid" onClick={() => setShown((s) => s + PAGE * 4)}>Load more ↓</button>
          </div>
        )}
      </main>
    </div>
  );
}

const inp: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)', color: '#f1f5f9', border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: 12, padding: '9px 14px', fontSize: 13, outline: 'none',
};
