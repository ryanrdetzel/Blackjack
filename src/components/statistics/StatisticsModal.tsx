/**
 * Statistics Modal - Milestone 6
 * Main modal for viewing and managing statistics
 */

import React from 'react';
import { StatisticsState, exportStatisticsJSON, exportHandHistoryCSV, exportSessionStatisticsCSV } from '../../lib/statistics';
import { StatisticsDashboard } from './StatisticsDashboard';
import { HandHistoryViewer } from './HandHistoryViewer';
import { BankrollChart } from './BankrollChart';

interface StatisticsModalProps {
  statistics: StatisticsState;
  currentBalance: number;
  onClose: () => void;
  onResetSession: () => void;
  onClearAll: () => void;
}

type Tab = 'dashboard' | 'history' | 'chart' | 'export';

export function StatisticsModal({
  statistics,
  currentBalance,
  onClose,
  onResetSession,
  onClearAll,
}: StatisticsModalProps) {
  const [activeTab, setActiveTab] = React.useState<Tab>('dashboard');

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Game Statistics</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-3xl leading-none transition-colors"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700 bg-gray-850">
          <TabButton
            active={activeTab === 'dashboard'}
            onClick={() => setActiveTab('dashboard')}
            icon="📊"
            label="Dashboard"
          />
          <TabButton
            active={activeTab === 'history'}
            onClick={() => setActiveTab('history')}
            icon="📜"
            label="Hand History"
          />
          <TabButton
            active={activeTab === 'chart'}
            onClick={() => setActiveTab('chart')}
            icon="📈"
            label="Bankroll Chart"
          />
          <TabButton
            active={activeTab === 'export'}
            onClick={() => setActiveTab('export')}
            icon="💾"
            label="Export"
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'dashboard' && (
            <StatisticsDashboard
              session={statistics.session}
              allTime={statistics.allTime}
              onResetSession={onResetSession}
              onClearAll={onClearAll}
            />
          )}

          {activeTab === 'history' && (
            <HandHistoryViewer handHistory={statistics.handHistory} />
          )}

          {activeTab === 'chart' && (
            <BankrollChart
              bankrollHistory={statistics.bankrollHistory}
              currentBalance={currentBalance}
            />
          )}

          {activeTab === 'export' && (
            <ExportPanel statistics={statistics} />
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t border-gray-700 bg-gray-850">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}

function TabButton({ active, onClick, icon, label }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-3 flex items-center gap-2 transition-colors border-b-2 ${
        active
          ? 'border-blue-500 text-white bg-gray-800'
          : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-800'
      }`}
    >
      <span>{icon}</span>
      <span className="font-medium">{label}</span>
    </button>
  );
}

interface ExportPanelProps {
  statistics: StatisticsState;
}

function ExportPanel({ statistics }: ExportPanelProps) {
  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const json = exportStatisticsJSON(statistics);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    downloadFile(json, `blackjack-stats-${timestamp}.json`, 'application/json');
  };

  const handleExportHandHistoryCSV = () => {
    const csv = exportHandHistoryCSV(statistics.handHistory);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    downloadFile(csv, `blackjack-hand-history-${timestamp}.csv`, 'text/csv');
  };

  const handleExportSessionCSV = () => {
    const csv = exportSessionStatisticsCSV(statistics.session);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    downloadFile(csv, `blackjack-session-stats-${timestamp}.csv`, 'text/csv');
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-white mb-4">Export Statistics</h3>
        <p className="text-gray-400 mb-6">
          Export your game statistics, hand history, and performance data in various formats.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Complete Statistics (JSON) */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-start gap-3 mb-4">
            <span className="text-3xl">📦</span>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-white mb-2">Complete Statistics</h4>
              <p className="text-sm text-gray-400 mb-4">
                Export all statistics, hand history, and bankroll data as JSON. Includes session stats,
                all-time stats, and complete hand records.
              </p>
              <button
                onClick={handleExportJSON}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors w-full"
              >
                Export JSON
              </button>
            </div>
          </div>
        </div>

        {/* Hand History (CSV) */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-start gap-3 mb-4">
            <span className="text-3xl">📊</span>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-white mb-2">Hand History</h4>
              <p className="text-sm text-gray-400 mb-4">
                Export detailed hand history as CSV. Perfect for analyzing your gameplay in spreadsheet
                software like Excel or Google Sheets.
              </p>
              <button
                onClick={handleExportHandHistoryCSV}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors w-full"
              >
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Session Statistics (CSV) */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-start gap-3 mb-4">
            <span className="text-3xl">📈</span>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-white mb-2">Session Statistics</h4>
              <p className="text-sm text-gray-400 mb-4">
                Export current session statistics as CSV. Includes all session metrics, streaks, and
                performance data.
              </p>
              <button
                onClick={handleExportSessionCSV}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors w-full"
              >
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-start gap-3">
            <span className="text-3xl">💡</span>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-white mb-2">Export Tips</h4>
              <ul className="text-sm text-gray-400 space-y-2">
                <li>• JSON files can be imported back into the game (future feature)</li>
                <li>• CSV files are compatible with Excel, Google Sheets, and data analysis tools</li>
                <li>• All exports include timestamps for easy organization</li>
                <li>• Your data is never sent to any server - all exports are local</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h4 className="text-lg font-semibold text-white mb-4">Export Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-gray-400">Total Hands</div>
            <div className="text-white font-semibold text-lg">{statistics.allTime.totalHandsPlayed}</div>
          </div>
          <div>
            <div className="text-gray-400">History Records</div>
            <div className="text-white font-semibold text-lg">{statistics.handHistory.length}</div>
          </div>
          <div>
            <div className="text-gray-400">Bankroll Snapshots</div>
            <div className="text-white font-semibold text-lg">{statistics.bankrollHistory.length}</div>
          </div>
          <div>
            <div className="text-gray-400">Sessions</div>
            <div className="text-white font-semibold text-lg">{statistics.allTime.sessionsPlayed}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
