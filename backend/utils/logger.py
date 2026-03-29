import os
import datetime
import json

# Use /tmp on Render (ephemeral but writable), fall back to data/ locally
LOG_DIR = "/tmp" if os.environ.get("RENDER") else "data"
LOG_FILE = os.path.join(LOG_DIR, "compliance_audit.log")

def log_ai_decision(user_id, sms_input, ai_output, logic_applied):
    """
    Stores the 'Reasoning' behind every financial nudge for compliance tracking.
    """
    try:
        os.makedirs(LOG_DIR, exist_ok=True)
        log_entry = {
            "timestamp": datetime.datetime.now().isoformat(),
            "user_id": user_id,
            "input_masked": sms_input,
            "ai_response": ai_output,
            "logic": logic_applied,
            "compliance_tag": "EDUCATIONAL_NUDGE"
        }
        with open(LOG_FILE, "a") as f:
            f.write(json.dumps(log_entry) + "\n")
    except Exception as e:
        print(f"[logger] Could not write compliance log: {e}")