import pandas as pd
import matplotlib.pyplot as plt
import numpy as np

# -------------------------------------------------------------------
# CONFIG
# -------------------------------------------------------------------
INPUT_CSV = "buzzword_counts_by_year.csv"
OUTPUT_PNG = "buzzword_heatmap_top20.png"
TOP_N = 20
FIGSIZE = (14, 10)

# -------------------------------------------------------------------
# LOAD AND FIX DATA
# -------------------------------------------------------------------
df = pd.read_csv(INPUT_CSV)

# Rename first column to "year"
df = df.rename(columns={"Unnamed: 0": "year"})

# Set year as index
df = df.set_index("year")

# -------------------------------------------------------------------
# FIND TOP 20 BUZZWORDS OVERALL
# -------------------------------------------------------------------
# Sum each buzzword column
total_counts = df.sum(axis=0).sort_values(ascending=False)

top_words = total_counts.head(TOP_N).index.tolist()

print(f"Top {TOP_N} buzzwords:")
for w in top_words:
    print(f" - {w}")

# -------------------------------------------------------------------
# SUBSET MATRIX TO TOP 20 COLUMNS
# -------------------------------------------------------------------
matrix = df[top_words]

# -------------------------------------------------------------------
# PLOT HEATMAP
# -------------------------------------------------------------------
plt.figure(figsize=FIGSIZE)

plt.imshow(matrix.T, aspect="auto", cmap="viridis")
plt.colorbar(label="Frequency")

plt.title("Top 20 Corporate Buzzwords by Year")
plt.xlabel("Year")
plt.ylabel("Buzzword")

# X-axis ticks
plt.xticks(
    ticks=np.arange(len(matrix.index)),
    labels=matrix.index,
    rotation=45
)

# Y-axis ticks
plt.yticks(
    ticks=np.arange(len(top_words)),
    labels=top_words
)

plt.tight_layout()
plt.savefig(OUTPUT_PNG, dpi=300)
plt.close()

print(f"\nSaved heatmap to {OUTPUT_PNG}")