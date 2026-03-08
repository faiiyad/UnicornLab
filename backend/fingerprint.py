"""
added preprocessing pipeline for a clearer bitmap, used Lowe's ratio and RANSAC for better results
"""

import os
import json
import cv2
import numpy as np


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(BASE_DIR)
CRIME_FP_DIR = os.path.join(ROOT_DIR, "uploads", "fingerprints")
SUSPECT_FP_DIR = os.path.join(ROOT_DIR, "Suspect_Fingerprints")
OUTPUT_PATH = os.path.join(BASE_DIR, "data", "fingerprint_results.json")


N_FEATURES = 1000


LOWE_RATIO = 0.75


MIN_MATCH_COUNT = 4


def preprocess(img: np.ndarray) -> np.ndarray:
    """
    Full preprocessing pipeline for a fingerprint image.
    Steps:
      1. Convert to grayscale (if not already)
      2. CLAHE  — enhances local contrast / ridge clarity
      3. Gaussian blur  — suppresses noise before feature detection
      4. Adaptive threshold — consistent binarisation of ridges
    """
    if len(img.shape) == 3:
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    else:
        gray = img.copy()

    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    enhanced = clahe.apply(gray)

    blurred = cv2.GaussianBlur(enhanced, (3, 3), 0)

    binary = cv2.adaptiveThreshold(
        blurred, 255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        blockSize=11,
        C=2,
    )

    return binary


def detect_features(img: np.ndarray, orb: cv2.ORB):
    """Return (keypoints, descriptors) on the preprocessed image."""
    processed = preprocess(img)
    kp, des = orb.detectAndCompute(processed, None)
    return kp, des


def match_prints(crime_kp, crime_des, suspect_kp, suspect_des) -> dict:
    """
    Match two sets of ORB descriptors.
    Returns a dict with good_matches (ratio-filtered) and
    inlier_count (geometrically consistent matches via RANSAC).
    """
    bf = cv2.BFMatcher(cv2.NORM_HAMMING)
    raw = bf.knnMatch(crime_des, suspect_des, k=2)

    good = []
    for pair in raw:
        if len(pair) == 2:
            m, n = pair
            if m.distance < LOWE_RATIO * n.distance:
                good.append(m)

    if len(good) < MIN_MATCH_COUNT:
        return {"good_matches": len(good), "inlier_count": 0}

    src_pts = np.float32([crime_kp[m.queryIdx].pt for m in good]).reshape(-1, 1, 2)
    dst_pts = np.float32([suspect_kp[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)

    _, mask = cv2.findHomography(src_pts, dst_pts, cv2.RANSAC, 5.0)
    inliers = int(mask.sum()) if mask is not None else 0

    return {"good_matches": len(good), "inlier_count": inliers}


def load_crime_fingerprint(directory: str):
    """Return (image, keypoints, descriptors) for the crime-scene print."""
    orb = cv2.ORB_create(nfeatures=N_FEATURES)
    for fname in os.listdir(directory):
        if fname.lower().endswith(".bmp"):
            path = os.path.join(directory, fname)
            img = cv2.imread(path)
            if img is None:
                raise ValueError(f"Could not read: {path}")
            kp, des = detect_features(img, orb)
            if des is None:
                raise ValueError("No features in crime-scene fingerprint after preprocessing.")
            return img, kp, des, orb
    raise FileNotFoundError("No .bmp found in " + directory)


def normalise(scores: dict[str, int]) -> dict[str, float]:
    """Scale inlier counts to [0, 1] relative to the top scorer."""
    mx = max(scores.values()) if scores else 1
    if mx == 0:
        return {k: 0.0 for k in scores}
    return {k: round(v / mx, 6) for k, v in scores.items()}


def analyse_fingerprints() -> dict:
    """
    Score every suspect fingerprint against the crime-scene print.
    Saves results to OUTPUT_PATH and returns the results dict.
    """
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)

    crime_img, crime_kp, crime_des, orb = load_crime_fingerprint(CRIME_FP_DIR)

    suspect_results: dict[str, dict] = {}
    raw_inliers: dict[str, int] = {}

    for fname in sorted(os.listdir(SUSPECT_FP_DIR)):
        if not fname.lower().endswith(".bmp"):
            continue

        suspect_name = os.path.splitext(fname)[0]
        path = os.path.join(SUSPECT_FP_DIR, fname)
        img = cv2.imread(path)

        if img is None:
            suspect_results[suspect_name] = {"error": "unreadable", "inlier_count": 0, "good_matches": 0}
            raw_inliers[suspect_name] = 0
            continue

        kp, des = detect_features(img, orb)

        if des is None or len(des) < 2:
            suspect_results[suspect_name] = {"error": "no_features", "inlier_count": 0, "good_matches": 0}
            raw_inliers[suspect_name] = 0
            continue

        result = match_prints(crime_kp, crime_des, kp, des)
        suspect_results[suspect_name] = result
        raw_inliers[suspect_name] = result["inlier_count"]

        print(f"[FP] {suspect_name}: good_matches={result['good_matches']}, inliers={result['inlier_count']}")

    normed = normalise(raw_inliers)
    for name in suspect_results:
        suspect_results[name]["normalised_score"] = normed.get(name, 0.0)

    output = {
        "algorithm": "ORB + CLAHE preprocessing + Lowe ratio test + RANSAC homography",
        "suspects": suspect_results,
    }

    with open(OUTPUT_PATH, "w") as f:
        json.dump(output, f, indent=2)

    print(f"[FP] Results saved → {OUTPUT_PATH}")
    return output


if __name__ == "__main__":
    analyse_fingerprints()
