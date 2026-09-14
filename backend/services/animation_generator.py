import os
import subprocess
import tempfile

import cv2
import imageio_ffmpeg
from pose_format import Pose
from pose_format.pose_visualizer import PoseVisualizer


class AnimationGenerator:
    def generate(self, pose):
        if hasattr(pose, "read"):
            pose.seek(0)
            pose = Pose.read(pose)
        elif isinstance(pose, str):
            with open(pose, "rb") as handle:
                pose = Pose.read(handle)

        visualizer = PoseVisualizer(pose)
        frames = list(visualizer.draw())
        if not frames:
            raise RuntimeError("PoseVisualizer produced no frames")

        height, width = frames[0].shape[:2]
        width -= width % 2
        height -= height % 2

        raw_video = tempfile.NamedTemporaryFile(suffix="_raw.mp4", delete=False)
        raw_video.close()
        final_video = tempfile.NamedTemporaryFile(suffix=".mp4", delete=False)
        final_video.close()

        try:
            writer = cv2.VideoWriter(
                raw_video.name,
                cv2.VideoWriter_fourcc(*"mp4v"),
                25,
                (width, height),
            )
            if not writer.isOpened():
                raise RuntimeError("Could not open OpenCV video writer")
            for frame in frames:
                if frame.shape[1] != width or frame.shape[0] != height:
                    frame = cv2.resize(frame, (width, height))
                writer.write(frame)
            writer.release()

            if not os.path.exists(raw_video.name) or os.path.getsize(raw_video.name) == 0:
                raise RuntimeError("OpenCV generated an empty raw video file")

            ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
            completed = subprocess.run(
                [
                    ffmpeg_exe,
                    "-y",
                    "-i",
                    raw_video.name,
                    "-an",
                    "-c:v",
                    "libx264",
                    "-pix_fmt",
                    "yuv420p",
                    "-movflags",
                    "+faststart",
                    final_video.name,
                ],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
            )
            if completed.returncode != 0:
                raise RuntimeError("FFmpeg H.264 conversion failed: " + completed.stderr[-2000:])
            if not os.path.exists(final_video.name) or os.path.getsize(final_video.name) == 0:
                raise RuntimeError("FFmpeg produced an empty H.264 video file")
            return final_video.name
        finally:
            try:
                if os.path.exists(raw_video.name):
                    os.remove(raw_video.name)
            except Exception:
                pass
