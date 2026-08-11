# Local Development Server dengan Docker Compose

Pattern untuk menjalankan seluruh stack aplikasi (backend + frontend + database) secara lokal di dalam container Docker. Satu perintah untuk start semuanya, terisolasi dari mesin host.

## Kenapa Pakai Pattern Ini?

- **Zero setup di host** — tidak perlu install database atau lock versi Node di mesin. Cukup Docker.
- **Environment parity** — semua developer pakai versi Node/Postgres yang persis sama.
- **Auto-orchestration** — backend otomatis nunggu database siap, frontend nunggu backend siap.
- **Reset mudah** — satu perintah untuk hapus semua data dan mulai fresh.

## Struktur Folder

Nama folder orchestration bebas — `infra/`, `docker/`, `dev/`, atau taruh langsung di root. Contoh pakai `docker/`:

```
project-root/
├── docker/
│   ├── docker-compose.yml
│   └── .env                  # secrets — JANGAN commit
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   └── ...
└── .gitignore                # harus include: docker/.env
```

> Catatan: `context: ../backend` di compose file itu **relatif terhadap lokasi `docker-compose.yml`**. Kalau Anda pindah/ganti nama folder, sesuaikan path relatifnya. Kalau compose file di root, jadi `context: ./backend`.

## File 1: `docker-compose.yml`

```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d myapp"]
      interval: 5s
      timeout: 5s
      retries: 10
    ports:
      - "5432:5432"

  backend:
    build:
      context: ../backend        # relatif ke lokasi file ini
    environment:
      PORT: 4000
      HOST: 0.0.0.0
      APP_ENV: local
      DATABASE_URL: postgres://postgres:postgres@db:5432/myapp
      DATABASE_SSL: "false"
      CORS_ORIGIN: "*"
    depends_on:
      db:
        condition: service_healthy
    extra_hosts:
      # Supaya container bisa akses service yang jalan di mesin host
      - "host.docker.internal:host-gateway"
    ports:
      - "4000:4000"
    healthcheck:
      test: ["CMD-SHELL", "wget -qO- http://127.0.0.1:4000/health >/dev/null 2>&1 || exit 1"]
      interval: 10s
      timeout: 5s
      retries: 5

  frontend:
    build:
      context: ../frontend
      args:
        # PENTING: NEXT_PUBLIC_* di-bake saat build, harus lewat ARG
        NEXT_PUBLIC_API_BASE_URL: http://localhost:4000/api
        NEXT_PUBLIC_APP_ENV: local
    environment:
      NEXT_PUBLIC_API_BASE_URL: http://localhost:4000/api
      NEXT_PUBLIC_APP_ENV: local
    depends_on:
      backend:
        condition: service_healthy
    ports:
      - "3000:3000"

volumes:
  postgres-data:
```

### Kenapa Tiap Bagian Ada

| Bagian | Fungsi |
|--------|--------|
| `postgres:16-alpine` | Image kecil (~90MB vs 400MB+ image penuh) |
| `healthcheck` di `db` | Memastikan DB benar-benar siap terima query, bukan cuma "container nyala" |
| `depends_on: condition: service_healthy` | Backend baru start setelah healthcheck DB lulus (bukan sekadar container up) |
| Named volume `postgres-data` | Data DB bertahan walau container di-restart |
| `DATABASE_URL` pakai host `db` | Antar-container saling kenal lewat **nama service**, bukan `localhost` |
| `extra_hosts: host.docker.internal` | Kalau backend perlu akses service di mesin host (Redis dev, dll.) |
| `DATABASE_SSL: "false"` | Postgres lokal tanpa SSL; production biasanya `"true"` |
| `CORS_ORIGIN: "*"` | Bebas untuk dev; production diisi domain spesifik |

## File 2: `backend/Dockerfile` (Node.js, multi-stage)

Multi-stage build → image final minimal, tanpa build tools:

