import os
import json
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

def generate_fire_roadmap(age: int, income: float, expenses: float, savings: float, target: float):
    """
    Math-driven SIP Roadmap calculation.
    """
    monthly_investment_capacity = income - expenses
    if monthly_investment_capacity <= 0:
        return {
            "status": "Critical",
            "message": "Expenses exceed income. Focus on debt reduction and budgeting first.",
            "sip_amount": 0,
            "years_to_fire": 0
        }
    
    # Simple future value calculation assuming 12% annual return (1% monthly)
    # Target = Savings * (1.12)^n + SIP * (((1.12)^n - 1) / 0.12)
    # We will approximate the years to hit the target.
    
    rate_monthly = 0.12 / 12
    months = 0
    current = savings
    sip_amount = monthly_investment_capacity * 0.7  # Recommend investing 70% of surplus
    
    while current < target and months < 480: # Max 40 years
        current = current * (1 + rate_monthly) + sip_amount
        months += 1
        
    years = round(months / 12, 1)
    
    return {
        "status": "Achievable",
        "message": f"If you invest ₹{int(sip_amount)} per month in a diversified equity portfolio (assuming 12% returns), you can reach your FIRE goal of ₹{int(target)} in about {years} years (by age {age + int(years)}).",
        "sip_amount": int(sip_amount),
        "years_to_fire": years,
        "target_age": age + int(years)
    }
