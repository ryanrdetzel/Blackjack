import { useState } from 'react';
import { DifficultyLevel } from '../../lib/gameState';

interface SpeedTrainingControlsProps {
  isActive: boolean;
  onStart: (difficulty: DifficultyLevel, handsTarget: number, accuracyTarget: number, speedTarget: number) => void;
  onStop: () => void;
}

export function SpeedTrainingControls({ isActive, onStart, onStop }: SpeedTrainingControlsProps) {
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('beginner');
  const [handsTarget, setHandsTarget] = useState(20);
  const [accuracyTarget, setAccuracyTarget] = useState(90);
  const [speedTarget, setSpeedTarget] = useState(5000);

  const handleStart = () => {
    onStart(difficulty, handsTarget, accuracyTarget, speedTarget);
  };

  const difficultyInfo: Record<DifficultyLevel, { time: string; description: string }> = {
    beginner: { time: '10s', description: 'Perfect for learning' },
    intermediate: { time: '7s', description: 'Building confidence' },
    advanced: { time: '5s', description: 'Getting serious' },
    expert: { time: '3s', description: 'Casino speed!' },
  };

  if (isActive) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">Speed Training Active</h3>
            <p className="text-gray-400 text-sm">Make quick, accurate decisions!</p>
          </div>
          <button
            onClick={onStop}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
          >
            Stop Session
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <h3 className="text-xl font-bold text-white mb-4">Start Speed Training</h3>

      {/* Difficulty selection */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-300 mb-3">
          Difficulty Level
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(['beginner', 'intermediate', 'advanced', 'expert'] as DifficultyLevel[]).map((level) => (
            <button
              key={level}
              onClick={() => setDifficulty(level)}
              className={`p-3 rounded-lg border-2 transition-all ${
                difficulty === level
                  ? 'border-blue-500 bg-blue-500/20 text-white'
                  : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
              }`}
            >
              <div className="font-semibold capitalize">{level}</div>
              <div className="text-xs mt-1 font-mono">{difficultyInfo[level].time}</div>
              <div className="text-xs text-gray-400 mt-1">{difficultyInfo[level].description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Session goals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Hands Target
          </label>
          <input
            type="number"
            min="5"
            max="100"
            value={handsTarget}
            onChange={(e) => setHandsTarget(parseInt(e.target.value))}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-400 mt-1">Number of hands to play</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Accuracy Goal (%)
          </label>
          <input
            type="number"
            min="50"
            max="100"
            value={accuracyTarget}
            onChange={(e) => setAccuracyTarget(parseInt(e.target.value))}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-400 mt-1">Target accuracy percentage</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Speed Goal (ms)
          </label>
          <input
            type="number"
            min="1000"
            max="10000"
            step="500"
            value={speedTarget}
            onChange={(e) => setSpeedTarget(parseInt(e.target.value))}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-400 mt-1">Average decision time</p>
        </div>
      </div>

      {/* Start button */}
      <button
        onClick={handleStart}
        className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-bold text-lg transition-all shadow-lg hover:shadow-xl"
      >
        🚀 Start Speed Training
      </button>

      {/* Info */}
      <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <p className="text-sm text-blue-300">
          <span className="font-semibold">💡 Tip:</span> Speed training helps you make optimal decisions
          quickly. Progressive difficulty automatically increases as you improve!
        </p>
      </div>
    </div>
  );
}
