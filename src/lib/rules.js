import { calculateHandValue, isBlackjack, isBust } from './deck';
import { GAME_RESULT } from './types';

/**
 * Determine if dealer should hit
 */
export function dealerShouldHit(dealerCards, hitSoft17 = false) {
  const { value, isSoft } = calculateHandValue(dealerCards);

  if (value < 17) return true;
  if (value > 17) return false;

  // Value is exactly 17
  if (hitSoft17 && isSoft) return true;

  return false;
}

/**
 * Determine the outcome of a hand
 */
export function determineOutcome(playerCards, dealerCards) {
  const playerBlackjack = isBlackjack(playerCards);
  const dealerBlackjack = isBlackjack(dealerCards);
  const playerBust = isBust(playerCards);
  const dealerBust = isBust(dealerCards);

  // Player busts - always loses
  if (playerBust) {
    return GAME_RESULT.LOSE;
  }

  // Both have blackjack - push
  if (playerBlackjack && dealerBlackjack) {
    return GAME_RESULT.PUSH;
  }

  // Player has blackjack - wins (pays 3:2)
  if (playerBlackjack) {
    return GAME_RESULT.BLACKJACK;
  }

  // Dealer has blackjack - player loses
  if (dealerBlackjack) {
    return GAME_RESULT.LOSE;
  }

  // Dealer busts - player wins
  if (dealerBust) {
    return GAME_RESULT.WIN;
  }

  // Compare values
  const playerValue = calculateHandValue(playerCards).value;
  const dealerValue = calculateHandValue(dealerCards).value;

  if (playerValue > dealerValue) {
    return GAME_RESULT.WIN;
  } else if (playerValue < dealerValue) {
    return GAME_RESULT.LOSE;
  } else {
    return GAME_RESULT.PUSH;
  }
}

/**
 * Calculate payout based on result
 */
export function calculatePayout(bet, result, blackjackPayout = [3, 2]) {
  switch (result) {
    case GAME_RESULT.BLACKJACK:
      // Blackjack pays 3:2 (or configured ratio)
      return bet + (bet * blackjackPayout[0]) / blackjackPayout[1];
    case GAME_RESULT.WIN:
      // Regular win pays 1:1
      return bet * 2;
    case GAME_RESULT.PUSH:
      // Push returns original bet
      return bet;
    case GAME_RESULT.LOSE:
      // Loss returns nothing
      return 0;
    default:
      return 0;
  }
}

/**
 * Get a human-readable message for the result
 */
export function getResultMessage(result, payout, bet) {
  switch (result) {
    case GAME_RESULT.BLACKJACK:
      return `Blackjack! You win $${payout - bet}`;
    case GAME_RESULT.WIN:
      return `You win! +$${payout - bet}`;
    case GAME_RESULT.PUSH:
      return `Push - bet returned`;
    case GAME_RESULT.LOSE:
      return `You lose -$${bet}`;
    default:
      return '';
  }
}
