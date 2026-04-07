# import sys, cv2
# from pathlib import Path
# from collections import Counter
# import numpy as np
# import detectron
# import imageio_ffmpeg, subprocess

# vidPairs = []

# def Mp4(dirPath: Path):
#     vidPairs.append(dirPath)
#     if(len(vidPairs)==2):
#         frames1, frames2 = process(vidPairs[0], vidPairs[1])
#         removed = frame_difference(frames1, frames2)
#         print("Items removed:", removed)
#         vidPairs.pop(0)
# def get_item_name(d):
#     return (d["category"],d.get("brand","unknown"),d.get("item_name","unknown"))    

# def process(path1: Path):
#     frameCount = 0
#     capture1 = cv2.VideoCapture(str(path1), cv2.CAP_FFMPEG) #analyze key event 1
    
    
#     ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
#     subprocess.run([ffmpeg, "-i", r"Video_1 (4).mov"], check=False)
#     #capture2 = cv2.VideoCapture(str(path2)) #analyze key event 2
#     capture1.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
#     capture1.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
#     if not capture1.isOpened():
#         raise RuntimeError("Could not open")
    
#     # otherwise, processing continues
#     print("Processing... (press q to quit)")

#     # get video properties
#     frameCount = int(capture1.get(cv2.CAP_PROP_FRAME_COUNT))
#     if frameCount<=0:
#         capture1.release(); 
#         #capture2.release()
#         raise RuntimeError(f"Empty/invalid video(s): {path1.name}")
#     #print(f"{path1.name}: {fps1:.2f} FPS, {frameCount1} frames")
#     #print(f"{path2.name}: {fps2:.2f} FPS, {frameCount2} frames")

#     # get first frame, middle frame, and last frame for both clips (0, 255, 450th frame)
#     framesToCapture = [0, frameCount//3, 2*frameCount//3, frameCount-1]
#     framesToCapture = sorted(set(framesToCapture))
#     seen = Counter()

#     #extractedFrames1 = []
#     #extractedFrames2 = []

   

#      # extract first, middle, and last frames for both clips
#     i = 0
#     for frame in framesToCapture:
#         f1 = frame
#         #f2 = frame

#         capture1.set(cv2.CAP_PROP_POS_FRAMES, f1)
#         #capture2.set(cv2.CAP_PROP_POS_FRAMES, f2)

#         ret1, frame1 = capture1.read()
        
#         #ret2, frame2 = capture2.read()

#         if not ret1:
#             print(f"Failed to read frame {frame}")
#             continue
#         result = detectron.detectron_scan(frame1)
#         res_keys = set(get_item_name(d) for d in result if d.get("valid"))

#         for key in res_keys:
#             seen[key] +=1
#         # for ML comparison
#         # cv2.imwrite(f"frame{i}.png", frame1)
#         #cv2.imwrite(f"frame_pair{i}2.png", frame2)

#         #extractedFrames1.append(frame1)
#         #extractedFrames2.append(frame2)
#         #print(i)
#         i+=1
    
#     capture1.release()
#     #capture2.release()
#     inventory = Counter({k: 1 for k, v in seen.items() if v >=1})

#     print("\nFrame extraction complete. Ready for ML comparison.")
#     return inventory
# #, extractedFrames2


# def frame_difference(list1,list2):
#     inventory_counter = Counter()
#     assert len(list1)==len(list2)
#     for i in range(len(list1)):
#          #frames must be same length
#         img1 = list1[i] #what does list[i] return? the path?
#         img2 = list2[i]

#         gray1 = cv2.cvtColor(img1, cv2.COLOR_BGR2GRAY)
#         gray2 = cv2.cvtColor(img2, cv2.COLOR_BGR2GRAY)

#         diff = cv2.absdiff(gray1, gray2)

#         _,thresh = cv2.threshold(diff, 0 ,255,cv2.THRESH_BINARY | cv2.THRESH_OTSU)

#         thresh = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, np.ones((3,3),np.uint8), iterations=1)
#         thresh = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, np.ones((5,5), np.uint8), iterations=1)
#         #if the thresh is at a certain level continue because we dont want to waste compute on similar frames
#         H, W = thresh.shape
#         border = 4
#         thresh[:border,:] = 0; 
#         thresh[-border:,:] = 0; 
#         thresh[:,:border] = 0; 
#         thresh[:,-border:]=0

