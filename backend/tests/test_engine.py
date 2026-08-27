import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

def test_loader():
    from engine.loader import load_players
    players = load_players()
    assert len(players) > 0
    assert all(p.get('name') for p in players)

def test_similar():
    from engine.content_based import get_similar_players
    result = get_similar_players('virat_kohli', top_n=5)
    assert len(result) == 5
    assert all('player' in r and 'similarity_score' in r for r in result)

def test_team_builder():
    from engine.scorer import build_team_xi
    team = build_team_xi('T20I', 'flat', 'all')
    assert len(team) == 11

def test_role_finder():
    from engine.scorer import get_top_by_role
    result = get_top_by_role('spinner', 'T20I', 5)
    assert len(result) > 0
