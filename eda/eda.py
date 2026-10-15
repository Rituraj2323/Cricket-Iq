"""Exploratory data analysis for CricketIQ.

Datasets analysed (all under frontend/lib/data):
  icc_all_players.json - every men's player at an ODI WC / T20 WC / Champions Trophy
  players.json         - curated 104-player profile set used by the recommender
  tournaments.json     - 31 ICC tournament editions

Run:  python3 eda/eda.py      ->  figures in eda/figures, summary in eda/summary.json
"""
import json, os
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "frontend", "lib", "data")
FIG = os.path.join(ROOT, "eda", "figures")
os.makedirs(FIG, exist_ok=True)
sns.set_theme(style="whitegrid", context="notebook")
plt.rcParams.update({"figure.dpi": 130, "axes.titleweight": "bold", "savefig.bbox": "tight"})
EV = {"odi": "ODI World Cup", "t20": "T20 World Cup", "ct": "Champions Trophy"}
S = {}

def save(name):
    plt.savefig(os.path.join(FIG, name)); plt.close()

# ---------- load ----------
raw = json.load(open(os.path.join(DATA, "icc_all_players.json")))
rows = []
for p in raw:
    for k, ev in EV.items():
        if k in p:
            rows.append({"id": p["id"], "name": p["name"], "country": p["country"], "event": ev, **p[k]})
df = pd.DataFrame(rows).rename(columns={"m": "matches", "inn": "innings", "w": "wickets", "ct": "catches", "st": "stumpings"})
df["50"], df["100"] = df["50"].astype(int), df["100"].astype(int)
S["players"] = len(raw); S["player_event_rows"] = len(df)
S["rows_per_event"] = df.event.value_counts().to_dict()

# ---------- data quality ----------
S["missing_values"] = int(df.isna().sum().sum())
S["duplicate_ids"] = int(pd.Series([p["id"] for p in raw]).duplicated().sum())
bat = df[df.innings >= 5]
bowl = df[df.wickets >= 5]

# 1. Coverage: players per event & country
fig, ax = plt.subplots(1, 2, figsize=(13, 4.5))
sns.countplot(data=df, x="event", order=list(EV.values()), hue="event", palette="mako", legend=False, ax=ax[0])
ax[0].set_title("Players per tournament"); ax[0].set_xlabel("")
top = pd.Series([p["country"] for p in raw]).value_counts().head(15)
sns.barplot(x=top.values, y=top.index, hue=top.index, palette="viridis", legend=False, ax=ax[1]); ax[1].set_title("Top 15 countries by players fielded")
save("01_coverage.png")
S["top_countries"] = top.head(5).to_dict()

# 2. Distributions of batting metrics
fig, ax = plt.subplots(1, 3, figsize=(15, 4))
for a, c in zip(ax, ["runs", "avg", "sr"]):
    sns.histplot(data=bat[bat[c] < bat[c].quantile(0.99)], x=c, hue="event", bins=35, element="step", ax=a)
    a.set_title(f"Distribution of {c} (>=5 innings)")
save("02_batting_distributions.png")

# 3. Strike rate by event (format effect)
plt.figure(figsize=(8, 4.5))
sns.boxplot(data=bat[bat.sr < 250], x="event", y="sr", order=list(EV.values()), hue="event", palette="Set2", legend=False)
plt.title("Strike rate by tournament (>=5 innings)"); plt.xlabel("")
save("03_sr_by_event.png")
S["median_sr"] = bat.groupby("event").sr.median().round(1).to_dict()
S["median_avg"] = bat.groupby("event").avg.median().round(1).to_dict()

# 4. Average vs strike rate scatter
plt.figure(figsize=(9, 6))
q = bat[(bat.innings >= 8) & (bat.sr < 250) & (bat.avg < 120)]
sns.scatterplot(data=q, x="sr", y="avg", hue="event", size="runs", sizes=(15, 250), alpha=.65)
for _, r in q.nlargest(8, "runs").iterrows():
    plt.annotate(r["name"], (r.sr, r.avg), fontsize=8, xytext=(4, 4), textcoords="offset points")
plt.title("Batting: average vs strike rate (>=8 innings)")
save("04_avg_vs_sr.png")

# 5. Top performers
fig, ax = plt.subplots(1, 2, figsize=(14, 5))
tr = df.groupby("name").runs.sum().nlargest(15)[::-1]
tw = df.groupby("name").wickets.sum().nlargest(15)[::-1]
ax[0].barh(tr.index, tr.values, color="#1d4ed8"); ax[0].set_title("Top 15 run-scorers (all events)")
ax[1].barh(tw.index, tw.values, color="#b91c1c"); ax[1].set_title("Top 15 wicket-takers (all events)")
save("05_top_performers.png")
S["top_run_scorers"] = tr[::-1].head(5).to_dict(); S["top_wicket_takers"] = tw[::-1].head(5).to_dict()

