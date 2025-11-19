import { GameConfig } from '../../lib/types';
import { ToggleSwitch } from '../ui';

interface OtherRulesProps {
  config: GameConfig;
  onToggle: (key: keyof GameConfig) => void;
}

export default function OtherRules({ config, onToggle }: OtherRulesProps) {
  return (
    <section className="space-y-3">
      <h3 className="text-white text-lg font-semibold border-b border-gray-700 pb-2">
        Other Rules
      </h3>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-white font-semibold">Surrender Allowed</div>
          <div className="text-gray-400 text-sm">
            Allow surrendering hand for half the bet back
          </div>
        </div>
        <ToggleSwitch
          enabled={config.surrenderAllowed}
          onChange={() => onToggle('surrenderAllowed')}
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <div className="text-white font-semibold">Insurance Allowed</div>
          <div className="text-gray-400 text-sm">
            Allow insurance bet when dealer shows Ace (pays 2:1)
          </div>
        </div>
        <ToggleSwitch
          enabled={config.insuranceAllowed}
          onChange={() => onToggle('insuranceAllowed')}
        />
      </div>
    </section>
  );
}
