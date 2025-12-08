# Instructions
## 1. Essential packages

These are required for your sarcasm script to run:

Transformers + PyTorch backend

One of these pairs:

MacBooks with Apple Silicon (M1/M2/M3/M4):
Use PyTorch with Metal acceleration:

pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu

(Yes — even though you have a GPU, the Apple GPU acceleration is built into the CPU wheels.)

Then install Transformers:

pip install transformers


⸻

Data + Plotting

Your script uses these:

pip install pandas matplotlib


⸻

JSON + pathlib are built-in, no need to install.

⸻

## 2. Optional but recommended

TQDM (progress bars)

Useful for long-running analysis:

pip install tqdm

Jupyter (if you want notebooks)

pip install jupyter

Accelerate (optional speed improvement for Transformers)

pip install accelerate


⸻

## 3. A clean requirements.txt for this project

If you want to save a file like requirements.txt:

torch
torchvision
torchaudio
transformers
pandas
matplotlib
tqdm
accelerate

(If you prefer exact versions, I can lock it for you based on your current environment.)

⸻

## 4. One-liner to install everything

If you want a quick setup:

pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu && pip install transformers pandas matplotlib tqdm accelerate


⸻

## 5. Sanity check — verify Transformers sees your PyTorch

Run this:

import torch
print(torch.__version__)
print("MPS available:", torch.backends.mps.is_available())

If you see:

MPS available: True

→ your Apple GPU acceleration works.
