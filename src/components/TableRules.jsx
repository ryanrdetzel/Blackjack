export default function TableRules({ config, onUpdateConfig, isOpen, onClose }) {
  if (!isOpen) return null;

  const handleToggle = (key) => {
    onUpdateConfig({ [key]: !config[key] });
  };

  const handleNumberChange = (key, value) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      onUpdateConfig({ [key]: numValue });
    }
  };

  const handlePayoutChange = (numerator, denominator) => {
    onUpdateConfig({ blackjackPayout: [numerator, denominator] });
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
          {/* Deck Configuration */}
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
                min="1"
                max="8"
                value={config.deckCount}
                onChange={(e) => handleNumberChange('deckCount', e.target.value)}
                className="w-20 px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </section>

          {/* Dealer Rules */}
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
                onClick={() => handleToggle('dealerHitsSoft17')}
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

          {/* Payout Rules */}
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
                  onClick={() => handlePayoutChange(3, 2)}
                  className={`flex-1 px-4 py-2 rounded font-semibold transition-colors ${
                    config.blackjackPayout[0] === 3 && config.blackjackPayout[1] === 2
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  3:2 (Standard)
                </button>
                <button
                  onClick={() => handlePayoutChange(6, 5)}
                  className={`flex-1 px-4 py-2 rounded font-semibold transition-colors ${
                    config.blackjackPayout[0] === 6 && config.blackjackPayout[1] === 5
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  6:5 (Lower)
                </button>
                <button
                  onClick={() => handlePayoutChange(2, 1)}
                  className={`flex-1 px-4 py-2 rounded font-semibold transition-colors ${
                    config.blackjackPayout[0] === 2 && config.blackjackPayout[1] === 1
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  2:1 (Higher)
                </button>
              </div>
            </div>
          </section>

          {/* Betting Limits */}
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
                    min="1"
                    value={config.minBet}
                    onChange={(e) => handleNumberChange('minBet', e.target.value)}
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
                    min="1"
                    value={config.maxBet}
                    onChange={(e) => handleNumberChange('maxBet', e.target.value)}
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
                    min="1"
                    value={config.startingBalance}
                    onChange={(e) => handleNumberChange('startingBalance', e.target.value)}
                    className="w-full pl-7 pr-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Split Rules */}
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
                onClick={() => handleToggle('doubleAfterSplit')}
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
                onClick={() => handleToggle('resplitAcesAllowed')}
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
                min="1"
                max="4"
                value={config.maxSplits}
                onChange={(e) => handleNumberChange('maxSplits', e.target.value)}
                className="w-20 px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </section>

          {/* Other Rules */}
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
                onClick={() => handleToggle('surrenderAllowed')}
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
                onClick={() => handleToggle('insuranceAllowed')}
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
        </div>

        {/* Action Buttons */}
        <div className="pt-6 border-t border-gray-700 mt-6 flex gap-3">
          <button
            onClick={() => {
              // Reset to defaults
              onUpdateConfig({
                deckCount: 6,
                dealerHitsSoft17: false,
                blackjackPayout: [3, 2],
                minBet: 5,
                maxBet: 500,
                startingBalance: 1000,
                doubleAfterSplit: true,
                resplitAcesAllowed: false,
                maxSplits: 3,
                surrenderAllowed: true,
                insuranceAllowed: true,
              });
            }}
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
