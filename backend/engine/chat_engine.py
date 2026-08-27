import os
import json
import re
from typing import Dict, List, Optional
import google.generativeai as genai

from engine.scorer import get_matchup_recommendations, get_cric_select_recommendations, matchup_score
from engine.loader import load_players, get_player_by_id

# Configure Gemini with API key if present in environment
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
gemini_model = None

if GEMINI_API_KEY:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        gemini_model = genai.GenerativeModel('gemini-1.5-flash')
    except Exception as e:
        print(f"Warning: Gemini config error: {e}")

OPPONENTS = [
    'Australia', 'England', 'Pakistan', 'South Africa', 'New Zealand',
    'West Indies', 'Sri Lanka', 'Bangladesh', 'Afghanistan', 'India', 'Zimbabwe', 'USA', 'Ireland', 'Netherlands'
]

VENUES = [
    'Ahmedabad', 'Mumbai', 'Chennai', 'Kolkata', 'Delhi', 'Bengaluru', 'Hyderabad',
    "Lord's", 'Edgbaston', 'The Oval', 'Headingley', 'Old Trafford',
    'MCG', 'SCG', 'Perth', 'Adelaide', 'Brisbane', 'Gabba',
    'Johannesburg', 'Cape Town', 'Durban', 'Centurion',
    'Lahore', 'Karachi', 'Rawalpindi',
    'Christchurch', 'Auckland', 'Wellington', 'Bridgetown'
]

def find_mentioned_players(text: str, all_players: List[Dict]) -> List[Dict]:
    """Robust player entity extractor handling full names, first names, last names, and common cricket nicknames."""
    lower = text.lower()
    matched = []
    
    # Common nicknames dictionary
    NICKNAMES = {
        'king kohli': 'virat_kohli',
        'hitman': 'rohit_sharma',
        'thala': 'ms_dhoni',
        'msd': 'ms_dhoni',
        'boom boom': 'jasprit_bumrah',
        'sky': 'suryakumar_yadav',
        'jos the boss': 'jos_buttler',
        'lord': 'shardul_thakur',
        'bapu': 'axar_patel',
        'jaddu': 'ravindra_jadeja',
    }
    
    for nick, pid in NICKNAMES.items():
        if re.search(r'\b' + re.escape(nick) + r'\b', lower):
            p = get_player_by_id(pid)
            if p and p['id'] not in [x['id'] for x in matched]:
                matched.append(p)
                
    # 1. Full name match
    for p in all_players:
        if p['name'].lower() in lower:
            if p['id'] not in [x['id'] for x in matched]:
                matched.append(p)
                
    # 2. Individual name parts (e.g. 'starc', 'bumrah', 'kohli', 'rohit', 'cummins', 'rashid')
    for p in all_players:
        parts = p['name'].lower().split()
        for part in parts:
            if len(part) >= 4 and re.search(r'\b' + re.escape(part) + r'\b', lower):
                if p['id'] not in [x['id'] for x in matched]:
                    matched.append(p)
                    
    return matched

