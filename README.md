# Memorise

Self-hosted spaced repetition — like Anki, but on your own server.

## Quick Reference

```bash
# Pull latest + rebuild everything
git pull && docker compose -f docker-compose.prod.yml up -d --build

# Rebuild frontend only
docker compose -f docker-compose.prod.yml up -d --build frontend

# Rebuild backend only
docker compose -f docker-compose.prod.yml up -d --build backend

# Run migrations (after backend changes)
docker compose -f docker-compose.prod.yml exec backend alembic upgrade head

# View logs
docker compose -f docker-compose.prod.yml logs -f
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend

# Check container status
docker compose -f docker-compose.prod.yml ps
```

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
| Infra     | Docker Compose + Cloudflare Tunnel    |

---

## Production Deploy

Uses Cloudflare Tunnel for routing — no open ports required beyond SSH.

### 1. Clone and configure

```bash
git clone <your-repo-url> ~/memorise
cd ~/memorise
cp .env.example .env
nano .env
```

Generate a secret key:
```bash
openssl rand -hex 32
```

`.env`:
```env
POSTGRES_USER=memorise
POSTGRES_PASSWORD=your-strong-password
POSTGRES_DB=memorise
SECRET_KEY=paste-generated-key-here
ENVIRONMENT=production
ALLOWED_ORIGINS=https://memorise.faradaydev.ca
VITE_API_URL=https://memorise-api.faradaydev.ca
```

### 2. Cloudflare Tunnel

Add to `~/.cloudflared/config.yml` (before the catch-all `http_status:404` line):

```yaml
  - hostname: memorise.faradaydev.ca
    service: http://localhost:8081
  - hostname: memorise-api.faradaydev.ca
    service: http://localhost:3232
```

Add DNS CNAME records in Cloudflare for both hostnames pointing to your tunnel ID, then:

```bash
sudo systemctl restart cloudflared
```

### 3. Start

```bash
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml exec backend alembic upgrade head
docker compose -f docker-compose.prod.yml exec backend python seed.py
```

### Updates

```bash
git pull
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml exec backend alembic upgrade head
```

---

## Local Development

Run the DB in Docker, everything else natively.

**Terminal 1 — Database**
```bash
docker compose up db
```

**Terminal 2 — Backend** (first time: create `backend/.env`, then run)
```bash
cd backend && python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt && alembic revision --autogenerate -m "initial" && alembic upgrade head && uvicorn app.main:app --reload --port 8000
```

After the first run:
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
├── docker-compose.yml      # Local dev (Vite dev server)
├── docker-compose.prod.yml # Production (built frontend + no dev ports)
├── .env.example
└── README.md
```

## Roadmap

- [x] Project scaffold (frontend + backend + Docker)
- [x] SM-2 spaced repetition algorithm
- [x] Database models (User, Deck, Card)
- [x] API routers (health, decks, cards)
- [x] Production deploy via Cloudflare Tunnel
- [ ] JWT authentication
- [ ] User registration + login UI
- [ ] Deck management UI
- [ ] Review session UI
- [ ] Progress / statistics dashboard
- [ ] Import from Anki (.apkg)
- [ ] Markdown card support
- [ ] Mobile-responsive review mode
