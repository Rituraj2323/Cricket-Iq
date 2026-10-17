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

  // Format-aware intelligent scoring
  const isT20 = format.toLowerCase().includes('t20');
  const fmtKey = isT20 ? 't20i' : 'odi';

  const scorePlayer = (p: typeof typedPlayers[0]) => {
    const stats = (p as any)[fmtKey] || {};
    const matches = stats.matches || 0;
    const bowling = (p as any).bowling || {};
    const role = (p.role || '').toLowerCase();
    const isBowler = role.includes('bowler');
    const isAR = role.includes('all-rounder') || role.includes('allrounder');

    // Experience gate
    const minMatches = isT20 ? 15 : 25;
    let exp = 0;
    if (matches < 5) exp = -50;
    else if (matches < minMatches) exp = (matches / minMatches) * 15 - 15;
    else exp = Math.min(20, 10 + (matches / 100) * 10);

    let perf = 0;
    if (isBowler) {
      if (isT20) {
        const eco = bowling.t20i_economy || 8.5;
        const wkts = bowling.wickets_t20i || 0;
        perf = Math.max(0, (9.5 - eco) / 3.5) * 55 + Math.min(35, (wkts / Math.max(1, matches)) * 25);
      } else {
        const eco = bowling.odi_economy || 5.8;
        const wkts = bowling.wickets_odi || 0;
        perf = Math.max(0, (6.5 - eco) / 2.2) * 45 + Math.min(45, (wkts / 150) * 45);
      }
    } else if (isAR) {
      const avg = stats.avg || 20;
      const sr = stats.sr || 100;
      if (isT20) {
        const eco = bowling.t20i_economy || 8.8;
        perf = Math.min(45, (avg / 40) * 20 + Math.max(0, (sr - 110) / 60) * 25) + Math.max(0, (9.5 - eco) / 3) * 45;
      } else {
        const eco = bowling.odi_economy || 5.8;
        const wkts = bowling.wickets_odi || 0;
        perf = Math.min(45, (avg / 50) * 30 + Math.max(0, (sr - 75) / 45) * 15) + Math.max(0, (6.5 - eco) / 2) * 25 + Math.min(20, (wkts / 100) * 20);
      }
    } else {
      const avg = stats.avg || 25;
      const sr = stats.sr || 100;
      if (isT20) {
        perf = Math.max(0, (sr - 115) / 55) * 55 + Math.min(35, (avg / 45) * 35);
      } else {
        perf = Math.min(55, (avg / 55) * 55) + Math.max(0, (sr - 75) / 35) * 25 + Math.min(15, (stats.hundreds || 0) * 1.5 + (stats.fifties || 0) * 0.2);
      }
    }

    let bonus = 0;
    if ((p as any).pitch_preference?.includes(pitchType)) bonus += 12;
    if ((p as any).conditions_preference?.includes(conditions) || (p as any).conditions_preference?.includes('all')) bonus += 8;
    bonus += ((p as any).recent_form || 50) * 0.15;

    return Math.round((30 + ((p as any).overall_score || 80) * 0.2 + exp + perf + bonus) * 10) / 10;
  };

  const scored = typedPlayers.map(p => ({ player: p, score: scorePlayer(p) }));
  scored.sort((a, b) => b.score - a.score);

  const team: { player: typeof typedPlayers[0]; score: number; roleLabel: string }[] = [];
  const selected = new Set<string>();

  const pick = (predicate: (p: typeof typedPlayers[0]) => boolean, label: string, count: number) => {
    let c = 0;
    for (const sp of scored) {
      if (c >= count) break;
      if (!selected.has(sp.player.id) && predicate(sp.player)) {
        team.push({ player: sp.player, score: sp.score, roleLabel: label });
        selected.add(sp.player.id);
        c++;
      }
    }
  };

  pick(p => p.role.toLowerCase().includes('wicket') || p.role.toLowerCase().includes('keeper'), 'Wicket-keeper Batsman', 1);
  pick(p => ((p as any).specialties || []).includes('opener'), 'Opener', 1);
  pick(p => p.role.toLowerCase() === 'batsman', 'Batsman', 3);
  pick(p => p.role.toLowerCase().includes('all-rounder') || p.role.toLowerCase().includes('allrounder'), 'All-rounder', 2);
  pick(p => p.role.toLowerCase().includes('bowler'), 'Bowler', 3);

  for (const sp of scored) {
    if (team.length >= 11) break;
    if (!selected.has(sp.player.id)) {
      team.push({ player: sp.player, score: sp.score, roleLabel: sp.player.role });
      selected.add(sp.player.id);
    }
  }

  return team.map((item) => ({
    player: item.player,
    context_score: item.score,
    team_role: item.roleLabel,
    explanation: `Selected for ${format.toUpperCase()} XI on ${pitchType} pitch (${item.score} pts) based on format rate stats and condition adaptability.`,
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
