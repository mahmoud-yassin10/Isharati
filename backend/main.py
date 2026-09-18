from contextlib import asynccontextmanager
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

import state
from config import BASE_DIR
from db import init_db
from api.routes.auth import router as auth_router
from api.routes.lessons import router as lessons_router


@asynccontextmanager
async def lifespan(_app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="Raqeeb API",
    description="Egyptian Sign Language tutor: lessons, progress, and Isharati inference",
    lifespan=lifespan,
)

cors_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    *[origin.strip() for origin in os.getenv("CORS_ORIGINS", "").split(",") if origin.strip()],
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    from pose_loader import PoseLoader

    state.POSE_DATA = PoseLoader().get()
    print(f"Pose lexicon loaded: {len(state.POSE_DATA)} signs")
except Exception as exc:
    print(f"Pose lexicon not loaded: {exc}")
    state.POSE_DATA = None

app.include_router(auth_router)
app.include_router(lessons_router)

init_db()

ROUTES_LOADED = {
    "text_to_sign": False,
    "video": False,
    "sign_to_text": False,
}

try:
    from api.routes.text_to_sign import text_router

    app.include_router(text_router)
    ROUTES_LOADED["text_to_sign"] = True
    print("Text-to-sign routes loaded")
except Exception as exc:
    print(f"Text-to-sign routes not loaded: {exc}")

try:
    from api.routes.video import video_router

    app.include_router(video_router)
    ROUTES_LOADED["video"] = True
    print("Video routes loaded")
except Exception as exc:
    print(f"Video routes not loaded: {exc}")

try:
    from api.routes.Speech_to_text import speech_router
    from api.routes.sign_to_text import router as sign_to_text_router
    from api.routes.full_sentence_video import router as sentence_video_router

    app.include_router(speech_router)
    app.include_router(sign_to_text_router)
    app.include_router(sentence_video_router)
    ROUTES_LOADED["sign_to_text"] = True
except Exception as exc:
    print(f"Speech/sign-to-text routes not loaded: {exc}")


@app.get("/health")
def health():
    pose_count = len(state.POSE_DATA) if state.POSE_DATA else 0
    return {
        "status": "ok",
        "service": "raqeeb-api",
        "pose_count": pose_count,
        "routes": ROUTES_LOADED,
    }


static_dir = BASE_DIR / "static"
static_dir.mkdir(parents=True, exist_ok=True)
app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")