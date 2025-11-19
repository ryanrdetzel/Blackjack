import { Modal, Button, ToggleSwitch } from './ui';

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
  const handleToggle = (key: keyof GameSettings) => {
    if (typeof settings[key] === 'boolean') {
      onUpdateSettings({ [key]: !settings[key] });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Game Settings"
      maxWidth="md"
      footer={
        <Button onClick={onClose} variant="primary" fullWidth>
          Close
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-white font-semibold">Auto-Deal</div>
            <div className="text-gray-400 text-sm">
              Automatically deal the next hand after 3 seconds
            </div>
          </div>
          <ToggleSwitch
            enabled={settings.autoDeal}
            onChange={() => handleToggle('autoDeal')}
          />
        </div>
      </div>
    </Modal>
  );
}
