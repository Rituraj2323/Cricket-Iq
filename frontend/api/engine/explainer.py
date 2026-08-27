from typing import Dict

def explain_team_pick(player: Dict, context_score: float, fmt: str, pitch_type: str, conditions: str) -> str:
    name = player.get('name', 'Player')
    avg = player.get(f'{fmt.lower()}_avg', player.get('t20i_avg', 0))
    sr = player.get(f'{fmt.lower()}_sr', player.get('t20i_sr', 0))
    recent_form = player.get('recent_form', 0)
    
    specialties = ', '.join(player.get('specialties', [])[:2])
    if not specialties:
        specialties = "versatile skillset"
        
    return f"{name} is recommended with a context score of {context_score:.1f}. They excel on {pitch_type} pitches, featuring a solid average of {avg} and strike rate of {sr}. Their recent form score ({recent_form}/100) and specialties ({specialties}) make them ideal for these {conditions} conditions."

def explain_similar(player: Dict, reference: Dict, similarity: float) -> str:
    name = player.get('name', 'Player')
    ref_name = reference.get('name', 'Player')
    match_pct = int(similarity * 100)
    
    bat_style = player.get('batting_style', 'batsman')
    p_avg = player.get('t20i_avg', 0)
    r_avg = reference.get('t20i_avg', 0)
    
    return f"{name} ({match_pct}% match) is similar to {ref_name} — both are {bat_style}s with comparable T20I averages ({p_avg} vs {r_avg}), sharing similar playstyles and pitch preferences."

def explain_role_pick(player: Dict, role: str, score: float) -> str:
    name = player.get('name', 'Player')
    econ = player.get('bowling_t20i_economy', 0)
    sr = player.get('t20i_sr', 0)
    
    if 'bowler' in role.lower() or 'spinner' in role.lower():
        stat_str = f"economy of {econ} in T20Is"
    else:
        stat_str = f"strike rate of {sr} in T20Is"
        
    return f"{name} is a top pick for the {role.replace('_', ' ').title()} role with a score of {score:.1f}. Their {stat_str} makes them highly reliable for this position."
