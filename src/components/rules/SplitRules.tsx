import { GameConfig } from '../../lib/types';
import { MIN_SPLITS, MAX_SPLITS } from '../../lib/constants';

interface SplitRulesProps {
  config: GameConfig;
  onToggle: (key: keyof GameConfig) => void;
  onNumberChange: (key: keyof GameConfig, value: string) => void;
}

export default function SplitRules({ config, onToggle, onNumberChange }: SplitRulesProps) {
  return (
    <section className="space-y-3">
      <h3 className="text-white text-lg font-semibold border-b border-gray-700 pb-2">
        Split Rules
      </h3>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-white font-semibold">Double After Split</div>
          <div className="text-gray-400 text-sm">
            Allow doubling down after splitting a pair
          </div>
        </div>
        <button
          onClick={() => onToggle('doubleAfterSplit')}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            config.doubleAfterSplit ? 'bg-green-600' : 'bg-gray-600'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              config.doubleAfterSplit ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <div className="text-white font-semibold">Resplit Aces Allowed</div>
          <div className="text-gray-400 text-sm">
            Allow re-splitting aces after initial split
          </div>
        </div>
        <button
          onClick={() => onToggle('resplitAcesAllowed')}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            config.resplitAcesAllowed ? 'bg-green-600' : 'bg-gray-600'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              config.resplitAcesAllowed ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <div className="text-white font-semibold">Maximum Splits</div>
          <div className="text-gray-400 text-sm">
            Maximum number of times you can split (1-4)
          </div>
        </div>
        <input
          type="number"
          min={MIN_SPLITS}
          max={MAX_SPLITS}
          value={config.maxSplits}
          onChange={(e) => onNumberChange('maxSplits', e.target.value)}
          className="w-20 px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
        />
      </div>
    </section>
  );
}