```dockerfile
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=deps /app/node_modules ./node_modules
EXPOSE 4000
CMD ["node", "dist/index.js"]
```

**Tiga stage:**
- `deps` — install dependencies (jadi cache layer; hanya rebuild kalau `package.json` berubah)
- `builder` — compile TypeScript / bundle
- `runner` — image akhir, cuma bawa `dist/`, `node_modules/`, `package.json`

## File 3: `frontend/Dockerfile` (Next.js standalone)

```dockerfile
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install

FROM node:22-alpine AS builder
WORKDIR /app
# NEXT_PUBLIC_* HARUS di-set saat build (di-inline ke JS bundle)
ARG NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api
ARG NEXT_PUBLIC_APP_ENV=production
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
ENV NEXT_PUBLIC_APP_ENV=${NEXT_PUBLIC_APP_ENV}
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

**Prasyarat di `frontend/next.config.js`:**
```js
module.exports = {
  output: 'standalone',  // wajib untuk pattern COPY di atas
};
```

Standalone output = bundle Next.js dengan runtime minimal, jauh lebih kecil dari menyalin seluruh `node_modules`.

## File 4: `.env` (jangan commit)

Taruh di folder yang **sama** dengan `docker-compose.yml`. Compose otomatis load-nya:

```env
# Contoh secrets yang tidak boleh masuk repo
SOME_API_KEY=your-secret-here
```

Tambahkan ke `.gitignore` root:
```
docker/.env
```

Cara pakainya di compose file — reference dengan default kosong:
```yaml
    environment:
      SOME_API_KEY: ${SOME_API_KEY:-}
```

## Config Pattern di Backend

Baca env dengan default aman supaya kode yang sama jalan di local dan production.

`backend/src/config.ts`:
```typescript
function parseBoolean(value: string | undefined): boolean | null {
  if (!value) return null;
  const v = value.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(v)) return true;
  if (["0", "false", "no", "off"].includes(v)) return false;
  return null;
}

function parseCorsOrigin(value: string | undefined): string | string[] | boolean {
  if (!value) return true;                    // izinkan semua kalau kosong
  const parts = value.split(",").map(s => s.trim()).filter(Boolean);
  if (parts.length === 0) return true;
  if (parts.length === 1) return parts[0];    // satu domain
  return parts;                               // banyak domain
}

export const config = {
  port: Number(process.env.PORT ?? 4000),
  host: process.env.HOST ?? "0.0.0.0",
  appEnv: process.env.APP_ENV ?? process.env.NODE_ENV ?? "production",
  databaseUrl: process.env.DATABASE_URL ?? "postgres://postgres:postgres@localhost:5432/myapp",
  databaseSsl: parseBoolean(process.env.DATABASE_SSL),
  corsOrigin: parseCorsOrigin(process.env.CORS_ORIGIN),
};
```

## Postgres SSL Auto-detect

Supaya satu kodebase jalan di local (SSL off) dan production (SSL on) tanpa ganti kode.

`backend/src/db.ts`:
```typescript
import { Pool } from "pg";
import { config } from "./config.js";

function isLocalDatabaseUrl(url: string) {
  try {
    const { hostname } = new URL(url);
    // "db" = nama service Postgres di docker-compose
    return ["localhost", "127.0.0.1", "db"].includes(hostname);
  } catch {
    return false;
  }
}

function shouldUseDatabaseSsl() {
  if (config.databaseSsl !== null) return config.databaseSsl;  // override eksplisit menang
  if (config.appEnv === "production") return true;
  return !isLocalDatabaseUrl(config.databaseUrl);              // non-lokal = butuh SSL
}

export const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: shouldUseDatabaseSsl() ? { rejectUnauthorized: false } : false,
});
```

## Cara Menjalankan

Jalankan dari folder yang berisi `docker-compose.yml`:

```bash
# Pertama kali, atau kalau Dockerfile/dependencies berubah
docker compose up --build

# Selanjutnya (tanpa perubahan build)
docker compose up

