/**
 * Statistics tracking for Milestone 6
 * Tracks game performance, hand history, and bankroll over time
 */

import { Card, GameResult, GameConfig } from './types';

// Hand record for history
export interface HandRecord {
  id: string;
  timestamp: number;
  playerHands: {
    cards: Card[];
    bet: number;
    result: GameResult;
    payout: number;
  }[];
  dealerHand: Card[];
  totalBet: number;
  totalPayout: number;
  netProfit: number;
  insurance: number;
  configName: string;
}

// Bankroll snapshot for tracking balance over time
export interface BankrollSnapshot {
  timestamp: number;
  balance: number;
  handId: string;
}

// Session statistics (resets each session)
export interface SessionStatistics {
  sessionStartTime: number;
  sessionEndTime: number | null;
  handsPlayed: number;
  handsWon: number;
  handsLost: number;
  handsPushed: number;
  blackjacksHit: number;
  totalWagered: number;
  totalPayout: number;
  netProfit: number;
  biggestWin: number;
  biggestLoss: number;
  currentStreak: number; // Positive for wins, negative for losses
  longestWinStreak: number;
  longestLoseStreak: number;
  splitsPerformed: number;
  doublesPerformed: number;
  surrendersPerformed: number;
  insuranceTaken: number;
  insuranceWon: number;
}

// All-time statistics (persisted across sessions)
export interface AllTimeStatistics {
  totalHandsPlayed: number;
  totalHandsWon: number;
  totalHandsLost: number;
  totalHandsPushed: number;
  totalBlackjacksHit: number;
  totalWagered: number;
  totalPayout: number;
  totalNetProfit: number;
  biggestWin: number;
  biggestLoss: number;
  longestWinStreak: number;
  longestLoseStreak: number;
  totalSplitsPerformed: number;
  totalDoublesPerformed: number;
  totalSurrendersPerformed: number;
  totalInsuranceTaken: number;
  totalInsuranceWon: number;
  sessionsPlayed: number;
  firstPlayedTimestamp: number;
  lastPlayedTimestamp: number;
}

// Statistics state
export interface StatisticsState {
  session: SessionStatistics;
  allTime: AllTimeStatistics;
  handHistory: HandRecord[];
  bankrollHistory: BankrollSnapshot[];
  maxHandHistorySize: number; // Limit stored hands to prevent localStorage overflow
  maxBankrollHistorySize: number;
}

// Storage keys
export const STORAGE_KEY_STATISTICS = 'blackjack_statistics';
export const STORAGE_KEY_HAND_HISTORY = 'blackjack_hand_history';
export const STORAGE_KEY_BANKROLL_HISTORY = 'blackjack_bankroll_history';

// Default values
export const DEFAULT_SESSION_STATISTICS: SessionStatistics = {
  sessionStartTime: Date.now(),
  sessionEndTime: null,
  handsPlayed: 0,
  handsWon: 0,
  handsLost: 0,
  handsPushed: 0,
  blackjacksHit: 0,
  totalWagered: 0,
  totalPayout: 0,
  netProfit: 0,
  biggestWin: 0,
  biggestLoss: 0,
  currentStreak: 0,
  longestWinStreak: 0,
  longestLoseStreak: 0,
  splitsPerformed: 0,
  doublesPerformed: 0,
  surrendersPerformed: 0,
  insuranceTaken: 0,
  insuranceWon: 0,
};

export const DEFAULT_ALL_TIME_STATISTICS: AllTimeStatistics = {
  totalHandsPlayed: 0,
  totalHandsWon: 0,
  totalHandsLost: 0,
  totalHandsPushed: 0,
  totalBlackjacksHit: 0,
  totalWagered: 0,
  totalPayout: 0,
  totalNetProfit: 0,
  biggestWin: 0,
  biggestLoss: 0,
  longestWinStreak: 0,
  longestLoseStreak: 0,
  totalSplitsPerformed: 0,
  totalDoublesPerformed: 0,
  totalSurrendersPerformed: 0,
  totalInsuranceTaken: 0,
  totalInsuranceWon: 0,
  sessionsPlayed: 0,
  firstPlayedTimestamp: 0,
  lastPlayedTimestamp: 0,
};

