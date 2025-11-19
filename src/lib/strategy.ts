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
  reasoning: string; // Detailed explanation of WHY this is the optimal play
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
 * Generate detailed reasoning for why an action is optimal
 */
function generateReasoning(
  action: StrategyAction,
  playerValue: number,
  dealerUpCard: number,
  isSoft: boolean,
  isPairHand: boolean,
  pairRank?: string
): string {
  // Dealer card strength context
  const dealerStrength = dealerUpCard >= 7 ? 'strong' : dealerUpCard >= 4 ? 'weak' : 'moderate';
  const dealerBustChance = dealerUpCard <= 6 ? 'high' : 'low';

  switch (action) {
    case 'HIT':
      if (playerValue <= 11) {
        return `You can't bust with ${playerValue}, so hitting is risk-free. You need a stronger hand to compete.`;
      } else if (playerValue === 12) {
        if (dealerUpCard >= 4 && dealerUpCard <= 6) {
          return `With 12, you'd normally stand against the dealer's weak ${dealerUpCard}. However, 12 is still vulnerable, and the dealer has a high bust chance.`;
        }
        return `With 12 against the dealer's ${dealerStrength} card, you need to improve. Only a 10-value card will bust you (31% chance).`;
      } else if (playerValue >= 13 && playerValue <= 16) {
        if (dealerUpCard <= 6) {
          return `Against the dealer's weak ${dealerUpCard} (${dealerBustChance} bust chance), standing is better. Let the dealer bust while you avoid risk.`;
        }
        return `Your ${playerValue} is weak against the dealer's ${dealerStrength} ${dealerUpCard}. You're likely losing if you stand, so hitting gives you the best chance despite bust risk.`;
      } else if (isSoft) {
        return `With a soft ${playerValue}, you can hit safely because the ace can be counted as 1 if you'd bust. Try to improve your hand without risk.`;
      }
      return `Your hand needs improvement against the dealer's ${dealerUpCard}. Hitting gives you the best mathematical chance of winning.`;

    case 'STAND':
      if (playerValue >= 17 && !isSoft) {
        return `Hard ${playerValue} is strong enough to beat most dealer outcomes. The risk of busting (${Math.round((playerValue - 16) * 7.7)}% chance) outweighs the potential gain.`;
      } else if (playerValue >= 19 && isSoft) {
        return `Soft ${playerValue} is a strong hand. Standing preserves your excellent position without unnecessary risk.`;
      } else if (playerValue >= 13 && playerValue <= 16 && dealerUpCard <= 6) {
        return `The dealer shows a weak ${dealerUpCard} with a ${dealerBustChance} bust probability. Let them take the risk while you protect your hand.`;
      } else if (isPairHand && pairRank && ['10', 'J', 'Q', 'K'].includes(pairRank)) {
        return `You have 20, one of the strongest hands in blackjack. Never break up this winning hand.`;
      }
      return `Standing gives you the best chance of winning in this situation. Your hand is strong enough against the dealer's ${dealerUpCard}.`;

    case 'DOUBLE':
    case 'DOUBLE_OR_HIT':
    case 'DOUBLE_OR_STAND':
      if (playerValue === 11) {
        return `11 is the best doubling hand! You have a 31% chance of getting 21, and you can't bust on the next card. Maximize your profit on this favorable situation.`;
      } else if (playerValue === 10) {
        if (dealerUpCard <= 9) {
          return `With 10, you have excellent odds (31% chance) of making 20. The dealer's ${dealerUpCard} is weak enough that doubling maximizes your edge.`;
        }
        return `With 10 against the dealer's strong ${dealerUpCard}, doubling is risky. You have good odds of making 20, but the dealer is also strong.`;
      } else if (playerValue === 9) {
        return `Against the dealer's weak ${dealerUpCard}, your 9 has good potential. Doubling lets you capitalize on the dealer's disadvantage.`;
      } else if (isSoft && playerValue >= 13 && playerValue <= 18) {
        return `Soft hands against weak dealers are excellent doubling opportunities. You can't bust, and the dealer is likely to bust. Double to maximize profit!`;
      }
      return `This situation favors you mathematically. Doubling your bet maximizes expected value when you have the advantage.`;

    case 'SPLIT':
    case 'SPLIT_IF_DAS':
      if (pairRank === 'A') {
        return `Always split aces! Starting two hands with 11 each gives you excellent chances of making strong hands or blackjacks (though split blackjacks usually pay even money).`;
      } else if (pairRank === '8') {
        return `Always split 8s. A hand of 16 is terrible, but two hands starting with 8 each have much better prospects. This is one of the most important splits in blackjack.`;
      } else if (pairRank === '9') {
        if (dealerUpCard === 7 || dealerUpCard >= 10) {
          return `With pair of 9s (18 total), standing is better here. Against ${dealerUpCard}, 18 is competitive, and splitting doesn't offer enough advantage.`;
        }
        return `Split 9s against the dealer's ${dealerStrength} card. Two hands of 9 have better expected value than one hand of 18 in this situation.`;
      } else if (['2', '3', '6', '7'].includes(pairRank || '')) {
        if (dealerUpCard <= 7) {
          return `Split low pairs against the dealer's weak card. You're creating two hands with potential, exploiting the dealer's disadvantage.`;
        }
        return `Against the dealer's strong card, splitting these low pairs turns one bad hand into two. Hit instead to minimize losses.`;
      } else if (pairRank === '4') {
        return `Never split 4s unless you can double after split. Starting with 8 is better than two weak hands of 4.`;
      } else if (pairRank === '5') {
        return `Never split 5s! You have 10, which is a strong doubling hand. Splitting would give you two terrible starting hands of 5.`;
      }
      return `Splitting gives you better mathematical expectation than playing this pair as a single hand.`;

    case 'SURRENDER':
    case 'SURRENDER_OR_HIT':
    case 'SURRENDER_OR_STAND':
    case 'SURRENDER_OR_SPLIT':
      if (playerValue === 16 && dealerUpCard >= 9) {
        return `Hard 16 vs dealer ${dealerUpCard} is one of the worst situations in blackjack. You'll lose over 50% of the time either way, so surrendering minimizes your losses to 50% of your bet.`;
      } else if (playerValue === 15 && dealerUpCard >= 10) {
        return `Hard 15 vs dealer 10 or Ace is extremely unfavorable. Surrendering recovers half your bet, which is better than the expected loss from playing out this hand.`;
      }
      return `This is a very unfavorable situation. Surrendering lets you save half your bet instead of likely losing the entire amount.`;

    default:
      return `This is the mathematically optimal play based on basic strategy for this situation.`;
  }
}

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

  // Generate detailed reasoning for the optimal action
  const reasoning = generateReasoning(
    resolvedAction,
    playerValue,
    dealerUpCard,
    isSoft,
    isPairHand,
    isPairHand ? playerCards[0].rank : undefined
  );

  return {
    primaryAction: resolvedAction,
    recommendations,
    explanation,
    reasoning,
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
