import { useEffect } from 'react';
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
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Don't trigger if user is typing in an input field
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Don't trigger if controls are disabled
      if (disabled) {
        return;
      }

      const key = event.key.toLowerCase();

      switch (key) {
        case 'h':
          onHit();
          break;
        case 's':
          onStand();
          break;
        case 'd':
          if (canDouble) {
            onDouble();
          }
          break;
        case 'p':
          if (canSplit) {
            onSplit();
          }
          break;
        case 'r':
          if (canSurrender) {
            onSurrender();
          }
          break;
        case 'i':
          if (canInsurance) {
            onInsurance();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [disabled, onHit, onStand, onDouble, onSplit, onSurrender, onInsurance, canDouble, canSplit, canSurrender, canInsurance]);

  // Helper function to get consistent button styling
  const getButtonStyle = (action: 'HIT' | 'STAND' | 'DOUBLE' | 'SPLIT' | 'SURRENDER'): string => {
    // Always use default styles - no color changes based on recommendations
    const defaultStyles: Record<string, string> = {
      'HIT': 'btn-primary',
      'STAND': 'btn-secondary',
      'DOUBLE': 'px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
      'SPLIT': 'px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
      'SURRENDER': 'px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
    };
    return defaultStyles[action] || 'btn-primary';
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
            title="Keyboard shortcut: I"
          >
            Insurance (Half Bet) <span className="text-xs opacity-75">(I)</span>
          </button>
        </div>
      )}

      {/* Main action buttons */}
      <div className="flex gap-3 justify-center flex-wrap">
        <button
          onClick={onHit}
          disabled={disabled}
          className={getButtonStyle('HIT')}
          title="Keyboard shortcut: H"
        >
          Hit <span className="text-xs opacity-75">(H)</span>
        </button>
        <button
          onClick={onStand}
          disabled={disabled}
          className={getButtonStyle('STAND')}
          title="Keyboard shortcut: S"
        >
          Stand <span className="text-xs opacity-75">(S)</span>
        </button>
        {canDouble && (
          <button
            onClick={onDouble}
            disabled={disabled}
            className={getButtonStyle('DOUBLE')}
            title="Keyboard shortcut: D"
          >
            Double <span className="text-xs opacity-75">(D)</span>
          </button>
        )}
        {canSplit && (
          <button
            onClick={onSplit}
            disabled={disabled}
            className={getButtonStyle('SPLIT')}
            title="Keyboard shortcut: P"
          >
            Split <span className="text-xs opacity-75">(P)</span>
          </button>
        )}
        {canSurrender && (
          <button
            onClick={onSurrender}
            disabled={disabled}
            className={getButtonStyle('SURRENDER')}
            title="Keyboard shortcut: R"
          >
            Surrender <span className="text-xs opacity-75">(R)</span>
          </button>
        )}
      </div>
    </div>
  );
}