#         cnts = cv2.findContours(thresh.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
#         cnts = cnts[0] if len(cnts) == 2 else cnts[1]

        
#         mask = np.zeros_like(thresh)
#         for c in cnts:
#             if cv2.contourArea(c) < 400:
#                 continue
#             cv2.drawContours(mask, [c], -1, 255, thickness=cv2.FILLED)
#             # x,y,w,h = cv2.boundingRect(c)
#             # cv2.rectangle(img1, (x,y), (x+w, y+h), (0,0,255),2)
#             # cv2.rectangle(img2, (x,y), (x+w, y+h), (0, 0, 255),2)
#         #instead of drawing a bounding rect, how can I extract the bounded image from both images as new images, tell the system if the item was added or removed
#             # crop1 = img1[y:y+h, x:x+w].copy()
#             # crop2 = img2[y:y+h, x:x+w].copy()
#         if H>0 and W>0:
#             total_pixels = H*W
#         else:
#             total_pixels=1
#         changed_pixels = np.count_nonzero(mask)
#         change_ratio = changed_pixels / float(total_pixels)

#         if(change_ratio<0.08):
#             print("skipping detectron for this pair")
#             continue

#         inventoryList1 = detectron.detectron_scan(img1)
#         inventoryList2 = detectron.detectron_scan(img2)

        
#         print("count 1:",inventoryList1)
#         print("count 2:",inventoryList2)

#         category_count1 = Counter([d["category"] for d in inventoryList1 if d.get("valid")])
#         category_count2 = Counter([d["category"] for d in inventoryList2 if d.get("valid")])

#         removed_cat = category_count1-category_count2
#         removed_cat = set(removed_cat.keys())

#         item_count1 = Counter([get_item_name(d) for d in inventoryList1 if d.get("valid")])
#         item_count2 = Counter([get_item_name(d) for d in inventoryList2 if d.get("valid")])

#         print("count 1:",item_count1)
#         print("count 2:",item_count2)

#         removed_item = item_count1-item_count2
#         removed_item = Counter({k:v for k,v in removed_item.items() if k[0] in removed_cat})


#         inventory_counter+=removed_item

#     if len(inventory_counter)==0:
#         return []
#     return inventory_counter
#             #pass crop1BGR and crop2BGR to detectron2 but make it rgb
            
        
# def main():
    
#     inventoryList1 = process("Video_1 (1).mov")
#     print(inventoryList1)
#     inventoryList2 = process("Video (1).mov")
#     print(inventoryList2)
#     #removed_list = frame_difference(l1,l2)
    

#     removed_items = inventoryList1 - inventoryList2
    
#     print("Items removed", removed_items)
# if __name__ == "__main__":
#     main()



























# # def main():
# #     # checking if an argument (video clip) was passed into main (manual from user)
# #     if len(sys.argv) > 1:
# #         vid = Path(sys.argv[1]).expanduser()
# #     else:
# #         vid = newestMp4(Path("~/Downloads").expanduser()) # automatic

# #     if len(vidPairs) > 2:
# #         vidPairs.pop(0) # remove first (older) video

# #     vidPairs.append(vid)

# #     # if vidPairs length = 2: then pass both video clips into process. otherwise, wait
# #     if(len(vidPairs) == 2):
# #         process(vidPairs[0], vidPairs[1]) # pass both paths
    
# #     if len(sys.argv) > 1:
# #         print("First argument:", sys.argv[1])

# # if __name__ == "__main__":
# #     main()
# import sys, cv2
# from pathlib import Path
# from collections import Counter, deque
# import numpy as np
# import detectron
# import imageio_ffmpeg, subprocess
# import time
# import requests

# # -------------------------
# # ML PROCESSING CODE
# # -------------------------

# invPairs = deque(maxlen=2)

# def Mp4(path: Path):
#     # vidPairs.append(path)

#     # if len(vidPairs) < 2:
#     #     print("Waiting for second clip...")
#     #     return

#     print("Initial clip received:", path)

#     inv1 = process(path)
    
#     invPairs.append(inv1)

#     if(len(invPairs)==2):
#         removed = invPairs[0] - invPairs[1]
#         invPairs.pop()
#         print("Items removed:", removed)

    
    


