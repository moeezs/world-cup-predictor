import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TournamentSimulator from './components/TournamentSimulator';
import MatchPredictor from './components/MatchPredictor';
import LoadingSpinner from './components/LoadingSpinner';
import './index.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function App() {
  const [availableTeams, setAvailableTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('predict');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAvailableTeams();
  }, []);

  const fetchAvailableTeams = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/teams`);
      setAvailableTeams(response.data.teams);
      setError(null);
    } catch (err) {
      setError('Failed to load teams. Please wait while the server is starting. Check back in 2 minutes. Thank you!');
      console.error('Error fetching teams:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-soccer-field flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-soccer-field flex items-center justify-center">
        <div className="scrapbook-card max-w-md mx-auto text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchAvailableTeams}
            className="btn-world-cup"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soccer-field">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b-4 border-world-cup-gold shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="text-3xl mr-3">🏆</div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 world-cup-font">
                  FIFA World Cup 2026
                </h1>
                <p className="text-sm text-gray-600">
                  AI Tournament Predictor & Simulator
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 font-medium">
                {availableTeams.length} teams ready
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white/90 backdrop-blur-sm border-b-2 border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1">
            {[
              { id: 'predict', name: 'Match Predictor', icon: '⚽' },
              { id: 'tournament', name: 'Tournament Simulator', icon: '🏆' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-3 px-6 font-medium text-sm transition-all duration-200 relative ${
                  activeTab === tab.id
                    ? 'bg-world-cup-gold text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span className="font-semibold">{tab.name}</span>
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white rounded-t-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'predict' && (
          <MatchPredictor availableTeams={availableTeams} apiUrl={API_BASE_URL} />
        )}
        {activeTab === 'tournament' && (
          <TournamentSimulator availableTeams={availableTeams} apiUrl={API_BASE_URL} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white/95 backdrop-blur-sm border-t-4 border-world-cup-gold mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <div>
              Built by <a href="https://moeezs.com" target="_blank" rel="noopener noreferrer" className="text-soccer-green hover:text-green-700 font-medium">moeez</a>
            </div>
            <div>
              Data: <a href="https://www.kaggle.com/datasets/martj42/international-football-results-from-1872-to-2017" target="_blank" rel="noopener noreferrer" className="text-soccer-green hover:text-green-700">International Football Results 1872-2017</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
