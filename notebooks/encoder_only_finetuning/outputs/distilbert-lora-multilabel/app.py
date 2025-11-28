import os

import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from peft import LoraConfig, get_peft_model
from safetensors.torch import load_file
import gradio as gr

# Exact label order from training (classification notebook)
LABELS = [
    "Business",
    "Customer Support",
    "Events & Invitations",
    "Finance & Bills",
    "Job Application",
    "Newsletters",
    "Personal",
    "Promotions",
    "Reminders",
    "Travel & Bookings",
]
THRESHOLD = 0.55  # same cutoff used in the notebook

BASE_MODEL_NAME = "distilbert-base-uncased"
CKPT_DIR = "checkpoint-512"  # use this LoRA checkpoint directly

device = "cuda" if torch.cuda.is_available() else "cpu"

# Load tokenizer (stored alongside the checkpoint)
tokenizer = AutoTokenizer.from_pretrained(CKPT_DIR)

# Load the pretrained base classifier with correct label count
base_model = AutoModelForSequenceClassification.from_pretrained(
    BASE_MODEL_NAME,
    num_labels=len(LABELS),
    problem_type="multi_label_classification",
)

# Load LoRA configuration and wrap the base model
lora_config = LoraConfig.from_pretrained(CKPT_DIR)
lora_config.inference_mode = True
model = get_peft_model(base_model, lora_config)

# Load adapter weights from the checkpoint, remapping old key format if needed
adapter_path = os.path.join(CKPT_DIR, "adapter_model.safetensors")
adapter_state = load_file(adapter_path)
remapped_state = {}
for k, v in adapter_state.items():
    new_k = (
        k.replace(".lora_A.weight", ".lora_A.default.weight")
        .replace(".lora_B.weight", ".lora_B.default.weight")
    )
    remapped_state[new_k] = v

model.load_state_dict(remapped_state, strict=False)
model.to(device)
model.eval()

@torch.inference_mode()
def classify(header, content):
    text = (header or "").strip() + " [SEP] " + (content or "").strip()
    if not text.strip():
        empty_scores = {l: 0.0 for l in LABELS}
        return empty_scores, []
    enc = tokenizer(text, truncation=True, padding=True, return_tensors="pt").to(device)
    logits = model(**enc).logits.squeeze(0)
    probs = torch.sigmoid(logits).cpu().tolist()
    scores = {label: float(round(p, 4)) for label, p in zip(LABELS, probs)}
    active = [label for label, p in scores.items() if p >= THRESHOLD]
    return scores, active

def format(scores, active):
    return "\n".join(f"{k}: {v}" for k, v in scores.items()), ", ".join(active) if active else "None"

def predict(header, content):
    scores, active = classify(header, content)
    return format(scores, active)

demo = gr.Interface(
    fn=predict,
    inputs=[gr.Textbox(label="Email Header / Subject"),
            gr.Textbox(label="Email Content", lines=8)],
    outputs=[gr.Textbox(label="Label Probabilities"),
             gr.Textbox(label=f"Predicted Labels (threshold={THRESHOLD})")],
    title="DistilBERT Multi‑Label Email Classifier",
    description="Provide header and content."
)

if __name__ == "__main__":
    demo.launch()