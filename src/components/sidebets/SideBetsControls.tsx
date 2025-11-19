import React, { useState } from 'react';
import { GameState } from '../../lib/gameState';

interface SideBetsControlsProps {
  state: GameState;
  onPlaceSideBet: (perfectPairs: number, twentyOnePlus3: number) => void;
}

export function SideBetsControls({ state, onPlaceSideBet }: SideBetsControlsProps) {
  const [perfectPairs, setPerfectPairs] = useState(0);
  const [twentyOnePlus3, setTwentyOnePlus3] = useState(0);

  if (!state.config.sideBetsEnabled) {
    return null;
  }

  const isDisabled = state.phase !== 'betting';
  const chipValues = [1, 5, 10, 25, 50, 100];

  const handleReset = () => {
    setPerfectPairs(0);
    setTwentyOnePlus3(0);
    onPlaceSideBet(0, 0);
  };

  const handleApply = () => {
    onPlaceSideBet(perfectPairs, twentyOnePlus3);
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4 shadow-md">
      <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">Side Bets</h3>

      {/* Perfect Pairs */}
      {state.config.perfectPairsEnabled && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Perfect Pairs
            </label>
            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
              ${perfectPairs}
            </span>
          </div>
          <div className="flex gap-1 flex-wrap">
            {chipValues.map((value) => (
              <button
                key={`pp-${value}`}
                onClick={() => setPerfectPairs((prev) => Math.min(prev + value, state.balance))}
                disabled={isDisabled || perfectPairs >= state.balance}
                className="px-3 py-1 text-sm font-semibold bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded transition-colors"
              >
                +${value}
              </button>
            ))}
            <button
              onClick={() => setPerfectPairs(0)}
              disabled={isDisabled}
              className="px-3 py-1 text-sm font-semibold bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded transition-colors"
            >
              Clear
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Perfect: 25:1 | Colored: 12:1 | Mixed: 6:1
          </p>
        </div>
      )}

      {/* 21+3 */}
      {state.config.twentyOnePlus3Enabled && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              21+3
            </label>
            <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
              ${twentyOnePlus3}
            </span>
          </div>
          <div className="flex gap-1 flex-wrap">
            {chipValues.map((value) => (
              <button
                key={`21-${value}`}
                onClick={() => setTwentyOnePlus3((prev) => Math.min(prev + value, state.balance))}
                disabled={isDisabled || twentyOnePlus3 >= state.balance}
                className="px-3 py-1 text-sm font-semibold bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded transition-colors"
              >
                +${value}
              </button>
            ))}
            <button
              onClick={() => setTwentyOnePlus3(0)}
              disabled={isDisabled}
              className="px-3 py-1 text-sm font-semibold bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded transition-colors"
            >
              Clear
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Suited Trips: 100:1 | Straight Flush: 40:1 | 3-Kind: 30:1
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-3">
        <button
          onClick={handleApply}
          disabled={isDisabled}
          className="flex-1 px-4 py-2 text-sm font-semibold bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded transition-colors"
        >
          Place Side Bets
        </button>
        <button
          onClick={handleReset}
          disabled={isDisabled}
          className="px-4 py-2 text-sm font-semibold bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Total */}
      {(perfectPairs > 0 || twentyOnePlus3 > 0) && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Total Side Bets:
            </span>
            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
              ${perfectPairs + twentyOnePlus3}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
