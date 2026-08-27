from engine.loader import load_players
from typing import List, Dict

ROLE_SPECIALTIES = {
    'batter':       ['anchor', 'opener', 'run_scorer', 'consistency', 'power_hitter', 'six_hitter', '360_player', 'run_chaser', 'pressure_performer'],
    'bowler':       ['death_bowler', 'death_specialist', 'yorker_specialist', 'powerplay_bowler', 'swing_bowler', 'new_ball_specialist', 'spinner', 'leg_spinner', 'off_spinner', 'left_arm_spinner', 'spin_ace'],
    'all-rounder':  ['allrounder', 'finisher', 'death_batsman', 'power_hitter'],
    'wicketkeeper': ['wicketkeeper', 'finisher'],
    'opener':       ['opener'],
    'anchor':       ['anchor', 'consistency', 'run_scorer'],
    'power_hitter': ['power_hitter', '360_player', 'six_hitter'],
    'finisher':     ['finisher', 'death_batsman'],
    'death_bowler': ['death_bowler', 'death_specialist', 'yorker_specialist'],
    'powerplay_bowler': ['powerplay_bowler', 'new_ball_specialist', 'swing_bowler'],
    'spinner':      ['spinner', 'leg_spinner', 'off_spinner', 'left_arm_spinner', 'spin_ace'],
    'allrounder':   ['allrounder'],
}

POSITION_TAGS = {
    'opener':       ['opener'],
    'middle_order': ['anchor', 'finisher', 'allrounder', 'run_chaser'],
    'finisher':     ['finisher', 'death_batsman', 'power_hitter'],
    'any':          [],
}

PRIORITY_WEIGHTS = {
    'recent_form':  {'role': 0.25, 'form': 0.35, 'perf': 0.20, 'req': 0.10, 'cons': 0.10},
    'strike_rate':  {'role': 0.25, 'form': 0.20, 'perf': 0.35, 'req': 0.10, 'cons': 0.10},
    'economy':      {'role': 0.25, 'form': 0.20, 'perf': 0.35, 'req': 0.10, 'cons': 0.10},
    'consistency':  {'role': 0.25, 'form': 0.20, 'perf': 0.15, 'req': 0.10, 'cons': 0.30},
    'match_up':     {'role': 0.30, 'form': 0.25, 'perf': 0.20, 'req': 0.15, 'cons': 0.10},
    'balanced':     {'role': 0.30, 'form': 0.25, 'perf': 0.20, 'req': 0.15, 'cons': 0.10},
}


def _role_match_score(player: Dict, role: str) -> float:
    target = ROLE_SPECIALTIES.get(role.lower(), [])
    if not target:
        return 50.0
    specialties = player.get('specialties', []) + player.get('tags', [])
    matches = sum(1 for s in specialties if s in target)
    role_str = player.get('role', '').lower()
    if role.lower() == 'wicketkeeper' and 'wicket' in role_str:
        matches += 3
    elif role.lower() in ('batter', 'batsman') and 'batsman' in role_str:
        matches += 2
    elif role.lower() == 'bowler' and 'bowler' in role_str:
        matches += 2
    elif role.lower() in ('all-rounder', 'allrounder') and 'all-rounder' in role_str:
        matches += 2
    return min(100.0, (matches / max(len(target), 1)) * 100 + matches * 10)


def _form_score(player: Dict) -> float:
    return float(player.get('recent_form', 50))


def _performance_score(player: Dict, fmt: str, role: str, priority: str) -> float:
    fmt_key = 't20i' if fmt.upper() in ('T20I', 'T20') else 'odi'
    stats = player.get(fmt_key, {})
    bowling = player.get('bowling', {})
    is_bowler = role.lower() == 'bowler' or player.get('role', '').lower() == 'bowler'
    is_ar = role.lower() in ('all-rounder', 'allrounder') or 'all-rounder' in player.get('role', '').lower()
    if is_bowler:
        eco = bowling.get('t20i_economy' if fmt_key == 't20i' else 'odi_economy', 8.0) or 8.0
        wkts = bowling.get('wickets_t20i' if fmt_key == 't20i' else 'wickets_odi', 0) or 0
        eco_score = max(0, (10.0 - eco) / 4.0) * 60
        wkt_score = min(40, wkts / 3.0)
        return min(100, eco_score + wkt_score)
    elif is_ar:
        avg = stats.get('avg', 25) or 25
        sr  = stats.get('sr', 130) or 130
        eco = bowling.get('t20i_economy' if fmt_key == 't20i' else 'odi_economy', 8.0) or 8.0
        bat_score = min(50, avg / 60 * 30 + (sr - 100) / 100 * 20)
        bowl_score = min(50, max(0, (10.0 - eco) / 4.0) * 50)
        return min(100, bat_score + bowl_score)
    else:
        avg = stats.get('avg', 25) or 25
        sr  = stats.get('sr', 130) or 130
        if priority == 'strike_rate':
            return min(100, (sr - 80) / 120 * 70 + avg / 60 * 30)
        return min(100, avg / 60 * 60 + (sr - 80) / 120 * 40)


def _requirement_score(player: Dict, fmt: str, pitch_type: str, conditions: str, batting_position: str) -> float:
    score = 0.0
    if fmt.upper() in [f.upper() for f in player.get('formats', [])]:
        score += 30.0
    if pitch_type and pitch_type in player.get('pitch_preference', []):
        score += 30.0
    if conditions and (conditions in player.get('conditions_preference', []) or 'all' in player.get('conditions_preference', [])):
        score += 20.0
    pos_tags = POSITION_TAGS.get(batting_position or 'any', [])
    if pos_tags:
        matches = sum(1 for t in pos_tags if t in player.get('specialties', []) + player.get('tags', []))
        score += min(20.0, matches * 10)
    else:
        score += 10.0
    return min(100.0, score)


def _consistency_score(player: Dict, fmt: str) -> float:
    fmt_key = 't20i' if fmt.upper() in ('T20I', 'T20') else 'odi'
    stats = player.get(fmt_key, {})
    fifties  = stats.get('fifties', 0) or 0
    hundreds = stats.get('hundreds', 0) or 0
    overall  = player.get('overall_score', 50) or 50
    milestone_score = min(50, fifties * 1.5 + hundreds * 5)
    return min(100.0, milestone_score + overall * 0.5)


def cric_select_score(player: Dict, role: str, fmt: str, batting_position: str = 'any',
                      priority: str = 'balanced', pitch_type: str = 'flat', conditions: str = 'all') -> Dict:
    """
    Recommendation Score = 30% Role Match + 25% Recent Form + 20% Performance
                         + 15% Requirements + 10% Consistency
    (weights shift based on priority)
    """
    w = PRIORITY_WEIGHTS.get(priority.lower(), PRIORITY_WEIGHTS['balanced'])
    role_s = _role_match_score(player, role)
    form_s = _form_score(player)
    perf_s = _performance_score(player, fmt, role, priority)
    req_s  = _requirement_score(player, fmt, pitch_type, conditions, batting_position)
    cons_s = _consistency_score(player, fmt)
    total = role_s * w['role'] + form_s * w['form'] + perf_s * w['perf'] + req_s * w['req'] + cons_s * w['cons']
    return {
        'total': round(total, 1),
        'breakdown': {
            'role_match':   round(role_s * w['role'], 1),
            'recent_form':  round(form_s * w['form'], 1),
            'performance':  round(perf_s * w['perf'], 1),
            'requirements': round(req_s  * w['req'],  1),
            'consistency':  round(cons_s * w['cons'], 1),
        },
        'raw': {
            'role_match':   round(role_s,  1),
            'recent_form':  round(form_s,  1),
            'performance':  round(perf_s,  1),
            'requirements': round(req_s,   1),
            'consistency':  round(cons_s,  1),
        },
        'weights': w,
    }


def get_cric_select_recommendations(role: str, fmt: str, batting_position: str = 'any',
                                    priority: str = 'balanced', pitch_type: str = 'flat',
                                    conditions: str = 'all', top_k: int = 5) -> List[Dict]:
    players = load_players()
    results = [{'player': p, 'score': cric_select_score(p, role, fmt, batting_position, priority, pitch_type, conditions)} for p in players]
    results.sort(key=lambda x: x['score']['total'], reverse=True)
    return results[:top_k]


