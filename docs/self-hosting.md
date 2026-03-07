# Self-Hosting Guide — memorise.faradaydev.ca

This guide covers deploying Memorise behind Nginx with SSL via Certbot on a homelab server.

## Architecture

```
Internet
   │
   ▼
Nginx :443 (HTTPS)
   ├── /api/*  → backend:8000  (internal only — port 3232 NOT exposed publicly)
   └── /*      → frontend:5173 or static build

Docker Compose (internal network)
   ├── frontend  :5173
   ├── backend   :8000 (mapped to host :3232 for local dev only)
   └── db        :5432
```

> **Note:** In production, port 3232 does **not** need to be publicly accessible.
> Nginx proxies `/api/` traffic directly to the backend container over the internal Docker network.
> Remove or firewall the `3232` port mapping in `docker-compose.yml` for production.

## Prerequisites

- A Linux server (Ubuntu 22.04+ recommended)
- Docker + Docker Compose installed
- A domain pointing to your server (e.g. `memorise.faradaydev.ca`)
- Nginx installed: `sudo apt install nginx`
- Certbot: `sudo apt install certbot python3-certbot-nginx`

## 1. Clone and Configure

```bash
git clone <your-repo-url> /opt/memorise
cd /opt/memorise

cp .env.example .env
nano .env  # Set POSTGRES_PASSWORD, SECRET_KEY, ENVIRONMENT=production
```

Generate a strong secret key:

```bash
openssl rand -hex 32
```

## 2. Nginx Configuration

Create `/etc/nginx/sites-available/memorise`:

```nginx
server {
    listen 80;
    server_name memorise.faradaydev.ca;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name memorise.faradaydev.ca;

    ssl_certificate     /etc/letsencrypt/live/memorise.faradaydev.ca/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/memorise.faradaydev.ca/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;

    # Security headers
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # API — proxied to backend container (internal Docker port)
    location /api/ {
        rewrite ^/api/(.*) /$1 break;
        proxy_pass http://127.0.0.1:3232;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
        proxy_connect_timeout 10s;
    }

    # Frontend — either proxy to dev server or serve static build
    location / {
        proxy_pass http://127.0.0.1:5173;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        # WebSocket support (Vite HMR in dev)
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Enable it:

```bash
sudo ln -s /etc/nginx/sites-available/memorise /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 3. SSL Certificate

```bash
sudo certbot --nginx -d memorise.faradaydev.ca
```

Certbot will auto-renew. Verify the timer:

```bash
sudo systemctl status certbot.timer
```

## 4. Start the Application

```bash
cd /opt/memorise
docker compose up -d --build
```

Run migrations:

```bash
docker compose exec backend alembic upgrade head
```

## 5. Production Firewall Notes

Ensure only ports 80 and 443 are publicly exposed:

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
# Do NOT expose 3232 or 5432 publicly
sudo ufw enable
```

## 6. Updates

```bash
cd /opt/memorise
git pull
docker compose up -d --build
docker compose exec backend alembic upgrade head
```

## Troubleshooting

| Issue | Command |
|-------|---------|
| Check logs | `docker compose logs -f backend` |
| DB not ready | `docker compose ps` — check db healthcheck status |
| 502 Bad Gateway | `docker compose up -d` — ensure containers are running |
| Migrations pending | `docker compose exec backend alembic current` |
