import React, { useState } from 'react';
import axios from 'axios';
import Select from 'react-select';

const TournamentSimulator = ({ availableTeams, apiUrl }) => {
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [tournamentResult, setTournamentResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const teamOptions = availableTeams.map(team => ({
    value: team,
    label: team
  }));

  // Pre-selected common World Cup teams for convenience
  const commonTeams = [
    'Brazil', 'Argentina', 'France', 'Germany', 'Spain', 'England', 
    'Portugal', 'Netherlands', 'Italy', 'Belgium', 'Croatia', 'Mexico',
    'Uruguay', 'Colombia', 'Japan', 'South Korea', 'Morocco', 'Denmark',
    'Switzerland', 'Poland', 'Serbia', 'Canada', 'Australia', 'Ghana',
    'Senegal', 'Ecuador', 'Tunisia', 'Costa Rica', 'Wales', 'Iran',
    'Saudi Arabia', 'Qatar'
  ].filter(team => availableTeams.includes(team));

  const handleQuickSelect = () => {
    const quickTeams = commonTeams.slice(0, 32).map(team => ({
      value: team,
      label: team
    }));
    setSelectedTeams(quickTeams);
  };

  const handleSimulate = async () => {
    if (selectedTeams.length !== 32) {
      setError('Please select exactly 32 teams for the World Cup');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${apiUrl}/simulate-tournament`, {
        qualified_teams: selectedTeams.map(team => team.value)
      });

      setTournamentResult(response.data.tournament_results);
    } catch (err) {
      setError('Failed to simulate tournament. Please try again.');
      console.error('Tournament simulation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderGroupStage = () => {
    if (!tournamentResult?.group_stage) return null;

    return (
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Group Stage</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(tournamentResult.group_stage).map(([groupName, groupData]) => (
            <div key={groupName} className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-lg mb-2">Group {groupName}</h4>
              <div className="space-y-2">
                {groupData.teams.map((team, index) => (
                  <div
                    key={team}
                    className={`p-2 rounded text-sm ${
                      index < 2 
                        ? 'bg-green-100 text-green-800 font-medium' 
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {team} {index < 2 && '✓'}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderKnockoutStage = () => {
    if (!tournamentResult?.knockout_stage) return null;

    return (
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Knockout Stage</h3>
        <div className="space-y-6">
          {Object.entries(tournamentResult.knockout_stage).map(([roundName, matches]) => (
            <div key={roundName}>
              <h4 className="font-semibold text-lg mb-3">{roundName}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {matches.map((match, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">{match.home_team}</span>
                      <span className="text-xs text-gray-500">vs</span>
                      <span className="text-sm">{match.away_team}</span>
                    </div>
                    <div className="text-center mt-2">
                      <span className="font-semibold text-green-600">
                        {match.winner} wins
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Tournament Simulator</h2>
        <p className="text-gray-600">
          Select 32 teams to simulate a complete World Cup tournament
        </p>
      </div>

      <div className="card max-w-4xl mx-auto">
        <div className="space-y-6">
          {/* Team Selection */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Select 32 Teams ({selectedTeams.length}/32)
              </label>
              <button
                onClick={handleQuickSelect}
                className="btn-secondary text-sm"
                disabled={commonTeams.length < 32}
              >
                Quick Select (Common Teams)
              </button>
            </div>
            <Select
              value={selectedTeams}
              onChange={setSelectedTeams}
              options={teamOptions}
              isMulti
              placeholder="Search and select teams..."
              isSearchable
              className="text-sm"
              maxMenuHeight={200}
            />
            <div className="mt-2 text-sm text-gray-500">
              {selectedTeams.length < 32 && `Select ${32 - selectedTeams.length} more teams`}
              {selectedTeams.length === 32 && '✓ Ready to simulate tournament'}
              {selectedTeams.length > 32 && `Remove ${selectedTeams.length - 32} teams`}
            </div>
          </div>

          {/* Simulate Button */}
          <button
            onClick={handleSimulate}
            disabled={loading || selectedTeams.length !== 32}
            className="w-full btn-primary py-3 text-lg"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Simulating Tournament...
              </div>
            ) : (
              '🏆 Simulate World Cup'
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

      {/* Tournament Results */}
      {tournamentResult && (
        <div className="card max-w-6xl mx-auto animate-fade-in">
          {/* Champion */}
          <div className="text-center mb-8 pb-6 border-b border-gray-200">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-3xl font-bold text-yellow-600 mb-2">
              WORLD CUP CHAMPION
            </h3>
            <div className="text-2xl font-bold text-gray-900">
              {tournamentResult.champion}
            </div>
          </div>

          {/* Group Stage */}
          {renderGroupStage()}

          {/* Knockout Stage */}
          {renderKnockoutStage()}

          {/* Simulate Again */}
          <div className="text-center pt-6 border-t border-gray-200">
            <button
              onClick={handleSimulate}
              disabled={loading || selectedTeams.length !== 32}
              className="btn-secondary"
            >
              🔄 Simulate Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentSimulator;
