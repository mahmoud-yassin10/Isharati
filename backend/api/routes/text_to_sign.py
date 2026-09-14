import uuid
from io import BytesIO
from pathlib import Path

from fastapi import APIRouter, HTTPException

from config import TEMP_DIR
from schemas.requests import TextInput
from services.arabic_normalizer import ArabicNormalizer
from services.pose_retriever import PoseRetriever
from services.pose_smoother import PoseSmoother

text_router = APIRouter()
POSE_STORE = TEMP_DIR / "generated_poses"
POSE_STORE.mkdir(parents=True, exist_ok=True)

_normalizer = None
_smoother = PoseSmoother()


def get_normalizer() -> ArabicNormalizer:
    global _normalizer
    if _normalizer is None:
        _normalizer = ArabicNormalizer()
    return _normalizer


def save_pose(pose, request_id: str) -> Path:
    path = POSE_STORE / f"{request_id}.pose"
    buffer = BytesIO()
    pose.write(buffer)
    path.write_bytes(buffer.getvalue())
    return path


@text_router.post("/text-to-sign")
def text_to_sign(data: TextInput):
    request_id = data.request_id or str(uuid.uuid4())
    tokens = get_normalizer().tokenize(data.sentence)
    if not tokens:
        raise HTTPException(status_code=400, detail="No matching sign tokens found")

    poses = PoseRetriever().retrieve(tokens)
    if not poses:
        raise HTTPException(status_code=404, detail="No pose files found for those tokens")

    stitched = _smoother.smooth(poses)
    if stitched is None:
        raise HTTPException(status_code=500, detail="Pose stitching failed")

    save_pose(stitched, request_id)
    return {
        "success": True,
        "request_id": request_id,
        "tokens": tokens,
    }
