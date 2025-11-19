import { useEffect } from 'react';
import { Modal, Button, ToggleSwitch } from './ui';
import { soundManager } from '../lib/sounds';

interface GameSettings {
  autoDeal: boolean;
  lastBetAmount: number;
  soundEnabled?: boolean;
  showHandTotal?: boolean;
}

interface SettingsProps {
  settings: GameSettings;
  onUpdateSettings: (settings: Partial<GameSettings>) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Settings({ settings, onUpdateSettings, isOpen, onClose }: SettingsProps) {
  // Sync soundManager with settings on mount and when settings change
  useEffect(() => {
    const soundEnabled = settings.soundEnabled ?? true;
    soundManager.setEnabled(soundEnabled);
  }, [settings.soundEnabled]);

  const handleToggle = (key: keyof GameSettings) => {
    if (typeof settings[key] === 'boolean') {
      const newValue = !settings[key];
      onUpdateSettings({ [key]: newValue });

      // Update soundManager immediately when sound setting changes
      if (key === 'soundEnabled') {
        soundManager.setEnabled(newValue);
      }
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

        <div className="flex items-center justify-between">
          <div>
            <div className="text-white font-semibold">Sound Effects</div>
            <div className="text-gray-400 text-sm">
              Play sound effects for card dealing, betting, and game results
            </div>
          </div>
          <ToggleSwitch
            enabled={settings.soundEnabled ?? true}
            onChange={() => handleToggle('soundEnabled')}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-white font-semibold">Show Hand Totals</div>
            <div className="text-gray-400 text-sm">
              Display hand values under cards (turn off to practice mental math)
            </div>
          </div>
          <ToggleSwitch
            enabled={settings.showHandTotal ?? true}
            onChange={() => handleToggle('showHandTotal')}
          />
        </div>
      </div>
    </Modal>
  );
}
