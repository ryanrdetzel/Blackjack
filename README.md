# ♠️ Blackjack - Learn & Play

A modern, interactive blackjack game built with React, Vite, and Tailwind CSS. Play realistic blackjack while learning optimal strategy.

## 🎯 Features

### Milestone 1 - Complete! ✅
- ✅ Full blackjack gameplay (hit, stand)
- ✅ Realistic dealer AI (stands on 17)
- ✅ Balance tracking with localStorage persistence
- ✅ Customizable betting ($5-$500)
- ✅ Beautiful card animations
- ✅ Responsive design
- ✅ Standard rules: 6 decks, dealer stands on soft 17, blackjack pays 3:2

### Milestone 2 - Complete! ✅
- ✅ **Double Down**: Double your bet and receive one final card
- ✅ **Split Pairs**: Split matching cards into two separate hands
- ✅ **Insurance**: Protect against dealer blackjack when showing an Ace
- ✅ **Surrender**: Forfeit half your bet to exit a poor hand early
- ✅ **Multi-hand Support**: Play multiple hands simultaneously after splits
- ✅ **Enhanced Card Visuals**: Professional card design with corner markings
- ✅ **Advanced Rules**: Configurable options (double after split, resplit aces, max splits)

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

Open http://localhost:5173 in your browser to play!

## 🎮 How to Play

1. **Place Your Bet**: Use the slider or quick bet buttons to select your wager
2. **Deal Cards**: Cards are automatically dealt after placing your bet
3. **Make Your Decision**:
   - **Hit**: Take another card
   - **Stand**: Keep your current hand and end your turn
   - **Double**: Double your bet and receive exactly one more card
   - **Split**: If you have a pair, split into two separate hands (requires second bet)
   - **Surrender**: Forfeit the hand and recover half your bet
   - **Insurance**: When dealer shows an Ace, bet half your wager that they have blackjack
4. **Dealer Plays**: The dealer automatically plays (hits until 17+)
5. **Win or Lose**: See the result and your updated balance
6. **Play Again**: Click "New Hand" to start another round

## 📋 Game Rules

### Basic Rules
- Standard blackjack rules apply
- 6-deck shoe (reshuffled when < 52 cards remain)
- Dealer stands on all 17s (including soft 17)
- Blackjack pays 3:2
- Starting balance: $1,000
- Minimum bet: $5
- Maximum bet: $500

### Advanced Options
- **Double Down**: Available on any initial two cards
- **Double After Split (DAS)**: Allowed
- **Split**: Up to 3 times (4 hands total)
- **Split Aces**: Receive one card per ace (standard rule)
- **Resplit Aces**: Not allowed (standard rule)
- **Late Surrender**: Allowed (recover half your bet)
- **Insurance**: Available when dealer shows Ace (pays 2:1)

## 🗂️ Project Structure

```
src/
├── components/
│   ├── Card.jsx              # Individual card display
│   ├── Hand.jsx              # Hand display with value calculation
│   ├── BettingControls.jsx  # Betting interface
│   ├── GameControls.jsx     # Hit/Stand buttons
│   └── GameResult.jsx       # End-of-hand result display
├── lib/
│   ├── types.js             # Game constants and types
│   ├── deck.js              # Deck operations and hand calculations
│   ├── rules.js             # Win/lose logic and payouts
│   └── gameState.js         # Game state management (reducer)
├── App.jsx                  # Main game component
├── main.jsx                 # React entry point
└── index.css               # Global styles and Tailwind

PLAN.md                      # Full project roadmap and future features
```

## 🎓 Future Features (See PLAN.md)

- ✅ **Milestone 1**: Basic blackjack game (hit, stand, betting)
- ✅ **Milestone 2**: Double down, split, insurance, surrender
- **Milestone 3**: Customizable game configurations (save/share)
- **Milestone 4**: Learning mode with strategy hints
- **Milestone 5**: Speed training mode
- **Milestone 6**: Statistics and hand history
- **Milestone 7**: Side bets, multi-hand play, achievements
- **Milestone 8**: URL-based state sharing

## 🛠️ Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **pnpm** - Package management
- **LocalStorage** - Balance persistence

## 📝 Development Notes

- All game logic is client-side (no server required)
- Balance persists in browser localStorage
- Deck automatically reshuffles when cards run low
- Game state managed with React useReducer hook

## 🤝 Contributing

This is an educational project. Feel free to explore the code and see how blackjack game logic is implemented!

## 📜 License

MIT