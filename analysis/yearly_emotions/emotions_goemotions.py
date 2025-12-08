import json
from pathlib import Path
from datetime import datetime

import pandas as pd
import matplotlib.pyplot as plt
import torch
from transformers import pipeline


DATASET_PATH = Path(__file__).parent.parent.parent / "data" / "dilbert_comics_transcripts.json"


def load_dataset() -> pd.DataFrame:
    """
    Load the Dilbert transcripts and return a DataFrame with at least:
      - date (string)
      - year (int)
      - text (full transcript)
    
    The JSON structure is:
    {
        "1989-04-16": {
            "transcript": "FULL TEXT HERE",
            "title": "...",
            ...
        },
        ...
    }
    """
    print(f"Loading dataset from: {DATASET_PATH}")
    
    if not DATASET_PATH.exists():
        raise FileNotFoundError(
            f"Dataset not found at {DATASET_PATH}. "
            f"Please check the DATASET_PATH constant in this script."
        )
    
    with DATASET_PATH.open("r", encoding="utf-8") as f:
        data = json.load(f)

    rows = []
    skipped = 0

    # The JSON is a dictionary where keys are date strings and values are entry dicts
    for date_str, entry in data.items():
        # Extract the transcript text
        transcript = entry.get('transcript', '')
        
        if not transcript:
            skipped += 1
            continue

        # Parse year from date string (format: "YYYY-MM-DD")
        try:
            year = datetime.strptime(date_str, "%Y-%m-%d").year
        except ValueError:
            # Fallback: first 4 chars as year
            try:
                year = int(date_str[:4])
            except (ValueError, IndexError):
                skipped += 1
                continue

        rows.append(
            {
                "date": date_str,
                "year": year,
                "text": transcript.strip(),
            }
        )

    if skipped > 0:
        print(f"Warning: Skipped {skipped} entries with missing transcripts")
    
    df = pd.DataFrame(rows)
    print(f"Loaded {len(df)} comics from dataset")
    return df


def get_device():
    """
    Determine the best available device for model inference.
    Priority: MPS (Apple Silicon) > CUDA (NVIDIA GPU) > CPU
    """
    if torch.backends.mps.is_available():
        return "mps"
    elif torch.cuda.is_available():
        return "cuda"
    else:
        return "cpu"


def build_emotion_pipeline():
    """
    Build the GoEmotions classifier.
    We use SamLowe/roberta-base-go_emotions, which is widely used and well-documented.
    """
    device = get_device()
    print(f"Using device: {device}")
    clf = pipeline(
        "text-classification",
        model="SamLowe/roberta-base-go_emotions",
        top_k=None,  # return scores for ALL labels
        device=device,
    )
    return clf


def get_top_emotion(classifier, text: str):
    """
    Run the classifier on a single text and return (label, score)
    for the highest-scoring emotion.
    """
    # classifier(text) returns a list with one element (for the single input),
    # which is itself a list of {label, score} dicts (because top_k=None).
    result = classifier(text, truncation=True)[0]
    best = max(result, key=lambda x: x["score"])
    return best["label"], best["score"]


def compute_top_emotions(df: pd.DataFrame) -> pd.DataFrame:
    """
    Add two columns:
      - top_emotion
      - top_emotion_score
    """
    print("Building emotion classifier (this may take a moment on first run)...")
    emotion_clf = build_emotion_pipeline()

    top_labels = []
    top_scores = []

    total = len(df)
    print(f"Computing emotions for {total} comics...")
    
    # Process with progress updates every 100 comics
    for idx, text in enumerate(df["text"], 1):
        if idx % 100 == 0 or idx == total:
            print(f"  Processed {idx}/{total} comics ({100*idx/total:.1f}%)")
        label, score = get_top_emotion(emotion_clf, text)
        top_labels.append(label)
        top_scores.append(score)

    df = df.copy()
    df["top_emotion"] = top_labels
    df["top_emotion_score"] = top_scores
    return df


def aggregate_by_year(df: pd.DataFrame) -> pd.DataFrame:
    """
    Return a pivot table where each row is a year and each column is an emotion,
    with values = proportion of comics in that year whose TOP emotion is that label.
    """
    counts = (
        df.groupby(["year", "top_emotion"])
        .size()
        .reset_index(name="count")
    )

    # Pivot to wide format: rows = years, columns = emotions
    pivot = counts.pivot_table(
        index="year",
        columns="top_emotion",
        values="count",
        fill_value=0,
    )

    # Also compute proportions per year (row-normalised)
    row_sums = pivot.sum(axis=1)
    proportions = pivot.div(row_sums, axis=0)

    # For convenience, keep both
    proportions.index.name = "year"
    return proportions, pivot


def save_results(proportions: pd.DataFrame, counts: pd.DataFrame, out_dir: Path):
    out_dir.mkdir(parents=True, exist_ok=True)
    proportions.to_csv(out_dir / "emotions_goemotions_proportions.csv")
    counts.to_csv(out_dir / "emotions_goemotions_counts.csv")


def plot_heatmap(proportions: pd.DataFrame, out_dir: Path):
    """
    Simple heatmap: years on the x-axis, emotions on the y-axis.
    Darker = more common that year.
    """
    # Sort by year for nicer plotting
    proportions = proportions.sort_index()

    fig, ax = plt.subplots(figsize=(14, 6))

    im = ax.imshow(proportions.T, aspect="auto")

    ax.set_xlabel("Year")
    ax.set_ylabel("Emotion")

    ax.set_xticks(range(len(proportions.index)))
    ax.set_xticklabels(proportions.index, rotation=90)

    ax.set_yticks(range(len(proportions.columns)))
    ax.set_yticklabels(proportions.columns)

    fig.colorbar(im, ax=ax, label="Proportion of comics (top emotion)")

    ax.set_title("Year-by-Year Emotion Distribution in Dilbert Transcripts")

    out_dir.mkdir(parents=True, exist_ok=True)
    fig.tight_layout()
    fig.savefig(out_dir / "emotions_goemotions_heatmap.png", dpi=150)
    plt.close(fig)


def main():
    # Output directory relative to this script's location
    out_dir = Path(__file__).parent / "emotions_goemotions_output"

    print("Loading dataset...")
    df = load_dataset()

    print("Computing top emotions...")
    df_with_emotions = compute_top_emotions(df)

    print("Aggregating by year...")
    proportions, counts = aggregate_by_year(df_with_emotions)

    print("Saving CSVs...")
    save_results(proportions, counts, out_dir)

    print("Plotting heatmap...")
    plot_heatmap(proportions, out_dir)

    print("Done.")
    print(f"Outputs saved in: {out_dir}")


if __name__ == "__main__":
    main()