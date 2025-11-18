import { Card, GameConfig } from './types';
import { calculateHandValue, isPair } from './deck';

// Strategy actions
export const STRATEGY_ACTIONS = {
  HIT: 'HIT',
  STAND: 'STAND',
  DOUBLE: 'DOUBLE',
  DOUBLE_OR_HIT: 'DOUBLE_OR_HIT', // Double if allowed, otherwise hit
  DOUBLE_OR_STAND: 'DOUBLE_OR_STAND', // Double if allowed, otherwise stand
  SPLIT: 'SPLIT',
  SPLIT_IF_DAS: 'SPLIT_IF_DAS', // Split if double after split allowed
  SURRENDER: 'SURRENDER',
  SURRENDER_OR_HIT: 'SURRENDER_OR_HIT', // Surrender if allowed, otherwise hit
  SURRENDER_OR_STAND: 'SURRENDER_OR_STAND', // Surrender if allowed, otherwise stand
  SURRENDER_OR_SPLIT: 'SURRENDER_OR_SPLIT', // Surrender if allowed, otherwise split
} as const;

export type StrategyAction = typeof STRATEGY_ACTIONS[keyof typeof STRATEGY_ACTIONS];

// Action recommendation with quality rating
export interface ActionRecommendation {
  action: 'HIT' | 'STAND' | 'DOUBLE' | 'SPLIT' | 'SURRENDER';
  quality: 'optimal' | 'acceptable' | 'poor';
  isOptimal: boolean;
}

// Strategy decision result
export interface StrategyDecision {
  primaryAction: StrategyAction;
  recommendations: ActionRecommendation[];
  explanation: string;
}

/**
 * Get dealer's up card value
 */
function getDealerUpCardValue(dealerHand: Card[]): number {
  if (dealerHand.length === 0) return 0;
  const upCard = dealerHand[0];
  if (upCard.rank === 'A') return 11;
  if (['J', 'Q', 'K'].includes(upCard.rank)) return 10;
  return parseInt(upCard.rank);
}

/**
 * Hard totals strategy table (no usable ace)
 * Returns optimal action based on player total and dealer up card
 */
