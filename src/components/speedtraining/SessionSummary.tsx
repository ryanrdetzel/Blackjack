import { SpeedTrainingSession } from '../../lib/gameState';

interface SessionSummaryProps {
  session: SpeedTrainingSession;
  sessionGoal: {
    handsTarget: number;
    accuracyTarget: number;
    speedTarget: number;
  };
  onClose: () => void;
  onNewSession: () => void;
}

export function SessionSummary({ session, sessionGoal, onClose, onNewSession }: SessionSummaryProps) {
  const accuracy = session.totalDecisions > 0
    ? (session.correctDecisions / session.totalDecisions) * 100
    : 0;

  const duration = session.endTime
    ? (session.endTime - session.startTime) / 1000
    : 0;

  const metAccuracyGoal = accuracy >= sessionGoal.accuracyTarget;
  const metSpeedGoal = session.averageDecisionTime <= sessionGoal.speedTarget;
  const metHandsGoal = session.handsPlayed >= sessionGoal.handsTarget;

  const goalsMetCount = [metAccuracyGoal, metSpeedGoal, metHandsGoal].filter(Boolean).length;

  // Prepare data for decision time distribution
  const timeoutCount = session.decisions.filter(d => d.action === 'TIMEOUT').length;
  const fastCount = session.decisions.filter(d => d.timeMs < 3000 && d.action !== 'TIMEOUT').length;
  const mediumCount = session.decisions.filter(d => d.timeMs >= 3000 && d.timeMs < 6000).length;
  const slowCount = session.decisions.filter(d => d.timeMs >= 6000 && d.action !== 'TIMEOUT').length;

  const maxCount = Math.max(fastCount, mediumCount, slowCount, timeoutCount, 1);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-lg">
          <h2 className="text-3xl font-bold text-white mb-2">Session Complete! 🎉</h2>
          <p className="text-blue-100">
            You completed {session.totalDecisions} decisions in {duration.toFixed(1)} seconds
          </p>
        </div>

        <div className="p-6">
          {/* Goals achievement */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white mb-3">Goals Achievement</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-lg border-2 ${metHandsGoal ? 'border-green-500 bg-green-500/10' : 'border-gray-600 bg-gray-700/50'}`}>
                <div className="text-2xl mb-1">{metHandsGoal ? '✅' : '❌'}</div>
                <div className="text-sm text-gray-400">Hands Target</div>
                <div className="text-xl font-bold text-white">
                  {session.handsPlayed} / {sessionGoal.handsTarget}
                </div>
              </div>

              <div className={`p-4 rounded-lg border-2 ${metAccuracyGoal ? 'border-green-500 bg-green-500/10' : 'border-gray-600 bg-gray-700/50'}`}>
                <div className="text-2xl mb-1">{metAccuracyGoal ? '✅' : '❌'}</div>
                <div className="text-sm text-gray-400">Accuracy Goal</div>
                <div className="text-xl font-bold text-white">
                  {accuracy.toFixed(1)}% / {sessionGoal.accuracyTarget}%
                </div>
              </div>

              <div className={`p-4 rounded-lg border-2 ${metSpeedGoal ? 'border-green-500 bg-green-500/10' : 'border-gray-600 bg-gray-700/50'}`}>
                <div className="text-2xl mb-1">{metSpeedGoal ? '✅' : '❌'}</div>
                <div className="text-sm text-gray-400">Speed Goal</div>
                <div className="text-xl font-bold text-white">
                  {(session.averageDecisionTime / 1000).toFixed(1)}s / {(sessionGoal.speedTarget / 1000).toFixed(1)}s
                </div>
              </div>
            </div>
          </div>

          {/* Performance stats */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white mb-3">Performance Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="text-gray-400 text-xs mb-1">Total Decisions</div>
                <div className="text-2xl font-bold text-white">{session.totalDecisions}</div>
              </div>

              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="text-gray-400 text-xs mb-1">Correct</div>
                <div className="text-2xl font-bold text-green-400">{session.correctDecisions}</div>
              </div>

              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="text-gray-400 text-xs mb-1">Incorrect</div>
                <div className="text-2xl font-bold text-red-400">
                  {session.totalDecisions - session.correctDecisions}
                </div>
              </div>

              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="text-gray-400 text-xs mb-1">Timeouts</div>
                <div className="text-2xl font-bold text-orange-400">{timeoutCount}</div>
              </div>

              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="text-gray-400 text-xs mb-1">Fastest Decision</div>
                <div className="text-2xl font-bold text-blue-400">
                  {session.fastestDecision !== Infinity ? (session.fastestDecision / 1000).toFixed(1) : '0.0'}s
                </div>
              </div>

              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="text-gray-400 text-xs mb-1">Slowest Decision</div>
                <div className="text-2xl font-bold text-purple-400">
                  {(session.slowestDecision / 1000).toFixed(1)}s
                </div>
              </div>

              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="text-gray-400 text-xs mb-1">Session Duration</div>
                <div className="text-2xl font-bold text-yellow-400">
                  {duration.toFixed(1)}s
                </div>
              </div>

              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="text-gray-400 text-xs mb-1">Accuracy</div>
                <div className="text-2xl font-bold text-white">{accuracy.toFixed(1)}%</div>
              </div>
            </div>
          </div>

          {/* Decision time distribution */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white mb-3">Decision Time Distribution</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Fast (&lt; 3s)</span>
                  <span className="text-white font-semibold">{fastCount}</span>
                </div>
                <div className="w-full h-6 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all"
                    style={{ width: `${(fastCount / maxCount) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Medium (3-6s)</span>
                  <span className="text-white font-semibold">{mediumCount}</span>
                </div>
                <div className="w-full h-6 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all"
                    style={{ width: `${(mediumCount / maxCount) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Slow (&gt; 6s)</span>
                  <span className="text-white font-semibold">{slowCount}</span>
                </div>
                <div className="w-full h-6 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-500 transition-all"
                    style={{ width: `${(slowCount / maxCount) * 100}%` }}
                  />
                </div>
              </div>

              {timeoutCount > 0 && (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Timeouts</span>
                    <span className="text-white font-semibold">{timeoutCount}</span>
                  </div>
                  <div className="w-full h-6 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500 transition-all"
                      style={{ width: `${(timeoutCount / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Motivational message */}
          <div className={`p-4 rounded-lg mb-6 ${
            goalsMetCount === 3
              ? 'bg-green-500/10 border border-green-500/30'
              : goalsMetCount === 2
              ? 'bg-blue-500/10 border border-blue-500/30'
              : 'bg-yellow-500/10 border border-yellow-500/30'
          }`}>
            <p className="text-sm font-semibold text-center text-white">
              {goalsMetCount === 3 && '🌟 Perfect! You met all your goals! 🌟'}
              {goalsMetCount === 2 && '👍 Great job! You met most of your goals!'}
              {goalsMetCount === 1 && '💪 Keep practicing! You\'re improving!'}
              {goalsMetCount === 0 && '🎯 Don\'t give up! Every session makes you better!'}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onNewSession}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all"
            >
              🚀 Start New Session
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
