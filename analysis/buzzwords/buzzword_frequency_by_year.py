import json
import re
from collections import Counter, defaultdict
import pandas as pd
import matplotlib.pyplot as plt

# ------------------------------
# Config
# ------------------------------
YEARLY_CORPUS_PATH = "yearly_corpus.json"
BUZZWORDS_PATH = "buzzwords.txt"
OUTPUT_CSV = "buzzword_counts_by_year.csv"
OUTPUT_HEATMAP = "buzzword_heatmap.png"

# ------------------------------
# Helper Functions
# ------------------------------

def load_buzzwords(path):
    """Load buzzwords into a lowercase set."""
    with open(path, "r") as f:
        words = {line.strip().lower() for line in f if line.strip()}
    return words

def tokenize(text):
    """Basic word tokenizer: lowercase, remove punctuation, split on whitespace."""
    text = text.lower()
    text = re.sub(r"[^a-z0-9']", " ", text)  # keep letters, numbers, apostrophes
    return text.split()

# ------------------------------
# Load Data
# ------------------------------

print("Loading yearly corpus...")
with open(YEARLY_CORPUS_PATH, "r") as f:
    yearly_corpus = json.load(f)  # { "1989": ["text...", "text..."], "1990": [...], ... }

print("Loading buzzwords...")
buzzwords = load_buzzwords(BUZZWORDS_PATH)

print(f"{len(buzzwords)} buzzwords loaded.")

# ------------------------------
# Count Buzzwords Per Year
# ------------------------------

yearly_counts = {}  # {year: {buzzword: count}}

for year, transcripts in yearly_corpus.items():
    print(f"Processing year {year}...")
    word_counter = Counter()

    for text in transcripts:
        tokens = tokenize(text)
        for token in tokens:
            if token in buzzwords:
                word_counter[token] += 1

    yearly_counts[year] = dict(word_counter)

# ------------------------------
# Convert to DataFrame
# ------------------------------

df = pd.DataFrame.from_dict(yearly_counts, orient="index")
df = df.fillna(0).astype(int)

# Sort years numerically
df.index = df.index.astype(int)
df = df.sort_index()

# Save CSV
df.to_csv(OUTPUT_CSV)
print(f"Saved CSV to {OUTPUT_CSV}")

# ------------------------------
# Plot Heatmap
# ------------------------------

plt.figure(figsize=(16, 10))
plt.imshow(df.T, aspect="auto", cmap="viridis")
plt.colorbar(label="Count per year")
plt.title("Buzzword Frequency by Year in Dilbert (1989–2023)")
plt.xlabel("Year")
plt.ylabel("Buzzword")

plt.xticks(ticks=range(len(df.index)), labels=df.index, rotation=90)
plt.yticks(ticks=range(len(df.columns)), labels=df.columns)

plt.tight_layout()
plt.savefig(OUTPUT_HEATMAP, dpi=300)
print(f"Saved heatmap to {OUTPUT_HEATMAP}")
plt.close()

print("Done!")