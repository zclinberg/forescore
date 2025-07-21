import React from 'react';
import { X } from 'lucide-react';

const Scorecard = ({ pairingId, round, onClose, teams, scores, courseInfo, onScoreClick }) => {
  const pairing = Object.values(teams).flat().find(p => p.id === pairingId);
  const roundScores = scores[pairingId][round];
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

  const handleScoreClick = (holeIndex) => {
    onScoreClick(pairingId, round, holeIndex, roundScores[holeIndex]);
  };

  const getScoreButtonClass = (score, par) => {
    if (!score) return 'bg-orange-100 hover:bg-orange-200 text-orange-800 font-semibold';
    
    const toPar = score - par;
    const baseClass = "font-semibold transition-all transform hover:scale-105 ";
    
    if (toPar < 0) return baseClass + 'bg-green-400 hover:bg-green-500 text-white';
    if (toPar === 0) return baseClass + 'bg-blue-400 hover:bg-blue-500 text-white';
    return baseClass + 'bg-red-400 hover:bg-red-500 text-white';
  };

  const getScoreEmoji = (score, par) => {
    if (!score) return '';
    
    const toPar = score - par;
    if (toPar <= -3) return '🦅🦅'; // Eagle
    if (toPar === -2) return '🦅'; // Eagle
    if (toPar === -1) return '🐦'; // Birdie
    if (toPar === 1) return '👎'; // Bogey
    if (toPar === 2) return '💀'; // Double bogey
    if (toPar >= 3) return '🤢'; // Triple bogey or worse
    return ''; // Par (no emoji)
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 text-white p-4">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold">
            {pairing.pairing} - {round === 'round1' ? 'Round 1' : 'Round 2'}
          </h1>
          <button 
            onClick={onClose} 
            className="text-white hover:text-gray-300 p-2"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      {/* Scorecard Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-8">
            {/* Front 9 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4 text-center">
                Front 9 {round === 'round1' ? '(Scramble)' : '(Alternating Shot)'}
              </h2>
              <div className="space-y-3">
                {courseInfo.par.slice(0, 9).map((par, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <span className="font-semibold text-lg w-16">Hole {i + 1}</span>
                      <span className="text-sm text-gray-600 w-12">Par {par}</span>
                    </div>
                    <button
                      onClick={() => handleScoreClick(i)}
                      className={`px-4 py-3 rounded-lg text-lg min-w-[80px] ${
                        getScoreButtonClass(roundScores[i], par)
                      }`}
                    >
                      {roundScores[i] ? (
                        <span>
                          {roundScores[i]} {getScoreEmoji(roundScores[i], par)}
                        </span>
                      ) : (
                        'Enter'
                      )}
                    </button>
                  </div>
                ))}
                <div className="border-t pt-3 mt-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Front 9 Total:</span>
                    <span>
{calculateRoundTotal(roundScores.slice(0, 9)) || (roundScores.slice(0, 9).some(score => score !== null) ? "EVEN" : "-")}
                      {calculateRoundTotal(roundScores.slice(0, 9)) && (
                        <span className="text-sm ml-2 text-red-600">
({(() => {
                            const toPar = calculateRoundTotal(roundScores.slice(0, 9)) - calculateParForCompletedHoles(roundScores.slice(0, 9));
                            return toPar === 0 ? 'EVEN' : (toPar > 0 ? '+' : '') + toPar;
                          })()})
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Back 9 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4 text-center">
                Back 9 {round === 'round1' ? '(Alternating Shot)' : '(Scramble)'}
              </h2>
              <div className="space-y-3">
                {courseInfo.par.slice(9, 18).map((par, i) => (
                  <div key={i + 9} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <span className="font-semibold text-lg w-16">Hole {i + 10}</span>
                      <span className="text-sm text-gray-600 w-12">Par {par}</span>
                    </div>
                    <button
                      onClick={() => handleScoreClick(i + 9)}
                      className={`py-3 rounded-lg text-lg min-w-[80px] ${
                        getScoreButtonClass(roundScores[i + 9], par)
                      }`}
                    >
                      {roundScores[i + 9] ? (
                        <span className="flex items-center justify-center gap-2">
                          {roundScores[i + 9]}
                          {getScoreEmoji(roundScores[i + 9], par)}
                        </span>
                      ) : (
                        'Enter'
                      )}
                    </button>
                  </div>
                ))}
                <div className="border-t pt-3 mt-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Back 9 Total:</span>
                    <span>
{calculateRoundTotal(roundScores.slice(9, 18)) || (roundScores.slice(9, 18).some(score => score !== null) ? "EVEN" : "-")}
                      {calculateRoundTotal(roundScores.slice(9, 18)) && (
                        <span className="text-sm ml-2 text-red-600">
({(() => {
                            const toPar = calculateRoundTotal(roundScores.slice(9, 18)) - calculateParForCompletedHoles(roundScores.slice(9, 18));
                            return toPar === 0 ? 'EVEN' : (toPar > 0 ? '+' : '') + toPar;
                          })()})
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Round Summary */}
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">
Round Total: {calculateRoundTotal(roundScores) || (roundScores.some(score => score !== null) ? "EVEN" : "-")}
              </div>
              <div className="text-lg text-gray-600">
                Holes Remaining: {calculateHolesRemaining(roundScores)}
              </div>
              {calculateRoundTotal(roundScores) && (
                <div className="mt-2 text-lg">
                  <span className="text-gray-600">Score to Par: </span>
                  <span className={`font-semibold ${
                    (calculateRoundTotal(roundScores) || 0) - calculateParForCompletedHoles(roundScores) >= 0 
                      ? 'text-red-600' 
                      : 'text-green-600'
                  }`}>
{((calculateRoundTotal(roundScores) || 0) - calculateParForCompletedHoles(roundScores)) === 0 ? 'EVEN' : 
                      ((calculateRoundTotal(roundScores) || 0) - calculateParForCompletedHoles(roundScores) > 0 ? '+' : '') + 
                      ((calculateRoundTotal(roundScores) || 0) - calculateParForCompletedHoles(roundScores))}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scorecard;