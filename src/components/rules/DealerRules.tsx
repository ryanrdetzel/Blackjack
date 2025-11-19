import { GameConfig } from '../../lib/types';
import { ToggleSwitch } from '../ui';

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
        <ToggleSwitch
          enabled={config.dealerHitsSoft17}
          onChange={() => onToggle('dealerHitsSoft17')}
        />
      </div>
    </section>
  );
}
