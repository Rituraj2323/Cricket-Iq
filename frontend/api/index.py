from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import players, recommend

app = FastAPI(
    title='CricketIQ API',
    version='1.0.0',
    description='Cricket Player Recommendation System',
    redirect_slashes=True
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(players.router)
app.include_router(recommend.router)

@app.get('/')
def root():
    return {'status': 'CricketIQ API is running', 'version': '1.0.0', 'endpoints': ['/players', '/recommend']}
