import { MistakeRecord } from '../../lib/gameState';
import { Modal, Button, EmptyState, Badge } from '../ui';
import { formatTime } from '../../lib/uiUtils';

interface MistakesViewerProps {
  mistakes: MistakeRecord[];
  isOpen: boolean;
  onClose: () => void;
  onClear: () => void;
}

export default function MistakesViewer({ mistakes, isOpen, onClose, onClear }: MistakesViewerProps) {
  const formatAction = (action: string): string => {
    return action.replace('_', ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Mistake Log"
      maxWidth="2xl"
      footer={
        <div className="flex gap-3">
          {mistakes.length > 0 && (
            <Button onClick={onClear} variant="danger" fullWidth>
              Clear All Mistakes
            </Button>
          )}
          <Button onClick={onClose} variant="secondary" fullWidth>
            Close
          </Button>
        </div>
      }
    >
      <p className="text-sm text-gray-400 mb-4">
        Total mistakes: {mistakes.length}
      </p>

      {mistakes.length === 0 ? (
        <EmptyState
          icon="✓"
          message="No mistakes yet!"
          description="Keep playing to track your strategy decisions"
        />
      ) : (
        <div className="space-y-3">
          {mistakes.map((mistake, index) => (
            <div
              key={index}
              className="bg-gray-800 border border-red-600/30 rounded-lg p-4 hover:border-red-600/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="danger" size="sm">
                    #{mistakes.length - index}
                  </Badge>
                  <span className="text-xs text-gray-400">
                    {formatTime(mistake.timestamp)}
                  </span>
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
    </Modal>
  );
}
