# Claude Development Notes

This document contains development notes, architectural decisions, and guidelines for working with this Blackjack game project.

## Project Overview

This is a modern, interactive Blackjack game built with:
- **React 18** - Component-based UI
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **TypeScript** - Type safety (configured but primarily JSX)

## Architecture

### State Management
The game uses React's `useReducer` hook for centralized state management. All game logic is handled through actions dispatched to the reducer in `src/lib/gameState.js`.

### Code Organization

```
src/
├── components/        # React components (UI)
├── lib/              # Core game logic (pure functions)
│   ├── types.js      # Constants and enums
│   ├── deck.js       # Card/deck operations
│   ├── rules.js      # Game rules and payouts
│   └── gameState.js  # State reducer
├── App.jsx           # Main game orchestration
└── index.css         # Tailwind + custom styles
```

**Key Principle**: UI components are separated from game logic. Business logic lives in `lib/`, components handle rendering and user interaction.

### Key Files

- **`src/lib/deck.js`**: Card generation, shuffling, hand value calculation
- **`src/lib/rules.js`**: Win conditions, payouts, available actions
- **`src/lib/gameState.js`**: Game state reducer with all action handlers
- **`src/App.jsx`**: Main game component that orchestrates everything
- **`src/components/Hand.jsx`**: Displays cards and calculates hand values

## Development Guidelines

### When Adding New Features

1. **Add constants** to `src/lib/types.js` if needed
2. **Add game logic** to appropriate `lib/` file (pure functions)
3. **Add reducer action** to `src/lib/gameState.js` if state changes
4. **Update components** to use new logic
5. **Test edge cases** thoroughly (splits, multiple hands, etc.)

### Common Patterns

#### Handling Multi-Hand State
After splits, the game maintains an array of hands. Always consider:
- Which hand is currently active (`state.currentHandIndex`)
- Whether an action applies to all hands or just current hand
- How dealer hand interacts with multiple player hands

#### Card Values
- Aces are handled dynamically (soft vs hard hands)
- Hand value calculation is in `calculateHandValue()` in `deck.js`
- Always accounts for multiple aces

#### Balance Management
- Balance persists in localStorage
- All bets/payouts happen through state reducer
- Never modify balance directly in components

### Testing Considerations

#### Edge Cases to Test
- Splitting aces (should only get one card per ace)
- Splitting into multiple hands (up to 4 hands)
- Double down after split (DAS rule)
- Insurance payouts (2:1) when dealer has blackjack
- Surrender (return half bet)
- Blackjack pays 3:2
- Deck reshuffling when < 52 cards remain

#### Game Flow States
```
BETTING → DEALING → PLAYING → DEALER_TURN → SHOWING_RESULT
```

## Completed Milestones

### Milestone 1 ✅
Basic gameplay: hit, stand, betting, dealer AI, balance tracking, card animations

### Milestone 2 ✅
Advanced moves: double down, split pairs, insurance, surrender, multi-hand support

### Milestone 3 ✅
Customization system: preset configurations (Vegas Strip, Atlantic City, European, etc.), save/load custom configurations, export/import JSON, configuration manager UI

### Milestone 4 ✅
Learning Mode - Basic Strategy: real-time strategy hints, color-coded optimal actions, mistake tracking, post-hand analysis, strategy chart viewer

### Milestone 5 ✅
Learning Mode - Speed Training: decision timer, progressive difficulty, accuracy + speed scoring, performance statistics, training sessions

### Milestone 6 ✅
Statistics & History: session and all-time statistics, hand history viewer, bankroll chart, data export (CSV/JSON), comprehensive performance metrics

## Current Architecture Decisions

### Why useReducer?
- Centralizes complex game state logic
- Makes state transitions predictable and testable
- Easier to debug with action logging

### Why No Backend?
- Educational/portfolio project
- All logic can run client-side
- localStorage sufficient for persistence
- Enables easy deployment (static hosting)

### Why 6 Decks?
- Standard casino practice
- Reduces card counting effectiveness
- Provides enough cards for multiple rounds

## Development Commands

