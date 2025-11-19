/**
 * Hand Detail Modal - Detailed view of a single hand
 */

import React from 'react';
import { HandRecord } from '../../lib/statistics';
import { Modal, Button } from '../ui';
import { getProfitColorClass, formatCurrency, formatTimestamp } from '../../lib/uiUtils';
import Card from '../Card';

interface HandDetailModalProps {
  hand: HandRecord;
  onClose: () => void;
}

/**
 * Modal showing detailed information about a played hand
 */
export default function HandDetailModal({ hand, onClose }: HandDetailModalProps) {
  const date = formatTimestamp(hand.timestamp);

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Hand Details"
      maxWidth="4xl"
      footer={
        <Button onClick={onClose} variant="primary" fullWidth>
          Close
        </Button>
      }
    >
      {/* Timestamp */}
      <p className="text-sm text-gray-400 mb-6">{date}</p>

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
          const netProfit = playerHand.payout - playerHand.bet;
          const profitColor = getProfitColorClass(netProfit);

          return (
            <div key={index} className="bg-gray-900 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-400">
                  Hand {index + 1} - {playerHand.result.toUpperCase()}
                </span>
                <div className="text-right">
                  <div className="text-xs text-gray-500">
                    Bet: {formatCurrency(playerHand.bet)}
                  </div>
                  <div className={`text-sm font-semibold ${profitColor}`}>
                    {netProfit >= 0 ? '+' : ''}{formatCurrency(netProfit)}
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
            <span className="text-white ml-2">{formatCurrency(hand.totalBet)}</span>
          </div>
          <div>
            <span className="text-gray-400">Total Payout:</span>
            <span className="text-white ml-2">{formatCurrency(hand.totalPayout)}</span>
          </div>
          <div>
            <span className="text-gray-400">Net Result:</span>
            <span className={`ml-2 font-semibold ${getProfitColorClass(hand.netProfit)}`}>
              {hand.netProfit >= 0 ? '+' : ''}{formatCurrency(hand.netProfit)}
            </span>
          </div>
          {hand.insurance > 0 && (
            <div className="col-span-2">
              <span className="text-gray-400">Insurance:</span>
              <span className="text-white ml-2">{formatCurrency(hand.insurance)}</span>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
