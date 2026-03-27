import datetime
import json

def log_ai_decision(user_id, sms_input, ai_output, logic_applied):
    """
    Mandatory for SEBI 2026 Compliance: 
    Stores the 'Reasoning' behind every financial nudge.
    """
    log_entry = {
        "timestamp": datetime.datetime.now().isoformat(),
        "user_id": user_id,
        "input_masked": sms_input,
        "ai_response": ai_output,
        "logic": logic_applied,
        "compliance_tag": "EDUCATIONAL_NUDGE"
    }
    with open("data/compliance_audit.log", "a") as f:
        f.write(json.dumps(log_entry) + "\n")