const hardTotalsStrategy: Record<number, Record<number, StrategyAction>> = {
  // Player total: { Dealer up card: Action }
  5: { 2: 'HIT', 3: 'HIT', 4: 'HIT', 5: 'HIT', 6: 'HIT', 7: 'HIT', 8: 'HIT', 9: 'HIT', 10: 'HIT', 11: 'HIT' },
  6: { 2: 'HIT', 3: 'HIT', 4: 'HIT', 5: 'HIT', 6: 'HIT', 7: 'HIT', 8: 'HIT', 9: 'HIT', 10: 'HIT', 11: 'HIT' },
  7: { 2: 'HIT', 3: 'HIT', 4: 'HIT', 5: 'HIT', 6: 'HIT', 7: 'HIT', 8: 'HIT', 9: 'HIT', 10: 'HIT', 11: 'HIT' },
  8: { 2: 'HIT', 3: 'HIT', 4: 'HIT', 5: 'HIT', 6: 'HIT', 7: 'HIT', 8: 'HIT', 9: 'HIT', 10: 'HIT', 11: 'HIT' },
  9: { 2: 'HIT', 3: 'DOUBLE_OR_HIT', 4: 'DOUBLE_OR_HIT', 5: 'DOUBLE_OR_HIT', 6: 'DOUBLE_OR_HIT', 7: 'HIT', 8: 'HIT', 9: 'HIT', 10: 'HIT', 11: 'HIT' },
  10: { 2: 'DOUBLE_OR_HIT', 3: 'DOUBLE_OR_HIT', 4: 'DOUBLE_OR_HIT', 5: 'DOUBLE_OR_HIT', 6: 'DOUBLE_OR_HIT', 7: 'DOUBLE_OR_HIT', 8: 'DOUBLE_OR_HIT', 9: 'DOUBLE_OR_HIT', 10: 'HIT', 11: 'HIT' },
  11: { 2: 'DOUBLE_OR_HIT', 3: 'DOUBLE_OR_HIT', 4: 'DOUBLE_OR_HIT', 5: 'DOUBLE_OR_HIT', 6: 'DOUBLE_OR_HIT', 7: 'DOUBLE_OR_HIT', 8: 'DOUBLE_OR_HIT', 9: 'DOUBLE_OR_HIT', 10: 'DOUBLE_OR_HIT', 11: 'DOUBLE_OR_HIT' },
  12: { 2: 'HIT', 3: 'HIT', 4: 'STAND', 5: 'STAND', 6: 'STAND', 7: 'HIT', 8: 'HIT', 9: 'HIT', 10: 'HIT', 11: 'HIT' },
  13: { 2: 'STAND', 3: 'STAND', 4: 'STAND', 5: 'STAND', 6: 'STAND', 7: 'HIT', 8: 'HIT', 9: 'HIT', 10: 'HIT', 11: 'HIT' },
  14: { 2: 'STAND', 3: 'STAND', 4: 'STAND', 5: 'STAND', 6: 'STAND', 7: 'HIT', 8: 'HIT', 9: 'HIT', 10: 'HIT', 11: 'HIT' },
  15: { 2: 'STAND', 3: 'STAND', 4: 'STAND', 5: 'STAND', 6: 'STAND', 7: 'HIT', 8: 'HIT', 9: 'HIT', 10: 'SURRENDER_OR_HIT', 11: 'SURRENDER_OR_HIT' },
  16: { 2: 'STAND', 3: 'STAND', 4: 'STAND', 5: 'STAND', 6: 'STAND', 7: 'HIT', 8: 'HIT', 9: 'SURRENDER_OR_HIT', 10: 'SURRENDER_OR_HIT', 11: 'SURRENDER_OR_HIT' },
  17: { 2: 'STAND', 3: 'STAND', 4: 'STAND', 5: 'STAND', 6: 'STAND', 7: 'STAND', 8: 'STAND', 9: 'STAND', 10: 'STAND', 11: 'STAND' },
  18: { 2: 'STAND', 3: 'STAND', 4: 'STAND', 5: 'STAND', 6: 'STAND', 7: 'STAND', 8: 'STAND', 9: 'STAND', 10: 'STAND', 11: 'STAND' },
  19: { 2: 'STAND', 3: 'STAND', 4: 'STAND', 5: 'STAND', 6: 'STAND', 7: 'STAND', 8: 'STAND', 9: 'STAND', 10: 'STAND', 11: 'STAND' },
  20: { 2: 'STAND', 3: 'STAND', 4: 'STAND', 5: 'STAND', 6: 'STAND', 7: 'STAND', 8: 'STAND', 9: 'STAND', 10: 'STAND', 11: 'STAND' },
  21: { 2: 'STAND', 3: 'STAND', 4: 'STAND', 5: 'STAND', 6: 'STAND', 7: 'STAND', 8: 'STAND', 9: 'STAND', 10: 'STAND', 11: 'STAND' },
};

/**
 * Soft totals strategy table (ace counting as 11)
 */
