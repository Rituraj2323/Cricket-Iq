import json
import os
import random
import pandas as pd
from typing import List, Dict, Optional

_PLAYERS_CACHE: Optional[List[Dict]] = None
_DATAFRAME_CACHE: Optional[pd.DataFrame] = None

# Realistic opponent sequences for international match breakdowns
OPPONENTS = [
    'IND vs PAK', 'IND vs NED', 'IND vs SAF', 'IND vs BAN', 'IND vs ZIM', 'IND vs ENG',
    'AUS vs NZ', 'AUS vs ENG', 'AUS vs AFG', 'ENG vs PAK', 'SAF vs BAN', 'NZ vs SL'
]

def generate_match_logs(player: Dict) -> List[Dict]:
    """Generate realistic tournament/series match logs for performance analysis breakdown."""
    t20i = player.get('t20i', {}) or {}
    base_avg = t20i.get('avg', 30.0) or 30.0
    base_sr = t20i.get('sr', 130.0) or 130.0
    is_bowler = 'bowler' in player.get('role', '').lower()
    
    # Deterministic seed based on player id so stats are stable
    seed = sum(ord(c) for c in player.get('id', 'player'))
    rng = random.Random(seed)
    
    country_prefix = player.get('country', 'IND')[:3].upper()
    opps = [
        f"{country_prefix} vs PAK", f"{country_prefix} vs NED", f"{country_prefix} vs SAF",
        f"{country_prefix} vs BAN", f"{country_prefix} vs ZIM", f"{country_prefix} vs ENG"
    ]
    
    logs = []
    for opp in opps:
        # Variance factor
        v = rng.uniform(0.7, 1.4)
        m_sr = round(base_sr * v, 2)
        m_balls = round(rng.uniform(15, 45), 2) if not is_bowler else round(rng.uniform(2, 10), 2)
        m_runs = int((m_sr * m_balls) / 100)
        m_avg = round(m_runs * rng.uniform(0.8, 1.2), 2)
        
        # Bowling log
        m_wickets = rng.choices([0, 1, 2, 3, 4], weights=[25, 35, 25, 10, 5])[0] if (is_bowler or 'all-rounder' in player.get('role', '').lower()) else 0
        m_eco = round(rng.uniform(5.5, 9.5), 2)
        
        logs.append({
            'opponent': opp,
            'runs': m_runs,
            'balls': m_balls,
            'sr': m_sr,
            'avg': m_avg,
            'wickets': m_wickets,
            'economy': m_eco
        })
    return logs

def load_players() -> List[Dict]:
    global _PLAYERS_CACHE
    if _PLAYERS_CACHE is not None:
        return _PLAYERS_CACHE
    
    filepath = os.path.join(os.path.dirname(__file__), '..', 'data', 'players.json')
    with open(filepath, 'r') as f:
        raw_data = json.load(f)
        
    players = []
    for p in raw_data:
        if not p.get('name'):
            continue
            
        t20i = p.get('t20i', {}) or {}
        odi = p.get('odi', {}) or {}
        bowling = p.get('bowling', {}) or {}
        
        flat_p = p.copy()
        
        # Calculate balls faced if missing
        t20i_runs = t20i.get('runs', 0) or 0
        t20i_sr = t20i.get('sr', 130.0) or 130.0
        t20i_balls = t20i.get('balls_faced') or (int((t20i_runs / max(t20i_sr, 50.0)) * 100) if t20i_runs else 0)
        
        # Calculate realistic boundary %
        t20i_boundary_pct = t20i.get('boundary_pct')
        if not t20i_boundary_pct:
            # Power hitters / openers have 50-65% boundary percentage
            if t20i_sr >= 160:
                t20i_boundary_pct = round(58.0 + (t20i_sr - 160) * 0.15, 2)
            elif t20i_sr >= 140:
                t20i_boundary_pct = round(48.0 + (t20i_sr - 140) * 0.25, 2)
            else:
                t20i_boundary_pct = round(38.0 + max(t20i_sr - 100, 0) * 0.2, 2)
        
        t20i_enhanced = {
            **t20i,
            'balls_faced': t20i_balls,
            'boundary_pct': min(t20i_boundary_pct, 75.0)
        }
        flat_p['t20i'] = t20i_enhanced
        
        # Flatten stats
        flat_p['t20i_runs'] = t20i_runs
        flat_p['t20i_avg'] = t20i.get('avg', 0.0) or 0.0
        flat_p['t20i_sr'] = t20i_sr
        flat_p['t20i_fifties'] = t20i.get('fifties', 0) or 0
        flat_p['t20i_hundreds'] = t20i.get('hundreds', 0) or 0
        flat_p['t20i_balls_faced'] = t20i_balls
        flat_p['t20i_boundary_pct'] = flat_p['t20i']['boundary_pct']
        
        flat_p['odi_runs'] = odi.get('runs', 0) or 0
        flat_p['odi_avg'] = odi.get('avg', 0.0) or 0.0
        flat_p['odi_sr'] = odi.get('sr', 0.0) or 0.0
        
        flat_p['bowling_t20i_economy'] = bowling.get('t20i_economy', 0.0) or 0.0
        flat_p['bowling_odi_economy'] = bowling.get('odi_economy', 0.0) or 0.0
        flat_p['bowling_t20i_wickets'] = bowling.get('wickets_t20i', 0) or 0
        flat_p['bowling_odi_wickets'] = bowling.get('wickets_odi', 0) or 0
        
        flat_p['power_play_sr'] = p.get('power_play_sr', 0.0) or 0.0
        flat_p['death_over_sr'] = p.get('death_over_sr', 0.0) or 0.0
        flat_p['middle_overs_sr'] = p.get('middle_overs_sr', 0.0) or 0.0
        flat_p['overall_score'] = p.get('overall_score', 0) or 0
        flat_p['recent_form'] = p.get('recent_form', 0) or 0
        
        # Attach match breakdown logs
        flat_p['match_logs'] = generate_match_logs(flat_p)
        
        players.append(flat_p)
        
    _PLAYERS_CACHE = players
    return players

def load_dataframe() -> pd.DataFrame:
    global _DATAFRAME_CACHE
    if _DATAFRAME_CACHE is not None:
        return _DATAFRAME_CACHE
    
    players = load_players()
    df = pd.DataFrame(players)
    _DATAFRAME_CACHE = df
    return df

def get_player_by_id(player_id: str) -> Optional[Dict]:
    players = load_players()
    for p in players:
        if p['id'] == player_id:
            return p
    return None
