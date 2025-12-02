import sys, cv2
from pathlib import Path
from collections import Counter
import numpy as np
import detectron
vidPairs = []

def Mp4(dirPath: Path):
    vidPairs.append(dirPath)
    if(len(vidPairs)==2):
        frames1, frames2 = process(vidPairs[0], vidPairs[1])
        removed = frame_difference(frames1, frames2)
        print("Items removed:", removed)
        vidPairs.pop(0)
    

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
        #combined = cv2.hconcat([frame1, frame2])
        # cv2.imshow(f"Comparison", combined)
        # print(f"Captured pair: Frame {f1} ({path1.name}), Frame {f2} ({path2.name})")

        # key = cv2.waitKey(1000) & 0xFF  # display each for 1 second
        # if key == ord('q'): # stop processing
        #     break
        # cv2.destroyWindow("Comparison")

    capture1.release()
    capture2.release()
    # cv2.destroyAllWindows()

    print("\nFrame extraction complete. Ready for ML comparison.")
    return extractedFrames1, extractedFrames2

def frame_difference(list1,list2):
    inventory_counter = Counter()
    assert len(list1)==len(list2)
    for i in range(len(list1)):
         #frames must be same length
        img1 = list1[i] #what does list[i] return? the path?
        img2 = list2[i]

        gray1 = cv2.cvtColor(img1, cv2.COLOR_BGR2GRAY)
        gray2 = cv2.cvtColor(img2, cv2.COLOR_BGR2GRAY)

        diff = cv2.absdiff(gray1, gray2)

        _,thresh = cv2.threshold(diff, 0 ,255,cv2.THRESH_BINARY | cv2.THRESH_OTSU)

        thresh = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, np.ones((3,3),np.uint8), iterations=1)
        thresh = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, np.ones((5,5), np.uint8), iterations=1)
        #if the thresh is at a certain level continue because we dont want to waste compute on similar frames
        H, W = thresh.shape
        border = 4
        thresh[:border,:] = 0; 
        thresh[-border:,:] = 0; 
        thresh[:,:border] = 0; 
        thresh[:,-border:]=0

        cnts = cv2.findContours(thresh.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        cnts = cnts[0] if len(cnts) == 2 else cnts[1]

        
        mask = np.zeros_like(thresh)
        for c in cnts:
            if cv2.contourArea(c) < 400:
                continue
            cv2.drawContours(mask, [c], -1, 255, thickness=cv2.FILLED)
            # x,y,w,h = cv2.boundingRect(c)
            # cv2.rectangle(img1, (x,y), (x+w, y+h), (0,0,255),2)
            # cv2.rectangle(img2, (x,y), (x+w, y+h), (0, 0, 255),2)
        #instead of drawing a bounding rect, how can I extract the bounded image from both images as new images, tell the system if the item was added or removed
            # crop1 = img1[y:y+h, x:x+w].copy()
            # crop2 = img2[y:y+h, x:x+w].copy()
        if H>0 and W>0:
            total_pixels = H*W
        else:
            total_pixels=1
        changed_pixels = np.count_nonzero(mask)
        change_ratio = changed_pixels / float(total_pixels)

        if(change_ratio<0.3):
            print("skipping detectron for this pair")
            continue
        inventoryList1 = detectron.detectron_scan(img1)
        inventoryList2 = detectron.detectron_scan(img2)

        count1 = Counter(inventoryList1)
        count2 = Counter(inventoryList2)

        removed = count1-count2
        inventory_counter+=removed
    if len(inventory_counter)==0:
        return []
    return list(inventory_counter.elements())
            #pass crop1BGR and crop2BGR to detectron2 but make it rgb
            
        
# def main():
    # l1,l2 = process("Video_1 (1).mov","Video (1).mov")
    # removed_list = frame_difference(l1,l2)
    # print("Items removed", removed_list)
# if __name__ == "__main__":
#     main()



























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