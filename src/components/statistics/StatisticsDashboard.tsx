/**
 * Statistics Dashboard - Milestone 6
 * Displays comprehensive game statistics and performance metrics
 */

import React from 'react';
import { SessionStatistics, AllTimeStatistics } from '../../lib/statistics';

interface StatisticsDashboardProps {
  session: SessionStatistics;
  allTime: AllTimeStatistics;
  onResetSession: () => void;
  onClearAll: () => void;
}

export function StatisticsDashboard({
  session,
  allTime,
  onResetSession,
  onClearAll,
}: StatisticsDashboardProps) {
  const [showConfirmClear, setShowConfirmClear] = React.useState(false);

  // Calculate win rates
  const sessionWinRate = session.handsPlayed > 0
    ? ((session.handsWon / session.handsPlayed) * 100).toFixed(1)
    : '0.0';
  const allTimeWinRate = allTime.totalHandsPlayed > 0
    ? ((allTime.totalHandsWon / allTime.totalHandsPlayed) * 100).toFixed(1)
    : '0.0';

  // Calculate session duration
  const sessionDuration = session.sessionEndTime
    ? session.sessionEndTime - session.sessionStartTime
    : Date.now() - session.sessionStartTime;
  const sessionHours = Math.floor(sessionDuration / (1000 * 60 * 60));
  const sessionMinutes = Math.floor((sessionDuration % (1000 * 60 * 60)) / (1000 * 60));

  // Format dates
  const sessionStartDate = new Date(session.sessionStartTime).toLocaleString();
  const firstPlayedDate = allTime.firstPlayedTimestamp
    ? new Date(allTime.firstPlayedTimestamp).toLocaleDateString()
    : 'N/A';
  const lastPlayedDate = allTime.lastPlayedTimestamp
    ? new Date(allTime.lastPlayedTimestamp).toLocaleString()
    : 'N/A';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Statistics</h2>
        <div className="flex gap-2">
          <button
            onClick={onResetSession}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
            title="Start a new session (keeps all-time stats)"
          >
            New Session
          </button>
          <button
            onClick={() => setShowConfirmClear(true)}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmClear && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Clear All Statistics?</h3>
            <p className="text-gray-300 mb-6">
              This will permanently delete all statistics, hand history, and bankroll history.
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirmClear(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onClearAll();
                  setShowConfirmClear(false);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Session Statistics */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-blue-400">📊</span> Current Session
          </h3>
          <div className="space-y-3 text-sm">
            <StatRow label="Started" value={sessionStartDate} />
            <StatRow label="Duration" value={`${sessionHours}h ${sessionMinutes}m`} />
            <StatRow label="Hands Played" value={session.handsPlayed} highlight />
            <StatRow
              label="Win Rate"
              value={`${sessionWinRate}%`}
              valueColor={parseFloat(sessionWinRate) >= 45 ? 'text-green-400' : 'text-red-400'}
            />
            <StatRow
              label="Record"
              value={`${session.handsWon}W / ${session.handsLost}L / ${session.handsPushed}P`}
            />
            <StatRow label="Blackjacks" value={session.blackjacksHit} valueColor="text-yellow-400" />
            <div className="border-t border-gray-700 my-3" />
            <StatRow label="Total Wagered" value={`$${session.totalWagered.toFixed(2)}`} />
            <StatRow label="Total Payout" value={`$${session.totalPayout.toFixed(2)}`} />
            <StatRow
              label="Net Profit"
              value={`$${session.netProfit.toFixed(2)}`}
              valueColor={session.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}
              highlight
            />
            <StatRow
              label="Biggest Win"
              value={`$${session.biggestWin.toFixed(2)}`}
              valueColor="text-green-400"
            />
            <StatRow
              label="Biggest Loss"
              value={`$${Math.abs(session.biggestLoss).toFixed(2)}`}
              valueColor="text-red-400"
            />
            <div className="border-t border-gray-700 my-3" />
            <StatRow
              label="Current Streak"
              value={
                session.currentStreak === 0
                  ? 'None'
                  : session.currentStreak > 0
                  ? `${session.currentStreak} wins`
                  : `${Math.abs(session.currentStreak)} losses`
              }
              valueColor={
                session.currentStreak > 0 ? 'text-green-400' : session.currentStreak < 0 ? 'text-red-400' : ''
              }
            />
            <StatRow
              label="Longest Win Streak"
              value={session.longestWinStreak}
              valueColor="text-green-400"
            />
            <StatRow
              label="Longest Loss Streak"
              value={Math.abs(session.longestLoseStreak)}
              valueColor="text-red-400"
            />
            <div className="border-t border-gray-700 my-3" />
            <StatRow label="Splits" value={session.splitsPerformed} />
            <StatRow label="Doubles" value={session.doublesPerformed} />
            <StatRow label="Surrenders" value={session.surrendersPerformed} />
            <StatRow
              label="Insurance"
              value={`${session.insuranceWon}/${session.insuranceTaken}`}
              tooltip="Won / Taken"
            />
          </div>
        </div>

        {/* All-Time Statistics */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-purple-400">🏆</span> All-Time Statistics
          </h3>
          <div className="space-y-3 text-sm">
            <StatRow label="First Played" value={firstPlayedDate} />
            <StatRow label="Last Played" value={lastPlayedDate} />
            <StatRow label="Sessions Played" value={allTime.sessionsPlayed} />
            <StatRow label="Total Hands" value={allTime.totalHandsPlayed} highlight />
            <StatRow
              label="Win Rate"
              value={`${allTimeWinRate}%`}
              valueColor={parseFloat(allTimeWinRate) >= 45 ? 'text-green-400' : 'text-red-400'}
            />
            <StatRow
              label="Record"
              value={`${allTime.totalHandsWon}W / ${allTime.totalHandsLost}L / ${allTime.totalHandsPushed}P`}
            />
            <StatRow
              label="Blackjacks"
              value={allTime.totalBlackjacksHit}
              valueColor="text-yellow-400"
            />
            <div className="border-t border-gray-700 my-3" />
            <StatRow label="Total Wagered" value={`$${allTime.totalWagered.toFixed(2)}`} />
            <StatRow label="Total Payout" value={`$${allTime.totalPayout.toFixed(2)}`} />
            <StatRow
              label="Net Profit"
              value={`$${allTime.totalNetProfit.toFixed(2)}`}
              valueColor={allTime.totalNetProfit >= 0 ? 'text-green-400' : 'text-red-400'}
              highlight
            />
            <StatRow
              label="Biggest Win"
              value={`$${allTime.biggestWin.toFixed(2)}`}
              valueColor="text-green-400"
            />
            <StatRow
              label="Biggest Loss"
              value={`$${Math.abs(allTime.biggestLoss).toFixed(2)}`}
              valueColor="text-red-400"
            />
            <div className="border-t border-gray-700 my-3" />
            <StatRow
              label="Longest Win Streak"
              value={allTime.longestWinStreak}
              valueColor="text-green-400"
            />
            <StatRow
              label="Longest Loss Streak"
              value={Math.abs(allTime.longestLoseStreak)}
              valueColor="text-red-400"
            />
            <div className="border-t border-gray-700 my-3" />
            <StatRow label="Total Splits" value={allTime.totalSplitsPerformed} />
            <StatRow label="Total Doubles" value={allTime.totalDoublesPerformed} />
            <StatRow label="Total Surrenders" value={allTime.totalSurrendersPerformed} />
            <StatRow
              label="Insurance"
              value={`${allTime.totalInsuranceWon}/${allTime.totalInsuranceTaken}`}
              tooltip="Won / Taken"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatRowProps {
  label: string;
  value: string | number;
  valueColor?: string;
  highlight?: boolean;
  tooltip?: string;
}

function StatRow({ label, value, valueColor = 'text-gray-300', highlight = false, tooltip }: StatRowProps) {
  return (
    <div
      className={`flex justify-between items-center ${highlight ? 'font-semibold' : ''}`}
      title={tooltip}
    >
      <span className="text-gray-400">{label}:</span>
      <span className={valueColor}>{value}</span>
    </div>
  );
}