# 6. Bowling: economy by event + wickets vs economy
bw = df[(df.ov >= 20)]
fig, ax = plt.subplots(1, 2, figsize=(13, 4.5))
sns.boxplot(data=bw[bw.econ < 12], x="event", y="econ", order=list(EV.values()), hue="event", palette="Set3", legend=False, ax=ax[0])
ax[0].set_title("Economy by tournament (>=20 overs)"); ax[0].set_xlabel("")
sns.scatterplot(data=bw[(bw.econ < 12)], x="econ", y="wickets", hue="event", alpha=.7, ax=ax[1])
ax[1].set_title("Wickets vs economy")
save("06_bowling.png")
S["median_econ"] = bw.groupby("event").econ.median().round(2).to_dict()

# 7. Correlation heatmap
num = bat[["matches", "innings", "runs", "avg", "sr", "50", "100", "wickets", "catches"]]
plt.figure(figsize=(8, 6.5)); sns.heatmap(num.corr(), annot=True, fmt=".2f", cmap="coolwarm", center=0, vmin=-1, vmax=1)
plt.title("Correlation of performance metrics")
save("07_correlation.png")
S["corr_runs_matches"] = round(float(num.corr().loc["runs", "matches"]), 2)
S["corr_avg_sr"] = round(float(num.corr().loc["avg", "sr"]), 2)

# 8. Player archetypes with KMeans (batting-style clusters)
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
agg = df.groupby(["id", "name"]).agg(runs=("runs", "sum"), wk=("wickets", "sum"), inn=("innings", "sum"),
                                     avg=("avg", "mean"), sr=("sr", "mean"), econ=("econ", "mean"),
                                     ct=("catches", "sum"), m=("matches", "sum")).reset_index()
agg = agg[agg.m >= 8].copy()
X = StandardScaler().fit_transform(np.log1p(agg[["runs", "wk", "avg", "sr", "econ", "ct"]]))
agg["cluster"] = KMeans(n_clusters=5, n_init=10, random_state=42).fit_predict(X)
pc = PCA(2, random_state=42).fit_transform(X); agg["pc1"], agg["pc2"] = pc[:, 0], pc[:, 1]
prof = agg.groupby("cluster")[["runs", "wk", "avg", "sr", "econ", "ct"]].mean().round(1)
def label(r):
    if r.wk >= 10 and r.runs < 10: return "Pure bowlers"
    if r.wk >= 10 and r.runs < 150: return "Bowlers who bat a bit"
    if r.wk >= 10: return "All-rounders"
    if r.runs >= 600: return "Run machines"
    return "Middle-order batters"
names = {c: label(r) for c, r in prof.iterrows()}
agg["archetype"] = agg.cluster.map(names)
plt.figure(figsize=(9, 6)); sns.scatterplot(data=agg, x="pc1", y="pc2", hue="archetype", palette="Set1", alpha=.8)
plt.title("Player archetypes (KMeans k=5, PCA projection)")
save("08_archetypes.png")
S["archetype_sizes"] = agg.archetype.value_counts().to_dict()
S["cluster_profiles"] = prof.to_dict("index")

# 9. Era analysis: runs/avg/SR over time (from player 'years')
yr = pd.DataFrame([{"year": int(p["years"][0]), "country": p["country"]} for p in raw if p.get("years")])
yr["decade"] = (yr.year // 10) * 10
plt.figure(figsize=(9, 4)); yr.decade.value_counts().sort_index().plot.bar(color="#0f766e")
plt.title("Debut decade of ICC-event players"); plt.xlabel("decade"); plt.ylabel("players")
save("09_debut_decades.png")

# 10. Tournaments
t = pd.DataFrame(json.load(open(os.path.join(DATA, "tournaments.json"))))
w = t.groupby(["Winner", "Tournament"]).size().unstack(fill_value=0)
w = w.loc[w.sum(axis=1).sort_values(ascending=False).index]
w.plot.barh(stacked=True, figsize=(9, 5), colormap="tab10"); plt.gca().invert_yaxis()
plt.title("ICC titles by team and tournament"); plt.xlabel("titles")
save("10_titles.png")
S["title_leaders"] = w.sum(axis=1).head(5).to_dict()

# 11. Curated recommender set
cur = pd.DataFrame(json.load(open(os.path.join(DATA, "players.json"))))
S["curated_players"] = len(cur); S["curated_roles"] = cur.role.value_counts().to_dict()
fig, ax = plt.subplots(1, 2, figsize=(13, 4.5))
cur.role.value_counts().plot.barh(ax=ax[0], color="#7c3aed"); ax[0].set_title("Curated set: role distribution")
cur.country.value_counts().head(10).plot.barh(ax=ax[1], color="#ea580c"); ax[1].set_title("Curated set: country distribution")
save("11_curated_set.png")

# 12. Career star-power: share of runs held by top-10% of players
share = (df.groupby("id").runs.sum().sort_values(ascending=False))
S["top10pct_run_share"] = round(float(share.head(int(len(share) * .1)).sum() / share.sum()), 3)
plt.figure(figsize=(7, 4.5)); c = share.cumsum() / share.sum()
plt.plot(np.linspace(0, 100, len(c)), c.values * 100); plt.plot([0, 100], [0, 100], "--", color="gray")
plt.title("Concentration of runs (Lorenz-style)"); plt.xlabel("% of players (ranked)"); plt.ylabel("% of cumulative runs")
save("12_run_concentration.png")

json.dump(S, open(os.path.join(ROOT, "eda", "summary.json"), "w"), indent=2, default=str)
print(json.dumps(S, indent=2, default=str))
