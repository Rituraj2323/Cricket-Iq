from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from engine.loader import get_player_by_id
from engine.content_based import get_similar_players
from engine.scorer import (build_team_xi, get_top_by_role,
                           get_cric_select_recommendations, get_matchup_recommendations)
from engine.explainer import explain_similar, explain_team_pick, explain_role_pick

router = APIRouter(prefix="/recommend", tags=["Recommendations"])

class SimilarRequest(BaseModel):
    player_id: str
    top_n: int = 6

class TeamRequest(BaseModel):
    format: str = 'T20I'
    pitch_type: str = 'flat'
    conditions: str = 'all'

class RoleRequest(BaseModel):
    role: str
    format: str = 'T20I'
    top_n: int = 8

class CricSelectRequest(BaseModel):
    role: str = 'batter'
    format: str = 'T20I'
    batting_position: str = 'any'
    priority: str = 'balanced'
    pitch_type: str = 'flat'
    conditions: str = 'all'
    top_k: int = 5

class MatchupRequest(BaseModel):
    format: str = 'T20I'
    role: str = 'bowler'
    opponent: str = 'Australia'
    venue: str = 'any'
    top_k: int = 5

@router.post("/similar")
def similar_players(req: SimilarRequest):
    ref_player = get_player_by_id(req.player_id)
    if not ref_player:
        raise HTTPException(status_code=404, detail="Player not found")
    similar = get_similar_players(req.player_id, req.top_n)
    for sim in similar:
        sim['explanation'] = explain_similar(sim['player'], ref_player, sim['similarity_score'])
    return similar

@router.post("/team")
def recommend_team(req: TeamRequest):
    team = build_team_xi(req.format, req.pitch_type, req.conditions)
    for t in team:
        t['explanation'] = explain_team_pick(t['player'], t['context_score'], req.format, req.pitch_type, req.conditions)
    return team

@router.post("/role")
def top_by_role(req: RoleRequest):
    results = get_top_by_role(req.role, req.format, req.top_n)
    out = []
    for r in results:
        expl = explain_role_pick(r['player'], req.role, r['role_score'])
        out.append({'player': r['player'], 'role_score': r['role_score'], 'explanation': expl})
    return out

@router.post("/cric-select")
def cric_select(req: CricSelectRequest):
    results = get_cric_select_recommendations(
        role=req.role, fmt=req.format, batting_position=req.batting_position,
        priority=req.priority, pitch_type=req.pitch_type, conditions=req.conditions, top_k=req.top_k,
    )
    out = []
    for i, r in enumerate(results):
        p = r['player']
        sc = r['score']
        w = sc['weights']
        raw = sc['raw']
        bd = sc['breakdown']
        reasons = []
        if raw['role_match'] >= 60:
            reasons.append(f"Strong role alignment ({raw['role_match']:.0f}/100)")
        if raw['recent_form'] >= 75:
            reasons.append(f"Excellent recent form ({raw['recent_form']:.0f}/100)")
        if raw['performance'] >= 70:
            reasons.append(f"High {req.priority.replace('_', ' ')} performance ({raw['performance']:.0f}/100)")
        if raw['requirements'] >= 70:
            reasons.append(f"Matches match requirements ({raw['requirements']:.0f}/100)")
        if raw['consistency'] >= 70:
            reasons.append(f"Consistent performer ({raw['consistency']:.0f}/100)")
        if not reasons:
            reasons.append(f"Overall score {sc['total']:.0f}/100")
        breakdown_str = (
            f"Role {bd['role_match']:.1f}/{w['role']*100:.0f} + "
            f"Form {bd['recent_form']:.1f}/{w['form']*100:.0f} + "
            f"Perf {bd['performance']:.1f}/{w['perf']*100:.0f} + "
            f"Req {bd['requirements']:.1f}/{w['req']*100:.0f} + "
            f"Cons {bd['consistency']:.1f}/{w['cons']*100:.0f} = {sc['total']:.1f}/100"
        )
        out.append({
            'rank': i + 1,
            'player': p,
            'score': sc['total'],
            'score_pct': f"{sc['total']:.0f}%",
            'breakdown': sc['breakdown'],
            'raw_scores': sc['raw'],
            'why': reasons,
            'breakdown_str': breakdown_str,
        })
    return out

@router.post("/matchup")
def matchup_recommend(req: MatchupRequest):
    results = get_matchup_recommendations(
        opponent=req.opponent, venue=req.venue, fmt=req.format, role=req.role, top_k=req.top_k
    )
    out = []
    for i, r in enumerate(results):
        p = r['player']
        ms = r['matchup_score']
        raw = ms['raw']
        reasons = [f"Venue pitch: {ms['venue_pitch']} · conditions: {ms['inferred_conditions']}"]
        if raw['role_match'] >= 60:
            reasons.append(f"Strong role match ({raw['role_match']:.0f}/100)")
        if raw['recent_form'] >= 75:
            reasons.append(f"Excellent recent form ({raw['recent_form']:.0f}/100)")
        if raw['performance'] >= 70:
            reasons.append(f"Top {req.format} performance ({raw['performance']:.0f}/100)")
        if ms['opponent_bonus'] > 0:
            reasons.append(f"Good record in {ms['inferred_conditions']} conditions vs {req.opponent}")
        out.append({
            'rank': i + 1,
            'player': p,
            'score': ms['total'],
            'score_pct': f"{ms['total']:.0f}%",
            'raw_scores': raw,
            'why': reasons,
            'venue_pitch': ms['venue_pitch'],
            'inferred_conditions': ms['inferred_conditions'],
        })
    return out

class ChatRequest(BaseModel):
    message: str

@router.post("/chat")
def chat_recommend(req: ChatRequest):
    from engine.chat_engine import generate_chat_response
    return generate_chat_response(req.message)
