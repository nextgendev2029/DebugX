# DebugX 🚀

> An **AI-powered coding practice platform** with real-time code execution, AI feedback, step-by-step code visualization, and progress tracking — built as part of OJT 2026.

DebugX helps users solve coding problems, submit solutions, receive instant AI-powered feedback (via Gemini), track progress through heatmaps and streaks, bookmark problems, and visualize code execution line-by-line. Authentication is handled by Firebase; data lives in Neon PostgreSQL (production) or SQLite (local development); and the frontend is built with Next.js 14.

---

## 🌐 Live Deployment

| Service | URL |
|---|---|
| **Frontend** | [debugxfrontend.vercel.app](https://debugxfrontend.vercel.app) |
| **Backend API** | [debugx-backend.onrender.com](https://debugx-backend.onrender.com) |
| **API Docs (Swagger)** | [debugx-backend.onrender.com/docs](https://debugx-backend.onrender.com/docs) |

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | Next.js 14 (App Router) + TypeScript | File-based routing, SSR/CSR, type safety |
| **Styling** | Tailwind CSS | Utility-first, rapid UI development |
| **Authentication** | Firebase Auth | Google OAuth + email/password, JWT token verification |
| **Backend** | FastAPI (Python 3.11) | Async-ready REST API, automatic Swagger docs |
| **Database (Production)** | Neon PostgreSQL | Serverless Postgres, always-on cloud database |
| **Database (Local)** | SQLite + SQLAlchemy ORM | Zero-config local development |
| **AI Feedback** | Google Gemini 2.5 Flash | Intelligent code hints and feedback generation |
| **Code Visualizer** | `sys.settrace` + subprocess | Sandboxed step-by-step Python execution tracing |
| **Hosting** | Vercel (frontend) + Render (backend) | Serverless frontend, managed backend |

---

## 📁 Project Structure

```
OJT-2026/
├── README.md
├── .gitignore
│
├── backend/                        → FastAPI Python server
│   ├── .env.example                → Template for environment variables
│   ├── requirements.txt            → Python dependencies
│   ├── runtime.txt                 → Python version for Render (3.11.9)
│   ├── tracer_worker.py            → Sandboxed code execution worker
│   │
│   ├── scripts/
│   │   ├── seed_problems.py        → Seeds 10 coding problems into the database
│   │   └── seed_curriculum.py      → Seeds learning tracks and modules
│   │
│   └── app/
│       ├── models/
│       │   └── models.py           → All 10 SQLAlchemy ORM table definitions
│       │
│       ├── schemas/
│       │   └── schemas.py          → Pydantic request/response schemas
│       │
│       ├── routes/
│       │   ├── users.py            → User auth sync, profile updates, stats, leaderboard
│       │   ├── problems.py         → Problem listing and detail retrieval
│       │   ├── submissions.py      → Code execution, test judging, AI feedback, heatmap
│       │   ├── visualize.py        → AI Code Visualizer — step-by-step execution tracing
│       │   ├── bookmarks.py        → Bookmark CRUD operations
│       │   └── learning.py         → Learning tracks & modules (planned)
│       │
│       └── utils/
│           ├── config.py           → App settings loaded from .env (Pydantic Settings)
│           ├── database.py         → DB engine, session factory, get_db() dependency
│           ├── gemini.py           → Gemini AI SDK integration for code hints
│           ├── logger.py           → Centralized structured logging
│           └── main.py             → FastAPI app entry point, CORS, router registration
│
└── frontend/                       → Next.js 14 frontend
    ├── .env.example                → Template for environment variables
    ├── package.json                → Node dependencies and scripts
    ├── next.config.js              → Next.js configuration
    ├── tailwind.config.js          → Tailwind theme configuration
    │
    ├── app/                        → Next.js App Router — each folder = a route
    │   ├── layout.tsx              → Root layout with Auth & Theme Providers
    │   ├── page.tsx                → Landing page with features, FAQ, CTA
    │   ├── login/                  → Sign In page (Firebase email + Google)
    │   ├── signup/                 → Sign Up page with password criteria UI
    │   ├── dashboard/              → Interactive dashboard with heatmap & stats
    │   ├── problems/               → Problem list + Monaco code editor with AI feedback
    │   ├── profile/                → Multi-tab user profile settings
    │   ├── bookmarks/              → Bookmarked problems page
    │   ├── visualizer/             → AI Code Visualizer page
    │   └── learning/               → Learning tracks (planned)
    │
    ├── components/
    │   ├── layout/
    │   │   ├── Header.tsx          → Top navigation bar
    │   │   └── ProtectedRoute.tsx  → Auth guard — redirects unauthenticated users
    │   ├── editor/
    │   │   └── CodeEditor.tsx      → Monaco-based code editor component
    │   └── ui/
    │       ├── Badge.tsx           → Reusable badge/tag component
    │       └── ThemeToggle.tsx     → Dark/Light mode toggle
    │
    ├── contexts/
    │   └── AuthContext.tsx         → Firebase Auth state + backend sync
    │
    └── lib/
        ├── firebase.ts            → Firebase app initialization
        ├── api.ts                 → Centralized API call helpers
        └── logger.ts              → Frontend structured logging utility
```

---

## ✅ Current Feature Status

| Feature | Status |
|---|---|
| Project architecture & folder structure | ✅ Done |
| PostgreSQL (Neon) cloud database | ✅ Done |
| All 10 ORM models defined | ✅ Done |
| Firebase Auth (email + Google OAuth) | ✅ Done |
| User sync API (`POST /api/users/sync`) | ✅ Done |
| User profile update (`PATCH /api/users/update`) | ✅ Done |
| Problems API + listing page | ✅ Done |
| Code submission + automated test judging | ✅ Done |
| AI-powered code feedback (Gemini 2.5 Flash) | ✅ Done |
| User Activity Heatmap (GitHub-style) | ✅ Done |
| User stats, streaks, and leaderboard | ✅ Done |
| Multi-tab profile management | ✅ Done |
| Dashboard with real-time stats | ✅ Done |
| Auth state persistence | ✅ Done |
| Protected routes | ✅ Done |
| Bookmark management | ✅ Done |
| AI Code Visualizer (step-by-step tracing) | ✅ Done |
| Dark/Light theme toggle | ✅ Done |
| Landing page with FAQ | ✅ Done |
| Production deployment (Vercel + Render) | ✅ Done |
| Database seeding scripts | ✅ Done |
| Centralized logging (backend + frontend) | ✅ Done |
| Learning tracks & modules | 🔴 Planned |

---

## 🤝 Getting Started — Local Development

### Prerequisites

| Tool | Version | Check Command |
|---|---|---|
| **Node.js** | v18+ | `node -v` |
| **npm** | v9+ | `npm -v` |
| **Python** | v3.10+ | `python3 --version` |
| **Git** | any | `git --version` |

---

### Step 1 — Clone the Repo

```bash
git clone https://github.com/abhiraj75/OJT-2026.git
cd OJT-2026
```

---

### Step 2 — Backend Setup

```bash
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate        # Mac/Linux
# venv\Scripts\activate          # Windows

# Install dependencies
pip install -r requirements.txt
```

#### 2a — Configure Environment Variables

```bash
cp .env.example .env
```

Open `backend/.env` and fill in:

```env
DATABASE_URL=sqlite:///./debugx.db
FIREBASE_PROJECT_ID=your-firebase-project-id
GEMINI_API_KEY=your-gemini-api-key
CORS_ORIGINS=["http://localhost:3000"]
APP_ENV=development
SECRET_KEY=any-random-string-here
```

> For production, `DATABASE_URL` should point to a PostgreSQL connection string (e.g., Neon).

#### 2b — Seed the Database

```bash
python scripts/seed_problems.py
python scripts/seed_curriculum.py
```

#### 2c — Start the Backend Server

```bash
uvicorn app.utils.main:app --reload --port 8000
```

✅ Backend live at: **http://localhost:8000**
📖 Swagger docs at: **http://localhost:8000/docs**

---

### Step 3 — Frontend Setup

Open a **new terminal** (keep backend running):

```bash
cd frontend
npm install
```

#### 3a — Configure Environment Variables

```bash
cp .env.example .env.local
```

Open `frontend/.env.local` and fill in your Firebase credentials:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_API_URL=http://localhost:8000
```

> Ask the project owner for Firebase credentials, or create your own Firebase project.

#### 3b — Start the Frontend

```bash
npm run dev
```

✅ Frontend live at: **http://localhost:3000**

---

### Quick Reference — Both Servers

| Server | Command | URL |
|---|---|---|
| **Backend** | `uvicorn app.utils.main:app --reload --port 8000` | http://localhost:8000 |
| **Frontend** | `npm run dev` | http://localhost:3000 |

> 💡 **Tip:** Use two terminal tabs — one for each server. Both must be running simultaneously.

---

## 🗄️ Database Models

All models are defined in `backend/app/models/models.py` using SQLAlchemy ORM.

| Model | Table | Description |
|---|---|---|
| `User` | `users` | Firebase UID, email, username, stats, streak |
| `UserProgress` | `user_progress` | Tracks which problems each user has attempted/solved |
| `Problem` | `problems` | Title, description, difficulty, test cases, starter code |
| `Submission` | `submissions` | Code submissions — status, score, execution time, test results |
| `LearningTrack` | `learning_tracks` | Curriculum tracks (e.g., "Python Fundamentals") |
| `LearningModule` | `learning_modules` | Modules inside a track |
| `LearningSubmodule` | `learning_submodules` | Individual lessons inside a module |
| `Bookmark` | `bookmarks` | Problems bookmarked by a user |
| `AIFeedback` | `ai_feedback` | AI-generated feedback linked to a submission |
| `UserLearningProgress` | `user_learning_progress` | Tracks completed submodules per user |

### Enums

```python
UserRole:         STUDENT | ADMIN
DifficultyLevel:  EASY | MEDIUM | HARD
SubmissionStatus: PENDING | RUNNING | ACCEPTED | WRONG_ANSWER |
                  TIME_LIMIT_EXCEEDED | RUNTIME_ERROR | COMPILE_ERROR
```

### Entity Relationships

```
User ──< Submission ──< AIFeedback
User ──< UserProgress
User ──< Bookmark ──> Problem
User ──< UserLearningProgress

Problem ──< Submission
Problem ──< Bookmark

LearningTrack ──< LearningModule ──< LearningSubmodule ──< UserLearningProgress
```

---

## 🔐 Authentication Flow

```
User visits /login
    ↓
Types email/password OR clicks "Continue with Google"
    ↓
Firebase Auth (client-side) authenticates the user
    ↓
Firebase returns a signed JWT ID Token
    ↓
AuthContext sends token to: POST /api/users/sync
    with header: Authorization: Bearer <token>
    ↓
Backend verifies token via Google's public JWKS endpoint
    (no service account key needed)
    ↓
If user exists → updates last_login
If new user → creates a new DB row with auto-generated username
    ↓
Backend returns full user profile (id, email, username, stats)
    ↓
Frontend stores profile in AuthContext as `dbUser`
    ↓
User is redirected to /dashboard
```

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | Database connection string | `postgresql://...` or `sqlite:///./debugx.db` |
| `FIREBASE_PROJECT_ID` | Firebase project for token verification | `your-project-id` |
| `GEMINI_API_KEY` | Google Gemini API key for AI feedback | `AIza...` |
| `CORS_ORIGINS` | Allowed frontend origins (JSON array) | `["http://localhost:3000"]` |
| `APP_ENV` | Environment mode | `development` or `production` |
| `SECRET_KEY` | Application secret key | Random string |
| `MAX_EXECUTION_TIME` | Code execution timeout (seconds) | `10` |
| `MAX_MEMORY_MB` | Code execution memory limit | `256` |

### Frontend (`frontend/.env.local`)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Web SDK API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID |
| `NEXT_PUBLIC_API_URL` | Backend API URL |

> ⚠️ Never commit `.env` or `.env.local` — they are in `.gitignore`. Use `.env.example` as the reference template.

---

## ⚠️ Common Issues & Fixes

| Problem | Fix |
|---|---|
| `ModuleNotFoundError` in backend | Activate venv: `source venv/bin/activate` |
| `pip: command not found` | Use `pip3 install -r requirements.txt` |
| `npm install` fails | Check Node version: `node -v` (must be 18+) |
| Firebase `auth/unauthorized-domain` | Add your domain to Firebase Console → Authentication → Settings → Authorized domains |
| Backend CORS error | Confirm `CORS_ORIGINS` includes your frontend URL in `.env` |
| Port 8000 in use | `lsof -ti:8000 | xargs kill` (Mac/Linux) |
| Port 3000 in use | `npm run dev -- -p 3001` |

---

## 🏗️ Deployment Architecture

```
┌─────────────────┐     HTTPS      ┌──────────────────┐     PostgreSQL    ┌──────────────┐
│   Vercel         │ ─────────────→ │   Render          │ ──────────────→ │   Neon DB     │
│   (Next.js)      │   API calls    │   (FastAPI)        │   queries       │  (PostgreSQL)  │
│                  │                │                    │                 │              │
│  debugxfrontend  │                │  debugx-backend    │                 │  neondb      │
│  .vercel.app     │                │  .onrender.com     │                 │              │
└─────────────────┘                └──────────────────┘                 └──────────────┘
        │                                  │
        │ Firebase Auth (JWT)              │ Gemini AI API
        ↓                                  ↓
┌─────────────────┐                ┌──────────────────┐
│  Firebase Auth   │                │  Google Gemini    │
│  (Google OAuth)  │                │  2.5 Flash        │
└─────────────────┘                └──────────────────┘
```

---

## 👨‍💻 Developers

| Name | GitHub | Email |
|---|---|---|
| **Abhiraj** | [@abhiraj75](https://github.com/abhiraj75) | itsabhiraj27@gmail.com |
| **Tuhin Mondal** | [@nextgendev2029](https://github.com/nextgendev2029) | tuhinrock121@gmail.com |

**Project:** OJT 2026 — DebugX
