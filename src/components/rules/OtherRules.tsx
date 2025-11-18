import { GameConfig } from '../../lib/types';

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
        <button
          onClick={() => onToggle('surrenderAllowed')}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            config.surrenderAllowed ? 'bg-green-600' : 'bg-gray-600'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              config.surrenderAllowed ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <div className="text-white font-semibold">Insurance Allowed</div>
          <div className="text-gray-400 text-sm">
            Allow insurance bet when dealer shows Ace (pays 2:1)
          </div>
        </div>
        <button
          onClick={() => onToggle('insuranceAllowed')}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            config.insuranceAllowed ? 'bg-green-600' : 'bg-gray-600'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              config.insuranceAllowed ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </section>
  );
}
