Repair Workbench — LoRA training & evaluation skeleton
=======================================================
This folder contains example scripts to run localized model patches (LoRA) and an evaluation harness.
These are skeletons — you'll need a proper GPU environment and datasets to run them.

Files:
- requirements.txt: python deps
- train_lora.py: skeleton to fine-tune a small model with PEFT/LoRA on a CSV dataset
- evaluate.py: run a simple evaluation set of inputs through a model checkpoint and compute pass/fail

Notes:
- These scripts use Hugging Face Transformers + PEFT. For production, run on GPU instances.
- Replace MODEL_NAME with a small model you can run locally (e.g., "meta-llama/Llama-2-7b-chat" is not suitable locally).
