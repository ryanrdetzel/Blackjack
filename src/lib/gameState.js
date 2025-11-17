import { createShoe, drawCard, calculateHandValue, isBlackjack, isBust, isPair } from './deck';
import { dealerShouldHit, determineOutcome, calculatePayout } from './rules';
import { GAME_PHASES, HAND_STATUS, DEFAULT_CONFIG } from './types';

/**
 * Create initial game state
 */
export function createInitialState(config = DEFAULT_CONFIG) {
  // Handle null config (e.g., when used as lazy initializer in useReducer)
  const finalConfig = config || DEFAULT_CONFIG;

  // Load balance from localStorage or use default
  const savedBalance = localStorage.getItem('blackjack_balance');
  const balance = savedBalance ? parseFloat(savedBalance) : finalConfig.startingBalance;

  return {
    phase: GAME_PHASES.BETTING,
    balance,
    currentBet: 0,
    shoe: createShoe(finalConfig.deckCount),
    discardPile: [],
    playerHands: [], // Array of hand objects
    dealerHand: [],
    activeHandIndex: 0, // Which hand is currently being played
    insurance: 0, // Insurance bet amount
    result: null,
    resultMessage: '',
    config: finalConfig,
  };
}

/**
 * Create a new hand object
 */
function createHand(cards, bet, fromSplit = false) {
  return {
    cards,
    bet,
    status: HAND_STATUS.ACTIVE,
    doubled: false,
    fromSplit,
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
      const playerCards = [];
      const dealerCards = [];

      // Deal player card 1
      let draw = drawCard(shoe);
      playerCards.push(draw.card);
      shoe = draw.remainingShoe;

      // Deal dealer card 1
      draw = drawCard(shoe);
      dealerCards.push(draw.card);
      shoe = draw.remainingShoe;

      // Deal player card 2
      draw = drawCard(shoe);
      playerCards.push(draw.card);
      shoe = draw.remainingShoe;

      // Deal dealer card 2 (face down)
      draw = drawCard(shoe);
      dealerCards.push(draw.card);
      shoe = draw.remainingShoe;

      // Create initial player hand
      const playerHands = [createHand(playerCards, state.currentBet, false)];

      // Check for immediate blackjack
      const playerBJ = isBlackjack(playerCards);
      const dealerBJ = isBlackjack(dealerCards);

      if (playerBJ || dealerBJ) {
        // Go straight to game over
        const result = determineOutcome(playerCards, dealerCards);
        const payout = calculatePayout(state.currentBet, result, state.config.blackjackPayout);
        const newBalance = state.balance - state.currentBet + payout;

        // Save balance to localStorage
        localStorage.setItem('blackjack_balance', newBalance.toString());

        return {
          ...state,
          shoe,
          playerHands,
          dealerHand: dealerCards,
          phase: GAME_PHASES.GAME_OVER,
          result,
          resultMessage: getResultMessage(result, payout, state.currentBet),
          balance: newBalance,
        };
      }

      return {
        ...state,
        shoe,
        playerHands,
        dealerHand: dealerCards,
        activeHandIndex: 0,
        insurance: 0,
        phase: GAME_PHASES.PLAYER_TURN,
        result: null,
        resultMessage: '',
      };
    }

    case 'HIT': {
      const currentHand = state.playerHands[state.activeHandIndex];
      const draw = drawCard(state.shoe);
      const newCards = [...currentHand.cards, draw.card];
      const bust = isBust(newCards);

      // Update the current hand
      const newHands = [...state.playerHands];
      newHands[state.activeHandIndex] = {
        ...currentHand,
        cards: newCards,
        status: bust ? HAND_STATUS.BUST : HAND_STATUS.ACTIVE,
      };

      // If bust or doubled, move to next hand
      if (bust || currentHand.doubled) {
        const nextHandIndex = state.activeHandIndex + 1;
        if (nextHandIndex >= newHands.length) {
          // All hands played - move to dealer turn
          return {
            ...state,
            shoe: draw.remainingShoe,
            playerHands: newHands,
            phase: GAME_PHASES.DEALER_TURN,
          };
        } else {
          // Move to next hand
          return {
            ...state,
            shoe: draw.remainingShoe,
            playerHands: newHands,
            activeHandIndex: nextHandIndex,
          };
        }
      }

      return {
        ...state,
        shoe: draw.remainingShoe,
        playerHands: newHands,
      };
    }

    case 'STAND': {
      const newHands = [...state.playerHands];
      newHands[state.activeHandIndex] = {
        ...state.playerHands[state.activeHandIndex],
        status: HAND_STATUS.STAND,
      };

      const nextHandIndex = state.activeHandIndex + 1;
      if (nextHandIndex >= newHands.length) {
        // All hands played - move to dealer turn
        return {
          ...state,
          playerHands: newHands,
          phase: GAME_PHASES.DEALER_TURN,
        };
      }

      // Move to next hand
      return {
        ...state,
        playerHands: newHands,
        activeHandIndex: nextHandIndex,
      };
    }

    case 'DOUBLE': {
      const currentHand = state.playerHands[state.activeHandIndex];

      // Check if player has enough balance
      if (currentHand.bet > state.balance) {
        return state;
      }

      // Check if double after split is allowed
      if (currentHand.fromSplit && !state.config.doubleAfterSplit) {
        return state;
      }

      // Can only double on initial two cards
      if (currentHand.cards.length !== 2) {
        return state;
      }

      // Draw one card
      const draw = drawCard(state.shoe);
      const newCards = [...currentHand.cards, draw.card];
      const bust = isBust(newCards);

      // Update hand with doubled bet and new card
      const newHands = [...state.playerHands];
      newHands[state.activeHandIndex] = {
        ...currentHand,
        cards: newCards,
        bet: currentHand.bet * 2,
        doubled: true,
        status: bust ? HAND_STATUS.BUST : HAND_STATUS.STAND,
      };

      const nextHandIndex = state.activeHandIndex + 1;
      if (nextHandIndex >= newHands.length) {
        // All hands played - move to dealer turn
        return {
          ...state,
          shoe: draw.remainingShoe,
          playerHands: newHands,
          phase: GAME_PHASES.DEALER_TURN,
        };
      }

      // Move to next hand
      return {
        ...state,
        shoe: draw.remainingShoe,
        playerHands: newHands,
        activeHandIndex: nextHandIndex,
      };
    }

    case 'SPLIT': {
      const currentHand = state.playerHands[state.activeHandIndex];

      // Validate split is possible
      if (!isPair(currentHand.cards)) {
        return state;
      }

      // Check if player has enough balance for second bet
      if (currentHand.bet > state.balance) {
        return state;
      }

      // Check max splits limit
      const splitCount = state.playerHands.filter(h => h.fromSplit).length;
      if (splitCount >= state.config.maxSplits) {
        return state;
      }

      // Check if splitting aces is allowed (if already split aces)
      const isAces = currentHand.cards[0].rank === 'A';
      if (isAces && currentHand.fromSplit && !state.config.resplitAcesAllowed) {
        return state;
      }

      let { shoe } = state;

      // Split the hand into two hands
      const card1 = currentHand.cards[0];
      const card2 = currentHand.cards[1];

      // Draw new cards for each split hand
      let draw1 = drawCard(shoe);
      const hand1Cards = [card1, draw1.card];
      shoe = draw1.remainingShoe;

      let draw2 = drawCard(shoe);
      const hand2Cards = [card2, draw2.card];
      shoe = draw2.remainingShoe;

      // Create two new hands
      const hand1 = createHand(hand1Cards, currentHand.bet, true);
      const hand2 = createHand(hand2Cards, currentHand.bet, true);

      // Replace current hand with two split hands
      const newHands = [...state.playerHands];
      newHands.splice(state.activeHandIndex, 1, hand1, hand2);

      // If split aces, both hands automatically stand (standard rule)
      if (isAces) {
        newHands[state.activeHandIndex] = { ...hand1, status: HAND_STATUS.STAND };
        newHands[state.activeHandIndex + 1] = { ...hand2, status: HAND_STATUS.STAND };

        // Move to dealer turn since both hands stand
        return {
          ...state,
          shoe,
          playerHands: newHands,
          phase: GAME_PHASES.DEALER_TURN,
        };
      }

      return {
        ...state,
        shoe,
        playerHands: newHands,
      };
    }

    case 'SURRENDER': {
      if (!state.config.surrenderAllowed) {
        return state;
      }

      const currentHand = state.playerHands[state.activeHandIndex];

      // Can only surrender on initial two cards before any action
      if (currentHand.cards.length !== 2) {
        return state;
      }

      // Mark hand as surrendered
      const newHands = [...state.playerHands];
      newHands[state.activeHandIndex] = {
        ...currentHand,
        status: HAND_STATUS.SURRENDER,
      };

      const nextHandIndex = state.activeHandIndex + 1;
      if (nextHandIndex >= newHands.length) {
        // All hands played - move to dealer turn
        return {
          ...state,
          playerHands: newHands,
          phase: GAME_PHASES.DEALER_TURN,
        };
      }

      // Move to next hand
      return {
        ...state,
        playerHands: newHands,
        activeHandIndex: nextHandIndex,
      };
    }

    case 'INSURANCE': {
      if (!state.config.insuranceAllowed) {
        return state;
      }

      // Insurance is half the original bet
      const insuranceAmount = state.currentBet / 2;

      // Check if player has enough balance
      if (insuranceAmount > state.balance) {
        return state;
      }

      // Can only take insurance when dealer shows ace
      if (state.dealerHand[0].rank !== 'A') {
        return state;
      }

      return {
        ...state,
        insurance: insuranceAmount,
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

      // Determine outcome for each hand
      let totalPayout = 0;
      let resultMessages = [];
      const dealerBlackjack = isBlackjack(dealerHand);

      // Process insurance bet
      if (state.insurance > 0) {
        if (dealerBlackjack) {
          // Insurance pays 2:1
          totalPayout += state.insurance * 3; // Original bet + 2x payout
          resultMessages.push(`Insurance wins +$${state.insurance * 2}`);
        } else {
          resultMessages.push(`Insurance loses -$${state.insurance}`);
        }
      }

      // Process each hand
      state.playerHands.forEach((hand, index) => {
        let result;
        let handPayout = 0;

        if (hand.status === HAND_STATUS.SURRENDER) {
          // Surrender returns half the bet
          handPayout = hand.bet / 2;
          result = 'surrender';
          resultMessages.push(`Hand ${index + 1}: Surrendered (recovered $${handPayout})`);
        } else if (hand.status === HAND_STATUS.BUST) {
          // Bust loses the bet
          result = 'lose';
          resultMessages.push(`Hand ${index + 1}: Bust (lost $${hand.bet})`);
        } else {
          // Compare with dealer
          result = determineOutcome(hand.cards, dealerHand);
          handPayout = calculatePayout(hand.bet, result, state.config.blackjackPayout);

          const profit = handPayout - hand.bet;
          if (result === 'blackjack') {
            resultMessages.push(`Hand ${index + 1}: Blackjack! (+$${profit})`);
          } else if (result === 'win') {
            resultMessages.push(`Hand ${index + 1}: Win (+$${profit})`);
          } else if (result === 'push') {
            resultMessages.push(`Hand ${index + 1}: Push (bet returned)`);
          } else {
            resultMessages.push(`Hand ${index + 1}: Lose (-$${hand.bet})`);
          }
        }

        totalPayout += handPayout;
      });

      // Calculate total bet (all hands + insurance)
      const totalBet = state.playerHands.reduce((sum, hand) => sum + hand.bet, 0) + state.insurance;
      const newBalance = state.balance - totalBet + totalPayout;

      // Save balance to localStorage
      localStorage.setItem('blackjack_balance', newBalance.toString());

      // Create overall result message
      const netProfit = totalPayout - totalBet;
      const overallMessage = netProfit > 0
        ? `Total: +$${netProfit.toFixed(2)}`
        : netProfit < 0
        ? `Total: -$${Math.abs(netProfit).toFixed(2)}`
        : 'Total: Break even';

      return {
        ...state,
        shoe,
        dealerHand,
        phase: GAME_PHASES.GAME_OVER,
        result: netProfit > 0 ? 'win' : netProfit < 0 ? 'lose' : 'push',
        resultMessage: [...resultMessages, overallMessage].join('\n'),
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
        playerHands: [],
        dealerHand: [],
        activeHandIndex: 0,
        insurance: 0,
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
    case 'surrender':
      return `Surrendered - recovered $${bet / 2}`;
    default:
      return '';
  }
}
