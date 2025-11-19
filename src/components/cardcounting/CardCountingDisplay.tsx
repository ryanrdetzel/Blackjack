import React from 'react';
import { CardCountingState, CountingSystem, getCountingSystemDescription } from '../../lib/cardCounting';

interface CardCountingDisplayProps {
  cardCounting: CardCountingState;
  onToggle: () => void;
  onSystemChange: (system: CountingSystem) => void;
}

export function CardCountingDisplay({ cardCounting, onToggle, onSystemChange }: CardCountingDisplayProps) {
  const { isActive, system, runningCount, trueCount, decksRemaining, recommendations } = cardCounting;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4 shadow-md">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Card Counting</h3>
        <button
          onClick={onToggle}
          className={`px-3 py-1 text-sm font-semibold rounded transition-colors ${
            isActive
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
          }`}
        >
          {isActive ? 'ON' : 'OFF'}
        </button>
      </div>

      {isActive && (
        <>
          {/* System Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Counting System
            </label>
            <select
              value={system}
              onChange={(e) => onSystemChange(e.target.value as CountingSystem)}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-gray-100 text-sm"
            >
              <option value="hi-lo">Hi-Lo (Beginner)</option>
              <option value="ko">Knock-Out (KO)</option>
              <option value="hi-opt-i">Hi-Opt I</option>
              <option value="hi-opt-ii">Hi-Opt II (Advanced)</option>
              <option value="omega-ii">Omega II (Expert)</option>
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {getCountingSystemDescription(system)}
            </p>
          </div>

          {/* Count Display */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded p-3">
              <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">
                Running Count
              </div>
              <div className={`text-2xl font-bold ${
                runningCount > 0 ? 'text-green-600 dark:text-green-400' :
                runningCount < 0 ? 'text-red-600 dark:text-red-400' :
                'text-gray-600 dark:text-gray-400'
              }`}>
                {runningCount > 0 ? '+' : ''}{runningCount}
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded p-3">
              <div className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-1">
                True Count
              </div>
              <div className={`text-2xl font-bold ${
                trueCount > 0 ? 'text-green-600 dark:text-green-400' :
                trueCount < 0 ? 'text-red-600 dark:text-red-400' :
                'text-gray-600 dark:text-gray-400'
              }`}>
                {trueCount > 0 ? '+' : ''}{trueCount}
              </div>
            </div>
          </div>

          {/* Decks Remaining */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
              <span>Decks Remaining</span>
              <span className="font-semibold">{decksRemaining.toFixed(1)}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${(decksRemaining / cardCounting.totalDecks) * 100}%` }}
              />
            </div>
          </div>

          {/* Recommendations */}
          <div className={`rounded-lg p-3 ${
            trueCount >= 2 ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700' :
            trueCount <= -2 ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700' :
            'bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600'
          }`}>
            <div className="text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
              Recommendation
            </div>
            <div className="text-sm text-gray-900 dark:text-gray-100 mb-2">
              {recommendations.suggestion}
            </div>
            <div className="flex gap-2 text-xs">
              <span className={`px-2 py-1 rounded ${
                recommendations.betMultiplier > 1
                  ? 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200'
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200'
              }`}>
                Bet: {recommendations.betMultiplier}x
              </span>
              {recommendations.shouldInsure && (
                <span className="px-2 py-1 rounded bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200">
                  Take Insurance
                </span>
              )}
              {recommendations.shouldDeviate && (
                <span className="px-2 py-1 rounded bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200">
                  Consider Deviations
                </span>
              )}
            </div>
          </div>

          {/* Info Note */}
          <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 italic">
            Note: Card counting is for educational purposes only. Use responsibly.
          </div>
        </>
      )}
    </div>
  );
}
