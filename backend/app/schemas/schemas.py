from datetime import datetime
from pydantic import BaseModel, ConfigDict


# ── User ──────────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    username: str
    password: str


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    is_active: bool
    created_at: datetime


# ── Deck ──────────────────────────────────────────────────────────────────────

class DeckBase(BaseModel):
    title: str
    description: str | None = None


class DeckCreate(DeckBase):
    pass


class DeckRead(DeckBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    owner_id: int
    is_public: bool
    created_at: datetime
    updated_at: datetime


class PublicDeckRead(BaseModel):
    id: int
    title: str
    description: str | None
    owner_username: str
    card_count: int


# ── Card ──────────────────────────────────────────────────────────────────────

class CardBase(BaseModel):
    front: str
    back: str
    deck_id: int


class CardCreate(CardBase):
    pass


class CardCreateInDeck(BaseModel):
    front: str
    back: str


class CardUpdate(BaseModel):
    front: str
    back: str


class CardRead(CardBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    easiness_factor: float
    interval: int
    repetitions: int
    next_review: datetime
    created_at: datetime
    updated_at: datetime


# ── Review ────────────────────────────────────────────────────────────────────

class ReviewRequest(BaseModel):
    quality: int  # 0–5

    model_config = ConfigDict(json_schema_extra={"example": {"quality": 4}})


class ReviewResponse(BaseModel):
    card: CardRead
    next_review: datetime
    interval: int
    easiness_factor: float


# ── Study ─────────────────────────────────────────────────────────────────────

RATING_TO_QUALITY = {1: 0, 2: 2, 3: 4, 4: 5}


class StudySessionCard(BaseModel):
    id: int
    front: str
    back: str
    deck_id: int


class StudyRating(BaseModel):
    rating: int  # 1=Forgot, 2=Hard, 3=Medium, 4=Easy


class MyDeckRead(BaseModel):
    id: int
    title: str
    description: str | None
    is_owned: bool
    cards_due: int
    total_cards: int


# ── Auth ──────────────────────────────────────────────────────────────────────

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    username: str
    password: str
