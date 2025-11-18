import { PlayerHand } from '../../lib/types';
import { HAND_STATUS } from '../../lib/types';
import Hand from '../Hand';

interface PlayerAreaProps {
  hands: PlayerHand[];
  activeHandIndex: number;
  isPlayerTurn: boolean;
}

export default function PlayerArea({ hands, activeHandIndex, isPlayerTurn }: PlayerAreaProps) {
  return (
    <div className="bg-green-900/30 rounded-2xl p-3 mt-3 border border-green-600/30">
      <div className="text-center mb-2">
        <span className="text-yellow-300 text-sm font-semibold tracking-wider uppercase">Player</span>
      </div>
      <div className="min-h-[180px] flex items-center justify-center">
        {hands.length > 0 ? (
          <div className="flex justify-center gap-8 flex-wrap">
            {hands.map((hand, index) => {
              const isActive = index === activeHandIndex && isPlayerTurn;
              const handLabel = hands.length > 1
                ? `Hand ${index + 1} (Bet: $${hand.bet})`
                : `Bet: $${hand.bet}`;

              return (
                <div
                  key={index}
                  className={`transition-all ${
                    isActive
                      ? 'ring-4 ring-yellow-400 rounded-lg p-2 shadow-lg shadow-yellow-400/50'
                      : hand.status === HAND_STATUS.BUST
                      ? 'opacity-50'
                      : 'opacity-75'
                  }`}
                >
                  <Hand
                    cards={hand.cards}
                    label={handLabel}
                    showValue={true}
                  />
                  {hand.status === HAND_STATUS.BUST && (
                    <div className="text-center text-red-400 font-bold mt-2">BUST</div>
                  )}
                  {hand.status === HAND_STATUS.SURRENDER && (
                    <div className="text-center text-orange-400 font-bold mt-2">SURRENDERED</div>
                  )}
                  {hand.doubled && (
                    <div className="text-center text-blue-400 font-semibold mt-1 text-sm">Doubled</div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-green-600/50 text-lg">Your cards will appear here</div>
        )}
      </div>
    </div>
  );
}