```bash
# Install dependencies
pnpm install

# Start dev server (http://localhost:5173)
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Future Development Notes

See `PLAN.md` for detailed roadmap. Key upcoming features:
- **Milestone 7**: Advanced features (side bets, card counting, achievements)
- **Milestone 8**: Sharing & portability (URL encoding, QR codes)

## Tips for Claude Sessions

### Quick Exploration
- Start with `README.md` for project overview
- Check `PLAN.md` for roadmap and future features
- Review `src/lib/gameState.js` to understand state structure

### Making Changes
- Always read existing files before editing
- Test in browser after changes (especially game logic)
- Consider multi-hand scenarios (splits) when modifying state
- Update relevant documentation if adding major features

### Common Issues
- **Card not showing?** Check card rendering logic in `Card.jsx`
- **Hand value wrong?** Debug `calculateHandValue()` in `deck.js`
- **Action not available?** Check `getAvailableActions()` in `rules.js`
- **State not updating?** Verify reducer action in `gameState.js`

## Project Goals

1. **Educational**: Teach blackjack strategy
2. **Realistic**: Follow actual casino rules
3. **Modern**: Showcase React best practices
4. **Maintainable**: Clean, well-organized code
5. **Extensible**: Easy to add new features

## Milestone 3 Implementation Details

### Configuration System
- **Location**: `src/lib/configManager.ts` - Helper functions for saving/loading configurations
- **Presets**: Six preset configurations available in `src/lib/types.ts` (PRESET_CONFIGS)
  - Standard (default)
  - Vegas Strip
  - Atlantic City
  - European
  - Liberal Rules
  - Vegas Downtown (6:5)
  - High Roller
- **UI**: `src/components/ConfigurationManager.tsx` - Full-featured configuration manager
- **Actions**: `LOAD_CONFIG` action in `src/lib/gameState.ts` for loading complete configurations
- **Storage**: Custom configurations saved to localStorage with key `blackjack_saved_configs`

### Features
- Load preset configurations
- Save current configuration with custom name
- Delete custom configurations (presets are read-only)
- Duplicate any configuration
- Export configuration as JSON file
- Import configuration from JSON file
- Configuration validation on import
- Automatic name uniqueness handling

---

## Milestone 6 Implementation Details

### Statistics System
- **Location**: `src/lib/statistics.ts` - Complete statistics tracking system with data models and helper functions
- **State Integration**: Statistics state added to `GameState` in `src/lib/gameState.ts`
- **Storage Keys**:
  - `blackjack_statistics` - All-time statistics
  - `blackjack_hand_history` - Hand history records (last 500 hands)
  - `blackjack_bankroll_history` - Bankroll snapshots (last 1000 snapshots)

### Components
- **StatisticsModal** (`src/components/statistics/StatisticsModal.tsx`) - Main modal with tabbed interface
- **StatisticsDashboard** (`src/components/statistics/StatisticsDashboard.tsx`) - Session and all-time statistics dashboard
- **HandHistoryViewer** (`src/components/statistics/HandHistoryViewer.tsx`) - Detailed hand history with filtering and sorting
- **BankrollChart** (`src/components/statistics/BankrollChart.tsx`) - SVG-based line chart for bankroll visualization

### Statistics Tracked

#### Session Statistics
- Hands played, won, lost, pushed
- Blackjacks hit
- Total wagered, total payout, net profit
- Biggest win/loss
- Win/loss streaks (current and longest)
- Splits, doubles, surrenders performed
- Insurance taken and won
- Session duration

#### All-Time Statistics
- All session stats aggregated across all sessions
- Sessions played
- First and last played timestamps
- Lifetime totals for all metrics

#### Hand History
- Complete record of each hand played
- Player hands with cards, bets, results, and payouts
- Dealer hand
- Insurance amount
- Configuration used
- Timestamp

#### Bankroll History
- Balance snapshot after each hand
- Timestamp and hand ID reference
- Used for charting balance over time

### Features
- **Real-time tracking**: All actions (hit, stand, double, split, surrender) automatically tracked
- **Session management**: Start new sessions while preserving all-time stats
- **Data persistence**: All statistics saved to localStorage
- **Export functionality**:
  - Complete statistics as JSON
  - Hand history as CSV
  - Session statistics as CSV
- **Visualization**: Interactive bankroll chart with multiple time ranges
- **Hand detail view**: Click any hand in history to see full details
- **Filtering**: Filter hand history by wins/losses
- **Clear all**: Option to completely reset all statistics

### Actions
- `RESET_SESSION_STATS` - Start a new session (increments session count)
- `CLEAR_ALL_STATS` - Clear all statistics and history

### Integration Points
- Statistics automatically recorded in `DEALER_PLAY` action when hand completes
- Split, double, surrender actions tracked as they occur
- Balance snapshots recorded after each hand
- Accessible via Statistics button (📈) in header

---

Last Updated: 2025-11-19
