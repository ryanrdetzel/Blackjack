import { GameConfig } from '../lib/types';
import {
  DEFAULT_DECK_COUNT,
  DEFAULT_BLACKJACK_PAYOUT,
  DEFAULT_MIN_BET,
  DEFAULT_MAX_BET,
  DEFAULT_STARTING_BALANCE,
  DEFAULT_MAX_SPLITS,
} from '../lib/constants';
import { Modal, Button } from './ui';
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Table Rules"
      maxWidth="2xl"
      footer={
        <div className="flex gap-3">
          <Button onClick={handleResetToDefaults} variant="secondary" fullWidth>
            Reset to Defaults
          </Button>
          <Button onClick={onClose} variant="primary" fullWidth>
            Close
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <DeckConfiguration config={config} onNumberChange={handleNumberChange} />
        <DealerRules config={config} onToggle={handleToggle} />
        <PayoutRules config={config} onPayoutChange={handlePayoutChange} />
        <BettingLimits config={config} onNumberChange={handleNumberChange} />
        <SplitRules config={config} onToggle={handleToggle} onNumberChange={handleNumberChange} />
        <OtherRules config={config} onToggle={handleToggle} />
      </div>
    </Modal>
  );
}
