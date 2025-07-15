import React, { useState, useEffect, useCallback } from 'react';
import { X, Wifi, WifiOff, RefreshCw } from 'lucide-react';

const GolfScoreboard = () => {
  const courseInfo = {
    par: [4, 4, 5, 4, 3, 5, 4, 3, 5, 4, 4, 5, 4, 4, 5, 4, 3, 5],
    totalPar: 72,
    frontNinePar: 37,
    backNinePar: 35
  };

  const teams = {
    Chiefs: [
      { id: 1, pairing: 'Chris-Tyler' },
      { id: 2, pairing: 'Todd-Joe' },
      { id: 3, pairing: 'Steve-Darby' },
      { id: 4, pairing: 'Gardner-Russ' }
    ],
    Royals: [
      { id: 5, pairing: 'Dowell-Rick' },
      { id: 6, pairing: 'Andy-Zac' },
      { id: 7, pairing: 'Marrah-Ben' },
      { id: 8, pairing: 'Ethan-Bross' }
    ]
  };

  const [scores, setScores] = useState(() => {
    const initialScores = {};
    Object.values(teams).flat().forEach(pairing => {
      initialScores[pairing.id] = {
        round1: new Array(18).fill(null),
        round2: new Array(18).fill(null)
      };
    });
    return initialScores;
  });

  const [selectedScorecard, setSelectedScorecard] = useState(null);
  const [isConnected, setIsConnected] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date().toISOString());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // API service methods
  const apiService = {
    // Get all scores from the API
    async getAllScores() {
      try {
        // TODO: Replace with actual API call
        // const response = await fetch('/api/scores');
        // const data = await response.json();
        
        // Hardcoded sample data for now
        const sampleData = {
          scores: {
            "1": {
              "round1": [4, 3, 5, 4, 3, null, null, null, null, null, null, null, null, null, null, null, null, null],
              "round2": [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
            },
            "2": {
              "round1": [3, 4, 4, 5, 3, 4, 3, 5, null, null, null, null, null, null, null, null, null, null],
              "round2": [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
            },
            "3": {
              "round1": [4, 4, 3, 4, 4, 5, 3, 4, 5, 4, 3, null, null, null, null, null, null, null],
              "round2": [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
            },
            "4": {
              "round1": [3, 3, 4, 4, 3, 4, 4, 3, 5, 4, 3, 4, 4, 3, 4, null, null, null],
              "round2": [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
            },
            "5": {
              "round1": [4, 3, 4, 3, 4, 4, 3, 4, 4, 3, 4, 4, 3, 4, 5, 4, 3, 4],
              "round2": [3, 4, 5, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
            },
            "6": {
              "round1": [4, 4, 3, 4, 3, 4, 4, 3, 4, 4, 3, 4, 4, 3, 4, 4, 3, 4],
              "round2": [3, 4, 4, 3, 4, 5, null, null, null, null, null, null, null, null, null, null, null, null]
            },
            "7": {
              "round1": [5, 4, 4, 3, 4, 4, 3, 4, 4, null, null, null, null, null, null, null, null, null],
              "round2": [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
            },
            "8": {
              "round1": [4, 3, 4, 4, 3, 4, 4, 3, 5, 4, 3, 4, 4, 3, 4, 4, 3, 4],
              "round2": [4, 3, 4, 4, 3, 4, 4, 3, 4, 4, 3, 4, 4, 3, 4, 4, 3, 4]
            }
          },
          lastUpdated: new Date().toISOString()
        };
        
        return sampleData;
      } catch (error) {
        console.error('Error fetching scores:', error);
        throw error;
      }
    },

    // Update a single score
    async updateScore(pairingId, round, holeIndex, score) {
      try {
        // TODO: Replace with actual API call
        // const response = await fetch('/api/scores', {
        //   method: 'PUT',
        //   headers: {
        //     'Content-Type': 'application/json',
        //   },
        //   body: JSON.stringify({
        //     pairingId,
        //     round,
        //     holeIndex,
        //     score
        //   })
        // });
        // const data = await response.json();
        
        // Simulate API response
        const mockResponse = {
          success: true,
          message: 'Score updated successfully',
          updatedScore: {
            pairingId,
            round,
            holeIndex,
            score
          },
          timestamp: new Date().toISOString()
        };
        
        return mockResponse;
      } catch (error) {
        console.error('Error updating score:', error);
        throw error;
      }
    }
  };

  // Load scores from API
  const loadScores = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const data = await apiService.getAllScores();
      
      setScores(data.scores);
      setLastUpdated(data.lastUpdated);
      setIsConnected(true);
    } catch (error) {
      console.error('Error loading scores:', error);
      setIsConnected(false);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Save score to API
  const saveScore = async (pairingId, round, holeIndex, score) => {
    try {
      const response = await apiService.updateScore(pairingId, round, holeIndex, score);
      
      if (response.success) {
        setIsConnected(true);
        // Refresh scores after successful update
        setTimeout(() => loadScores(), 500);
      }
    } catch (error) {
      console.error('Error saving score:', error);
      setIsConnected(false);
    }
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    loadScores(); // Initial load
    const interval = setInterval(loadScores, 30000);
    return () => clearInterval(interval);
  }, [loadScores]);

  const calculateRoundTotal = (roundScores) => {
    const validScores = roundScores.filter(score => score !== null && score > 0);
    return validScores.length > 0 ? validScores.reduce((sum, score) => sum + score, 0) : null;
  };

  const calculateHolesRemaining = (roundScores) => {
    return roundScores.filter(score => score === null || score === 0).length;
  };

  const calculateTeamStats = (teamName) => {
    const teamPairings = teams[teamName];
    let totalScore = 0;
    let totalHolesRemaining = 0;
    let totalParForCompletedHoles = 0;
    let hasScores = false;

    teamPairings.forEach(pairing => {
      const pairingScores = scores[pairing.id];
      
      // Round 1
      const round1Total = calculateRoundTotal(pairingScores.round1);
      if (round1Total !== null) {
        totalScore += round1Total;
        hasScores = true;
      }
      const round1Remaining = calculateHolesRemaining(pairingScores.round1);
      totalHolesRemaining += round1Remaining;
      
      // Calculate par for completed holes in round 1
      pairingScores.round1.forEach((score, holeIndex) => {
        if (score !== null && score > 0) {
          totalParForCompletedHoles += courseInfo.par[holeIndex];
        }
      });

      // Round 2
      const round2Total = calculateRoundTotal(pairingScores.round2);
      if (round2Total !== null) {
        totalScore += round2Total;
        hasScores = true;
      }
      const round2Remaining = calculateHolesRemaining(pairingScores.round2);
      totalHolesRemaining += round2Remaining;
      
      // Calculate par for completed holes in round 2
      pairingScores.round2.forEach((score, holeIndex) => {
        if (score !== null && score > 0) {
          totalParForCompletedHoles += courseInfo.par[holeIndex];
        }
      });
    });

    const scoreToPar = hasScores ? totalScore - totalParForCompletedHoles : 0;
    return { scoreToPar, totalHolesRemaining, totalScore };
  };

  const updateScore = (pairingId, round, holeIndex, score) => {
    // Update local state immediately for responsiveness
    setScores(prev => ({
      ...prev,
      [pairingId]: {
        ...prev[pairingId],
        [round]: prev[pairingId][round].map((s, i) => i === holeIndex ? score : s)
      }
    }));
    
    // Save to backend
    saveScore(pairingId, round, holeIndex, score);
  };

  const Scorecard = ({ pairingId, round, onClose }) => {
    const pairing = Object.values(teams).flat().find(p => p.id === pairingId);
    const roundScores = scores[pairingId][round];

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-auto">
        <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] flex flex-col my-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">
              {pairing.pairing} - {round === 'round1' ? 'Round 1' : 'Round 2'}
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>
          
          <div className="flex-1 overflow-auto min-h-0 scrollbar-thin">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-2 pt-0">
              {/* Front 9 */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-center">Front 9</h3>
                <div className="space-y-2">
                  {courseInfo.par.slice(0, 9).map((par, i) => (
                    <div key={i} className="flex items-center justify-between p-2 border rounded">
                      <span className="font-medium w-16">Hole {i + 1}</span>
                      <span className="text-sm text-gray-600 w-12">Par {par}</span>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={roundScores[i] || ''}
                        onChange={(e) => updateScore(pairingId, round, i, parseInt(e.target.value) || null)}
                        className="w-20 px-2 py-1 border rounded text-center"
                        placeholder="Score"
                      />
                    </div>
                  ))}
                  <div className="border-t pt-2 font-semibold">
                    <div className="flex justify-between">
                      <span>Front 9 Total:</span>
                      <span>{calculateRoundTotal(roundScores.slice(0, 9)) || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Back 9 */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-center">Back 9</h3>
                <div className="space-y-2">
                  {courseInfo.par.slice(9, 18).map((par, i) => (
                    <div key={i + 9} className="flex items-center justify-between p-2 border rounded">
                      <span className="font-medium w-16">Hole {i + 10}</span>
                      <span className="text-sm text-gray-600 w-12">Par {par}</span>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={roundScores[i + 9] || ''}
                        onChange={(e) => updateScore(pairingId, round, i + 9, parseInt(e.target.value) || null)}
                        className="w-20 px-2 py-1 border rounded text-center"
                        placeholder="Score"
                      />
                    </div>
                  ))}
                  <div className="border-t pt-2 font-semibold">
                    <div className="flex justify-between">
                      <span>Back 9 Total:</span>
                      <span>{calculateRoundTotal(roundScores.slice(9, 18)) || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 text-center border-t pt-4 flex-shrink-0">
            <div className="text-xl font-bold">
              Round Total: {calculateRoundTotal(roundScores) || 0}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Holes Remaining: {calculateHolesRemaining(roundScores)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">2025 TruckMovers Invitational</h1>
          <p className="text-gray-600">Live Golf Scoreboard</p>
          
          {/* Connection Status */}
          <div className="flex items-center justify-center mt-4 gap-4">
            <div className="flex items-center gap-2">
              {isConnected ? (
                <Wifi className="text-green-600" size={20} />
              ) : (
                <WifiOff className="text-red-600" size={20} />
              )}
              <span className={`text-sm ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            
            <button
              onClick={loadScores}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-3 py-1 bg-blue-100 hover:bg-blue-200 rounded text-blue-800 text-sm disabled:opacity-50"
            >
              <RefreshCw className={isRefreshing ? 'animate-spin' : ''} size={16} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            
            <div className="text-xs text-gray-500">
              Last updated: {new Date(lastUpdated).toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Team Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {Object.keys(teams).map(teamName => {
            const stats = calculateTeamStats(teamName);
            return (
              <div key={teamName} className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">{teamName}</h2>
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold">
                    <span className={stats.scoreToPar >= 0 ? 'text-red-600' : 'text-green-600'}>
                      {stats.scoreToPar > 0 ? '+' : ''}{stats.scoreToPar}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Total Score: {stats.totalScore || 0}
                  </div>
                  <div className="text-sm text-gray-600">
                    Holes Remaining: {stats.totalHolesRemaining}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pairings Grid */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gray-800 text-white p-4">
            <h2 className="text-xl font-bold">Pairings & Scores</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Team</th>
                  <th className="px-4 py-3 text-left font-semibold">Pairing</th>
                  <th className="px-4 py-3 text-center font-semibold">Round 1</th>
                  <th className="px-4 py-3 text-center font-semibold">Round 2</th>
                  <th className="px-4 py-3 text-center font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(teams).map(([teamName, pairings]) =>
                  pairings.map((pairing, index) => {
                    const round1Scores = scores[pairing.id].round1;
                    const round2Scores = scores[pairing.id].round2;
                    
                    const round1Total = calculateRoundTotal(round1Scores);
                    const round2Total = calculateRoundTotal(round2Scores);
                    
                    // Check if rounds are complete (all 18 holes filled)
                    const round1Complete = round1Scores.every(score => score !== null && score > 0);
                    const round2Complete = round2Scores.every(score => score !== null && score > 0);
                    const totalComplete = round1Complete && round2Complete;
                    
                    // Calculate par for completed holes in each round
                    let round1ParForCompletedHoles = 0;
                    round1Scores.forEach((score, holeIndex) => {
                      if (score !== null && score > 0) {
                        round1ParForCompletedHoles += courseInfo.par[holeIndex];
                      }
                    });
                    
                    let round2ParForCompletedHoles = 0;
                    round2Scores.forEach((score, holeIndex) => {
                      if (score !== null && score > 0) {
                        round2ParForCompletedHoles += courseInfo.par[holeIndex];
                      }
                    });
                    
                    // Calculate scores to par
                    const round1ToPar = round1Total ? round1Total - round1ParForCompletedHoles : 0;
                    const round2ToPar = round2Total ? round2Total - round2ParForCompletedHoles : 0;
                    
                    const totalScore = (round1Total || 0) + (round2Total || 0);
                    const totalParForCompletedHoles = round1ParForCompletedHoles + round2ParForCompletedHoles;
                    const totalToPar = totalScore - totalParForCompletedHoles;
                    
                    // Format display values
                    const formatScore = (score, toPar, isComplete, fullPar) => {
                      if (!score) return 'Enter';
                      
                      if (isComplete) {
                        const completeToPar = score - fullPar;
                        return `${score} (${completeToPar > 0 ? '+' : ''}${completeToPar})`;
                      } else {
                        return `${toPar > 0 ? '+' : ''}${toPar}`;
                      }
                    };

                    return (
                      <tr key={pairing.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{teamName}</td>
                        <td className="px-4 py-3">{pairing.pairing}</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => setSelectedScorecard({ pairingId: pairing.id, round: 'round1' })}
                            className="px-3 py-1 bg-blue-100 hover:bg-blue-200 rounded text-blue-800 font-medium"
                          >
                            {formatScore(round1Total, round1ToPar, round1Complete, courseInfo.totalPar)}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => setSelectedScorecard({ pairingId: pairing.id, round: 'round2' })}
                            className="px-3 py-1 bg-blue-100 hover:bg-blue-200 rounded text-blue-800 font-medium"
                          >
                            {formatScore(round2Total, round2ToPar, round2Complete, courseInfo.totalPar)}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-center font-bold">
                          {totalScore > 0 ? (
                            <span className={totalToPar >= 0 ? 'text-red-600' : 'text-green-600'}>
                              {totalComplete ? 
                                `${totalScore} (${totalToPar > 0 ? '+' : ''}${totalToPar})` :
                                `${totalToPar > 0 ? '+' : ''}${totalToPar}`
                              }
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Scorecard Modal */}
        {selectedScorecard && (
          <Scorecard
            pairingId={selectedScorecard.pairingId}
            round={selectedScorecard.round}
            onClose={() => setSelectedScorecard(null)}
          />
        )}
      </div>
    </div>
  );
};

export default GolfScoreboard;
