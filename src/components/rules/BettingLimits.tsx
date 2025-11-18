import { GameConfig } from '../../lib/types';
import { MIN_BET_VALUE } from '../../lib/constants';

interface BettingLimitsProps {
  config: GameConfig;
  onNumberChange: (key: keyof GameConfig, value: string) => void;
}

export default function BettingLimits({ config, onNumberChange }: BettingLimitsProps) {
  return (
    <section className="space-y-3">
      <h3 className="text-white text-lg font-semibold border-b border-gray-700 pb-2">
        Betting Limits
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-white font-semibold block mb-2">
            Minimum Bet
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-400">$</span>
            <input
              type="number"
              min={MIN_BET_VALUE}
              value={config.minBet}
              onChange={(e) => onNumberChange('minBet', e.target.value)}
              className="w-full pl-7 pr-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label className="text-white font-semibold block mb-2">
            Maximum Bet
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-400">$</span>
            <input
              type="number"
              min={MIN_BET_VALUE}
              value={config.maxBet}
              onChange={(e) => onNumberChange('maxBet', e.target.value)}
              className="w-full pl-7 pr-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label className="text-white font-semibold block mb-2">
            Starting Balance
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-400">$</span>
            <input
              type="number"
              min={MIN_BET_VALUE}
              value={config.startingBalance}
              onChange={(e) => onNumberChange('startingBalance', e.target.value)}
              className="w-full pl-7 pr-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
