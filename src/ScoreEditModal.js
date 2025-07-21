import React from 'react';
import { X } from 'lucide-react';

const ScoreEditModal = ({ pairingId, round, holeIndex, currentScore, onClose, onSave, teams, courseInfo }) => {
  const pairing = Object.values(teams).flat().find(p => p.id === pairingId);
  const par = courseInfo.par[holeIndex];

  const handleScoreSelect = (score) => {
    onSave(pairingId, round, holeIndex, score);
    onClose();
  };

  const getScoreButtonClass = (score) => {
    const toPar = score - par;
    const isSelected = score === currentScore;
    
    let baseClass = "px-4 py-3 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 ";
    
    if (isSelected) {
      baseClass += "ring-2 ring-blue-500 ";
    }
    
    if (toPar < 0) {
      return baseClass + "bg-green-400 hover:bg-green-500 text-white";
    } else if (toPar === 0) {
      return baseClass + "bg-blue-400 hover:bg-blue-500 text-white";
    } else {
      return baseClass + "bg-red-400 hover:bg-red-500 text-white";
    }
  };

  const scoreOptions = [];
  for (let i = 1; i <= par + 2; i++) {
    scoreOptions.push(i);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">
            {pairing.pairing} - Hole {holeIndex + 1}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            {round === 'round1' ? 'Round 1' : 'Round 2'} • Par {par}
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Score
          </label>
          <div className="grid grid-cols-3 gap-3">
            {scoreOptions.map(score => (
              <button
                key={score}
                onClick={() => handleScoreSelect(score)}
                className={getScoreButtonClass(score)}
              >
                {score}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-orange-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          {currentScore && (
            <button
              type="button"
              onClick={() => {
                onSave(pairingId, round, holeIndex, null);
                onClose();
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScoreEditModal;