import { createShoe, drawCard, isBlackjack, isBust, isPair } from './deck';
import { dealerShouldHit, determineOutcome, calculatePayout } from './rules';
import { GAME_PHASES, HAND_STATUS, DEFAULT_CONFIG, Card, GamePhase, HandStatus, GameResult, GameConfig } from './types';
import {
  STORAGE_KEY_TABLE_RULES,
  STORAGE_KEY_BALANCE,
  STORAGE_KEY_SETTINGS,
  MIN_CARDS_BEFORE_RESHUFFLE,
  INITIAL_HAND_SIZE,
  INSURANCE_TOTAL_RETURN_MULTIPLIER,
  INSURANCE_PAYOUT_MULTIPLIER,
  INSURANCE_BET_DIVISOR,
  SURRENDER_PAYOUT_DIVISOR,
  DOUBLE_BET_MULTIPLIER,
  NEXT_INDEX_OFFSET,
  ZERO,
} from './constants';
import { getBasicStrategy, StrategyDecision } from './strategy';

// Game state types
interface GameHand {
  cards: Card[];
  bet: number;
  status: HandStatus;
  doubled?: boolean;
  fromSplit?: boolean;
  result?: GameResult;
  payout?: number;
}

interface GameSettings {
  autoDeal: boolean;
  lastBetAmount: number;
  learningModeEnabled: boolean;
  showHints: boolean;
  showExpectedValue: boolean;
}

// Learning mode mistake tracking
export interface MistakeRecord {
  handDescription: string;
  dealerUpCard: string;
  optimalAction: string;
  playerAction: string;
  timestamp: number;
}

export interface LearningModeState {
  currentStrategy: StrategyDecision | null;
  mistakes: MistakeRecord[];
  correctDecisions: number;
  totalDecisions: number;
  lastDecision: {
    action: string;
    wasCorrect: boolean;
    optimalAction: string;
  } | null;
}

export interface GameState {
  phase: GamePhase;
  balance: number;
  currentBet: number;
  shoe: Card[];
  discardPile: Card[];
  playerHands: GameHand[];
  dealerHand: Card[];
  activeHandIndex: number;
  insurance: number;
  result: string | null;
  resultMessage: string;
  config: GameConfig;
  settings: GameSettings;
  learningMode: LearningModeState;
}

// Action types
type GameAction =
  | { type: 'PLACE_BET'; amount: number }
  | { type: 'DEAL_INITIAL' }
  | { type: 'HIT' }
  | { type: 'STAND' }
  | { type: 'DOUBLE' }
  | { type: 'SPLIT' }
  | { type: 'SURRENDER' }
  | { type: 'INSURANCE' }
  | { type: 'DEALER_PLAY' }
  | { type: 'NEW_GAME' }
  | { type: 'RESET_BALANCE' }
  | { type: 'UPDATE_SETTINGS'; settings: Partial<GameSettings> }
  | { type: 'UPDATE_CONFIG'; config: Partial<GameConfig> }
  | { type: 'LOAD_CONFIG'; config: GameConfig }
  | { type: 'TOGGLE_LEARNING_MODE' }
  | { type: 'UPDATE_STRATEGY_HINT' }
  | { type: 'RECORD_DECISION'; action: string }
  | { type: 'CLEAR_MISTAKES' };

/**
 * Create initial game state
 */
export function createInitialState(config: GameConfig = DEFAULT_CONFIG): GameState {
  // Handle null config (e.g., when used as lazy initializer in useReducer)
  const baseConfig = config || DEFAULT_CONFIG;

  // Load table rules from localStorage or use default config
  const savedTableRules = localStorage.getItem(STORAGE_KEY_TABLE_RULES);
  const finalConfig: GameConfig = savedTableRules
    ? { ...baseConfig, ...JSON.parse(savedTableRules) }
    : baseConfig;

  // Load balance from localStorage or use default
  const savedBalance = localStorage.getItem(STORAGE_KEY_BALANCE);
  const balance = savedBalance ? parseFloat(savedBalance) : finalConfig.startingBalance;

  // Load settings from localStorage or use defaults
  const savedSettings = localStorage.getItem(STORAGE_KEY_SETTINGS);
  const defaultSettings: GameSettings = {
    autoDeal: false,
    lastBetAmount: finalConfig.minBet,
    learningModeEnabled: false,
    showHints: true,
    showExpectedValue: false,
  };
  const settings: GameSettings = savedSettings ? { ...defaultSettings, ...JSON.parse(savedSettings) } : defaultSettings;

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
    settings, // Game settings (auto-deal, last bet, etc.)
    learningMode: {
      currentStrategy: null,
      mistakes: [],
      correctDecisions: 0,
      totalDecisions: 0,
      lastDecision: null,
    },
  };
}