# Jalan di background
docker compose up -d

# Lihat logs satu service
docker compose logs -f backend

# Stop
docker compose down

# Stop + hapus data DB (reset total)
docker compose down -v

# Rebuild satu service saja
docker compose up --build backend
```

Setelah start:
- Frontend → `http://localhost:3000`
- Backend → `http://localhost:4000`
- Health check → `http://localhost:4000/health`
- DB dari host (misal via DBeaver) → `localhost:5432`, user `postgres`, pass `postgres`

## Gotchas yang Sering Menjebak

### 1. `NEXT_PUBLIC_*` tidak update
Env `NEXT_PUBLIC_*` di-**bake ke bundle saat build**, bukan dibaca runtime.
→ Ubah nilainya harus **rebuild frontend**: `docker compose up --build frontend`. `restart` saja tidak cukup.

### 2. Backend "up" tapi query DB gagal (connection refused)
Container nyala tapi DB belum siap terima koneksi.
→ Pakai `depends_on: condition: service_healthy`, bukan cuma `depends_on: [db]`.

### 3. Antar-container tidak saling nemu
Di dalam container, `localhost` = container itu sendiri.
→ Untuk konek antar service pakai **nama service** (`db`, `backend`), bukan `localhost`.
→ Untuk akses service di mesin host, pakai `host.docker.internal`.

### 4. Ganti kode tapi tidak ter-reflect
Compose ini build image sekali, **tidak** hot-reload source.
→ Untuk workflow dev dengan hot-reload: mount volume `volumes: [../backend/src:/app/src]` + override `command` ke `npm run dev`.
→ Alternatif: jalankan backend/frontend native di host, hanya `db` yang di-container.

### 5. Port bentrok
`bind: address already in use` → port 3000/4000/5432 sudah dipakai proses lain.
→ Ubah sisi host: `ports: "4001:4000"` (format `host:container`).

### 6. `.env` tidak ke-load
Compose hanya auto-load `.env` di folder yang **sama** dengan `docker-compose.yml`.
→ Jangan taruh di root kalau compose file ada di subfolder.

## Migrasi ke Production

Compose ini **hanya untuk local dev**. Production umumnya split per platform, dan yang berubah cuma **environment variables** — kode tetap sama:

| Env | Local | Production |
|-----|-------|-----------|
| `DATABASE_URL` | `postgres://...@db:5432/...` | connection string DB production |
| `DATABASE_SSL` | `false` | `true` |
| `CORS_ORIGIN` | `*` | domain frontend production |
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:4000/api` | URL backend production |

Contoh pembagian host: frontend di Vercel, backend di Railway/Fly/Render, database di Postgres managed (Railway/Neon/Supabase). Backend dengan WebSocket / connection pool persisten sebaiknya **bukan** di serverless.

## Add-on Opsional

**Redis (session/cache):**
```yaml
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
```
Di backend: `REDIS_URL: redis://redis:6379`

**pgAdmin (GUI Postgres):**
```yaml
  pgadmin:
    image: dpage/pgadmin4:latest
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@local.dev
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - "5050:80"
    depends_on:
      - db
```

## Checklist Setup di Project Baru

- [ ] Buat folder orchestration (nama bebas) berisi `docker-compose.yml` + `.env`
- [ ] Buat `backend/Dockerfile` (multi-stage Node)
- [ ] Buat `frontend/Dockerfile` (multi-stage Next standalone) + `output: 'standalone'` di next.config
- [ ] Tambah endpoint `/health` di backend (return 200)
- [ ] Backend baca env: `DATABASE_URL`, `CORS_ORIGIN`, `PORT`, `HOST`, `DATABASE_SSL`
- [ ] Sesuaikan `context:` path di compose sesuai lokasi folder
- [ ] `.gitignore` include file `.env`-nya
- [ ] Test: `docker compose up --build` → buka `localhost:3000`
- [ ] Test reset: `docker compose down -v` → `up` lagi → DB harus kosong