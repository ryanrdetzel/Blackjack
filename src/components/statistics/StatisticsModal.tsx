/**
 * Statistics Modal - Milestone 6
 * Main modal for viewing and managing statistics
 */

import React from 'react';
import { StatisticsState, exportStatisticsJSON, exportHandHistoryCSV, exportSessionStatisticsCSV } from '../../lib/statistics';
import { StatisticsDashboard } from './StatisticsDashboard';
import { HandHistoryViewer } from './HandHistoryViewer';
import { BankrollChart } from './BankrollChart';
import { Modal, Button, Tabs, type Tab } from '../ui';

interface StatisticsModalProps {
  statistics: StatisticsState;
  currentBalance: number;
  onClose: () => void;
  onResetSession: () => void;
  onClearAll: () => void;
}

type TabId = 'dashboard' | 'history' | 'chart' | 'export';

export function StatisticsModal({
  statistics,
  currentBalance,
  onClose,
  onResetSession,
  onClearAll,
}: StatisticsModalProps) {
  const [activeTab, setActiveTab] = React.useState<TabId>('dashboard');

  const tabs: Tab[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'history', label: 'Hand History', icon: '📜' },
    { id: 'chart', label: 'Bankroll Chart', icon: '📈' },
    { id: 'export', label: 'Export', icon: '💾' },
  ];

  return (
    <Modal isOpen={true} onClose={onClose} title="Game Statistics" size="large">
      <div className="space-y-6">
        {/* Tabs */}
        <Tabs tabs={tabs} activeTab={activeTab} onChange={(id) => setActiveTab(id as TabId)} />

        {/* Content */}
        <div className="min-h-[400px]">
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
      </div>

      {/* Footer */}
      <div className="mt-6 flex justify-end">
        <Button onClick={onClose} variant="primary">
          Close
        </Button>
      </div>
    </Modal>
  );
}

interface ExportPanelProps {
  statistics: StatisticsState;
}

const ExportPanel = React.memo(({ statistics }: ExportPanelProps) => {
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

  const exportOptions = [
    {
      icon: '📦',
      title: 'Complete Statistics',
      description: 'Export all statistics, hand history, and bankroll data as JSON. Includes session stats, all-time stats, and complete hand records.',
      buttonLabel: 'Export JSON',
      variant: 'primary' as const,
      onClick: handleExportJSON,
    },
    {
      icon: '📊',
      title: 'Hand History',
      description: 'Export detailed hand history as CSV. Perfect for analyzing your gameplay in spreadsheet software like Excel or Google Sheets.',
      buttonLabel: 'Export CSV',
      variant: 'success' as const,
      onClick: handleExportHandHistoryCSV,
    },
    {
      icon: '📈',
      title: 'Session Statistics',
      description: 'Export current session statistics as CSV. Includes all session metrics, streaks, and performance data.',
      buttonLabel: 'Export CSV',
      variant: 'secondary' as const,
      onClick: handleExportSessionCSV,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-white mb-4">Export Statistics</h3>
        <p className="text-gray-400 mb-6">
          Export your game statistics, hand history, and performance data in various formats.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Export Options */}
        {exportOptions.map((option) => (
          <div key={option.title} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-start gap-3 mb-4">
              <span className="text-3xl">{option.icon}</span>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-white mb-2">{option.title}</h4>
                <p className="text-sm text-gray-400 mb-4">{option.description}</p>
                <Button onClick={option.onClick} variant={option.variant} fullWidth>
                  {option.buttonLabel}
                </Button>
              </div>
            </div>
          </div>
        ))}

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
});

ExportPanel.displayName = 'ExportPanel';
