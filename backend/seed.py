"""
Seed the database with a demo user and public starter decks.

Usage (from backend/ with venv active):
    python seed.py

Safe to re-run — skips seeding if data already exists.
"""

import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from app.db.session import SessionLocal
from app.models.models import Card, Deck, User


DECKS = [
    {
        "title": "Spaced Repetition Fundamentals",
        "description": "Core concepts behind spaced repetition and the SM-2 algorithm. A good first deck.",
        "cards": [
            ("What is spaced repetition?", "A learning technique that schedules reviews at increasing intervals — the more reliably you recall something, the longer until you see it again."),
            ("What does the SM-2 algorithm calculate?", "The next review interval for a flashcard, based on the user's recall quality (0–5) and the card's current easiness factor."),
            ("What is the easiness factor in SM-2?", "A multiplier (min 1.3) that controls how quickly intervals grow. High EF = easy card, intervals grow fast."),
            ("What is retrieval practice?", "Actively recalling information from memory rather than passively re-reading it. More effortful — and far more effective."),
            ("What is the forgetting curve?", "Ebbinghaus's model showing memory decays exponentially over time without review. Spaced repetition counteracts this decay."),
            ("What is active recall?", "Generating an answer from memory (e.g. answering a flashcard) rather than recognising it from a list."),
        ],
    },
    {
        "title": "Japanese Hiragana",
        "description": "Master the 46 basic hiragana characters. Start here before katakana or kanji.",
        "cards": [
            ("あ", "a — as in 'ah'"),
            ("い", "i — as in 'ee'"),
            ("う", "u — as in 'oo' (lips unrounded)"),
            ("え", "e — as in 'eh'"),
            ("お", "o — as in 'oh'"),
            ("か", "ka"),
            ("き", "ki"),
            ("く", "ku"),
            ("け", "ke"),
            ("こ", "ko"),
            ("さ", "sa"),
            ("し", "shi"),
            ("す", "su"),
            ("せ", "se"),
            ("そ", "so"),
            ("た", "ta"),
            ("ち", "chi"),
            ("つ", "tsu"),
            ("て", "te"),
            ("と", "to"),
            ("な", "na"),
            ("に", "ni"),
            ("ぬ", "nu"),
            ("ね", "ne"),
            ("の", "no"),
            ("は", "ha"),
            ("ひ", "hi"),
            ("ふ", "fu"),
            ("へ", "he"),
            ("ほ", "ho"),
            ("ま", "ma"),
            ("み", "mi"),
            ("む", "mu"),
            ("め", "me"),
            ("も", "mo"),
            ("や", "ya"),
            ("ゆ", "yu"),
            ("よ", "yo"),
            ("ら", "ra"),
            ("り", "ri"),
            ("る", "ru"),
            ("れ", "re"),
            ("ろ", "ro"),
            ("わ", "wa"),
            ("を", "wo — used as the object marker particle"),
            ("ん", "n — a standalone nasal sound"),
            ("こんにちは", "Konnichiwa — Hello / Good afternoon"),
            ("ありがとう", "Arigatou — Thank you"),
            ("すみません", "Sumimasen — Excuse me / Sorry"),
            ("はい / いいえ", "Hai / Iie — Yes / No"),
        ],
    },
    {
        "title": "Mandarin Chinese Basics",
        "description": "Essential Mandarin vocabulary, numbers, and tones for absolute beginners.",
        "cards": [
            ("The 4 tones of Mandarin", "1st (ā): high flat. 2nd (á): rising. 3rd (ǎ): dip then rise. 4th (à): sharp falling. Tone changes meaning entirely."),
            ("你好 (nǐ hǎo)", "Hello"),
            ("谢谢 (xièxiè)", "Thank you"),
            ("对不起 (duìbuqǐ)", "Sorry / Excuse me"),
            ("是 / 不是 (shì / bùshì)", "Yes (it is) / No (it isn't)"),
            ("一 (yī)", "1"),
            ("二 (èr)", "2"),
            ("三 (sān)", "3"),
            ("四 (sì)", "4"),
            ("五 (wǔ)", "5"),
            ("六 (liù)", "6"),
            ("七 (qī)", "7"),
            ("八 (bā)", "8"),
            ("九 (jiǔ)", "9"),
            ("十 (shí)", "10"),
            ("我 (wǒ)", "I / me"),
            ("你 (nǐ)", "you"),
            ("他 / 她 (tā)", "he / she (same pronunciation, different character)"),
            ("水 (shuǐ)", "water"),
            ("吃 (chī)", "to eat"),
            ("好 (hǎo)", "good / well"),
            ("大 / 小 (dà / xiǎo)", "big / small"),
            ("今天 (jīntiān)", "today"),
            ("明天 (míngtiān)", "tomorrow"),
        ],
    },
    {
        "title": "Programming Fundamentals",
        "description": "Core concepts every developer should know — language-agnostic theory and vocabulary.",
        "cards": [
            ("What is a variable?", "A named container that stores a value in memory. The value can change during program execution."),
            ("What is a function?", "A reusable block of code that performs a specific task, optionally takes inputs (parameters), and optionally returns a value."),
            ("What is recursion?", "A function that calls itself to solve a smaller version of the same problem, with a base case to stop."),
            ("What is Big O notation?", "A way to describe the time or space complexity of an algorithm as input size grows. O(1) is constant, O(n) is linear, O(n²) is quadratic."),
            ("What is a class?", "A blueprint for creating objects. It defines properties (data) and methods (behaviour) that instances of the class will have."),
            ("What is polymorphism?", "The ability of different objects to respond to the same interface in their own way. Enables writing code that works with objects of multiple types."),
            ("Stack vs Heap memory", "Stack: fast, automatic, stores local variables & function calls (LIFO). Heap: dynamic, manual/GC-managed, stores objects that outlive a function call."),
            ("What is a REST API?", "An architectural style for web APIs that uses HTTP verbs (GET, POST, PUT, DELETE) and stateless requests to interact with resources identified by URLs."),
            ("What is a database index?", "A data structure that speeds up queries on a column by maintaining a sorted reference — like a book's index. Speeds reads, slows writes."),
            ("What is a race condition?", "A bug where the outcome depends on the unpredictable timing of concurrent operations — two threads reading and writing shared data without synchronisation."),
            ("What is memoisation?", "Caching the result of expensive function calls and returning the cached result when the same inputs occur again."),
            ("What is idempotency?", "An operation is idempotent if calling it multiple times produces the same result as calling it once. PUT and DELETE are idempotent; POST is not."),
        ],
    },
    {
        "title": "NATO Phonetic Alphabet",
        "description": "The international radiotelephony spelling alphabet used by aviation, military, and emergency services worldwide.",
        "cards": [
            ("A", "Alpha"),
            ("B", "Bravo"),
            ("C", "Charlie"),
            ("D", "Delta"),
            ("E", "Echo"),
            ("F", "Foxtrot"),
            ("G", "Golf"),
            ("H", "Hotel"),
            ("I", "India"),
            ("J", "Juliet"),
            ("K", "Kilo"),
            ("L", "Lima"),
            ("M", "Mike"),
            ("N", "November"),
            ("O", "Oscar"),
            ("P", "Papa"),
            ("Q", "Quebec"),
            ("R", "Romeo"),
            ("S", "Sierra"),
            ("T", "Tango"),
            ("U", "Uniform"),
            ("V", "Victor"),
            ("W", "Whiskey"),
            ("X", "X-ray"),
            ("Y", "Yankee"),
            ("Z", "Zulu"),
        ],
    },
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
            hashed_password="not-a-real-hash",
            is_active=True,
        )
        db.add(user)
        db.flush()

        for deck_data in DECKS:
            deck = Deck(
                title=deck_data["title"],
                description=deck_data["description"],
                owner_id=user.id,
                is_public=True,
            )
            db.add(deck)
            db.flush()

            cards = [
                Card(front=front, back=back, deck_id=deck.id)
                for front, back in deck_data["cards"]
            ]
            db.add_all(cards)
            print(f"  Deck: {deck.title!r} — {len(cards)} cards")

        db.commit()
        print(f"\nSeeded {len(DECKS)} public decks for user '{user.username}'.")

    finally:
        db.close()


if __name__ == "__main__":
    seed()
