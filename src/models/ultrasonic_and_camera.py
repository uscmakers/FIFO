import RPi.GPIO as GPIO
import time
import os
from datetime import datetime
from picamera2 import Picamera2
from picamera2.encoders import H264Encoder
from picamera2.outputs import FileOutput

# BE SURE TO KILL CAMERA PROCESSES THAT START RUNNING UPON RESTART #

# Adjustable Parameters
TRIG = 23               # GPIO pin 23 (physical pin 16)
ECHO = 24               # GPIO pin 24 (physical pin 18)
THRESHOLD_CM = 5.0      # Distance threshold for open/closed (cm)
REQUIRED_READINGS = 5   # Consecutive readings to confirm open/close
VIDEO_DURATION = 15     # Seconds to record video after door closes
SAVE_DIR = "/home/pi/fridge_videos"  # Folder where videos are stored

# Ensure save directory exists
os.makedirs(SAVE_DIR, exist_ok=True)

# GPIO setup
GPIO.setmode(GPIO.BCM)
GPIO.setup(TRIG, GPIO.OUT)
GPIO.setup(ECHO, GPIO.IN)

# Initialize camera
picam2 = Picamera2()
video_config = picam2.create_video_configuration(main={"size": (1920, 1080)})
picam2.configure(video_config)
encoder = H264Encoder()
picam2.start()
print("Camera initialized and ready.")
time.sleep(2)

# Distance readings from ultrasonic sensor
def get_distance():
    """Trigger HC-SR04 and return distance in cm."""
    GPIO.output(TRIG, False)
    time.sleep(0.05)

    GPIO.output(TRIG, True)
    time.sleep(0.00001)
    GPIO.output(TRIG, False)

    timeout = time.time() + 0.04
    while GPIO.input(ECHO) == 0 and time.time() < timeout:
        pulse_start = time.time()
    while GPIO.input(ECHO) == 1 and time.time() < timeout:
        pulse_end = time.time()

    pulse_duration = pulse_end - pulse_start
    distance = pulse_duration * 17150
    return round(distance, 2)


# Door State Tracking
door_open_confirm = 0
door_close_confirm = 0
door_is_open = False
ready_for_next_trigger = True

print("Monitoring fridge door...\n")

try:
    while True:
        dist = get_distance()
        print(f"Distance: {dist:.2f} cm", end="\r")

        if not door_is_open:
            # Door currently closed
            if dist > THRESHOLD_CM:
                door_open_confirm += 1
                if door_open_confirm >= REQUIRED_READINGS:
                    door_is_open = True
                    ready_for_next_trigger = True
                    door_open_confirm = 0
                    print("\nDoor opened!")
            else:
                door_open_confirm = 0

        else:
            # Door currently open
            if dist < THRESHOLD_CM:
                door_close_confirm += 1
                if door_close_confirm >= REQUIRED_READINGS:
                    door_is_open = False
                    door_close_confirm = 0
                    if ready_for_next_trigger:
                        # Generate timestamped filename
                        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
                        filename = os.path.join(SAVE_DIR, f"fridge_{timestamp}.mp4")

                        print(f"\nDoor closed — recording video: {filename}")

                        # Create output and start recording
                        file_output = FileOutput(filename)
                        picam2.start_recording(encoder=encoder, output=file_output)

                        # Record for the set duration
                        time.sleep(VIDEO_DURATION)

                        # Stop recording
                        picam2.stop_recording()
                        print(f"Video saved as {filename}")

                        ready_for_next_trigger = False
            else:
                door_close_confirm = 0

        time.sleep(0.2)

except KeyboardInterrupt:
    print("\nStopped by user.")

finally:
    picam2.stop()
    GPIO.cleanup()
    print("Camera stopped and GPIO cleaned up.")
