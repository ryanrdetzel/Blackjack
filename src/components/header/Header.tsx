import BalanceDisplay from './BalanceDisplay';
import HeaderButtons from './HeaderButtons';

interface HeaderProps {
  balance: number;
  onResetBalance: () => void;
  onOpenConfigurations: () => void;
  onOpenTableRules: () => void;
  onOpenSettings: () => void;
  learningModeEnabled?: boolean;
  onToggleLearningMode?: () => void;
  onOpenStrategyChart?: () => void;
  onOpenMistakes?: () => void;
  onOpenSpeedTraining?: () => void;
  speedTrainingActive?: boolean;
}

export default function Header({
  balance,
  onResetBalance,
  onOpenConfigurations,
  onOpenTableRules,
  onOpenSettings,
  learningModeEnabled,
  onToggleLearningMode,
  onOpenStrategyChart,
  onOpenMistakes,
  onOpenSpeedTraining,
  speedTrainingActive
}: HeaderProps) {
  return (
    <div className="bg-gray-900 text-white p-4 shadow-lg">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <h1 className="text-3xl font-bold">♠️ Blackjack</h1>
        <div className="flex items-center gap-6">
          <BalanceDisplay balance={balance} onResetBalance={onResetBalance} />
          <HeaderButtons
            onOpenConfigurations={onOpenConfigurations}
            onOpenTableRules={onOpenTableRules}
            onOpenSettings={onOpenSettings}
            learningModeEnabled={learningModeEnabled}
            onToggleLearningMode={onToggleLearningMode}
            onOpenStrategyChart={onOpenStrategyChart}
            onOpenMistakes={onOpenMistakes}
            onOpenSpeedTraining={onOpenSpeedTraining}
            speedTrainingActive={speedTrainingActive}
          />
        </div>
      </div>
    </div>
  );
}
