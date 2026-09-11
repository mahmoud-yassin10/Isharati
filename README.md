# Isharati

AI tutor platform for Arabic / Egyptian sign language.

This repo is a monorepo: the trained vision model and translation API live in `backend/`. The website will live in `frontend/`.

```text
Isharati/
├── backend/     FastAPI + sign-recognition model + pose animation
├── frontend/    Website / tutor UI (to be built)
└── docs/        Architecture
```

Read [docs/architecture.md](docs/architecture.md) for how the pieces fit together.

## Current status

| Piece | Status |
|---|---|
| Sign recognition model (502 classes) | Ready in `backend/models/` |
| Text / speech → sign animation API | Ready, needs `.env` keys |
| Sign video → Arabic text API | Ready, needs RTMPose / GPU |
| Tutor website | Not started — `frontend/` is the home for it |
| Hosting | None yet |

## Run the API

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn main:app --reload --port 8000
```

Docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

The website should call this API at `http://127.0.0.1:8000`. CORS is already open for `localhost:3000`.
