import { Player, SimilarPlayer, TeamPlayer, RolePlayer } from './types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function getAllPlayers(format?: string): Promise<Player[]> {
  try {
    const url = new URL(`${BASE_URL}/players/`);
    if (format) url.searchParams.append('format', format.toUpperCase());
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url.toString(), { cache: 'no-store', signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) throw new Error('Failed to fetch players');
    return res.json();
  } catch (error) {
    console.error('getAllPlayers error:', error);
    return [];
  }
}

export async function getPlayer(id: string): Promise<Player | null> {
  try {
    const res = await fetch(`${BASE_URL}/players/${id}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch player');
    return res.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function searchPlayers(query: string): Promise<Player[]> {
  if (!query.trim()) return [];
  try {
    const res = await fetch(`${BASE_URL}/players/search/${encodeURIComponent(query)}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to search players');
    return res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getSimilarPlayers(playerId: string, topN = 6): Promise<SimilarPlayer[]> {
  try {
    const res = await fetch(`${BASE_URL}/recommend/similar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player_id: playerId, top_n: topN }),
    });
    if (!res.ok) throw new Error('Failed to fetch similar players');
    return res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function buildTeam(format: string, pitchType: string, conditions: string): Promise<TeamPlayer[]> {
  try {
    const res = await fetch(`${BASE_URL}/recommend/team`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ format: format.toUpperCase(), pitch_type: pitchType, conditions }),
    });
    if (!res.ok) throw new Error('Failed to build team');
    return res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getTopByRole(role: string, format: string, topN = 8): Promise<RolePlayer[]> {
  try {
    const res = await fetch(`${BASE_URL}/recommend/role`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, format: format.toUpperCase(), top_n: topN }),
    });
    if (!res.ok) throw new Error('Failed to fetch top by role');
    return res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getTournaments(tournamentType?: string): Promise<any[]> {
  try {
    const url = new URL(`${BASE_URL}/players/tournaments`);
    if (tournamentType) url.searchParams.append('tournament_type', tournamentType);
    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch tournaments');
    return res.json();
  } catch (error) {
    console.error('getTournaments error:', error);
    return [];
  }
}

export async function getHallOfFame(): Promise<any> {
  try {
    const res = await fetch(`${BASE_URL}/players/hall-of-fame`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch hall of fame');
    return res.json();
  } catch (error) {
    console.error('getHallOfFame error:', error);
    return { total_tournaments: 0, icons_count: 0, top_icons: [], tournaments: [] };
  }
}