/**
 * Create initial statistics state
 */
export function createInitialStatistics(): StatisticsState {
  // Load all-time stats from localStorage
  const savedAllTime = localStorage.getItem(STORAGE_KEY_STATISTICS);
  const allTime: AllTimeStatistics = savedAllTime
    ? JSON.parse(savedAllTime)
    : DEFAULT_ALL_TIME_STATISTICS;

  // Load hand history from localStorage
  const savedHandHistory = localStorage.getItem(STORAGE_KEY_HAND_HISTORY);
  const handHistory: HandRecord[] = savedHandHistory ? JSON.parse(savedHandHistory) : [];

  // Load bankroll history from localStorage
  const savedBankrollHistory = localStorage.getItem(STORAGE_KEY_BANKROLL_HISTORY);
  const bankrollHistory: BankrollSnapshot[] = savedBankrollHistory
    ? JSON.parse(savedBankrollHistory)
    : [];

  return {
    session: DEFAULT_SESSION_STATISTICS,
    allTime,
    handHistory,
    bankrollHistory,
    maxHandHistorySize: 500, // Store last 500 hands
    maxBankrollHistorySize: 1000, // Store last 1000 balance snapshots
  };
}

/**
 * Record a completed hand
 */
export function recordHand(
  stats: StatisticsState,
  playerHands: { cards: Card[]; bet: number; result: GameResult; payout: number }[],
  dealerHand: Card[],
  insurance: number,
  insuranceWon: boolean,
  configName: string,
  balance: number
): StatisticsState {
  // Calculate hand totals
  const totalBet = playerHands.reduce((sum, hand) => sum + hand.bet, 0) + insurance;
  const totalPayout = playerHands.reduce((sum, hand) => sum + hand.payout, 0);
  const netProfit = totalPayout - totalBet;

  // Count results
  let handsWon = 0;
  let handsLost = 0;
  let handsPushed = 0;
  let blackjacksHit = 0;

  playerHands.forEach(hand => {
    if (hand.result === 'blackjack') {
      blackjacksHit++;
      handsWon++;
    } else if (hand.result === 'win') {
      handsWon++;
    } else if (hand.result === 'lose') {
      handsLost++;
    } else if (hand.result === 'push') {
      handsPushed++;
    }
    // Surrender doesn't count as win/loss/push
  });

  // Create hand record
  const handRecord: HandRecord = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    playerHands: playerHands.map(h => ({
      cards: h.cards,
      bet: h.bet,
      result: h.result,
      payout: h.payout,
    })),
    dealerHand,
    totalBet,
    totalPayout,
    netProfit,
    insurance,
    configName,
  };

  // Update current streak
  let currentStreak = stats.session.currentStreak;
  if (netProfit > 0) {
    currentStreak = currentStreak >= 0 ? currentStreak + 1 : 1;
  } else if (netProfit < 0) {
    currentStreak = currentStreak <= 0 ? currentStreak - 1 : -1;
  }
  // Push doesn't change streak

  // Update session statistics
  const newSession: SessionStatistics = {
    ...stats.session,
    handsPlayed: stats.session.handsPlayed + 1,
    handsWon: stats.session.handsWon + handsWon,
    handsLost: stats.session.handsLost + handsLost,
    handsPushed: stats.session.handsPushed + handsPushed,
    blackjacksHit: stats.session.blackjacksHit + blackjacksHit,
    totalWagered: stats.session.totalWagered + totalBet,
    totalPayout: stats.session.totalPayout + totalPayout,
    netProfit: stats.session.netProfit + netProfit,
    biggestWin: Math.max(stats.session.biggestWin, netProfit),
    biggestLoss: Math.min(stats.session.biggestLoss, netProfit),
    currentStreak,
    longestWinStreak: currentStreak > 0
      ? Math.max(stats.session.longestWinStreak, currentStreak)
      : stats.session.longestWinStreak,
    longestLoseStreak: currentStreak < 0
      ? Math.min(stats.session.longestLoseStreak, currentStreak)
      : stats.session.longestLoseStreak,
    insuranceTaken: stats.session.insuranceTaken + (insurance > 0 ? 1 : 0),
    insuranceWon: stats.session.insuranceWon + (insuranceWon ? 1 : 0),
  };

  // Update all-time statistics
  const newAllTime: AllTimeStatistics = {
    ...stats.allTime,
    totalHandsPlayed: stats.allTime.totalHandsPlayed + 1,
    totalHandsWon: stats.allTime.totalHandsWon + handsWon,
    totalHandsLost: stats.allTime.totalHandsLost + handsLost,
    totalHandsPushed: stats.allTime.totalHandsPushed + handsPushed,
    totalBlackjacksHit: stats.allTime.totalBlackjacksHit + blackjacksHit,
    totalWagered: stats.allTime.totalWagered + totalBet,
    totalPayout: stats.allTime.totalPayout + totalPayout,
    totalNetProfit: stats.allTime.totalNetProfit + netProfit,
    biggestWin: Math.max(stats.allTime.biggestWin, netProfit),
    biggestLoss: Math.min(stats.allTime.biggestLoss, netProfit),
    longestWinStreak: currentStreak > 0
      ? Math.max(stats.allTime.longestWinStreak, currentStreak)
      : stats.allTime.longestWinStreak,
    longestLoseStreak: currentStreak < 0
      ? Math.min(stats.allTime.longestLoseStreak, currentStreak)
      : stats.allTime.longestLoseStreak,
    totalInsuranceTaken: stats.allTime.totalInsuranceTaken + (insurance > 0 ? 1 : 0),
    totalInsuranceWon: stats.allTime.totalInsuranceWon + (insuranceWon ? 1 : 0),
    lastPlayedTimestamp: Date.now(),
    firstPlayedTimestamp: stats.allTime.firstPlayedTimestamp || Date.now(),
  };

  // Update hand history (keep only last N hands)
  const newHandHistory = [...stats.handHistory, handRecord];
  if (newHandHistory.length > stats.maxHandHistorySize) {
    newHandHistory.shift(); // Remove oldest
  }

  // Update bankroll history
  const bankrollSnapshot: BankrollSnapshot = {
    timestamp: Date.now(),
    balance,
    handId: handRecord.id,
  };
  const newBankrollHistory = [...stats.bankrollHistory, bankrollSnapshot];
  if (newBankrollHistory.length > stats.maxBankrollHistorySize) {
    newBankrollHistory.shift(); // Remove oldest
  }

  // Save to localStorage
  localStorage.setItem(STORAGE_KEY_STATISTICS, JSON.stringify(newAllTime));
  localStorage.setItem(STORAGE_KEY_HAND_HISTORY, JSON.stringify(newHandHistory));
  localStorage.setItem(STORAGE_KEY_BANKROLL_HISTORY, JSON.stringify(newBankrollHistory));

  return {
    ...stats,
    session: newSession,
    allTime: newAllTime,
    handHistory: newHandHistory,
    bankrollHistory: newBankrollHistory,
  };
}

