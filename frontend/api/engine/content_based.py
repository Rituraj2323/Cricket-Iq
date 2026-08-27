from engine.loader import load_dataframe, load_players
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Dict

def get_similar_players(player_id: str, top_n: int = 6) -> List[Dict]:
    df = load_dataframe()
    if df.empty or player_id not in df['id'].values:
        return []
    
    features = [
        't20i_avg', 't20i_sr', 'odi_avg', 'odi_sr', 'overall_score', 
        'recent_form', 'power_play_sr', 'death_over_sr', 'middle_overs_sr'
    ]
    
    bowling_fields = ['bowling_t20i_economy', 'bowling_odi_economy', 'power_play_economy', 'death_over_economy']
    
    X = df[features + bowling_fields].fillna(0).copy()
    
    for col in bowling_fields:
        X[col] = X[col].apply(lambda x: 15 - x if x > 0 else 0)
        
    scaler = MinMaxScaler()
    X_scaled = scaler.fit_transform(X)
    
    sim_matrix = cosine_similarity(X_scaled)
    
    idx = df.index[df['id'] == player_id].tolist()[0]
    sim_scores = list(enumerate(sim_matrix[idx]))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    
    sim_scores = [s for s in sim_scores if s[0] != idx][:top_n]
    
    players = load_players()
    results = []
    for s in sim_scores:
        results.append({
            'player': players[s[0]],
            'similarity_score': float(s[1])
        })
        
    return results
