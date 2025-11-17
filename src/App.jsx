import { useReducer, useEffect } from 'react';
import { gameReducer, createInitialState } from './lib/gameState';
import { GAME_PHASES, HAND_STATUS } from './lib/types';
import { isPair } from './lib/deck';
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
    if (confirm('Reset balance to $1000?')) {
      dispatch({ type: 'RESET_BALANCE' });
    }
  };

  // Determine which actions are available
  const currentHand = state.playerHands[state.activeHandIndex];
  const canDouble = currentHand &&
    currentHand.cards.length === 2 &&
    currentHand.bet <= state.balance &&
    (!currentHand.fromSplit || state.config.doubleAfterSplit);

  const canSplit = currentHand &&
    isPair(currentHand.cards) &&
    currentHand.bet <= state.balance &&
    state.playerHands.filter(h => h.fromSplit).length < state.config.maxSplits;

  const canSurrender = currentHand &&
    state.config.surrenderAllowed &&
    currentHand.cards.length === 2 &&
    state.playerHands.length === 1;

  const canInsurance = state.phase === GAME_PHASES.PLAYER_TURN &&
    state.config.insuranceAllowed &&
    state.dealerHand.length > 0 &&
    state.dealerHand[0].rank === 'A' &&
    state.insurance === 0 &&
    state.activeHandIndex === 0 &&
    (state.currentBet / 2) <= state.balance;

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

          {/* Insurance indicator */}
          {state.insurance > 0 && (
            <div className="text-center text-yellow-300 font-bold">
              Insurance: ${state.insurance}
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

          {/* Player's Hands */}
          {state.playerHands.length > 0 && (
            <div className="flex justify-center gap-8 flex-wrap">
              {state.playerHands.map((hand, index) => {
                const isActive = index === state.activeHandIndex && state.phase === GAME_PHASES.PLAYER_TURN;
                const handLabel = state.playerHands.length > 1
                  ? `Hand ${index + 1} (Bet: $${hand.bet})`
                  : `Your Hand (Bet: $${hand.bet})`;

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
                      status={hand.status}
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
          )}

          {/* Player Controls */}
          {state.phase === GAME_PHASES.PLAYER_TURN && currentHand && (
            <div className="flex justify-center">
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
    </div>
  );
}

export default App;
