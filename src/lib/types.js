// Core game types and constants

export const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
export const SUITS = ['♠', '♥', '♦', '♣'];

export const GAME_PHASES = {
  BETTING: 'betting',
  DEALING: 'dealing',
  PLAYER_TURN: 'player_turn',
  DEALER_TURN: 'dealer_turn',
  GAME_OVER: 'game_over',
};

export const HAND_STATUS = {
  ACTIVE: 'active',
  STAND: 'stand',
  BUST: 'bust',
  BLACKJACK: 'blackjack',
  SURRENDER: 'surrender',
};

export const GAME_RESULT = {
  WIN: 'win',
  LOSE: 'lose',
  PUSH: 'push',
  BLACKJACK: 'blackjack',
  DEALER_BLACKJACK: 'dealer_blackjack',
  SURRENDER: 'surrender',
};

// Default game configuration
export const DEFAULT_CONFIG = {
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
