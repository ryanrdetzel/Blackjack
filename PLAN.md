# Blackjack Game - Project Plan

## Overview
A modern, client-side blackjack game built with React that serves dual purposes:
1. **Play**: Realistic blackjack simulation with customizable rules
2. **Learn**: Interactive training modes to improve strategy and decision-making speed

## Core Philosophy
- **Client-only**: All game logic runs in the browser, no server required
- **Portable**: State can be shared via URLs (future)
- **Customizable**: Create and share casino-specific rule configurations
- **Educational**: Help players learn optimal strategy and improve decision speed

## Tech Stack
- **Build Tool**: Vite (fast dev server, optimized builds)
- **Package Manager**: pnpm (efficient, fast)
- **Framework**: React 18+ (with hooks)
- **Styling**: Tailwind CSS (utility-first, responsive)
- **State Management**:
  - Local game state: React hooks (useState, useReducer)
  - Persistent state: localStorage
  - Future: URL state encoding for sharing
- **Type Safety**: TypeScript (recommended for game logic)
- **Testing**: Vitest (future)

## Architecture Decisions

### State Management Strategy
```
┌─────────────────────────────────────────┐
│         Browser Storage                 │
├─────────────────────────────────────────┤
│ • User balance                          │
│ • Game configurations (named presets)   │
│ • Statistics & history                  │
│ • Learning mode progress                │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│       React Application State           │
├─────────────────────────────────────────┤
│ • Current game state                    │
│ • Active hand(s)                        │
│ • Deck state                            │
│ • UI state (modals, animations)         │
└─────────────────────────────────────────┘
```

### Game Configuration System
Configurations should be JSON serializable and contain:
- Number of decks (1, 2, 4, 6, 8)
- Dealer rules (hit/stand on soft 17)
- Payout ratios (blackjack pays 3:2, 6:5, etc.)
- Split rules (resplit aces, max splits)
- Double down rules (any two cards, 9-11 only, after split)
- Surrender option (early/late)
- Insurance availability
- Side bets (future)

### URL Encoding Strategy (Future)
```
https://app.com/?s={base64_encoded_state}
- Balance
- Active configuration name/hash
- Optional: Statistics snapshot
```

## Milestones

### Milestone 1: Basic Blackjack Game ✓ TARGET
**Goal**: Single-player blackjack game with core mechanics

**Features**:
- ✓ Deal initial cards (player gets 2, dealer gets 2 with 1 face down)
- ✓ Player actions: Hit, Stand
- ✓ Dealer logic: Reveal hidden card, hit until 17+
- ✓ Win/lose determination
- ✓ Simple UI with cards displayed
- ✓ Basic balance tracking (starts at $1000)
- ✓ Betting before each hand

**Scope**:
- Single player vs dealer
- Standard 6-deck shoe
- Standard rules (dealer stands on 17, blackjack pays 3:2)
- No splits, doubles, or insurance yet
- Basic card display (can be simple text/numbers)

**Technical Tasks**:
1. Initialize Vite + React + Tailwind project
2. Create core game types/interfaces
3. Implement card deck logic (shuffle, draw)
4. Build game state reducer
5. Create basic UI components (Table, Card, Controls)
6. Implement game flow logic
7. Add simple animations/transitions

---

### Milestone 2: Complete Blackjack Rules ✓ COMPLETE
**Goal**: Full-featured blackjack with all standard options

**Features**:
- ✓ Double down (2x bet, receive 1 card, end turn)
- ✓ Split pairs (create two hands, separate bets)
- ✓ Insurance (when dealer shows Ace)
- ✓ Surrender (forfeit half bet)
- ✓ Multi-hand support (after splits)
- ✓ Better card visuals (suit symbols, face cards)

**Technical Tasks**:
- ✓ Extend game state to handle multiple hands
- ✓ Implement split/double logic
- ✓ Add insurance and surrender options
- ✓ Improve UI for multiple hands
- ✓ Add hand comparison logic (push scenarios)

---

### Milestone 3: Customization System
**Goal**: Create, save, and manage game configurations

**Features**:
- Configuration editor UI
- Save configurations with names (localStorage)
- Load/switch between configurations
- Export configuration as JSON
- Import configuration from JSON
- Preset configurations (Vegas Strip, Atlantic City, European, etc.)

