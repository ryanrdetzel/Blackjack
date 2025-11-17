export default function GameControls({
  onHit,
  onStand,
  onDouble,
  onSplit,
  onSurrender,
  onInsurance,
  canDouble = false,
  canSplit = false,
  canSurrender = false,
  canInsurance = false,
  disabled = false,
}) {
  return (
    <div className="space-y-3">
      {/* Insurance option (if available) */}
      {canInsurance && (
        <div className="flex justify-center">
          <button
            onClick={onInsurance}
            disabled={disabled}
            className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Insurance (Half Bet)
          </button>
        </div>
      )}

      {/* Main action buttons */}
      <div className="flex gap-3 justify-center flex-wrap">
        <button
          onClick={onHit}
          disabled={disabled}
          className="btn-primary"
        >
          Hit
        </button>
        <button
          onClick={onStand}
          disabled={disabled}
          className="btn-secondary"
        >
          Stand
        </button>
        {canDouble && (
          <button
            onClick={onDouble}
            disabled={disabled}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Double
          </button>
        )}
        {canSplit && (
          <button
            onClick={onSplit}
            disabled={disabled}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Split
          </button>
        )}
        {canSurrender && (
          <button
            onClick={onSurrender}
            disabled={disabled}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Surrender
          </button>
        )}
      </div>
    </div>
  );
}
