// Core game types and constants

export const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'] as const;
export const SUITS = ['♠', '♥', '♦', '♣'] as const;

export const GAME_PHASES = {
  BETTING: 'betting',
  DEALING: 'dealing',
  PLAYER_TURN: 'player_turn',
  DEALER_TURN: 'dealer_turn',
  GAME_OVER: 'game_over',
} as const;

export const HAND_STATUS = {
  ACTIVE: 'active',
  STAND: 'stand',
  BUST: 'bust',
  BLACKJACK: 'blackjack',
  SURRENDER: 'surrender',
} as const;

export const GAME_RESULT = {
  WIN: 'win',
  LOSE: 'lose',
  PUSH: 'push',
  BLACKJACK: 'blackjack',
  DEALER_BLACKJACK: 'dealer_blackjack',
  SURRENDER: 'surrender',
} as const;

// Type definitions
export type Rank = typeof RANKS[number];
export type Suit = typeof SUITS[number];
export type GamePhase = typeof GAME_PHASES[keyof typeof GAME_PHASES];
export type HandStatus = typeof HAND_STATUS[keyof typeof HAND_STATUS];
export type GameResult = typeof GAME_RESULT[keyof typeof GAME_RESULT];

export interface Card {
  rank: Rank;
  suit: Suit;
  value?: number;
}

export interface Hand {
  cards: Card[];
  status: HandStatus;
  bet: number;
  result?: GameResult;
  payout?: number;
}

export interface GameConfig {
  name: string;
  deckCount: number;
  dealerHitsSoft17: boolean;
  blackjackPayout: [number, number];
  minBet: number;
  maxBet: number;
  startingBalance: number;
  doubleAfterSplit: boolean;
  resplitAcesAllowed: boolean;
  maxSplits: number;
  surrenderAllowed: boolean;
  insuranceAllowed: boolean;
}

// Default game configuration
export const DEFAULT_CONFIG: GameConfig = {
  name: 'Standard',
  deckCount: 6,
  dealerHitsSoft17: false,
  blackjackPayout: [3, 2], // 3:2
  minBet: 5,
  maxBet: 500,
  startingBalance: 1000,
  // Milestone 2 options
  doubleAfterSplit: true,
  resplitAcesAllowed: false,
  maxSplits: 3,
  surrenderAllowed: true,
  insuranceAllowed: true,
};
