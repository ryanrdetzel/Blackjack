import { useState } from 'react';
import { getStrategyChart, StrategyChartData } from '../../lib/strategy';

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
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 px-6 py-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Basic Strategy Chart</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setActiveTab('hard')}
              className={`px-4 py-2 rounded font-semibold transition-colors ${
                activeTab === 'hard'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Hard Totals
            </button>
            <button
              onClick={() => setActiveTab('soft')}
              className={`px-4 py-2 rounded font-semibold transition-colors ${
                activeTab === 'soft'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Soft Totals
            </button>
            <button
              onClick={() => setActiveTab('pairs')}
              className={`px-4 py-2 rounded font-semibold transition-colors ${
                activeTab === 'pairs'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Pairs
            </button>
          </div>
        </div>

        {/* Chart Content */}
        <div className="p-6 overflow-auto flex-1">
          <div className="overflow-x-auto">
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
          </div>

          {/* Legend */}
          <div className="mt-6 p-4 bg-gray-800 rounded-lg">
            <h3 className="text-sm font-bold text-white mb-2">Legend</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-blue-500 text-white font-bold rounded">H</span>
                <span className="text-gray-300">Hit</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-red-600 text-white font-bold rounded">S</span>
                <span className="text-gray-300">Stand</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-green-600 text-white font-bold rounded">D</span>
                <span className="text-gray-300">Double</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-purple-600 text-white font-bold rounded">P</span>
                <span className="text-gray-300">Split</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-yellow-600 text-white font-bold rounded">R</span>
                <span className="text-gray-300">Surrender</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-green-600 text-white font-bold rounded">Dh</span>
                <span className="text-gray-300">Double or Hit</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-green-600 text-white font-bold rounded">Ds</span>
                <span className="text-gray-300">Double or Stand</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-purple-600 text-white font-bold rounded">P*</span>
                <span className="text-gray-300">Split if DAS</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-yellow-600 text-white font-bold rounded">Rh</span>
                <span className="text-gray-300">Surrender or Hit</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-800 px-6 py-4 border-t border-gray-700">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded shadow-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
