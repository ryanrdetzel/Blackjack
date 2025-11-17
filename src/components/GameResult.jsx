import { useEffect, useState } from 'react';
import clsx from 'clsx';

export default function GameResult({ result, message, onNewGame, autoDeal = false }) {
  const [countdown, setCountdown] = useState(autoDeal ? 3 : null);

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
          setTimeout(() => onNewGame(), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoDeal, onNewGame]);

  const getResultColor = () => {
    if (result === 'blackjack' || result === 'win') return 'text-green-400';
    if (result === 'lose') return 'text-red-400';
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
