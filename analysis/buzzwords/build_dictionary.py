#!/usr/bin/env python3
import json
import re
from pathlib import Path

OUT_DIR = Path(__file__).parent
YEARLY_CORPUS_PATH = OUT_DIR / "yearly_corpus.json"
RAW_DICT_PATH = OUT_DIR / "unique_words_raw.txt"

# Simple token regex:
# - starts with a letter
# - can include letters, digits, apostrophes, hyphens, underscores
TOKEN_RE = re.compile(r"[A-Za-z][A-Za-z0-9'_/-]*")


def load_yearly_corpus(path: Path):
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def extract_unique_words(yearly_corpus: dict[str, list[str]]):
    """
    Iterate all transcripts across all years, tokenize, and collect unique words.
    """
    unique_words = set()
    total_texts = sum(len(v) for v in yearly_corpus.values())
    print(f"Scanning {total_texts} transcripts across {len(yearly_corpus)} years...")

    for year, texts in yearly_corpus.items():
        for text in texts:
            # lowercase to normalise
            lower = text.lower()
            for match in TOKEN_RE.findall(lower):
                unique_words.add(match)

    return unique_words


def main():
    if not YEARLY_CORPUS_PATH.exists():
        raise SystemExit(
            f"Error: {YEARLY_CORPUS_PATH} not found. "
            "Run build_yearly_corpus.py first."
        )

    print(f"Loading yearly corpus from {YEARLY_CORPUS_PATH} ...")
    yearly_corpus = load_yearly_corpus(YEARLY_CORPUS_PATH)

    unique_words = extract_unique_words(yearly_corpus)
    print(f"Found {len(unique_words)} unique tokens.")

    sorted_words = sorted(unique_words)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    with RAW_DICT_PATH.open("w", encoding="utf-8") as f:
        for w in sorted_words:
            f.write(w + "\n")

    print(f"Wrote raw dictionary to: {RAW_DICT_PATH}")
    print("Next step: open this file, fix OCR errors / junk, and save as a cleaned dictionary.")
    print("For example: unique_words_cleaned.txt")


if __name__ == "__main__":
    main()
