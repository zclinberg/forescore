import React, { useState, useEffect, useCallback } from 'react';
import { Wifi, WifiOff, RefreshCw, Play, Pause, Volume2 } from 'lucide-react';
import ScoreEditModal from './ScoreEditModal';
import Scorecard from './Scorecard';

const GolfScoreboard = () => {
  // Show 404 message instead of the golf scoreboard
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      fontFamily: 'Arial, sans-serif',
      textAlign: 'center'
    }}>
      <h1 style={{
        fontSize: '6rem',
        color: '#333',
        marginBottom: '1rem',
        fontWeight: 'bold'
      }}>404</h1>
      <p style={{
        fontSize: '1.5rem',
        color: '#666',
        marginBottom: '2rem'
      }}>Page not found</p>
      <p style={{
        fontSize: '1rem',
        color: '#999'
      }}>This site is currently unavailable.</p>
    </div>
  );

  // Original golf scoreboard code preserved below (unreachable)
  const OriginalGolfScoreboard = () => {
  const courseInfo = {
    par: [4, 4, 5, 4, 3, 4, 3, 5, 4, 4, 4, 5, 4, 4, 3, 4, 3, 5],
    totalPar: 72,
    frontNinePar: 36,
    backNinePar: 36
  };

  const teams = {
    Royals: [
      { id: 5, pairing: 'Dowell-Rick' },
      { id: 6, pairing: 'Andy-Zac' },
      { id: 7, pairing: 'Marrah-Ben' },
      { id: 8, pairing: 'Ethan-Bross' }
    ],
    Chiefs: [
      { id: 1, pairing: 'Chris-Tyler' },
      { id: 2, pairing: 'Todd-Joe' },
      { id: 3, pairing: 'Steve-Darby' },
      { id: 4, pairing: 'Gardner-Russ' }
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
  const [editingScore, setEditingScore] = useState(null);
  const [isConnected, setIsConnected] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date().toISOString());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioRef, setAudioRef] = useState(null);

  // API service methods
  const apiService = {
    // Get all scores from the API
    async getAllScores() {
      try {
        const response = await fetch('https://forescore.app/api/scores');
        const data = await response.json();
        
        return data;
      } catch (error) {
        console.error('Error fetching scores:', error);
        throw error;
      }
    },

    // Update a single score
    async updateScore(pairingId, round, holeIndex, score) {
      try {
        const response = await fetch('https://forescore.app/api/scores', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            pairingId,
            round,
            holeIndex,
            score
          })
        });
        const data = await response.json();
        
        return data;
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

  // Initialize audio only when ready to show play button
  useEffect(() => {
    // Check if Gardner-Russ has a score on hole 5 of round 1
    const gardnerRussPairing = Object.entries(teams).flatMap(([teamName, pairings]) =>
      pairings.map(pairing => ({ ...pairing, teamName }))
    ).find(pairing => pairing.pairing === 'Gardner-Russ');
    
    const hasMinimumHoles = gardnerRussPairing && 
      scores[gardnerRussPairing.id].round1[4] !== null; // hole 5 is index 4
    
    if (hasMinimumHoles && !audioRef) {
      const audio = new Audio('/takes-a-lot-of-balls.mp3');
      audio.loop = true;
      audio.volume = 0.5;
      
      audio.addEventListener('error', (e) => {
        console.error('Audio loading error:', e);
      });
      
      audio.addEventListener('loadstart', () => {
        console.log('Audio loading started');
      });
      
      audio.addEventListener('canplaythrough', () => {
        console.log('Audio can play through');
      });
      
      setAudioRef(audio);
    }
    
    return () => {
      if (audioRef && !hasMinimumHoles) {
        audioRef.pause();
        audioRef.currentTime = 0;
        setAudioRef(null);
      }
    };
  }, [teams, scores, audioRef]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    loadScores(); // Initial load
    const interval = setInterval(loadScores, 30000);
    return () => clearInterval(interval);
  }, [loadScores]);

  const toggleMusic = () => {
    if (audioRef) {
      if (isPlaying) {
        audioRef.pause();
      } else {
        audioRef.play().catch(error => {
          console.error('Error playing audio:', error);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const calculateRoundTotal = (roundScores) => {
    const validScores = roundScores.filter(score => score !== null);
    return validScores.length > 0 ? validScores.reduce((sum, score) => sum + score, 0) : null;
  };

  const calculateHolesRemaining = (roundScores) => {
    return roundScores.filter(score => score === null).length;
  };

  const calculateParForCompletedHoles = (roundScores) => {
    let totalPar = 0;
    roundScores.forEach((score, holeIndex) => {
      if (score !== null) {
        totalPar += courseInfo.par[holeIndex];
      }
    });
    return totalPar;
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
        if (score !== null) {
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
        if (score !== null) {
          totalParForCompletedHoles += courseInfo.par[holeIndex];
        }
      });
    });

const scoreToPar = hasScores ? totalScore - totalParForCompletedHoles : 0;
    return { scoreToPar, totalHolesRemaining, totalScore, hasScores };
  };

  const updateScore = (pairingId, round, holeIndex, score) => {
    // Convert 0 to null for backend
    const backendScore = score === 0 ? null : score;
    
    // Update local state immediately for responsiveness
    setScores(prev => ({
      ...prev,
      [pairingId]: {
        ...prev[pairingId],
        [round]: prev[pairingId][round].map((s, i) => i === holeIndex ? backendScore : s)
      }
    }));
    
    // Save to backend
    saveScore(pairingId, round, holeIndex, backendScore);
  };



  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-black mb-2">2025 TruckMovers Invitational</h1>
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
Last updated: {new Date().toLocaleTimeString('en-US', { timeZone: 'America/Chicago' })} CT
            </div>
          </div>

          {/* Music Player */}
          {(() => {
            // Check if Gardner-Russ has a score on hole 5 of round 1
            const gardnerRussPairing = Object.entries(teams).flatMap(([teamName, pairings]) =>
              pairings.map(pairing => ({ ...pairing, teamName }))
            ).find(pairing => pairing.pairing === 'Gardner-Russ');
            
            const hasMinimumHoles = gardnerRussPairing && 
              scores[gardnerRussPairing.id].round1[4] !== null; // hole 5 is index 4
            
            return (
              <div className="w-full max-w-7xl mx-auto mt-4 ">
                <div className="flex items-center justify-around gap-2 px-4 py-2 bg-gradient-to-br from-orange-50 via-orange-100 to-orange-200 hover:from-orange-100 hover:via-orange-200 hover:to-orange-300 rounded-lg border-2 border-orange-400 text-orange-900">
                  <img 
                    src="/albumart.png" 
                    alt="Album art for It Takes a lot of Balls"
                    className="w-20 h-20 rounded-lg shadow-md object-cover"
                  />
                  {hasMinimumHoles ? (
                    <button
                      onClick={toggleMusic}
                      className="flex items-center gap-2"
                    >
                      {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                      {isPlaying ? 'Pause' : 'Play'}
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 text-orange-700 ">
                      Coming soon to a fairway near you 🎶
                    </div>
                  )}
                  {hasMinimumHoles && (
                    <div className="text-sm text-orange-800 border-l border-orange-400 pl-3">
                      <div className="font-medium">Takes a lot of Balls</div>
                      <div className="text-orange-700">by Sir Shanks-a-Lot aka Russ D</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Team Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {(() => {
            // Calculate stats for all teams to find the worst
            const allTeamStats = Object.keys(teams).map(teamName => ({
              teamName,
              stats: calculateTeamStats(teamName)
            }));
            
            // Find the worst team (highest score to par, but only if they have scores)
            const teamsWithScores = allTeamStats.filter(team => team.stats.hasScores);
            const worstTeam = teamsWithScores.length > 0 ? 
              teamsWithScores.reduce((worst, current) => 
                current.stats.scoreToPar > worst.stats.scoreToPar ? current : worst
              ) : null;
            
            // Find the best team (lowest score to par, but only if they have scores)
            const bestTeam = teamsWithScores.length > 0 ? 
              teamsWithScores.reduce((best, current) => 
                current.stats.scoreToPar < best.stats.scoreToPar ? current : best
              ) : null;
            
            // Check if both teams have 0 holes remaining (all holes completed)
            const bothTeamsComplete = allTeamStats.every(team => team.stats.totalHolesRemaining === 0);
            
            return allTeamStats.map(({ teamName, stats }) => {
              const isWorstTeam = worstTeam && teamName === worstTeam.teamName;
              const isBestTeam = bestTeam && teamName === bestTeam.teamName;
              return (
              <div key={teamName} className={`rounded-lg shadow-lg p-6 border-2 ${
                teamName === 'Chiefs' 
                  ? 'border-red-500 bg-gradient-to-br from-red-50 via-red-100 to-red-200' 
                  : 'border-blue-500 bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200'
              }`}>
                <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">{teamName}</h2>
                <p className="text-center text-sm text-gray-600 mb-4">
                  {teamName === 'Royals' ? '#FountainsUp⛲️🆙' : '#ChiefsKingdom🔴🟡'}
                </p>
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold">
<span className={
                      stats.scoreToPar === 0 
                        ? 'text-black' 
                        : stats.scoreToPar > 0 
                        ? 'text-red-600' 
                        : 'text-green-600'
                    }>
{!stats.hasScores ? '-' : stats.scoreToPar === 0 ? 'EVEN' : (stats.scoreToPar > 0 ? '+' : '') + stats.scoreToPar}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
Total Score: {!stats.hasScores ? '-' : stats.totalScore || 0}
                  </div>
                  <div className="text-sm text-gray-600">
                    Holes Remaining: {stats.totalHolesRemaining}
                  </div>
                </div>
                {bothTeamsComplete && isBestTeam && (
                  <div className="mt-6">
                    <iframe 
                      style={{borderRadius: '12px'}} 
                      src="https://open.spotify.com/embed/track/6AI3ezQ4o3HUoP6Dhudph3?utm_source=generator" 
                      width="100%" 
                      height="152" 
                      frameBorder="0" 
                      allowfullscreen="" 
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                      loading="lazy"
                    />
                  </div>
                )}
                {bothTeamsComplete && isWorstTeam && (
                  <div className="mt-6">
                    <iframe 
                      style={{borderRadius: '12px'}} 
                      src="https://open.spotify.com/embed/track/6U7hJoo1kiTZI69cEF8uCD?utm_source=generator" 
                      width="100%" 
                      height="152" 
                      frameBorder="0" 
                      allowfullscreen="" 
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                      loading="lazy"
                    />
                  </div>
                )}
              </div>
            );
          });
        })()}
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
                {(() => {
                  const allPairings = Object.entries(teams)
                    .flatMap(([teamName, pairings]) =>
                      pairings.map(pairing => ({ ...pairing, teamName }))
                    );
                  
                  // Check if at least 6 holes have been played by any pairing
                  const hasMinimumHoles = allPairings.some(pairing => {
                    const round1Scores = scores[pairing.id].round1;
                    const round2Scores = scores[pairing.id].round2;
                    const totalHolesPlayed = round1Scores.filter(score => score !== null).length + 
                                           round2Scores.filter(score => score !== null).length;
                    return totalHolesPlayed >= 2;
                  });
                  
                  const sortedPairings = allPairings.sort((a, b) => {
                    const getScoreToPar = (pairing) => {
                      const round1Scores = scores[pairing.id].round1;
                      const round2Scores = scores[pairing.id].round2;
                      
                      let totalScore = 0;
                      let totalParForCompletedHoles = 0;
                      
                      round1Scores.forEach((score, holeIndex) => {
                        if (score !== null) {
                          totalScore += score;
                          totalParForCompletedHoles += courseInfo.par[holeIndex];
                        }
                      });
                      
                      round2Scores.forEach((score, holeIndex) => {
                        if (score !== null) {
                          totalScore += score;
                          totalParForCompletedHoles += courseInfo.par[holeIndex];
                        }
                      });
                      
                      return totalScore > 0 ? totalScore - totalParForCompletedHoles : 0;
                    };
                    
                    const aScoreToPar = getScoreToPar(a);
                    const bScoreToPar = getScoreToPar(b);
                    
                    return aScoreToPar - bScoreToPar;
                  });
                  
                  return sortedPairings.map((pairing, index) => {
                    const round1Scores = scores[pairing.id].round1;
                    const round2Scores = scores[pairing.id].round2;
                    
                    const round1Total = calculateRoundTotal(round1Scores);
                    const round2Total = calculateRoundTotal(round2Scores);
                    
                    // Check if rounds are complete (all 18 holes filled)
                    const round1Complete = round1Scores.every(score => score !== null);
                    const round2Complete = round2Scores.every(score => score !== null);
                    const totalComplete = round1Complete && round2Complete;
                    
                    // Calculate par for completed holes in each round
                    let round1ParForCompletedHoles = 0;
                    round1Scores.forEach((score, holeIndex) => {
                      if (score !== null) {
                        round1ParForCompletedHoles += courseInfo.par[holeIndex];
                      }
                    });
                    
                    let round2ParForCompletedHoles = 0;
                    round2Scores.forEach((score, holeIndex) => {
                      if (score !== null) {
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
return `${score} (${completeToPar === 0 ? 'EVEN' : (completeToPar > 0 ? '+' : '') + completeToPar})`;
                      } else {
                        return toPar === 0 ? 'EVEN' : `${toPar > 0 ? '+' : ''}${toPar}`;
                      }
                    };

                    // Determine if this pairing should show ranking emojis
                    const isFirstPlace = hasMinimumHoles && index === 0;
                    const isLastPlace = hasMinimumHoles && index === sortedPairings.length - 1;
                    
                    return (
                      <tr key={pairing.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{pairing.teamName}</td>
                        <td className="px-4 py-3">
                          {pairing.pairing}
                          {isFirstPlace && <span className="ml-2">👑</span>}
                          {isLastPlace && <span className="ml-2">💩</span>}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => setSelectedScorecard({ pairingId: pairing.id, round: 'round1' })}
                            className={`px-3 py-1 rounded font-medium ${
                              formatScore(round1Total, round1ToPar, round1Complete, courseInfo.totalPar) === 'Enter'
                                ? 'bg-orange-100 hover:bg-orange-200 text-orange-800'
                                : round1ToPar < 0
                                ? 'bg-green-100 hover:bg-green-200 text-green-800'
                                : round1ToPar === 0
                                ? 'bg-blue-100 hover:bg-blue-200 text-blue-800'
                                : 'bg-red-100 hover:bg-red-200 text-red-800'
                            }`}
                          >
                            {formatScore(round1Total, round1ToPar, round1Complete, courseInfo.totalPar)}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => setSelectedScorecard({ pairingId: pairing.id, round: 'round2' })}
                            className={`px-3 py-1 rounded font-medium ${
                              formatScore(round2Total, round2ToPar, round2Complete, courseInfo.totalPar) === 'Enter'
                                ? 'bg-orange-100 hover:bg-orange-200 text-orange-800'
                                : round2ToPar < 0
                                ? 'bg-green-100 hover:bg-green-200 text-green-800'
                                : round2ToPar === 0
                                ? 'bg-blue-100 hover:bg-blue-200 text-blue-800'
                                : 'bg-red-100 hover:bg-red-200 text-red-800'
                            }`}
                          >
                            {formatScore(round2Total, round2ToPar, round2Complete, courseInfo.totalPar)}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-center font-bold">
                          {totalScore > 0 ? (
                            <span className={totalToPar >= 0 ? 'text-red-600' : 'text-green-600'}>
{totalComplete ? 
                                `${totalScore} (${totalToPar === 0 ? 'EVEN' : (totalToPar > 0 ? '+' : '') + totalToPar})` :
                                (totalToPar === 0 ? 'EVEN' : `${totalToPar > 0 ? '+' : ''}${totalToPar}`)
                              }
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>
        </div>

        {/* Full-Screen Scorecard */}
        {selectedScorecard && (
          <Scorecard
            pairingId={selectedScorecard.pairingId}
            round={selectedScorecard.round}
            onClose={() => setSelectedScorecard(null)}
            teams={teams}
            scores={scores}
            courseInfo={courseInfo}
            onScoreClick={(pairingId, round, holeIndex, currentScore) => {
              setEditingScore({ pairingId, round, holeIndex, currentScore });
            }}
          />
        )}

        {/* Score Edit Modal */}
        {editingScore && (
          <ScoreEditModal
            pairingId={editingScore.pairingId}
            round={editingScore.round}
            holeIndex={editingScore.holeIndex}
            currentScore={editingScore.currentScore}
            onClose={() => setEditingScore(null)}
            onSave={updateScore}
            teams={teams}
            courseInfo={courseInfo}
          />
        )}
      </div>
    </div>
  );
  }; // End of OriginalGolfScoreboard function
};

export default GolfScoreboard;
