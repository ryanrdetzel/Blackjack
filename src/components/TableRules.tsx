import { GameConfig } from '../lib/types';
import {
  DEFAULT_DECK_COUNT,
  DEFAULT_BLACKJACK_PAYOUT,
  DEFAULT_MIN_BET,
  DEFAULT_MAX_BET,
  DEFAULT_STARTING_BALANCE,
  DEFAULT_MAX_SPLITS,
} from '../lib/constants';
import DeckConfiguration from './rules/DeckConfiguration';
import DealerRules from './rules/DealerRules';
import PayoutRules from './rules/PayoutRules';
import BettingLimits from './rules/BettingLimits';
import SplitRules from './rules/SplitRules';
import OtherRules from './rules/OtherRules';

interface TableRulesProps {
  config: GameConfig;
  onUpdateConfig: (config: Partial<GameConfig>) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function TableRules({ config, onUpdateConfig, isOpen, onClose }: TableRulesProps) {
  if (!isOpen) return null;

  const handleToggle = (key: keyof GameConfig) => {
    if (typeof config[key] === 'boolean') {
      onUpdateConfig({ [key]: !config[key] });
    }
  };

  const handleNumberChange = (key: keyof GameConfig, value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      onUpdateConfig({ [key]: numValue } as Partial<GameConfig>);
    }
  };

  const handlePayoutChange = (numerator: number, denominator: number) => {
    onUpdateConfig({ blackjackPayout: [numerator, denominator] });
  };

  const handleResetToDefaults = () => {
    onUpdateConfig({
      deckCount: DEFAULT_DECK_COUNT,
      dealerHitsSoft17: false,
      blackjackPayout: DEFAULT_BLACKJACK_PAYOUT,
      minBet: DEFAULT_MIN_BET,
      maxBet: DEFAULT_MAX_BET,
      startingBalance: DEFAULT_STARTING_BALANCE,
      doubleAfterSplit: true,
      resplitAcesAllowed: false,
      maxSplits: DEFAULT_MAX_SPLITS,
      surrenderAllowed: true,
      insuranceAllowed: true,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-white text-2xl font-bold">Table Rules</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          <DeckConfiguration config={config} onNumberChange={handleNumberChange} />
          <DealerRules config={config} onToggle={handleToggle} />
          <PayoutRules config={config} onPayoutChange={handlePayoutChange} />
          <BettingLimits config={config} onNumberChange={handleNumberChange} />
          <SplitRules config={config} onToggle={handleToggle} onNumberChange={handleNumberChange} />
          <OtherRules config={config} onToggle={handleToggle} />
        </div>

        {/* Action Buttons */}
        <div className="pt-6 border-t border-gray-700 mt-6 flex gap-3">
          <button
            onClick={handleResetToDefaults}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded transition-colors"
          >
            Reset to Defaults
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