# def get_item_name(d):
#     return (d["category"], d.get("brand","unknown"), d.get("item_name","unknown"))


# def process(path: Path):

#     capture = cv2.VideoCapture(str(path), cv2.CAP_FFMPEG)

#     if not capture.isOpened():
#         raise RuntimeError(f"Could not open {path}")

#     frameCount = int(capture.get(cv2.CAP_PROP_FRAME_COUNT))

#     if frameCount <= 0:
#         capture.release()
#         raise RuntimeError(f"Invalid video {path}")

#     framesToCapture = [0, frameCount//3, frameCount-1]
#     framesToCapture = sorted(set(framesToCapture))

#     seen = Counter()

#     for frame in framesToCapture:
        
#         capture.set(cv2.CAP_PROP_POS_FRAMES, frame)

#         ret, frameImg = capture.read()

#         if not ret:
#             continue

#         result = detectron.detectron_scan(frameImg)

#         res_keys = set(
#             get_item_name(d) for d in result if d.get("valid")
#         )

#         for key in res_keys:
#             seen[key] += 1

#     capture.release()

#     inventory = Counter({k:1 for k,v in seen.items() if v >= 1})

#     print("Inventory detected:", inventory)

#     return inventory


# # -------------------------
# # VIDEO DOWNLOAD LOOP
# # -------------------------

# PI_IP = "172.20.10.8"
# URL = f"http://{PI_IP}:8000/latest.mp4"

# last_modified = None
# last_length = None


# def download_loop():

#     global last_modified, last_length

#     while True:

#         try:

#             head = requests.head(URL, timeout=10)

#             if head.status_code == 404:
#                 print("Waiting for first clip...")
#                 time.sleep(2)
#                 continue

#             head.raise_for_status()

#             current_modified = head.headers.get("Last-Modified")
#             current_length = head.headers.get("Content-Length")

#             # skip if same file
#             if current_modified == last_modified and current_length == last_length:
#                 time.sleep(2)
#                 continue

#             r = requests.get(URL, timeout=30)
#             r.raise_for_status()

#             save_path = Path("latest.mp4")

#             with open(save_path, "wb") as f:
#                 f.write(r.content)

#             print("Downloaded NEW clip")

#             last_modified = current_modified
#             last_length = current_length

#             # ---- ML processing here ----
#             Mp4(save_path)

#         except requests.exceptions.RequestException as e:
#             print("Network error:", e)

#         time.sleep(2)


# if __name__ == "__main__":
#     download_loop()

import sys, cv2
from pathlib import Path
from collections import Counter, deque
import numpy as np
import detectron
import imageio_ffmpeg, subprocess
import time
import requests

# -------------------------
# SETTINGS
# -------------------------

PI_IP = "172.20.10.8"
URL = f"http://{PI_IP}:8000/latest.mp4"

invPairs = deque(maxlen=2)

last_modified = None
last_length = None

PANORAMA_DIR = Path("panoramas")
PANORAMA_DIR.mkdir(exist_ok=True)

NUM_SAMPLE_FRAMES = 5
STITCH_MAX_WIDTH = 960


# -------------------------
# HELPERS
# -------------------------

def get_item_name(d):
    return (d["category"], d.get("brand", "unknown"), d.get("item_name", "unknown"))


def resize_for_stitch(img, max_width=STITCH_MAX_WIDTH):
    h, w = img.shape[:2]
    if w <= max_width:
        return img
    scale = max_width / float(w)
    new_w = int(w * scale)
    new_h = int(h * scale)
    return cv2.resize(img, (new_w, new_h), interpolation=cv2.INTER_AREA)


def get_sample_indices(frame_count, num_samples=NUM_SAMPLE_FRAMES):
    if frame_count <= 0:
        return []
    if frame_count == 1:
        return [0]

    idx = np.linspace(0, frame_count - 1, num=min(num_samples, frame_count), dtype=int)
    return sorted(set(idx.tolist()))


def extract_frames(capture, frame_indices):
    frames = []

    for idx in frame_indices:
        capture.set(cv2.CAP_PROP_POS_FRAMES, int(idx))
        ret, frame_img = capture.read()
        if not ret or frame_img is None:
            print(f"Warning: failed to read frame {idx}")
            continue
        frames.append(frame_img)

    return frames


