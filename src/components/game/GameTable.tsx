import { Card, PlayerHand, GAME_PHASES } from '../../lib/types';
import StatusOverlay from './StatusOverlay';
import InsuranceIndicator from './InsuranceIndicator';
import DealerArea from './DealerArea';
import PlayerArea from './PlayerArea';
import GameControls from '../GameControls';
import StrategyHint from '../learning/StrategyHint';
import LearningStats from '../learning/LearningStats';
import { LearningModeState } from '../../lib/gameState';

interface GameTableProps {
  phase: string;
  dealerHand: Card[];
  playerHands: PlayerHand[];
  activeHandIndex: number;
  insurance: number;
  currentHand: PlayerHand | undefined;
  canDouble: boolean;
  canSplit: boolean;
  canSurrender: boolean;
  canInsurance: boolean;
  onHit: () => void;
  onStand: () => void;
  onDouble: () => void;
  onSplit: () => void;
  onSurrender: () => void;
  onInsurance: () => void;
  learningMode?: LearningModeState;
  learningModeEnabled?: boolean;
  showHandTotal?: boolean;
}

export default function GameTable({
  phase,
  dealerHand,
  playerHands,
  activeHandIndex,
  insurance,
  currentHand,
  canDouble,
  canSplit,
  canSurrender,
  canInsurance,
  onHit,
  onStand,
  onDouble,
  onSplit,
  onSurrender,
  onInsurance,
  learningMode,
  learningModeEnabled = false,
  showHandTotal = true,
}: GameTableProps) {
  return (
    <>
      <div className="max-w-4xl mx-auto p-4 space-y-3">
        {/* Learning Stats */}
        {learningMode && (
          <LearningStats learningMode={learningMode} enabled={learningModeEnabled} />
        )}

        <div className="bg-gradient-to-br from-green-800 via-green-700 to-green-800 rounded-3xl shadow-2xl border-4 border-amber-900 p-4 relative">
          {/* Table markings */}
          <div className="absolute inset-0 rounded-2xl border-2 border-green-600 opacity-30 m-2"></div>

          <StatusOverlay phase={phase} />
          <InsuranceIndicator insuranceAmount={insurance} />

          <DealerArea
            cards={dealerHand}
            hideFirstCard={phase === GAME_PHASES.PLAYER_TURN}
            showHandTotal={showHandTotal}
          />

          <PlayerArea
            hands={playerHands}
            activeHandIndex={activeHandIndex}
            isPlayerTurn={phase === GAME_PHASES.PLAYER_TURN}
            showHandTotal={showHandTotal}
          />

          {/* Player Controls - Now closer to the cards */}
          {phase === GAME_PHASES.PLAYER_TURN && currentHand && (
            <div className="flex justify-center mt-4 relative z-20">
              <GameControls
                onHit={onHit}
                onStand={onStand}
                onDouble={onDouble}
                onSplit={onSplit}
                onSurrender={onSurrender}
                onInsurance={onInsurance}
                canDouble={canDouble}
                canSplit={canSplit}
                canSurrender={canSurrender}
                canInsurance={canInsurance}
                recommendations={learningMode?.currentStrategy?.recommendations}
                learningModeEnabled={learningModeEnabled}
              />
            </div>
          )}
        </div>
      </div>

      {/* Floating Strategy Hint - Positioned to the right of the table */}
      {phase === GAME_PHASES.PLAYER_TURN && learningMode && learningModeEnabled && (
        <div className="fixed right-4 top-1/2 -translate-y-1/2 z-30 hidden xl:block">
          <div className="w-80">
            <StrategyHint strategy={learningMode.currentStrategy} show={true} />
          </div>
        </div>
      )}

      {/* Mobile/Tablet Strategy Hint - Show below table on smaller screens */}
      {phase === GAME_PHASES.PLAYER_TURN && learningMode && learningModeEnabled && (
        <div className="xl:hidden max-w-4xl mx-auto px-4 pb-4">
          <StrategyHint strategy={learningMode.currentStrategy} show={true} />
        </div>
      )}
    </>
  );
}
