# 🏏 CricketIQ — AI-Powered Cricket Player Recommendation System

> An intelligent recommendation engine that helps you find the perfect cricket player for any match condition, format, or playing role.

[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python)](https://python.org)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.5-F7931E?style=flat-square&logo=scikit-learn)](https://scikit-learn.org)

---

## 🎯 Problem Statement

Cricket team selection is a complex, multi-dimensional decision. Selectors, analysts, fantasy cricket players, and fans constantly need to answer questions like:

- *"Who is the best death bowler for a spinning pitch in the subcontinent?"*
- *"Who plays most similarly to MS Dhoni?"*
- *"Build me an ideal T20I XI for a flat pitch against Australia?"*

Existing tools like ESPN Cricinfo provide raw statistics but lack intelligent recommendation capability. **CricketIQ** bridges this gap with an AI-powered recommendation system that understands context, conditions, and player roles.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js 14)                    │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────────────┐ │
│  │   Home   │  │ Team Builder │  │  Similar Players      │ │
│  │   Page   │  │    Page      │  │  + Role Finder Pages  │ │
│  └──────────┘  └──────────────┘  └───────────────────────┘ │
│              Deployed on: Vercel                            │
└────────────────────────┬────────────────────────────────────┘
                         │ REST API (HTTPS)
┌────────────────────────▼────────────────────────────────────┐
│                   BACKEND (FastAPI + Python)                 │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │             Recommendation Engine                    │   │
│  │  ┌─────────────────┐    ┌──────────────────────────┐ │   │
│  │  │ Content-Based   │    │  Context-Aware Scorer    │ │   │
│  │  │ Filtering       │    │  (Team Builder)          │ │   │
│  │  │ (Cosine Sim)    │    │                          │ │   │
│  │  └────────┬────────┘    └──────────────────────────┘ │   │
│  │           │    ┌──────────────────┐                   │   │
│  │           └────│ Rule-Based       │                   │   │
│  │                │ Explainer Engine │                   │   │
│  │                └──────────────────┘                   │   │
│  └──────────────────────────────────────────────────────┘   │
│              Deployed on: Render / Railway                   │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                    DATA LAYER                                │
│  players.json — Curated stats of 45+ international players  │
│  In-memory pandas DataFrame (loaded at startup)             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧠 Recommendation Methodology

### 1. Content-Based Filtering (Similar Players)
Uses **cosine similarity** on normalized player feature vectors built from:

| Feature | Weight | Description |
|---|---|---|
| `t20i_avg` | 1.0 | T20I batting average |
| `t20i_sr` | 1.2 | T20I strike rate |
| `odi_avg` | 0.8 | ODI batting average |
| `overall_score` | 1.5 | Curated overall player rating |
| `recent_form` | 2.0 | Recent performance (most weighted) |
| `death_over_sr` | 1.2 | Strike rate in death overs |
| `bowling_economy` | 0.8 | Inverted: lower economy = higher score |

**Processing pipeline:**
1. Extract numeric features from player data
2. Apply MinMax normalization via `sklearn.preprocessing.MinMaxScaler`
3. Compute pairwise cosine similarity matrix
4. Return top-N players sorted by similarity

### 2. Context-Aware Scoring (Team Builder & Role Finder)
A weighted scoring formula that considers match context:

```
score = base_score
      + (recent_form / 100) × 20     # Recent form bonus
      + pitch_match_bonus (0 or 15)   # Pitch preference alignment
      + conditions_bonus (0 or 10)    # Conditions match
      + format_bonus (0 or 5)         # Format availability
      + specialty_bonus × matches     # Role specialty matches (+20 each)
```

**Team Builder** selects 11 players while enforcing role balance:
- Exactly 1 Wicket-keeper
- 3-5 Batsmen
- 2-4 All-rounders
- 3-5 Bowlers

### 3. Rule-Based Explanation Engine
Generates human-readable explanations using player stats and context:
> *"Jasprit Bumrah is recommended with a context score of 148/150. He excels in seaming conditions with a T20I economy of 6.22. His recent form score (95/100) and mastery of yorkers make him ideal for death-over situations."*

---

## 📦 Dataset

### Source
Manually curated dataset of **45+ elite international and IPL cricket players** based on publicly available career statistics from:
- ESPN Cricinfo (espncricinfo.com)
- Official ICC statistics
- IPL official records

### Player Features
Each player entry includes:

