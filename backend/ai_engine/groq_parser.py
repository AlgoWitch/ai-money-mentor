import os
import json
import re
from decimal import Decimal
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

# Ensure we have the API key
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
client = Groq(api_key=GROQ_API_KEY)

def extract_6_dimensions(doc_text: str):
    """
    Uses Groq Llama 3.1 to extract 6 wealth dimensions from a bank statement or Form 16.
    Returns a unified JSON object.
    """
    prompt = f"""
    You are an expert financial analyst. A user has uploaded their bank statement, SMS logs, or Form 16 text.
    Analyze the text and extract insights into exactly these 6 dimensions as a valid JSON object:
    1. "emergency_fund": Evaluate if they have liquid cash (e.g., savings account balances). Give a status like "Strong", "Weak", or "Unknown" and a brief reason.
    2. "insurance": Check for insurance premiums (LIC, Health, Term). Give status and reason.
    3. "debt": Check for EMI, Loan payments, or credit card bills. Give status and reason.
    4. "tax": Check for TDS deductions, tax payments, or tax-saving investments. Give status.
    5. "diversification": Check for mutual funds (AMC, SIP), stocks (Zerodha, Upstox), or FDs. Give status.
    6. "retirement": Check for EPF, PPF, or NPS contributions. Give status.
    
    If the text lacks info for a dimension, set its status to "Unknown".

    User Document Text:
    '''
    {doc_text}
    '''

    Output ONLY valid JSON. Example format:
    {{
        "emergency_fund": {{"status": "Weak", "details": "Low savings balance detected."}},
        "insurance": {{"status": "Unknown", "details": "No premium payments found."}},
        "debt": {{"status": "High", "details": "Multiple EMIs detected totaling Rs 15000."}},
        "tax": {{"status": "On Track", "details": "Regular TDS deductions present."}},
        "diversification": {{"status": "Strong", "details": "SIP to Mutual Funds found."}},
        "retirement": {{"status": "Unknown", "details": "No EPF/PPF contributions visible."}}
    }}
    """
    try:
        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "You are an expert Indian Wealth Advisor AI. You only output valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,
            max_tokens=1024,
            response_format={"type": "json_object"}
        )
        result = completion.choices[0].message.content
        return json.loads(result)
    except Exception as e:
        print(f"Groq API Error: {e}")
        # Fallback empty structure
        return {
            "emergency_fund": {"status": "Error", "details": "AI Parsing Failed"},
            "insurance": {"status": "Error", "details": "AI Parsing Failed"},
            "debt": {"status": "Error", "details": "AI Parsing Failed"},
            "tax": {"status": "Error", "details": "AI Parsing Failed"},
            "diversification": {"status": "Error", "details": "AI Parsing Failed"},
            "retirement": {"status": "Error", "details": "AI Parsing Failed"}
        }

def parse_indian_numerics(val) -> float:
    if isinstance(val, (int, float)):
        return float(val)
    if not isinstance(val, str):
        return 0.0
        
    v = val.lower().strip()
    match = re.search(r'([\d.,]+)', v)
    if not match:
        return 0.0
        
    num_str = match.group(1).replace(',', '')
    try:
        base_num = float(num_str)
    except ValueError:
        return 0.0
        
    if 'cr' in v or 'crore' in v:
        return base_num * 10_000_000
    elif 'lakh' in v or 'l ' in v or 'lac' in v:
        return base_num * 100_000
    elif 'k ' in v or v.endswith('k') or 'thousand' in v:
        return base_num * 1000
    elif 'm ' in v or 'million' in v:
        return base_num * 1_000_000
        
    return base_num

def generate_fire_roadmap(age, income, expenses, savings, target):
    """
    Math-driven SIP Roadmap calculation with Decimal precision and String ingestion.
    """
    age = int(parse_indian_numerics(age)) if age else 30
    income = parse_indian_numerics(income)
    expenses = parse_indian_numerics(expenses)
    savings = parse_indian_numerics(savings)
    target = parse_indian_numerics(target)

    if income <= 0:
        return {"status": "Error", "message": "Bhai, pehle income toh source clearly batao!"}
        
    if expenses >= income:
        return {
            "status": "Critical",
            "message": "Expenses exceed income. Bhai, thoda kharcha kam karo aur budgeting try karo before planning FIRE.",
            "sip_amount": 0,
            "years_to_fire": 0,
            "target_age": age
        }
    
    monthly_investment_capacity = income - expenses
    
    if target <= savings:
        return {
            "status": "Done",
            "message": "Arre wah! Your current savings already exceed your FIRE target. You are financially independent!",
            "sip_amount": 0,
            "years_to_fire": 0,
            "target_age": age
        }
    
    rate_monthly = Decimal("0.12") / Decimal("12")
    months = 0
    current = Decimal(str(savings))
    sip_amount = Decimal(str(monthly_investment_capacity * 0.7))
    target_dec = Decimal(str(target))
    
    while current < target_dec and months < 600: # Max 50 years (600 months)
        current = current * (Decimal("1") + rate_monthly) + sip_amount
        months += 1
        
    if months >= 600:
        return {
            "status": "Impossible",
            "message": f"Bhai, target thoda realistic rakhein? With a ₹{int(sip_amount)} monthly SIP, reaching ₹{int(target)} will take over 50 years. Consider increasing your primary income or lowering the FIRE goal.",
            "sip_amount": int(sip_amount),
            "years_to_fire": 50,
            "target_age": age + 50
        }
        
    years = round(months / 12, 1)
    
    return {
        "status": "Achievable",
        "message": f"If you aggressively invest ₹{int(sip_amount)} per month in a diversified equity portfolio (assuming 12% returns), you can realistically reach your FIRE goal of ₹{int(target)} in about {years} years (by age {age + int(years)}).",
        "sip_amount": int(sip_amount),
        "years_to_fire": years,
        "target_age": age + int(years)
    }

def chat_with_groq(user_message: str, user_profile: dict, history: list):
    """
    Drives the Niveshak Chat experience.
    """
    clean_profile = dict(user_profile.get('profile', {}))
    clean_profile.pop('chat_history', None)
    
    system_prompt = f"""You are Niveshak, an elite AI Private Wealth Mentor for Indians.
    Your tone is 'Quiet Luxury', professional yet approachable, occasionally using Hinglish natively (e.g., 'Arre bhai', 'Sahi baat hai').
    You must be concise (WhatsApp style) and highly accurate.
    
    CRITICAL USER DATA (Source of Truth):
    {json.dumps(clean_profile, indent=2)}
    
    Rules:
    1. ALWAYS use the above data to answer questions about the user's age, city, goal, health score, or 6 Wealth Dimensions.
    2. If the user asks about their info and it's missing, tell them you don't have it yet.
    3. If they just submitted their info, acknowledge it beautifully and prompt them to upload a bank statement or paste an SMS so you can analyze their wealth.
    """
    
    messages = [{"role": "system", "content": system_prompt}]
    
    print("\n--- SYSTEM PROMPT ---\n", system_prompt, "\n---------------------\n")
    
    # Add recent history (last 5 msgs)
    recent = history[-5:] if len(history) > 5 else history
    for msg in recent:
        if not isinstance(msg, dict): continue
        role = "assistant" if msg.get("role") == "ai" else "user"
        messages.append({"role": role, "content": msg.get("message", "")})
        
    messages.append({"role": "user", "content": user_message})
    
    try:
        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages,
            temperature=0.6,
            max_tokens=250
        )
        return completion.choices[0].message.content
    except Exception as e:
        print(f"Groq Chat Error: {e}")
        return "I am currently syncing with the markets. Can you repeat that?"