/**
 * Track split action
 */
export function recordSplit(stats: StatisticsState): StatisticsState {
  const newSession = {
    ...stats.session,
    splitsPerformed: stats.session.splitsPerformed + 1,
  };

  const newAllTime = {
    ...stats.allTime,
    totalSplitsPerformed: stats.allTime.totalSplitsPerformed + 1,
  };

  return {
    ...stats,
    session: newSession,
    allTime: newAllTime,
  };
}

/**
 * Track double action
 */
export function recordDouble(stats: StatisticsState): StatisticsState {
  const newSession = {
    ...stats.session,
    doublesPerformed: stats.session.doublesPerformed + 1,
  };

  const newAllTime = {
    ...stats.allTime,
    totalDoublesPerformed: stats.allTime.totalDoublesPerformed + 1,
  };

  return {
    ...stats,
    session: newSession,
    allTime: newAllTime,
  };
}

/**
 * Track surrender action
 */
export function recordSurrender(stats: StatisticsState): StatisticsState {
  const newSession = {
    ...stats.session,
    surrendersPerformed: stats.session.surrendersPerformed + 1,
  };

  const newAllTime = {
    ...stats.allTime,
    totalSurrendersPerformed: stats.allTime.totalSurrendersPerformed + 1,
  };

  return {
    ...stats,
    session: newSession,
    allTime: newAllTime,
  };
}