| Category | Fields |
|---|---|
| **Identity** | id, name, country, ipl_team, role, batting_style, bowling_style |
| **T20I Stats** | matches, runs, average, strike rate, fifties, hundreds |
| **ODI Stats** | matches, runs, average, strike rate, fifties, hundreds |
| **Bowling** | T20I economy, ODI economy, wickets per format |
| **Phase Stats** | power_play_sr, middle_overs_sr, death_over_sr |
| **Phase Bowling** | power_play_economy, middle_overs_economy, death_over_economy |
| **Context** | pitch_preference, conditions_preference, specialties, tags |
| **Scores** | overall_score (0-100), recent_form (0-100) |

### Limitations
- Static dataset (no real-time updates)
- ~45 players (top international + IPL stars only)
- Injury status not tracked
- Statistics accurate as of 2024 season

---

## 💻 Technologies Used

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | Next.js 14 (App Router) | React framework with SSR |
| **Styling** | Tailwind CSS | Utility-first CSS |
| **Language** | TypeScript | Type-safe frontend code |
| **Backend** | FastAPI (Python) | High-performance async API |
| **ML/Data** | scikit-learn | Cosine similarity + MinMaxScaler |
| **Data Processing** | pandas, numpy | DataFrame operations |
| **Server** | Uvicorn | ASGI server for FastAPI |
| **Deployment** | Vercel + Render | Frontend + backend hosting |

---

## 🚀 Quick Start (Local Setup)

### Prerequisites
- Python 3.11+
- Node.js 18+
- npm or yarn

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Backend runs at: http://localhost:8000
API Docs: http://localhost:8000/docs

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: http://localhost:3000

---

## 📡 API Reference

### Players

| Method | Endpoint | Description |
|---|---|---|
| GET | `/players` | List all players (optional `?format=T20I`) |
| GET | `/players/{id}` | Get player by ID |
| GET | `/players/search/{query}` | Search players by name |

### Recommendations

| Method | Endpoint | Body | Description |
|---|---|---|---|
| POST | `/recommend/similar` | `{player_id, top_n}` | Find similar players |
| POST | `/recommend/team` | `{format, pitch_type, conditions}` | Build team XI |
| POST | `/recommend/role` | `{role, format, top_n}` | Find players by role |

---

## 🧪 Test Cases

### ✅ Successful Scenarios

#### Test 1: T20I Team on Flat Pitch
```json
POST /recommend/team
{
  "format": "T20I",
  "pitch_type": "flat",
  "conditions": "subcontinent"
}
```
**Expected**: Team with Kohli/Rohit as openers, SKY in middle order, Bumrah/Rashid as bowlers  
**Result**: ✅ Recommends batting-heavy team with spin options for subcontinent

---

#### Test 2: Similar Players to MS Dhoni
```json
POST /recommend/similar
{
  "player_id": "ms_dhoni",
  "top_n": 5
}
```
**Expected**: Wicket-keeper batsmen with finishing ability (KL Rahul, Sanju Samson, Rishabh Pant)  
**Result**: ✅ Returns WK-batsmen with similar death-over profiles

---

#### Test 3: Death Bowler Role Finder
```json
POST /recommend/role
{
  "role": "death_bowler",
  "format": "T20I",
  "top_n": 5
}
```
**Expected**: Bumrah #1, Hardik Pandya/Boult in top picks  
**Result**: ✅ Bumrah tops list followed by Starc, Cummins

---

#### Test 4: ODI Team for Seaming Conditions
```json
POST /recommend/team
{
  "format": "ODI",
  "pitch_type": "seaming",
  "conditions": "overseas"
}
```
**Expected**: More pace bowlers, batsmen comfortable in overseas conditions  
**Result**: ✅ System weights Shami/Bumrah/Starc higher for seaming conditions

---

### ❌ Known Failure Scenarios

#### Failure 1: Emerging Player (Data Sparsity)
**Scenario**: Search for Tilak Varma or Rinku Singh  
**Problem**: Not in dataset → system returns 404  
**Limitation**: Static dataset limited to ~45 established players

#### Failure 2: Injury-Affected Recommendations
**Scenario**: Hardik Pandya recommended despite bowling restrictions  
**Problem**: No injury tracker → system uses last-known stats  
**Limitation**: Real-time injury data not integrated

#### Failure 3: Head-to-Head Specific Recommendations
**Scenario**: "Best batsman vs Shaheen Afridi specifically"  
**Problem**: Head-to-head data not in current dataset  
**Limitation**: Would require ball-by-ball data from cricsheet.org

#### Failure 4: Non-cricket contexts
**Scenario**: Recommending players for conditions they've never played in  
**Problem**: Some players have limited overseas data  
**Limitation**: Conditions preference is manually curated, not computed

---

## 📊 Evaluation Metrics

