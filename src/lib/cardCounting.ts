// Card counting system for Blackjack learning

import { Card, Rank } from './types';

export type CountingSystem = 'hi-lo' | 'ko' | 'hi-opt-i' | 'hi-opt-ii' | 'omega-ii';

export interface CardCountingState {
  isActive: boolean;
  system: CountingSystem;
  runningCount: number;
  trueCount: number;
  decksRemaining: number;
  cardsDealt: number;
  totalDecks: number;
  recommendations: {
    betMultiplier: number;
    shouldInsure: boolean;
    shouldDeviate: boolean;
    suggestion: string;
  };
}

/**
 * Get the count value for a card based on the counting system
 */
export function getCardCountValue(card: Card, system: CountingSystem): number {
  const rank = card.rank;

  switch (system) {
    case 'hi-lo':
      // Hi-Lo: +1 for 2-6, 0 for 7-9, -1 for 10-A
      if (['2', '3', '4', '5', '6'].includes(rank)) return 1;
      if (['7', '8', '9'].includes(rank)) return 0;
      return -1; // 10, J, Q, K, A

    case 'ko':
      // Knock-Out (KO): +1 for 2-7, 0 for 8-9, -1 for 10-A
      if (['2', '3', '4', '5', '6', '7'].includes(rank)) return 1;
      if (['8', '9'].includes(rank)) return 0;
      return -1;

    case 'hi-opt-i':
      // Hi-Opt I: +1 for 3-6, 0 for 2,7-9,A, -1 for 10-K
      if (['3', '4', '5', '6'].includes(rank)) return 1;
      if (['2', '7', '8', '9', 'A'].includes(rank)) return 0;
      return -1; // 10, J, Q, K

    case 'hi-opt-ii':
      // Hi-Opt II: +2 for 4-5, +1 for 2-3,6, 0 for 7-9,A, -2 for 10-K
      if (['4', '5'].includes(rank)) return 2;
      if (['2', '3', '6'].includes(rank)) return 1;
      if (['7', '8', '9', 'A'].includes(rank)) return 0;
      return -2; // 10, J, Q, K

    case 'omega-ii':
      // Omega II: +2 for 4-5, +1 for 2-3,6-7, 0 for 8-A, -2 for 10-K, -1 for 9
      if (['4', '5'].includes(rank)) return 2;
      if (['2', '3', '6', '7'].includes(rank)) return 1;
      if (['8', 'A'].includes(rank)) return 0;
      if (rank === '9') return -1;
      return -2; // 10, J, Q, K

    default:
      return 0;
  }
}

/**
 * Update the running count with a new card
 */
export function updateRunningCount(currentCount: number, card: Card, system: CountingSystem): number {
  return currentCount + getCardCountValue(card, system);
}

/**
 * Calculate the true count (running count / decks remaining)
 */
export function calculateTrueCount(runningCount: number, decksRemaining: number): number {
  if (decksRemaining <= 0) return 0;
  return Math.round((runningCount / decksRemaining) * 10) / 10; // Round to 1 decimal
}

/**
 * Calculate decks remaining based on cards dealt
 */
export function calculateDecksRemaining(totalDecks: number, cardsDealt: number): number {
  const totalCards = totalDecks * 52;
  const cardsRemaining = totalCards - cardsDealt;
  return Math.max(0.5, cardsRemaining / 52); // Minimum 0.5 deck
}

/**
 * Get betting and strategy recommendations based on true count
 */
export function getCountingRecommendations(trueCount: number, system: CountingSystem): {
  betMultiplier: number;
  shouldInsure: boolean;
  shouldDeviate: boolean;
  suggestion: string;
} {
  // Betting strategy based on true count
  let betMultiplier = 1;
  let shouldInsure = false;
  let shouldDeviate = false;
  let suggestion = '';

  if (trueCount >= 5) {
    betMultiplier = 8;
    shouldInsure = true;
    shouldDeviate = true;
    suggestion = 'Very favorable! Max bet recommended. Consider insurance and strategy deviations.';
  } else if (trueCount >= 4) {
    betMultiplier = 6;
    shouldInsure = true;
    shouldDeviate = true;
    suggestion = 'Highly favorable. Increase bet significantly. Insurance and deviations recommended.';
  } else if (trueCount >= 3) {
    betMultiplier = 4;
    shouldInsure = true;
    shouldDeviate = true;
    suggestion = 'Favorable count. Increase bet. Consider insurance on borderline hands.';
  } else if (trueCount >= 2) {
    betMultiplier = 3;
    shouldDeviate = true;
    suggestion = 'Slightly favorable. Moderate bet increase. Some deviations appropriate.';
  } else if (trueCount >= 1) {
    betMultiplier = 2;
    suggestion = 'Slightly positive. Small bet increase recommended.';
  } else if (trueCount >= -1) {
    betMultiplier = 1;
    suggestion = 'Neutral count. Play table minimum.';
  } else if (trueCount >= -2) {
    betMultiplier = 1;
    suggestion = 'Slightly negative. Consider table minimum or leaving.';
  } else {
    betMultiplier = 1;
    suggestion = 'Unfavorable count. Table minimum only or find another table.';
  }

  return { betMultiplier, shouldInsure, shouldDeviate, suggestion };
}

/**
 * Get a description of the counting system
 */
export function getCountingSystemDescription(system: CountingSystem): string {
  switch (system) {
    case 'hi-lo':
      return 'Hi-Lo: Most popular system. +1 for 2-6, 0 for 7-9, -1 for 10-A.';
    case 'ko':
      return 'Knock-Out (KO): Unbalanced system. +1 for 2-7, 0 for 8-9, -1 for 10-A.';
    case 'hi-opt-i':
      return 'Hi-Opt I: Ignores aces. +1 for 3-6, 0 for 2,7-9,A, -1 for 10-K.';
    case 'hi-opt-ii':
      return 'Hi-Opt II: More powerful. +2 for 4-5, +1 for 2-3,6, 0 for 7-9,A, -2 for 10-K.';
    case 'omega-ii':
      return 'Omega II: Advanced multi-level system with higher correlation.';
    default:
      return '';
  }
}

/**
 * Reset card counting state
 */
export function createInitialCardCountingState(totalDecks: number): CardCountingState {
  return {
    isActive: false,
    system: 'hi-lo',
    runningCount: 0,
    trueCount: 0,
    decksRemaining: totalDecks,
    cardsDealt: 0,
    totalDecks,
    recommendations: {
      betMultiplier: 1,
      shouldInsure: false,
      shouldDeviate: false,
      suggestion: 'Count starting. Play table minimum.',
    },
  };
}
