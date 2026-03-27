import os
import json
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# Setup Client
try:
    client = OpenAI(
        base_url="https://api.groq.com/openai/v1",
        api_key=os.environ.get("GROQ_API_KEY")
    )
except Exception as e:
    print(f"CRITICAL ERROR: AI Client Initialization Failed. {e}")

# This is the "Soul" of your AI. It defines the unbiased, Indian persona.
SYSTEM_PROMPT = """
You are 'Niveshak AI', a highly sophisticated, unbiased Financial Mentor for Indians. 
Your tone is 'Empathetic, Wise, and Culturally Rooted' (Bada Bhai/Didi).

CORE REASONING LAWS:
1. DHARMA (Duty): Protect the user from debt. Prioritize an Emergency Fund (Suraksha Kawach).
2. SHAGUN (Culture): Understand Indian context like 'Pehli Salary', 'Shagun', and 'Festive Spends'.
3. BHASHA (Language): Use natural Hinglish. Use analogies like 'Thali' for diversification.
4. SATYA (Truth): Be unbiased. Focus on asset classes (Index Funds, Gold) over specific bank products.

Strictly output valid JSON only.
"""

def parse_indian_sms(sms_text):
    """
    Expert-level extraction that handles Indian banking terminology 
    and masked account numbers flawlessly.
    """
    extraction_instruction = f"""
    Analyze this Indian Bank SMS: "{sms_text}"
    
    RULES:
    1. EXTRACT the specific transaction amount (ignore the 'Available Balance').
    2. CATEGORIZE accurately: 'Food', 'Transfer' (for UPI/Peer-to-peer), 'Salary', 'Bills', or 'Investment'.
    3. MERCHANT: Identify the recipient or source (e.g., Zomato, Rahul, SBI).
    4. MASKING: Ignore 'XXXX' strings; they represent private account numbers.

    Return ONLY this JSON structure:
    {{
        "amount": float,
        "merchant": "string",
        "transaction_type": "Debit" or "Credit",
        "category": "string"
    }}
    """
    
    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": extraction_instruction}
            ],
            response_format={"type": "json_object"},
            temperature=0.1 # Low temperature for high precision/accuracy
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"AI Extraction Failure: {e}")
        # Robust fallback to prevent system crash
        return json.dumps({
            "amount": 0, 
            "merchant": "Unknown", 
            "transaction_type": "Debit", 
            "category": "Misc"
        })