| Metric | Method | Target |
|---|---|---|
| **Cosine Similarity Quality** | Verify similar players make cricketing sense | >0.7 similarity for obvious pairs (Kohli-Gill) |
| **Team Role Balance** | Check XI always has 1 WK, bowlers, batsmen | 100% compliance |
| **Role Finder Precision** | Top-3 results match expected role | >80% |
| **API Latency** | Response time for all endpoints | <300ms |
| **Coverage** | % of dataset surfaced | 100% reachable via search |

---

## 🏏 Comparison with Existing Products

### vs. ESPN Cricinfo
| Dimension | ESPN Cricinfo | CricketIQ |
|---|---|---|
| Data Richness | ⭐⭐⭐⭐⭐ Comprehensive historical data | ⭐⭐⭐ Curated key players |
| Recommendation | ❌ None | ✅ AI-powered |
| Context Awareness | ❌ Raw stats only | ✅ Pitch/conditions/role-aware |
| Explanations | ❌ None | ✅ Human-readable AI explanations |
| Real-time Updates | ✅ Live match data | ❌ Static dataset |

### vs. Dream11 (Fantasy App)
| Dimension | Dream11 | CricketIQ |
|---|---|---|
| Recommendation | ✅ Match-specific picks | ✅ Condition-aware recommendations |
| Transparency | ❌ Black box | ✅ Full explanation for each pick |
| Similarity Search | ❌ Not available | ✅ Find similar players |
| Role Analysis | ❌ Limited | ✅ 9 distinct roles analyzed |
| Data | ✅ Real-time | ❌ Static |

---

## 🔮 Future Improvements

1. **Real-time Data Integration**: Connect to Cricsheet.org or Cricbuzz API for live stats
2. **Collaborative Filtering**: "Users who picked Kohli also picked..." based on user sessions
3. **Head-to-Head Analysis**: Batsman vs bowler specific recommendations
4. **Pitch Report API**: Auto-detect pitch conditions from match metadata
5. **IPL Auction Mode**: Recommend players within a budget constraint
6. **LLM Integration**: Connect Gemini/GPT for richer natural language explanations
7. **Player Trajectory**: Track player form over time with time-series analysis
8. **Team Chemistry**: Factor in batting partnerships and bowling combinations
9. **Opposition Analysis**: "Best team against Pakistan's current bowling attack"
10. **Expanded Dataset**: Scale to 500+ players using Kaggle/cricsheet data

---

## ⚙️ Key Design Decisions

1. **Static JSON over Database**: Simplifies deployment, no DB setup required for evaluators
2. **Content-based over Collaborative**: No user interaction data available; content-based works standalone
3. **Rule-based Explanations over LLM**: No API key dependency; works offline; deterministic
4. **Balanced Team Selection**: Hard constraints ensure realistic XI (1 WK minimum, etc.)
5. **MinMaxScaler over StandardScaler**: Cricket stats have natural boundaries; MinMax preserves them
6. **FastAPI over Django/Flask**: Best async performance for ML APIs; automatic OpenAPI docs

---

## 📁 Project Structure

```
cricket-recommender/
├── backend/
│   ├── main.py                  # FastAPI app entry point
│   ├── requirements.txt         # Python dependencies
│   ├── engine/
│   │   ├── loader.py            # Data loading + preprocessing
│   │   ├── content_based.py     # Cosine similarity engine
│   │   ├── scorer.py            # Context-aware scoring
│   │   └── explainer.py         # Explanation generator
│   ├── routers/
│   │   ├── players.py           # Player CRUD endpoints
│   │   └── recommend.py         # Recommendation endpoints
│   ├── data/
│   │   └── players.json         # Player dataset
│   └── tests/
│       └── test_engine.py       # Unit tests
│
├── frontend/
│   ├── app/
│   │   ├── layout.tsx           # Root layout (navbar + footer)
│   │   ├── page.tsx             # Home page
│   │   ├── team-builder/        # Team Builder page
│   │   ├── similar-players/     # Similar Players page
│   │   ├── role-finder/         # Role Finder page
│   │   └── player/[id]/         # Player Profile page
│   ├── components/
│   │   ├── PlayerCard.tsx       # Reusable player card
│   │   ├── ScoreBar.tsx         # Progress bar component
│   │   └── LoadingSpinner.tsx   # Loading state
│   └── lib/
│       ├── api.ts               # API client
│       └── types.ts             # TypeScript interfaces
│
├── README.md                    # This file
└── docker-compose.yml           # Local dev setup
```

---

## 🧑‍💻 Author

CricketIQ — AI-Powered Cricket Player Recommendation Engine.
