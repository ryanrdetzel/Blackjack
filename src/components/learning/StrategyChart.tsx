import React, { useState } from 'react';
import { getStrategyChart, StrategyChartData } from '../../lib/strategy';
import { Modal, Button, Tabs, type Tab } from '../ui';

interface StrategyChartProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StrategyChart({ isOpen, onClose }: StrategyChartProps) {
  const [activeTab, setActiveTab] = useState<'hard' | 'soft' | 'pairs'>('hard');
  const chart: StrategyChartData = getStrategyChart();

  if (!isOpen) {
    return null;
  }

  const tabs: Tab[] = [
    { id: 'hard', label: 'Hard Totals' },
    { id: 'soft', label: 'Soft Totals' },
    { id: 'pairs', label: 'Pairs' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Basic Strategy Chart" size="large">
      <div className="space-y-6">
        {/* Tabs */}
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab as (id: string) => void} />

        {/* Chart Content */}
        <div className="overflow-x-auto">
          <StrategyTable chart={chart} activeTab={activeTab} />
        </div>

        {/* Legend */}
        <StrategyLegend />
      </div>

      {/* Footer */}
      <div className="mt-6 flex justify-end">
        <Button onClick={onClose} variant="primary" fullWidth>
          Close
        </Button>
      </div>
    </Modal>
  );
}

interface StrategyTableProps {
  chart: StrategyChartData;
  activeTab: 'hard' | 'soft' | 'pairs';
}

const StrategyTable = React.memo(({ chart, activeTab }: StrategyTableProps) => {
  const dealerCards = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11]; // 11 represents Ace

  // Format action for display
  const formatAction = (action: string): string => {
    const actionMap: Record<string, string> = {
      'HIT': 'H',
      'STAND': 'S',
      'DOUBLE': 'D',
      'DOUBLE_OR_HIT': 'Dh',
      'DOUBLE_OR_STAND': 'Ds',
      'SPLIT': 'P',
      'SPLIT_IF_DAS': 'P*',
      'SURRENDER': 'R',
      'SURRENDER_OR_HIT': 'Rh',
      'SURRENDER_OR_STAND': 'Rs',
      'SURRENDER_OR_SPLIT': 'Rp',
    };
    return actionMap[action] || action;
  };

  // Get color class for action
  const getActionColor = (action: string): string => {
    if (action.includes('STAND')) return 'bg-red-600 text-white';
    if (action.includes('HIT')) return 'bg-blue-500 text-white';
    if (action.includes('DOUBLE')) return 'bg-green-600 text-white';
    if (action.includes('SPLIT')) return 'bg-purple-600 text-white';
    if (action.includes('SURRENDER')) return 'bg-yellow-600 text-white';
    return 'bg-gray-600 text-white';
  };

  return (
    <table className="w-full border-collapse text-xs">
      <thead>
        <tr>
          <th className="border border-gray-600 bg-gray-800 text-white p-2 sticky left-0 z-10">
            {activeTab === 'pairs' ? 'Pair' : 'Player'}
          </th>
          {dealerCards.map((card) => (
            <th key={card} className="border border-gray-600 bg-gray-800 text-white p-2 min-w-[40px]">
              {card === 11 ? 'A' : card}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {activeTab === 'hard' &&
          Object.entries(chart.hardTotals)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([total, actions]) => (
              <tr key={total}>
                <td className="border border-gray-600 bg-gray-800 text-white font-bold p-2 sticky left-0 z-10">
                  {total}
                </td>
                {dealerCards.map((dealerCard) => {
                  const action = actions[dealerCard] || 'HIT';
                  return (
                    <td
                      key={dealerCard}
                      className={`border border-gray-600 p-2 text-center font-bold ${getActionColor(action)}`}
                    >
                      {formatAction(action)}
                    </td>
                  );
                })}
              </tr>
            ))}

        {activeTab === 'soft' &&
          Object.entries(chart.softTotals)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([total, actions]) => (
              <tr key={total}>
                <td className="border border-gray-600 bg-gray-800 text-white font-bold p-2 sticky left-0 z-10">
                  A,{parseInt(total) - 11}
                </td>
                {dealerCards.map((dealerCard) => {
                  const action = actions[dealerCard] || 'HIT';
                  return (
                    <td
                      key={dealerCard}
                      className={`border border-gray-600 p-2 text-center font-bold ${getActionColor(action)}`}
                    >
                      {formatAction(action)}
                    </td>
                  );
                })}
              </tr>
            ))}

        {activeTab === 'pairs' &&
          Object.entries(chart.pairs).map(([rank, actions]) => (
            <tr key={rank}>
              <td className="border border-gray-600 bg-gray-800 text-white font-bold p-2 sticky left-0 z-10">
                {rank},{rank}
              </td>
              {dealerCards.map((dealerCard) => {
                const action = actions[dealerCard] || 'HIT';
                return (
                  <td
                    key={dealerCard}
                    className={`border border-gray-600 p-2 text-center font-bold ${getActionColor(action)}`}
                  >
                    {formatAction(action)}
                  </td>
                );
              })}
            </tr>
          ))}
      </tbody>
    </table>
  );
});

StrategyTable.displayName = 'StrategyTable';

const StrategyLegend = React.memo(() => {
  const legendItems = [
    { code: 'H', label: 'Hit', color: 'bg-blue-500' },
    { code: 'S', label: 'Stand', color: 'bg-red-600' },
    { code: 'D', label: 'Double', color: 'bg-green-600' },
    { code: 'P', label: 'Split', color: 'bg-purple-600' },
    { code: 'R', label: 'Surrender', color: 'bg-yellow-600' },
    { code: 'Dh', label: 'Double or Hit', color: 'bg-green-600' },
    { code: 'Ds', label: 'Double or Stand', color: 'bg-green-600' },
    { code: 'P*', label: 'Split if DAS', color: 'bg-purple-600' },
    { code: 'Rh', label: 'Surrender or Hit', color: 'bg-yellow-600' },
  ];

  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <h3 className="text-sm font-bold text-white mb-2">Legend</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
        {legendItems.map((item) => (
          <div key={item.code} className="flex items-center gap-2">
            <span className={`px-2 py-1 ${item.color} text-white font-bold rounded`}>
              {item.code}
            </span>
            <span className="text-gray-300">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
});

StrategyLegend.displayName = 'StrategyLegend';
