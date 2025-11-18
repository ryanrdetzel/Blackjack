/**
 * Constants file containing all magic numbers and strings used throughout the application
 */

// ============================================================================
// CARD GAME CONSTANTS
// ============================================================================

/**
 * The value that constitutes blackjack or bust
 */
export const BLACKJACK_VALUE = 21;

/**
 * The threshold at which dealer must stand
 */
export const DEALER_STAND_THRESHOLD = 17;

/**
 * Default value for an Ace (can be 1 or 11)
 */
export const ACE_HIGH_VALUE = 11;

/**
 * Value for face cards (J, Q, K)
 */
export const FACE_CARD_VALUE = 10;

/**
 * Adjustment value when converting Ace from 11 to 1
 */
export const ACE_VALUE_ADJUSTMENT = 10;

/**
 * Number of cards required for initial hand (for double/surrender checks)
 */
export const INITIAL_HAND_SIZE = 2;

/**
 * Minimum number of cards in shoe before reshuffling
 */
export const MIN_CARDS_BEFORE_RESHUFFLE = 52;

// ============================================================================
// PAYOUT CONSTANTS
// ============================================================================

/**
 * Multiplier for regular win (1:1 payout)
 */
export const REGULAR_WIN_MULTIPLIER = 2;

/**
 * Insurance payout multiplier (2:1, so bet * 2 for winnings)
 */
export const INSURANCE_PAYOUT_MULTIPLIER = 2;

/**
 * Total return multiplier for insurance (original bet + 2x payout = 3x)
 */
export const INSURANCE_TOTAL_RETURN_MULTIPLIER = 3;

/**
 * Divisor for insurance bet (half of original bet)
 */
export const INSURANCE_BET_DIVISOR = 2;

/**
 * Divisor for surrender payout (returns half the bet)
 */
export const SURRENDER_PAYOUT_DIVISOR = 2;

/**
 * Multiplier for doubled bet
 */
export const DOUBLE_BET_MULTIPLIER = 2;

// ============================================================================
// TIMING CONSTANTS (in milliseconds)
// ============================================================================

/**
 * Delay before dealing initial cards after bet is placed
 */
export const DEAL_DELAY_MS = 100;

/**
 * Delay before dealer plays their turn
 */
export const DEALER_TURN_DELAY_MS = 1000;

/**
 * Auto-deal countdown duration (in seconds)
 */
export const AUTO_DEAL_COUNTDOWN_SECONDS = 3;

/**
 * Interval for countdown timer (in milliseconds)
 */
export const COUNTDOWN_INTERVAL_MS = 1000;

// ============================================================================
// UI CONSTANTS
// ============================================================================

/**
 * Quick bet amounts shown in betting controls
 */
export const QUICK_BET_AMOUNTS = [5, 10, 25, 50, 100] as const;

/**
 * Card back symbol
 */
export const CARD_BACK_SYMBOL = '🂠';

/**
 * Red suits for card styling
 */
export const RED_SUITS = ['♥', '♦'] as const;

// ============================================================================
// STORAGE KEYS
// ============================================================================

/**
 * LocalStorage key for table rules configuration
 */
export const STORAGE_KEY_TABLE_RULES = 'blackjack_table_rules';

/**
 * LocalStorage key for player balance
 */
export const STORAGE_KEY_BALANCE = 'blackjack_balance';

/**
 * LocalStorage key for game settings
 */
export const STORAGE_KEY_SETTINGS = 'blackjack_settings';

/**
 * LocalStorage key for saved custom configurations (Milestone 3)
 */
export const STORAGE_KEY_SAVED_CONFIGS = 'blackjack_saved_configs';

/**
 * LocalStorage key for active configuration name (Milestone 3)
 */
export const STORAGE_KEY_ACTIVE_CONFIG = 'blackjack_active_config';

// ============================================================================
// UI MESSAGES
// ============================================================================

/**
 * Confirmation message for resetting balance
 */
export const CONFIRM_RESET_BALANCE = 'Reset balance to $1000?';

// ============================================================================
// ARRAY INDICES
// ============================================================================

/**
 * First index in an array
 */
export const FIRST_INDEX = 0;

/**
 * Second index in an array
 */
export const SECOND_INDEX = 1;

/**
 * Index offset for next item
 */
export const NEXT_INDEX_OFFSET = 1;

// ============================================================================
// NUMERIC CONSTANTS
// ============================================================================

/**
 * Zero value for comparisons and resets
 */
export const ZERO = 0;

/**
 * One value for comparisons
 */
export const ONE = 1;

// ============================================================================
// DEFAULT TABLE CONFIGURATION VALUES
// ============================================================================

/**
 * Default number of decks in shoe
 */
export const DEFAULT_DECK_COUNT = 6;

/**
 * Default blackjack payout ratio
 */
export const DEFAULT_BLACKJACK_PAYOUT: [number, number] = [3, 2];

/**
 * Default minimum bet
 */
export const DEFAULT_MIN_BET = 5;

/**
 * Default maximum bet
 */
export const DEFAULT_MAX_BET = 500;

/**
 * Default starting balance
 */
export const DEFAULT_STARTING_BALANCE = 1000;

/**
 * Default maximum number of splits allowed
 */
export const DEFAULT_MAX_SPLITS = 3;

/**
 * Alternative blackjack payout (6:5)
 */
export const BLACKJACK_PAYOUT_6_5: [number, number] = [6, 5];

/**
 * Alternative blackjack payout (2:1)
 */
export const BLACKJACK_PAYOUT_2_1: [number, number] = [2, 1];

// ============================================================================
// INPUT CONSTRAINTS
// ============================================================================

/**
 * Minimum number of decks allowed
 */
export const MIN_DECK_COUNT = 1;

/**
 * Maximum number of decks allowed
 */
export const MAX_DECK_COUNT = 8;

/**
 * Minimum splits allowed
 */
export const MIN_SPLITS = 1;

/**
 * Maximum splits allowed
 */
export const MAX_SPLITS = 4;

/**
 * Minimum bet value
 */
export const MIN_BET_VALUE = 1;
