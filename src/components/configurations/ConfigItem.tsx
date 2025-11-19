import React from 'react';
import { GameConfig } from '../../lib/types';
import { Button, Badge } from '../ui';

interface ConfigItemProps {
  config: GameConfig;
  isPreset: boolean;
  onLoad: (config: GameConfig) => void;
  onDuplicate: (config: GameConfig) => void;
  onExport: (config: GameConfig) => void;
  onDelete: (name: string) => void;
}

/**
 * Single configuration item display with action buttons
 */
export default React.memo(function ConfigItem({
  config,
  isPreset,
  onLoad,
  onDuplicate,
  onExport,
  onDelete
}: ConfigItemProps) {
  return (
    <div className="bg-gray-700 rounded-lg p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-white font-semibold">{config.name}</h4>
            {isPreset && <Badge variant="info" size="sm">Preset</Badge>}
          </div>
          <div className="text-sm text-gray-400 space-y-1">
            <div>
              {config.deckCount} deck{config.deckCount > 1 ? 's' : ''} •
              Dealer {config.dealerHitsSoft17 ? 'hits' : 'stands'} soft 17 •
              BJ pays {config.blackjackPayout[0]}:{config.blackjackPayout[1]}
            </div>
            <div>
              Bets: ${config.minBet}-${config.maxBet}
              {config.surrenderAllowed && ' • Surrender'}
              {config.doubleAfterSplit && ' • DAS'}
              {config.resplitAcesAllowed && ' • Resplit Aces'}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => onLoad(config)}
            variant="primary"
            size="sm"
            title="Load this configuration"
          >
            Load
          </Button>
          <Button
            onClick={() => onDuplicate(config)}
            variant="ghost"
            size="sm"
            title="Duplicate this configuration"
          >
            📋
          </Button>
          <Button
            onClick={() => onExport(config)}
            variant="ghost"
            size="sm"
            title="Export as JSON"
          >
            📤
          </Button>
          {!isPreset && (
            <Button
              onClick={() => onDelete(config.name)}
              variant="danger"
              size="sm"
              title="Delete this configuration"
            >
              🗑️
            </Button>
          )}
        </div>
      </div>
    </div>
  );
});
