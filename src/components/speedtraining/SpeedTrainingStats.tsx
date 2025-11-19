import { SpeedTrainingSession, DifficultyLevel } from '../../lib/gameState';

interface SpeedTrainingStatsProps {
  session: SpeedTrainingSession | null;
  difficulty: DifficultyLevel;
  sessionGoal: {
    handsTarget: number;
    accuracyTarget: number;
    speedTarget: number;
  };
  consecutiveCorrectFast: number;
}

export function SpeedTrainingStats({
  session,
  difficulty,
  sessionGoal,
  consecutiveCorrectFast,
}: SpeedTrainingStatsProps) {
  if (!session) {
    return null;
  }

  const accuracy = session.totalDecisions > 0
    ? (session.correctDecisions / session.totalDecisions) * 100
    : 0;

  const handsProgress = (session.handsPlayed / sessionGoal.handsTarget) * 100;
  const accuracyProgress = (accuracy / sessionGoal.accuracyTarget) * 100;
  const speedProgress = session.averageDecisionTime > 0
    ? (sessionGoal.speedTarget / session.averageDecisionTime) * 100
    : 0;

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 75) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const difficultyColors: Record<DifficultyLevel, string> = {
    beginner: 'bg-green-600',
    intermediate: 'bg-blue-600',
    advanced: 'bg-purple-600',
    expert: 'bg-red-600',
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Speed Training Stats</h3>
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-full text-white text-sm font-semibold ${difficultyColors[difficulty]}`}>
            {difficulty.toUpperCase()}
          </span>
          {consecutiveCorrectFast > 0 && (
            <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-sm font-semibold border border-yellow-500/40">
              🔥 {consecutiveCorrectFast} streak
            </span>
          )}
        </div>
      </div>

      {/* Real-time metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="text-gray-400 text-xs mb-1">Decisions</div>
          <div className="text-2xl font-bold text-white">{session.totalDecisions}</div>
          <div className="text-xs text-green-400">
            {session.correctDecisions} correct
          </div>
        </div>

        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="text-gray-400 text-xs mb-1">Accuracy</div>
          <div className="text-2xl font-bold text-white">{accuracy.toFixed(1)}%</div>
          <div className="text-xs text-gray-400">
            Goal: {sessionGoal.accuracyTarget}%
          </div>
        </div>

        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="text-gray-400 text-xs mb-1">Avg Speed</div>
          <div className="text-2xl font-bold text-white">
            {session.averageDecisionTime > 0 ? (session.averageDecisionTime / 1000).toFixed(1) : '0.0'}s
          </div>
          <div className="text-xs text-gray-400">
            Goal: {(sessionGoal.speedTarget / 1000).toFixed(1)}s
          </div>
        </div>

        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="text-gray-400 text-xs mb-1">Fastest</div>
          <div className="text-2xl font-bold text-white">
            {session.fastestDecision !== Infinity ? (session.fastestDecision / 1000).toFixed(1) : '0.0'}s
          </div>
          <div className="text-xs text-blue-400">
            Best decision
          </div>
        </div>
      </div>

      {/* Progress bars */}
      <div className="space-y-4">
        {/* Hands progress */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Hands Played</span>
            <span className="text-white font-semibold">
              {session.handsPlayed} / {sessionGoal.handsTarget}
            </span>
          </div>
          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${getProgressColor(handsProgress)}`}
              style={{ width: `${Math.min(100, handsProgress)}%` }}
            />
          </div>
        </div>

        {/* Accuracy progress */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Accuracy Goal</span>
            <span className="text-white font-semibold">
              {accuracy.toFixed(1)}% / {sessionGoal.accuracyTarget}%
            </span>
          </div>
          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${getProgressColor(accuracyProgress)}`}
              style={{ width: `${Math.min(100, accuracyProgress)}%` }}
            />
          </div>
        </div>

        {/* Speed progress */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Speed Goal</span>
            <span className="text-white font-semibold">
              {session.averageDecisionTime > 0 ? (session.averageDecisionTime / 1000).toFixed(1) : '0.0'}s
              {' / '}
              {(sessionGoal.speedTarget / 1000).toFixed(1)}s
            </span>
          </div>
          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${getProgressColor(speedProgress)}`}
              style={{ width: `${Math.min(100, speedProgress)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Motivational message */}
      {session.totalDecisions >= sessionGoal.handsTarget && (
        <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
          <p className="text-sm text-green-300 font-semibold text-center">
            🎉 Session goal reached! Keep going or stop to see your results.
          </p>
        </div>
      )}
    </div>
  );
}
