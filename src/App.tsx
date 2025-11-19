import { useReducer, useEffect, useState } from 'react';
import { gameReducer, createInitialState, GameState, DifficultyLevel } from './lib/gameState';
import { GAME_PHASES, GameConfig } from './lib/types';
import { isPair } from './lib/deck';
import {
  DEAL_DELAY_MS,
  DEALER_TURN_DELAY_MS,
  CONFIRM_RESET_BALANCE,
  INITIAL_HAND_SIZE,
  INSURANCE_BET_DIVISOR,
  FIRST_INDEX,
  ZERO,
} from './lib/constants';
import BettingControls from './components/BettingControls';
import GameResult from './components/GameResult';
import Settings from './components/Settings';
import TableRules from './components/TableRules';
import ConfigurationManager from './components/ConfigurationManager';
import Header from './components/header/Header';
import GameTable from './components/game/GameTable';
import StrategyChart from './components/learning/StrategyChart';
import MistakesViewer from './components/learning/MistakesViewer';
import { SpeedTrainingControls } from './components/speedtraining/SpeedTrainingControls';
import { SpeedTrainingStats } from './components/speedtraining/SpeedTrainingStats';
import { DecisionTimer } from './components/speedtraining/DecisionTimer';
import { SessionSummary } from './components/speedtraining/SessionSummary';
import { StatisticsModal } from './components/statistics/StatisticsModal';

