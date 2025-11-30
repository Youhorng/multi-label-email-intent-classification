import os
from huggingface_hub import HfApi

HF_TOKEN = os.getenv("HF_TOKEN")
api = HfApi(token=HF_TOKEN)

repo_id = "Youhorng/distilbert-lora-multilabel-email-intent-classification"
final_dir = "/Users/youhorng/Desktop/projects/multi-label-email-intent-classification/notebooks/encoder_only_finetuning/outputs/distilbert-lora-multilabel-v2-1/final_model"

# Create repo if not exists
api.create_repo(
    repo_id=repo_id,
    repo_type="model",
    private=False,
    exist_ok=True,  # Avoids errors if it already exists
)

# Upload the folder
api.upload_folder(
    folder_path=final_dir,
    repo_id=repo_id,
    repo_type="model",
    path_in_repo="",   # Upload files to root
    commit_message="Upload final LoRA model with classifier head",
)