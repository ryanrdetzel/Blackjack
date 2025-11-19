// Achievement system for Blackjack game

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
  category: 'gameplay' | 'strategy' | 'progression' | 'special';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export interface AchievementProgress {
  [key: string]: number;
}

// Define all achievements
export const ACHIEVEMENTS: Record<string, Omit<Achievement, 'unlocked' | 'unlockedAt'>> = {
  // Gameplay achievements
  first_win: {
    id: 'first_win',
    name: 'First Victory',
    description: 'Win your first hand',
    icon: '🎉',
    category: 'gameplay',
    rarity: 'common',
  },
  first_blackjack: {
    id: 'first_blackjack',
    name: 'Natural!',
    description: 'Get your first blackjack',
    icon: '🃏',
    category: 'gameplay',
    rarity: 'common',
  },
  win_streak_5: {
    id: 'win_streak_5',
    name: 'Hot Streak',
    description: 'Win 5 hands in a row',
    icon: '🔥',
    category: 'gameplay',
    rarity: 'uncommon',
  },
  win_streak_10: {
    id: 'win_streak_10',
    name: 'On Fire!',
    description: 'Win 10 hands in a row',
    icon: '🔥🔥',
    category: 'gameplay',
    rarity: 'rare',
  },
  win_100_hands: {
    id: 'win_100_hands',
    name: 'Century',
    description: 'Win 100 hands',
    icon: '💯',
    category: 'gameplay',
    rarity: 'uncommon',
  },
  win_500_hands: {
    id: 'win_500_hands',
    name: 'Professional',
    description: 'Win 500 hands',
    icon: '🎰',
    category: 'gameplay',
    rarity: 'rare',
  },
  double_down_win: {
    id: 'double_down_win',
    name: 'Double Trouble',
    description: 'Win a doubled hand',
    icon: '⚡',
    category: 'gameplay',
    rarity: 'common',
  },
  split_win_both: {
    id: 'split_win_both',
    name: 'Split Success',
    description: 'Win both hands after a split',
    icon: '✌️',
    category: 'gameplay',
    rarity: 'uncommon',
  },
  perfect_21: {
    id: 'perfect_21',
    name: 'Exactly 21',
    description: 'Get exactly 21 with 3 or more cards',
    icon: '🎯',
    category: 'gameplay',
    rarity: 'common',
  },

  // Strategy achievements
  basic_strategy_perfect: {
    id: 'basic_strategy_perfect',
    name: 'By the Book',
    description: 'Play 20 hands with perfect basic strategy',
    icon: '📖',
    category: 'strategy',
    rarity: 'uncommon',
  },
  strategy_accuracy_90: {
    id: 'strategy_accuracy_90',
    name: 'Strategy Master',
    description: 'Achieve 90% accuracy over 50 hands',
    icon: '🎓',
    category: 'strategy',
    rarity: 'rare',
  },
  speed_training_complete: {
    id: 'speed_training_complete',
    name: 'Quick Draw',
    description: 'Complete a speed training session',
    icon: '⚡',
    category: 'strategy',
    rarity: 'common',
  },
  speed_expert: {
    id: 'speed_expert',
    name: 'Lightning Fast',
    description: 'Reach Expert difficulty in speed training',
    icon: '⚡⚡',
    category: 'strategy',
    rarity: 'epic',
  },
  card_counter: {
    id: 'card_counter',
    name: 'Rain Man',
    description: 'Use card counting for an entire shoe',
    icon: '🧠',
    category: 'strategy',
    rarity: 'rare',
  },

  // Progression achievements
  profit_100: {
    id: 'profit_100',
    name: 'Small Win',
    description: 'Earn $100 profit in a session',
    icon: '💵',
    category: 'progression',
    rarity: 'common',
  },
  profit_500: {
    id: 'profit_500',
    name: 'Nice Profit',
    description: 'Earn $500 profit in a session',
    icon: '💰',
    category: 'progression',
    rarity: 'uncommon',
  },
  profit_1000: {
    id: 'profit_1000',
    name: 'Big Winner',
    description: 'Earn $1,000 profit in a session',
    icon: '💎',
    category: 'progression',
    rarity: 'rare',
  },
  profit_5000: {
    id: 'profit_5000',
    name: 'High Roller',
    description: 'Earn $5,000 profit in a session',
    icon: '👑',
    category: 'progression',
    rarity: 'epic',
  },
  comeback: {
    id: 'comeback',
    name: 'Phoenix Rising',
    description: 'Go from negative balance to positive in one session',
    icon: '🔄',
    category: 'progression',
    rarity: 'uncommon',
  },
  play_1000_hands: {
    id: 'play_1000_hands',
    name: 'Veteran',
    description: 'Play 1,000 hands total',
    icon: '⭐',
    category: 'progression',
    rarity: 'rare',
  },
  play_10000_hands: {
    id: 'play_10000_hands',
    name: 'Legend',
    description: 'Play 10,000 hands total',
    icon: '🌟',
    category: 'progression',
    rarity: 'legendary',
  },

  // Special achievements
  insurance_win: {
    id: 'insurance_win',
    name: 'Insured',
    description: 'Win an insurance bet',
    icon: '🛡️',
    category: 'special',
    rarity: 'uncommon',
  },
  lucky_sevens: {
    id: 'lucky_sevens',
    name: 'Lucky Sevens',
    description: 'Get three 7s in one hand',
    icon: '🎰',
    category: 'special',
    rarity: 'rare',
  },
  perfect_pairs_win: {
    id: 'perfect_pairs_win',
    name: 'Perfect Match',
    description: 'Win a Perfect Pairs side bet',
    icon: '👯',
    category: 'special',
    rarity: 'uncommon',
  },
  twenty_one_plus_3_win: {
    id: 'twenty_one_plus_3_win',
    name: 'Poker Player',
    description: 'Win a 21+3 side bet',
    icon: '🎴',
    category: 'special',
    rarity: 'uncommon',
  },
  suited_trips: {
    id: 'suited_trips',
    name: 'Triple Threat',
    description: 'Hit Suited Trips on 21+3 side bet',
    icon: '💥',
    category: 'special',
    rarity: 'epic',
  },
};