def build_panorama(frames, output_path: Path):
    if len(frames) < 2:
        print("Not enough frames to build panorama.")
        return None

    stitch_frames = [resize_for_stitch(f) for f in frames]

    try:
        stitcher = cv2.Stitcher_create(cv2.Stitcher_PANORAMA)
        status, pano = stitcher.stitch(stitch_frames)

        if status == cv2.Stitcher_OK and pano is not None:
            cv2.imwrite(str(output_path), pano)
            print(f"Panorama saved: {output_path}")
            return pano
        else:
            print(f"Panorama stitching failed with status: {status}")
            return None

    except Exception as e:
        print(f"Panorama stitching exception: {e}")
        return None


def detect_inventory_from_image(img, label="image"):
    # 🔥 SAVE EXACT INPUT TO DETECTRON
    debug_path = Path("debug_inputs")
    debug_path.mkdir(exist_ok=True)

    filename = debug_path / f"{label}_input.jpg"
    cv2.imwrite(str(filename), img)

    print(f"[DEBUG] Saved Detectron input: {filename}")

    # ---- RUN DETECTION ----
    result = detectron.detectron_scan(img)

    inventory = Counter(
        get_item_name(d)
        for d in result
        if d.get("valid")
    )

    print(f"Inventory detected from {label}: {inventory}")
    return inventory


# -------------------------
# ML PROCESSING CODE
# -------------------------

def Mp4(path: Path):
    print("Initial clip received:", path)

    inv1 = process(path)
    invPairs.append(inv1)

    if len(invPairs) == 2:
        removed = invPairs[0] - invPairs[1]
        invPairs.popleft()   # keep newest for next comparison
        print("Items removed:", removed)


def process(path: Path):
    capture = cv2.VideoCapture(str(path), cv2.CAP_FFMPEG)

    if not capture.isOpened():
        raise RuntimeError(f"Could not open {path}")

    frame_count = int(capture.get(cv2.CAP_PROP_FRAME_COUNT))
    if frame_count <= 0:
        capture.release()
        raise RuntimeError(f"Invalid video {path}")

    frame_indices = get_sample_indices(frame_count, NUM_SAMPLE_FRAMES)
    frames = extract_frames(capture, frame_indices)
    capture.release()

    if not frames:
        raise RuntimeError(f"No readable frames found in {path}")

    pano_path = PANORAMA_DIR / f"{path.stem}_panorama.jpg"
    panorama = build_panorama(frames, pano_path)

    # MAIN PATH: detect items from the panorama
    if panorama is not None:
        try:
            return detect_inventory_from_image(panorama, label="panorama")
        except Exception as e:
            print(f"Detectron failed on panorama: {e}")

    # FALLBACK: if panorama stitching or detection fails, detect on individual frames
    print("Falling back to per-frame detection...")

    seen = Counter()

    for i, frame_img in enumerate(frames):
        try:
            result = detectron.detectron_scan(frame_img)
        except Exception as e:
            print(f"Detectron failed on frame {i}: {e}")
            continue

        res_keys = set(
            get_item_name(d) for d in result if d.get("valid")
        )

        for key in res_keys:
            seen[key] += 1

    inventory = Counter({k: 1 for k, v in seen.items() if v >= 1})
    print("Inventory detected from fallback frames:", inventory)

    return inventory


# -------------------------
# VIDEO DOWNLOAD LOOP
# -------------------------

def download_loop():
    global last_modified, last_length

    while True:
        try:
            head = requests.head(URL, timeout=10)

            if head.status_code == 404:
                print("Waiting for first clip...")
                time.sleep(2)
                continue

            head.raise_for_status()

            current_modified = head.headers.get("Last-Modified")
            current_length = head.headers.get("Content-Length")

            if current_modified == last_modified and current_length == last_length:
                time.sleep(2)
                continue

            r = requests.get(URL, timeout=30)
            r.raise_for_status()

            save_path = Path("latest.mp4")

            with open(save_path, "wb") as f:
                f.write(r.content)

            print("Downloaded NEW clip")

            last_modified = current_modified
            last_length = current_length

            Mp4(save_path)

        except requests.exceptions.RequestException as e:
            print("Network error:", e)
        except Exception as e:
            print("Processing error:", e)

        time.sleep(2)


if __name__ == "__main__":
    download_loop()