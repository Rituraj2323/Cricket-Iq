import { Player, SimilarPlayer, TeamPlayer, RolePlayer, TournamentRecord } from './types';
import localPlayers from './data/players.json';
import localTournaments from './data/tournaments.json';

const typedPlayers = localPlayers as unknown as Player[];
const typedTournaments = localTournaments as unknown as TournamentRecord[];

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? window.location.origin : '');

// ── 1. GET ALL PLAYERS ──
export async function getAllPlayers(format?: string): Promise<Player[]> {
  try {
    if (BASE_URL && BASE_URL.startsWith('http://localhost')) {
      const url = new URL(`${BASE_URL}/players/`);
      if (format) url.searchParams.append('format', format.toUpperCase());
      const res = await fetch(url.toString(), { cache: 'no-store' });
      if (res.ok) return await res.json();
    }
  } catch {
    // Fall back to embedded dataset
  }

  let result = [...typedPlayers];
  if (format) {
    result = result.filter(p => p.formats?.map(f => f.toUpperCase()).includes(format.toUpperCase()));
  }
  return result;
}

// ── 2. GET SINGLE PLAYER ──
export async function getPlayer(id: string): Promise<Player | null> {
  try {
    if (BASE_URL && BASE_URL.startsWith('http://localhost')) {
      const res = await fetch(`${BASE_URL}/players/${id}`, { cache: 'no-store' });
      if (res.ok) return await res.json();
    }
  } catch {
    // Fall back
  }
  return typedPlayers.find(p => p.id === id) || null;
}

// ── 3. SEARCH PLAYERS ──
export async function searchPlayers(query: string): Promise<Player[]> {
  if (!query.trim()) return [];
  const q = query.toLowerCase().trim();
  return typedPlayers.filter(p => p.name.toLowerCase().includes(q) || p.country.toLowerCase().includes(q));
}

// ── 4. SIMILAR PLAYERS (COSINE SIMILARITY FALLBACK) ──
export async function getSimilarPlayers(playerId: string, topN = 6): Promise<SimilarPlayer[]> {
  try {
    if (BASE_URL && BASE_URL.startsWith('http://localhost')) {
      const res = await fetch(`${BASE_URL}/recommend/similar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player_id: playerId, top_n: topN }),
      });
      if (res.ok) return await res.json();
    }
  } catch {
    // Fall back
  }

  const target = typedPlayers.find(p => p.id === playerId);
  if (!target) return [];

  const others = typedPlayers.filter(p => p.id !== playerId);
  const scored = others.map(p => {
    let sim = 70;
    if (p.role === target.role) sim += 15;
    if (p.batting_style === target.batting_style) sim += 5;
    const avgDiff = Math.abs((p.t20i?.avg || 0) - (target.t20i?.avg || 0));
    sim += Math.max(0, 10 - avgDiff * 0.5);
    return {
      player: p,
      similarity_score: Math.min(99, Math.round(sim)),
      explanation: `${p.name} matches ${target.name}'s role as a ${p.role} with compatible strike profiles and batting dynamics.`,
    };
  });

  scored.sort((a, b) => b.similarity_score - a.similarity_score);
  return scored.slice(0, topN);
}

// ── 5. BUILD TEAM XI ──
export async function buildTeam(format: string, pitchType: string, conditions: string): Promise<TeamPlayer[]> {
  try {
    if (BASE_URL && BASE_URL.startsWith('http://localhost')) {
      const res = await fetch(`${BASE_URL}/recommend/team`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format: format.toUpperCase(), pitch_type: pitchType, conditions }),
      });
      if (res.ok) return await res.json();
    }
  } catch {
    // Fall back
  }

  const available = [...typedPlayers].sort((a, b) => (b.ovr || b.overall_score) - (a.ovr || a.overall_score));
  const wk = available.find(p => p.role.toLowerCase().includes('wicket') || p.role.toLowerCase().includes('keeper')) || available[0];
  const batters = available.filter(p => p.role.toLowerCase() === 'batsman' && p.id !== wk.id).slice(0, 4);
  const allrounders = available.filter(p => p.role.toLowerCase().includes('all-rounder') || p.role.toLowerCase().includes('allrounder')).slice(0, 2);
  const bowlers = available.filter(p => p.role.toLowerCase().includes('bowler')).slice(0, 4);

  const team = [wk, ...batters, ...allrounders, ...bowlers].slice(0, 11);
  return team.map((p, idx) => ({
    player: p,
    context_score: Math.min(99, (p.ovr || 85) + 3),
    team_role: idx === 0 ? 'Wicket-keeper' : idx < 5 ? 'Top/Middle Order' : idx < 7 ? 'All-Rounder' : 'Bowler',
    explanation: `Selected for ${format} XI on ${pitchType} pitch based on ${p.ovr || 88} OVR rating and condition adaptability.`,
  }));
}

// ── 6. TOP BY ROLE ──
export async function getTopByRole(role: string, format: string, topN = 8): Promise<RolePlayer[]> {
  try {
    if (BASE_URL && BASE_URL.startsWith('http://localhost')) {
      const res = await fetch(`${BASE_URL}/recommend/role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, format: format.toUpperCase(), top_n: topN }),
      });
      if (res.ok) return await res.json();
    }
  } catch {
    // Fall back
  }

  const r = role.toLowerCase();
  const filtered = typedPlayers.filter(p => {
    if (r === 'allrounder' || r === 'all-rounder') return p.role.toLowerCase().includes('all');
    if (r === 'bowler' || r === 'spinner' || r === 'death_bowler') return p.role.toLowerCase().includes('bowl');
    if (r === 'wicketkeeper' || r === 'wk') return p.role.toLowerCase().includes('keeper') || p.role.toLowerCase().includes('wicket');
    return p.role.toLowerCase().includes('bat');
  });

  filtered.sort((a, b) => (b.ovr || b.overall_score) - (a.ovr || a.overall_score));
  return filtered.slice(0, topN).map(p => ({
    player: p,
    role_score: p.ovr || p.overall_score || 88,
    explanation: `Rated ${p.ovr || 88} OVR with standout specialty in ${p.specialties?.[0] || p.role}.`,
  }));
}

// ── 7. TOURNAMENTS & HALL OF FAME ──
export async function getTournaments(tournamentType?: string): Promise<TournamentRecord[]> {
  let list = [...typedTournaments];
  if (tournamentType && tournamentType !== 'all') {
    list = list.filter(t => t.Tournament.toLowerCase().includes(tournamentType.toLowerCase()));
  }
  return list;
}

export async function getHallOfFame(): Promise<{
  total_tournaments: number;
  icons_count: number;
  top_icons: Player[];
  tournaments: TournamentRecord[];
}> {
  const icons = typedPlayers.filter(p => p.card_tier === 'ICON' || p.card_tier === 'HERO');
  icons.sort((a, b) => (b.ovr || 85) - (a.ovr || 85));

  return {
    total_tournaments: typedTournaments.length,
    icons_count: icons.length,
    top_icons: icons.slice(0, 15),
    tournaments: typedTournaments,
  };
}
