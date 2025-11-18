import { useState } from 'react';
import { QUICK_BET_AMOUNTS } from '../lib/constants';

interface BettingControlsProps {
  balance: number;
  minBet: number;
  maxBet: number;
  onPlaceBet: (amount: number) => void;
  lastBetAmount?: number;
}

export default function BettingControls({ balance, minBet, maxBet, onPlaceBet, lastBetAmount }: BettingControlsProps) {
  const [showFullControls, setShowFullControls] = useState(false);
  const [betAmount, setBetAmount] = useState(lastBetAmount || minBet);

  const quickBets = QUICK_BET_AMOUNTS;

  const handlePlaceBet = () => {
    if (betAmount >= minBet && betAmount <= maxBet && betAmount <= balance) {
      onPlaceBet(betAmount);
    }
  };

  const handleQuickDeal = () => {
    const amount = Math.min(lastBetAmount || minBet, balance);
    if (amount >= minBet) {
      onPlaceBet(amount);
    }
  };

  const handleQuickBet = (amount: number) => {
    if (amount <= balance) {
      setBetAmount(amount);
    }
  };

  // If showing full controls or no last bet, show full interface
  if (showFullControls || !lastBetAmount) {
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

  // Quick deal interface - default to last bet
  const defaultBet = Math.min(lastBetAmount, balance);
  const canQuickDeal = defaultBet >= minBet;

  return (
    <div className="bg-gray-800 rounded-lg p-6 space-y-4 text-center">
      <h3 className="text-white text-xl font-bold">Place Your Bet</h3>

      <div className="text-gray-400 text-sm">
        Last bet: ${lastBetAmount}
      </div>

      <div className="space-y-3">
        <button
          onClick={handleQuickDeal}
          disabled={!canQuickDeal}
          className="btn-primary w-full text-lg"
        >
          Deal with ${defaultBet}
        </button>

        <button
          onClick={() => setShowFullControls(true)}
          className="btn-secondary w-full"
        >
          Change Bet
        </button>
      </div>
    </div>
  );
}
