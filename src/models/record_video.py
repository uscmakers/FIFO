from picamera2 import Picamera2
from picamera2.encoders import H264Encoder
from picamera2.outputs import FileOutput
import time

# Create camera object
picam2 = Picamera2()

# Configure video capture
video_config = picam2.create_video_configuration(main={"size": (1920, 1080)})
picam2.configure(video_config)

# Start camera
picam2.start()

# Ask for filename
filename = input("Enter a name for your video (without extension): ").strip()
if not filename:
    filename = "video"

filename = f"{filename}.mp4"

# Create output and encoder
file_output = FileOutput(filename)
encoder = H264Encoder()

# Start recording
print(f"🎬 Recording started... (saving as {filename})")
picam2.start_recording(encoder=encoder, output=file_output)

# Record for a fixed duration, or wait for user input
record_time = input("Enter recording duration in seconds (or press Enter to stop manually): ").strip()

if record_time:
    time.sleep(int(record_time))
else:
    print("Press Ctrl+C to stop recording...")
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        pass

# Stop recording
picam2.stop_recording()
picam2.stop()

print(f"Video saved as {filename}")
