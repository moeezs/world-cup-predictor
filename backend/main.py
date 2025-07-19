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
        model_paths = [
            './models/',
            './backend/models/',
            '/opt/render/project/src/backend/models/',
            '/opt/render/project/src/models/',
        ]
        
        model_files_loaded = False
        for model_path in model_paths:
            try:
                if not os.path.exists(model_path):
                    print(f"Path does not exist: {model_path}")
                    continue
                
                best_model = joblib.load(f'{model_path}best_model.pkl')
                scalers = joblib.load(f'{model_path}scalers.pkl')
                elo_ratings = joblib.load(f'{model_path}elo_ratings.pkl')
                available_teams = joblib.load(f'{model_path}available_teams.pkl')
                
                try:
                    features_df = pd.read_pickle(f'{model_path}features_df.pkl')
                except Exception as e:
                    print(f"Warning: Could not load features_df.pkl: {e}")
                    features_df = pd.DataFrame()
                
                print(f"✅ Models loaded successfully from {model_path}!")
                model_files_loaded = True
                break
            except Exception as e:
                print(f"Failed to load from {model_path}: {e}")
                continue
        
        if not model_files_loaded:
            available_paths = [p for p in model_paths if os.path.exists(p)]
            print(f"Available paths: {available_paths}")
            if available_paths:
                for path in available_paths:
                    files = os.listdir(path)
                    print(f"Files in {path}: {files}")
            raise Exception("Could not load model files from any path")
            
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
    winner: str
    scoreline: str
    home_score: int
    away_score: int
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

def generate_score_prediction(home_team, away_team, home_win_prob, draw_prob, away_win_prob):
    """Generate realistic score prediction based on team strengths and probabilities"""
    import random
    import numpy as np
    
    home_elo = elo_ratings.get(home_team, 1500)
    away_elo = elo_ratings.get(away_team, 1500)
    
    elo_diff = home_elo - away_elo
    strength_factor = 1 + (elo_diff / 400)
    
    base_goals = 2.5
    
    if home_win_prob > away_win_prob:
        home_expected = base_goals * 0.6 * strength_factor
        away_expected = base_goals * 0.4 / strength_factor
    elif away_win_prob > home_win_prob:
        home_expected = base_goals * 0.4 / strength_factor
        away_expected = base_goals * 0.6 * strength_factor
    else:
        home_expected = base_goals * 0.5
        away_expected = base_goals * 0.5
    
    home_score = np.random.poisson(max(0.3, min(4.0, home_expected)))
    away_score = np.random.poisson(max(0.3, min(4.0, away_expected)))
    
    if home_score > away_score:
        winner = home_team
    elif away_score > home_score:
        winner = away_team
    else:
        winner = "Draw"
    
    max_prob = max(home_win_prob, draw_prob, away_win_prob)
    if max_prob == home_win_prob and home_score <= away_score:
        home_score = away_score + 1
        winner = home_team
    elif max_prob == away_win_prob and away_score <= home_score:
        away_score = home_score + 1
        winner = away_team
    elif max_prob == draw_prob and home_score != away_score:
        away_score = home_score
        winner = "Draw"
    
    return {
        "home_score": int(home_score),
        "away_score": int(away_score),
        "winner": winner,
        "scoreline": f"{home_score}-{away_score}"
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
    
    # Generate score prediction
    score_prediction = generate_score_prediction(
        home_team, away_team,
        prob_home,
        prob_draw, 
        prob_away
    )
    
    return {
        'winner': score_prediction["winner"],
        'scoreline': score_prediction["scoreline"],
        'home_score': score_prediction["home_score"],
        'away_score': score_prediction["away_score"],
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
            winner=result['winner'],
            scoreline=result['scoreline'],
            home_score=result['home_score'],
            away_score=result['away_score'],
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

        # Create groups
        teams = request.qualified_teams.copy()
        np.random.shuffle(teams)
        
        groups = {}
        group_letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
        
        for i, letter in enumerate(group_letters):
            groups[letter] = teams[i*4:(i+1)*4]
        
        qualified_teams = []
        group_results = {}
        
        for group_name, group_teams in groups.items():
            standings = {}
            for team in group_teams:
                standings[team] = {
                    'team': team,
                    'played': 0,
                    'wins': 0,
                    'draws': 0,
                    'losses': 0,
                    'goals_for': 0,
                    'goals_against': 0,
                    'goal_difference': 0,
                    'points': 0
                }
            
            matches = []
            for i in range(len(group_teams)):
                for j in range(i + 1, len(group_teams)):
                    home_team = group_teams[i]
                    away_team = group_teams[j]
                    
                    prediction = predict_match(home_team, away_team, True)
                    
                    home_stats = standings[home_team]
                    away_stats = standings[away_team]
                    
                    home_stats['played'] += 1
                    away_stats['played'] += 1
                    home_stats['goals_for'] += prediction['home_score']
                    home_stats['goals_against'] += prediction['away_score']
                    away_stats['goals_for'] += prediction['away_score']
                    away_stats['goals_against'] += prediction['home_score']
                    
                    if prediction['winner'] == home_team:
                        home_stats['wins'] += 1
                        home_stats['points'] += 3
                        away_stats['losses'] += 1
                    elif prediction['winner'] == away_team:
                        away_stats['wins'] += 1
                        away_stats['points'] += 3
                        home_stats['losses'] += 1
                    else:
                        home_stats['draws'] += 1
                        away_stats['draws'] += 1
                        home_stats['points'] += 1
                        away_stats['points'] += 1
                    
                    home_stats['goal_difference'] = home_stats['goals_for'] - home_stats['goals_against']
                    away_stats['goal_difference'] = away_stats['goals_for'] - away_stats['goals_against']
                    
                    matches.append({
                        'home_team': home_team,
                        'away_team': away_team,
                        'home_score': prediction['home_score'],
                        'away_score': prediction['away_score'],
                        'winner': prediction['winner'],
                        'scoreline': prediction['scoreline']
                    })
            
            sorted_teams = sorted(standings.values(), 
                                key=lambda x: (x['points'], x['goal_difference'], x['goals_for']), 
                                reverse=True)
            
            qualified_from_group = [team['team'] for team in sorted_teams[:2]]
            qualified_teams.extend(qualified_from_group)
            
            group_results[group_name] = {
                'teams': group_teams,
                'standings': sorted_teams,
                'matches': matches,
                'qualified': qualified_from_group
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
                    
                    if prediction['winner'] == 'Draw':
                        winner = team1 if prediction['home_win_prob'] > prediction['away_win_prob'] else team2
                    else:
                        winner = prediction['winner']
                    
                    winners.append(winner)
                    matches.append({
                        'home_team': team1,
                        'away_team': team2,
                        'winner': winner,
                        'scoreline': prediction['scoreline'],
                        'home_score': prediction['home_score'],
                        'away_score': prediction['away_score'],
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
    # For local development
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
