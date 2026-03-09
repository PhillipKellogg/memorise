from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.core.sm2 import sm2_review
from app.db.session import get_db
from app.models.models import Card, Deck, User, UserCardProgress, UserDeck
from app.schemas.schemas import MyDeckRead, RATING_TO_QUALITY, StudyRating, StudySessionCard

router = APIRouter(prefix="/study", tags=["study"])


def _enroll(user_id: int, deck: Deck, db: Session) -> None:
    """Idempotently enroll a user in a deck and create missing card progress rows."""
    existing = db.query(UserDeck).filter_by(user_id=user_id, deck_id=deck.id).first()
    if not existing:
        db.add(UserDeck(user_id=user_id, deck_id=deck.id))

    # Create UserCardProgress rows for any cards that don't have one yet
    existing_card_ids = {
        r.card_id
        for r in db.query(UserCardProgress.card_id).filter(
            UserCardProgress.user_id == user_id,
            UserCardProgress.card_id.in_([c.id for c in deck.cards]),
        ).all()
    }
    new_rows = [
        UserCardProgress(user_id=user_id, card_id=c.id)
        for c in deck.cards
        if c.id not in existing_card_ids
    ]
    if new_rows:
        db.add_all(new_rows)
    db.commit()


@router.post("/{deck_id}", status_code=status.HTTP_204_NO_CONTENT)
def enroll(deck_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    deck = db.query(Deck).filter(Deck.id == deck_id).first()
    if not deck:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Deck not found")
    if not deck.is_public and deck.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Deck is private")
    _enroll(current_user.id, deck, db)


@router.get("/my-decks", response_model=list[MyDeckRead])
def my_decks(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    now = datetime.now(tz=timezone.utc)

    # All deck IDs the user is enrolled in
    enrolled_ids = {ud.deck_id for ud in db.query(UserDeck).filter_by(user_id=current_user.id).all()}
    # Also include decks they own (auto-enroll owners)
    owned_ids = {d.id for d in db.query(Deck.id).filter_by(owner_id=current_user.id).all()}
    all_ids = enrolled_ids | owned_ids

    if not all_ids:
        return []

    result = []
    for deck in db.query(Deck).filter(Deck.id.in_(all_ids)).all():
        # Ensure owner is enrolled in their own decks
        if deck.id in owned_ids and deck.id not in enrolled_ids:
            _enroll(current_user.id, deck, db)

        progress_rows = db.query(UserCardProgress).filter(
            UserCardProgress.user_id == current_user.id,
            UserCardProgress.card_id.in_([c.id for c in deck.cards]),
        ).all()

        cards_due = sum(1 for p in progress_rows if p.next_review <= now)
        result.append(MyDeckRead(
            id=deck.id,
            title=deck.title,
            description=deck.description,
            is_owned=deck.owner_id == current_user.id,
            cards_due=cards_due,
            total_cards=len(deck.cards),
        ))

    return sorted(result, key=lambda d: (-d.cards_due, d.title))


@router.get("/{deck_id}/next", response_model=StudySessionCard | None)
def next_card(deck_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    deck = db.query(Deck).filter(Deck.id == deck_id).first()
    if not deck:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Deck not found")

    # Auto-enroll if needed
    _enroll(current_user.id, deck, db)

    now = datetime.now(tz=timezone.utc)
    progress = (
        db.query(UserCardProgress)
        .join(Card, Card.id == UserCardProgress.card_id)
        .filter(
            UserCardProgress.user_id == current_user.id,
            Card.deck_id == deck_id,
            UserCardProgress.next_review <= now,
        )
        .order_by(UserCardProgress.next_review)
        .first()
    )

    if not progress:
        return None

    card = db.query(Card).filter(Card.id == progress.card_id).first()
    return StudySessionCard(id=card.id, front=card.front, back=card.back, deck_id=card.deck_id)


@router.post("/{deck_id}/cards/{card_id}/review", response_model=StudySessionCard | None)
def review_card(
    deck_id: int,
    card_id: int,
    payload: StudyRating,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if payload.rating not in RATING_TO_QUALITY:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Rating must be 1–4")

    progress = db.query(UserCardProgress).filter_by(user_id=current_user.id, card_id=card_id).first()
    if not progress:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No progress record for this card")

    quality = RATING_TO_QUALITY[payload.rating]
    result = sm2_review(
        quality=quality,
        easiness_factor=progress.easiness_factor,
        interval=progress.interval,
        repetitions=progress.repetitions,
    )
    progress.easiness_factor = result.easiness_factor
    progress.interval = result.interval
    progress.repetitions = result.repetitions
    progress.next_review = result.next_review
    db.commit()

    # Return the next due card
    now = datetime.now(tz=timezone.utc)
    next_progress = (
        db.query(UserCardProgress)
        .join(Card, Card.id == UserCardProgress.card_id)
        .filter(
            UserCardProgress.user_id == current_user.id,
            Card.deck_id == deck_id,
            UserCardProgress.next_review <= now,
        )
        .order_by(UserCardProgress.next_review)
        .first()
    )

    if not next_progress:
        return None

    card = db.query(Card).filter(Card.id == next_progress.card_id).first()
    return StudySessionCard(id=card.id, front=card.front, back=card.back, deck_id=card.deck_id)
