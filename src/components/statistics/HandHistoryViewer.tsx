/**
 * Hand History Viewer - Milestone 6
 * Displays detailed history of played hands
 */

import React from 'react';
import { HandRecord } from '../../lib/statistics';
import { EmptyState } from '../ui';
import HandHistoryItem from './HandHistoryItem';
import HandDetailModal from './HandDetailModal';

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
        <EmptyState
          message="No hands to display"
          description="Play some hands to see your history here"
        />
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
