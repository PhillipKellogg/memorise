# Memorise

Self-hosted spaced repetition — like Anki, but on your own server.

## Stack

| Layer     | Technology                            |
|-----------|---------------------------------------|
| Frontend  | React 18 + TypeScript + Vite          |
| Styling   | Tailwind CSS + Framer Motion          |
| Data      | TanStack Query v5 + Axios             |
| Backend   | FastAPI + Python 3.12                 |
| ORM       | SQLAlchemy 2 + Alembic                |
| Database  | PostgreSQL 16                         |
| Algorithm | SM-2 spaced repetition                |
| Infra     | Docker Compose + Nginx                |

## Local Development

Run the DB in Docker, everything else natively. Three terminals:

**Terminal 1 — Database**
```bash
docker compose up db
```

**Terminal 2 — Backend** (first time: create `backend/.env` from the block below, then run)
```bash
cd backend && python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt && alembic revision --autogenerate -m "initial" && alembic upgrade head && uvicorn app.main:app --reload --port 8000
```

After the first run you can skip straight to:
```bash
cd backend && source .venv/bin/activate && uvicorn app.main:app --reload --port 8000
```

`backend/.env`:
```env
DATABASE_URL=postgresql://memorise:memorise@localhost:5432/memorise
SECRET_KEY=dev-secret
ENVIRONMENT=development
ALLOWED_ORIGINS=http://localhost:5173
```

**Terminal 3 — Frontend** (first time)
```bash
cd frontend && npm install && npm run dev
```

After the first run: `cd frontend && npm run dev`

`frontend/.env.local`:
```env
VITE_API_URL=http://localhost:8000
```

| Service  | URL                        |
|----------|----------------------------|
| Frontend | http://localhost:5173      |
| API      | http://localhost:8000      |
| Swagger  | http://localhost:8000/docs |

---

## Quickstart (Docker)

```bash
cp .env.example .env
# Edit .env — set POSTGRES_PASSWORD and SECRET_KEY at minimum

docker compose up --build
```

## Services

| Service  | URL                      | Notes                        |
|----------|--------------------------|------------------------------|
| Frontend | http://localhost:5173    | Vite dev server              |
| Backend  | http://localhost:3232    | FastAPI (internal only prod) |
| API Docs | http://localhost:3232/docs | Swagger UI                 |
| Database | localhost:5432           | PostgreSQL (internal)        |

## Project Structure

```
memorise/
├── frontend/               # Vite + React + TypeScript
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # api.ts, utils.ts
│   │   ├── pages/          # Route-level page components
│   │   └── types/          # Shared TypeScript types
│   └── Dockerfile
├── backend/                # FastAPI + Python
│   ├── app/
│   │   ├── core/           # config.py, sm2.py
│   │   ├── db/             # session.py
│   │   ├── models/         # SQLAlchemy ORM models
│   │   ├── routers/        # health, auth, decks, cards
│   │   ├── schemas/        # Pydantic schemas
│   │   └── main.py
│   ├── alembic/            # Database migrations
│   └── Dockerfile
├── docs/
│   └── self-hosting.md     # Nginx + Certbot production setup
├── docker-compose.yml
├── .env.example
└── README.md
```

## Running Migrations

```bash
# Inside the backend container (after docker compose up)
docker compose exec backend alembic revision --autogenerate -m "initial"
docker compose exec backend alembic upgrade head
```

Or with a local venv:

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
```

## Roadmap

- [x] Project scaffold (frontend + backend + Docker)
- [x] SM-2 spaced repetition algorithm
- [x] Database models (User, Deck, Card)
- [x] API routers (health, decks, cards)
- [ ] JWT authentication
- [ ] User registration + login UI
- [ ] Deck management UI
- [ ] Review session UI
- [ ] Progress / statistics dashboard
- [ ] Import from Anki (.apkg)
- [ ] Markdown card support
- [ ] Mobile-responsive review mode
