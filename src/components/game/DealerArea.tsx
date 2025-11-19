import { Card } from '../../lib/types';
import Hand from '../Hand';

interface DealerAreaProps {
  cards: Card[];
  hideFirstCard: boolean;
  showHandTotal?: boolean;
}

export default function DealerArea({ cards, hideFirstCard, showHandTotal = true }: DealerAreaProps) {
  return (
    <div className="bg-green-900/30 rounded-2xl p-3 mb-3 border border-green-600/30">
      <div className="text-center mb-2">
        <span className="text-yellow-300 text-sm font-semibold tracking-wider uppercase">Dealer</span>
      </div>
      <div className="min-h-[180px] flex items-center justify-center">
        {cards.length > 0 ? (
          <Hand
            cards={cards}
            label=""
            hideFirstCard={hideFirstCard}
            showValue={showHandTotal}
          />
        ) : (
          <div className="text-green-600/50 text-lg">Dealer's cards will appear here</div>
        )}
      </div>
    </div>
  );
}
