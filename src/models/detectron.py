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
cfg_keypoint.MODEL.ROI_HEADS.SCORE_THRESH_TEST = 0.96 # threshold for the model, confidence score of validity
dataset_dicts = DatasetCatalog.get("grocery_train")
# setting the model weights to be used during inference, in this case from a pretrained model (COCO)
cfg_keypoint.MODEL.ROI_HEADS.NUM_CLASSES = len(grocery_metadata.thing_classes)
cfg_keypoint.MODEL.WEIGHTS = "output/model_final.pth"
# Defaultpredictor sets up the model according to the config settings and applies it to new images that we pass it
cfg_keypoint.MODEL.DEVICE = "cpu"
predictor = DefaultPredictor(cfg_keypoint)
n = 0


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

    os.makedirs("test_results", exist_ok=True)
    
    output = os.path.join("test_results",f"image{n}.jpg")
    cv2.imwrite(output,out.get_image()[:,:,::-1])
    print(f"saved to {output}")
    n+=1
    instances = outputs['instances'].to("cpu")
    if len(instances)==0:
        return []
    class_ID =  outputs["instances"].pred_classes.numpy().tolist()
    labels = [grocery_metadata.thing_classes[c] for c in class_ID ]

    return labels

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
