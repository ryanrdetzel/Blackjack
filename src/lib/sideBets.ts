// Side bet types and logic for Blackjack

import { Card, Rank } from './types';

export interface SideBetResult {
  won: boolean;
  payout: number;
  description: string;
}

/**
 * Perfect Pairs side bet
 * Pays if the first two cards are a pair
 * - Perfect Pair (same rank and suit): 25:1
 * - Colored Pair (same rank and color, different suits): 12:1
 * - Mixed Pair (same rank, different colors): 6:1
 */
export function evaluatePerfectPairs(cards: Card[], betAmount: number): SideBetResult {
  if (cards.length !== 2) {
    return { won: false, payout: 0, description: 'No pair' };
  }

  const [card1, card2] = cards;

  // Check if ranks match
  if (card1.rank !== card2.rank) {
    return { won: false, payout: 0, description: 'No pair' };
  }

  // Perfect pair - same rank and suit
  if (card1.suit === card2.suit) {
    return {
      won: true,
      payout: betAmount * 25,
      description: 'Perfect Pair! (25:1)',
    };
  }

  // Get card colors
  const color1 = (card1.suit === '♥' || card1.suit === '♦') ? 'red' : 'black';
  const color2 = (card2.suit === '♥' || card2.suit === '♦') ? 'red' : 'black';

  // Colored pair - same rank and color, different suits
  if (color1 === color2) {
    return {
      won: true,
      payout: betAmount * 12,
      description: 'Colored Pair! (12:1)',
    };
  }

  // Mixed pair - same rank, different colors
  return {
    won: true,
    payout: betAmount * 6,
    description: 'Mixed Pair! (6:1)',
  };
}

/**
 * 21+3 side bet
 * Combines player's first two cards with dealer's up card
 * - Suited Trips (three of same rank and suit): 100:1
 * - Straight Flush (straight with all same suit): 40:1
 * - Three of a Kind (three of same rank): 30:1
 * - Straight (sequential ranks): 10:1
 * - Flush (all same suit): 5:1
 */
export function evaluate21Plus3(playerCards: Card[], dealerUpCard: Card, betAmount: number): SideBetResult {
  if (playerCards.length !== 2) {
    return { won: false, payout: 0, description: 'Not eligible' };
  }

  const cards = [...playerCards, dealerUpCard];
  const ranks = cards.map(c => c.rank);
  const suits = cards.map(c => c.suit);

  // Helper function to get numeric value for straights
  const getRankValue = (rank: Rank): number => {
    if (rank === 'A') return 1; // Ace can be 1 or 14
    if (rank === 'J') return 11;
    if (rank === 'Q') return 12;
    if (rank === 'K') return 13;
    return parseInt(rank);
  };

  const rankValues = ranks.map(getRankValue).sort((a, b) => a - b);

  // Check for Suited Trips
  if (ranks[0] === ranks[1] && ranks[1] === ranks[2] && suits[0] === suits[1] && suits[1] === suits[2]) {
    return {
      won: true,
      payout: betAmount * 100,
      description: 'Suited Trips! (100:1)',
    };
  }

  // Check if all same suit (for Straight Flush or Flush)
  const isFlush = suits[0] === suits[1] && suits[1] === suits[2];

  // Check for Straight
  const isStraight =
    (rankValues[2] - rankValues[1] === 1 && rankValues[1] - rankValues[0] === 1) ||
    // Special case: A-2-3
    (rankValues[0] === 1 && rankValues[1] === 2 && rankValues[2] === 3) ||
    // Special case: Q-K-A
    (rankValues[0] === 1 && rankValues[1] === 12 && rankValues[2] === 13);

  // Straight Flush
  if (isStraight && isFlush) {
    return {
      won: true,
      payout: betAmount * 40,
      description: 'Straight Flush! (40:1)',
    };
  }

  // Three of a Kind
  if (ranks[0] === ranks[1] && ranks[1] === ranks[2]) {
    return {
      won: true,
      payout: betAmount * 30,
      description: 'Three of a Kind! (30:1)',
    };
  }

  // Straight
  if (isStraight) {
    return {
      won: true,
      payout: betAmount * 10,
      description: 'Straight! (10:1)',
    };
  }

  // Flush
  if (isFlush) {
    return {
      won: true,
      payout: betAmount * 5,
      description: 'Flush! (5:1)',
    };
  }

  return { won: false, payout: 0, description: 'No winning combination' };
}
