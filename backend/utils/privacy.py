import re

def mask_sensitive_info(text):
    # Mask Account numbers (usually 4+ digits preceded by A/c or ending a string)
    # But AVOID masking amounts like 2,500 or 1500.00
    # Logic: Look for digits that are NOT preceded by "Rs." or "INR"
    masked = re.sub(r'(?<!Rs\.\s)(?<!Rs)(?<!INR\s)\d{4,}', 'XXXX', text)
    return masked