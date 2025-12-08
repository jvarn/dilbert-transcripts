# Emotion and Sarcasm Analysis

This module performs emotion classification and sarcasm detection on Dilbert comic transcripts using pre-trained Hugging Face models. It analyzes how emotional patterns and sarcasm have changed over time (1989-2023) across three different approaches:

1. **GoEmotions Classification** (`emotions_goemotions.py`) - Uses a fixed emotion vocabulary
2. **Sarcasm Detection** (`emotions_sarcasm.py`) - Detects irony and sarcasm patterns
3. **Zero-Shot Emotion Classification** (`emotions_zeroshot.py`) - Uses custom emotion labels

## What This Module Does

- Loads the Dilbert transcript JSON dataset from the main repository
- Applies NLP models to classify emotions and detect sarcasm in each comic
- Aggregates results by year to show trends over time
- Generates CSV files with statistics and PNG visualizations (heatmaps and trend charts)

## Scripts Overview

### 1. `emotions_goemotions.py`

Uses the **GoEmotions** model (`SamLowe/roberta-base-go_emotions`) to classify comics into a fixed set of 28 emotion labels plus "neutral". For each comic, it selects the top emotion label and computes yearly proportions.

**Outputs:**
- `emotions_goemotions_proportions.csv` - Yearly proportions for each emotion label
- `emotions_goemotions_counts.csv` - Yearly counts for each emotion label
- `emotions_goemotions_heatmap.png` - Heatmap visualization

### 2. `emotions_sarcasm.py`

Uses the **CardiffNLP Twitter RoBERTa Irony** model (`cardiffnlp/twitter-roberta-base-irony`) to detect sarcasm and irony in comic transcripts. Each comic receives a sarcasm score from 0 to 1, which is then averaged by year.

**Outputs:**
- `emotions_sarcasm_stats.csv` - Yearly statistics (mean, std, count)
- `emotions_sarcasm_trend.png` - Line chart showing sarcasm trends over time

### 3. `emotions_zeroshot.py`

Uses a **DeBERTa-v3 zero-shot classifier** (`MoritzLaurer/deberta-v3-large-zeroshot-v1`) with custom emotion labels tailored to Dilbert's tone: amusement, frustration, annoyance, cynicism, resignation, anger, optimism, and neutral. Unlike GoEmotions, this model scores all labels simultaneously.

**Outputs:**
- `emotions_zeroshot.csv` - Yearly mean scores for each emotion label
- `emotions_zeroshot_heatmap.png` - Heatmap showing emotion scores over time

## Setup Instructions

### Prerequisites

- **Python 3.8 or higher** (Python 3.9+ recommended)
- A virtual environment (recommended to isolate dependencies)

### Step 1: Create and Activate a Virtual Environment

```bash
# Navigate to the analysis/yearly_emotions directory
cd analysis/yearly_emotions

# Create a virtual environment
python3 -m venv venv

# Activate it
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate
```

### Step 2: Install Dependencies

**For Apple Silicon Macs (M1/M2/M3/M4):**

PyTorch with Metal acceleration should be installed first:

```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
```

Then install the remaining dependencies:

```bash
pip install -r requirements.txt
```

**For other systems:**

```bash
pip install -r requirements.txt
```

**Note:** The `transformers` library requires PyTorch (`torch`), which may take several minutes to install. On first run, the models will be downloaded automatically (several hundred MB total).

### Step 3: Run the Analysis

Each script can be run independently:

```bash
# Make sure you're in the analysis/yearly_emotions directory
cd analysis/yearly_emotions

# Run GoEmotions analysis
python emotions_goemotions.py

# Run sarcasm detection
python emotions_sarcasm.py

# Run zero-shot emotion classification
python emotions_zeroshot.py
```

Each script will:
1. Load the dataset from `../../data/dilbert_comics_transcripts.json`
2. Process each comic through the respective model (this takes several minutes)
3. Generate output files in the corresponding `*_output/` directory

## Expected Outputs

### GoEmotions Output (`emotions_goemotions_output/`)

