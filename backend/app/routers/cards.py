from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.models import Card
from app.schemas.schemas import CardCreate, CardRead, ReviewRequest, ReviewResponse
from app.core.sm2 import sm2_review

router = APIRouter(prefix="/cards", tags=["cards"])


@router.get("/due", response_model=list[CardRead])
def get_due_cards(db: Session = Depends(get_db)):
    """Return all cards whose next_review is now or in the past."""
    now = datetime.now(tz=timezone.utc)
    return db.query(Card).filter(Card.next_review <= now).all()


@router.post("", response_model=CardRead, status_code=status.HTTP_201_CREATED)
def create_card(payload: CardCreate, db: Session = Depends(get_db)):
    card = Card(**payload.model_dump())
    db.add(card)
    db.commit()
    db.refresh(card)
    return card


@router.post("/{card_id}/review", response_model=ReviewResponse)
def review_card(card_id: int, payload: ReviewRequest, db: Session = Depends(get_db)):
    card = db.query(Card).filter(Card.id == card_id).first()
    if not card:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Card not found")

    result = sm2_review(
        quality=payload.quality,
        easiness_factor=card.easiness_factor,
        interval=card.interval,
        repetitions=card.repetitions,
    )

    card.easiness_factor = result.easiness_factor
    card.interval = result.interval
    card.repetitions = result.repetitions
    card.next_review = result.next_review
    db.commit()
    db.refresh(card)

    return ReviewResponse(
        card=CardRead.model_validate(card),
        next_review=result.next_review,
        interval=result.interval,
        easiness_factor=result.easiness_factor,
    )
