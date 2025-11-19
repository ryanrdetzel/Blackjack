/**
 * Bankroll Chart - Milestone 6
 * Visualizes bankroll changes over time
 */

import React from 'react';
import { BankrollSnapshot } from '../../lib/statistics';

interface BankrollChartProps {
  bankrollHistory: BankrollSnapshot[];
  currentBalance: number;
}

export function BankrollChart({ bankrollHistory, currentBalance }: BankrollChartProps) {
  const [timeRange, setTimeRange] = React.useState<'all' | 'session' | 'last100'>('session');

  // Filter data based on time range
  const getFilteredData = () => {
    if (timeRange === 'all') {
      return bankrollHistory;
    } else if (timeRange === 'last100') {
      return bankrollHistory.slice(-100);
    } else {
      // Session: data from current session (last N hours)
      const sessionStart = Date.now() - 4 * 60 * 60 * 1000; // Last 4 hours
      return bankrollHistory.filter(snapshot => snapshot.timestamp >= sessionStart);
    }
  };

  const data = getFilteredData();

  if (data.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <span className="text-green-400">📈</span> Bankroll Chart
        </h3>
        <div className="text-center py-8">
          <p className="text-gray-400">No bankroll data yet</p>
          <p className="text-sm text-gray-500 mt-2">Play some hands to see your bankroll progress</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <span className="text-green-400">📈</span> Bankroll Chart
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setTimeRange('session')}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              timeRange === 'session'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Session
          </button>
          <button
            onClick={() => setTimeRange('last100')}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              timeRange === 'last100'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Last 100
          </button>
          <button
            onClick={() => setTimeRange('all')}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              timeRange === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Chart */}
      <SimpleLineChart data={data} currentBalance={currentBalance} />

      {/* Stats Below Chart */}
      <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
        <div className="text-center">
          <div className="text-gray-400">Starting</div>
          <div className="text-white font-semibold">${data[0].balance.toFixed(2)}</div>
        </div>
        <div className="text-center">
          <div className="text-gray-400">Current</div>
          <div className="text-white font-semibold">${currentBalance.toFixed(2)}</div>
        </div>
        <div className="text-center">
          <div className="text-gray-400">Change</div>
          <div
            className={`font-semibold ${
              currentBalance - data[0].balance >= 0 ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {currentBalance - data[0].balance >= 0 ? '+' : ''}$
            {(currentBalance - data[0].balance).toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}

interface SimpleLineChartProps {
  data: BankrollSnapshot[];
  currentBalance: number;
}

function SimpleLineChart({ data, currentBalance }: SimpleLineChartProps) {
  const width = 800;
  const height = 300;
  const padding = { top: 20, right: 20, bottom: 40, left: 60 };

  // Calculate bounds
  const balances = data.map(d => d.balance);
  const minBalance = Math.min(...balances, currentBalance);
  const maxBalance = Math.max(...balances, currentBalance);
  const balanceRange = maxBalance - minBalance || 100; // Prevent division by zero

  // Add some padding to the y-axis
  const yMin = minBalance - balanceRange * 0.1;
  const yMax = maxBalance + balanceRange * 0.1;
  const yRange = yMax - yMin;

  // Calculate chart dimensions
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Scale functions
  const scaleX = (index: number) => {
    return padding.left + (index / (data.length - 1 || 1)) * chartWidth;
  };

  const scaleY = (balance: number) => {
    return padding.top + chartHeight - ((balance - yMin) / yRange) * chartHeight;
  };

  // Generate path
  const pathData = data
    .map((point, index) => {
      const x = scaleX(index);
      const y = scaleY(point.balance);
      return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    })
    .join(' ');

  // Generate Y-axis labels
  const yAxisLabels = [yMin, (yMin + yMax) / 2, yMax].map(value => ({
    value: `$${value.toFixed(0)}`,
    y: scaleY(value),
  }));

  // Generate X-axis labels (show first, middle, last)
  const xAxisLabels = [];
  if (data.length > 0) {
    xAxisLabels.push({
      label: 'Start',
      x: scaleX(0),
    });
    if (data.length > 2) {
      xAxisLabels.push({
        label: `${Math.floor(data.length / 2)} hands`,
        x: scaleX(Math.floor(data.length / 2)),
      });
    }
    if (data.length > 1) {
      xAxisLabels.push({
        label: `${data.length} hands`,
        x: scaleX(data.length - 1),
      });
    }
  }

  // Starting balance line
  const startBalance = data[0]?.balance || 0;
  const startBalanceY = scaleY(startBalance);

  return (
    <div className="overflow-x-auto">
      <svg width={width} height={height} className="w-full" viewBox={`0 0 ${width} ${height}`}>
        {/* Background grid */}
        <g opacity="0.1">
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
            <line
              key={`grid-${i}`}
              x1={padding.left}
              y1={padding.top + chartHeight * ratio}
              x2={width - padding.right}
              y2={padding.top + chartHeight * ratio}
              stroke="white"
              strokeWidth="1"
            />
          ))}
        </g>

        {/* Starting balance reference line */}
        <line
          x1={padding.left}
          y1={startBalanceY}
          x2={width - padding.right}
          y2={startBalanceY}
          stroke="#6366f1"
          strokeWidth="1"
          strokeDasharray="4 4"
          opacity="0.5"
        />

        {/* Line chart */}
        <path d={pathData} fill="none" stroke="#10b981" strokeWidth="2" />

        {/* Data points */}
        {data.map((point, index) => (
          <circle
            key={index}
            cx={scaleX(index)}
            cy={scaleY(point.balance)}
            r="3"
            fill="#10b981"
            stroke="#1f2937"
            strokeWidth="1"
          />
        ))}

        {/* Y-axis */}
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={height - padding.bottom}
          stroke="#4b5563"
          strokeWidth="1"
        />

        {/* Y-axis labels */}
        {yAxisLabels.map((label, i) => (
          <text
            key={`y-${i}`}
            x={padding.left - 10}
            y={label.y}
            textAnchor="end"
            alignmentBaseline="middle"
            fill="#9ca3af"
            fontSize="12"
          >
            {label.value}
          </text>
        ))}

        {/* X-axis */}
        <line
          x1={padding.left}
          y1={height - padding.bottom}
          x2={width - padding.right}
          y2={height - padding.bottom}
          stroke="#4b5563"
          strokeWidth="1"
        />

        {/* X-axis labels */}
        {xAxisLabels.map((label, i) => (
          <text
            key={`x-${i}`}
            x={label.x}
            y={height - padding.bottom + 20}
            textAnchor="middle"
            fill="#9ca3af"
            fontSize="12"
          >
            {label.label}
          </text>
        ))}
      </svg>
    </div>
  );
}
