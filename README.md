# ♠️ Blackjack - Learn & Play

A modern, interactive blackjack game built with React, Vite, and Tailwind CSS. Play realistic blackjack while learning optimal strategy.

## 🎯 Features

### Core Gameplay ✅
- ✅ Full blackjack with all standard moves (hit, stand, double, split, insurance, surrender)
- ✅ Realistic dealer AI (configurable soft 17 rule)
- ✅ Multi-hand support for splits (up to 4 hands)
- ✅ Beautiful card animations and UI
- ✅ Responsive design for desktop and mobile

### Customization ✅
- ✅ **Preset Configurations**: Vegas Strip, Atlantic City, European, High Roller, and more
- ✅ **Custom Rule Sets**: Customize deck count, dealer rules, payouts, and player options
- ✅ **Save & Load**: Save custom configurations and load them anytime
- ✅ **Export/Import**: Share configurations as JSON files

### Learning & Training ✅
- ✅ **Learning Mode**: Real-time basic strategy hints with color-coded optimal actions
- ✅ **Mistake Tracking**: Track and review suboptimal decisions
- ✅ **Strategy Chart**: Built-in basic strategy reference
- ✅ **Speed Training**: Timed decision-making with progressive difficulty
- ✅ **Accuracy Scoring**: Track decision accuracy and speed over time

### Statistics & History ✅
- ✅ **Session Stats**: Track hands, wins, losses, profit/loss, and streaks
- ✅ **All-Time Stats**: Lifetime statistics across all sessions
- ✅ **Hand History**: Review detailed history of past hands (last 500)
- ✅ **Bankroll Chart**: Visual chart of balance over time
- ✅ **Data Export**: Export statistics and history as CSV/JSON

### Advanced Features ✅
- ✅ **Side Bets**: Perfect Pairs (25:1, 12:1, 6:1) and 21+3 (100:1 to 5:1 payouts)
- ✅ **Card Counting Trainer**: Learn Hi-Lo, KO, Hi-Opt, and Omega II systems
- ✅ **Achievement System**: 30+ achievements across gameplay, strategy, and progression
- ✅ **Dark/Light Theme**: Toggle between light and dark modes
- ✅ **Sound Effects**: Generated sound effects for all game actions

### Sharing & Portability ✅
- ✅ **URL Sharing**: Share your game state via encoded URLs
- ✅ **QR Codes**: Generate QR codes for easy mobile transfer
- ✅ **Complete Export**: Export entire game state including all progress
- ✅ **Import**: Load previously exported game states

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

## 🎓 All Milestones Complete! 🎉

- ✅ **Milestone 1**: Basic blackjack game (hit, stand, betting)
- ✅ **Milestone 2**: Double down, split, insurance, surrender
- ✅ **Milestone 3**: Customizable game configurations (save/share)
- ✅ **Milestone 4**: Learning mode with strategy hints
- ✅ **Milestone 5**: Speed training mode
- ✅ **Milestone 6**: Statistics and hand history
- ✅ **Milestone 7**: Side bets, card counting, achievements, themes
- ✅ **Milestone 8**: URL sharing, QR codes, full export/import

See `PLAN.md` and `CLAUDE.md` for detailed feature documentation.

## 🛠️ Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **pnpm** - Package management
- **LocalStorage** - Balance persistence

## 📝 Development Notes

- All game logic is client-side (no server required)
- Balance, statistics, and preferences persist in browser localStorage
- Deck automatically reshuffles when cards run low
- Game state managed with React useReducer hook
- Theme system uses CSS custom properties
- Sound effects generated using Web Audio API
- All data can be exported/imported or shared via URL

## 🎮 Key Features Overview

### 🎴 Game Modes
- **Play Mode**: Classic blackjack with all standard options
- **Learning Mode**: Get real-time strategy hints and track mistakes
- **Speed Training**: Practice quick decision-making under time pressure
- **Card Counting**: Learn and practice various counting systems

### 📊 Tracking & Analytics
- Comprehensive statistics (session and all-time)
- Hand-by-hand history viewer
- Visual bankroll chart
- Strategy accuracy tracking
- Speed training performance metrics

### 🎨 Customization
- 7 preset rule configurations
- Create and save custom rule sets
- Dark and light themes
- Configurable sound effects
- Side bets (Perfect Pairs & 21+3)

### 🏆 Achievements
- 30+ achievements to unlock
- 5 rarity tiers (Common to Legendary)
- Categories: Gameplay, Strategy, Progression, Special
- Progress tracking and filtering

## 🤝 Contributing

This is an educational project. Feel free to explore the code and see how blackjack game logic is implemented!

## 📜 License

MIT