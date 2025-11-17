interface GameSettings {
  autoDeal: boolean;
  lastBetAmount: number;
}

interface SettingsProps {
  settings: GameSettings;
  onUpdateSettings: (settings: Partial<GameSettings>) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Settings({ settings, onUpdateSettings, isOpen, onClose }: SettingsProps) {
  if (!isOpen) return null;

  const handleToggle = (key: keyof GameSettings) => {
    if (typeof settings[key] === 'boolean') {
      onUpdateSettings({ [key]: !settings[key] });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-white text-2xl font-bold">Game Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white font-semibold">Auto-Deal</div>
              <div className="text-gray-400 text-sm">
                Automatically deal the next hand after 3 seconds
              </div>
            </div>
            <button
              onClick={() => handleToggle('autoDeal')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.autoDeal ? 'bg-green-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.autoDeal ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-700">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
