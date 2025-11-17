import { createShoe, drawCard, calculateHandValue, isBlackjack, isBust } from './deck';
import { dealerShouldHit, determineOutcome, calculatePayout } from './rules';
import { GAME_PHASES, HAND_STATUS, DEFAULT_CONFIG } from './types';

/**
 * Create initial game state
 */
export function createInitialState(config = DEFAULT_CONFIG) {
  // Load balance from localStorage or use default
  const savedBalance = localStorage.getItem('blackjack_balance');
  const balance = savedBalance ? parseFloat(savedBalance) : config.startingBalance;

  return {
    phase: GAME_PHASES.BETTING,
    balance,
    currentBet: 0,
    shoe: createShoe(config.deckCount),
    discardPile: [],
    playerHand: [],
    dealerHand: [],
    result: null,
    resultMessage: '',
    config,
  };
}

/**
 * Game reducer - handles all game state transitions
 */
export function gameReducer(state, action) {
  switch (action.type) {
    case 'PLACE_BET': {
      const { amount } = action;
      if (amount < state.config.minBet || amount > state.config.maxBet) {
        return state;
      }
      if (amount > state.balance) {
        return state;
      }
      return {
        ...state,
        currentBet: amount,
        phase: GAME_PHASES.DEALING,
      };
    }

    case 'DEAL_INITIAL': {
      let { shoe } = state;
      const playerHand = [];
      const dealerHand = [];

      // Deal player card 1
      let draw = drawCard(shoe);
      playerHand.push(draw.card);
      shoe = draw.remainingShoe;

      // Deal dealer card 1
      draw = drawCard(shoe);
      dealerHand.push(draw.card);
      shoe = draw.remainingShoe;

      // Deal player card 2
      draw = drawCard(shoe);
      playerHand.push(draw.card);
      shoe = draw.remainingShoe;

      // Deal dealer card 2 (face down)
      draw = drawCard(shoe);
      dealerHand.push(draw.card);
      shoe = draw.remainingShoe;

      // Check for immediate blackjack
      const playerBJ = isBlackjack(playerHand);
      const dealerBJ = isBlackjack(dealerHand);

      if (playerBJ || dealerBJ) {
        // Go straight to game over
        const result = determineOutcome(playerHand, dealerHand);
        const payout = calculatePayout(state.currentBet, result, state.config.blackjackPayout);
        const newBalance = state.balance - state.currentBet + payout;

        // Save balance to localStorage
        localStorage.setItem('blackjack_balance', newBalance.toString());

        return {
          ...state,
          shoe,
          playerHand,
          dealerHand,
          phase: GAME_PHASES.GAME_OVER,
          result,
          resultMessage: getResultMessage(result, payout, state.currentBet),
          balance: newBalance,
        };
      }

      return {
        ...state,
        shoe,
        playerHand,
        dealerHand,
        phase: GAME_PHASES.PLAYER_TURN,
        result: null,
        resultMessage: '',
      };
    }

    case 'HIT': {
      const draw = drawCard(state.shoe);
      const newPlayerHand = [...state.playerHand, draw.card];
      const bust = isBust(newPlayerHand);

      if (bust) {
        // Player busts - dealer wins
        const newBalance = state.balance - state.currentBet;
        localStorage.setItem('blackjack_balance', newBalance.toString());

        return {
          ...state,
          shoe: draw.remainingShoe,
          playerHand: newPlayerHand,
          phase: GAME_PHASES.GAME_OVER,
          result: 'lose',
          resultMessage: `Bust! You lose $${state.currentBet}`,
          balance: newBalance,
        };
      }

      return {
        ...state,
        shoe: draw.remainingShoe,
        playerHand: newPlayerHand,
      };
    }

    case 'STAND': {
      return {
        ...state,
        phase: GAME_PHASES.DEALER_TURN,
      };
    }

    case 'DEALER_PLAY': {
      let { shoe, dealerHand } = state;

      // Dealer draws until reaching 17 or busting
      while (dealerShouldHit(dealerHand, state.config.dealerHitsSoft17)) {
        const draw = drawCard(shoe);
        dealerHand = [...dealerHand, draw.card];
        shoe = draw.remainingShoe;
      }

      // Determine outcome
      const result = determineOutcome(state.playerHand, dealerHand);
      const payout = calculatePayout(state.currentBet, result, state.config.blackjackPayout);
      const newBalance = state.balance - state.currentBet + payout;

      // Save balance to localStorage
      localStorage.setItem('blackjack_balance', newBalance.toString());

      return {
        ...state,
        shoe,
        dealerHand,
        phase: GAME_PHASES.GAME_OVER,
        result,
        resultMessage: getResultMessage(result, payout, state.currentBet),
        balance: newBalance,
      };
    }

    case 'NEW_GAME': {
      // Check if we need to reshuffle (less than 52 cards left)
      const shoe = state.shoe.length < 52 ? createShoe(state.config.deckCount) : state.shoe;

      return {
        ...state,
        phase: GAME_PHASES.BETTING,
        currentBet: 0,
        shoe,
        playerHand: [],
        dealerHand: [],
        result: null,
        resultMessage: '',
      };
    }

    case 'RESET_BALANCE': {
      const newBalance = state.config.startingBalance;
      localStorage.setItem('blackjack_balance', newBalance.toString());
      return {
        ...createInitialState(state.config),
        balance: newBalance,
      };
    }

    default:
      return state;
  }
}

function getResultMessage(result, payout, bet) {
  switch (result) {
    case 'blackjack':
      return `Blackjack! You win $${payout - bet}`;
    case 'win':
      return `You win! +$${payout - bet}`;
    case 'push':
      return `Push - bet returned`;
    case 'lose':
      return `You lose -$${bet}`;
    default:
      return '';
  }
}
