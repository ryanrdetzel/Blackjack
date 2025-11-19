import React from 'react';
import { GameConfig } from '../../lib/types';
import { Card } from '../ui';

interface CurrentConfigInfoProps {
  config: GameConfig;
}

/**
 * Displays current configuration information
 */
export default React.memo(function CurrentConfigInfo({ config }: CurrentConfigInfoProps) {
  return (
    <Card variant="bordered" padding="md">
      <h3 className="text-white font-semibold mb-2">Current Configuration</h3>
      <p className="text-gray-300 font-medium">{config.name}</p>
      <div className="text-sm text-gray-400 mt-1">
        {config.deckCount} deck{config.deckCount > 1 ? 's' : ''} •
        Blackjack pays {config.blackjackPayout[0]}:{config.blackjackPayout[1]} •
        ${config.minBet}-${config.maxBet} bets
      </div>
    </Card>
  );
});