const softTotalsStrategy: Record<number, Record<number, StrategyAction>> = {
  // Player total: { Dealer up card: Action }
  13: { 2: 'HIT', 3: 'HIT', 4: 'HIT', 5: 'DOUBLE_OR_HIT', 6: 'DOUBLE_OR_HIT', 7: 'HIT', 8: 'HIT', 9: 'HIT', 10: 'HIT', 11: 'HIT' },
  14: { 2: 'HIT', 3: 'HIT', 4: 'HIT', 5: 'DOUBLE_OR_HIT', 6: 'DOUBLE_OR_HIT', 7: 'HIT', 8: 'HIT', 9: 'HIT', 10: 'HIT', 11: 'HIT' },
  15: { 2: 'HIT', 3: 'HIT', 4: 'DOUBLE_OR_HIT', 5: 'DOUBLE_OR_HIT', 6: 'DOUBLE_OR_HIT', 7: 'HIT', 8: 'HIT', 9: 'HIT', 10: 'HIT', 11: 'HIT' },
  16: { 2: 'HIT', 3: 'HIT', 4: 'DOUBLE_OR_HIT', 5: 'DOUBLE_OR_HIT', 6: 'DOUBLE_OR_HIT', 7: 'HIT', 8: 'HIT', 9: 'HIT', 10: 'HIT', 11: 'HIT' },
  17: { 2: 'HIT', 3: 'DOUBLE_OR_HIT', 4: 'DOUBLE_OR_HIT', 5: 'DOUBLE_OR_HIT', 6: 'DOUBLE_OR_HIT', 7: 'HIT', 8: 'HIT', 9: 'HIT', 10: 'HIT', 11: 'HIT' },
  18: { 2: 'DOUBLE_OR_STAND', 3: 'DOUBLE_OR_STAND', 4: 'DOUBLE_OR_STAND', 5: 'DOUBLE_OR_STAND', 6: 'DOUBLE_OR_STAND', 7: 'STAND', 8: 'STAND', 9: 'HIT', 10: 'HIT', 11: 'HIT' },
  19: { 2: 'STAND', 3: 'STAND', 4: 'STAND', 5: 'STAND', 6: 'DOUBLE_OR_STAND', 7: 'STAND', 8: 'STAND', 9: 'STAND', 10: 'STAND', 11: 'STAND' },
  20: { 2: 'STAND', 3: 'STAND', 4: 'STAND', 5: 'STAND', 6: 'STAND', 7: 'STAND', 8: 'STAND', 9: 'STAND', 10: 'STAND', 11: 'STAND' },
  21: { 2: 'STAND', 3: 'STAND', 4: 'STAND', 5: 'STAND', 6: 'STAND', 7: 'STAND', 8: 'STAND', 9: 'STAND', 10: 'STAND', 11: 'STAND' },
};

/**
 * Pairs strategy table
 */