/**
 * Create a new hand object
 */
function createHand(cards: Card[], bet: number, fromSplit: boolean = false): GameHand {
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
export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'PLACE_BET': {
      const { amount } = action;
      if (amount < state.config.minBet || amount > state.config.maxBet) {
        return state;
      }
      if (amount > state.balance) {
        return state;
      }
      // Save last bet amount to settings
      const newSettings: GameSettings = {
        ...state.settings,
        lastBetAmount: amount,
      };
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(newSettings));

      return {
        ...state,
        currentBet: amount,
        phase: GAME_PHASES.DEALING,
        settings: newSettings,
      };
    }

    case 'DEAL_INITIAL': {
      let { shoe } = state;
      const playerCards: Card[] = [];
      const dealerCards: Card[] = [];

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
      const playerHands: GameHand[] = [createHand(playerCards, state.currentBet, false)];

      // Check for immediate blackjack
      const playerBJ = isBlackjack(playerCards);
      const dealerBJ = isBlackjack(dealerCards);

      if (playerBJ || dealerBJ) {
        // Go straight to game over
        const result = determineOutcome(playerCards, dealerCards);
        const payout = calculatePayout(state.currentBet, result, state.config.blackjackPayout);
        const newBalance = state.balance - state.currentBet + payout;

        // Save balance to localStorage
        localStorage.setItem(STORAGE_KEY_BALANCE, newBalance.toString());

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
      if (currentHand.cards.length !== INITIAL_HAND_SIZE) {
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
        bet: currentHand.bet * DOUBLE_BET_MULTIPLIER,
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
      if (currentHand.cards.length !== INITIAL_HAND_SIZE) {
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
      const insuranceAmount = state.currentBet / INSURANCE_BET_DIVISOR;

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
      let resultMessages: string[] = [];
      const dealerBlackjack = isBlackjack(dealerHand);

      // Process insurance bet
      if (state.insurance > ZERO) {
        if (dealerBlackjack) {
          // Insurance pays 2:1
          totalPayout += state.insurance * INSURANCE_TOTAL_RETURN_MULTIPLIER; // Original bet + 2x payout
          resultMessages.push(`Insurance wins +$${state.insurance * INSURANCE_PAYOUT_MULTIPLIER}`);
        } else {
          resultMessages.push(`Insurance loses -$${state.insurance}`);
        }
      }

      // Process each hand
      state.playerHands.forEach((hand, index) => {
        let result: string;
        let handPayout = 0;

        if (hand.status === HAND_STATUS.SURRENDER) {
          // Surrender returns half the bet
          handPayout = hand.bet / SURRENDER_PAYOUT_DIVISOR;
          result = 'surrender';
          resultMessages.push(`Hand ${index + NEXT_INDEX_OFFSET}: Surrendered (recovered $${handPayout})`);
        } else if (hand.status === HAND_STATUS.BUST) {
          // Bust loses the bet
          result = 'lose';
          resultMessages.push(`Hand ${index + NEXT_INDEX_OFFSET}: Bust (lost $${hand.bet})`);
        } else {
          // Compare with dealer
          result = determineOutcome(hand.cards, dealerHand);
          handPayout = calculatePayout(hand.bet, result, state.config.blackjackPayout);

          const profit = handPayout - hand.bet;
          if (result === 'blackjack') {
            resultMessages.push(`Hand ${index + NEXT_INDEX_OFFSET}: Blackjack! (+$${profit})`);
          } else if (result === 'win') {
            resultMessages.push(`Hand ${index + NEXT_INDEX_OFFSET}: Win (+$${profit})`);
          } else if (result === 'push') {
            resultMessages.push(`Hand ${index + NEXT_INDEX_OFFSET}: Push (bet returned)`);
          } else if (result === 'lose') {
            resultMessages.push(`Hand ${index + NEXT_INDEX_OFFSET}: Lose (-$${hand.bet})`);
          }
        }

        totalPayout += handPayout;
      });

      // Calculate total bet (all hands + insurance)
      const totalBet = state.playerHands.reduce((sum, hand) => sum + hand.bet, 0) + state.insurance;
      const newBalance = state.balance - totalBet + totalPayout;

      // Save balance to localStorage
      localStorage.setItem(STORAGE_KEY_BALANCE, newBalance.toString());

      // Create overall result message
      const netProfit = totalPayout - totalBet;
      const overallMessage = netProfit > ZERO
        ? `Total: +$${netProfit.toFixed(2)}`
        : netProfit < ZERO
        ? `Total: -$${Math.abs(netProfit).toFixed(2)}`
        : 'Total: Break even';

      return {
        ...state,
        shoe,
        dealerHand,
        phase: GAME_PHASES.GAME_OVER,
        result: netProfit > ZERO ? 'win' : netProfit < ZERO ? 'lose' : 'push',
        resultMessage: [...resultMessages, overallMessage].join('\n'),
        balance: newBalance,
      };
    }

    case 'NEW_GAME': {
      // Check if we need to reshuffle (less than 52 cards left)
      const shoe = state.shoe.length < MIN_CARDS_BEFORE_RESHUFFLE ? createShoe(state.config.deckCount) : state.shoe;

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
      localStorage.setItem(STORAGE_KEY_BALANCE, newBalance.toString());
      return {
        ...createInitialState(state.config),
        balance: newBalance,
      };
    }

    case 'UPDATE_SETTINGS': {
      const newSettings: GameSettings = {
        ...state.settings,
        ...action.settings,
      };
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(newSettings));
      return {
        ...state,
        settings: newSettings,
      };
    }

    case 'UPDATE_CONFIG': {
      const newConfig: GameConfig = {
        ...state.config,
        ...action.config,
      };
      // Save only the customizable rules to localStorage
      const tableRules = {
        deckCount: newConfig.deckCount,
        dealerHitsSoft17: newConfig.dealerHitsSoft17,
        blackjackPayout: newConfig.blackjackPayout,
        minBet: newConfig.minBet,
        maxBet: newConfig.maxBet,
        startingBalance: newConfig.startingBalance,
        doubleAfterSplit: newConfig.doubleAfterSplit,
        resplitAcesAllowed: newConfig.resplitAcesAllowed,
        maxSplits: newConfig.maxSplits,
        surrenderAllowed: newConfig.surrenderAllowed,
        insuranceAllowed: newConfig.insuranceAllowed,
      };
      localStorage.setItem(STORAGE_KEY_TABLE_RULES, JSON.stringify(tableRules));
      return {
        ...state,
        config: newConfig,
      };
    }

    case 'LOAD_CONFIG': {
      // Load a complete configuration (from presets or saved configs)
      const newConfig = action.config;

      // Save configuration to localStorage
      const tableRules = {
        deckCount: newConfig.deckCount,
        dealerHitsSoft17: newConfig.dealerHitsSoft17,
        blackjackPayout: newConfig.blackjackPayout,
        minBet: newConfig.minBet,
        maxBet: newConfig.maxBet,
        startingBalance: newConfig.startingBalance,
        doubleAfterSplit: newConfig.doubleAfterSplit,
        resplitAcesAllowed: newConfig.resplitAcesAllowed,
        maxSplits: newConfig.maxSplits,
        surrenderAllowed: newConfig.surrenderAllowed,
        insuranceAllowed: newConfig.insuranceAllowed,
      };
      localStorage.setItem(STORAGE_KEY_TABLE_RULES, JSON.stringify(tableRules));

      // Create new shoe if deck count changed
      const newShoe = state.config.deckCount !== newConfig.deckCount
        ? createShoe(newConfig.deckCount)
        : state.shoe;

      // Adjust lastBetAmount if it's outside the new min/max range
      const adjustedLastBet = Math.max(
        newConfig.minBet,
        Math.min(newConfig.maxBet, state.settings.lastBetAmount)
      );

      const newSettings = {
        ...state.settings,
        lastBetAmount: adjustedLastBet,
      };
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(newSettings));

      // Reset to betting phase with new config
      return {
        ...state,
        phase: GAME_PHASES.BETTING,
        config: newConfig,
        shoe: newShoe,
        discardPile: [],
        playerHands: [],
        dealerHand: [],
        activeHandIndex: ZERO,
        currentBet: ZERO,
        insurance: ZERO,
        result: null,
        resultMessage: '',
        settings: newSettings,
      };
    }

    case 'TOGGLE_LEARNING_MODE': {
      const newSettings = {
        ...state.settings,
        learningModeEnabled: !state.settings.learningModeEnabled,
      };
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(newSettings));
      return {
        ...state,
        settings: newSettings,
      };
    }

    case 'UPDATE_STRATEGY_HINT': {
      // Only update strategy hint if learning mode is enabled and we're in player turn
      if (!state.settings.learningModeEnabled || state.phase !== GAME_PHASES.PLAYER_TURN) {
        return state;
      }

      const currentHand = state.playerHands[state.activeHandIndex];
      if (!currentHand) {
        return state;
      }

      // Determine available actions
      const canDouble = currentHand.cards.length === INITIAL_HAND_SIZE &&
        currentHand.bet <= state.balance &&
        (!currentHand.fromSplit || state.config.doubleAfterSplit);

      const canSplit = isPair(currentHand.cards) &&
        currentHand.bet <= state.balance &&
        state.playerHands.filter(h => h.fromSplit).length < state.config.maxSplits &&
        currentHand.cards.length === INITIAL_HAND_SIZE;

      const canSurrender = state.config.surrenderAllowed &&
        currentHand.cards.length === INITIAL_HAND_SIZE &&
        state.playerHands.length === 1;

      // Get strategy recommendation
      const strategy = getBasicStrategy(
        currentHand.cards,
        state.dealerHand,
        state.config,
        canDouble,
        canSplit,
        canSurrender,
        currentHand.fromSplit || false
      );

      return {
        ...state,
        learningMode: {
          ...state.learningMode,
          currentStrategy: strategy,
        },
      };
    }

    case 'RECORD_DECISION': {
      // Only record if learning mode is enabled
      if (!state.settings.learningModeEnabled || !state.learningMode.currentStrategy) {
        return state;
      }

      const currentHand = state.playerHands[state.activeHandIndex];
      const optimalAction = state.learningMode.currentStrategy.primaryAction;
      const playerAction = action.action;
      const wasCorrect = playerAction === optimalAction;

      const newLearningMode: LearningModeState = {
        ...state.learningMode,
        totalDecisions: state.learningMode.totalDecisions + 1,
        correctDecisions: wasCorrect ? state.learningMode.correctDecisions + 1 : state.learningMode.correctDecisions,
        lastDecision: {
          action: playerAction,
          wasCorrect,
          optimalAction,
        },
      };

      // Add to mistakes if incorrect
      if (!wasCorrect) {
        const dealerCard = state.dealerHand[0];
        const mistake: MistakeRecord = {
          handDescription: `${currentHand.cards.map(c => c.rank + c.suit).join(', ')}`,
          dealerUpCard: `${dealerCard.rank}${dealerCard.suit}`,
          optimalAction,
          playerAction,
          timestamp: Date.now(),
        };
        newLearningMode.mistakes = [...state.learningMode.mistakes, mistake];
      }

      return {
        ...state,
        learningMode: newLearningMode,
      };
    }

    case 'CLEAR_MISTAKES': {
      return {
        ...state,
        learningMode: {
          ...state.learningMode,
          mistakes: [],
          correctDecisions: 0,
          totalDecisions: 0,
          lastDecision: null,
        },
      };
    }

    default:
      return state;
  }
}

function getResultMessage(result: GameResult, payout: number, bet: number): string {
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
      return `Surrendered - recovered $${bet / SURRENDER_PAYOUT_DIVISOR}`;
    default:
      return '';
  }
}
