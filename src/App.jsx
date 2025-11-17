import { useReducer, useEffect } from 'react';
import { gameReducer, createInitialState } from './lib/gameState';
import { GAME_PHASES } from './lib/types';
import Hand from './components/Hand';
import BettingControls from './components/BettingControls';
import GameControls from './components/GameControls';
import GameResult from './components/GameResult';

function App() {
  const [state, dispatch] = useReducer(gameReducer, null, createInitialState);

  // Auto-deal after bet is placed
  useEffect(() => {
    if (state.phase === GAME_PHASES.DEALING) {
      const timer = setTimeout(() => {
        dispatch({ type: 'DEAL_INITIAL' });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [state.phase]);

  // Auto-play dealer's turn
  useEffect(() => {
    if (state.phase === GAME_PHASES.DEALER_TURN) {
      const timer = setTimeout(() => {
        dispatch({ type: 'DEALER_PLAY' });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state.phase]);

  const handlePlaceBet = (amount) => {
    dispatch({ type: 'PLACE_BET', amount });
  };

  const handleHit = () => {
    dispatch({ type: 'HIT' });
  };

  const handleStand = () => {
    dispatch({ type: 'STAND' });
  };

  const handleNewGame = () => {
    dispatch({ type: 'NEW_GAME' });
  };

  const handleResetBalance = () => {
    if (confirm('Reset balance to $1000?')) {
      dispatch({ type: 'RESET_BALANCE' });
    }
  };

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
          </div>
        </div>
      </div>

      {/* Game Table */}
      <div className="max-w-6xl mx-auto p-8">
        <div className="space-y-8">
          {/* Dealer's Hand */}
          {state.dealerHand.length > 0 && (
            <div className="flex justify-center">
              <Hand
                cards={state.dealerHand}
                label="Dealer"
                hideFirstCard={state.phase === GAME_PHASES.PLAYER_TURN}
                showValue={true}
              />
            </div>
          )}

          {/* Game Status Area */}
          <div className="flex justify-center min-h-[200px] items-center">
            {state.phase === GAME_PHASES.BETTING && (
              <BettingControls
                balance={state.balance}
                minBet={state.config.minBet}
                maxBet={state.config.maxBet}
                onPlaceBet={handlePlaceBet}
              />
            )}

            {state.phase === GAME_PHASES.DEALING && (
              <div className="text-white text-2xl font-bold animate-pulse">
                Dealing...
              </div>
            )}

            {state.phase === GAME_PHASES.DEALER_TURN && (
              <div className="text-white text-2xl font-bold animate-pulse">
                Dealer's Turn...
              </div>
            )}

            {state.phase === GAME_PHASES.GAME_OVER && (
              <GameResult
                result={state.result}
                message={state.resultMessage}
                onNewGame={handleNewGame}
              />
            )}
          </div>

          {/* Player's Hand */}
          {state.playerHand.length > 0 && (
            <div className="flex justify-center">
              <Hand
                cards={state.playerHand}
                label={`Your Hand (Bet: $${state.currentBet})`}
                showValue={true}
              />
            </div>
          )}

          {/* Player Controls */}
          {state.phase === GAME_PHASES.PLAYER_TURN && (
            <div className="flex justify-center">
              <GameControls
                onHit={handleHit}
                onStand={handleStand}
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
      </div>
    </div>
  );
}

export default App;
