#!/usr/bin/env python3
"""
Blackjack CLI Game

A command-line implementation of the classic Blackjack card game.
"""
from game import BlackjackGame


def print_banner():
    """Print the game banner."""
    print("\n" + "=" * 50)
    print(" " * 15 + "BLACKJACK")
    print("=" * 50)


def print_separator():
    """Print a separator line."""
    print("-" * 50)


def get_player_name() -> str:
    """Get the player's name."""
    name = input("\nEnter your name: ").strip()
    return name if name else "Player"


def get_bet(max_chips: int) -> int:
    """
    Get bet amount from player.

    Args:
        max_chips: Maximum chips available.

    Returns:
        Bet amount.
    """
    while True:
        try:
            bet = input(f"\nPlace your bet (1-{max_chips}): ").strip()
            bet_amount = int(bet)
            if 1 <= bet_amount <= max_chips:
                return bet_amount
            else:
                print(f"Please enter a bet between 1 and {max_chips}.")
        except ValueError:
            print("Please enter a valid number.")
        except KeyboardInterrupt:
            print("\n\nGame cancelled.")
            exit(0)


def get_player_action() -> str:
    """
    Get player's action choice.

    Returns:
        'h' for hit or 's' for stand.
    """
    while True:
        try:
            action = input("\n(H)it or (S)tand? ").strip().lower()
            if action in ['h', 'hit']:
                return 'h'
            elif action in ['s', 'stand']:
                return 's'
            else:
                print("Please enter 'h' for hit or 's' for stand.")
        except KeyboardInterrupt:
            print("\n\nGame cancelled.")
            exit(0)


def ask_play_again() -> bool:
    """Ask if player wants to play another round."""
    while True:
        try:
            choice = input("\nPlay another round? (y/n): ").strip().lower()
            if choice in ['y', 'yes']:
                return True
            elif choice in ['n', 'no']:
                return False
            else:
                print("Please enter 'y' or 'n'.")
        except KeyboardInterrupt:
            print("\n\nGame cancelled.")
            exit(0)


def play_round(game: BlackjackGame) -> bool:
    """
    Play one round of Blackjack.

    Args:
        game: The BlackjackGame instance.

    Returns:
        True if player wants to continue, False otherwise.
    """
    print_separator()
    print(f"\n{game.player}")

    # Place bet
    bet_amount = get_bet(game.player.chips)
    if not game.player.place_bet(bet_amount):
        return False

    # Deal initial cards
    game.deal_initial_cards()
    game.show_hands(hide_dealer_card=True)

    # Check for immediate blackjack
    if game.player.hand.is_blackjack():
        print(f"\n{game.player.name} has Blackjack!")
        game.show_hands(hide_dealer_card=False)

        result = game.determine_winner()
        print(f"\n{result}")
        print(f"Chips: {game.player.chips}")

        return ask_play_again()

    # Player's turn
    while True:
        action = get_player_action()

        if action == 'h':
            if not game.player_hit():
                # Player busted
                result = game.determine_winner()
                print(f"\n{result}")
                print(f"Chips: {game.player.chips}")
                return ask_play_again()
        else:
            # Player stands
            break

    # Dealer's turn
    game.dealer_play()

    # Determine winner
    result = game.determine_winner()
    print(f"\n{result}")
    print(f"Chips: {game.player.chips}")

    return ask_play_again()


def main():
    """Main game function."""
    try:
        print_banner()
        print("\nWelcome to Blackjack!")

        # Get player name
        player_name = get_player_name()

        # Initialize game
        game = BlackjackGame(player_name=player_name, starting_chips=1000, num_decks=6)

        print(f"\nGood luck, {player_name}! You start with {game.player.chips} chips.")

        # Game loop
        while game.can_continue():
            if not game.start_round():
                break

            if not play_round(game):
                break

        # Game over
        print_separator()
        print(f"\nThanks for playing, {player_name}!")
        print(f"Final chips: {game.player.chips}")

        if game.player.chips > 1000:
            profit = game.player.chips - 1000
            print(f"You won {profit} chips! Great job!")
        elif game.player.chips < 1000:
            loss = 1000 - game.player.chips
            print(f"You lost {loss} chips. Better luck next time!")
        else:
            print("You broke even!")

        print_separator()

    except KeyboardInterrupt:
        print("\n\nGame interrupted. Goodbye!")
    except Exception as e:
        print(f"\nAn error occurred: {e}")
        print("Please report this issue.")


if __name__ == "__main__":
    main()
