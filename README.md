# Blackjack CLI Game

A command-line implementation of the classic casino card game Blackjack (also known as 21).

## Features

- **Complete Blackjack Rules**: Follows standard casino Blackjack rules
- **Multi-deck Shoe**: Uses 6 decks by default (configurable)
- **Chip Management**: Start with 1000 chips and try to build your bankroll
- **Betting System**: Place bets on each round
- **Blackjack Payouts**: Get 3:2 payout on natural blackjacks
- **Automatic Deck Reshuffling**: Deck reshuffles when running low on cards
- **Dealer AI**: Dealer follows standard rules (hit on 16, stand on 17+)
- **Interactive CLI**: Clean, user-friendly command-line interface

## Game Rules

1. **Objective**: Get a hand value as close to 21 as possible without going over
2. **Card Values**:
   - Number cards (2-10): Face value
   - Face cards (J, Q, K): 10 points
   - Aces: 11 points (or 1 if that would bust the hand)
3. **Blackjack**: An Ace and a 10-value card on the first two cards pays 3:2
4. **Dealer Rules**: Dealer must hit on 16 or less, and stand on 17 or more
5. **Winning**:
   - Beat the dealer's hand without going over 21
   - Dealer busts while you don't
   - Get a natural Blackjack (Ace + 10-value card)

## Installation

### Requirements

- Python 3.7 or higher

### Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/Blackjack.git
cd Blackjack
```

2. No additional dependencies required (uses only Python standard library)

## How to Play

1. Run the game:
```bash
python blackjack.py
```

Or make it executable:
```bash
chmod +x blackjack.py
./blackjack.py
```

2. Enter your name when prompted

3. For each round:
   - Place your bet (within your available chips)
   - Decide whether to Hit (take another card) or Stand (keep current hand)
   - Try to beat the dealer without going over 21!

4. Continue playing until you run out of chips or choose to quit

## Gameplay Example

```
==================================================
               BLACKJACK
==================================================

Welcome to Blackjack!

Enter your name: Alice

Good luck, Alice! You start with 1000 chips.
--------------------------------------------------

Alice: 1000 chips

Place your bet (1-1000): 100

Alice's hand: 7♥, K♠ (Value: 17)
Dealer's hand: 9♦, [Hidden]

(H)it or (S)tand? s

Dealer's turn...
Dealer reveals: 9♦, 6♣ (Value: 15)
Dealer draws: 8♠
Dealer's hand: 9♦, 6♣, 8♠ (Value: 23)

Dealer busted! You win 100 chips!
Chips: 1100
```

## Project Structure

```
Blackjack/
├── blackjack.py    # Main game loop and CLI interface
├── game.py         # Game logic and player management
├── cards.py        # Card, Deck, and Hand classes
└── README.md       # This file
```

## Code Architecture

### cards.py
- `Card`: Represents a single playing card with rank and suit
- `Deck`: Manages a shoe of multiple decks with shuffling
- `Hand`: Represents a hand of cards with automatic Ace value calculation

### game.py
- `Player`: Manages player state, chips, and betting
- `BlackjackGame`: Core game logic, dealing, and win/loss determination

### blackjack.py
- Main game loop
- User input handling
- Display and formatting

## Features Breakdown

### Intelligent Ace Handling
Aces automatically adjust between 1 and 11 to give you the best possible hand value without busting.

### Realistic Casino Rules
- Multiple deck shoe (reduces card counting effectiveness)
- Dealer hits on 16, stands on 17
- Blackjack pays 3:2
- Push (tie) returns your bet

### Chip Management
- Start with 1000 chips
- Track winnings and losses
- See final profit/loss at game end

## Future Enhancements

Potential features for future versions:
- [ ] Double down option
- [ ] Split pairs
- [ ] Insurance when dealer shows Ace
- [ ] Card counting hints/statistics
- [ ] Save/load game state
- [ ] Multiple players
- [ ] GUI version
- [ ] Online multiplayer

## License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests.

## Author

Created as a demonstration of object-oriented Python programming and game logic implementation.

Enjoy the game and gamble responsibly!
