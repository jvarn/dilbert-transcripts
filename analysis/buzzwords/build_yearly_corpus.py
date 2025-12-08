#!/usr/bin/env python3
import json
from pathlib import Path
from collections import defaultdict

# Adjust this if your dataset is elsewhere
DATASET_PATH = Path(__file__).parents[2] / "data" / "dilbert_comics_transcripts.json"
OUT_DIR = Path(__file__).parent
YEARLY_CORPUS_PATH = OUT_DIR / "yearly_corpus.json"


def load_raw_dataset(path: Path):
    """
    Expecting a JSON file with a dictionary structure:
      {
        "1989-04-16": {
          "transcript": "FULL TRANSCRIPT HERE",
          ...
        },
        ...
      }
    """
    with path.open("r", encoding="utf-8") as f:
        data = json.load(f)
    return data


def extract_year_from_date(date_str: str):
    """Extract year from date string (assuming YYYY-MM-DD format)."""
    return int(date_str[:4])


def build_yearly_corpus(data):
    """
    Returns a dict: { "1989": [text1, text2, ...], "1990": [...], ... }
    """
    by_year = defaultdict(list)
    for date_str, entry in data.items():
        year = extract_year_from_date(date_str)
        transcript = entry.get("transcript", "")
        if not transcript:
            continue
        by_year[str(year)].append(transcript)
    return dict(sorted(by_year.items(), key=lambda kv: kv[0]))


def main():
    print(f"Loading dataset from {DATASET_PATH} ...")
    data = load_raw_dataset(DATASET_PATH)
    print(f"Loaded {len(data)} entries.")

    yearly_corpus = build_yearly_corpus(data)
    total_texts = sum(len(v) for v in yearly_corpus.values())
    print(f"Grouped into {len(yearly_corpus)} years, {total_texts} transcripts total.")

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    with YEARLY_CORPUS_PATH.open("w", encoding="utf-8") as f:
        json.dump(yearly_corpus, f, ensure_ascii=False, indent=2)

    print(f"Saved yearly corpus to: {YEARLY_CORPUS_PATH}")


if __name__ == "__main__":
    main()
