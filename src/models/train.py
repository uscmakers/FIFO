import detectron2
from detectron2.utils.logger import setup_logger
setup_logger()

import numpy as np
import os
import cv2
import random
# from google.colab.patches import cv2_imshow

from detectron2 import model_zoo
from detectron2.engine import DefaultPredictor
from detectron2.config import get_cfg
from detectron2.utils.visualizer import Visualizer
from detectron2.data import MetadataCatalog
from detectron2.data.catalog import DatasetCatalog
from detectron2.engine import DefaultTrainer
from detectron2.evaluation import COCOEvaluator
from detectron2.data.datasets import register_coco_instances
from detectron2.data import MetadataCatalog, build_detection_test_loader
from detectron2.evaluation import inference_on_dataset
from detectron2.utils.visualizer import ColorMode
import glob


register_coco_instances("grocery_train",{},"dataset-export/labels.json","dataset-export/data")
register_coco_instances("grocery_test",{},"dataset-export/test/labels.json","dataset-export/test/data")

class_names=["Milk"]

grocery_metadata = MetadataCatalog.get("grocery_train")
grocery_test_metadata = MetadataCatalog.get("grocery_test")

# grocery_metadata.thing_classes = class_names
# grocery_test_metadata.thing_classes = class_names

dataset_dicts = DatasetCatalog.get("grocery_train")



# for d in random.sample(dataset_dicts, 3):
#     img = cv2.imread(d["file_name"])
#     visualizer = Visualizer(img[:, :, ::-1], metadata=grocery_metadata, scale=0.5)
#     vis = visualizer.draw_dataset_dict(d)
#     cv2.imshow("prediction",vis.get_image()[:, :, ::-1])
#     cv2.waitKey(0)
# cv2.destroyAllWindows()

cfg = get_cfg()
cfg.merge_from_file(
   model_zoo.get_config_file("COCO-Detection/faster_rcnn_X_101_32x8d_FPN_3x.yaml")
)
cfg.MODEL.DEVICE = "cpu"
cfg.DATASETS.TRAIN = ("grocery_train",)
cfg.DATASETS.TEST = ("grocery_test",)

cfg.DATALOADER.NUM_WORKERS = 0
cfg.MODEL.WEIGHTS = model_zoo.get_checkpoint_url(
   "COCO-Detection/faster_rcnn_X_101_32x8d_FPN_3x.yaml"
)  # Let training initialize from model zoo
cfg.SOLVER.IMS_PER_BATCH = 2
cfg.SOLVER.BASE_LR = 0.001
cfg.SOLVER.MAX_ITER = 200 #adjust up if val mAP is still rising, adjust down if overfit
cfg.SOLVER.STEPS = []


cfg.MODEL.ROI_HEADS.BATCH_SIZE_PER_IMAGE = 64
cfg.MODEL.ROI_HEADS.NUM_CLASSES = len(grocery_metadata.thing_classes)

cfg.OUTPUT_DIR = "./output"
os.makedirs(cfg.OUTPUT_DIR, exist_ok=True)



class CocoTrainer(DefaultTrainer):

  @classmethod
  def build_evaluator(cls, cfg, dataset_name, output_folder=None):

    if output_folder is None:
        os.makedirs("coco_eval", exist_ok=True)
        output_folder = "coco_eval"

    return COCOEvaluator(dataset_name, cfg, False, output_folder)
  
trainer = CocoTrainer(cfg)
trainer.resume_or_load(resume=False)
trainer.train()


cfg.MODEL.WEIGHTS = os.path.join(cfg.OUTPUT_DIR, "model_final.pth")
cfg.MODEL.ROI_HEADS.SCORE_THRESH_TEST = 0.5


predictor = DefaultPredictor(cfg)
evaluator = COCOEvaluator("grocery_test", cfg, False, output_dir="./output/")
val_loader = build_detection_test_loader(cfg, "grocery_test")
inference_on_dataset(trainer.model, val_loader, evaluator)


test_metadata = MetadataCatalog.get("grocery_test")



for imageName in glob.glob('dataset-export/test/data/*.jpg'):
  im = cv2.imread(imageName)
  outputs = predictor(im)
  v = Visualizer(im[:, :, ::-1],
                metadata=test_metadata, 
                scale=0.8,
                 )
  out = v.draw_instance_predictions(outputs["instances"].to("cpu"))
  cv2.imshow("prediction2",out.get_image()[:, :, ::-1])
  cv2.waitKey(0)
cv2.destroyAllWindows()