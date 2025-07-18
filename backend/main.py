from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
from contextlib import asynccontextmanager
import joblib
import pandas as pd
import numpy as np
from datetime import datetime
import os
import uvicorn

# Global variables for models
best_model = None
scalers = None
elo_ratings = None
available_teams = None
features_df = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load models on startup and cleanup on shutdown"""
    global best_model, scalers, elo_ratings, available_teams, features_df
    
    try:
        best_model = joblib.load('../models/best_model.pkl')
        scalers = joblib.load('../models/scalers.pkl')
        elo_ratings = joblib.load('../models/elo_ratings.pkl')
        available_teams = joblib.load('../models/available_teams.pkl')
        features_df = pd.read_pickle('../models/features_df.pkl')
        
        print("✅ Models loaded successfully!")
    except Exception as e:
        print(f"❌ Error loading models: {e}")
        raise
    
    yield
    
    print("🔄 Shutting down...")

app = FastAPI(
    title="World Cup Prediction API",
    description="AI-powered World Cup tournament prediction and simulation",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

best_model = None
scalers = None
elo_ratings = None
available_teams = None
features_df = None

class TeamSelection(BaseModel):
    teams: List[str]

class MatchPrediction(BaseModel):
    home_team: str
    away_team: str
    neutral: bool = True

class TournamentRequest(BaseModel):
    qualified_teams: List[str]

class PredictionResponse(BaseModel):
    home_team: str
    away_team: str
    prediction: str
    home_win_prob: float
    draw_prob: float
    away_win_prob: float

def get_team_current_features(team, opponent, neutral=True):
    """Get current features for a team based on historical data"""
    current_date = datetime.now()
    

    team_elo = elo_ratings.get(team, 1500)
    opponent_elo = elo_ratings.get(opponent, 1500)
    
    return {
        'home_elo': team_elo,
        'away_elo': opponent_elo,
        'elo_diff': team_elo - opponent_elo,
        'home_form_points': 1.5, 
        'away_form_points': 1.5,
        'form_diff': 0,
        'home_goals_for_avg': 1.2,
        'away_goals_for_avg': 1.2,
        'home_goals_against_avg': 1.0,
        'away_goals_against_avg': 1.0,
        'h2h_home_wins': 0,
        'h2h_draws': 0,
        'h2h_away_wins': 0,
        'h2h_total_matches': 0,
        'home_tournament_exp': 10,
        'away_tournament_exp': 10,
        'tournament_exp_diff': 0,
        'neutral': 1 if neutral else 0
    }

def predict_match(home_team: str, away_team: str, neutral: bool = True):
    """Predict outcome of a single match"""
    if best_model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    

    features_dict = get_team_current_features(home_team, away_team, neutral)
    

    feature_vector = np.array([[
        features_dict['home_elo'],
        features_dict['away_elo'],
        features_dict['elo_diff'],
        features_dict['home_form_points'],
        features_dict['away_form_points'],
        features_dict['form_diff'],
        features_dict['home_goals_for_avg'],
        features_dict['away_goals_for_avg'],
        features_dict['home_goals_against_avg'],
        features_dict['away_goals_against_avg'],
        features_dict['h2h_home_wins'],
        features_dict['h2h_draws'],
        features_dict['h2h_away_wins'],
        features_dict['h2h_total_matches'],
        features_dict['home_tournament_exp'],
        features_dict['away_tournament_exp'],
        features_dict['tournament_exp_diff'],
        features_dict['neutral']
    ]])
    
    # Scale features
    feature_vector_scaled = scalers['main'].transform(feature_vector)
    

    probabilities = best_model.predict_proba(feature_vector_scaled)[0]
    prediction_array = best_model.predict(feature_vector_scaled)
    prediction_encoded = prediction_array[0]
    

    if isinstance(prediction_encoded, (int, np.integer)):

        class_mapping = {0: 'away_win', 1: 'draw', 2: 'home_win'}
        prediction = class_mapping[int(prediction_encoded)]

        prob_away = float(probabilities[0])
        prob_draw = float(probabilities[1])
        prob_home = float(probabilities[2])
    else:

        prediction = str(prediction_encoded).strip('[]\'\"')

        classes = best_model.classes_
        prob_dict = dict(zip(classes, probabilities))
        prob_away = float(prob_dict.get('away_win', 0))
        prob_draw = float(prob_dict.get('draw', 0))
        prob_home = float(prob_dict.get('home_win', 0))
    
    return {
        'prediction': prediction,
        'home_win_prob': prob_home,
        'draw_prob': prob_draw,
        'away_win_prob': prob_away
    }

@app.get("/")
async def root():
    return {"message": "World Cup Prediction API", "status": "active"}

@app.get("/teams")
async def get_available_teams():
    """Get list of all available teams"""
    if available_teams is None:
        raise HTTPException(status_code=500, detail="Teams data not loaded")
    return {"teams": available_teams}

@app.post("/predict", response_model=PredictionResponse)
async def predict_match_endpoint(match: MatchPrediction):
    """Predict the outcome of a single match"""
    if match.home_team not in available_teams or match.away_team not in available_teams:
        raise HTTPException(status_code=400, detail="Invalid team names")
    
    try:
        result = predict_match(match.home_team, match.away_team, match.neutral)
        return PredictionResponse(
            home_team=match.home_team,
            away_team=match.away_team,
            prediction=result['prediction'],
            home_win_prob=result['home_win_prob'],
            draw_prob=result['draw_prob'],
            away_win_prob=result['away_win_prob']
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.post("/simulate-tournament")
async def simulate_tournament(request: TournamentRequest):
    """Simulate a complete World Cup tournament"""
    if len(request.qualified_teams) != 32:
        raise HTTPException(status_code=400, detail="World Cup requires exactly 32 teams")
    
    # Check if all teams are valid
    invalid_teams = [team for team in request.qualified_teams if team not in available_teams]
    if invalid_teams:
        raise HTTPException(status_code=400, detail=f"Invalid teams: {invalid_teams}")
    
    try:

        teams = request.qualified_teams.copy()
        np.random.shuffle(teams)
        
        groups = {}
        group_letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
        
        for i, letter in enumerate(group_letters):
            groups[letter] = teams[i*4:(i+1)*4]
        
        qualified_teams = []
        group_results = {}
        
        for group_name, group_teams in groups.items():
            qualified_teams.extend(group_teams[:2])
            group_results[group_name] = {
                'teams': group_teams,
                'qualified': group_teams[:2]
            }
        
        current_round_teams = qualified_teams
        knockout_results = {}
        
        rounds = ['Round of 16', 'Quarter-finals', 'Semi-finals', 'Final']
        
        for round_name in rounds:
            winners = []
            matches = []
            
            for i in range(0, len(current_round_teams), 2):
                if i + 1 < len(current_round_teams):
                    team1 = current_round_teams[i]
                    team2 = current_round_teams[i + 1]
                    
                    prediction = predict_match(team1, team2, True)
                    
                    # Determine winner based on prediction
                    if prediction['home_win_prob'] > prediction['away_win_prob']:
                        winner = team1
                    else:
                        winner = team2
                    
                    winners.append(winner)
                    matches.append({
                        'home_team': team1,
                        'away_team': team2,
                        'winner': winner,
                        'prediction': prediction
                    })
            
            knockout_results[round_name] = matches
            current_round_teams = winners
            
            if len(current_round_teams) <= 1:
                break
        
        champion = current_round_teams[0] if current_round_teams else "Unknown"
        
        return {
            "tournament_results": {
                "group_stage": group_results,
                "knockout_stage": knockout_results,
                "champion": champion
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Tournament simulation failed: {str(e)}")

@app.get("/team-stats/{team_name}")
async def get_team_stats(team_name: str):
    """Get statistics for a specific team"""
    if team_name not in available_teams:
        raise HTTPException(status_code=404, detail="Team not found")
    
    try:
        elo_rating = elo_ratings.get(team_name, 1500)
        
        # Get recent matches from features_df
        team_matches = features_df[
            (features_df['home_team'] == team_name) | 
            (features_df['away_team'] == team_name)
        ].tail(10)
        
        return {
            "team": team_name,
            "elo_rating": elo_rating,
            "recent_matches": len(team_matches),
            "rank_estimate": len([team for team, rating in elo_ratings.items() if rating > elo_rating]) + 1
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get team stats: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
