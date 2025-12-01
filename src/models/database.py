# import os
# from collections import defaultdict

# import pandas as pd
# import boto3
# import botocore
# from tqdm import tqdm

# # =========================
# # CONFIG
# # =========================

# # Paths to the CSVs you already downloaded from Open Images
# CLASS_DESCRIPTIONS = "oidv7-class-descriptions.csv"
# IMAGE_LABELS = "oidv7-train-annotations-human-imagelabels.csv"

# # Where to put the downloaded images
# DOWNLOAD_DIR = "openimages_food_train"  # change if you like

# # Open Images S3 bucket + split
# BUCKET_NAME = "open-images-dataset"
# SPLIT = "train"

# # Chunk size for reading the huge labels CSV
# CHUNK_SIZE = 1_000_000  # adjust if you run out of RAM

# # Your target product classes (image-level labels, *not* boxes)
# TARGET_NAMES = [
#     "Yogurt",
#     "Pork",
#     "Beef",
#     "Milk",
#     "Cottage cheese",
#     "Cream cheese",
#     "Ketchup",
#     "Mayonnaise",
#     "Egg (Food)",   # this is the common DisplayName
#     "Salmon",
#     "Tofu",
#     "Chicken breast",
#     "Corn tortilla",
#     "Butter",
#     "Orange juice",
#     "Apple juice",
# ]


# # =========================
# # HELPER FUNCTIONS
# # =========================

# def load_class_descriptions(path):
#     """Load the full class description table (LabelName, DisplayName)."""
#     classes = pd.read_csv(
#         path,
#         header=None,
#         names=["LabelName", "DisplayName"]
#     )
#     return classes


# def build_name_to_mid_map(classes_df, target_names):
#     """
#     Given the classes dataframe and a list of DisplayName strings,
#     return dict DisplayName -> MID (LabelName).
#     """
#     name_to_mid = {}
#     for name in target_names:
#         rows = classes_df[classes_df["DisplayName"] == name]
#         if rows.empty:
#             raise ValueError(f"No class called {name!r} found in {CLASS_DESCRIPTIONS}")
#         mid = rows["LabelName"].iloc[0]
#         name_to_mid[name] = mid
#     return name_to_mid


# def collect_image_ids_and_labels(labels_csv_path, target_mids, chunk_size):
#     """
#     Stream through the human image-labels CSV and collect:
#       - set of ImageIDs that have any target MID with Confidence == 1
#       - mapping ImageID -> set of MIDs present
#     """
#     target_mid_set = set(target_mids.values())
#     image_ids = set()
#     image_to_mids = defaultdict(set)

#     print("Scanning image labels CSV in chunks...")
#     reader = pd.read_csv(labels_csv_path, chunksize=chunk_size)

#     for chunk_idx, df in enumerate(reader):
#         # Expect columns: ImageID, Source, LabelName, Confidence
#         mask = (df["LabelName"].isin(target_mid_set)) & (df["Confidence"] == 1.0)
#         filtered = df[mask]

#         for row in filtered.itertuples(index=False):
#             img_id = row.ImageID
#             mid = row.LabelName
#             image_ids.add(img_id)
#             image_to_mids[img_id].add(mid)

#         print(f"Processed chunk {chunk_idx + 1}, "
#               f"total matched images so far: {len(image_ids)}")

#     return image_ids, image_to_mids


# def download_images(image_ids, download_dir, split=SPLIT, bucket_name=BUCKET_NAME):
#     """
#     Download all given ImageIDs as JPEGs from the Open Images S3 bucket.
#     """
#     os.makedirs(download_dir, exist_ok=True)

#     s3_resource = boto3.resource(
#         "s3",
#         config=botocore.config.Config(signature_version=botocore.UNSIGNED)
#     )
#     bucket = s3_resource.Bucket(bucket_name)

#     print(f"Downloading {len(image_ids)} images to '{download_dir}'...")

#     for img_id in tqdm(sorted(image_ids), desc="Downloading images"):
#         key = f"{split}/{img_id}.jpg"
#         out_path = os.path.join(download_dir, f"{img_id}.jpg")

#         if os.path.exists(out_path):
#             # Skip if already downloaded (helps if you rerun)
#             continue

#         try:
#             bucket.download_file(key, out_path)
#         except botocore.exceptions.ClientError as e:
#             # Some IDs might not exist (rare); log and continue
#             print(f"Failed to download {key}: {e}")


