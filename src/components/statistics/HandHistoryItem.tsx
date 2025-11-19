/**
 * Hand History Item - Individual hand display in history list
 */

import React from 'react';
import { HandRecord } from '../../lib/statistics';
import { getProfitColorClass, formatCurrency, formatTimestamp } from '../../lib/uiUtils';

interface HandHistoryItemProps {
  hand: HandRecord;
  isSelected: boolean;
  onClick: () => void;
}

/**
 * Single hand history item - clickable to show details
 */
export default React.memo(function HandHistoryItem({
  hand,
  isSelected,
  onClick
}: HandHistoryItemProps) {
  const date = formatTimestamp(hand.timestamp);
  const profitColor = getProfitColorClass(hand.netProfit);

  // Get overall result
  const getOverallResult = () => {
    if (hand.netProfit > 0) return '✓ WIN';
    if (hand.netProfit < 0) return '✗ LOSS';
    return '− PUSH';
  };

  return (
    <button
      onClick={onClick}
      className={`w-full text-left bg-gray-800 hover:bg-gray-750 rounded-lg p-4 border transition-colors ${
        isSelected ? 'border-blue-500 bg-gray-750' : 'border-gray-700'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-xs text-gray-500">{date}</span>
            <span className="text-xs text-gray-600">•</span>
            <span className="text-xs text-gray-500">{hand.configName}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className={`font-semibold ${profitColor}`}>{getOverallResult()}</span>
            <span className="text-sm text-gray-400">
              {hand.playerHands.length} {hand.playerHands.length === 1 ? 'hand' : 'hands'}
            </span>
            <span className="text-sm text-gray-400">Bet: {formatCurrency(hand.totalBet)}</span>
          </div>
        </div>
        <div className={`text-right font-semibold ${profitColor}`}>
          {hand.netProfit >= 0 ? '+' : ''}{formatCurrency(hand.netProfit)}
        </div>
      </div>
    </button>
  );
});
