from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from engine.loader import load_players, get_player_by_id, load_tournaments

router = APIRouter(prefix="/players", tags=["Players"])

@router.get("/")
def list_players(format: Optional[str] = None):
    players = load_players()
    if format:
        players = [p for p in players if format.upper() in [f.upper() for f in p.get("formats", [])]]
    return players

@router.get("/tournaments")
def get_tournaments(tournament_type: Optional[str] = None):
    """Retrieve historical ICC World Cups, T20 World Cups, and Champions Trophy data (1975-2025)."""
    tournaments = load_tournaments()
    if tournament_type:
        tournaments = [t for t in tournaments if tournament_type.lower() in t.get('Tournament', '').lower()]
    return tournaments

@router.get("/hall-of-fame")
def get_hall_of_fame():
    """Retrieve EA FC Icon / World Cup Hero players and tournament legacy records."""
    players = load_players()
    tournaments = load_tournaments()
    
    icons = [p for p in players if p.get('card_tier') in ['ICON', 'HERO']]
    icons.sort(key=lambda x: x.get('ovr', 85), reverse=True)
    
    return {
        'total_tournaments': len(tournaments),
        'icons_count': len(icons),
        'top_icons': icons[:12],
        'tournaments': tournaments
    }

@router.get("/search/{query}")
def search_players(query: str):
    players = load_players()
    query = query.lower()
    return [p for p in players if query in p.get("name", "").lower()]

@router.get("/{player_id}")
def get_player(player_id: str):
    player = get_player_by_id(player_id)
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    return player
