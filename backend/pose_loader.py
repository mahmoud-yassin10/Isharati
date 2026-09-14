import json
from pathlib import Path

from config import BASE_DIR, POSE_KEY

POSE_JSON_PATH = BASE_DIR / "poses.json"
POSE_ENC_PATH = BASE_DIR / "pose.enc"


class PoseLoader:
    def __init__(self):
        if POSE_JSON_PATH.exists():
            with open(POSE_JSON_PATH, "r", encoding="utf-8") as handle:
                self.pose_data = json.load(handle)
            return

        if not POSE_KEY:
            raise RuntimeError(
                "POSE_KEY is missing and backend/poses.json was not found."
            )

        from cryptography.fernet import Fernet

        cipher = Fernet(POSE_KEY.encode())
        with open(POSE_ENC_PATH, "rb") as handle:
            self.pose_data = json.loads(cipher.decrypt(handle.read()))

    def get(self):
        return self.pose_data