- **`emotions_goemotions_proportions.csv`** - Pivot table with years as rows and emotions as columns, showing proportions
- **`emotions_goemotions_counts.csv`** - Same structure but with raw counts
- **`emotions_goemotions_heatmap.png`** - Heatmap visualization showing emotion distribution over time

### Sarcasm Output (`emotions_sarcasm_output/`)

- **`emotions_sarcasm_stats.csv`** - Columns:
  - `year`: The year (1989-2023)
  - `mean_sarcasm`: Average sarcasm score (0.0 to 1.0)
  - `std_sarcasm`: Standard deviation of sarcasm scores
  - `comic_count`: Number of comics analyzed
- **`emotions_sarcasm_trend.png`** - Line chart with years on x-axis and mean sarcasm score on y-axis, plus a bar chart overlay showing comic counts

### Zero-Shot Output (`emotions_zeroshot_output/`)

- **`emotions_zeroshot.csv`** - Columns:
  - `year`: The year (1989-2023)
  - `amusement`, `frustration`, `annoyance`, `cynicism`, `resignation`, `anger`, `optimism`, `neutral`: Mean scores (0.0 to 1.0) for each emotion
  - `comic_count`: Number of comics analyzed
- **`emotions_zeroshot_heatmap.png`** - Heatmap showing emotion scores over time, with years on x-axis and emotions on y-axis

## How It Works

### Dataset Structure

The scripts read from `../../data/dilbert_comics_transcripts.json`, which has this structure:

```json
{
  "1989-04-16": {
    "transcript": "FULL TEXT OF THE COMIC...",
    "title": "...",
    ...
  },
  ...
}
```

Each script extracts the date (from the key) and transcript text (from the `transcript` field) for processing.

### Models Used

1. **GoEmotions** (`SamLowe/roberta-base-go_emotions`)
   - Pre-trained on Reddit comments with 28 emotion labels
   - Returns probability scores for all labels
   - Script selects the top label per comic

2. **CardiffNLP Irony** (`cardiffnlp/twitter-roberta-base-irony`)
   - Trained on Twitter data for irony/sarcasm detection
   - Returns binary classification (ironic/not ironic)
   - Script converts to a 0-1 sarcasm probability score

3. **DeBERTa-v3 Zero-Shot** (`MoritzLaurer/deberta-v3-large-zeroshot-v1`)
   - General-purpose zero-shot classifier
   - Accepts custom labels without fine-tuning
   - Returns scores for all labels simultaneously

### Processing Time

- **First run per script**: 15-30 minutes (model download + processing ~12,000 comics)
- **Subsequent runs**: 10-20 minutes (models are cached, only processing needed)

Progress is shown every 100 comics processed.

## Troubleshooting

### "Dataset not found" Error

Make sure you're running the scripts from the `analysis/yearly_emotions/` directory, and that `../../data/dilbert_comics_transcripts.json` exists (i.e., the dataset is in the `data/` folder at the repository root).

### Out of Memory Errors

The scripts process comics one at a time, which is memory-efficient. If you still encounter memory issues, you may need to:
- Close other applications
- Process a subset of years by modifying the date filtering in `load_dataset()`

### Model Download Issues

If models fail to download, check your internet connection. Models are downloaded automatically on first use and cached in `~/.cache/huggingface/` for future runs.

### Apple Silicon (M1/M2/M3/M4) Performance

After installing PyTorch with the CPU wheels, verify Metal acceleration is available:

```python
import torch
print("MPS available:", torch.backends.mps.is_available())
```

If this returns `True`, your Apple GPU acceleration is working.

## Using the Results

The CSV files can be imported into:
- Excel or Google Sheets for further analysis
- Python pandas for additional processing
- R or other statistical tools

The visualizations can be used in:
- Presentations and reports
- Further analysis
- Web articles (see `public/articles-images/` for web-ready versions)

## Notes

- This module uses the **existing** dataset in the main repository - it does not duplicate it
- The models are general-purpose NLP models - they may not perfectly capture all nuances of Dilbert's humor
- Results are meant for exploratory analysis and research purposes
- The zero-shot approach allows for custom emotion labels that better match Dilbert's specific tone
