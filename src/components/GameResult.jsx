import clsx from 'clsx';

export default function GameResult({ result, message, onNewGame }) {
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
        New Hand
      </button>
    </div>
  );
}