const pairsStrategy: Record<string, Record<number, StrategyAction>> = {
  // Pair rank: { Dealer up card: Action }
  'A': { 2: 'SPLIT', 3: 'SPLIT', 4: 'SPLIT', 5: 'SPLIT', 6: 'SPLIT', 7: 'SPLIT', 8: 'SPLIT', 9: 'SPLIT', 10: 'SPLIT', 11: 'SPLIT' },
  '2': { 2: 'SPLIT_IF_DAS', 3: 'SPLIT_IF_DAS', 4: 'SPLIT', 5: 'SPLIT', 6: 'SPLIT', 7: 'SPLIT', 8: 'HIT', 9: 'HIT', 10: 'HIT', 11: 'HIT' },
  '3': { 2: 'SPLIT_IF_DAS', 3: 'SPLIT_IF_DAS', 4: 'SPLIT', 5: 'SPLIT', 6: 'SPLIT', 7: 'SPLIT', 8: 'HIT', 9: 'HIT', 10: 'HIT', 11: 'HIT' },
  '4': { 2: 'HIT', 3: 'HIT', 4: 'HIT', 5: 'SPLIT_IF_DAS', 6: 'SPLIT_IF_DAS', 7: 'HIT', 8: 'HIT', 9: 'HIT', 10: 'HIT', 11: 'HIT' },
  '5': { 2: 'DOUBLE_OR_HIT', 3: 'DOUBLE_OR_HIT', 4: 'DOUBLE_OR_HIT', 5: 'DOUBLE_OR_HIT', 6: 'DOUBLE_OR_HIT', 7: 'DOUBLE_OR_HIT', 8: 'DOUBLE_OR_HIT', 9: 'DOUBLE_OR_HIT', 10: 'HIT', 11: 'HIT' },
  '6': { 2: 'SPLIT_IF_DAS', 3: 'SPLIT', 4: 'SPLIT', 5: 'SPLIT', 6: 'SPLIT', 7: 'HIT', 8: 'HIT', 9: 'HIT', 10: 'HIT', 11: 'HIT' },
  '7': { 2: 'SPLIT', 3: 'SPLIT', 4: 'SPLIT', 5: 'SPLIT', 6: 'SPLIT', 7: 'SPLIT', 8: 'HIT', 9: 'HIT', 10: 'HIT', 11: 'HIT' },
  '8': { 2: 'SPLIT', 3: 'SPLIT', 4: 'SPLIT', 5: 'SPLIT', 6: 'SPLIT', 7: 'SPLIT', 8: 'SPLIT', 9: 'SPLIT', 10: 'SURRENDER_OR_SPLIT', 11: 'SPLIT' },
  '9': { 2: 'SPLIT', 3: 'SPLIT', 4: 'SPLIT', 5: 'SPLIT', 6: 'SPLIT', 7: 'STAND', 8: 'SPLIT', 9: 'SPLIT', 10: 'STAND', 11: 'STAND' },
  '10': { 2: 'STAND', 3: 'STAND', 4: 'STAND', 5: 'STAND', 6: 'STAND', 7: 'STAND', 8: 'STAND', 9: 'STAND', 10: 'STAND', 11: 'STAND' },
  'J': { 2: 'STAND', 3: 'STAND', 4: 'STAND', 5: 'STAND', 6: 'STAND', 7: 'STAND', 8: 'STAND', 9: 'STAND', 10: 'STAND', 11: 'STAND' },
  'Q': { 2: 'STAND', 3: 'STAND', 4: 'STAND', 5: 'STAND', 6: 'STAND', 7: 'STAND', 8: 'STAND', 9: 'STAND', 10: 'STAND', 11: 'STAND' },
  'K': { 2: 'STAND', 3: 'STAND', 4: 'STAND', 5: 'STAND', 6: 'STAND', 7: 'STAND', 8: 'STAND', 9: 'STAND', 10: 'STAND', 11: 'STAND' },
};

/**
 * Resolve conditional strategy actions based on game config
 */
function resolveStrategyAction(
  action: StrategyAction,
  config: GameConfig,
  canDouble: boolean,
  canSplit: boolean,
  canSurrender: boolean,
  fromSplit: boolean
): StrategyAction {
  switch (action) {
    case 'DOUBLE_OR_HIT':
      // Can't double if not enough cards or balance
      if (!canDouble) return 'HIT';
      // Can't double after split if rule doesn't allow
      if (fromSplit && !config.doubleAfterSplit) return 'HIT';
      return 'DOUBLE';

    case 'DOUBLE_OR_STAND':
      if (!canDouble) return 'STAND';
      if (fromSplit && !config.doubleAfterSplit) return 'STAND';
      return 'DOUBLE';

    case 'SPLIT_IF_DAS':
      if (!canSplit) return 'HIT';
      // Only split if double after split is allowed
      if (config.doubleAfterSplit) return 'SPLIT';
      return 'HIT';

    case 'SURRENDER_OR_HIT':
      if (canSurrender && config.surrenderAllowed) return 'SURRENDER';
      return 'HIT';

    case 'SURRENDER_OR_STAND':
      if (canSurrender && config.surrenderAllowed) return 'SURRENDER';
      return 'STAND';

    case 'SURRENDER_OR_SPLIT':
      if (canSurrender && config.surrenderAllowed) return 'SURRENDER';
      if (canSplit) return 'SPLIT';
      return 'HIT';

    default:
      return action;
  }
}

/**
 * Get basic strategy recommendation for current hand
 */
