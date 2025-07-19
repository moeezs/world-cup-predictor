# World Cup Predictor
![alt text](https://github.com/moeezs/world-cup-predictor/blob/main/frontend/public/favicon.png "world cup trophy")

A machine learning-powered World Cup tournament prediction system. Pick 32 teams, simulate the entire tournament, and see who wins.

## Tech Stack

**Frontend**: React, deployed on Vercel  
**Backend**: FastAPI, deployed on Render  
**ML**: CatBoost, LightGBM, Scikit-learn  
**Data**: Pandas, NumPy  
**Dataset**: Kaggle International Football Results

## Models

Uses ensemble ML algorithms:
- **CatBoost** (primary classifier)
- **LightGBM** (secondary)
- **Poisson distribution** for realistic score generation

Features include ELO ratings, team form, head-to-head records, and tournament experience.

## Live Demo

🔗 **Frontend**: https://world-cup-predictor.vercel.app/
🔗 **Backend**: https://world-cup-predictor.onrender.com/

## Local Setup

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm start
```

### Environment Variables
Create `.env` in frontend:
```
REACT_APP_API_URL=http://localhost:8000
```

## How It Works

1. Select 32 qualified teams
2. Teams are randomly grouped (A-H)
3. Group stage simulation with full standings
4. Knockout rounds until final
5. ML predicts match outcomes using team stats

## Data Source

International football results from Kaggle, processed into team features and ELO ratings.
https://www.kaggle.com/datasets/martj42/international-football-results-from-1872-to-2017

---

Built for fun. Results not guaranteed. 🏆
- **Feature Engineering**: 18 advanced features including ELO ratings
- **Model Training**: Cross-validated ensemble of multiple algorithms
- **Performance**: ~60% accuracy on match outcome prediction

## 🚀 Quick Start

### Prerequisites
- Python 3.8+ with pip
- Node.js 16+ with npm
- Git

### 1. Clone Repository
```bash
git clone <repository-url>
cd world-cup-predictor
```

### 2. Backend Setup
```bash
# Navigate to project root
cd /path/to/world-cup

# Install Python dependencies
pip install fastapi uvicorn pandas numpy scikit-learn xgboost lightgbm catboost joblib

# Copy models to backend directory
cp -r models backend/

# Start FastAPI server
cd backend
python main.py
```

The API will be available at `http://localhost:8000`
- API Documentation: `http://localhost:8000/docs`
- Alternative docs: `http://localhost:8000/redoc`

### 3. Frontend Setup
```bash
# Install dependencies
cd frontend
npm install

# Start development server
npm start
```

The frontend will be available at `http://localhost:3000`

## 📁 Project Structure

```
world-cup-predictor/
├── wc-model.ipynb              # Main ML notebook with complete pipeline
├── *.csv                       # Historical football datasets
├── models/                     # Trained ML models and artifacts
│   ├── best_model.pkl         # Best performing model (CatBoost)
│   ├── scalers.pkl            # Feature scalers
│   ├── elo_ratings.pkl        # ELO ratings for all teams
│   └── available_teams.pkl    # List of available teams
├── backend/                   # FastAPI backend
│   └── main.py               # API server with all endpoints
└── frontend/                 # React frontend
    ├── package.json          # Dependencies and scripts
    ├── tailwind.config.js    # Tailwind CSS configuration
    ├── public/
    │   └── index.html       # HTML template
    └── src/
        ├── App.js           # Main application component
        ├── index.js         # React entry point
        ├── index.css        # Global styles with Tailwind
        └── components/
            ├── MatchPredictor.js     # Single match prediction
            ├── TournamentSimulator.js # Full tournament simulation
            └── LoadingSpinner.js     # Loading component
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the frontend directory:
```env
REACT_APP_API_URL=http://localhost:8000
```

For production, update this to your deployed API URL.

### API Configuration

The FastAPI backend can be configured through environment variables:
- `HOST`: Server host (default: 0.0.0.0)
- `PORT`: Server port (default: 8000)
- `CORS_ORIGINS`: Allowed CORS origins (default: *)

## 🌐 Deployment Options

Vercel + Railway (Recommended)

#### Frontend (Vercel)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set build settings:
   - **Build Command**: `cd frontend && npm run build`
   - **Output Directory**: `frontend/build`
   - **Install Command**: `cd frontend && npm install`
4. Add environment variable:
   - `REACT_APP_API_URL`: Your Railway backend URL
5. Deploy

#### Backend (Railway)
1. Create a new Railway project
2. Connect your GitHub repository
3. Set the root directory to `/backend`
4. Add a `requirements.txt` in the backend directory:
```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
pandas==2.1.3
numpy==1.24.3
scikit-learn==1.3.2
lightgbm==4.1.0
catboost==1.2.2
joblib==1.3.2
python-multipart==0.0.6
```
5. Add a `Procfile` in the backend directory:
```
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```
6. Deploy

## 🧪 Testing

### Backend Tests
```bash
cd backend
pip install pytest httpx
pytest test_main.py
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📊 API Endpoints

### Core Endpoints
- `GET /`: Health check
- `GET /teams`: Get all available teams
- `POST /predict`: Predict single match outcome
- `POST /simulate-tournament`: Simulate complete World Cup
- `GET /team-stats/{team_name}`: Get team statistics

### Example API Usage

#### Predict Match
```bash
curl -X POST "http://localhost:8000/predict" \
     -H "Content-Type: application/json" \
     -d '{
       "home_team": "Brazil",
       "away_team": "Argentina",
       "neutral": true
     }'
```

#### Simulate Tournament
```bash
curl -X POST "http://localhost:8000/simulate-tournament" \
     -H "Content-Type: application/json" \
     -d '{
       "qualified_teams": ["Brazil", "Argentina", "France", ...32 teams]
     }'
```

## 🔧 Troubleshooting

### Common Issues

1. **Model Loading Errors**
   - Ensure `models/` directory is in the backend folder
   - Check file permissions
   - Verify model files are not corrupted

2. **CORS Errors**
   - Update CORS origins in FastAPI configuration
   - Check API URL in frontend environment variables

3. **Memory Issues**
   - Large models may require more RAM
   - Consider using model compression techniques
   - Use production-grade hosting with sufficient resources

4. **Package Installation Issues**
   - Use virtual environments
   - Check Python/Node versions
   - Clear cache: `pip cache purge` or `npm cache clean --force`

### Performance Optimization

1. **Backend**
   - Use async endpoints for I/O operations
   - Implement caching for frequently accessed data
   - Add request rate limiting

2. **Frontend**
   - Implement lazy loading for components
   - Add service worker for offline functionality
   - Use React.memo for expensive components

## 📈 Monitoring & Analytics

### Recommended Tools
- **Backend**: Sentry for error tracking, DataDog for performance
- **Frontend**: Google Analytics, Hotjar for user behavior
- **Infrastructure**: Uptime monitoring with StatusPage

### Metrics to Track
- API response times
- Model prediction accuracy
- User engagement metrics
- Error rates and types

## 🔒 Security Considerations

### Production Checklist
- [ ] Remove debug mode
- [ ] Configure proper CORS origins
- [ ] Add rate limiting
- [ ] Implement API authentication if needed
- [ ] Use HTTPS in production
- [ ] Sanitize user inputs
- [ ] Regular security updates

## 📝 License & Credits

This project uses historical football data and implements state-of-the-art machine learning algorithms for sports prediction. Built with modern web technologies for optimal user experience.

### Technologies Used
- **ML**: CatBoost, LightGBM, scikit-learn
- **Backend**: FastAPI, Python 3.9+
- **Frontend**: React 18, Tailwind CSS
- **Deployment**: Vercel, Railway

---

**Need Help?** Check the issues section or create a new issue for support.
