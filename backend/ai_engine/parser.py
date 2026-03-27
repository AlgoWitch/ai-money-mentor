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
    print(f"ERROR: Could not initialize AI client. Check GROQ_API_KEY. {e}")
SYSTEM_PROMPT = """
You are 'Niveshak AI', a highly sophisticated, unbiased Financial Mentor for Indians. 
Your tone is 'Empathetic, Wise, and Culturally Rooted' (Indian Big Brother/Sister).

CORE PRINCIPLES:
1. UNBIASED: Never promote a specific bank or app (like 'Use HDFC'). Instead, say 'Index Funds' or 'Digital Gold'.
2. CULTURAL CONTEXT: Understand 'Shagun', 'Diwali Savings', 'Fixed Deposits' (as a safety net), and 'Emergency Funds'.
3. LANGUAGE: Use Hinglish (Hindi + English) naturally. Use words like 'Bhai', 'Savings', 'Fayda', 'Invest'.
4. NO JUDGMENT: If a user spends on a treat, don't scold. Nudge them to 'balance' it.

Output strictly in JSON for transaction parsing.
"""

def parse_indian_sms(sms_text):
    prompt = f"""
    You are a professional Indian Financial Auditor. 
    Extract data from this SMS: "{sms_text}"
    
    Rules:
    1. Amount: Extract the TRANSACTION amount, not the balance.
    2. Category: 
       - If sent to a person/UPI: "Transfer"
       - If Zomato/Swiggy: "Food"
       - If Salary/Credited: "Salary"
       - If Bill/Electricity/Gas: "Bills"
    3. Merchant: Who received/sent the money?
    
    Return ONLY JSON:
    {{"amount": float, "merchant": "string", "transaction_type": "Debit/Credit", "category": "string"}}
    """
    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": SYSTEM_PROMPT},{"role": "user", "content": f"Analyze this SMS and extract data: {sms_text}"}],
            # This line ensures the AI MUST return JSON
            response_format={"type": "json_object"}
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"AI Parsing Error: {e}")
        # Return a fallback JSON so the app doesn't crash
        return json.dumps({
            "amount": 0, 
            "merchant": "Unknown", 
            "transaction_type": "Debit", 
            "category": "Misc"
        })