# ML code will go here

import detectron2
import torch
import numpy as np
import os, json, cv2, random

from detectron2 import model_zoo # get existing builtin datasets
from detectron2.engine import DefaultPredictor
from detectron2.config import get_cfg
from detectron2.utils.visualizer import Visualizer
from detectron2.data import MetadataCatalog, DatasetCatalog # used for making custom datasets
from detectron2.data.datasets import register_coco_instances

from vlm_wrapper import VLM 

register_coco_instances("grocery_train",{},"dataset-export/labels.json","dataset-export/data")
register_coco_instances("grocery_test",{},"dataset-export/test/labels.json","dataset-export/test/data")
grocery_metadata = MetadataCatalog.get("grocery_train")
# testing object detection
#yogurt = cv2.imread("yog.jpg")

# get a new config: allowing you to separate the code from the machine learning pipeline to help reduce repeated outcomes,
# settings for the ML so it knows what to look for
cfg_keypoint = get_cfg()

# loads a predefined config file for a specific keypoint detection model, the model used here is a varient of MASK CNN 
# designed for keypoint detection. It uses the reznet50 backbone with a feature pyramid network and is trained on the 
# COCO dataset
cfg_keypoint.merge_from_file(model_zoo.get_config_file("COCO-Detection/faster_rcnn_X_101_32x8d_FPN_3x.yaml"))
cfg_keypoint.MODEL.ROI_HEADS.SCORE_THRESH_TEST = 0.97 # threshold for the model, confidence score of validity
dataset_dicts = DatasetCatalog.get("grocery_train")
# setting the model weights to be used during inference, in this case from a pretrained model (COCO)
cfg_keypoint.MODEL.ROI_HEADS.NUM_CLASSES = len(grocery_metadata.thing_classes)
cfg_keypoint.MODEL.WEIGHTS = "output/model_final.pth"
# Defaultpredictor sets up the model according to the config settings and applies it to new images that we pass it
cfg_keypoint.MODEL.DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
predictor = DefaultPredictor(cfg_keypoint)
n = 0
vlm = VLM(model_id="google/paligemma-3b-mix-448")
print("gpu count:", torch.cuda.device_count())
if torch.cuda.is_available():
    print("gpu name:", torch.cuda.get_device_name(0))
def crop_image(image_input, box_bound):
        x1,y1,x2,y2 = map(int,box_bound)
        h,w = image_input.shape[:2]
        x1 = max(0, x1-20)
        x2 = min(w,x2+20)
        y1 = max(0, y1-20)
        y2 = min(h, y2+20)
        # cv2.imwrite("output.png",image_input[y1:y2,x1:x2])
        return image_input[y1:y2,x1:x2]

def verify_box(image, box):
    cropped = crop_image(image, box)  # Custom crop function
    verification = ('<image>\nis this a retail food product package with a visible label or branding (carton, bottle, can, jar, box, bag)? answer only yes or no.\n')
    y_n = vlm.query(cropped, [verification])
    if y_n == "no":
         return {}
    prompt = (
    '<image>\nanswer en what is this product?(i.e. apple juice, ketchup, pasta sauce, pepper jack slices, etc)\n',
    '<image>\nanswer en what is the brand of the product? (i.e. Kirkland, Mountain High, Tropicana, etc). output exactly one line in lowercase: brand: <brand or unknown>\n',
    '<image>\nanswer en what category best fits this product? choose one of beverage|dairy|meat|produce|condiment|eggs|prepared_food|unsure. note that milk is dairy. output exactly one line in lowercase: category: <...>\n',
    '<image>\nanswer en output how confident you are in the category of the product <low|medium|high>\n'

    )
    # query = (
    #     "Identify the food item in the image.\n"
    #     "Return exactly 4 lines in the following format in LOWERCASE\n"
    #     "item_name: <short name>\n"
    #     "category: <one of beverage|dairy|meat|produce|condiment|eggs|prepared_food|unsure> \n"
    #     "brand: <brand name as specified on the package label read ALL of it>\n"
    #     "confidence: <low|medium|high> \n"
    #     "Do not add any more lines."
    # )
    
    data = {"item_name": None,
            "brand": None, 
            "category": "unanswerable",
            "confidence":"low"
            }
    data_keys = list(data.keys())
    outputs = vlm.query(cropped, prompt)
    for i in outputs:
         print(i)
    
    for i in range (len(data_keys)):
        
        data[data_keys[i]] = outputs[i]

    valid = (data["category"] != "unsure" and data["item_name"] is not None )
    #and data["confidence"] in ("medium","high")
    data["valid"] = valid

    # for label in vlm_response:
    #     if label.startswith("item_name:"):
    #         data["item_name"] = label.split(":",1)[1].strip()
    #     elif label.startswith("category:"):
    #         category = label.split(":",1)[1].strip()
    #         data["category"] = category if category in ["beverage","dairy","meat","produce","condiment","eggs","prepared_food"] else "unsure"
    #     elif label.startswith("brand:"):
    #         data["brand"] = label.split(":",1)[1].strip()
    #     elif label.startswith("confidence:"):
    #         conf = label.split(":",1)[1].strip()
    #         data["confidence"] = conf if conf in ["low", "medium", "high"] else "low"
        
    
    return data  # Simple parse; improve with regex


