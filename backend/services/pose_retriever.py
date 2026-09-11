import requests
from io import BytesIO
from pose_format import Pose

import state


class PoseRetriever:

    def __init__(self, pose_db=None):
        self.pose_db = pose_db if pose_db is not None else (state.POSE_DATA or {})
        self.cache = {}
        
    def retrieve(self, tokens):

        pose_paths = []

        for token in tokens:

            # check token exists
            if token not in self.pose_db:
                print(f"Missing pose: {token}")
                continue

            url = self.pose_db[token]["url"]

            try:
                if token in self.cache:
                    pose_paths.append(self.cache[token])
                    continue
                response = requests.get(url)

                if response.status_code != 200:
                    print(f"Failed download: {token}")
                    continue

                pose = Pose.read(BytesIO(response.content))
                
                self.cache[token] = pose

                pose_paths.append(pose)

                print(f"Downloaded: {token}")

            except Exception as e:
                print(f"Error downloading {token}: {e}")

        return pose_paths