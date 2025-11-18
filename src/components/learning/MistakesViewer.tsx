import { MistakeRecord } from '../../lib/gameState';

interface MistakesViewerProps {
  mistakes: MistakeRecord[];
  isOpen: boolean;
  onClose: () => void;
  onClear: () => void;
}

export default function MistakesViewer({ mistakes, isOpen, onClose, onClear }: MistakesViewerProps) {
  if (!isOpen) {
    return null;
  }

  const formatAction = (action: string): string => {
    return action.replace('_', ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 px-6 py-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Mistake Log</h2>
              <p className="text-sm text-gray-400 mt-1">
                Total mistakes: {mistakes.length}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-auto flex-1">
          {mistakes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-lg font-semibold">No mistakes yet!</p>
              <p className="text-sm">Keep playing to track your strategy decisions</p>
            </div>
          ) : (
            <div className="space-y-3">
              {mistakes.map((mistake, index) => (
                <div
                  key={index}
                  className="bg-gray-800 border border-red-600/30 rounded-lg p-4 hover:border-red-600/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded">
                        #{mistakes.length - index}
                      </span>
                      <span className="text-xs text-gray-400">{formatDate(mistake.timestamp)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-400">Your Hand:</span>
                      <p className="text-white font-mono">{mistake.handDescription}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Dealer Shows:</span>
                      <p className="text-white font-mono">{mistake.dealerUpCard}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Your Action:</span>
                      <p className="text-red-400 font-semibold">{formatAction(mistake.playerAction)}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Optimal Action:</span>
                      <p className="text-green-400 font-semibold">{formatAction(mistake.optimalAction)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-800 px-6 py-4 border-t border-gray-700 flex gap-3">
          {mistakes.length > 0 && (
            <button
              onClick={onClear}
              className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded shadow-lg transition-colors"
            >
              Clear All Mistakes
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded shadow-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
