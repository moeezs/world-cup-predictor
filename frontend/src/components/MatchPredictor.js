import React, { useState } from 'react';
import axios from 'axios';
import Select from 'react-select';

const MatchPredictor = ({ availableTeams, apiUrl }) => {
  const [homeTeam, setHomeTeam] = useState(null);
  const [awayTeam, setAwayTeam] = useState(null);
  const [neutral, setNeutral] = useState(true);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const teamOptions = availableTeams.map(team => ({
    value: team,
    label: team
  }));

  const handlePredict = async () => {
    if (!homeTeam || !awayTeam) {
      setError('Please select both teams');
      return;
    }

    if (homeTeam.value === awayTeam.value) {
      setError('Please select different teams');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${apiUrl}/predict`, {
        home_team: homeTeam.value,
        away_team: awayTeam.value,
        neutral: neutral
      });

      setPrediction(response.data);
    } catch (err) {
      setError('Failed to get prediction. Please try again.');
      console.error('Prediction error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPredictionColor = (prob) => {
    if (prob > 0.6) return 'text-green-600';
    if (prob > 0.4) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getResultIcon = (result) => {
    switch (result) {
      case 'home_win': return '🏠';
      case 'away_win': return '✈️';
      case 'draw': return '🤝';
      default: return '❓';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Match Predictor</h2>
        <p className="text-gray-600">
          Select two teams to predict the match outcome using AI
        </p>
      </div>

      <div className="card max-w-2xl mx-auto">
        <div className="space-y-6">
          {/* Team Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Home Team
              </label>
              <Select
                value={homeTeam}
                onChange={setHomeTeam}
                options={teamOptions}
                placeholder="Select home team..."
                isSearchable
                className="text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Away Team
              </label>
              <Select
                value={awayTeam}
                onChange={setAwayTeam}
                options={teamOptions}
                placeholder="Select away team..."
                isSearchable
                className="text-sm"
              />
            </div>
          </div>

          {/* Venue Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Venue
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="venue"
                  checked={neutral}
                  onChange={() => setNeutral(true)}
                  className="mr-2"
                />
                Neutral Venue
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="venue"
                  checked={!neutral}
                  onChange={() => setNeutral(false)}
                  className="mr-2"
                />
                Home Advantage
              </label>
            </div>
          </div>

          {/* Predict Button */}
          <button
            onClick={handlePredict}
            disabled={loading || !homeTeam || !awayTeam}
            className="w-full btn-primary py-3 text-lg"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Predicting...
              </div>
            ) : (
              '🔮 Predict Match'
            )}
          </button>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="text-red-400 mr-2">⚠️</div>
                <div className="text-red-700 text-sm">{error}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Prediction Results */}
      {prediction && (
        <div className="card max-w-2xl mx-auto animate-fade-in">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Prediction Result
            </h3>
            
            {/* Match Header */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="text-lg font-semibold text-gray-800">
                {prediction.home_team} vs {prediction.away_team}
              </div>
              <div className="text-sm text-gray-600">
                {neutral ? 'Neutral Venue' : 'Home Advantage'}
              </div>
            </div>

            {/* Prediction */}
            <div className="mb-6">
              <div className="text-4xl mb-2">
                {getResultIcon(prediction.prediction)}
              </div>
              <div className="text-xl font-semibold text-gray-800">
                Most Likely: {prediction.prediction.replace('_', ' ').toUpperCase()}
              </div>
            </div>

            {/* Probabilities */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {(prediction.home_win_prob * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Home Win</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {(prediction.draw_prob * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Draw</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {(prediction.away_win_prob * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Away Win</div>
              </div>
            </div>

            {/* Confidence Indicator */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Prediction Confidence: 
                <span className={`ml-1 font-semibold ${
                  Math.max(prediction.home_win_prob, prediction.draw_prob, prediction.away_win_prob) > 0.6 
                    ? 'text-green-600' 
                    : Math.max(prediction.home_win_prob, prediction.draw_prob, prediction.away_win_prob) > 0.4
                    ? 'text-yellow-600'
                    : 'text-red-600'
                }`}>
                  {Math.max(prediction.home_win_prob, prediction.draw_prob, prediction.away_win_prob) > 0.6 
                    ? 'High' 
                    : Math.max(prediction.home_win_prob, prediction.draw_prob, prediction.away_win_prob) > 0.4
                    ? 'Medium'
                    : 'Low'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchPredictor;
