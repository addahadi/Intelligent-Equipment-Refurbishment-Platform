# Plateforme de Reconditionnement Intelligent

Bilingual (FR / AR) platform for an intelligent equipment-refurbishment workflow:
maintenance companies submit used equipment as **offers**, an administrator
accepts them into a traceable refurbishment pipeline, and clients browse, favourite,
and (simulated-)purchase the resulting **composants** (organes & pièces).

- **Frontend** — React 19 + Vite + TypeScript (`frontend/`)
- **Backend** — Express + Supabase Postgres + Cloudinary + Zod (`backend/`)
- **Database** — PostgreSQL schema in `backend/db/schema.sql`

> The frontend currently runs on mock data; the backend is implemented as a
> standalone API and is **not yet wired into the frontend**.

---

## Repository layout

```
.
├── frontend/                 # React + Vite SPA (mock-data driven)
├── backend/                  # Express REST API
│   ├── db/                   # schema.sql (database schema only)
│   ├── config/               # database pool, env validation, cloudinary
│   ├── schemas/              # Zod validation (bilingual write contract)
│   ├── services/             # business logic + SQL (postgres tagged templates)
│   │   └── mappers/          # DB row → frontend-shape serializers
│   ├── controllers/          # thin request handlers
│   ├── routes/               # express routers (one per resource)
│   ├── middleware/           # auth, requireAdmin, validate, errorHandler, notFound
│   ├── utils/                # AppError, asyncHandler, lang helpers
│   ├── app.js / server.js    # app assembly / entry point
│   ├── seed.js               # seed admin + example categories
│   └── requests.http         # example calls for every endpoint (REST Client)
├── diagrams/                 # functional requirements & diagrams
└── specification_ui_ux.md    # UI/UX specification
```

---

## Backend

### Tech & design decisions

| Concern | Decision |
|---|---|
| Language of responses | Mono-lingual JSON matching the frontend types; language via `?lang=fr\|ar` (default `fr`) |
| Write contract | Mono-lingual fields → `*_fr`; optional `*Ar` fields → `*_ar` |
| Auth | JWT (7-day, no refresh) + bcrypt; `register` creates clients only; admins seeded |
| Responses | Raw resources on success; errors as `{ error: { code, message, details? } }` |
| Purchase | Stored function `acheter_composant()` (atomic row-lock; "already sold" → 409) |
| IDs / dates | `bigint` → `number`; `date` columns serialized as `YYYY-MM-DD` |
| Search / filters | Server-side using Postgres indexes + `search_vector` (FR-06 / FR-07) |
| Uploads | Proxied through `POST /uploads` (Multer in-memory → Cloudinary) |

### Prerequisites

- Node.js 18+
- A Supabase project (Postgres) with `backend/db/schema.sql` applied
- A Cloudinary account (only needed for image uploads)

### Setup

```bash
cd backend
npm install
cp .env.example .env      # then fill in the values (see below)
```

Apply the database schema once (e.g. paste `backend/db/schema.sql` into the
Supabase SQL Editor and run it), then:

```bash
npm run seed              # creates admin@reconditionnement.fr + example categories
npm run dev               # starts the API (nodemon)
```

You should see `API listening on http://localhost:3000/api`.

### Environment variables (`backend/.env`)

| Variable | Description |
|---|---|
| `SUPABASE_DB_URL` | Supabase **Transaction Pooler** connection string (port `6543`) — required |
| `JWT_SECRET` | Long random string used to sign tokens — required |
| `JWT_EXPIRES_IN` | Token lifetime (default `7d`) |
| `CLOUDINARY_URL` | `cloudinary://<key>:<secret>@<cloud_name>` (needed for `/uploads`) |
| `PORT` | API port (default `3000`) |
| `CORS_ORIGIN` | Allowed frontend origin (Vite default `http://localhost:5173`) |
| `ADMIN_SEED_PASSWORD` | Password for the seeded admin account |

> The `prepare: false` setting in `config/database.js` requires the Supabase
> **Transaction Pooler** URL (`...pooler.supabase.com:6543`), not the direct
> connection.

### Scripts

| Script | Action |
|---|---|
| `npm run dev` | Start the API with auto-reload (nodemon) |
| `npm start` | Start the API |
| `npm run seed` | Seed the admin user and example categories |

### API reference

Base URL: `/api` · Auth: `Authorization: Bearer <token>` · Language: `?lang=fr|ar`

Try everything via `backend/requests.http` (VS Code **REST Client** extension).

| Method | Endpoint | Access | Notes |
|---|---|---|---|
| POST | `/auth/register` | public | creates a CLIENT |
| POST | `/auth/login` | public | returns `{ token, user }` |
| GET | `/auth/me` | auth | current identity |
| GET | `/categories` | public | |
| POST | `/categories` | admin | |
| DELETE | `/categories/:id` | admin | |
| GET | `/composants` | public | filters: `etat, search, categorieId, type, marque, qualite, prixMin, prixMax, sort` |
| GET | `/composants/:id` | public | |
| POST | `/composants` | admin | |
| PATCH | `/composants/:id` | admin | partial update |
| POST | `/composants/:id/acheter` | client | simulated purchase |
| POST | `/composants/:id/pieces` | admin | declare salvageable child pieces (FR-32) |
| GET | `/composants/:id/etapes` | public | traceability timeline |
| POST | `/composants/:id/etapes` | admin | terminal steps flip state (FR-33) |
| PATCH | `/etapes/:id` | admin | |
| DELETE | `/etapes/:id` | admin | |
| POST | `/etapes/:id/reorder` | admin | `{ direction: "up"\|"down" }` |
| POST | `/offres` | public | submit offer (FR-17) |
| GET | `/offres` | admin | filter by `statut` |
| POST | `/offres/:id/accepter` | admin | creates a composant from the offer (FR-22) |
| POST | `/offres/:id/rejeter` | admin | |
| GET | `/favoris` | client | |
| PUT | `/favoris/:composantId` | client | add |
| DELETE | `/favoris/:composantId` | client | remove |
| GET | `/commandes` | auth | client sees own, admin sees all |
| POST | `/uploads` | auth | multipart `files`; returns `{ urls }` |
| GET | `/stats` | admin | dashboard metrics (FR-34) |

### Error envelope

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Données invalides.",
             "details": [{ "path": "email", "message": "Invalid email" }] } }
```

Codes: `VALIDATION_ERROR` (400), `UNAUTHENTICATED` (401), `FORBIDDEN` (403),
`NOT_FOUND` (404), `CONFLICT` (409), `INTERNAL` (500).

---

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Vite dev server runs at `http://localhost:5173`.

---

## License

Private — academic / startup project.
