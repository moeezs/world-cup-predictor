import React, { useState } from 'react';
import axios from 'axios';
import Select from 'react-select';

// Sub-components
const GroupStageTab = ({ tournamentResult, onGroupClick }) => {
  if (!tournamentResult?.group_stage) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Object.entries(tournamentResult.group_stage).map(([groupName, groupData]) => (
        <div
          key={groupName}
          className="group-card"
          onClick={() => onGroupClick(groupName, groupData)}
        >
          <div className="bg-soccer-green text-white px-3 py-2 rounded-t-lg">
            <h3 className="font-bold text-base text-center">Group {groupName}</h3>
          </div>
          
          <div className="p-3">
            <div className="space-y-1">
              {groupData.standings?.slice(0, 4).map((team, index) => (
                <div
                  key={team.team}
                  className={`flex justify-between items-center py-1 px-2 rounded text-xs ${
                    index < 2 
                      ? 'bg-green-100 border-l-2 border-green-500 font-semibold' 
                      : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <span className="w-4 text-center font-bold text-gray-600">
                      {index + 1}
                    </span>
                    <span className="ml-2 truncate">{team.team}</span>
                    {index < 2 && <span className="ml-1 text-green-600 text-xs">✓</span>}
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-600">
                    <span className="font-bold">{team.points}pts</span>
                    <span>{team.goal_difference > 0 ? '+' : ''}{team.goal_difference}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="px-3 pb-3">
            <div className="text-center">
              <button className="text-xs text-soccer-green hover:text-green-700 font-medium">
                View Details
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const KnockoutTab = ({ tournamentResult }) => {
  if (!tournamentResult?.knockout_stage) return null;

  const rounds = Object.entries(tournamentResult.knockout_stage);
  
  return (
    <div className="space-y-6">
      {rounds.map(([roundName, matches], roundIndex) => (
        <div key={roundName} className="knockout-bracket">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-center text-gray-800 world-cup-font">
              {roundName}
            </h3>
          </div>
          
          <div className={`grid gap-3 ${
            matches.length <= 2 ? 'grid-cols-1 max-w-2xl mx-auto' :
            matches.length <= 4 ? 'grid-cols-2' :
            'grid-cols-2 lg:grid-cols-4'
          }`}>
            {matches.map((match, index) => (
              <div key={index} className="match-card">
                <div className="text-center mb-2">
                  <div className="text-xs text-gray-500 font-medium">
                    {roundName === 'Final' ? 'FINAL' : 
                     roundName === 'Semi-finals' ? 'SEMI-FINAL' :
                     `Match ${index + 1}`}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="team-badge">
                      {match.home_team}
                    </div>
                    <div className="text-base font-bold text-gray-700">
                      {match.home_score || 0}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="team-badge">
                      {match.away_team}
                    </div>
                    <div className="text-base font-bold text-gray-700">
                      {match.away_score || 0}
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 pt-2 border-t border-gray-200 text-center">
                  <div className="text-sm font-semibold text-soccer-green">
                    {match.winner}
                  </div>
                  {match.scoreline && (
                    <div className="text-xs text-gray-600 mt-1">
                      {match.scoreline}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const FinalTab = ({ tournamentResult }) => {
  if (!tournamentResult?.champion) return null;
  
  const finalMatch = tournamentResult.knockout_stage?.['Final']?.[0];
  
  return (
    <div className="text-center max-w-4xl mx-auto">
      {/* Champion Section */}
      <div className="scrapbook-card mb-6">
        <div className="text-6xl mb-4">🏆</div>
        <h2 className="text-3xl font-bold text-world-cup-gold mb-3 world-cup-font">
          WORLD CUP CHAMPION
        </h2>
        <div className="text-2xl font-bold text-gray-800 mb-4">
          {tournamentResult.champion}
        </div>
        
        {finalMatch && (
          <div className="bg-gray-50 rounded-lg p-4 inline-block">
            <h3 className="text-lg font-bold mb-3 text-gray-700">Final Result</h3>
            <div className="flex items-center justify-center space-x-4">
              <div className="text-center">
                <div className="text-sm font-semibold">{finalMatch.home_team}</div>
                <div className="text-2xl font-bold text-gray-700">{finalMatch.home_score || 0}</div>
              </div>
              <div className="text-xl text-gray-400">-</div>
              <div className="text-center">
                <div className="text-sm font-semibold">{finalMatch.away_team}</div>
                <div className="text-2xl font-bold text-gray-700">{finalMatch.away_score || 0}</div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Additional Final Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card text-center">
          <div className="text-2xl mb-2">🥈</div>
          <h3 className="font-bold text-base text-gray-700">Runner-up</h3>
          <p className="text-gray-600 text-sm">
            {finalMatch ? (finalMatch.winner === finalMatch.home_team ? finalMatch.away_team : finalMatch.home_team) : 'TBD'}
          </p>
        </div>
        
        <div className="card text-center">
          <div className="text-2xl mb-2">🎯</div>
          <h3 className="font-bold text-base text-gray-700">Tournament</h3>
          <p className="text-gray-600 text-sm">FIFA World Cup 2026</p>
        </div>
        
        <div className="card text-center">
          <div className="text-2xl mb-2">⚽</div>
          <h3 className="font-bold text-base text-gray-700">Total Teams</h3>
          <p className="text-gray-600 text-sm">32 Nations</p>
        </div>
      </div>
    </div>
  );
};

// Group Details Dialog
const GroupDialog = ({ isOpen, onClose, groupName, groupData }) => {
  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-content animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="bg-soccer-green text-white px-6 py-4 rounded-t-xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Group {groupName} Details</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl"
            >
              ×
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {/* Standings Table */}
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-4">Final Standings</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left p-3 font-bold">Pos</th>
                    <th className="text-left p-3 font-bold">Team</th>
                    <th className="text-center p-3 font-bold">P</th>
                    <th className="text-center p-3 font-bold">W</th>
                    <th className="text-center p-3 font-bold">D</th>
                    <th className="text-center p-3 font-bold">L</th>
                    <th className="text-center p-3 font-bold">GF</th>
                    <th className="text-center p-3 font-bold">GA</th>
                    <th className="text-center p-3 font-bold">GD</th>
                    <th className="text-center p-3 font-bold">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {groupData.standings?.map((team, index) => (
                    <tr key={team.team} className={`${
                      index < 2 ? 'bg-green-50 border-l-4 border-green-500' : 'hover:bg-gray-50'
                    }`}>
                      <td className="p-3 font-bold text-gray-600">{index + 1}</td>
                      <td className="p-3 font-semibold">
                        {team.team}
                        {index < 2 && <span className="ml-2 text-green-600">✓ Qualified</span>}
                      </td>
                      <td className="text-center p-3">{team.played}</td>
                      <td className="text-center p-3">{team.wins}</td>
                      <td className="text-center p-3">{team.draws}</td>
                      <td className="text-center p-3">{team.losses}</td>
                      <td className="text-center p-3">{team.goals_for}</td>
                      <td className="text-center p-3">{team.goals_against}</td>
                      <td className="text-center p-3">
                        <span className={team.goal_difference > 0 ? 'text-green-600' : team.goal_difference < 0 ? 'text-red-600' : ''}>
                          {team.goal_difference > 0 ? '+' : ''}{team.goal_difference}
                        </span>
                      </td>
                      <td className="text-center p-3 font-bold">{team.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* All Matches */}
          <div>
            <h3 className="text-xl font-bold mb-4">All Matches</h3>
            <div className="space-y-3">
              {groupData.matches?.map((match, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="font-semibold">{match.home_team}</span>
                      <span className="text-2xl font-bold text-soccer-green">{match.scoreline}</span>
                      <span className="font-semibold">{match.away_team}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TournamentSimulator = ({ availableTeams, apiUrl }) => {
  const resolvedApiUrl = process.env.REACT_APP_API_URL || apiUrl || 'http://localhost:8000';
  
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [tournamentResult, setTournamentResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('groups');
  const [groupDialog, setGroupDialog] = useState({ isOpen: false, groupName: '', groupData: null });

  const teamOptions = availableTeams.map(team => ({
    value: team,
    label: team
  }));

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
      const response = await axios.post(`${resolvedApiUrl}/simulate-tournament`, {
        qualified_teams: selectedTeams.map(team => team.value)
      });

      setTournamentResult(response.data.tournament_results);
      setActiveTab('groups'); // Switch to groups tab after simulation
    } catch (err) {
      setError('Failed to simulate tournament. Please try again.');
      console.error('Tournament simulation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGroupClick = (groupName, groupData) => {
    setGroupDialog({ isOpen: true, groupName, groupData });
  };

  const tabs = [
    { id: 'groups', name: 'Group Stage', icon: '📋', disabled: !tournamentResult },
    { id: 'knockout', name: 'Knockout', icon: '⚔️', disabled: !tournamentResult },
    { id: 'final', name: 'Final', icon: '🏆', disabled: !tournamentResult },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-1 world-cup-font">
          Tournament Simulator
        </h2>
        <p className="text-gray-600">
          Select 32 teams and simulate the complete tournament
        </p>
      </div>

      {/* Team Selection Card */}
      <div className="scrapbook-card">
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-end">
            <div className="lg:col-span-2">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold text-gray-700">
                  Select 32 Teams ({selectedTeams.length}/32)
                </label>
                <button
                  onClick={handleQuickSelect}
                  className="btn-secondary text-xs px-3 py-1"
                  disabled={commonTeams.length < 32}
                >
                  Quick Select
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
            </div>
            
            <div className="text-center">
              {selectedTeams.length < 32 && (
                <span className="text-orange-600 font-medium text-sm">
                  Need {32 - selectedTeams.length} more
                </span>
              )}
              {selectedTeams.length === 32 && (
                <span className="text-green-600 font-bold text-sm">
                  Ready to simulate!
                </span>
              )}
              {selectedTeams.length > 32 && (
                <span className="text-red-600 font-medium text-sm">
                  Remove {selectedTeams.length - 32}
                </span>
              )}
            </div>

            <button
              onClick={handleSimulate}
              disabled={loading || selectedTeams.length !== 32}
              className="btn-world-cup py-3"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Simulating...
                </div>
              ) : (
                'Simulate World Cup'
              )}
            </button>
          </div>

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

      {/* Tournament Results */}
      {tournamentResult && (
        <div className="animate-fade-in">
          {/* Tournament Tabs */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-4">
            <div className="flex space-x-0 border-b border-gray-200">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => !tab.disabled && setActiveTab(tab.id)}
                  disabled={tab.disabled}
                  className={`flex-1 flex flex-col items-center justify-center py-3 px-4 font-bold text-sm transition-all duration-200 relative ${
                    activeTab === tab.id && !tab.disabled
                      ? 'bg-world-cup-gold text-white'
                      : tab.disabled
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  } ${tab.id === tabs[0].id ? 'rounded-tl-xl' : tab.id === tabs[tabs.length - 1].id ? 'rounded-tr-xl' : ''}`}
                >
                  <span className="text-lg mb-1">{tab.icon}</span>
                  <span className="text-xs">{tab.name}</span>
                  {activeTab === tab.id && !tab.disabled && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="card">
            {activeTab === 'groups' && (
              <GroupStageTab 
                tournamentResult={tournamentResult} 
                onGroupClick={handleGroupClick}
              />
            )}
            {activeTab === 'knockout' && (
              <KnockoutTab tournamentResult={tournamentResult} />
            )}
            {activeTab === 'final' && (
              <FinalTab tournamentResult={tournamentResult} />
            )}
          </div>

          {/* Simulate Again Button */}
          <div className="text-center mt-6">
            <button
              onClick={handleSimulate}
              disabled={loading || selectedTeams.length !== 32}
              className="btn-secondary text-sm px-6 py-2"
            >
              Simulate Another Tournament
            </button>
          </div>
        </div>
      )}

      {/* Group Details Dialog */}
      <GroupDialog
        isOpen={groupDialog.isOpen}
        onClose={() => setGroupDialog({ isOpen: false, groupName: '', groupData: null })}
        groupName={groupDialog.groupName}
        groupData={groupDialog.groupData}
      />
    </div>
  );
};

export default TournamentSimulator;