/**
 * Reset session statistics (start new session)
 */
export function resetSession(stats: StatisticsState): StatisticsState {
  const newAllTime = {
    ...stats.allTime,
    sessionsPlayed: stats.allTime.sessionsPlayed + 1,
  };

  localStorage.setItem(STORAGE_KEY_STATISTICS, JSON.stringify(newAllTime));

  return {
    ...stats,
    session: {
      ...DEFAULT_SESSION_STATISTICS,
      sessionStartTime: Date.now(),
    },
    allTime: newAllTime,
  };
}

/**
 * Clear all statistics (reset everything)
 */
export function clearAllStatistics(): StatisticsState {
  localStorage.removeItem(STORAGE_KEY_STATISTICS);
  localStorage.removeItem(STORAGE_KEY_HAND_HISTORY);
  localStorage.removeItem(STORAGE_KEY_BANKROLL_HISTORY);

  return createInitialStatistics();
}

/**
 * Export statistics as JSON
 */
export function exportStatisticsJSON(stats: StatisticsState): string {
  return JSON.stringify(
    {
      session: stats.session,
      allTime: stats.allTime,
      handHistory: stats.handHistory,
      bankrollHistory: stats.bankrollHistory,
      exportedAt: Date.now(),
    },
    null,
    2
  );
}

/**
 * Export hand history as CSV
 */
export function exportHandHistoryCSV(handHistory: HandRecord[]): string {
  const headers = [
    'Timestamp',
    'Date',
    'Config',
    'Total Bet',
    'Total Payout',
    'Net Profit',
    'Insurance',
    'Hands',
    'Result',
  ];

  const rows = handHistory.map(hand => {
    const date = new Date(hand.timestamp).toLocaleString();
    const handsCount = hand.playerHands.length;
    const results = hand.playerHands.map(h => h.result).join(';');

    return [
      hand.timestamp,
      date,
      hand.configName,
      hand.totalBet,
      hand.totalPayout,
      hand.netProfit,
      hand.insurance,
      handsCount,
      results,
    ];
  });

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n');

  return csvContent;
}

/**
 * Export session statistics as CSV
 */
export function exportSessionStatisticsCSV(stats: SessionStatistics): string {
  const headers = ['Metric', 'Value'];
  const rows = [
    ['Session Start', new Date(stats.sessionStartTime).toLocaleString()],
    ['Session End', stats.sessionEndTime ? new Date(stats.sessionEndTime).toLocaleString() : 'Ongoing'],
    ['Hands Played', stats.handsPlayed],
    ['Hands Won', stats.handsWon],
    ['Hands Lost', stats.handsLost],
    ['Hands Pushed', stats.handsPushed],
    ['Blackjacks Hit', stats.blackjacksHit],
    ['Total Wagered', stats.totalWagered],
    ['Total Payout', stats.totalPayout],
    ['Net Profit', stats.netProfit],
    ['Biggest Win', stats.biggestWin],
    ['Biggest Loss', stats.biggestLoss],
    ['Current Streak', stats.currentStreak],
    ['Longest Win Streak', stats.longestWinStreak],
    ['Longest Lose Streak', stats.longestLoseStreak],
    ['Splits Performed', stats.splitsPerformed],
    ['Doubles Performed', stats.doublesPerformed],
    ['Surrenders Performed', stats.surrendersPerformed],
    ['Insurance Taken', stats.insuranceTaken],
    ['Insurance Won', stats.insuranceWon],
  ];

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n');

  return csvContent;
}
