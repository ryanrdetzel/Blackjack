import clsx from 'clsx';
import { Card as CardType } from '../lib/types';
import { CARD_BACK_SYMBOL, RED_SUITS } from '../lib/constants';

interface CardProps {
  card: CardType;
  faceDown?: boolean;
}

export default function Card({ card, faceDown = false }: CardProps) {
  if (faceDown) {
    return (
      <div className="card card-back select-none">
        {CARD_BACK_SYMBOL}
      </div>
    );
  }

  const isRed = (RED_SUITS as readonly string[]).includes(card.suit);

  // Get display value for face cards
  const displayRank = card.rank;

  return (
    <div className={clsx('card relative', isRed ? 'card-red' : 'card-black')}>
      {/* Top-left corner */}
      <div className="absolute top-1 left-1.5">
        <div className="text-lg font-bold leading-none">{displayRank}</div>
        <div className="text-xl leading-none">{card.suit}</div>
      </div>

      {/* Center suit symbol */}
      <div className="flex items-center justify-center h-full">
        <div className="text-5xl">{card.suit}</div>
      </div>

      {/* Bottom-right corner (upside down) */}
      <div className="absolute bottom-1 right-1.5 rotate-180">
        <div className="text-lg font-bold leading-none">{displayRank}</div>
        <div className="text-xl leading-none">{card.suit}</div>
      </div>
    </div>
  );
}