def matchup_score(player: Dict, opponent: str, venue: str, fmt: str, role: str) -> Dict:
    OPPONENT_CONDITIONS = {
        'India': 'subcontinent', 'Pakistan': 'subcontinent', 'Sri Lanka': 'subcontinent',
        'Bangladesh': 'subcontinent', 'Afghanistan': 'subcontinent',
        'Australia': 'overseas', 'England': 'overseas', 'South Africa': 'overseas',
        'New Zealand': 'overseas', 'West Indies': 'overseas',
        'Zimbabwe': 'overseas', 'Ireland': 'overseas', 'USA': 'overseas',
    }
    conditions = OPPONENT_CONDITIONS.get(opponent, 'all')
    venue_lower = venue.lower()
    if any(k in venue_lower for k in ['chennai', 'kolkata', 'delhi', 'karachi', 'lahore', 'mirpur']):
        pitch_type = 'spinning'
    elif any(k in venue_lower for k in ["lord", 'edgbaston', 'oval', 'headingley', 'christchurch', 'cape town']):
        pitch_type = 'seaming'
    elif any(k in venue_lower for k in ['perth', 'johannesburg', 'auckland']):
        pitch_type = 'bouncy'
    else:
        pitch_type = 'flat'
    base = cric_select_score(player, role, fmt, 'any', 'match_up', pitch_type, conditions)
    cond_pref = player.get('conditions_preference', [])
    opp_bonus = 10.0 if conditions in cond_pref else (5.0 if 'all' in cond_pref else 0.0)
    matchup_total = min(100.0, base['total'] + opp_bonus)
    return {
        'total': round(matchup_total, 1),
        'breakdown': base['breakdown'],
        'raw': base['raw'],
        'venue_pitch': pitch_type,
        'inferred_conditions': conditions,
        'opponent_bonus': opp_bonus,
    }


def get_matchup_recommendations(opponent: str, venue: str, fmt: str, role: str, top_k: int = 5) -> List[Dict]:
    players = load_players()
    results = [{'player': p, 'matchup_score': matchup_score(p, opponent, venue, fmt, role)} for p in players]
    results.sort(key=lambda x: x['matchup_score']['total'], reverse=True)
    return results[:top_k]


# ---- LEGACY FUNCTIONS (kept for backward compat) ----
def score_player_for_context(player: Dict, fmt: str, pitch_type: str, conditions: str, required_roles: List[str]) -> float:
    score = float(player.get('overall_score', 0))
    score += (player.get('recent_form', 0) / 100.0) * 20.0
    if pitch_type in player.get('pitch_preference', []): score += 15.0
    if conditions in player.get('conditions_preference', []) or 'all' in player.get('conditions_preference', []): score += 10.0
    if fmt in player.get('formats', []): score += 5.0
    for role in required_roles:
        if role in player.get('specialties', []): score += 20.0
    return score


def build_team_xi(fmt: str, pitch_type: str, conditions: str) -> List[Dict]:
    players = load_players()
    scored = [{'player': p, 'context_score': score_player_for_context(p, fmt, pitch_type, conditions, []), 'team_role': ''} for p in players]
    scored.sort(key=lambda x: x['context_score'], reverse=True)
    team, selected = [], set()
    def pick(cond, label, n):
        cnt = 0
        for sp in scored:
            if cnt >= n: break
            if sp['player']['id'] not in selected and cond(sp['player']):
                sp['team_role'] = label; team.append(sp); selected.add(sp['player']['id']); cnt += 1
    pick(lambda p: p.get('role') == 'Wicket-keeper Batsman', 'Wicket-keeper Batsman', 1)
    pick(lambda p: 'opener' in p.get('specialties', []), 'Opener', 1)
    pick(lambda p: p.get('role') == 'Batsman', 'Batsman', 3)
    pick(lambda p: p.get('role') == 'All-rounder', 'All-rounder', 2)
    pick(lambda p: p.get('role') == 'Bowler', 'Bowler', 3)
    for sp in scored:
        if len(team) >= 11: break
        if sp['player']['id'] not in selected:
            sp['team_role'] = sp['player'].get('role', 'Player'); team.append(sp); selected.add(sp['player']['id'])
    return team


def get_top_by_role(role: str, fmt: str, top_n: int = 8) -> List[Dict]:
    target = ROLE_SPECIALTIES.get(role, [])
    players = load_players()
    scored = []
    for p in players:
        if fmt not in p.get('formats', []): continue
        matches = sum(1 for s in p.get('specialties', []) if s in target)
        score = float(p.get('overall_score', 0)) + float(p.get('recent_form', 0)) + matches * 20
        scored.append({'player': p, 'role_score': score})
    scored.sort(key=lambda x: x['role_score'], reverse=True)
    return scored[:top_n]
