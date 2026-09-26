export interface MatchPerformance {
  opponent: string;
  runs?: number;
  balls?: number;
  wickets?: number;
  overs?: number;
  runs_conceded?: number;
  sr?: number;
  avg?: number;
  economy?: number;
}

export interface Player {
  id: string;
  name: string;
  country: string;
  ipl_team: string | null;
  role: string;
  batting_style: string;
  bowling_style: string | null;
  image_url?: string;
  formats: string[];
  t20i: {
    matches: number;
    runs: number;
    avg: number;
    sr: number;
    fifties: number;
    hundreds: number;
    balls_faced?: number;
    boundary_pct?: number;
  };
  odi: {
    matches: number;
    runs: number;
    avg: number;
    sr: number;
    fifties: number;
    hundreds: number;
    balls_faced?: number;
    boundary_pct?: number;
  };
  test?: {
    matches: number;
    runs: number;
    avg: number;
    sr: number;
    fifties: number;
    hundreds: number;
  };
  bowling: {
    t20i_economy: number | null;
    odi_economy: number | null;
    wickets_t20i?: number;
    wickets_odi?: number;
    balls_bowled?: number;
    dot_ball_pct?: number;
  };
  pitch_preference: string[];
  conditions_preference: string[];
  specialties: string[];
  power_play_sr: number;
  death_over_sr: number;
  middle_overs_sr: number;
  overall_score: number;
  recent_form: number;
  tags: string[];
  match_logs?: MatchPerformance[];
  ovr?: number;
  card_tier?: 'ICON' | 'HERO' | 'TOTW' | 'GOLD_RARE' | string;
  tier_color?: string;
  ea_stats?: {
    BAT: number;
    PWR: number;
    BWL: number;
    CLU: number;
    FLD: number;
    PHY: number;
  };
}

export interface TournamentRecord {
  Tournament: string;
  Year: number;
  Venue: string;
  Winner: string;
  Runner_up?: string;
  'Runner-up'?: string;
  Semi_Finalists?: string;
  'Semi-Finalists'?: string;
  Match_Winner_Final: string | null;
  Player_of_Tournament: string | null;
}

export interface HallOfFameResponse {
  total_tournaments: number;
  icons_count: number;
  top_icons: Player[];
  tournaments: TournamentRecord[];
}

export interface SimilarPlayer {
  player: Player;
  similarity_score: number;
  explanation: string;
}

export interface TeamPlayer {
  player: Player;
  context_score: number;
  team_role: string;
  explanation: string;
}

export interface RolePlayer {
  player: Player;
  role_score: number;
  explanation: string;
}
