"""
Seed the database with a default user and demo deck.

Usage (from backend/ with venv active):
    python seed.py

Safe to re-run — skips seeding if data already exists.
"""

import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from app.db.session import SessionLocal
from app.models.models import Card, Deck, User


DEMO_CARDS = [
    (
        "What is spaced repetition?",
        "A learning technique that schedules reviews at increasing intervals — the more reliably you recall something, the longer until you see it again.",
    ),
    (
        "What does the SM-2 algorithm calculate?",
        "The next review interval for a flashcard, based on the user's recall quality (0–5) and the card's current easiness factor.",
    ),
    (
        "What is the easiness factor in SM-2?",
        "A multiplier (min 1.3) that controls how quickly intervals grow. High EF = card is easy and intervals grow fast.",
    ),
    (
        "What is retrieval practice?",
        "Actively recalling information from memory, rather than passively re-reading it. Retrieval practice is more effective for long-term retention.",
    ),
    (
        "What is the forgetting curve?",
        "Ebbinghaus's model showing that memory decays exponentially over time without review. Spaced repetition counteracts this decay.",
    ),
    (
        "What is active recall?",
        "Generating an answer from memory (e.g. answering a flashcard) rather than recognising it from a list. More effortful — and more effective.",
    ),
]


def seed() -> None:
    db = SessionLocal()
    try:
        if db.query(User).first():
            print("Database already seeded — skipping.")
            return

        user = User(
            email="demo@memorise.local",
            username="demo",
            hashed_password="not-a-real-hash-auth-not-implemented-yet",
            is_active=True,
        )
        db.add(user)
        db.flush()

        deck = Deck(
            title="Spaced Repetition Fundamentals",
            description="Core concepts behind spaced repetition and the SM-2 algorithm. A good first deck.",
            owner_id=user.id,
        )
        db.add(deck)
        db.flush()

        cards = [
            Card(front=front, back=back, deck_id=deck.id)
            for front, back in DEMO_CARDS
        ]
        db.add_all(cards)
        db.commit()

        print(f"Seeded successfully.")
        print(f"  User:  {user.email} (id={user.id})")
        print(f"  Deck:  {deck.title!r} (id={deck.id})")
        print(f"  Cards: {len(cards)}")

    finally:
        db.close()


if __name__ == "__main__":
    seed()