def detectron_scan(img1) -> list:
    global n 
    outputs = predictor(img1) # need to put image!!!!!

    # Visualizer is a utility from Detectron2 that helps with visualizing predictions.
    # Colons/indexing converts our image from BGR to RGB format bc OpenCV (what processes our images) processes in BGR colors
    # so we have to convert

    # Metadata fetches classes and keypoint names related to the dataset used during training and helps our model
    # draw labels, keypoints, other labels, essentially annotating the image
    v = Visualizer(img1[:,:,::-1], metadata=grocery_metadata, scale = 1.2)

    # draws bounding boxes on image
    out = v.draw_instance_predictions(outputs["instances"].to("cpu"))

    # display the image post annotation
    # cv2.imshow("Final output", out.get_image()[:,:,::-1])

    # ensure that openCV doesn't automatically close when the program ends
    # cv2.waitKey(0)
    # cv2.destroyAllWindows()

    # os.makedirs("test_results", exist_ok=True)
    
    # output = os.path.join("test_results",f"image{n}.png")
    # cv2.imwrite(output,out.get_image()[:,:,::-1])
    print(f"{n}")

    #return bounding boxes here instead
    n+=1
    instances = outputs['instances'].to("cpu")
    if len(instances)==0:
        return []
    # class_ID =  instances.pred_classes.numpy().tolist()
    # labels = [grocery_metadata.thing_classes[c] for c in class_ID ]
    boxes = instances.pred_boxes.tensor.numpy().tolist()
    response = []
    for i in range(len(boxes)):
        res = verify_box(img1,boxes[i])#does the label correspond to the order of boxes?
        response.append(res)
    return response


    # DOCUMENTATION: STEPS TO SETTING UP VIRTUAL ENVIRONMENT (detectron2)

    # conda create -n detectron2 python=3.9
    # conda activate detectron2
    # conda install pytorch torchvision torchaudio -c pytorch
    # python -c "import torch; print(torch.__version__)"
    # export CC=clang
    # export CXX=clang++
    # export ARCHFLAGS="-arch arm64"
    # python -m pip install 'git+https://github.com/facebookresearch/detectron2.git'

    # Verification that it worked:
    # python -c "import detectron2; print('✅ Detectron2 installed!')"

    # Note: need to activate the venv every time we open terminal! use the following command:
    # conda activate detectron2

    # To download OpenCV to the (detectron2) venv:

    # pip install --upgrade pip
    # pip install opencv-python

    # Verification that it worked: 
    # python -c "import cv2; print('OpenCV version:', cv2.__version__)"
    # The version should be 4.12.0 (as of Nov 2025)

    # Try this if the above did not work:
    # python -m pip install --no-cache-dir opencv-python

#VLM pseudocode from Medium (Tammanna https://freedium.cfd/https://medium.com/@tam.tamanna18/revolutionizing-object-detection-with-ai-agents-and-vision-language-models-889d39bf41d7)
 # Hypothetical wrapper for LLaVA or similar



# from transformers import pipeline

# vlm = pipeline("image-to-text", model="Salesforce/blip-image-captioning-large")

# def vlm_describe(image):
#     return vlm(image)[0]['generated_text']


# def agentic_pipeline(image, initial_query):
#     query = critique_query(initial_query)  # Using VLM
#     while True:
#         boxes = run_batched_detection(image, query)
#         valid_boxes = [box for box in boxes if verify_box(image, box, query)]
#         if len(valid_boxes) > threshold or iterations > max_iter:
#             break
#         query = refine_query(query, feedback_from_vlm)
#     return valid_boxes