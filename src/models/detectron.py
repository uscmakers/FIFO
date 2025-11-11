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

# testing object detection
chocolate = cv2.imread("hersh.jpg")
#yogurt = cv2.imread("yog.jpg")

# get a new config: allowing you to separate the code from the machine learning pipeline to help reduce repeated outcomes,
# settings for the ML so it knows what to look for
cfg_keypoint = get_cfg()

# loads a predefined config file for a specific keypoint detection model, the model used here is a varient of MASK CNN 
# designed for keypoint detection. It uses the reznet50 backbone with a feature pyramid network and is trained on the 
# COCO dataset
cfg_keypoint.merge_from_file(model_zoo.get_config_file(COCO-Keypoints/keypoint_rcnn_R_50_FPN_3x.yaml)) 
cfg_keypoint.MODEL.ROI_HEADS.SCORE_THRESH_TEST = 0.7 # threshold for the model, confidence score of validity

# setting the model weights to be used during inference, in this case from a pretrained model (COCO)
cfg_keypoint.MODEL.WEIGHTS = model_zoo.get_checkpoint_url(COCO-Keypoints/keypoint_rcnn_R_50_FPN_3x.yaml)

# Defaultpredictor sets up the model according to the config settings and applies it to new images that we pass it
predictor = DefaultPredictor(cfg_keypoint)

outputs = predictor(chocolate) # need to put image!!!!!

# Visualizer is a utility from Detectron2 that helps with visualizing predictions.
# Colons/indexing converts our image from BGR to RGB format bc OpenCV (what processes our images) processes in BGR colors
# so we have to convert

# Metadata fetches classes and keypoint names related to the dataset used during training and helps our model
# draw labels, keypoints, other labels, essentially annotating the image
v = Visualizer(img[:,:,::-1], MetadataCatalog.get(cfg_keypoint.DATASETS.TRAIN[0]), scale = 1.2)

# draws bounding boxes on image
out = v.draw_instance_predictions(outputs["instances"].to("cpu"))

# display the image post annotation
cv2.imshow(out.get_image()[:,:,::-1])

# python -m pip install 'git+https://github.com/facebookresearch/detectron2.git'
