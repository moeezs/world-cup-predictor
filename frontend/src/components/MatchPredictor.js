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

  const handleSwapTeams = () => {
    const temp = homeTeam;
    setHomeTeam(awayTeam);
    setAwayTeam(temp);
  };

  const handleRandomMatch = () => {
    if (availableTeams.length < 2) return;
    
    const shuffled = [...availableTeams].sort(() => 0.5 - Math.random());
    const randomHome = { value: shuffled[0], label: shuffled[0] };
    const randomAway = { value: shuffled[1], label: shuffled[1] };
    
    setHomeTeam(randomHome);
    setAwayTeam(randomAway);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-1 world-cup-font">
          Match Predictor
        </h2>
        <p className="text-gray-600">
          Select two teams and let AI predict the match outcome
        </p>
      </div>

      {/* Match Setup Card */}
      <div className="scrapbook-card">
        <div className="space-y-4">
          {/* Team Selection & Quick Actions Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Home Team
              </label>
              <Select
                value={homeTeam}
                onChange={setHomeTeam}
                options={teamOptions}
                placeholder="Select home team..."
                isSearchable
                className="text-sm"
                styles={{
                  control: (provided) => ({
                    ...provided,
                    minHeight: '40px',
                    border: '2px solid #d1d5db',
                    '&:hover': { border: '2px solid #059669' }
                  })
                }}
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Away Team
              </label>
              <Select
                value={awayTeam}
                onChange={setAwayTeam}
                options={teamOptions}
                placeholder="Select away team..."
                isSearchable
                className="text-sm"
                styles={{
                  control: (provided) => ({
                    ...provided,
                    minHeight: '40px',
                    border: '2px solid #d1d5db',
                    '&:hover': { border: '2px solid #059669' }
                  })
                }}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSwapTeams}
                disabled={!homeTeam || !awayTeam}
                className="btn-secondary text-sm flex-1"
              >
                Swap
              </button>
              <button
                onClick={handleRandomMatch}
                className="btn-secondary text-sm flex-1"
              >
                Random
              </button>
            </div>
          </div>

          {/* Match Preview & Venue Selection Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Match Preview */}
            {homeTeam && awayTeam && (
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center space-x-4">
                  <div className="text-center">
                    <div className="team-badge mb-1">{homeTeam.label}</div>
                    <div className="text-xs text-gray-600">Home</div>
                  </div>
                  <div className="text-2xl text-gray-400">VS</div>
                  <div className="text-center">
                    <div className="team-badge mb-1">{awayTeam.label}</div>
                    <div className="text-xs text-gray-600">Away</div>
                  </div>
                </div>
              </div>
            )}

            {/* Venue Selection */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Match Venue
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className={`flex items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  neutral 
                    ? 'border-soccer-green bg-green-50 text-soccer-green' 
                    : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
                }`}>
                  <input
                    type="radio"
                    name="venue"
                    checked={neutral}
                    onChange={() => setNeutral(true)}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <div className="font-semibold text-sm">Neutral Venue</div>
                    <div className="text-xs opacity-75">Equal conditions</div>
                  </div>
                </label>
                
                <label className={`flex items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  !neutral 
                    ? 'border-soccer-green bg-green-50 text-soccer-green' 
                    : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
                }`}>
                  <input
                    type="radio"
                    name="venue"
                    checked={!neutral}
                    onChange={() => setNeutral(false)}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <div className="font-semibold text-sm">Home Advantage</div>
                    <div className="text-xs opacity-75">Boost for home</div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Predict Button */}
          <button
            onClick={handlePredict}
            disabled={loading || !homeTeam || !awayTeam}
            className="w-full btn-world-cup py-3 text-lg"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Predicting Match...
              </div>
            ) : (
              'Predict Match Outcome'
            )}
          </button>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3">
              <div className="flex items-center">
                <div className="text-red-400 mr-2">⚠️</div>
                <div className="text-red-700 font-medium text-sm">{error}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Prediction Results */}
      {prediction && (
        <div className="card animate-fade-in">
          {/* Match Result Header */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-800">{prediction.home_team}</div>
              <div className="text-xs text-gray-600">Home Team</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-soccer-green mb-1">
                {prediction.scoreline}
              </div>
              <div className="text-sm font-bold text-gray-800">
                {prediction.winner === 'Draw' ? 'DRAW' : `${prediction.winner} WINS`}
              </div>
              <div className="text-xs text-gray-600">
                {neutral ? 'Neutral Venue' : 'Home Advantage'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-800">{prediction.away_team}</div>
              <div className="text-xs text-gray-600">Away Team</div>
            </div>
          </div>

          {/* Probability Grid */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-xl font-bold text-blue-600">
                {(prediction.home_win_prob * 100).toFixed(1)}%
              </div>
              <div className="text-xs font-semibold text-gray-700">Home Win</div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-xl font-bold text-gray-600">
                {(prediction.draw_prob * 100).toFixed(1)}%
              </div>
              <div className="text-xs font-semibold text-gray-700">Draw</div>
            </div>
            
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-xl font-bold text-red-600">
                {(prediction.away_win_prob * 100).toFixed(1)}%
              </div>
              <div className="text-xs font-semibold text-gray-700">Away Win</div>
            </div>
          </div>

          {/* Confidence & Actions Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
            <div className="text-center">
              <div className="text-sm font-bold text-gray-700">Confidence</div>
              <div className={`text-lg font-bold ${
                Math.max(prediction.home_win_prob, prediction.draw_prob, prediction.away_win_prob) > 0.6 
                  ? 'text-green-600' 
                  : Math.max(prediction.home_win_prob, prediction.draw_prob, prediction.away_win_prob) > 0.4
                  ? 'text-yellow-600'
                  : 'text-red-600'
              }`}>
                {Math.max(prediction.home_win_prob, prediction.draw_prob, prediction.away_win_prob) > 0.6 
                  ? 'HIGH' 
                  : Math.max(prediction.home_win_prob, prediction.draw_prob, prediction.away_win_prob) > 0.4
                  ? 'MEDIUM'
                  : 'LOW'
                }
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-sm font-bold text-gray-700">Match Type</div>
              <div className="text-lg font-bold text-soccer-green">
                {Math.abs(prediction.home_win_prob - prediction.away_win_prob) < 0.2 ? 'CLOSE' : 'CLEAR'}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handlePredict}
                disabled={loading}
                className="btn-secondary flex-1"
              >
                Predict Again
              </button>
              <button
                onClick={() => {
                  setHomeTeam(null);
                  setAwayTeam(null);
                  setPrediction(null);
                  setError(null);
                }}
                className="btn-secondary flex-1"
              >
                New Match
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchPredictor;
