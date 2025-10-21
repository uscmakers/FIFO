import sys, cv2
from pathlib import Path

vidPairs = []

def newestMp4(dirPath: Path) -> Path:
    files = list(dirPath.glob("*.mp4"))
    if not files:
        raise FileNotFoundError("No .mp4 files found")
    return max(files, key=lambda p: p.stat().st_mtime) # find latest mp4 file

def process(path1: Path, path2: Path):
    frameCount = 0
    capture1 = cv2.VideoCapture(str(path1))
    capture2 = cv2.VideoCapture(str(path2))

    if not capture1.isOpened() or not capture2.isOpened():
        raise RuntimeError("Could not open")
    
    # otherwise, processing continues
    print("Processing... (press q to quit)")

    # get video properties
    frameCount = int(capture1.get(cv2.CAP_PROP_FRAME_COUNT))

    #print(f"{path1.name}: {fps1:.2f} FPS, {frameCount1} frames")
    #print(f"{path2.name}: {fps2:.2f} FPS, {frameCount2} frames")

    # get first frame, middle frame, and last frame for both clips (0, 255, 450th frame)
    framesToCapture = [0, frameCount // 2, frameCount - 1]

    extractedFrames1 = []
    extractedFrames2 = []

     # extract first, middle, and last frames for both clips
    for frame in framesToCapture:
        f1 = framesToCapture[frame]
        f2 = framesToCapture[frame]

        capture1.set(cv2.CAP_PROP_POS_FRAMES, f1)
        capture2.set(cv2.CAP_PROP_POS_FRAMES, f2)

        ret1, frame1 = capture1.read()
        ret2, frame2 = capture2.read()

        if not ret1 or not ret2:
            print(f"Failed to read frame pair {i+1}")
            continue

        extractedFrames1.append(frame1)
        extractedFrames2.append(frame2)

        # Combine frames for comparison
        combined = cv2.hconcat([frame1, frame2])
        cv2.imshow(f"Comparison {i+1}", combined)
        print(f"Captured pair {i+1}: Frame {f1} ({path1.name}), Frame {f2} ({path2.name})")

        key = cv2.waitKey(1000) & 0xFF  # display each for 1 second
        if key == ord('q'):
            break
        cv2.destroyWindow(f"Comparison {i+1}")

    capture1.release()
    capture2.release()
    cv2.destroyAllWindows()

    print("\nFrame extraction complete. Ready for ML comparison.")
    return extractedFrames1, extractedFrames2
        
def main():
    # checking if an argument (video clip) was passed into main (manual from user)
    if len(sys.argv) > 1:
        vid = Path(sys.argv[1]).expanduser()
    else:
        vid = newestMp4(Path("~/Downloads").expanduser()) # automatic

    if len(vidPairs) > 2:
        vidPairs.pop(0) # remove first (older) video

    vidPairs.append(vid)

    # if vidPairs length = 2: then pass both video clips into process. otherwise, wait
    if(len(vidPairs) == 2):
        process(vidPairs[0], vidPairs[1]) # pass both paths
    
    if len(sys.argv) > 1:
        print("First argument:", sys.argv[1])

if __name__ == "__main__":
    main()