from io import BytesIO
from pathlib import Path
import re
import shutil

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from config import TEMP_DIR
from services.animation_generator import AnimationGenerator

video_router = APIRouter()
animator = AnimationGenerator()
POSE_STORE = TEMP_DIR / "generated_poses"
VIDEO_STORE = TEMP_DIR / "generated_videos"
VIDEO_STORE.mkdir(parents=True, exist_ok=True)

_REQUEST_ID = re.compile(r"^[A-Za-z0-9_-]+$")


def _safe_id(request_id: str) -> str:
    if not _REQUEST_ID.match(request_id):
        raise HTTPException(status_code=400, detail="Invalid request id")
    return request_id


def _cached_video(request_id: str) -> Path:
    pose_path = POSE_STORE / f"{request_id}.pose"
    if not pose_path.exists():
        raise HTTPException(status_code=404, detail="Pose not found")

    video_path = VIDEO_STORE / f"{request_id}.mp4"
    if video_path.exists() and video_path.stat().st_size > 0:
        return video_path

    try:
        generated = animator.generate(BytesIO(pose_path.read_bytes()))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Video was not generated: {exc}") from exc
    if not generated or not Path(generated).exists():
        raise HTTPException(status_code=500, detail="Video was not generated")

    video_path.parent.mkdir(parents=True, exist_ok=True)
    try:
        shutil.move(generated, video_path)
    except OSError:
        shutil.copy2(generated, video_path)
        Path(generated).unlink(missing_ok=True)
    return video_path


@video_router.get("/video/{request_id}")
def get_video(request_id: str):
    safe_id = _safe_id(request_id)
    video_path = _cached_video(safe_id)
    return FileResponse(
        path=video_path,
        media_type="video/mp4",
        filename=f"{safe_id}.mp4",
        content_disposition_type="inline",
        headers={
            "X-Request-Id": safe_id,
            "Accept-Ranges": "bytes",
            "Cache-Control": "public, max-age=3600",
        },
    )
