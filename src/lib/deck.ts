import { RANKS, SUITS, Card } from './types';

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
  if (shoe.length === 0) {
    throw new Error('Shoe is empty');
  }
  return {
    card: shoe[0],
    remainingShoe: shoe.slice(1),
  };
}

/**
 * Get the numeric value of a card
 * Aces can be 1 or 11 (handled in hand calculation)
 */
export function getCardValue(card: Card): number {
  if (card.rank === 'A') {
    return 11; // Default to 11, will adjust for soft hands
  }
  if (['J', 'Q', 'K'].includes(card.rank)) {
    return 10;
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
  while (value > 21 && aces > 0) {
    value -= 10; // Convert an ace from 11 to 1
    aces--;
  }

  // Hand is soft if it contains an ace counted as 11
  const isSoft = aces > 0 && value <= 21;

  return { value, isSoft };
}

/**
 * Check if a hand is blackjack (21 with 2 cards)
 */
export function isBlackjack(cards: Card[]): boolean {
  if (cards.length !== 2) return false;
  const { value } = calculateHandValue(cards);
  return value === 21;
}

/**
 * Check if a hand is bust
 */
export function isBust(cards: Card[]): boolean {
  const { value } = calculateHandValue(cards);
  return value > 21;
}

/**
 * Check if a hand is a pair (can be split)
 */
export function isPair(cards: Card[]): boolean {
  if (cards.length !== 2) return false;

  // Both cards must have same rank
  return cards[0].rank === cards[1].rank;
}

/**
 * Check if two cards have the same value (for split purposes)
 * Some casinos allow splitting any 10-value cards (10, J, Q, K)
 */
export function isSameValue(cards: Card[]): boolean {
  if (cards.length !== 2) return false;

  const value1 = getCardValue(cards[0]);
  const value2 = getCardValue(cards[1]);

  return value1 === value2;
}
