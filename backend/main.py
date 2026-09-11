from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

import state
from config import BASE_DIR
from pose_loader import PoseLoader
from api.routes.text_to_sign import text_router
from api.routes.Speech_to_text import speech_router
from api.routes.video import video_router
from api.routes.sign_to_text import router as sign_to_text_router
from api.routes.full_sentence_video import router as sentence_video_router

app = FastAPI(
    title="Isharati API",
    description="Arabic / Egyptian sign language translation backend",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    state.POSE_DATA = PoseLoader().get()
except Exception as exc:
    print(f"Pose lexicon not loaded: {exc}")
    state.POSE_DATA = None

app.include_router(text_router)
app.include_router(speech_router)
app.include_router(video_router)
app.include_router(sign_to_text_router)
app.include_router(sentence_video_router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "isharati-api"}


static_dir = BASE_DIR / "static"
static_dir.mkdir(parents=True, exist_ok=True)
app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")