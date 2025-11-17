import clsx from 'clsx';

export default function Card({ card, faceDown = false }) {
  if (faceDown) {
    return (
      <div className="card card-back select-none">
        🂠
      </div>
    );
  }

  const isRed = card.suit === '♥' || card.suit === '♦';

  return (
    <div className={clsx('card', isRed ? 'card-red' : 'card-black')}>
      <div className="flex flex-col items-center">
        <div className="text-xl">{card.rank}</div>
        <div className="text-2xl">{card.suit}</div>
      </div>
    </div>
  );
}
