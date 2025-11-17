import { useState } from 'react';

export default function BettingControls({ balance, minBet, maxBet, onPlaceBet }) {
  const [betAmount, setBetAmount] = useState(minBet);

  const quickBets = [5, 10, 25, 50, 100];

  const handlePlaceBet = () => {
    if (betAmount >= minBet && betAmount <= maxBet && betAmount <= balance) {
      onPlaceBet(betAmount);
    }
  };

  const handleQuickBet = (amount) => {
    if (amount <= balance) {
      setBetAmount(amount);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 space-y-4">
      <h3 className="text-white text-xl font-bold text-center">Place Your Bet</h3>

      <div className="space-y-2">
        <label className="text-white text-sm">
          Bet Amount: ${betAmount}
        </label>
        <input
          type="range"
          min={minBet}
          max={Math.min(maxBet, balance)}
          value={betAmount}
          onChange={(e) => setBetAmount(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>${minBet}</span>
          <span>${Math.min(maxBet, balance)}</span>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {quickBets.filter(amount => amount <= balance).map(amount => (
          <button
            key={amount}
            onClick={() => handleQuickBet(amount)}
            className={`px-4 py-2 rounded ${
              betAmount === amount
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            ${amount}
          </button>
        ))}
      </div>

      <button
        onClick={handlePlaceBet}
        disabled={betAmount < minBet || betAmount > balance}
        className="btn-primary w-full"
      >
        Deal Cards
      </button>
    </div>
  );
}
