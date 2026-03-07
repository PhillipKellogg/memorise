from datetime import datetime
from pydantic import BaseModel, EmailStr, ConfigDict


# ── User ──────────────────────────────────────────────────────────────────────

class UserBase(BaseModel):
    email: EmailStr
    username: str


class UserCreate(UserBase):
    password: str


class UserRead(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
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
    created_at: datetime
    updated_at: datetime


# ── Card ──────────────────────────────────────────────────────────────────────

class CardBase(BaseModel):
    front: str
    back: str
    deck_id: int


class CardCreate(CardBase):
    pass


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


# ── Auth ──────────────────────────────────────────────────────────────────────

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    username: str
    password: str
