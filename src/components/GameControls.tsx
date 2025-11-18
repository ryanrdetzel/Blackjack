import { ActionRecommendation } from '../lib/strategy';

interface GameControlsProps {
  onHit: () => void;
  onStand: () => void;
  onDouble: () => void;
  onSplit: () => void;
  onSurrender: () => void;
  onInsurance: () => void;
  canDouble?: boolean;
  canSplit?: boolean;
  canSurrender?: boolean;
  canInsurance?: boolean;
  disabled?: boolean;
  recommendations?: ActionRecommendation[];
  learningModeEnabled?: boolean;
}

export default function GameControls({
  onHit,
  onStand,
  onDouble,
  onSplit,
  onSurrender,
  onInsurance,
  canDouble = false,
  canSplit = false,
  canSurrender = false,
  canInsurance = false,
  disabled = false,
  recommendations = [],
  learningModeEnabled = false,
}: GameControlsProps) {
  // Helper function to get button styling based on recommendations
  const getButtonStyle = (action: 'HIT' | 'STAND' | 'DOUBLE' | 'SPLIT' | 'SURRENDER'): string => {
    if (!learningModeEnabled || recommendations.length === 0) {
      // Default styles
      const defaultStyles: Record<string, string> = {
        'HIT': 'btn-primary',
        'STAND': 'btn-secondary',
        'DOUBLE': 'px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
        'SPLIT': 'px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
        'SURRENDER': 'px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
      };
      return defaultStyles[action] || 'btn-primary';
    }

    // Find recommendation for this action
    const rec = recommendations.find((r) => r.action === action);
    if (!rec) {
      return 'px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
    }

    // Color-coded styles based on quality
    const baseStyle = 'px-6 py-3 text-white font-bold rounded shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
    if (rec.quality === 'optimal') {
      return `${baseStyle} bg-green-600 hover:bg-green-700 border-2 border-green-300`;
    } else if (rec.quality === 'acceptable') {
      return `${baseStyle} bg-yellow-600 hover:bg-yellow-700 border-2 border-yellow-300`;
    } else {
      return `${baseStyle} bg-red-700 hover:bg-red-800 border-2 border-red-400`;
    }
  };

  return (
    <div className="space-y-3">
      {/* Insurance option (if available) */}
      {canInsurance && (
        <div className="flex justify-center">
          <button
            onClick={onInsurance}
            disabled={disabled}
            className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Insurance (Half Bet)
          </button>
        </div>
      )}

      {/* Main action buttons */}
      <div className="flex gap-3 justify-center flex-wrap">
        <button
          onClick={onHit}
          disabled={disabled}
          className={getButtonStyle('HIT')}
        >
          Hit
        </button>
        <button
          onClick={onStand}
          disabled={disabled}
          className={getButtonStyle('STAND')}
        >
          Stand
        </button>
        {canDouble && (
          <button
            onClick={onDouble}
            disabled={disabled}
            className={getButtonStyle('DOUBLE')}
          >
            Double
          </button>
        )}
        {canSplit && (
          <button
            onClick={onSplit}
            disabled={disabled}
            className={getButtonStyle('SPLIT')}
          >
            Split
          </button>
        )}
        {canSurrender && (
          <button
            onClick={onSurrender}
            disabled={disabled}
            className={getButtonStyle('SURRENDER')}
          >
            Surrender
          </button>
        )}
      </div>
    </div>
  );
}
