import { RANKS, SUITS, Card } from './types';
import {
  ACE_HIGH_VALUE,
  FACE_CARD_VALUE,
  ACE_VALUE_ADJUSTMENT,
  BLACKJACK_VALUE,
  INITIAL_HAND_SIZE,
  FIRST_INDEX,
  ZERO,
} from './constants';

/**
 * Create a single 52-card deck
 */
export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ rank, suit });
    }
  }
  return deck;
}

/**
 * Create a shoe with multiple decks
 */
export function createShoe(deckCount: number = 6): Card[] {
  let shoe: Card[] = [];
  for (let i = 0; i < deckCount; i++) {
    shoe = shoe.concat(createDeck());
  }
  return shuffleDeck(shoe);
}

/**
 * Fisher-Yates shuffle algorithm
 */
export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Draw a card from the shoe
 */
export function drawCard(shoe: Card[]): { card: Card; remainingShoe: Card[] } {
  if (shoe.length === ZERO) {
    throw new Error('Shoe is empty');
  }
  return {
    card: shoe[FIRST_INDEX],
    remainingShoe: shoe.slice(1),
  };
}

/**
 * Get the numeric value of a card
 * Aces can be 1 or 11 (handled in hand calculation)
 */
export function getCardValue(card: Card): number {
  if (card.rank === 'A') {
    return ACE_HIGH_VALUE; // Default to 11, will adjust for soft hands
  }
  if (['J', 'Q', 'K'].includes(card.rank)) {
    return FACE_CARD_VALUE;
  }
  return parseInt(card.rank);
}

/**
 * Calculate hand value, accounting for soft aces
 * Returns { value, isSoft }
 */
export function calculateHandValue(cards: Card[]): { value: number; isSoft: boolean } {
  let value = 0;
  let aces = 0;

  // Sum all cards
  for (const card of cards) {
    value += getCardValue(card);
    if (card.rank === 'A') {
      aces++;
    }
  }

  // Adjust for aces (convert from 11 to 1 if busting)
  while (value > BLACKJACK_VALUE && aces > ZERO) {
    value -= ACE_VALUE_ADJUSTMENT; // Convert an ace from 11 to 1
    aces--;
  }

  // Hand is soft if it contains an ace counted as 11
  const isSoft = aces > ZERO && value <= BLACKJACK_VALUE;

  return { value, isSoft };
}

/**
 * Check if a hand is blackjack (21 with 2 cards)
 */
export function isBlackjack(cards: Card[]): boolean {
  if (cards.length !== INITIAL_HAND_SIZE) return false;
  const { value } = calculateHandValue(cards);
  return value === BLACKJACK_VALUE;
}

/**
 * Check if a hand is bust
 */
export function isBust(cards: Card[]): boolean {
  const { value } = calculateHandValue(cards);
  return value > BLACKJACK_VALUE;
}

/**
 * Check if a hand is a pair (can be split)
 */
export function isPair(cards: Card[]): boolean {
  if (cards.length !== INITIAL_HAND_SIZE) return false;

  // Both cards must have same rank
  return cards[FIRST_INDEX].rank === cards[1].rank;
}

/**
 * Check if two cards have the same value (for split purposes)
 * Some casinos allow splitting any 10-value cards (10, J, Q, K)
 */
export function isSameValue(cards: Card[]): boolean {
  if (cards.length !== INITIAL_HAND_SIZE) return false;

  const value1 = getCardValue(cards[FIRST_INDEX]);
  const value2 = getCardValue(cards[1]);

  return value1 === value2;
}
