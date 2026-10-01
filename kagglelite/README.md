# KaggleLite

A Next.js App Router clone of Kaggle built with Tailwind CSS, Better-SQLite3, and Jose (JWT).

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Seed the database:**
   ```bash
   npm run seed
   ```
   This will create a `data/kagglelite.db` file and insert dummy users, competitions, datasets, models, discussions, and code.

3. **Run the development server:**
   ```bash
   npm run dev
   ```

## Demo Login

- **Email:** `demo@kagglelite.com`
- **Password:** `password123`

## Tech Stack
- Next.js 14+ (App Router)
- Tailwind CSS (with `--color-kaggle-blue`)
- Backend API (Route Handlers)
- SQLite Database (`better-sqlite3`)
- Auth: Custom HTTP-only Cookie with JWT (`jose`) and `bcryptjs`
- Icons: Lucide React

## DB Schema Overview
- `users`, `competitions`, `datasets`, `notebooks`, `models`, `discussions`, `replies`, `courses`, `leaderboard`, `competition_members`, `dataset_columns`, `upvotes`

## APIs
- `POST /api/auth/login`, `POST /api/auth/register`, `POST /api/auth/logout`, `GET /api/auth/me`
- `GET /api/competitions`, `GET /api/competitions/[slug]`, `POST /api/competitions/[slug]/join`, `GET/POST /api/competitions/[slug]/leaderboard`
- `GET /api/datasets`, `GET /api/datasets/[slug]`, `POST /api/datasets/[slug]/upvote`
- `GET /api/notebooks`, `GET /api/notebooks/[slug]`
- `GET /api/models`
- `GET /api/discussions`, `GET /api/discussions/[id]`
- `GET /api/courses`
- `GET /api/users/[username]`

Enjoy the demo!
