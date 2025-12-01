# from picamera2 import Picamera2
# from picamera2.encoders import H264Encoder
# from picamera2.outputs import FileOutput
# import time

# # Create camera object
# picam2 = Picamera2()

# # Configure video capture
# video_config = picam2.create_video_configuration(main={"size": (1920, 1080)})
# picam2.configure(video_config)

# # Start camera
# picam2.start()

# # Ask for filename
# filename = input("Enter a name for your video (without extension): ").strip()
# if not filename:
#     filename = "video"

# filename = f"{filename}.mp4"

# # Create output and encoder
# file_output = FileOutput(filename)
# encoder = H264Encoder()

# # Start recording
# print(f"🎬 Recording started... (saving as {filename})")
# picam2.start_recording(encoder=encoder, output=file_output)

# # Record for a fixed duration, or wait for user input
# record_time = input("Enter recording duration in seconds (or press Enter to stop manually): ").strip()

# if record_time:
#     time.sleep(int(record_time))
# else:
#     print("Press Ctrl+C to stop recording...")
#     try:
#         while True:
#             time.sleep(1)
#     except KeyboardInterrupt:
#         pass

# # Stop recording
# picam2.stop_recording()
# picam2.stop()

# print(f"Video saved as {filename}")
from pathlib import Path
from collections import deque
import tempfile, time, datetime as dt


from models.processing import process # import the process function

from picamera2 import Picamera2
from picamera2.encoders import H264Encoder
from picamera2.outputs import FfmpegOutput #mp4 cotainer needs ffmpeg

RESOLUTION = (1920,1080)
FPS = 30
RECORD_SECONDS = 4 #fix this later because our system isn't a set number of seconds
CLIP_DIR = Path(tempfile.gettempdir())/"pi_clips"
CLIP_DIR.mkdir(parents=True, exists = True)

class UltrasonicTrigger:
    '''This is just a placeholder right now for when we figure out
    the details for the ultrasonic GPIO pins and what stalls the video from being recorded'''
    def trigger_function(self):
        return
    
'''creates a unique timestamp based filename for each recorded video'''
def ts_name(prefix = "clip", ext = ".mp4"):
    return f"{prefix}_{dt.datetime.now().strftime('%Y%m%d_%H%M%S_%f')}{ext}"

'''declares and configures the camera to a fixed resolution, format'''
def build_cam():
    cam = Picamera2()
    cfg = cam.create_video_configuration(
        main={"size": RESOLUTION, "format": "RGB888"},
        controls={"FrameDurationLimits": (int(1e6/FPS), int(1e6/FPS))}
    )
    cam.configure(cfg)
    return cam

'''starts the camera recording to the exact file path that we passed in'''
def record_mp4(cam: Picamera2, output_path: Path, seconds: int):
    enc = H264Encoder(bitrate=8_000_000)
    out = FfmpegOutput(str(output_path))
    cam.start_recording(encoder = enc, output=out)
    try:
        time.sleep(seconds)
    finally:
        cam.stop_recording()

'''Creates a unique, tampestamped filename in the clip directory through ts_name(), then calls
record_mp4 with that path and the seconds of the video (FIX THIS), returning the path to this saved clip'''
def capture_event(cam:Picamera2) -> Path:
    p = CLIP_DIR / ts_name()
    record_mp4(cam,p,RECORD_SECONDS) #instance of frame length here -> FIX
    return p

'''the main function declares an ultrasonic instance as the trigger for the recording events,
the camera variable, tells us where the clip will be saved, creates a "memory" buffer and runs the loop to wait for trigger, 
start the camera, call the process function, and ends the process'''
def main():
    ultrasonic = UltrasonicTrigger()
    cam = build_cam()
    cam.start()

    print(f"saving file to {CLIP_DIR}")
    last_two = deque(maxlen=2)

    try:
        while True:
            ultrasonic.trigger_function()
            clip = capture_event(cam)
            print(f"saved: {clip}")

            last_two.append(clip)
            if len(last_two) ==2:
                prev, curr = last_two[0], last_two[1]
                print(f"comparing {prev.name} and {curr.name}")
                process(prev, curr) #from processing.py to get parsed
    except KeyboardInterrupt:
        print("Exiting from issues")
    finally:
        cam.stop()
        print("Ended camera process")
if __name__ == "__main__":
    main()