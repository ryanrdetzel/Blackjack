import { LearningModeState } from '../../lib/gameState';

interface LearningStatsProps {
  learningMode: LearningModeState;
  enabled: boolean;
}

export default function LearningStats({ learningMode, enabled }: LearningStatsProps) {
  if (!enabled) {
    return null;
  }

  const { correctDecisions, totalDecisions, lastDecision } = learningMode;
  const accuracy = totalDecisions > 0 ? ((correctDecisions / totalDecisions) * 100).toFixed(1) : '0.0';

  return (
    <div className="bg-gray-800/90 border border-gray-600 rounded-lg p-3 shadow-lg">
      <div className="flex items-center justify-between gap-4">
        {/* Accuracy */}
        <div className="flex flex-col">
          <span className="text-xs text-gray-400 uppercase">Accuracy</span>
          <span className="text-2xl font-bold text-green-400">{accuracy}%</span>
        </div>

        {/* Decisions */}
        <div className="flex flex-col">
          <span className="text-xs text-gray-400 uppercase">Decisions</span>
          <span className="text-xl font-semibold text-blue-300">
            {correctDecisions}/{totalDecisions}
          </span>
        </div>

        {/* Mistakes */}
        <div className="flex flex-col">
          <span className="text-xs text-gray-400 uppercase">Mistakes</span>
          <span className="text-xl font-semibold text-red-400">
            {totalDecisions - correctDecisions}
          </span>
        </div>

        {/* Last decision indicator */}
        {lastDecision && (
          <div className="flex items-center gap-2">
            {lastDecision.wasCorrect ? (
              <div className="flex items-center gap-1 text-green-400">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-xs font-semibold">Correct!</span>
              </div>
            ) : (
              <div className="flex flex-col items-center text-red-400">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-xs">Should: {lastDecision.optimalAction}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
