import json

from cryptography.fernet import Fernet

from config import BASE_DIR, POSE_KEY

POSE_ENC_PATH = BASE_DIR / "pose.enc"


class PoseLoader:

    def __init__(self):
        if not POSE_KEY:
            raise RuntimeError("POSE_KEY is missing. Copy backend/.env.example to backend/.env")

        cipher = Fernet(POSE_KEY.encode())

        with open(POSE_ENC_PATH, "rb") as f:
            encrypted = f.read()

        decrypted = cipher.decrypt(encrypted)

        self.pose_data = json.loads(decrypted)

    def get(self):

        return self.pose_data