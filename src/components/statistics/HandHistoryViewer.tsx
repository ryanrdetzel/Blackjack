/**
 * Hand History Viewer - Milestone 6
 * Displays detailed history of played hands
 */

import React from 'react';
import { HandRecord } from '../../lib/statistics';
import Card from '../Card';

interface HandHistoryViewerProps {
  handHistory: HandRecord[];
}

export function HandHistoryViewer({ handHistory }: HandHistoryViewerProps) {
  const [selectedHand, setSelectedHand] = React.useState<HandRecord | null>(null);
  const [filter, setFilter] = React.useState<'all' | 'wins' | 'losses'>('all');
  const [sortOrder, setSortOrder] = React.useState<'newest' | 'oldest'>('newest');

  // Filter hands
  const filteredHands = handHistory.filter(hand => {
    if (filter === 'wins') return hand.netProfit > 0;
    if (filter === 'losses') return hand.netProfit < 0;
    return true;
  });

  // Sort hands
  const sortedHands = [...filteredHands].sort((a, b) => {
    return sortOrder === 'newest' ? b.timestamp - a.timestamp : a.timestamp - b.timestamp;
  });

  // Show only last 50 hands for performance
  const displayedHands = sortedHands.slice(0, 50);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold text-white">Hand History</h2>
        <div className="flex gap-2 flex-wrap">
          {/* Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'wins' | 'losses')}
            className="px-3 py-1 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Hands</option>
            <option value="wins">Wins Only</option>
            <option value="losses">Losses Only</option>
          </select>

          {/* Sort */}
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
            className="px-3 py-1 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Summary */}
      <div className="text-sm text-gray-400">
        Showing {displayedHands.length} of {filteredHands.length} hands
        {filteredHands.length !== handHistory.length && ` (filtered from ${handHistory.length} total)`}
        {sortedHands.length > 50 && ' - showing most recent 50'}
      </div>

      {/* Hands List */}
      {displayedHands.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700">
          <p className="text-gray-400">No hands to display</p>
          <p className="text-sm text-gray-500 mt-2">Play some hands to see your history here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayedHands.map((hand) => (
            <HandHistoryItem
              key={hand.id}
              hand={hand}
              isSelected={selectedHand?.id === hand.id}
              onClick={() => setSelectedHand(selectedHand?.id === hand.id ? null : hand)}
            />
          ))}
        </div>
      )}

      {/* Detailed View Modal */}
      {selectedHand && (
        <HandDetailModal hand={selectedHand} onClose={() => setSelectedHand(null)} />
      )}
    </div>
  );
}

interface HandHistoryItemProps {
  hand: HandRecord;
  isSelected: boolean;
  onClick: () => void;
}

function HandHistoryItem({ hand, isSelected, onClick }: HandHistoryItemProps) {
  const date = new Date(hand.timestamp).toLocaleString();
  const profitColor = hand.netProfit > 0 ? 'text-green-400' : hand.netProfit < 0 ? 'text-red-400' : 'text-gray-400';

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
            <span className="text-sm text-gray-400">Bet: ${hand.totalBet.toFixed(2)}</span>
          </div>
        </div>
        <div className={`text-right font-semibold ${profitColor}`}>
          {hand.netProfit >= 0 ? '+' : ''}${hand.netProfit.toFixed(2)}
        </div>
      </div>
    </button>
  );
}

interface HandDetailModalProps {
  hand: HandRecord;
  onClose: () => void;
}

function HandDetailModal({ hand, onClose }: HandDetailModalProps) {
  const date = new Date(hand.timestamp).toLocaleString();

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-white">Hand Details</h3>
            <p className="text-sm text-gray-400 mt-1">{date}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Dealer Hand */}
        <div className="mb-6 bg-gray-900 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-400 mb-3">Dealer</h4>
          <div className="flex gap-2 flex-wrap">
            {hand.dealerHand.map((card, index) => (
              <div key={index} className="scale-75 origin-left">
                <Card card={card} faceDown={false} />
              </div>
            ))}
          </div>
        </div>

        {/* Player Hands */}
        <div className="space-y-4 mb-6">
          <h4 className="text-sm font-semibold text-gray-400">Your Hands</h4>
          {hand.playerHands.map((playerHand, index) => {
            const profitColor =
              playerHand.payout - playerHand.bet > 0
                ? 'text-green-400'
                : playerHand.payout - playerHand.bet < 0
                ? 'text-red-400'
                : 'text-gray-400';

            return (
              <div key={index} className="bg-gray-900 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-400">
                    Hand {index + 1} - {playerHand.result.toUpperCase()}
                  </span>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Bet: ${playerHand.bet.toFixed(2)}</div>
                    <div className={`text-sm font-semibold ${profitColor}`}>
                      {playerHand.payout - playerHand.bet >= 0 ? '+' : ''}$
                      {(playerHand.payout - playerHand.bet).toFixed(2)}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {playerHand.cards.map((card, cardIndex) => (
                    <div key={cardIndex} className="scale-75 origin-left">
                      <Card card={card} faceDown={false} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="bg-gray-900 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Configuration:</span>
              <span className="text-white ml-2">{hand.configName}</span>
            </div>
            <div>
              <span className="text-gray-400">Total Bet:</span>
              <span className="text-white ml-2">${hand.totalBet.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-gray-400">Total Payout:</span>
              <span className="text-white ml-2">${hand.totalPayout.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-gray-400">Net Result:</span>
              <span
                className={`ml-2 font-semibold ${
                  hand.netProfit > 0 ? 'text-green-400' : hand.netProfit < 0 ? 'text-red-400' : 'text-gray-400'
                }`}
              >
                {hand.netProfit >= 0 ? '+' : ''}${hand.netProfit.toFixed(2)}
              </span>
            </div>
            {hand.insurance > 0 && (
              <div className="col-span-2">
                <span className="text-gray-400">Insurance:</span>
                <span className="text-white ml-2">${hand.insurance.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Close Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
