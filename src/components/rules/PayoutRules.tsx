import { GameConfig } from '../../lib/types';
import {
  DEFAULT_BLACKJACK_PAYOUT,
  BLACKJACK_PAYOUT_6_5,
  BLACKJACK_PAYOUT_2_1,
  FIRST_INDEX,
  SECOND_INDEX,
} from '../../lib/constants';

interface PayoutRulesProps {
  config: GameConfig;
  onPayoutChange: (numerator: number, denominator: number) => void;
}

export default function PayoutRules({ config, onPayoutChange }: PayoutRulesProps) {
  return (
    <section className="space-y-3">
      <h3 className="text-white text-lg font-semibold border-b border-gray-700 pb-2">
        Payout Rules
      </h3>
      <div className="space-y-2">
        <div className="text-white font-semibold">Blackjack Payout</div>
        <div className="text-gray-400 text-sm mb-2">
          How much a natural blackjack pays
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => onPayoutChange(DEFAULT_BLACKJACK_PAYOUT[FIRST_INDEX], DEFAULT_BLACKJACK_PAYOUT[SECOND_INDEX])}
            className={`flex-1 px-4 py-2 rounded font-semibold transition-colors ${
              config.blackjackPayout[FIRST_INDEX] === DEFAULT_BLACKJACK_PAYOUT[FIRST_INDEX] && config.blackjackPayout[SECOND_INDEX] === DEFAULT_BLACKJACK_PAYOUT[SECOND_INDEX]
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            3:2 (Standard)
          </button>
          <button
            onClick={() => onPayoutChange(BLACKJACK_PAYOUT_6_5[FIRST_INDEX], BLACKJACK_PAYOUT_6_5[SECOND_INDEX])}
            className={`flex-1 px-4 py-2 rounded font-semibold transition-colors ${
              config.blackjackPayout[FIRST_INDEX] === BLACKJACK_PAYOUT_6_5[FIRST_INDEX] && config.blackjackPayout[SECOND_INDEX] === BLACKJACK_PAYOUT_6_5[SECOND_INDEX]
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            6:5 (Lower)
          </button>
          <button
            onClick={() => onPayoutChange(BLACKJACK_PAYOUT_2_1[FIRST_INDEX], BLACKJACK_PAYOUT_2_1[SECOND_INDEX])}
            className={`flex-1 px-4 py-2 rounded font-semibold transition-colors ${
              config.blackjackPayout[FIRST_INDEX] === BLACKJACK_PAYOUT_2_1[FIRST_INDEX] && config.blackjackPayout[SECOND_INDEX] === BLACKJACK_PAYOUT_2_1[SECOND_INDEX]
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            2:1 (Higher)
          </button>
        </div>
      </div>
    </section>
  );
}
