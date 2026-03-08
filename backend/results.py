"""
results.py
Flask server that combines DNA + fingerprint JSON results,
ranks suspects, and exposes them via a REST endpoint.

Endpoints:
  GET  /results        → full ranked suspect list
  GET  /results/top    → single most probable suspect
  POST /analyse        → re-run both analyses then return /results
  GET  /health         → sanity check
"""

import os
import json

from flask import Flask, jsonify, abort
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
# ─────────────────────────────────────────────
# Paths
# ─────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DNA_RESULTS_PATH = os.path.join(BASE_DIR, "data", "dna_results.json")
FP_RESULTS_PATH = os.path.join(BASE_DIR, "data", "fingerprint_results.json")

# Contribution of each modality to the combined score (must sum to 1.0).
# Fingerprint slightly outweights DNA because RANSAC inlier count is a
# very high-confidence signal; adjust as needed.
DNA_WEIGHT = 0.45
FP_WEIGHT = 0.55


# ─────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────
def load_json(path: str) -> dict:
    if not os.path.exists(path):
        abort(404, description=f"Result file not found: {path}. Run POST /analyse first.")
    with open(path) as f:
        return json.load(f)


def get_status(combined: float) -> tuple[str, str]:
    pct = combined * 100
    if pct >= 80:
        return "CRITICAL MATCH", "danger"
    elif pct >= 50:
        return "POSSIBLE MATCH", "warn"
    else:
        return "LOW MATCH", "active"


def get_tags(fp_norm: float, dna_norm: float) -> list[str]:
    tags = []
    if fp_norm >= 0.8:
        tags.append("HIGH_FP_CONFIDENCE")
    elif fp_norm >= 0.5:
        tags.append("PARTIAL_FP")
    else:
        tags.append("LOW_FP_MATCH")

    if dna_norm >= 0.8:
        tags.append("STR_MATCH")
    elif dna_norm >= 0.4:
        tags.append("PARTIAL_DNA")
    else:
        tags.append("NO_DNA_MATCH")

    combined = DNA_WEIGHT * dna_norm + FP_WEIGHT * fp_norm
    if combined >= 0.8:
        tags.append("HIGH_CONFIDENCE")
    elif combined >= 0.5:
        tags.append("INCONCLUSIVE")
    else:
        tags.append("LOW_PRIORITY")

    return tags


def get_details(fp_entry: dict, dna_entry: dict, fp_norm: float, dna_norm: float) -> list[str]:
    details = []

    inliers = fp_entry.get("inlier_count", 0)
    good_matches = fp_entry.get("good_matches", 0)
    if inliers > 0:
        details.append(
            f"Ridge pattern match: {inliers} geometrically consistent feature points ({good_matches} candidate matches).")
    elif good_matches > 0:
        details.append(
            f"Partial ridge pattern: {good_matches} candidate matches, insufficient for geometric verification.")
    else:
        details.append("No significant fingerprint ridge correspondences found.")

    raw_score = dna_entry.get("raw_score", 0)
    crime_len = dna_entry.get("crime_seq_len", 0)
    suspect_len = dna_entry.get("suspect_seq_len", 0)
    if dna_norm >= 0.8:
        details.append(
            f"Strong local sequence alignment (Smith-Waterman score: {raw_score}). Suspect: {suspect_len} bp vs crime scene: {crime_len} bp.")
    elif dna_norm >= 0.4:
        details.append(
            f"Partial sequence alignment (score: {raw_score}). DNA sample may be degraded — further testing recommended.")
    else:
        details.append(
            f"Weak sequence alignment (score: {raw_score}). No significant STR loci matches beyond random probability.")

    combined_pct = round((DNA_WEIGHT * dna_norm + FP_WEIGHT * fp_norm) * 100, 1)
    details.append(
        f"Combined match confidence: {combined_pct}% (DNA weight: {int(DNA_WEIGHT * 100)}%, fingerprint weight: {int(FP_WEIGHT * 100)}%).")

    return details


def combine_results() -> list[dict]:
    """
    Merge DNA and fingerprint normalised scores.
    Returns suspects sorted most → least probable in the target format.
    """
    dna_data = load_json(DNA_RESULTS_PATH)
    fp_data = load_json(FP_RESULTS_PATH)

    dna_suspects: dict[str, dict] = dna_data.get("suspects", {})
    fp_suspects: dict[str, dict] = fp_data.get("suspects", {})

    all_names = set(dna_suspects) | set(fp_suspects)

    ranked: list[dict] = []
    for i, name in enumerate(all_names):
        dna_entry = dna_suspects.get(name, {})
        fp_entry = fp_suspects.get(name, {})

        dna_norm = dna_entry.get("normalised_score", 0.0)
        fp_norm = fp_entry.get("normalised_score", 0.0)
        combined = DNA_WEIGHT * dna_norm + FP_WEIGHT * fp_norm

        status, status_type = get_status(combined)

        ranked.append({
            "rank": 0,
            "id": f"SUSPECT_{str(i + 1).zfill(3)}",
            "name": name,
            "fingerprintScore": round(fp_norm * 100, 1),
            "dnaScore": round(dna_norm * 100, 1),
            "overallScore": round(combined * 100, 1),
            "status": status,
            "statusType": status_type,
            "details": get_details(fp_entry, dna_entry, fp_norm, dna_norm),
            "tags": get_tags(fp_norm, dna_norm),
        })

    ranked.sort(key=lambda x: x["overallScore"], reverse=True)
    for i, entry in enumerate(ranked, start=1):
        entry["rank"] = i

    return ranked


# ─────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────
@app.route("/results", methods=["GET"])
def get_results():
    """Return all suspects ranked by combined score."""
    ranked = combine_results()
    return jsonify({
        "status": "ok",
        "count": len(ranked),
        "weights": {"dna": DNA_WEIGHT, "fingerprint": FP_WEIGHT},
        "suspects": ranked,
    })


@app.route("/results/top", methods=["GET"])
def get_top_suspect():
    """Return only the most probable suspect."""
    ranked = combine_results()
    if not ranked:
        return jsonify({"status": "error", "message": "No suspects found."}), 404
    top = ranked[0]
    return jsonify({
        "status": "ok",
        "top_suspect": top["suspect"],
        "combined_score": top["combined_score"],
        "details": top,
    })


@app.route("/analyse", methods=["POST"])
def run_analysis():
    """Trigger both analyses fresh, then return ranked results."""
    try:
        from dna import analyse_dna
        from fingerprint import analyse_fingerprints

        analyse_dna()
        analyse_fingerprints()

        ranked = combine_results()
        return jsonify({
            "status": "ok",
            "message": "Analysis complete.",
            "count": len(ranked),
            "suspects": ranked,
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


# ─────────────────────────────────────────────
# Entry point
# ─────────────────────────────────────────────
if __name__ == "__main__":
    app.run(debug=True, port=8080)
