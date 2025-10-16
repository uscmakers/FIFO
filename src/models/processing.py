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
    print("Processing... (press q to quit)")

    while True: # so it continuously checks 
        isProcessed1, frame1 = capture1.read()
        isProcessed2, frame2 = capture2.read()
        if not isProcessed1 or not isProcessed2:
            break
        
        if(frameCount % 225 == 0):
            # capture image at 1st, last, middle frame
            # extract frame from both videos append to 2 sep lists, later iterate over both lists and perform ML to compare
            print()

        # frame tracker
        frameCount += 1

        # will remove this later
        cv2.imshow("Processed Frame 1:", frame1)
        cv2.imshow("Processed Frame 2:", frame2)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    capture1.release()
    capture2.release()
    cv2.destroyAllWindows()

        
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