**Configuration Options**:
- Deck count (1-8)
- Dealer hits/stands on soft 17
- Blackjack payout (3:2, 6:5, 2:1)
- Double after split allowed
- Resplit aces allowed
- Maximum splits
- Late surrender allowed
- Insurance available

**Technical Tasks**:
- Create configuration schema
- Build configuration editor UI
- Implement localStorage save/load
- Create preset configurations
- Add configuration validation

---

### Milestone 4: Learning Mode - Basic Strategy
**Goal**: Help players learn optimal basic strategy

**Features**:
- Toggle learning mode on/off
- Real-time strategy hints
  - Show optimal action for current hand
  - Color-code buttons (green=optimal, yellow=acceptable, red=poor)
- Basic strategy chart viewer
- Mistake tracking
- Post-hand analysis (what you did vs what you should have done)

**Learning Features**:
- Strategy hint system
- Mistake counter and log
- Expected value display for each action
- Strategy deviation tracker

**Technical Tasks**:
- Implement basic strategy engine
- Create strategy lookup tables
- Build hint UI components
- Add mistake tracking system
- Create strategy chart component

---

### Milestone 5: Learning Mode - Speed Training
**Goal**: Improve decision-making speed while maintaining accuracy

**Features**:
- Speed training mode
- Decision timer (countdown for each decision)
- Accuracy + speed scoring
- Progressive difficulty (timer gets shorter)
- Training sessions with goals
- Performance statistics and graphs

**Metrics**:
- Average decision time
- Accuracy percentage
- Speed improvement over time
- Streak tracking

**Technical Tasks**:
- Implement timer system
- Create scoring algorithm
- Build performance tracking
- Add statistics visualization
- Create training session manager

---

### Milestone 6: Statistics & History
**Goal**: Track performance and provide insights

**Features**:
- Session statistics
- All-time statistics
- Hand history viewer
- Bankroll chart over time
- Win/loss streaks
- Performance by bet size
- Learning mode progress tracking

**Statistics Tracked**:
- Hands played
- Win/loss/push counts
- Blackjacks hit
- Total wagered
- Net profit/loss
- Biggest win/loss
- Average bet size
- Strategy accuracy (in learning mode)

**Technical Tasks**:
- Design statistics schema
- Implement data collection
- Build statistics dashboard
- Create visualization components
- Add data export (CSV/JSON)

---

### Milestone 7: Advanced Features
**Goal**: Polish and advanced functionality

**Features**:
- Side bets (Perfect Pairs, 21+3)
- Multiple simultaneous hands (play 2-3 hands at once)
- Card counting trainer (separate mode)
- Realistic shuffle/cut card simulation
- Achievement system
- Sound effects and animations
- Mobile-responsive design
- Dark/light theme

---

### Milestone 8: Sharing & Portability
**Goal**: Enable state and configuration sharing

**Features**:
- URL encoding for balance/config
- QR code generation for mobile transfer
- Configuration marketplace/community (future: backend)
- Export/import entire game state

**Technical Tasks**:
- Implement URL encoding/decoding
- Add QR code generation
- Create share UI
- Add import/export functionality

---

## Data Models

### Game State
```typescript
interface GameState {
  // Game flow
  phase: 'betting' | 'dealing' | 'player_turn' | 'dealer_turn' | 'game_over';

  // Players
  player: Player;
  dealer: Dealer;

  // Deck
  shoe: Card[];
  discardPile: Card[];

  // Current hand
  currentBet: number;
  activeHandIndex: number;

  // Configuration
  config: GameConfiguration;
}

interface Player {
  balance: number;
  hands: Hand[];
  insurance: number;
}

interface Dealer {
  hand: Hand;
}

interface Hand {
  cards: Card[];
  bet: number;
  status: 'active' | 'stand' | 'bust' | 'blackjack' | 'surrender';
  doubled: boolean;
  fromSplit: boolean;
}

interface Card {
  rank: 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';
  suit: '♠' | '♥' | '♦' | '♣';
}
```

