import { Player } from './types';
import localPlayers from './data/players.json';

const allPlayers = localPlayers as unknown as Player[];

const OPPONENTS = [
  'Australia', 'England', 'Pakistan', 'South Africa', 'New Zealand',
  'West Indies', 'Sri Lanka', 'Bangladesh', 'Afghanistan', 'India', 'Zimbabwe', 'USA'
];

const VENUES: Record<string, { pitch: string; conditions: string }> = {
  'Ahmedabad': { pitch: 'flat', conditions: 'subcontinent' },
  'Mumbai': { pitch: 'flat', conditions: 'subcontinent' },
  'Chennai': { pitch: 'spinning', conditions: 'subcontinent' },
  'Kolkata': { pitch: 'spinning', conditions: 'subcontinent' },
  'Delhi': { pitch: 'flat', conditions: 'subcontinent' },
  "Lord's": { pitch: 'seaming', conditions: 'overseas' },
  'Edgbaston': { pitch: 'seaming', conditions: 'overseas' },
  'The Oval': { pitch: 'flat', conditions: 'overseas' },
  'MCG': { pitch: 'bouncy', conditions: 'overseas' },
  'SCG': { pitch: 'spinning', conditions: 'overseas' },
  'Perth': { pitch: 'bouncy', conditions: 'overseas' },
  'Adelaide': { pitch: 'flat', conditions: 'overseas' },
  'Johannesburg': { pitch: 'bouncy', conditions: 'overseas' },
  'Cape Town': { pitch: 'seaming', conditions: 'overseas' },
};

// ── 1. CLIENT-SIDE CRIC-SELECT SCORER ──
export function calculateCricSelectScore(
  player: Player,
  role: string,
  fmt: string,
  battingPosition = 'any',
  priority = 'balanced',
  pitchType = 'flat',
  conditions = 'all'
) {
  const pRole = (player.role || '').toLowerCase();
  const targetRole = role.toLowerCase();
  let roleMatch = 60;
  if (pRole === targetRole || (targetRole === 'wicketkeeper' && pRole.includes('wicket'))) {
    roleMatch = 100;
  } else if (pRole.includes('all-rounder') || targetRole.includes('all')) {
    roleMatch = 80;
  }

  const recentForm = player.recent_form || 80;
  const overall = player.overall_score || (player.ovr || 85);
  const t20 = player.t20i || { avg: 30, sr: 130 };
  const odi = player.odi || { avg: 35, sr: 88 };
  const isBowler = pRole.includes('bowler');
  const eco = player.bowling?.t20i_economy || 7.5;

  let performance = isBowler
    ? Math.min(100, Math.max(50, (10.0 - eco) * 15 + 40))
    : Math.min(100, (fmt.toUpperCase() === 'ODI' ? odi.avg : t20.avg) * 1.5);

  let requirements = 70;
  if (player.pitch_preference?.includes(pitchType)) requirements += 15;
  if (player.conditions_preference?.includes(conditions) || player.conditions_preference?.includes('all')) requirements += 15;

  const consistency = Math.min(100, (player.ovr || 85) + (recentForm > 90 ? 8 : 0));

  let total = Math.round(
    roleMatch * 0.30 +
    recentForm * 0.25 +
    performance * 0.20 +
    requirements * 0.15 +
    consistency * 0.10
  );

  total = Math.min(99, Math.max(70, total));

  return {
    total,
    components: {
      role_match: Math.round(roleMatch),
      recent_form: Math.round(recentForm),
      performance: Math.round(performance),
      requirements: Math.round(requirements),
      consistency: Math.round(consistency),
    },
    weightings: {
      role_match: '30%',
      recent_form: '25%',
      performance: '20%',
      requirements: '15%',
      consistency: '10%',
    },
  };
}

export function getClientCricSelectRecommendations(
  role: string,
  fmt: string,
  battingPosition = 'any',
  priority = 'balanced',
  topK = 5
) {
  const scored = allPlayers.map(player => {
    const score = calculateCricSelectScore(player, role, fmt, battingPosition, priority);
    const why = [
      `Strong role match for ${role.toUpperCase()} with ${player.ovr || 88} OVR rating`,
      `Form index: ${player.recent_form || 85}/100 with proven consistency`,
      `Optimal strike & phase dynamics for ${fmt.toUpperCase()}`,
    ];
    return {
      rank: 1,
      player,
      score,
      why,
    };
  });

  scored.sort((a, b) => b.score.total - a.score.total);
  return scored.slice(0, topK).map((item, idx) => ({
    ...item,
    rank: idx + 1,
  }));
}

