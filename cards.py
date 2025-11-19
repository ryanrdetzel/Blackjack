"""
Card, Deck, and Hand classes for Blackjack game.
"""
import random
from typing import List


class Card:
    """Represents a single playing card."""

    RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
    SUITS = ['♠', '♥', '♦', '♣']

    def __init__(self, rank: str, suit: str):
        """Initialize a card with rank and suit."""
        if rank not in self.RANKS:
            raise ValueError(f"Invalid rank: {rank}")
        if suit not in self.SUITS:
            raise ValueError(f"Invalid suit: {suit}")
        self.rank = rank
        self.suit = suit

    def __str__(self) -> str:
        """Return string representation of the card."""
        return f"{self.rank}{self.suit}"

    def __repr__(self) -> str:
        """Return detailed representation of the card."""
        return f"Card({self.rank}, {self.suit})"

    def get_value(self, ace_as_eleven: bool = True) -> int:
        """
        Get the blackjack value of the card.

        Args:
            ace_as_eleven: If True, Ace counts as 11, otherwise 1.

        Returns:
            The numeric value of the card.
        """
        if self.rank in ['J', 'Q', 'K']:
            return 10
        elif self.rank == 'A':
            return 11 if ace_as_eleven else 1
        else:
            return int(self.rank)


class Deck:
    """Represents a deck of 52 playing cards."""

    def __init__(self, num_decks: int = 1):
        """
        Initialize a deck with the specified number of standard 52-card decks.

        Args:
            num_decks: Number of standard decks to include.
        """
        self.num_decks = num_decks
        self.cards: List[Card] = []
        self.reset()

    def reset(self):
        """Reset the deck with all cards and shuffle."""
        self.cards = []
        for _ in range(self.num_decks):
            for suit in Card.SUITS:
                for rank in Card.RANKS:
                    self.cards.append(Card(rank, suit))
        self.shuffle()

    def shuffle(self):
        """Shuffle the deck."""
        random.shuffle(self.cards)

    def deal_card(self) -> Card:
        """
        Deal one card from the deck.

        Returns:
            A Card object.

        Raises:
            ValueError: If the deck is empty.
        """
        if not self.cards:
            raise ValueError("Cannot deal from an empty deck")
        return self.cards.pop()

    def cards_remaining(self) -> int:
        """Return the number of cards remaining in the deck."""
        return len(self.cards)

    def __len__(self) -> int:
        """Return the number of cards in the deck."""
        return len(self.cards)


class Hand:
    """Represents a hand of cards in Blackjack."""

    def __init__(self):
        """Initialize an empty hand."""
        self.cards: List[Card] = []

    def add_card(self, card: Card):
        """Add a card to the hand."""
        self.cards.append(card)

    def get_value(self) -> int:
        """
        Calculate the best value of the hand.

        Aces are counted as 11 unless that would bust the hand,
        in which case they are counted as 1.

        Returns:
            The best possible value of the hand.
        """
        value = 0
        aces = 0

        # Count non-aces and count number of aces
        for card in self.cards:
            if card.rank == 'A':
                aces += 1
                value += 11
            else:
                value += card.get_value()

        # Adjust for aces if busted
        while value > 21 and aces > 0:
            value -= 10
            aces -= 1

        return value

    def is_blackjack(self) -> bool:
        """Check if the hand is a natural blackjack (21 with first two cards)."""
        return len(self.cards) == 2 and self.get_value() == 21

    def is_busted(self) -> bool:
        """Check if the hand value exceeds 21."""
        return self.get_value() > 21

    def clear(self):
        """Remove all cards from the hand."""
        self.cards.clear()

    def __str__(self) -> str:
        """Return string representation of the hand."""
        cards_str = ', '.join(str(card) for card in self.cards)
        return f"{cards_str} (Value: {self.get_value()})"

    def __len__(self) -> int:
        """Return the number of cards in the hand."""
        return len(self.cards)