### Configuration
```typescript
interface GameConfiguration {
  name: string;

  // Deck rules
  deckCount: 1 | 2 | 4 | 6 | 8;

  // Dealer rules
  dealerHitsSoft17: boolean;

  // Payout rules
  blackjackPayout: [number, number]; // e.g., [3, 2] for 3:2

  // Player options
  doubleAfterSplit: boolean;
  resplitAcesAllowed: boolean;
  maxSplits: number;
  surrenderAllowed: boolean;
  insuranceAllowed: boolean;

  // Betting
  minBet: number;
  maxBet: number;
}
```

## UI/UX Considerations

### Layout (Desktop)
```
┌─────────────────────────────────────────────────┐
│  [Balance: $1000]  [Config: Vegas Strip]   [⚙️]  │
├─────────────────────────────────────────────────┤
│                                                  │
│              Dealer: [? ♥] [7♠]                 │
│                    (value: 7)                    │
│                                                  │
│        ┌─────────────────────────────┐          │
│        │      [Learning Mode ON]     │          │
│        │  Hint: Consider standing     │          │
│        └─────────────────────────────┘          │
│                                                  │
│         Player: [K♠] [7♥] = 17                  │
│              Bet: $10                            │
│                                                  │
│    [Hit]  [Stand]  [Double]  [Split]            │
│                                                  │
└─────────────────────────────────────────────────┘
│  Stats: 10 hands | +$50 session                 │
└─────────────────────────────────────────────────┘
```

### Color Scheme (Tailwind)
- **Table**: Green felt (bg-green-800)
- **Cards**: White with suit colors
- **Buttons**: Primary actions (blue), secondary (gray), hints (yellow/green)
- **Dealer area**: Slightly darker background
- **Player area**: Main focus, bright

## Testing Strategy (Future)
- Unit tests for game logic (deck, hand values, win conditions)
- Integration tests for game flow
- E2E tests for critical paths
- Strategy engine accuracy tests

## Performance Considerations
- Efficient card rendering (React.memo for cards)
- Lazy load statistics/charts
- Debounce animations
- LocalStorage size limits (clear old history)

## Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES2020+ features
- LocalStorage required
- No IE11 support

## Accessibility
- Keyboard navigation for all actions
- Screen reader support for card values
- High contrast mode support
- Focus indicators

## Future Ideas (Beyond MVP)
- Multiplayer (multiple players at same table, not vs each other)
- Tournament mode
- Card counting trainer with different systems (Hi-Lo, KO, etc.)
- Rule variations (Spanish 21, Blackjack Switch, etc.)
- Progressive betting systems trainer
- Integration with real casino APIs (viewing rules)
- PWA support for offline play
- Mobile app (React Native)

---

## Development Workflow

### Phase 1: Foundation
1. Project setup (Vite + React + Tailwind)
2. Core types and interfaces
3. Basic game logic (no UI)
4. Unit tests for game logic

### Phase 2: Basic Game (Milestone 1)
1. Simple UI components
2. Game flow implementation
3. Player vs dealer mechanics
4. Win/lose conditions

### Phase 3: Full Rules (Milestone 2)
1. Extended actions (split, double, etc.)
2. Complex hand scenarios
3. Multi-hand support

### Phase 4: Features (Milestones 3-8)
1. Iteratively add features
2. Test with users
3. Refine based on feedback

---

## Success Metrics
- **Playability**: Can complete a full game without bugs
- **Educational value**: Users improve strategy accuracy
- **Speed**: Users decrease decision time while maintaining accuracy
- **Engagement**: Users return to practice
- **Shareability**: Configurations are shared and used by others

---

## Getting Started (Milestone 1)

### Setup Commands
```bash
pnpm create vite blackjack --template react
cd blackjack
pnpm install
pnpm add -D tailwindcss postcss autoprefixer
pnpm add clsx
npx tailwindcss init -p
```

### File Structure
```
src/
├── components/
│   ├── Card.tsx
│   ├── Hand.tsx
│   ├── Table.tsx
│   ├── Controls.tsx
│   └── Balance.tsx
├── lib/
│   ├── game.ts        # Game state logic
│   ├── deck.ts        # Deck operations
│   ├── rules.ts       # Win/lose conditions
│   └── types.ts       # TypeScript types
├── hooks/
│   └── useGameState.ts
├── App.tsx
└── main.tsx
```

---

**Next Step**: Implement Milestone 1 - Basic Blackjack Game
