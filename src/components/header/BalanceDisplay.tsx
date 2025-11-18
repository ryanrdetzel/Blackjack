interface BalanceDisplayProps {
  balance: number;
  onResetBalance: () => void;
}

export default function BalanceDisplay({ balance, onResetBalance }: BalanceDisplayProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="text-right">
        <div className="text-sm text-gray-400">Balance</div>
        <div className="text-2xl font-bold text-green-400">${balance.toFixed(2)}</div>
      </div>
      <button
        onClick={onResetBalance}
        className="text-xs px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded"
      >
        Reset
      </button>
    </div>
  );
}
