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


def build_sarcasm_pipeline():
    """
    Build a sarcasm / irony classifier.

    We use a model trained for irony detection on short texts. The exact label
    names differ slightly between models, so the downstream code is written to
    handle common patterns like:
      - 'IRONIC' / 'NOT_IRONIC'
      - 'sarcasm' / 'non-sarcasm'
      - 'LABEL_0' / 'LABEL_1'
    """
    clf = pipeline(
        "text-classification",
        model="cardiffnlp/twitter-roberta-base-irony",
    )
    return clf


def get_sarcasm_score(classifier, text: str) -> float:
    """
    Run the classifier on a single text and return a scalar sarcasm score
    in [0, 1], interpreted as the model's estimated probability that the
    text is sarcastic / ironic.

    For binary classifiers, the HF pipeline returns a dict like:
      {'label': 'IRONIC', 'score': 0.87}  or
      {'label': 'NOT_IRONIC', 'score': 0.93} or
      {'label': 'LABEL_1', 'score': ...}

    We treat the label that looks sarcastic (contains 'iron', 'sarc', or '1')
    as the "sarcastic" class. If the top label is the non-sarcastic class,
    we take (1 - score) as an approximate sarcasm probability.
    """
    result = classifier(text, truncation=True)[0]
    label = result.get("label", "")
    score = float(result.get("score", 0.0))

    label_lower = label.lower()
    is_sarcastic_label = (
        "sarc" in label_lower
        or "iron" in label_lower
        or label_lower.endswith("1")
    )

    if is_sarcastic_label:
        sarcasm_prob = score
    else:
        # Assume binary classifier: p(sarcastic) ≈ 1 - p(non-sarcastic)
        sarcasm_prob = 1.0 - score

    # Clamp just in case of numeric edge cases
    sarcasm_prob = max(0.0, min(1.0, sarcasm_prob))
    return sarcasm_prob


def compute_sarcasm_scores(df: pd.DataFrame) -> pd.DataFrame:
    """
    Add a 'sarcasm_score' column to the DataFrame, with values in [0, 1].
    """
    print("Building sarcasm classifier (this may take a moment on first run)...")
    sarcasm_clf = build_sarcasm_pipeline()

    scores = []
    total = len(df)
    print(f"Computing sarcasm scores for {total} comics...")

    for idx, text in enumerate(df["text"], 1):
        if idx % 100 == 0 or idx == total:
            print(f"  Processed {idx}/{total} comics ({100*idx/total:.1f}%)")
        score = get_sarcasm_score(sarcasm_clf, text)
        scores.append(score)

    df = df.copy()
    df["sarcasm_score"] = scores
    return df


def aggregate_by_year(df: pd.DataFrame) -> pd.DataFrame:
    """
    Aggregate sarcasm scores by year.

    Returns a DataFrame with columns:
      - year
      - mean_sarcasm
      - std_sarcasm
      - comic_count
    """
    stats = (
        df.groupby("year")["sarcasm_score"]
        .agg(["mean", "std", "count"])
        .reset_index()
    )
    stats = stats.rename(
        columns={
            "mean": "mean_sarcasm",
            "std": "std_sarcasm",
            "count": "comic_count",
        }
    )
    return stats


def save_results(stats: pd.DataFrame, out_dir: Path):
    """
    Save the yearly sarcasm statistics to CSV.
    """
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / "yearly_sarcasm_stats.csv"
    stats.to_csv(out_path, index=False)
    print(f"Yearly sarcasm statistics saved to: {out_path}")


def plot_sarcasm_trend(stats: pd.DataFrame, out_dir: Path):
    """
    Plot a simple line chart of mean sarcasm score by year.
    """
    out_dir.mkdir(parents=True, exist_ok=True)
    stats = stats.sort_values("year")

    fig, ax = plt.subplots(figsize=(12, 6))
    ax.plot(stats["year"], stats["mean_sarcasm"], marker="o")

    ax.set_xlabel("Year")
    ax.set_ylabel("Mean sarcasm score (0 = not sarcastic, 1 = highly sarcastic)")
    ax.set_title("Year-by-Year Sarcasm Trend in Dilbert Transcripts")

    # Optionally show comic counts as a secondary axis
    ax2 = ax.twinx()
    ax2.bar(
        stats["year"],
        stats["comic_count"],
        alpha=0.2,
        width=0.8,
    )
    ax2.set_ylabel("Number of comics")

    fig.tight_layout()
    out_path = out_dir / "yearly_sarcasm_trend.png"
    fig.savefig(out_path, dpi=150)
    plt.close(fig)
    print(f"Sarcasm trend plot saved to: {out_path}")


def main():
    # Output directory relative to this script's location
    out_dir = Path(__file__).parent / "yearly_sarcasm_output"

    print("Loading dataset...")
    df = load_dataset()

    print("Computing sarcasm scores...")
    df_with_scores = compute_sarcasm_scores(df)

    print("Aggregating by year...")
    yearly_stats = aggregate_by_year(df_with_scores)

    print("Saving CSV...")
    save_results(yearly_stats, out_dir)

    print("Plotting sarcasm trend...")
    plot_sarcasm_trend(yearly_stats, out_dir)

    print("Done.")
    print(f"Outputs saved in: {out_dir}")


if __name__ == "__main__":
    main()