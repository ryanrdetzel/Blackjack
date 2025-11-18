import { useReducer, useEffect, useState } from 'react';
import { gameReducer, createInitialState, GameState } from './lib/gameState';
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

function App() {
  const [state, dispatch] = useReducer(gameReducer, null as unknown as GameState, createInitialState);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tableRulesOpen, setTableRulesOpen] = useState(false);
  const [configManagerOpen, setConfigManagerOpen] = useState(false);
  const [strategyChartOpen, setStrategyChartOpen] = useState(false);
  const [mistakesViewerOpen, setMistakesViewerOpen] = useState(false);

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

  const handlePlaceBet = (amount: number) => {
    dispatch({ type: 'PLACE_BET', amount });
  };

  const handleHit = () => {
    if (state.settings.learningModeEnabled) {
      dispatch({ type: 'RECORD_DECISION', action: 'HIT' });
    }
    dispatch({ type: 'HIT' });
  };

  const handleStand = () => {
    if (state.settings.learningModeEnabled) {
      dispatch({ type: 'RECORD_DECISION', action: 'STAND' });
    }
    dispatch({ type: 'STAND' });
  };

  const handleDouble = () => {
    if (state.settings.learningModeEnabled) {
      dispatch({ type: 'RECORD_DECISION', action: 'DOUBLE' });
    }
    dispatch({ type: 'DOUBLE' });
  };

  const handleSplit = () => {
    if (state.settings.learningModeEnabled) {
      dispatch({ type: 'RECORD_DECISION', action: 'SPLIT' });
    }
    dispatch({ type: 'SPLIT' });
  };

  const handleSurrender = () => {
    if (state.settings.learningModeEnabled) {
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
        learningModeEnabled={state.settings.learningModeEnabled}
        onToggleLearningMode={handleToggleLearningMode}
        onOpenStrategyChart={() => setStrategyChartOpen(true)}
        onOpenMistakes={() => setMistakesViewerOpen(true)}
      />

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
    </div>
  );
}

export default App;
