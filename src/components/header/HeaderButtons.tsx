interface HeaderButtonsProps {
  onOpenConfigurations: () => void;
  onOpenTableRules: () => void;
  onOpenSettings: () => void;
  learningModeEnabled?: boolean;
  onToggleLearningMode?: () => void;
  onOpenStrategyChart?: () => void;
  onOpenMistakes?: () => void;
}

export default function HeaderButtons({
  onOpenConfigurations,
  onOpenTableRules,
  onOpenSettings,
  learningModeEnabled = false,
  onToggleLearningMode,
  onOpenStrategyChart,
  onOpenMistakes
}: HeaderButtonsProps) {
  return (
    <div className="flex items-center gap-2">
      {/* Learning Mode Toggle */}
      {onToggleLearningMode && (
        <button
          onClick={onToggleLearningMode}
          className={`text-2xl px-3 py-1 rounded transition-colors ${
            learningModeEnabled
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-gray-700 hover:bg-gray-600'
          }`}
          title={learningModeEnabled ? 'Learning Mode: ON' : 'Learning Mode: OFF'}
        >
          🎓
        </button>
      )}

      {/* Strategy Chart */}
      {onOpenStrategyChart && learningModeEnabled && (
        <button
          onClick={onOpenStrategyChart}
          className="text-2xl px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded"
          title="Strategy Chart"
        >
          📊
        </button>
      )}

      {/* Mistakes Log */}
      {onOpenMistakes && learningModeEnabled && (
        <button
          onClick={onOpenMistakes}
          className="text-2xl px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded"
          title="View Mistakes"
        >
          📝
        </button>
      )}

      <button
        onClick={onOpenConfigurations}
        className="text-2xl px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded"
        title="Configurations"
      >
        🎮
      </button>
      <button
        onClick={onOpenTableRules}
        className="text-2xl px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded"
        title="Table Rules"
      >
        📋
      </button>
      <button
        onClick={onOpenSettings}
        className="text-2xl px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded"
        title="Settings"
      >
        ⚙️
      </button>
    </div>
  );
}
