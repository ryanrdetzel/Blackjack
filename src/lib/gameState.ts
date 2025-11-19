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
import {
  StatisticsState,
  createInitialStatistics,
  recordHand,
  recordSplit,
  recordDouble,
  recordSurrender,
  resetSession,
  clearAllStatistics,
} from './statistics';
import { CardCountingState, createInitialCardCountingState, CountingSystem } from './cardCounting';
import { Achievement, initializeAchievements, AchievementProgress } from './achievements';
import { Theme, getInitialTheme } from './theme';

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
  soundEnabled?: boolean;
  animationsEnabled?: boolean;
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

// Speed training types
export interface DecisionRecord {
  handDescription: string;
  dealerUpCard: string;
  action: string;
  wasCorrect: boolean;
  timeMs: number;
  timestamp: number;
}

export interface SpeedTrainingSession {
  startTime: number;
  endTime: number | null;
  handsPlayed: number;
  correctDecisions: number;
  totalDecisions: number;
  averageDecisionTime: number;
  fastestDecision: number;
  slowestDecision: number;
  decisions: DecisionRecord[];
}

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface SpeedTrainingState {
  isActive: boolean;
  difficulty: DifficultyLevel;
  timeLimit: number; // milliseconds
  currentDecisionStartTime: number | null;
  currentSession: SpeedTrainingSession | null;
  sessionHistory: SpeedTrainingSession[];
  // Progressive difficulty
  consecutiveCorrectFast: number; // Track streak for difficulty increase
  // Goals
  sessionGoal: {
    handsTarget: number;
    accuracyTarget: number; // percentage
    speedTarget: number; // average ms per decision
  };
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
  speedTraining: SpeedTrainingState;
  statistics: StatisticsState;
  // Milestone 7 & 8 features
  sideBets?: {
    perfectPairs: number;
    twentyOnePlus3: number;
  };
  cardCounting?: CardCountingState;
  achievements?: Record<string, Achievement>;
  achievementProgress?: AchievementProgress;
  theme?: Theme;
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
  | { type: 'CLEAR_MISTAKES' }
  | { type: 'START_SPEED_TRAINING'; difficulty: DifficultyLevel; handsTarget: number; accuracyTarget: number; speedTarget: number }
  | { type: 'STOP_SPEED_TRAINING' }
  | { type: 'START_DECISION_TIMER' }
  | { type: 'RECORD_SPEED_DECISION'; action: string; timeMs: number }
  | { type: 'TIMEOUT_DECISION' }
  | { type: 'UPDATE_DIFFICULTY'; difficulty: DifficultyLevel }
  | { type: 'RESET_SESSION_STATS' }
  | { type: 'CLEAR_ALL_STATS' }
  | { type: 'PLACE_SIDE_BET'; perfectPairs: number; twentyOnePlus3: number }
  | { type: 'TOGGLE_CARD_COUNTING' }
  | { type: 'UPDATE_COUNTING_SYSTEM'; system: CountingSystem }
  | { type: 'TOGGLE_THEME' }
  | { type: 'IMPORT_GAME_STATE'; state: any };

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
    soundEnabled: true,
    animationsEnabled: true,
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
    speedTraining: {
      isActive: false,
      difficulty: 'beginner',
      timeLimit: 10000, // 10 seconds for beginner
      currentDecisionStartTime: null,
      currentSession: null,
      sessionHistory: [],
      consecutiveCorrectFast: 0,
      sessionGoal: {
        handsTarget: 20,
        accuracyTarget: 90,
        speedTarget: 5000,
      },
    },
    statistics: createInitialStatistics(),
    // Milestone 7 & 8 features
    sideBets: {
      perfectPairs: 0,
      twentyOnePlus3: 0,
    },
    cardCounting: createInitialCardCountingState(finalConfig.deckCount),
    achievements: initializeAchievements(),
    achievementProgress: {
      totalWins: 0,
      totalHandsPlayed: 0,
    },
    theme: getInitialTheme(),
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
          statistics: recordDouble(state.statistics),
        };
      }

      // Move to next hand
      return {
        ...state,
        shoe: draw.remainingShoe,
        playerHands: newHands,
        activeHandIndex: nextHandIndex,
        statistics: recordDouble(state.statistics),
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
        statistics: recordSplit(state.statistics),
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
          statistics: recordSurrender(state.statistics),
        };
      }

      // Move to next hand
      return {
        ...state,
        playerHands: newHands,
        activeHandIndex: nextHandIndex,
        statistics: recordSurrender(state.statistics),
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

      // Process each hand and collect results for statistics
      const handResults: { cards: Card[]; bet: number; result: GameResult; payout: number }[] = [];

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

        // Collect result for statistics
        handResults.push({
          cards: hand.cards,
          bet: hand.bet,
          result: result as GameResult,
          payout: handPayout,
        });
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

      // Record hand in statistics
      const newStatistics = recordHand(
        state.statistics,
        handResults,
        dealerHand,
        state.insurance,
        dealerBlackjack && state.insurance > 0,
        state.config.name,
        newBalance
      );

      return {
        ...state,
        shoe,
        dealerHand,
        phase: GAME_PHASES.GAME_OVER,
        result: netProfit > ZERO ? 'win' : netProfit < ZERO ? 'lose' : 'push',
        resultMessage: [...resultMessages, overallMessage].join('\n'),
        balance: newBalance,
        statistics: newStatistics,
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

    case 'START_SPEED_TRAINING': {
      const { difficulty, handsTarget, accuracyTarget, speedTarget } = action;

      // Determine time limit based on difficulty
      const timeLimits: Record<DifficultyLevel, number> = {
        beginner: 10000,    // 10 seconds
        intermediate: 7000, // 7 seconds
        advanced: 5000,     // 5 seconds
        expert: 3000,       // 3 seconds
      };

      const newSession: SpeedTrainingSession = {
        startTime: Date.now(),
        endTime: null,
        handsPlayed: 0,
        correctDecisions: 0,
        totalDecisions: 0,
        averageDecisionTime: 0,
        fastestDecision: Infinity,
        slowestDecision: 0,
        decisions: [],
      };

      return {
        ...state,
        speedTraining: {
          ...state.speedTraining,
          isActive: true,
          difficulty,
          timeLimit: timeLimits[difficulty],
          currentSession: newSession,
          sessionGoal: {
            handsTarget,
            accuracyTarget,
            speedTarget,
          },
        },
        settings: {
          ...state.settings,
          learningModeEnabled: true, // Auto-enable learning mode
        },
      };
    }

    case 'STOP_SPEED_TRAINING': {
      if (!state.speedTraining.currentSession) {
        return state;
      }

      const completedSession: SpeedTrainingSession = {
        ...state.speedTraining.currentSession,
        endTime: Date.now(),
      };

      return {
        ...state,
        speedTraining: {
          ...state.speedTraining,
          isActive: false,
          currentSession: null,
          currentDecisionStartTime: null,
          sessionHistory: [...state.speedTraining.sessionHistory, completedSession],
        },
      };
    }

    case 'START_DECISION_TIMER': {
      return {
        ...state,
        speedTraining: {
          ...state.speedTraining,
          currentDecisionStartTime: Date.now(),
        },
      };
    }

    case 'RECORD_SPEED_DECISION': {
      if (!state.speedTraining.isActive || !state.speedTraining.currentSession || !state.learningMode.currentStrategy) {
        return state;
      }

      const { action: playerAction, timeMs } = action;
      const optimalAction = state.learningMode.currentStrategy.primaryAction;
      const wasCorrect = playerAction === optimalAction;
      const currentHand = state.playerHands[state.activeHandIndex];
      const dealerCard = state.dealerHand[0];

      const decisionRecord: DecisionRecord = {
        handDescription: `${currentHand.cards.map(c => c.rank + c.suit).join(', ')}`,
        dealerUpCard: `${dealerCard.rank}${dealerCard.suit}`,
        action: playerAction,
        wasCorrect,
        timeMs,
        timestamp: Date.now(),
      };

      const currentSession = state.speedTraining.currentSession;
      const newDecisions = [...currentSession.decisions, decisionRecord];
      const newCorrectDecisions = currentSession.correctDecisions + (wasCorrect ? 1 : 0);
      const newTotalDecisions = currentSession.totalDecisions + 1;

      // Calculate new average decision time
      const totalTime = newDecisions.reduce((sum, d) => sum + d.timeMs, 0);
      const averageDecisionTime = totalTime / newDecisions.length;

      // Update fastest and slowest
      const fastestDecision = Math.min(currentSession.fastestDecision, timeMs);
      const slowestDecision = Math.max(currentSession.slowestDecision, timeMs);

      // Check for progressive difficulty increase
      let consecutiveCorrectFast = state.speedTraining.consecutiveCorrectFast;
      let newDifficulty = state.speedTraining.difficulty;
      let newTimeLimit = state.speedTraining.timeLimit;

      if (wasCorrect && timeMs < state.speedTraining.timeLimit * 0.7) {
        // Decision was correct and fast (< 70% of time limit)
        consecutiveCorrectFast += 1;

        // Increase difficulty after 5 consecutive fast correct decisions
        if (consecutiveCorrectFast >= 5) {
          const difficultyLevels: DifficultyLevel[] = ['beginner', 'intermediate', 'advanced', 'expert'];
          const currentIndex = difficultyLevels.indexOf(state.speedTraining.difficulty);
          if (currentIndex < difficultyLevels.length - 1) {
            newDifficulty = difficultyLevels[currentIndex + 1];
            const timeLimits: Record<DifficultyLevel, number> = {
              beginner: 10000,
              intermediate: 7000,
              advanced: 5000,
              expert: 3000,
            };
            newTimeLimit = timeLimits[newDifficulty];
            consecutiveCorrectFast = 0; // Reset streak
          }
        }
      } else {
        consecutiveCorrectFast = 0; // Reset streak on slow or incorrect decision
      }

      const updatedSession: SpeedTrainingSession = {
        ...currentSession,
        correctDecisions: newCorrectDecisions,
        totalDecisions: newTotalDecisions,
        averageDecisionTime,
        fastestDecision,
        slowestDecision,
        decisions: newDecisions,
      };

      return {
        ...state,
        speedTraining: {
          ...state.speedTraining,
          currentSession: updatedSession,
          currentDecisionStartTime: null,
          consecutiveCorrectFast,
          difficulty: newDifficulty,
          timeLimit: newTimeLimit,
        },
      };
    }

    case 'TIMEOUT_DECISION': {
      if (!state.speedTraining.isActive || !state.speedTraining.currentSession || !state.learningMode.currentStrategy) {
        return state;
      }

      const optimalAction = state.learningMode.currentStrategy.primaryAction;
      const currentHand = state.playerHands[state.activeHandIndex];
      const dealerCard = state.dealerHand[0];
      const timeMs = state.speedTraining.timeLimit;

      const decisionRecord: DecisionRecord = {
        handDescription: `${currentHand.cards.map(c => c.rank + c.suit).join(', ')}`,
        dealerUpCard: `${dealerCard.rank}${dealerCard.suit}`,
        action: 'TIMEOUT',
        wasCorrect: false,
        timeMs,
        timestamp: Date.now(),
      };

      const currentSession = state.speedTraining.currentSession;
      const newDecisions = [...currentSession.decisions, decisionRecord];
      const newTotalDecisions = currentSession.totalDecisions + 1;

      const totalTime = newDecisions.reduce((sum, d) => sum + d.timeMs, 0);
      const averageDecisionTime = totalTime / newDecisions.length;

      const updatedSession: SpeedTrainingSession = {
        ...currentSession,
        totalDecisions: newTotalDecisions,
        averageDecisionTime,
        slowestDecision: Math.max(currentSession.slowestDecision, timeMs),
        decisions: newDecisions,
      };

      return {
        ...state,
        speedTraining: {
          ...state.speedTraining,
          currentSession: updatedSession,
          currentDecisionStartTime: null,
          consecutiveCorrectFast: 0, // Reset streak on timeout
        },
      };
    }

    case 'UPDATE_DIFFICULTY': {
      const { difficulty } = action;
      const timeLimits: Record<DifficultyLevel, number> = {
        beginner: 10000,
        intermediate: 7000,
        advanced: 5000,
        expert: 3000,
      };

      return {
        ...state,
        speedTraining: {
          ...state.speedTraining,
          difficulty,
          timeLimit: timeLimits[difficulty],
        },
      };
    }

    case 'RESET_SESSION_STATS': {
      return {
        ...state,
        statistics: resetSession(state.statistics),
      };
    }

    case 'CLEAR_ALL_STATS': {
      return {
        ...state,
        statistics: clearAllStatistics(),
      };
    }

    case 'PLACE_SIDE_BET': {
      const { perfectPairs, twentyOnePlus3 } = action;
      return {
        ...state,
        sideBets: {
          perfectPairs,
          twentyOnePlus3,
        },
      };
    }

    case 'TOGGLE_CARD_COUNTING': {
      const newCardCounting = {
        ...state.cardCounting!,
        isActive: !state.cardCounting!.isActive,
      };
      return {
        ...state,
        cardCounting: newCardCounting,
      };
    }

    case 'UPDATE_COUNTING_SYSTEM': {
      const { system } = action;
      const newCardCounting = {
        ...state.cardCounting!,
        system,
        // Reset counts when changing system
        runningCount: 0,
        trueCount: 0,
      };
      return {
        ...state,
        cardCounting: newCardCounting,
      };
    }

    case 'TOGGLE_THEME': {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      return {
        ...state,
        theme: newTheme,
      };
    }

    case 'IMPORT_GAME_STATE': {
      const imported = action.state;
      return {
        ...state,
        balance: imported.balance || state.balance,
        config: imported.config || state.config,
        settings: imported.settings ? { ...state.settings, ...imported.settings } : state.settings,
        statistics: imported.statistics || state.statistics,
        learningMode: imported.learningMode ? {
          ...state.learningMode,
          mistakes: imported.learningMode.mistakes || [],
          correctDecisions: imported.learningMode.correctDecisions || 0,
          totalDecisions: imported.learningMode.totalDecisions || 0,
        } : state.learningMode,
        speedTraining: imported.speedTraining ? {
          ...state.speedTraining,
          sessionHistory: imported.speedTraining.sessionHistory || [],
        } : state.speedTraining,
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
