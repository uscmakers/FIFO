import sys, cv2
from pathlib import Path
import numpy as np

# vidPairs = []

# def newestMp4(dirPath: Path) -> Path:
#     files = list(dirPath.glob("*.mp4"))
#     if not files:
#         raise FileNotFoundError("No .mp4 files found")
#     return max(files, key=lambda p: p.stat().st_mtime) # find latest mp4 file

def process(path1: Path, path2: Path):
    frameCount = 0
    capture1 = cv2.VideoCapture(str(path1)) #analyze key event 1
    capture2 = cv2.VideoCapture(str(path2)) #analyze key event 2

    if not capture1.isOpened() or not capture2.isOpened():
        raise RuntimeError("Could not open")
    
    # otherwise, processing continues
    print("Processing... (press q to quit)")

    # get video properties
    frameCount = min(int(capture1.get(cv2.CAP_PROP_FRAME_COUNT)),int(capture2.get(cv2.CAP_PROP_FRAME_COUNT)))
    if frameCount<=0:
        capture1.release(); 
        capture2.release()
        raise RuntimeError(f"Empty/invalid video(s): {path1.name}, {path2.name}")
    #print(f"{path1.name}: {fps1:.2f} FPS, {frameCount1} frames")
    #print(f"{path2.name}: {fps2:.2f} FPS, {frameCount2} frames")

    # get first frame, middle frame, and last frame for both clips (0, 255, 450th frame)
    framesToCapture = [0, frameCount // 2, frameCount - 1]

    extractedFrames1 = []
    extractedFrames2 = []

     # extract first, middle, and last frames for both clips
    for frame in framesToCapture:
        f1 = frame
        f2 = frame

        capture1.set(cv2.CAP_PROP_POS_FRAMES, f1)
        capture2.set(cv2.CAP_PROP_POS_FRAMES, f2)

        ret1, frame1 = capture1.read()
        ret2, frame2 = capture2.read()

        if not ret1 or not ret2:
            print(f"Failed to read frame pair {frame}")
            continue
        
        # for ML comparison
        extractedFrames1.append(frame1)
        extractedFrames2.append(frame2)

        # Combine frames for comparison
        combined = cv2.hconcat([frame1, frame2])
        cv2.imshow(f"Comparison", combined)
        # print(f"Captured pair: Frame {f1} ({path1.name}), Frame {f2} ({path2.name})")

        key = cv2.waitKey(1000) & 0xFF  # display each for 1 second
        if key == ord('q'): # stop processing
            break
        cv2.destroyWindow("Comparison")

    capture1.release()
    capture2.release()
    cv2.destroyAllWindows()

    print("\nFrame extraction complete. Ready for ML comparison.")
    return extractedFrames1, extractedFrames2

def frame_difference(list1,list2):
    for i in range(len(list1)):
        img1 = list1[i] #what does list[i] return? the path?
        img2 = list2[i]

        gray1 = cv2.cvtColor(img1, cv2.COLOR_BGR2GRAY)
        gray2 = cv2.cvtColor(img2, cv2.COLOR_BGR2GRAY)

        diff = cv2.absdiff(gray1, gray2)

        _,thresh = cv2.threshold(diff, 0 ,255,cv2.THRESH_BINARY | cv2.THRESH_OTSU)[1]

        thresh = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, np.ones((3,3),np.uint8), iterations=1)
        thresh = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, np.ones((5,5), np.uint8), iterations=1)
        #if the thresh is at a certain level continue because we dont want to waste compute on similar frames

        cnts = cv2.findContours(thresh.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        cnts = cnts[0] if len(cnts) == 2 else cnts[1]

        H, W = thresh.shape
        border = 4
        thresh[:border,:] = 0; thresh[-border:,:] = 0; thresh[:,:border] = 0; thresh[:,-border:]=0
        for c in cnts:
            if cv2.contourArea(c) < 400:
                continue
            x,y,w,h = cv2.boundingRect(c)
            cv2.rectangle(img1, (x,y), (x+w, y+h), (0,0,255),2)
            cv2.rectangle(img2, (x,y), (x+w, y+h), (0, 0, 255),2)
        #instead of drawing a bounding rect, how can I extract the bounded image from both images as new images, tell the system if the item was added or removed
        crop1 = img1[y:y+h, x:x+w].copy()
        crop2 = img2[y:y+h, x:x+w].copy()

        crop1BGR = cv2.cvtColor(img1, cv2.COLOR_GRAY2BGR)
        crop2BGR = cv2.cvtColor(img1, cv2.COLOR_GRAY2BGR)

            # Decide added/removed/moved (very simple heuristic):
            # Option A: SSIM (robust to brightness)
        



























# def main():
#     # checking if an argument (video clip) was passed into main (manual from user)
#     if len(sys.argv) > 1:
#         vid = Path(sys.argv[1]).expanduser()
#     else:
#         vid = newestMp4(Path("~/Downloads").expanduser()) # automatic

#     if len(vidPairs) > 2:
#         vidPairs.pop(0) # remove first (older) video

#     vidPairs.append(vid)

#     # if vidPairs length = 2: then pass both video clips into process. otherwise, wait
#     if(len(vidPairs) == 2):
#         process(vidPairs[0], vidPairs[1]) # pass both paths
    
#     if len(sys.argv) > 1:
#         print("First argument:", sys.argv[1])

# if __name__ == "__main__":
#     main()