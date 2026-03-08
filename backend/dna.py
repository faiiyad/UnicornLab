"""

  1. Smith-Waterman  — local alignment finds the best matching *region*
     rather than forcing an end-to-end alignment, which is far more
     appropriate for degraded, partial, or noisy crime-scene samples.
  2. N wildcard      — N bases are treated as partial wildcards (score 0)
     instead of being deleted, preserving positional information.
  3. Normalised score — raw score divided by the self-alignment of the
     crime sequence so all suspects are compared on [0, 1].
  4. Consensus merging — if a suspect has multiple FASTA records (e.g.
     duplicate samples), their sequences are concatenated before alignment.
"""

import os
import re
import json
from Bio import SeqIO

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(BASE_DIR)
CRIME_DNA_DIR = os.path.join(ROOT_DIR, "uploads", "dna")
OUTPUT_PATH = os.path.join(BASE_DIR, "data", "dna_results.json")

# scores
MATCH_SCORE = 2
MISMATCH_SCORE = -3
GAP_PENALTY = -2
N_SCORE = 0


def match_cost(a: str, b: str) -> int:
    """
    Score for aligning base a against base b.
    N (unknown) is treated as a wildcard — never penalised, never rewarded.
    """
    if a == "N" or b == "N":
        return N_SCORE
    return MATCH_SCORE if a == b else MISMATCH_SCORE


# algo
def smith_waterman(seq1: str, seq2: str) -> int:
    """
    Smith-Waterman local alignment.
    Returns the best local alignment score (always >= 0).

    Why local over global (Needleman-Wunsch)?
    - Crime-scene DNA is often partial / degraded.
    - Local alignment finds the best-matching REGION of the suspect
      sequence rather than penalising for unmatched flanking ends.
    - This dramatically reduces false negatives on noisy samples.
    """
    len1, len2 = len(seq1), len(seq2)

    if len2 > len1:
        seq1, seq2 = seq2, seq1
        len1, len2 = len2, len1

    best = 0
    prev = [0] * (len2 + 1)

    for i in range(1, len1 + 1):
        curr = [0] * (len2 + 1)
        for j in range(1, len2 + 1):
            diag = prev[j - 1] + match_cost(seq1[i - 1], seq2[j - 1])
            up = prev[j] + GAP_PENALTY
            left = curr[j - 1] + GAP_PENALTY
            val = max(0, diag, up, left)  # SW: floor at 0
            curr[j] = val
            if val > best:
                best = val
        prev = curr

    return best


# helper
def clean_sequence(raw: str) -> str:
    """Remove whitespace; uppercase.  Keep N bases (used as wildcards)."""
    return re.sub(r"[\s]+", "", raw).upper()


def load_crime_scene_dna(directory: str) -> str | None:
    """
    Return the cleaned crime-scene sequence.
    Detects the record by looking for 'CRIME' in the header.
    """
    for fname in os.listdir(directory):
        if not fname.lower().endswith((".fasta", ".fa")):
            continue
        for record in SeqIO.parse(os.path.join(directory, fname), "fasta"):
            if "CRIME" in record.id.upper() or "CRIME" in record.description.upper():
                return clean_sequence(str(record.seq))
    return None


def load_suspect_dna(directory: str) -> dict[str, str]:
    """
    Load every non-crime FASTA record.
    If a suspect has multiple records (duplicate samples) their
    sequences are concatenated to form a consensus.
    Returns {suspect_name: cleaned_sequence}
    """
    suspects: dict[str, list[str]] = {}
    for fname in os.listdir(directory):
        if not fname.lower().endswith((".fasta", ".fa")):
            continue
        for record in SeqIO.parse(os.path.join(directory, fname), "fasta"):
            if "CRIME" in record.id.upper() or "CRIME" in record.description.upper():
                continue
            name = record.id.strip()
            seq = clean_sequence(str(record.seq))
            if seq:
                suspects.setdefault(name, []).append(seq)

    return {name: "".join(seqs) for name, seqs in suspects.items()}


def max_possible_score(seq: str) -> int:
    """
    Theoretical maximum: every non-N base in the crime sequence matched perfectly.
    N bases contribute 0 (wildcard), real bases contribute MATCH_SCORE each.
    """
    return sum(MATCH_SCORE for b in seq if b != "N")


def analyse_dna() -> dict:
    """
    Compare crime-scene DNA against every suspect using Smith-Waterman.
    Saves results to OUTPUT_PATH and returns the results dict.
    """
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)

    crime_seq = load_crime_scene_dna(CRIME_DNA_DIR)
    if crime_seq is None:
        raise FileNotFoundError("No crime-scene DNA record found in " + CRIME_DNA_DIR)

    suspects = load_suspect_dna(CRIME_DNA_DIR)
    if not suspects:
        raise FileNotFoundError("No suspect DNA records found in " + CRIME_DNA_DIR)

    perfect = max_possible_score(crime_seq)

    results: dict[str, dict] = {}
    for name, seq in suspects.items():
        raw = smith_waterman(crime_seq, seq)
        norm = round(raw / perfect, 6) if perfect > 0 else 0.0

        results[name] = {
            "raw_score": raw,
            "normalised_score": norm,
            "crime_seq_len": len(crime_seq),
            "suspect_seq_len": len(seq),
        }
        print(f"[DNA] {name}: raw={raw}, normalised={norm:.4f}")

    output = {
        "algorithm": "Smith-Waterman (local alignment)",
        "crime_seq_len": len(crime_seq),
        "suspects": results,
    }

    with open(OUTPUT_PATH, "w") as f:
        json.dump(output, f, indent=2)

    print(f"[DNA] Results saved → {OUTPUT_PATH}")
    return output


if __name__ == "__main__":
    analyse_dna()
