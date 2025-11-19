"""
Blackjack game logic and player management.
"""
from typing import Optional
from cards import Deck, Hand


class Player:
    """Represents a player in the Blackjack game."""

    def __init__(self, name: str, chips: int = 1000):
        """
        Initialize a player.

        Args:
            name: The player's name.
            chips: Starting chip count (default: 1000).
        """
        self.name = name
        self.chips = chips
        self.hand = Hand()
        self.bet = 0

    def place_bet(self, amount: int) -> bool:
        """
        Place a bet.

        Args:
            amount: The bet amount.

        Returns:
            True if bet was successful, False otherwise.
        """
        if amount <= 0:
            print("Bet must be positive.")
            return False
        if amount > self.chips:
            print(f"Insufficient chips. You have {self.chips} chips.")
            return False
        self.bet = amount
        self.chips -= amount
        return True

    def win_bet(self, multiplier: float = 1.0):
        """
        Win the bet and add winnings to chips.

        Args:
            multiplier: Multiplier for winnings (1.0 for regular win, 1.5 for blackjack).
        """
        winnings = int(self.bet * (1 + multiplier))
        self.chips += winnings
        self.bet = 0

    def lose_bet(self):
        """Lose the bet (chips already deducted when bet was placed)."""
        self.bet = 0

    def push(self):
        """Return the bet to the player (tie)."""
        self.chips += self.bet
        self.bet = 0

    def reset_hand(self):
        """Clear the player's hand for a new round."""
        self.hand.clear()

    def __str__(self) -> str:
        """Return string representation of the player."""
        return f"{self.name}: {self.chips} chips"


class BlackjackGame:
    """Manages the Blackjack game logic."""

    def __init__(self, player_name: str = "Player", starting_chips: int = 1000, num_decks: int = 6):
        """
        Initialize a new Blackjack game.

        Args:
            player_name: Name of the player.
            starting_chips: Starting chip count.
            num_decks: Number of decks to use.
        """
        self.deck = Deck(num_decks)
        self.player = Player(player_name, starting_chips)
        self.dealer_hand = Hand()
        self.game_over = False

    def start_round(self) -> bool:
        """
        Start a new round.

        Returns:
            True if round started successfully, False otherwise.
        """
        if self.player.chips <= 0:
            print("\nYou're out of chips! Game over.")
            self.game_over = True
            return False

        # Reset hands
        self.player.reset_hand()
        self.dealer_hand.clear()

        # Reshuffle if deck is running low
        if self.deck.cards_remaining() < 20:
            print("\nReshuffling deck...")
            self.deck.reset()

        return True

    def deal_initial_cards(self):
        """Deal initial two cards to player and dealer."""
        # Deal two cards to player
        self.player.hand.add_card(self.deck.deal_card())
        self.player.hand.add_card(self.deck.deal_card())

        # Deal two cards to dealer
        self.dealer_hand.add_card(self.deck.deal_card())
        self.dealer_hand.add_card(self.deck.deal_card())

    def show_hands(self, hide_dealer_card: bool = True):
        """
        Display current hands.

        Args:
            hide_dealer_card: If True, hide dealer's second card.
        """
        print(f"\n{self.player.name}'s hand: {self.player.hand}")

        if hide_dealer_card and len(self.dealer_hand.cards) >= 2:
            # Show only first card
            print(f"Dealer's hand: {self.dealer_hand.cards[0]}, [Hidden]")
        else:
            print(f"Dealer's hand: {self.dealer_hand}")

    def player_hit(self) -> bool:
        """
        Player takes a card.

        Returns:
            True if player can continue, False if busted.
        """
        self.player.hand.add_card(self.deck.deal_card())
        print(f"\n{self.player.name} draws: {self.player.hand.cards[-1]}")
        print(f"{self.player.name}'s hand: {self.player.hand}")

        if self.player.hand.is_busted():
            print(f"\n{self.player.name} busted!")
            return False
        return True

    def dealer_play(self):
        """Dealer plays according to standard rules (hit on 16 or less, stand on 17+)."""
        print("\nDealer's turn...")
        print(f"Dealer reveals: {self.dealer_hand}")

        while self.dealer_hand.get_value() < 17:
            card = self.deck.deal_card()
            self.dealer_hand.add_card(card)
            print(f"Dealer draws: {card}")
            print(f"Dealer's hand: {self.dealer_hand}")

        if self.dealer_hand.is_busted():
            print("\nDealer busted!")
        else:
            print(f"\nDealer stands at {self.dealer_hand.get_value()}")

    def determine_winner(self) -> Optional[str]:
        """
        Determine the winner and update chips.

        Returns:
            Result message string.
        """
        player_value = self.player.hand.get_value()
        dealer_value = self.dealer_hand.get_value()
        player_blackjack = self.player.hand.is_blackjack()
        dealer_blackjack = self.dealer_hand.is_blackjack()

        # Player busted
        if self.player.hand.is_busted():
            self.player.lose_bet()
            return "You busted! Dealer wins."

        # Dealer busted
        if self.dealer_hand.is_busted():
            self.player.win_bet()
            return f"Dealer busted! You win {self.player.bet} chips!"

        # Both have blackjack
        if player_blackjack and dealer_blackjack:
            self.player.push()
            return "Both have Blackjack! Push."

        # Player has blackjack
        if player_blackjack:
            self.player.win_bet(1.5)
            return f"Blackjack! You win {int(self.player.bet * 1.5)} chips!"

        # Dealer has blackjack
        if dealer_blackjack:
            self.player.lose_bet()
            return "Dealer has Blackjack! Dealer wins."

        # Compare values
        if player_value > dealer_value:
            self.player.win_bet()
            return f"You win {self.player.bet} chips!"
        elif player_value < dealer_value:
            self.player.lose_bet()
            return "Dealer wins."
        else:
            self.player.push()
            return "Push! Bet returned."

    def can_continue(self) -> bool:
        """Check if the game can continue."""
        return not self.game_over and self.player.chips > 0
