import { useEffect, useState } from 'react';
import clsx from 'clsx';

interface GameResultProps {
  result: string | null;
  message: string;
  onNewGame: () => void;
  autoDeal?: boolean;
  onPlaceBet?: (amount: number) => void;
  lastBetAmount?: number;
}

export default function GameResult({ result, message, onNewGame, autoDeal = false, onPlaceBet, lastBetAmount }: GameResultProps) {
  const [countdown, setCountdown] = useState<number | null>(autoDeal ? 3 : null);

  useEffect(() => {
    if (!autoDeal) {
      setCountdown(null);
      return;
    }

    setCountdown(3);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 0) {
          clearInterval(timer);
          return null;
        }
        if (prev === 1) {
          // Auto-deal when countdown reaches 0
          // If we have a last bet amount and onPlaceBet function, place the bet directly
          // This skips the betting panel and goes straight to dealing
          if (lastBetAmount && onPlaceBet) {
            setTimeout(() => onPlaceBet(lastBetAmount), 0);
          } else {
            setTimeout(() => onNewGame(), 0);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoDeal, onNewGame, onPlaceBet, lastBetAmount]);

  const getResultColor = () => {
    if (result === 'blackjack' || result === 'win') return 'text-green-400';
    if (result === 'lose' || result === 'dealer_blackjack') return 'text-red-400';
    return 'text-yellow-400';
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 space-y-4 text-center">
      <div className={clsx('text-2xl font-bold', getResultColor())}>
        {message}
      </div>
      <button onClick={onNewGame} className="btn-success">
        {countdown !== null && countdown > 0 ? `New Hand (${countdown})` : 'New Hand'}
      </button>
    </div>
  );
}