# def write_image_label_csv(out_path, image_to_mids, label_to_name):
#     """
#     Write a small CSV that maps each ImageID to the MIDs and human names present.
#     """
#     print(f"Writing label summary CSV to {out_path}...")
#     rows = []
#     for img_id, mids in image_to_mids.items():
#         mids_sorted = sorted(mids)
#         names_sorted = [label_to_name[m] for m in mids_sorted]
#         rows.append({
#             "ImageID": img_id,
#             "LabelMIDs": ";".join(mids_sorted),
#             "LabelNames": ";".join(names_sorted),
#         })

#     df = pd.DataFrame(rows)
#     df.to_csv(out_path, index=False)
#     print(f"Wrote {len(df)} rows.")


# # =========================
# # MAIN
# # =========================

# def main():
#     print("Loading class descriptions...")
#     classes = load_class_descriptions(CLASS_DESCRIPTIONS)

#     # Map LabelName -> DisplayName for later
#     label_to_name = dict(zip(classes["LabelName"], classes["DisplayName"]))

#     print("Mapping target product names to MIDs...")
#     name_to_mid = build_name_to_mid_map(classes, TARGET_NAMES)
#     print("Target classes and MIDs:")
#     for name, mid in name_to_mid.items():
#         print(f"  {name:16s} -> {mid}")

#     print("\nCollecting matching ImageIDs from imagelabels CSV...")
#     image_ids, image_to_mids = collect_image_ids_and_labels(
#         IMAGE_LABELS,
#         name_to_mid,
#         CHUNK_SIZE,
#     )

#     print(f"\nTotal unique train images containing any target product: {len(image_ids)}")

#     # Optional: write a text list like downloader.py used to
#     list_path = "image_list_all_targets.txt"
#     with open(list_path, "w") as f:
#         for img_id in sorted(image_ids):
#             f.write(f"{SPLIT}/{img_id}\n")
#     print(f"Wrote image list to {list_path}")

#     # Download the actual JPEGs
#     download_images(image_ids, DOWNLOAD_DIR, split=SPLIT, bucket_name=BUCKET_NAME)

#     # Write mapping ImageID -> labels (MIDs & human-readable names)
#     labels_csv_out = "selected_images_labels.csv"
#     write_image_label_csv(labels_csv_out, image_to_mids, label_to_name)

#     print("\nDone ✅")
#     print(f"- Images folder: {DOWNLOAD_DIR}/")
#     print(f"- Image list file: {list_path}")
#     print(f"- Image ↔ labels summary: {labels_csv_out}")
#     print("\nNext step:")
#     print("  👉 Zip the images folder and upload to Roboflow as a new Object Detection project.")
#     print("  👉 Use the CSV for your own bookkeeping or to pre-group images if you want.")


# if __name__ == "__main__":
#     main()


# import fiftyone as fo
# import fiftyone.zoo as foz

# dataset = foz.load_zoo_dataset(
#     "open-images-v7",
#     split="train",
#     label_types=["detections"],
#     classes=["Milk", "Cheese", "Egg",
#             "Juice", "Salad"],#egg was ignored come back to this
#     max_samples=500
# )
# train_view, test_view = dataset.random_split({"train": 0.8, "test": 0.2})


# train_view.export(
#     export_dir="dataset-export",
#     dataset_type = fo.types.COCODetectionDataset
# )
# test_view.export(
#     export_dir="dataset-export/test",
#     dataset_type = fo.types.COCODetectionDataset
# )
# #use dataset.add_images_dir(my_images_dir) to add our own fridge images

import fiftyone as fo
import fiftyone.zoo as foz

dataset = foz.load_zoo_dataset(
    "open-images-v7",
    split="train",
    label_types=["detections"],
    classes=["Milk", "Cheese", "Egg", "Juice", "Salad"],  # butter not boxable
    max_samples=500,
)

print("Dataset loaded:", dataset.name, "with", len(dataset), "samples")

# ---- REPLACE random_split WITH THIS ----
# Shuffle for randomness
dataset.shuffle(seed=51)  # seed optional, just for reproducibility

n = len(dataset)
split_idx = int(0.8 * n)  # 80/20 split

# Older FiftyOne supports slicing to make views
train_view = dataset[:split_idx]
test_view = dataset[split_idx:]
# ----------------------------------------

print("Train:", len(train_view), "Test:", len(test_view))

train_view.export(
    export_dir="dataset-export",
    dataset_type=fo.types.COCODetectionDataset,
)

test_view.export(
    export_dir="dataset-export/test",
    dataset_type=fo.types.COCODetectionDataset,
)

# use dataset.add_images_dir(my_images_dir) to add our own fridge images