export function getBasicStrategy(
  playerCards: Card[],
  dealerHand: Card[],
  config: GameConfig,
  canDouble: boolean,
  canSplit: boolean,
  canSurrender: boolean,
  fromSplit: boolean = false
): StrategyDecision {
  const dealerUpCard = getDealerUpCardValue(dealerHand);
  const { value: playerValue, isSoft } = calculateHandValue(playerCards);
  const isPairHand = isPair(playerCards);

  let strategyAction: StrategyAction;
  let explanation = '';

  // Check for pairs first (only if exactly 2 cards)
  if (isPairHand && playerCards.length === 2) {
    const pairRank = playerCards[0].rank;
    strategyAction = pairsStrategy[pairRank]?.[dealerUpCard] || 'HIT';
    explanation = `Pair of ${pairRank}s vs dealer ${dealerUpCard}`;
  }
  // Check for soft totals (ace counting as 11)
  else if (isSoft && playerValue <= 21) {
    strategyAction = softTotalsStrategy[playerValue]?.[dealerUpCard] || 'HIT';
    explanation = `Soft ${playerValue} vs dealer ${dealerUpCard}`;
  }
  // Hard totals
  else {
    strategyAction = hardTotalsStrategy[playerValue]?.[dealerUpCard] || (playerValue > 21 ? 'STAND' : 'HIT');
    explanation = `Hard ${playerValue} vs dealer ${dealerUpCard}`;
  }

  // Resolve conditional actions
  const resolvedAction = resolveStrategyAction(
    strategyAction,
    config,
    canDouble,
    canSplit,
    canSurrender,
    fromSplit
  );

  // Generate action recommendations with quality ratings
  const recommendations = generateRecommendations(
    resolvedAction,
    canDouble,
    canSplit,
    canSurrender
  );

  return {
    primaryAction: resolvedAction,
    recommendations,
    explanation,
  };
}

/**
 * Generate action recommendations with quality ratings
 */
function generateRecommendations(
  optimalAction: StrategyAction,
  canDouble: boolean,
  canSplit: boolean,
  canSurrender: boolean
): ActionRecommendation[] {
  const recommendations: ActionRecommendation[] = [];
  const availableActions: Array<'HIT' | 'STAND' | 'DOUBLE' | 'SPLIT' | 'SURRENDER'> = ['HIT', 'STAND'];

  if (canDouble) availableActions.push('DOUBLE');
  if (canSplit) availableActions.push('SPLIT');
  if (canSurrender) availableActions.push('SURRENDER');

  for (const action of availableActions) {
    const isOptimal = action === optimalAction;

    // Determine quality based on action type and optimal action
    let quality: 'optimal' | 'acceptable' | 'poor' = 'poor';

    if (isOptimal) {
      quality = 'optimal';
    } else {
      // Some actions are acceptable alternatives
      if (optimalAction === 'DOUBLE' && action === 'HIT') {
        quality = 'acceptable'; // Hitting when should double is acceptable
      } else if (optimalAction === 'DOUBLE' && action === 'STAND') {
        quality = 'acceptable'; // Standing when should double is acceptable (conservative)
      } else if (optimalAction === 'SURRENDER' && action === 'HIT') {
        quality = 'acceptable'; // Hitting when should surrender is acceptable
      } else if (optimalAction === 'SPLIT' && action === 'HIT') {
        quality = 'acceptable'; // Hitting when should split might be acceptable
      }
    }

    recommendations.push({
      action,
      quality,
      isOptimal,
    });
  }

  return recommendations;
}

/**
 * Get strategy chart data for display
 */
export interface StrategyChartData {
  hardTotals: typeof hardTotalsStrategy;
  softTotals: typeof softTotalsStrategy;
  pairs: typeof pairsStrategy;
}

export function getStrategyChart(): StrategyChartData {
  return {
    hardTotals: hardTotalsStrategy,
    softTotals: softTotalsStrategy,
    pairs: pairsStrategy,
  };
}