/**
 * Check and unlock achievements based on game state
 */
export function checkAchievements(
  currentAchievements: Record<string, Achievement>,
  progress: AchievementProgress,
  event: {
    type: string;
    data?: any;
  }
): {
  achievements: Record<string, Achievement>;
  newlyUnlocked: Achievement[];
} {
  const newlyUnlocked: Achievement[] = [];
  const updatedAchievements = { ...currentAchievements };

  const unlock = (achievementId: string) => {
    if (!updatedAchievements[achievementId]?.unlocked) {
      updatedAchievements[achievementId] = {
        ...updatedAchievements[achievementId],
        unlocked: true,
        unlockedAt: Date.now(),
      };
      newlyUnlocked.push(updatedAchievements[achievementId]);
    }
  };

  switch (event.type) {
    case 'hand_won':
      unlock('first_win');
      if (progress.totalWins >= 100) unlock('win_100_hands');
      if (progress.totalWins >= 500) unlock('win_500_hands');
      break;

    case 'blackjack':
      unlock('first_blackjack');
      break;

    case 'win_streak':
      if (event.data?.streak >= 5) unlock('win_streak_5');
      if (event.data?.streak >= 10) unlock('win_streak_10');
      break;

    case 'double_win':
      unlock('double_down_win');
      break;

    case 'split_both_win':
      unlock('split_win_both');
      break;

    case 'exact_21':
      unlock('perfect_21');
      break;

    case 'basic_strategy_streak':
      if (event.data?.correct >= 20) unlock('basic_strategy_perfect');
      break;

    case 'strategy_accuracy':
      if (event.data?.accuracy >= 90 && event.data?.hands >= 50) {
        unlock('strategy_accuracy_90');
      }
      break;

    case 'speed_training_complete':
      unlock('speed_training_complete');
      if (event.data?.difficulty === 'expert') unlock('speed_expert');
      break;

    case 'card_counting_shoe':
      unlock('card_counter');
      break;

    case 'session_profit':
      if (event.data?.profit >= 100) unlock('profit_100');
      if (event.data?.profit >= 500) unlock('profit_500');
      if (event.data?.profit >= 1000) unlock('profit_1000');
      if (event.data?.profit >= 5000) unlock('profit_5000');
      break;

    case 'comeback':
      unlock('comeback');
      break;

    case 'hands_played':
      if (progress.totalHandsPlayed >= 1000) unlock('play_1000_hands');
      if (progress.totalHandsPlayed >= 10000) unlock('play_10000_hands');
      break;

    case 'insurance_won':
      unlock('insurance_win');
      break;

    case 'three_sevens':
      unlock('lucky_sevens');
      break;

    case 'perfect_pairs_won':
      unlock('perfect_pairs_win');
      break;

    case '21plus3_won':
      unlock('twenty_one_plus_3_win');
      if (event.data?.type === 'suited_trips') unlock('suited_trips');
      break;
  }

  return { achievements: updatedAchievements, newlyUnlocked };
}

/**
 * Initialize achievements from localStorage or create new
 */
export function initializeAchievements(): Record<string, Achievement> {
  const saved = localStorage.getItem('blackjack_achievements');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      // Invalid data, create fresh
    }
  }

  // Create initial achievement state
  const achievements: Record<string, Achievement> = {};
  Object.entries(ACHIEVEMENTS).forEach(([id, achievement]) => {
    achievements[id] = {
      ...achievement,
      unlocked: false,
    };
  });

  return achievements;
}

/**
 * Save achievements to localStorage
 */
export function saveAchievements(achievements: Record<string, Achievement>): void {
  localStorage.setItem('blackjack_achievements', JSON.stringify(achievements));
}

/**
 * Get achievement statistics
 */
export function getAchievementStats(achievements: Record<string, Achievement>): {
  total: number;
  unlocked: number;
  percentage: number;
  byCategory: Record<string, { total: number; unlocked: number }>;
  byRarity: Record<string, { total: number; unlocked: number }>;
} {
  const allAchievements = Object.values(achievements);
  const total = allAchievements.length;
  const unlocked = allAchievements.filter(a => a.unlocked).length;
  const percentage = total > 0 ? Math.round((unlocked / total) * 100) : 0;

  const byCategory: Record<string, { total: number; unlocked: number }> = {};
  const byRarity: Record<string, { total: number; unlocked: number }> = {};

  allAchievements.forEach(achievement => {
    // By category
    if (!byCategory[achievement.category]) {
      byCategory[achievement.category] = { total: 0, unlocked: 0 };
    }
    byCategory[achievement.category].total++;
    if (achievement.unlocked) {
      byCategory[achievement.category].unlocked++;
    }

    // By rarity
    if (!byRarity[achievement.rarity]) {
      byRarity[achievement.rarity] = { total: 0, unlocked: 0 };
    }
    byRarity[achievement.rarity].total++;
    if (achievement.unlocked) {
      byRarity[achievement.rarity].unlocked++;
    }
  });

  return { total, unlocked, percentage, byCategory, byRarity };
}
