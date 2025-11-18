import { Card, PlayerHand, GAME_PHASES } from '../../lib/types';
import StatusOverlay from './StatusOverlay';
import InsuranceIndicator from './InsuranceIndicator';
import DealerArea from './DealerArea';
import PlayerArea from './PlayerArea';
import GameControls from '../GameControls';

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
}: GameTableProps) {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-gradient-to-br from-green-800 via-green-700 to-green-800 rounded-3xl shadow-2xl border-4 border-amber-900 p-4 relative">
        {/* Table markings */}
        <div className="absolute inset-0 rounded-2xl border-2 border-green-600 opacity-30 m-2"></div>

        <StatusOverlay phase={phase} />
        <InsuranceIndicator insuranceAmount={insurance} />

        <DealerArea
          cards={dealerHand}
          hideFirstCard={phase === GAME_PHASES.PLAYER_TURN}
        />

        <PlayerArea
          hands={playerHands}
          activeHandIndex={activeHandIndex}
          isPlayerTurn={phase === GAME_PHASES.PLAYER_TURN}
        />

        {/* Player Controls */}
        {phase === GAME_PHASES.PLAYER_TURN && currentHand && (
          <div className="flex justify-center mt-6 relative z-20">
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
            />
          </div>
        )}
      </div>
    </div>
  );
}
