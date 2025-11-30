# Import libraries
import os
import json
import torch
import numpy as np
import gradio as gr
from pathlib import Path
from transformers import AutoModelForSequenceClassification, AutoTokenizer
from peft import PeftModel

# Setup Configuration
# Load model from Hugging Face If available (but might be slow)
HF_MODEL_ID = "Youhorng/distilbert-lora-multilabel-email-intent-classification"
USE_HF_HUB = True  # Set to False to use local model

# Load model from local dir
PROJECT_ROOT = Path(__file__).parent
FINAL_DIR = PROJECT_ROOT / "model" / "final_model"
META_PATH = PROJECT_ROOT / "notebooks" / "preprocess_meta.json"

# Load metadata during training
with open(str(META_PATH), "r") as f:
    meta = json.load(f)


BASE_MODEL_NAME = meta["model_name"]  # "distilbert-base-uncased"
MAX_LENGTH = meta.get("max_length", 256)
label2id = {k: int(v) for k, v in meta["label2id"].items()}
id2label = {int(k): v for k, v in meta["id2label"].items()}
num_labels = len(label2id)
all_labels = [id2label[i] for i in sorted(id2label.keys())]

# Setup the device 
device = torch.device(
    "cuda" if torch.cuda.is_available()
    else "mps" if torch.backends.mps.is_available()
    else "cpu"
)

print(f"Using device: {device}")

# Load the model
print("Loading model...")
if USE_HF_HUB:
    print(f"Loading from Hugging Face Hub: {HF_MODEL_ID}")
    tokenizer = AutoTokenizer.from_pretrained(HF_MODEL_ID)
    
    base_model = AutoModelForSequenceClassification.from_pretrained(
        BASE_MODEL_NAME,
        num_labels=num_labels,
        problem_type="multi_label_classification",
        id2label=id2label,
        label2id=label2id,
    )
    
    model = PeftModel.from_pretrained(base_model, HF_MODEL_ID)
else:
    print(f"Loading from local directory: {FINAL_DIR}")
    tokenizer = AutoTokenizer.from_pretrained(str(FINAL_DIR))
    
    base_model = AutoModelForSequenceClassification.from_pretrained(
        BASE_MODEL_NAME,
        num_labels=num_labels,
        problem_type="multi_label_classification",
        id2label=id2label,
        label2id=label2id,
    )
    
    model = PeftModel.from_pretrained(base_model, str(FINAL_DIR))

model.to(device)
model.eval()
print("✅ Model loaded successfully!")


# Create a prediction function
def predict_email_intent(subject: str, body: str, threshold: float = 0.55):

    if not subject and not body:
        return "Please enter email subject and/or body.", {}
    
    # Build text with separator
    sep = tokenizer.sep_token if tokenizer.sep_token else " "
    text = f"{subject}{sep}{body}".strip()
    
    # Tokenize
    inputs = tokenizer(
        text,
        return_tensors="pt",
        truncation=True,
        max_length=MAX_LENGTH,
        padding=True
    ).to(device)
    
    # Predict
    with torch.no_grad():
        outputs = model(**inputs)
        logits = outputs.logits.squeeze().cpu().numpy()
        probs = 1 / (1 + np.exp(-logits))  # Sigmoid
    
    # Get predictions above threshold
    predictions = []
    probabilities = {}
    
    for label, prob in zip(all_labels, probs):
        probabilities[label] = float(prob)
        if prob >= threshold:
            predictions.append(label)
    
    # Format output
    predicted_text = ", ".join(predictions) if predictions else "None"
    
    # Sort probabilities by score (descending)
    sorted_probs = dict(sorted(probabilities.items(), key=lambda x: x[1], reverse=True))
    
    return predicted_text, sorted_probs


