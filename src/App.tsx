import { useReducer, useEffect, useState } from 'react';
import { gameReducer, createInitialState, GameState } from './lib/gameState';
import { GAME_PHASES, HAND_STATUS, GameConfig } from './lib/types';
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
import Hand from './components/Hand';
import BettingControls from './components/BettingControls';
import GameControls from './components/GameControls';
import GameResult from './components/GameResult';
import Settings from './components/Settings';
import TableRules from './components/TableRules';

function App() {
  const [state, dispatch] = useReducer(gameReducer, null as unknown as GameState, createInitialState);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tableRulesOpen, setTableRulesOpen] = useState(false);

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

  const handlePlaceBet = (amount: number) => {
    dispatch({ type: 'PLACE_BET', amount });
  };

  const handleHit = () => {
    dispatch({ type: 'HIT' });
  };

  const handleStand = () => {
    dispatch({ type: 'STAND' });
  };

  const handleDouble = () => {
    dispatch({ type: 'DOUBLE' });
  };

  const handleSplit = () => {
    dispatch({ type: 'SPLIT' });
  };

  const handleSurrender = () => {
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
      {/* Header */}
      <div className="bg-gray-900 text-white p-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold">♠️ Blackjack</h1>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-sm text-gray-400">Balance</div>
              <div className="text-2xl font-bold text-green-400">${state.balance.toFixed(2)}</div>
            </div>
            <button
              onClick={handleResetBalance}
              className="text-xs px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded"
            >
              Reset
            </button>
            <button
              onClick={() => setTableRulesOpen(true)}
              className="text-2xl px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded"
              title="Table Rules"
            >
              📋
            </button>
            <button
              onClick={() => setSettingsOpen(true)}
              className="text-2xl px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded"
              title="Settings"
            >
              ⚙️
            </button>
          </div>
        </div>
      </div>

      {/* Game Table */}
      <div className="max-w-6xl mx-auto p-8">
        {/* Blackjack Table Felt */}
        <div className="bg-gradient-to-br from-green-800 via-green-700 to-green-800 rounded-3xl shadow-2xl border-8 border-amber-900 p-6 relative">
          {/* Table markings */}
          <div className="absolute inset-0 rounded-2xl border-2 border-green-600 opacity-30 m-2"></div>

          {/* Dealer Area */}
          <div className="bg-green-900/30 rounded-2xl p-4 mb-6 border border-green-600/30">
            <div className="text-center mb-2">
              <span className="text-yellow-300 text-sm font-semibold tracking-wider uppercase">Dealer</span>
            </div>
            <div className="min-h-[240px] flex items-center justify-center">
              {state.dealerHand.length > 0 ? (
                <Hand
                  cards={state.dealerHand}
                  label=""
                  hideFirstCard={state.phase === GAME_PHASES.PLAYER_TURN}
                  showValue={true}
                />
              ) : (
                <div className="text-green-600/50 text-lg">Dealer's cards will appear here</div>
              )}
            </div>
          </div>

          {/* Center Status Area */}
          <div className="flex flex-col items-center justify-center my-4 min-h-[80px]">
            {/* Insurance indicator */}
            {state.insurance > 0 && (
              <div className="text-center text-yellow-300 font-bold mb-2 bg-green-900/50 px-4 py-2 rounded-lg">
                Insurance: ${state.insurance}
              </div>
            )}

            {state.phase === GAME_PHASES.BETTING && (
              <BettingControls
                balance={state.balance}
                minBet={state.config.minBet}
                maxBet={state.config.maxBet}
                onPlaceBet={handlePlaceBet}
                lastBetAmount={state.settings.lastBetAmount}
              />
            )}

            {state.phase === GAME_PHASES.DEALING && (
              <div className="text-yellow-300 text-2xl font-bold animate-pulse">
                Dealing...
              </div>
            )}

            {state.phase === GAME_PHASES.DEALER_TURN && (
              <div className="text-yellow-300 text-2xl font-bold animate-pulse">
                Dealer's Turn...
              </div>
            )}

            {state.phase === GAME_PHASES.GAME_OVER && (
              <GameResult
                result={state.result}
                message={state.resultMessage}
                onNewGame={handleNewGame}
                autoDeal={state.settings.autoDeal}
                onPlaceBet={handlePlaceBet}
                lastBetAmount={state.settings.lastBetAmount}
              />
            )}
          </div>

          {/* Player Area */}
          <div className="bg-green-900/30 rounded-2xl p-4 mt-6 border border-green-600/30">
            <div className="text-center mb-2">
              <span className="text-yellow-300 text-sm font-semibold tracking-wider uppercase">Player</span>
            </div>
            <div className="min-h-[240px] flex items-center justify-center">
              {state.playerHands.length > 0 ? (
                <div className="flex justify-center gap-8 flex-wrap">
                  {state.playerHands.map((hand, index) => {
                    const isActive = index === state.activeHandIndex && state.phase === GAME_PHASES.PLAYER_TURN;
                    const handLabel = state.playerHands.length > 1
                      ? `Hand ${index + 1} (Bet: $${hand.bet})`
                      : `Bet: $${hand.bet}`;

                    return (
                      <div
                        key={index}
                        className={`transition-all ${
                          isActive
                            ? 'ring-4 ring-yellow-400 rounded-lg p-2 shadow-lg shadow-yellow-400/50'
                            : hand.status === HAND_STATUS.BUST
                            ? 'opacity-50'
                            : 'opacity-75'
                        }`}
                      >
                        <Hand
                          cards={hand.cards}
                          label={handLabel}
                          showValue={true}
                        />
                        {hand.status === HAND_STATUS.BUST && (
                          <div className="text-center text-red-400 font-bold mt-2">BUST</div>
                        )}
                        {hand.status === HAND_STATUS.SURRENDER && (
                          <div className="text-center text-orange-400 font-bold mt-2">SURRENDERED</div>
                        )}
                        {hand.doubled && (
                          <div className="text-center text-blue-400 font-semibold mt-1 text-sm">Doubled</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-green-600/50 text-lg">Your cards will appear here</div>
              )}
            </div>
          </div>

          {/* Player Controls */}
          {state.phase === GAME_PHASES.PLAYER_TURN && currentHand && (
            <div className="flex justify-center mt-6">
              <GameControls
                onHit={handleHit}
                onStand={handleStand}
                onDouble={handleDouble}
                onSplit={handleSplit}
                onSurrender={handleSurrender}
                onInsurance={handleInsurance}
                canDouble={canDouble}
                canSplit={canSplit}
                canSurrender={canSurrender}
                canInsurance={canInsurance}
              />
            </div>
          )}
        </div>
      </div>

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

      {/* Table Rules Modal */}
      <TableRules
        config={state.config}
        onUpdateConfig={handleUpdateConfig}
        isOpen={tableRulesOpen}
        onClose={() => setTableRulesOpen(false)}
      />
    </div>
  );
}

export default App;
