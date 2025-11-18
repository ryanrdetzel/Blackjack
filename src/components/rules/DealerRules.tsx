import { GameConfig } from '../../lib/types';

interface DealerRulesProps {
  config: GameConfig;
  onToggle: (key: keyof GameConfig) => void;
}

export default function DealerRules({ config, onToggle }: DealerRulesProps) {
  return (
    <section className="space-y-3">
      <h3 className="text-white text-lg font-semibold border-b border-gray-700 pb-2">
        Dealer Rules
      </h3>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-white font-semibold">Dealer Hits on Soft 17</div>
          <div className="text-gray-400 text-sm">
            Dealer must hit on soft 17 (e.g., Ace-6)
          </div>
        </div>
        <button
          onClick={() => onToggle('dealerHitsSoft17')}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            config.dealerHitsSoft17 ? 'bg-green-600' : 'bg-gray-600'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              config.dealerHitsSoft17 ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </section>
  );
}
