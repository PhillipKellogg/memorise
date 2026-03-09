from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.session import get_db
from app.models.models import Card, Deck, User
from app.schemas.schemas import CardCreateInDeck, CardRead, CardUpdate, DeckCreate, DeckRead, PublicDeckRead

router = APIRouter(prefix="/decks", tags=["decks"])


@router.get("/public", response_model=list[PublicDeckRead])
def list_public_decks(search: str = Query(default=""), db: Session = Depends(get_db)):
    q = (
        db.query(
            Deck.id,
            Deck.title,
            Deck.description,
            User.username.label("owner_username"),
            func.count(Card.id).label("card_count"),
        )
        .join(User, Deck.owner_id == User.id)
        .outerjoin(Card, Card.deck_id == Deck.id)
        .filter(Deck.is_public == True)
        .group_by(Deck.id, Deck.title, Deck.description, User.username)
    )
    if search.strip():
        term = f"%{search.strip()}%"
        q = q.filter(Deck.title.ilike(term) | Deck.description.ilike(term))
    rows = q.order_by(func.count(Card.id).desc()).all()
    return [
        PublicDeckRead(
            id=r.id,
            title=r.title,
            description=r.description,
            owner_username=r.owner_username,
            card_count=r.card_count,
        )
        for r in rows
    ]


@router.get("/public/{deck_id}/cards", response_model=list[CardRead])
def list_public_deck_cards(deck_id: int, db: Session = Depends(get_db)):
    deck = db.query(Deck).filter(Deck.id == deck_id, Deck.is_public == True).first()
    if not deck:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Deck not found")
    return db.query(Card).filter(Card.deck_id == deck_id).all()


@router.get("", response_model=list[DeckRead])
def list_decks(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Deck).filter(Deck.owner_id == current_user.id).all()


@router.get("/{deck_id}", response_model=DeckRead)
def get_deck(deck_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    deck = db.query(Deck).filter(Deck.id == deck_id, Deck.owner_id == current_user.id).first()
    if not deck:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Deck not found")
    return deck


@router.post("", response_model=DeckRead, status_code=status.HTTP_201_CREATED)
def create_deck(payload: DeckCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    deck = Deck(**payload.model_dump(), owner_id=current_user.id)
    db.add(deck)
    db.commit()
    db.refresh(deck)
    return deck


@router.get("/{deck_id}/cards", response_model=list[CardRead])
def list_deck_cards(deck_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    deck = db.query(Deck).filter(Deck.id == deck_id, Deck.owner_id == current_user.id).first()
    if not deck:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Deck not found")
    return db.query(Card).filter(Card.deck_id == deck_id).all()


@router.post("/{deck_id}/cards", response_model=CardRead, status_code=status.HTTP_201_CREATED)
def create_card(deck_id: int, payload: CardCreateInDeck, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    deck = db.query(Deck).filter(Deck.id == deck_id, Deck.owner_id == current_user.id).first()
    if not deck:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Deck not found")
    card = Card(front=payload.front, back=payload.back, deck_id=deck_id)
    db.add(card)
    db.commit()
    db.refresh(card)
    return card


@router.patch("/{deck_id}/cards/{card_id}", response_model=CardRead)
def update_card(deck_id: int, card_id: int, payload: CardUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    deck = db.query(Deck).filter(Deck.id == deck_id, Deck.owner_id == current_user.id).first()
    if not deck:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Deck not found")
    card = db.query(Card).filter(Card.id == card_id, Card.deck_id == deck_id).first()
    if not card:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Card not found")
    card.front = payload.front
    card.back = payload.back
    db.commit()
    db.refresh(card)
    return card


@router.delete("/{deck_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_deck(deck_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    deck = db.query(Deck).filter(Deck.id == deck_id, Deck.owner_id == current_user.id).first()
    if not deck:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Deck not found")
    db.delete(deck)
    db.commit()
