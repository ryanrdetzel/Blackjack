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
- **Milestone 3**: Customizable game configurations
- **Milestone 4**: Strategy hints and learning mode
- **Milestone 5**: Speed training mode
- **Milestone 6**: Statistics and hand history

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

---

Last Updated: 2025-11-18
