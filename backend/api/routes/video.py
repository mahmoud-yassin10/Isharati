from io import BytesIO
from pathlib import Path

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from config import TEMP_DIR
from services.animation_generator import AnimationGenerator

video_router = APIRouter()
animator = AnimationGenerator()
POSE_STORE = TEMP_DIR / "generated_poses"


@video_router.get("/video/{request_id}")
def get_video(request_id: str):
    pose_path = POSE_STORE / f"{request_id}.pose"
    if not pose_path.exists():
        raise HTTPException(status_code=404, detail="Pose not found")

    try:
        video_path = animator.generate(BytesIO(pose_path.read_bytes()))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Video was not generated: {exc}") from exc
    if not video_path or not Path(video_path).exists():
        raise HTTPException(status_code=500, detail="Video was not generated")

    def iterfile():
        try:
            with open(video_path, "rb") as handle:
                while chunk := handle.read(1024 * 1024):
                    yield chunk
        finally:
            try:
                Path(video_path).unlink(missing_ok=True)
            except Exception as exc:
                print("Video cleanup error:", exc)

    return StreamingResponse(
        iterfile(),
        media_type="video/mp4",
        headers={
            "X-Request-Id": request_id,
            "Content-Disposition": f'inline; filename="{request_id}.mp4"',
        },
    )