def answer_with_gemini(query_text: str, all_players: List[Dict]) -> Optional[Dict]:
    """Generates direct, highly accurate LLM responses for ANY arbitrary cricket query."""
    if not gemini_model:
        return None
        
    try:
        players_context = "\n".join([
            f"- {p['name']} ({p['country']}, {p['role']}, Form: {p.get('recent_form')}/100, T20 Avg: {p.get('t20i',{}).get('avg')}, T20 SR: {p.get('t20i',{}).get('sr')}, Eco: {p.get('bowling',{}).get('t20i_economy')}, Wkts: {p.get('bowling',{}).get('wickets_t20i')}, Specialties: {','.join(p.get('specialties',[]))})"
            for p in all_players[:60]
        ])
        
        prompt = f"""
        You are CricketIQ AI, an elite cricket analyst and statistician.
        Answer the user's cricket question accurately, clearly, and insightfully.
        
        Player database context:
        {players_context}
        
        User's Cricket Question: "{query_text}"
        
        Return ONLY a JSON response formatted as:
        {{
            "heading": "Clear 1-line title summarizing the question",
            "direct_explanation": "Detailed 2-3 paragraph answer explaining the tactics, stats, history, or strategy directly answering their question.",
            "recommended_player_names": ["Name 1", "Name 2"], // 1 to 4 relevant player names from dataset that best match the query
            "verdict": "Concisely state the key takeaway or strategic verdict."
        }}
        """
        response = gemini_model.generate_content(prompt)
        cleaned = response.text.strip().replace('```json', '').replace('```', '').strip()
        data = json.loads(cleaned)
        
        rec_names = [n.lower() for n in data.get('recommended_player_names', [])]
        matched_cards = []
        
        for name in rec_names:
            for p in all_players:
                if name in p['name'].lower() or p['name'].lower() in name:
                    if p['id'] not in [x['id'] for x in matched_cards]:
                        stats = p.get('t20i', {})
                        bowling = p.get('bowling', {})
                        is_bowler = 'bowler' in p.get('role', '').lower()
                        
                        reasons = []
                        if is_bowler:
                            reasons.append(f"T20 Economy: {bowling.get('t20i_economy', 7.5):.2f}")
                            reasons.append(f"Key specialty: {', '.join(p.get('specialties', ['Bowling specialist'])[:2])}")
                        else:
                            reasons.append(f"T20 Avg: {stats.get('avg', 35):.1f} | Strike Rate: {stats.get('sr', 135):.1f}")
                            reasons.append(f"Specialty: {', '.join(p.get('specialties', ['Run accumulator'])[:2])}")
                        reasons.append(f"Form & Reliability Rating: {p.get('recent_form', 80)}/100")
                        
                        matched_cards.append({
                            'rank': len(matched_cards) + 1,
                            'id': p['id'],
                            'name': p['name'],
                            'country': p['country'],
                            'role': p['role'],
                            'score_pct': f"{p.get('overall_score', 88)}%",
                            'stats': {
                                'avg': stats.get('avg', 0),
                                'sr': stats.get('sr', 0),
                                'economy': bowling.get('t20i_economy'),
                                'form': p.get('recent_form', 80)
                            },
                            'why': reasons
                        })
                        break
                        
        return {
            'query_params': {'format': 'General Cricket Knowledge', 'original_query': query_text},
            'intro': f"🏏 **{data.get('heading', 'Cricket Strategic Analysis')}**\n\n{data.get('direct_explanation', '')}",
            'recommendations': matched_cards,
            'conclusion': f"💡 **Tactical Verdict:** {data.get('verdict', '')}"
        }
    except Exception as e:
        print(f"Gemini response error: {e}")
        return None

