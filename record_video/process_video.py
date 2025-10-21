import cv2

# Ask user for the video file to process
video_file = input("Enter the path to the video file to process: ").strip()
if not video_file:
    print("No video file provided. Exiting.")
    exit()

cap = cv2.VideoCapture(video_file)

if not cap.isOpened():
    print(f"Error opening video file: {video_file}")
    exit()

# Get total number of frames
total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
print("Total frames in video:", total_frames)

# Frame positions: beginning, middle, end
frame_indices = [0, total_frames // 2, total_frames - 1]

for idx, frame_no in enumerate(frame_indices):
    cap.set(cv2.CAP_PROP_POS_FRAMES, frame_no)
    ret, frame = cap.read()
    if ret:
        # Ask user for filename for each frame
        filename = input(f"Enter filename for frame {idx+1} (without extension): ").strip()
        if not filename:
            filename = f"frame_{idx+1}"
        filename += ".png"
        
        cv2.imwrite(filename, frame)
        print(f"Saved {filename}")
    else:
        print(f"Failed to read frame {frame_no}")

cap.release()
print("Done extracting frames.")