function App() {
  const [state, dispatch] = useReducer(gameReducer, null as unknown as GameState, createInitialState);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tableRulesOpen, setTableRulesOpen] = useState(false);
  const [configManagerOpen, setConfigManagerOpen] = useState(false);
  const [strategyChartOpen, setStrategyChartOpen] = useState(false);
  const [mistakesViewerOpen, setMistakesViewerOpen] = useState(false);
  const [speedTrainingOpen, setSpeedTrainingOpen] = useState(false);
  const [sessionSummaryOpen, setSessionSummaryOpen] = useState(false);
  const [statisticsOpen, setStatisticsOpen] = useState(false);
  const [lastCompletedSession, setLastCompletedSession] = useState<typeof state.speedTraining.currentSession | null>(null);

  // Auto-deal after bet is placed
  useEffect(() => {
    if (state.phase === GAME_PHASES.DEALING) {
      const timer = setTimeout(() => {
        dispatch({ type: 'DEAL_INITIAL' });
      }, DEAL_DELAY_MS);
      return () => clearTimeout(timer);
    }
  }, [state.phase]);

  // Auto-play dealer's turn
  useEffect(() => {
    if (state.phase === GAME_PHASES.DEALER_TURN) {
      const timer = setTimeout(() => {
        dispatch({ type: 'DEALER_PLAY' });
      }, DEALER_TURN_DELAY_MS);
      return () => clearTimeout(timer);
    }
  }, [state.phase]);

  // Update strategy hint when game state changes
  useEffect(() => {
    if (state.settings.learningModeEnabled && state.phase === GAME_PHASES.PLAYER_TURN) {
      dispatch({ type: 'UPDATE_STRATEGY_HINT' });
    }
  }, [state.phase, state.activeHandIndex, state.playerHands, state.dealerHand, state.settings.learningModeEnabled]);

  // Start decision timer in speed training mode
  useEffect(() => {
    if (state.speedTraining.isActive && state.phase === GAME_PHASES.PLAYER_TURN && !state.speedTraining.currentDecisionStartTime) {
      dispatch({ type: 'START_DECISION_TIMER' });
    }
  }, [state.speedTraining.isActive, state.phase, state.activeHandIndex, state.speedTraining.currentDecisionStartTime]);

  const handlePlaceBet = (amount: number) => {
    dispatch({ type: 'PLACE_BET', amount });
  };

  const handleHit = () => {
    if (state.speedTraining.isActive && state.speedTraining.currentDecisionStartTime) {
      const timeMs = Date.now() - state.speedTraining.currentDecisionStartTime;
      dispatch({ type: 'RECORD_SPEED_DECISION', action: 'HIT', timeMs });
    } else if (state.settings.learningModeEnabled) {
      dispatch({ type: 'RECORD_DECISION', action: 'HIT' });
    }
    dispatch({ type: 'HIT' });
  };

  const handleStand = () => {
    if (state.speedTraining.isActive && state.speedTraining.currentDecisionStartTime) {
      const timeMs = Date.now() - state.speedTraining.currentDecisionStartTime;
      dispatch({ type: 'RECORD_SPEED_DECISION', action: 'STAND', timeMs });
    } else if (state.settings.learningModeEnabled) {
      dispatch({ type: 'RECORD_DECISION', action: 'STAND' });
    }
    dispatch({ type: 'STAND' });
  };

  const handleDouble = () => {
    if (state.speedTraining.isActive && state.speedTraining.currentDecisionStartTime) {
      const timeMs = Date.now() - state.speedTraining.currentDecisionStartTime;
      dispatch({ type: 'RECORD_SPEED_DECISION', action: 'DOUBLE', timeMs });
    } else if (state.settings.learningModeEnabled) {
      dispatch({ type: 'RECORD_DECISION', action: 'DOUBLE' });
    }
    dispatch({ type: 'DOUBLE' });
  };

  const handleSplit = () => {
    if (state.speedTraining.isActive && state.speedTraining.currentDecisionStartTime) {
      const timeMs = Date.now() - state.speedTraining.currentDecisionStartTime;
      dispatch({ type: 'RECORD_SPEED_DECISION', action: 'SPLIT', timeMs });
    } else if (state.settings.learningModeEnabled) {
      dispatch({ type: 'RECORD_DECISION', action: 'SPLIT' });
    }
    dispatch({ type: 'SPLIT' });
  };

  const handleSurrender = () => {
    if (state.speedTraining.isActive && state.speedTraining.currentDecisionStartTime) {
      const timeMs = Date.now() - state.speedTraining.currentDecisionStartTime;
      dispatch({ type: 'RECORD_SPEED_DECISION', action: 'SURRENDER', timeMs });
    } else if (state.settings.learningModeEnabled) {
      dispatch({ type: 'RECORD_DECISION', action: 'SURRENDER' });
    }
    dispatch({ type: 'SURRENDER' });
  };

  const handleInsurance = () => {
    dispatch({ type: 'INSURANCE' });
  };

  const handleNewGame = () => {
    dispatch({ type: 'NEW_GAME' });
  };

  const handleResetBalance = () => {
    if (confirm(CONFIRM_RESET_BALANCE)) {
      dispatch({ type: 'RESET_BALANCE' });
    }
  };

  const handleUpdateSettings = (settings: Partial<{ autoDeal: boolean; lastBetAmount: number }>) => {
    dispatch({ type: 'UPDATE_SETTINGS', settings });
  };

  const handleUpdateConfig = (config: Partial<GameConfig>) => {
    dispatch({ type: 'UPDATE_CONFIG', config });
  };

  const handleLoadConfig = (config: GameConfig) => {
    dispatch({ type: 'LOAD_CONFIG', config });
  };

  const handleToggleLearningMode = () => {
    dispatch({ type: 'TOGGLE_LEARNING_MODE' });
  };

  const handleClearMistakes = () => {
    dispatch({ type: 'CLEAR_MISTAKES' });
    setMistakesViewerOpen(false);
  };

  // Speed training handlers
  const handleStartSpeedTraining = (
    difficulty: DifficultyLevel,
    handsTarget: number,
    accuracyTarget: number,
    speedTarget: number
  ) => {
    dispatch({ type: 'START_SPEED_TRAINING', difficulty, handsTarget, accuracyTarget, speedTarget });
    setSpeedTrainingOpen(false);
  };

  const handleStopSpeedTraining = () => {
    const currentSession = state.speedTraining.currentSession;
    dispatch({ type: 'STOP_SPEED_TRAINING' });
    if (currentSession) {
      setLastCompletedSession({ ...currentSession, endTime: Date.now() });
      setSessionSummaryOpen(true);
    }
  };

  const handleTimeoutDecision = () => {
    dispatch({ type: 'TIMEOUT_DECISION' });
    // Auto-stand after timeout
    dispatch({ type: 'STAND' });
  };

  // Statistics handlers
  const handleResetSessionStats = () => {
    dispatch({ type: 'RESET_SESSION_STATS' });
  };

  const handleClearAllStats = () => {
    dispatch({ type: 'CLEAR_ALL_STATS' });
  };

  // Determine which actions are available
  const currentHand = state.playerHands[state.activeHandIndex];
  const canDouble = currentHand &&
    currentHand.cards.length === INITIAL_HAND_SIZE &&
    currentHand.bet <= state.balance &&
    (!currentHand.fromSplit || state.config.doubleAfterSplit);

  const canSplit = currentHand &&
    isPair(currentHand.cards) &&
    currentHand.bet <= state.balance &&
    state.playerHands.filter(h => h.fromSplit).length < state.config.maxSplits;

  const canSurrender = currentHand &&
    state.config.surrenderAllowed &&
    currentHand.cards.length === INITIAL_HAND_SIZE &&
    state.playerHands.length === 1;

  const canInsurance = state.phase === GAME_PHASES.PLAYER_TURN &&
    state.config.insuranceAllowed &&
    state.dealerHand.length > ZERO &&
    state.dealerHand[FIRST_INDEX].rank === 'A' &&
    state.insurance === ZERO &&
    state.activeHandIndex === FIRST_INDEX &&
    (state.currentBet / INSURANCE_BET_DIVISOR) <= state.balance;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900 to-green-800">
      <Header
        balance={state.balance}
        onResetBalance={handleResetBalance}
        onOpenConfigurations={() => setConfigManagerOpen(true)}
        onOpenTableRules={() => setTableRulesOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenStatistics={() => setStatisticsOpen(true)}
        learningModeEnabled={state.settings.learningModeEnabled}
        onToggleLearningMode={handleToggleLearningMode}
        onOpenStrategyChart={() => setStrategyChartOpen(true)}
        onOpenMistakes={() => setMistakesViewerOpen(true)}
        onOpenSpeedTraining={() => setSpeedTrainingOpen(true)}
        speedTrainingActive={state.speedTraining.isActive}
      />

      {/* Speed Training UI */}
      {state.speedTraining.isActive && (
        <div className="max-w-6xl mx-auto p-4 space-y-4">
          {/* Decision Timer */}
          {state.phase === GAME_PHASES.PLAYER_TURN && (
            <DecisionTimer
              timeLimit={state.speedTraining.timeLimit}
              startTime={state.speedTraining.currentDecisionStartTime}
              onTimeout={handleTimeoutDecision}
              isActive={state.phase === GAME_PHASES.PLAYER_TURN}
            />
          )}

          {/* Speed Training Stats */}
          <SpeedTrainingStats
            session={state.speedTraining.currentSession}
            difficulty={state.speedTraining.difficulty}
            sessionGoal={state.speedTraining.sessionGoal}
            consecutiveCorrectFast={state.speedTraining.consecutiveCorrectFast}
          />
        </div>
      )}

      <GameTable
        phase={state.phase}
        dealerHand={state.dealerHand}
        playerHands={state.playerHands}
        activeHandIndex={state.activeHandIndex}
        insurance={state.insurance}
        currentHand={currentHand}
        canDouble={canDouble}
        canSplit={canSplit}
        canSurrender={canSurrender}
        canInsurance={canInsurance}
        onHit={handleHit}
        onStand={handleStand}
        onDouble={handleDouble}
        onSplit={handleSplit}
        onSurrender={handleSurrender}
        onInsurance={handleInsurance}
        learningMode={state.learningMode}
        learningModeEnabled={state.settings.learningModeEnabled}
      />

      {/* Betting Modal */}
      {state.phase === GAME_PHASES.BETTING && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="max-w-md w-full mx-4">
            <BettingControls
              balance={state.balance}
              minBet={state.config.minBet}
              maxBet={state.config.maxBet}
              onPlaceBet={handlePlaceBet}
              lastBetAmount={state.settings.lastBetAmount}
            />
          </div>
        </div>
      )}

      {/* Game Result Modal */}
      {state.phase === GAME_PHASES.GAME_OVER && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="max-w-md w-full mx-4">
            <GameResult
              result={state.result}
              message={state.resultMessage}
              onNewGame={handleNewGame}
              autoDeal={state.settings.autoDeal}
              onPlaceBet={handlePlaceBet}
              lastBetAmount={state.settings.lastBetAmount}
            />
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-gray-400 text-xs p-2 text-center">
        {state.config.name} Rules: {state.config.deckCount} decks,
        Dealer {state.config.dealerHitsSoft17 ? 'hits' : 'stands'} on soft 17,
        Blackjack pays {state.config.blackjackPayout[0]}:{state.config.blackjackPayout[1]}
        {state.config.surrenderAllowed && ', Surrender allowed'}
        {state.config.doubleAfterSplit && ', DAS'}
      </div>

      {/* Settings Modal */}
      <Settings
        settings={state.settings}
        onUpdateSettings={handleUpdateSettings}
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      {/* Configuration Manager Modal */}
      <ConfigurationManager
        currentConfig={state.config}
        onLoadConfig={handleLoadConfig}
        isOpen={configManagerOpen}
        onClose={() => setConfigManagerOpen(false)}
      />

      {/* Table Rules Modal */}
      <TableRules
        config={state.config}
        onUpdateConfig={handleUpdateConfig}
        isOpen={tableRulesOpen}
        onClose={() => setTableRulesOpen(false)}
      />

      {/* Strategy Chart Modal */}
      <StrategyChart
        isOpen={strategyChartOpen}
        onClose={() => setStrategyChartOpen(false)}
      />

      {/* Mistakes Viewer Modal */}
      <MistakesViewer
        mistakes={state.learningMode.mistakes}
        isOpen={mistakesViewerOpen}
        onClose={() => setMistakesViewerOpen(false)}
        onClear={handleClearMistakes}
      />

      {/* Speed Training Controls Modal */}
      {speedTrainingOpen && !state.speedTraining.isActive && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="max-w-4xl w-full">
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">⚡ Speed Training</h2>
                <button
                  onClick={() => setSpeedTrainingOpen(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ✕
                </button>
              </div>
              <SpeedTrainingControls
                isActive={state.speedTraining.isActive}
                onStart={handleStartSpeedTraining}
                onStop={handleStopSpeedTraining}
              />
            </div>
          </div>
        </div>
      )}

      {/* Active Speed Training Control */}
      {state.speedTraining.isActive && (
        <div className="fixed bottom-20 left-4 z-40">
          <SpeedTrainingControls
            isActive={state.speedTraining.isActive}
            onStart={handleStartSpeedTraining}
            onStop={handleStopSpeedTraining}
          />
        </div>
      )}

      {/* Session Summary Modal */}
      {sessionSummaryOpen && lastCompletedSession && (
        <SessionSummary
          session={lastCompletedSession}
          sessionGoal={state.speedTraining.sessionGoal}
          onClose={() => {
            setSessionSummaryOpen(false);
            setLastCompletedSession(null);
          }}
          onNewSession={() => {
            setSessionSummaryOpen(false);
            setLastCompletedSession(null);
            setSpeedTrainingOpen(true);
          }}
        />
      )}

      {/* Statistics Modal */}
      {statisticsOpen && (
        <StatisticsModal
          statistics={state.statistics}
          currentBalance={state.balance}
          onClose={() => setStatisticsOpen(false)}
          onResetSession={handleResetSessionStats}
          onClearAll={handleClearAllStats}
        />
      )}
    </div>
  );
}

export default App;
