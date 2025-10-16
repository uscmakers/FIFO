# record_video_picamera2.py
from picamera2 import Picamera2, Preview
from picamera2.encoders import H264Encoder
from picamera2.outputs import FfmpegOutput
import time

picam2 = Picamera2()

# 1080p at ~30 fps is fine on Pi 4/5
config = picam2.create_video_configuration(
    main={"size": (1920, 1080), "format": "RGB888"}
)
picam2.configure(config)

# Continuous autofocus for Camera Module 3
picam2.set_controls({"AfMode": 2})

# H.264 encode and write to MP4 using ffmpeg
encoder = H264Encoder(bitrate=8_000_000)  # adjust bitrate to taste
output = FfmpegOutput("clip.mp4")

picam2.start_recording(encoder, output)
print("Recording...")

time.sleep(10)  # record 10 seconds

picam2.stop_recording()
print("Saved clip.mp4")