def answer_general_cricket_heuristics(query_text: str, all_players: List[Dict]) -> Dict:
    """Universal deterministic cricket brain answering any query with highest statistical stability."""
    lower = query_text.lower()
    
    # ── CASE 1: DIRECT PLAYER COMPARISONS (e.g. 'starc or bumrah', 'kohli vs rohit', 'who is better: maxwell or jadeja') ──
    mentioned = find_mentioned_players(query_text, all_players)
    if len(mentioned) >= 2 or (len(mentioned) == 1 and any(k in lower for k in ['or', 'vs', 'against', 'better', 'pick', 'compare'])):
        opponent = next((o for o in OPPONENTS if o.lower() in lower), 'Australia')
        fmt = 'ODI' if 'odi' in lower else ('Test' if 'test' in lower else 'T20I')
        pitch_context = "Flat Track" if "flat" in lower else ("Green / Seaming" if any(k in lower for k in ["green", "seam", "swing"]) else ("Turning Track" if any(k in lower for k in ["spin", "turn", "dust"]) else "General Conditions"))
        
        scored = []
        for p in mentioned:
            p_role = p.get('role', 'batter').lower()
            is_bowler = 'bowler' in p_role
            m = matchup_score(p, opponent=opponent, venue='any', fmt=fmt, role=p_role)
            stats = p.get('t20i' if fmt == 'T20I' else 'odi', {})
            bowling = p.get('bowling', {})
            
            reasons = []
            if is_bowler:
                eco = bowling.get('t20i_economy', 7.5) or 7.5
                reasons.append(f"Exceptional economy rate of {eco:.2f} in {fmt}")
                reasons.append(f"Lethal yorker and control in {pitch_context.lower()}")
                reasons.append(f"Recent Form Index: {p.get('recent_form', 85)}/100")
            else:
                reasons.append(f"Career average of {stats.get('avg', 0):.1f} in {fmt}")
                reasons.append(f"Strike rate: {stats.get('sr', 0):.1f}")
                reasons.append(f"Recent Form Index: {p.get('recent_form', 80)}/100")
                
            scored.append({
                'id': p['id'],
                'name': p['name'],
                'country': p['country'],
                'role': p['role'],
                'score': m['total'],
                'score_pct': f"{m['total']:.0f}%",
                'stats': {
                    'avg': stats.get('avg', 0),
                    'sr': stats.get('sr', 0),
                    'economy': bowling.get('t20i_economy'),
                    'form': p.get('recent_form', 80),
                },
                'why': reasons
            })
            
        scored.sort(key=lambda x: x['score'], reverse=True)
        for i, c in enumerate(scored): c['rank'] = i + 1
        
        p1 = scored[0]
        p2 = scored[1] if len(scored) > 1 else None
        
        if p2:
            verdict = f"💡 **Direct Verdict:** In **{pitch_context}** against **{opponent}**, **{p1['name']}** ({p1['score_pct']}) is the superior selection over **{p2['name']}** ({p2['score_pct']}) due to better control, consistency, and higher recent form ({p1['stats']['form']}/100)."
        else:
            verdict = f"💡 **Tactical Analysis:** **{p1['name']}** holds a high {p1['score_pct']} tactical efficiency rating in {pitch_context}."
            
        return {
            'query_params': {'format': fmt, 'role': 'Direct Comparison', 'opponent': opponent},
            'intro': f"⚔️ **Head-to-Head Comparison ({pitch_context})**\nEvaluating: " + " vs ".join([f"**{p['name']}**" for p in scored]),
            'recommendations': scored,
            'conclusion': verdict
        }

    # ── CASE 2: SPECIFIC SKILLS & POSITION QUERIES ──
    role = 'batter'
    if any(k in lower for k in ['all-rounder', 'allrounder', 'all rounder', 'all round']): role = 'all-rounder'
    elif any(k in lower for k in ['wicketkeeper', 'wicket-keeper', 'keeper', 'wk', 'glove']): role = 'wicketkeeper'
    elif any(k in lower for k in ['bowler', 'bowling', 'spinner', 'fast bowler', 'pacer', 'seamer', 'death bowler', 'wicket taker', 'yorker']): role = 'bowler'
    
    pos = 'any'
    if any(k in lower for k in ['middle order', 'middle-order', '#4', '#5', '#6', 'no 4', 'no 5', 'no 6']): pos = 'middle_order'
    elif any(k in lower for k in ['opener', 'opening', 'top order', '#1', '#2', '#3', 'no 1', 'no 2', 'no 3', 'new ball bat']): pos = 'opener'
    elif any(k in lower for k in ['finisher', 'death overs', 'late overs', 'slog', 'last 5 overs']): pos = 'finisher'
    
    priority = 'consistency' if any(k in lower for k in ['rely', 'reliable', 'consistent', 'anchor', 'dependable', 'stability']) else ('strike_rate' if any(k in lower for k in ['fast', 'aggressive', 'strike rate', 'sr', 'power', 'boundary', 'sixes']) else ('economy' if any(k in lower for k in ['economy', 'dot balls', 'tight', 'choke']) else 'balanced'))
    fmt = 'ODI' if 'odi' in lower or '50 over' in lower else ('Test' if 'test' in lower or 'red ball' in lower else 'T20I')
    
    # Check if Opponent / Venue is specified
    opp_match = next((o for o in OPPONENTS if o.lower() in lower), None)
    ven_match = next((v for v in VENUES if v.lower() in lower), None)
    
    if opp_match or ven_match:
        opp = opp_match or 'Australia'
        ven = ven_match or 'Ahmedabad'
        raw = get_matchup_recommendations(opponent=opp, venue=ven, fmt=fmt, role=role, top_k=4)
        recs = []
        for i, r in enumerate(raw):
            p = r['player']
            ms = r['matchup_score']
            recs.append({
                'rank': i + 1, 'id': p['id'], 'name': p['name'], 'country': p['country'], 'role': p['role'],
                'score_pct': f"{ms['total']:.0f}%",
                'stats': {'avg': p.get('t20i',{}).get('avg',0), 'sr': p.get('t20i',{}).get('sr',0), 'economy': p.get('bowling',{}).get('t20i_economy') if p.get('bowling') else None, 'form': p.get('recent_form',80)},
                'why': [f"Pitch Match: {ms['venue_pitch'].capitalize()} pitch compatibility", f"Efficiency in {ms['inferred_conditions']} conditions vs {opp}", f"Form: {p.get('recent_form',80)}/100"]
            })
        top_name = recs[0]['name'] if recs else 'Top pick'
        return {
            'query_params': {'format': fmt, 'role': role, 'opponent': opp, 'venue': ven},
            'intro': f"🎯 **Tactical Match Analysis for {fmt} Match**\n📍 **Venue:** {ven} | 🆚 **Opponent:** {opp} | 🔍 **Requirement:** {role.capitalize()}",
            'recommendations': recs,
            'conclusion': f"💡 **Strategic Recommendation:** Against **{opp}** at **{ven}**, **{top_name}** ({recs[0]['score_pct']}) is the most reliable tactical selection."
        }
    
    # ── CASE 3: GENERAL QUERY (e.g. 'whom should I rely for middle order', 'best finisher in t20', 'who has highest strike rate') ──
    raw = get_cric_select_recommendations(role=role, fmt=fmt, batting_position=pos, priority=priority, pitch_type='flat', conditions='all', top_k=4)
    pos_str = f" ({pos.replace('_',' ').capitalize()})" if pos != 'any' else ""
    intro = f"🏏 **Top Recommended {fmt} {role.capitalize()}{pos_str}**\nFiltered for: **{priority.replace('_',' ').capitalize()}** & **Pressure Conversion**"
    
    recs = []
    for i, r in enumerate(raw):
        p = r['player']
        sc = r['score']
        reasons = []
        if priority == 'consistency':
            reasons.append(f"High consistency index (Career Avg: {p.get('t20i',{}).get('avg',35):.1f}, Rating: {p.get('overall_score',85)})")
            reasons.append(f"Anchor capability with proven strike-rotation under pressure")
        elif priority == 'strike_rate':
            reasons.append(f"Boundary striking powerhouse (SR: {p.get('t20i',{}).get('sr',140):.1f})")
            reasons.append(f"High death/middle overs boundary conversion")
        elif priority == 'economy':
            eco = p.get('bowling',{}).get('t20i_economy', 7.2) or 7.2
            reasons.append(f"Tight economy rate of {eco:.2f} under pressure")
            reasons.append(f"High dot-ball percentage in crunch overs")
        else:
            reasons.append(f"Top overall statistical rating ({sc['total']:.0f}% compatibility)")
            reasons.append(f"Proven match-winner across global {fmt} leagues")
        reasons.append(f"Current Form: {p.get('recent_form',80)}/100")
        
        recs.append({
            'rank': i + 1, 'id': p['id'], 'name': p['name'], 'country': p['country'], 'role': p['role'],
            'score_pct': f"{sc['total']:.0f}%",
            'stats': {'avg': p.get('t20i',{}).get('avg',0), 'sr': p.get('t20i',{}).get('sr',0), 'economy': p.get('bowling',{}).get('t20i_economy') if p.get('bowling') else None, 'form': p.get('recent_form',80)},
            'why': reasons
        })
        
    top_name = recs[0]['name'] if recs else 'Top pick'
    return {
        'query_params': {'format': fmt, 'role': role},
        'intro': intro,
        'recommendations': recs,
        'conclusion': f"💡 **Analyst Insight:** **{top_name}** represents the most dependable option for this role with the highest statistical stability."
    }

def generate_chat_response(query_text: str) -> Dict:
    all_players = load_players()
    
    # 1. First try Gemini if active
    gemini_resp = answer_with_gemini(query_text, all_players)
    if gemini_resp:
        return gemini_resp
        
    # 2. Universal deterministic fallback engine
    return answer_general_cricket_heuristics(query_text, all_players)
