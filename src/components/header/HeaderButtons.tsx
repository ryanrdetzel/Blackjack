interface HeaderButtonsProps {
  onOpenConfigurations: () => void;
  onOpenTableRules: () => void;
  onOpenSettings: () => void;
  onOpenStatistics?: () => void;
  learningModeEnabled?: boolean;
  onToggleLearningMode?: () => void;
  onOpenStrategyChart?: () => void;
  onOpenMistakes?: () => void;
  onOpenSpeedTraining?: () => void;
  speedTrainingActive?: boolean;
}

export default function HeaderButtons({
  onOpenConfigurations,
  onOpenTableRules,
  onOpenSettings,
  onOpenStatistics,
  learningModeEnabled = false,
  onToggleLearningMode,
  onOpenStrategyChart,
  onOpenMistakes,
  onOpenSpeedTraining,
  speedTrainingActive = false
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

      {/* Speed Training */}
      {onOpenSpeedTraining && (
        <button
          onClick={onOpenSpeedTraining}
          className={`text-2xl px-3 py-1 rounded transition-colors ${
            speedTrainingActive
              ? 'bg-purple-600 hover:bg-purple-700'
              : 'bg-gray-700 hover:bg-gray-600'
          }`}
          title={speedTrainingActive ? 'Speed Training: ACTIVE' : 'Speed Training'}
        >
          ⚡
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

      {/* Statistics */}
      {onOpenStatistics && (
        <button
          onClick={onOpenStatistics}
          className="text-2xl px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded"
          title="Statistics"
        >
          📈
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
