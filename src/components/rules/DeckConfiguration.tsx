import { GameConfig } from '../../lib/types';
import {
  MIN_DECK_COUNT,
  MAX_DECK_COUNT,
} from '../../lib/constants';

interface DeckConfigurationProps {
  config: GameConfig;
  onNumberChange: (key: keyof GameConfig, value: string) => void;
}

export default function DeckConfiguration({ config, onNumberChange }: DeckConfigurationProps) {
  return (
    <section className="space-y-3">
      <h3 className="text-white text-lg font-semibold border-b border-gray-700 pb-2">
        Deck Configuration
      </h3>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-white font-semibold">Number of Decks</div>
          <div className="text-gray-400 text-sm">
            How many decks to use in the shoe (1-8)
          </div>
        </div>
        <input
          type="number"
          min={MIN_DECK_COUNT}
          max={MAX_DECK_COUNT}
          value={config.deckCount}
          onChange={(e) => onNumberChange('deckCount', e.target.value)}
          className="w-20 px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
        />
      </div>
    </section>
  );
}
