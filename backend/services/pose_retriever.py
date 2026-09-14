from io import BytesIO
from pathlib import Path
from urllib.parse import quote, urlsplit, urlunsplit

import requests
from pose_format import Pose

import state
from config import TEMP_DIR

CACHE_DIR = TEMP_DIR / "pose_cache"
CACHE_DIR.mkdir(parents=True, exist_ok=True)


def encode_pose_url(url: str) -> str:
    parts = urlsplit(url)
    segments = parts.path.split("/")
    if segments:
        segments[-1] = quote(segments[-1])
    return urlunsplit((parts.scheme, parts.netloc, "/".join(segments), parts.query, parts.fragment))


class PoseRetriever:
    def __init__(self, pose_db=None):
        self.pose_db = pose_db if pose_db is not None else (state.POSE_DATA or {})
        self.cache: dict[str, Pose] = {}

    def retrieve(self, tokens):
        poses = []
        for token in tokens:
            if token not in self.pose_db:
                print(f"Missing pose: {token}")
                continue
            if token in self.cache:
                poses.append(self.cache[token])
                continue
            try:
                pose = self._load_token(token)
            except Exception as exc:
                print(f"Error downloading {token}: {exc}")
                continue
            if pose is None:
                continue
            self.cache[token] = pose
            poses.append(pose)
        return poses

    def _load_token(self, token: str):
        safe_name = quote(token, safe="")
        cached = CACHE_DIR / f"{safe_name}.pose"
        if cached.exists() and cached.stat().st_size > 0:
            return Pose.read(BytesIO(cached.read_bytes()))

        url = encode_pose_url(self.pose_db[token]["url"])
        response = requests.get(url, timeout=30)
        if response.status_code != 200 or not response.content:
            print(f"Failed download: {token} ({response.status_code})")
            return None
        cached.write_bytes(response.content)
        return Pose.read(BytesIO(response.content))