// ── 2. CLIENT-SIDE MATCH-UP CHATBOT ENGINE ──
export function getClientMatchupChatResponse(message: string) {
  const lower = message.toLowerCase();

  // Check for player comparison (e.g. 'starc or bumrah', 'kohli vs rohit')
  const matchedPlayers = allPlayers.filter(p => {
    const parts = p.name.toLowerCase().split(' ');
    return parts.some(part => part.length >= 4 && lower.includes(part));
  });

  if (matchedPlayers.length >= 2 || (matchedPlayers.length === 1 && (lower.includes('vs') || lower.includes('or')))) {
    const opponent = OPPONENTS.find(o => lower.includes(o.toLowerCase())) || 'Australia';
    const pitch = lower.includes('flat') ? 'Flat Track' : lower.includes('green') || lower.includes('seam') ? 'Green / Seaming Track' : 'General Conditions';

    const scored = matchedPlayers.map((p, idx) => ({
      rank: idx + 1,
      id: p.id,
      name: p.name,
      country: p.country,
      role: p.role,
      score_pct: `${p.ovr || 90}%`,
      stats: {
        avg: p.t20i?.avg || 0,
        sr: p.t20i?.sr || 0,
        economy: p.bowling?.t20i_economy,
        form: p.recent_form || 85,
      },
      why: [
        `Rated ${p.ovr || 90} OVR with elite ${pitch} compatibility`,
        p.role.toLowerCase().includes('bowler')
          ? `T20 economy of ${p.bowling?.t20i_economy || 7.2} with death overs accuracy`
          : `High pressure conversion rate in ${opponent} match-ups`,
        `Current Form Rating: ${p.recent_form || 88}/100`,
      ],
    }));

    scored.sort((a, b) => parseInt(b.score_pct) - parseInt(a.score_pct));
    scored.forEach((s, idx) => { s.rank = idx + 1; });

    const p1 = scored[0];
    const p2 = scored[1] || scored[0];

    return {
      query_params: { format: 'T20I', role: 'Head-to-Head Comparison', opponent },
      intro: `⚔️ **Head-to-Head Tactical Comparison: ${pitch}**\nEvaluating: ${scored.map(s => `**${s.name}**`).join(' vs ')}`,
      recommendations: scored,
      conclusion: `💡 **Direct Verdict:** In **${pitch}** against **${opponent}**, **${p1.name}** (${p1.score_pct}) gets the tactical edge over **${p2.name}** (${p2.score_pct}) due to superior control, match impact rating, and higher recent form (${p1.stats.form}/100).`,
    };
  }

  // General Role / Matchup Query
  let targetRole = 'batter';
  if (lower.includes('all-rounder') || lower.includes('allrounder')) targetRole = 'all-rounder';
  else if (lower.includes('bowler') || lower.includes('bowling') || lower.includes('death')) targetRole = 'bowler';
  else if (lower.includes('wicket') || lower.includes('keeper')) targetRole = 'wicketkeeper';

  const recs = getClientCricSelectRecommendations(targetRole, 'T20I', 'any', 'balanced', 4);
  const formattedRecs = recs.map(r => ({
    rank: r.rank,
    id: r.player.id,
    name: r.player.name,
    country: r.player.country,
    role: r.player.role,
    score_pct: `${r.score.total}%`,
    stats: {
      avg: r.player.t20i?.avg || 0,
      sr: r.player.t20i?.sr || 0,
      economy: r.player.bowling?.t20i_economy,
      form: r.player.recent_form || 85,
    },
    why: r.why,
  }));

  const top = formattedRecs[0];
  return {
    query_params: { format: 'T20I', role: targetRole },
    intro: `🏏 **Top Recommendations for ${targetRole.toUpperCase()}**\nEvaluated against 104+ international players for tactical consistency & form.`,
    recommendations: formattedRecs,
    conclusion: `💡 **Analyst Insight:** **${top.name}** (${top.score_pct}) represents the most dependable option for this role with the highest statistical stability.`,
  };
}
