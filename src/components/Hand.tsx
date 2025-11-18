import Card from './Card';
import { calculateHandValue } from '../lib/deck';
import { Card as CardType } from '../lib/types';

interface HandProps {
  cards: CardType[];
  label: string;
  hideFirstCard?: boolean;
  showValue?: boolean;
}

export default function Hand({ cards, label, hideFirstCard = false, showValue = true }: HandProps) {
  const { value, isSoft } = calculateHandValue(cards);

  // If hiding first card, calculate value without it
  const displayValue = hideFirstCard && cards.length > 0
    ? calculateHandValue([cards[1]]).value
    : value;

  return (
    <div className="flex flex-col items-center gap-2">
      {label && <div className="text-white text-sm font-semibold">{label}</div>}

      <div className="flex gap-2">
        {cards.map((card, index) => (
          <Card
            key={`${card.rank}-${card.suit}-${index}`}
            card={card}
            faceDown={hideFirstCard && index === 0}
          />
        ))}
      </div>

      {showValue && cards.length > 0 && (
        <div className="text-white text-xl font-bold">
          {hideFirstCard ? (
            `${displayValue} + ?`
          ) : (
            <>
              {displayValue}
              {isSoft && displayValue !== 21 && <span className="text-sm ml-1">(soft)</span>}
            </>
          )}
        </div>
      )}
    </div>
  );
}
