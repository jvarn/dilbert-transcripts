import json
from pathlib import Path
from datetime import datetime

import pandas as pd
import matplotlib.pyplot as plt
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


CANDIDATE_LABELS = [
    "amusement",
    "frustration",
    "annoyance",
    "cynicism",
    "resignation",
    "anger",
    "optimism",
    "neutral",
]


def build_emotion_pipeline():
    """Build a zero-shot emotion classifier.

    We use a DeBERTa v3 model fine-tuned for general-purpose zero-shot
    classification. We then define our own emotion labels that are
    well-suited to Dilbert's tone.
    """
    clf = pipeline(
        "zero-shot-classification",
        model="MoritzLaurer/deberta-v3-large-zeroshot-v1",
    )
    return clf


def get_emotion_scores(classifier, text: str) -> dict:
    """Return a dict mapping each candidate label to a score in [0, 1].

    The zero-shot pipeline returns a dict with 'labels' and 'scores'. We
    normalise it into a fixed mapping for all labels in CANDIDATE_LABELS.
    """
    result = classifier(
        text,
        candidate_labels=CANDIDATE_LABELS,
        multi_label=True,
        truncation=True,
    )

    labels = result["labels"]
    scores = result["scores"]

    score_map = {label: 0.0 for label in CANDIDATE_LABELS}
    for label, score in zip(labels, scores):
        if label in score_map:
            score_map[label] = float(score)
    return score_map


def compute_emotion_scores(df: pd.DataFrame) -> pd.DataFrame:
    """Add one column per emotion label with scores in [0, 1], plus 'top_emotion'."""
    print("Building zero-shot emotion classifier (this may take a moment on first run)...")
    emotion_clf = build_emotion_pipeline()

    rows = []
    total = len(df)
    print(f"Computing emotion scores for {total} comics...")

    for idx, text in enumerate(df["text"], 1):
        if idx % 100 == 0 or idx == total:
            print(f"  Processed {idx}/{total} comics ({100*idx/total:.1f}%)")
        scores = get_emotion_scores(emotion_clf, text)
        rows.append(scores)

    scores_df = pd.DataFrame(rows)

    df = df.copy()
    for label in CANDIDATE_LABELS:
        df[label] = scores_df[label]

    # Derive a 'top_emotion' column for convenience
    df["top_emotion"] = df[CANDIDATE_LABELS].idxmax(axis=1)
    return df


def aggregate_by_year(df: pd.DataFrame) -> pd.DataFrame:
    """Aggregate emotion scores by year.

    Returns a DataFrame where each row is a year, each emotion column is
    the mean score for that year, and 'comic_count' is the number of
    comics in that year.
    """
    grouped = df.groupby("year")
    mean_scores = grouped[CANDIDATE_LABELS].mean().reset_index()
    mean_scores["comic_count"] = grouped.size().values
    return mean_scores


def save_results(stats: pd.DataFrame, out_dir: Path):
    """Save yearly emotion statistics to CSV."""
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / "yearly_zero_shot_emotions.csv"
    stats.to_csv(out_path, index=False)
    print(f"Yearly zero-shot emotion statistics saved to: {out_path}")


def plot_emotion_heatmap(stats: pd.DataFrame, out_dir: Path):
    """Plot a heatmap: years on x-axis, emotions on y-axis, colours = mean score."""
    out_dir.mkdir(parents=True, exist_ok=True)

    stats = stats.sort_values("year")
    years = stats["year"].tolist()
    emotion_matrix = stats.set_index("year")[CANDIDATE_LABELS].T.values

    fig, ax = plt.subplots(figsize=(16, 6))
    im = ax.imshow(emotion_matrix, aspect="auto")

    ax.set_xlabel("Year")
    ax.set_ylabel("Emotion")
    ax.set_title("Year-by-Year Zero-shot Emotion Scores in Dilbert Transcripts")

    ax.set_xticks(range(len(years)))
    ax.set_xticklabels(years, rotation=90)
    ax.set_yticks(range(len(CANDIDATE_LABELS)))
    ax.set_yticklabels(CANDIDATE_LABELS)

    cbar = fig.colorbar(im, ax=ax)
    cbar.set_label("Mean emotion score (0–1)")

    fig.tight_layout()
    out_path = out_dir / "yearly_zero_shot_emotions_heatmap.png"
    fig.savefig(out_path, dpi=150)
    plt.close(fig)
    print(f"Zero-shot emotion heatmap saved to: {out_path}")


def main():
    # Output directory relative to this script's location
    out_dir = Path(__file__).parent / "zero_shot_emotion_output"

    print("Loading dataset...")
    df = load_dataset()

    print("Computing zero-shot emotion scores...")
    df_with_scores = compute_emotion_scores(df)

    print("Aggregating by year...")
    yearly_stats = aggregate_by_year(df_with_scores)

    print("Saving CSV...")
    save_results(yearly_stats, out_dir)

    print("Plotting emotion heatmap...")
    plot_emotion_heatmap(yearly_stats, out_dir)

    print("Done.")
    print(f"Outputs saved in: {out_dir}")


if __name__ == "__main__":
    main()