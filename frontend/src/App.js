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
      setError('Failed to load teams. Please check if the API server is running.');
      console.error('Error fetching teams:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="card max-w-md mx-auto text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchAvailableTeams}
            className="btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="text-3xl mr-3">🏆</div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  World Cup Predictor
                </h1>
                <p className="text-sm text-gray-500">
                  AI-Powered Tournament Simulation
                </p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {availableTeams.length} teams available
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'predict', name: 'Match Predictor', icon: '⚽' },
              { id: 'tournament', name: 'Tournament Simulator', icon: '🏆' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'predict' && (
          <MatchPredictor availableTeams={availableTeams} apiUrl={API_BASE_URL} />
        )}
        {activeTab === 'tournament' && (
          <TournamentSimulator availableTeams={availableTeams} apiUrl={API_BASE_URL} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-500 text-sm">
            <p>
              Powered by advanced machine learning models trained on historical football data
            </p>
            <p className="mt-1">
              Built with React, FastAPI, and state-of-the-art AI algorithms
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
