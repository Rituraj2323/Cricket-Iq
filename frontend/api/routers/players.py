from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from engine.loader import load_players, get_player_by_id

router = APIRouter(prefix="/players", tags=["Players"])

@router.get("/")
def list_players(format: Optional[str] = None):
    players = load_players()
    if format:
        players = [p for p in players if format.upper() in [f.upper() for f in p.get("formats", [])]]
    return players

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
