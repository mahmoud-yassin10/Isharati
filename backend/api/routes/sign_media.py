"""Decode a sign video without the recognition model.

The Fly image does not ship Torch, so /sign-to-text is otherwise missing and
every upload looks like "could not read the video". This route opens the file
(transcoding with ffmpeg when OpenCV cannot) and says whether it is a real video.
"""

from __future__ import annotations

import shutil
import subprocess
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from config import UPLOAD_DIR, VIDEO_EXTENSIONS

router = APIRouter(tags=["sign-check"])


def _frame_count(path: Path) -> int:
    try:
        import cv2
    except ImportError:
        return 0
    capture = cv2.VideoCapture(str(path))
    if not capture.isOpened():
        return 0
    frames = 0
    while frames < 8:
        ok, _frame = capture.read()
        if not ok:
            break
        frames += 1
    capture.release()
    return frames


def _ffmpeg() -> str | None:
    found = shutil.which("ffmpeg")
    if found:
        return found
    try:
        import imageio_ffmpeg
    except ImportError:
        return None
    return imageio_ffmpeg.get_ffmpeg_exe()


def _transcode(src: Path) -> Path:
    dest = src.with_suffix(".mp4")
    ffmpeg = _ffmpeg()
    if not ffmpeg:
        raise RuntimeError("ffmpeg is not installed")
    completed = subprocess.run(
        [ffmpeg, "-y", "-i", str(src), "-an", "-c:v", "libx264", "-pix_fmt", "yuv420p", str(dest)],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )
    if completed.returncode != 0 or not dest.exists() or dest.stat().st_size == 0:
        raise RuntimeError("ffmpeg could not read the video")
    return dest


@router.post("/sign-to-text")
async def sign_to_text_readable(
    files: list[UploadFile] = File(...),
    use_nlp: bool = Form(True),
):
    del use_nlp
    if not files:
        raise HTTPException(status_code=400, detail="No video")

    upload = files[0]
    suffix = Path(upload.filename or "").suffix.lower() or ".webm"
    if suffix not in VIDEO_EXTENSIONS and suffix != ".webm":
        suffix = ".webm"
    saved = UPLOAD_DIR / f"{uuid4().hex}{suffix}"
    with saved.open("wb") as handle:
        shutil.copyfileobj(upload.file, handle)

    try:
        frames = _frame_count(saved)
        if frames == 0:
            converted = _transcode(saved)
            frames = _frame_count(converted)
        if frames == 0:
            raise HTTPException(status_code=400, detail="Could not read the video")
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Could not read the video") from exc
    finally:
        for path in saved.parent.glob(f"{saved.stem}*"):
            try:
                path.unlink()
            except OSError:
                pass

    return {
        "req_id": uuid4().hex,
        "status": "received",
        "raw_words": [],
        "raw_sentence": "",
        "final_sentence": "",
        "predictions": [],
        "readable": True,
        "recognized": False,
    }