# Create gradio interface for the app
def create_interface():
    with gr.Blocks(title="Multi-Label Email Intent Classification") as demo:
        gr.Markdown("""
        # 📧 Email Intent Classification
        
        Classify email intents using a fine-tuned DistilBERT model with LoRA.
        Enter an email subject and body to predict multiple intent labels.
        
        **Model**: DistilBERT fine-tuned with LoRA for multi-label classification  
        **Labels**: Business, Customer Support, Events & Invitations, Finance & Bills, Job Application, Newsletters, Personal, Promotions, Reminders, Travel & Bookings
        """)
        
        with gr.Row():
            with gr.Column():
                subject_input = gr.Textbox(
                    label="Email Subject",
                    placeholder="Meeting Reminder: Quarterly Sales Review",
                    lines=2
                )
                body_input = gr.Textbox(
                    label="Email Body",
                    placeholder="Dear Team, Just a friendly reminder that our Quarterly Sales Review meeting is scheduled for tomorrow...",
                    lines=10
                )
                threshold_slider = gr.Slider(
                    minimum=0.1,
                    maximum=0.9,
                    value=0.55,
                    step=0.05,
                    label="Prediction Threshold",
                    info="Higher threshold = more conservative predictions"
                )
                predict_btn = gr.Button("🔍 Predict Intents", variant="primary", size="lg")
            
            with gr.Column():
                output_text = gr.Textbox(
                    label="Predicted Intents",
                    lines=3,
                    interactive=False
                )
                output_json = gr.JSON(
                    label="All Probabilities (sorted by score)"
                )
        
        # Examples
        gr.Markdown("### 📝 Examples")
        examples = [
            [
                "Meeting Reminder: Quarterly Sales Review Tomorrow",
                "Dear Team, Just a friendly reminder that our Quarterly Sales Review meeting is scheduled for tomorrow at 10:00 AM in the conference room. Please make sure to bring your sales reports and any relevant updates."
            ],
            [
                "Flight Confirmation",
                "Dear Customer, we wanted to confirm your flight reservation from New York to London on June 15th, 2022. Please review the attached itinerary for details on your departure time, gate number, and any updates."
            ],
            [
                "Invoice Payment Due",
                "This is a reminder that your invoice #12345 for $500.00 is due on March 1st, 2024. Please make payment through our online portal."
            ],
            [
                "Job Application Follow-up",
                "Dear Hiring Manager, I am writing to follow up on my application for the Software Engineer position. I submitted my resume last week and wanted to express my continued interest in this opportunity."
            ],
            [
                "Customer Support Request",
                "Hello, I'm experiencing an issue with my account login. I've tried resetting my password multiple times but haven't received the reset email. Could you please help me resolve this?"
            ]
        ]
        gr.Examples(
            examples=examples,
            inputs=[subject_input, body_input]
        )
        
        # Connect inputs to prediction
        predict_btn.click(
            fn=predict_email_intent,
            inputs=[subject_input, body_input, threshold_slider],
            outputs=[output_text, output_json]
        )
        
        # Also allow Enter key to trigger prediction
        subject_input.submit(
            fn=predict_email_intent,
            inputs=[subject_input, body_input, threshold_slider],
            outputs=[output_text, output_json]
        )
        body_input.submit(
            fn=predict_email_intent,
            inputs=[subject_input, body_input, threshold_slider],
            outputs=[output_text, output_json]
        )
        
        model_source = "Hugging Face Hub" if USE_HF_HUB else "Local"
        gr.Markdown(f"""
        ### ℹ️ About
        - **Model Source**: {model_source}
        - **Threshold**: Adjust the slider to control prediction sensitivity. Lower values = more labels predicted, higher values = only high-confidence labels
        - **Multi-label**: Each email can have multiple intent labels simultaneously
        """)
    
    return demo


if __name__ == "__main__":
    demo = create_interface()
    demo.launch(
        share=False,  # Set to True for a public link
        server_name="0.0.0.0",  # Allow external access
        server_port=7860  # Default Gradio port
    )

