from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.models import Card, Deck
from app.schemas.schemas import CardRead, DeckCreate, DeckRead

router = APIRouter(prefix="/decks", tags=["decks"])

# TODO: replace with real auth dependency
PLACEHOLDER_OWNER_ID = 1


@router.get("", response_model=list[DeckRead])
def list_decks(db: Session = Depends(get_db)):
    return db.query(Deck).filter(Deck.owner_id == PLACEHOLDER_OWNER_ID).all()


@router.get("/{deck_id}", response_model=DeckRead)
def get_deck(deck_id: int, db: Session = Depends(get_db)):
    deck = db.query(Deck).filter(Deck.id == deck_id).first()
    if not deck:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Deck not found")
    return deck


@router.post("", response_model=DeckRead, status_code=status.HTTP_201_CREATED)
def create_deck(payload: DeckCreate, db: Session = Depends(get_db)):
    deck = Deck(**payload.model_dump(), owner_id=PLACEHOLDER_OWNER_ID)
    db.add(deck)
    db.commit()
    db.refresh(deck)
    return deck


@router.get("/{deck_id}/cards", response_model=list[CardRead])
def list_deck_cards(deck_id: int, db: Session = Depends(get_db)):
    deck = db.query(Deck).filter(Deck.id == deck_id).first()
    if not deck:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Deck not found")
    return db.query(Card).filter(Card.deck_id == deck_id).all()


@router.delete("/{deck_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_deck(deck_id: int, db: Session = Depends(get_db)):
    deck = db.query(Deck).filter(Deck.id == deck_id).first()
    if not deck:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Deck not found")
    db.delete(deck)
    db.commit()
