import { StrategyDecision } from '../../lib/strategy';

interface StrategyHintProps {
  strategy: StrategyDecision | null;
  show: boolean;
}

export default function StrategyHint({ strategy, show }: StrategyHintProps) {
  if (!show || !strategy) {
    return null;
  }

  // Format action name for display
  const formatAction = (action: string): string => {
    switch (action) {
      case 'HIT':
        return 'Hit';
      case 'STAND':
        return 'Stand';
      case 'DOUBLE':
        return 'Double Down';
      case 'SPLIT':
        return 'Split';
      case 'SURRENDER':
        return 'Surrender';
      default:
        return action;
    }
  };

  return (
    <div className="bg-blue-900/80 border-2 border-blue-400 rounded-lg p-4 shadow-xl backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-2">
        <svg
          className="w-5 h-5 text-blue-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="text-sm font-semibold text-blue-100 uppercase tracking-wide">
          Strategy Hint
        </h3>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-blue-300">Optimal Action:</span>
          <span className="px-3 py-1 bg-green-600 text-white text-sm font-bold rounded">
            {formatAction(strategy.primaryAction)}
          </span>
        </div>

        {/* Detailed reasoning - the "WHY" */}
        <div className="bg-blue-800/50 rounded p-3 border border-blue-600">
          <div className="flex items-start gap-2">
            <svg
              className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <div className="flex-1">
              <p className="text-xs font-semibold text-yellow-300 mb-1">Why this is the best play:</p>
              <p className="text-sm text-blue-100 leading-relaxed">{strategy.reasoning}</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-blue-300 italic">{strategy.explanation}</p>

        {/* Show action quality ratings */}
        <div className="mt-3 pt-3 border-t border-blue-700">
          <p className="text-xs text-blue-300 mb-2">Action Quality:</p>
          <div className="flex flex-wrap gap-2">
            {strategy.recommendations.map((rec) => {
              const bgColor =
                rec.quality === 'optimal'
                  ? 'bg-green-600'
                  : rec.quality === 'acceptable'
                  ? 'bg-yellow-600'
                  : 'bg-red-600';

              const borderColor =
                rec.quality === 'optimal'
                  ? 'border-green-400'
                  : rec.quality === 'acceptable'
                  ? 'border-yellow-400'
                  : 'border-red-400';

              return (
                <div
                  key={rec.action}
                  className={`px-2 py-1 ${bgColor} border ${borderColor} text-white text-xs rounded flex items-center gap-1`}
                >
                  <span>{formatAction(rec.action)}</span>
                  {rec.isOptimal && (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-2 pt-2 border-t border-blue-700 flex gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-600 rounded"></div>
            <span className="text-blue-200">Optimal</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-600 rounded"></div>
            <span className="text-blue-200">Acceptable</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-600 rounded"></div>
            <span className="text-blue-200">Poor</span>
          </div>
        </div>
      </div>
    </div>
  );
}
