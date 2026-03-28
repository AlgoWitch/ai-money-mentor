from fastapi import FastAPI
from pydantic import BaseModel
import json

# Internal Imports
from backend.ai_engine.parser import parse_indian_sms
from backend.ai_engine.nudge_logic import generate_smart_nudge
from backend.ai_engine.document_parser import extract_financial_profile
from backend.ai_engine.analyzer import FinancialConsultant
from backend.database.mongo import (
    create_or_update_user, 
    get_user, 
    add_chat_message, 
    update_user_fields,
    get_chat_history
)
from backend.utils.privacy import mask_sensitive_info
from backend.ai_engine.discovery import generate_contextual_question

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Niveshak AI - National Level Agent")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mongo database initializes on import via backend.database.mongo

class GoalRequest(BaseModel):
    name: str
    target: float

@app.get("/")
def home():
    return {"status": "Money AI is Live 🚀", "version": "Phase 4.1-Final"}

@app.post("/set-goal")
async def set_goal(goal: GoalRequest):
    update_user_fields("demo_user", {"goal": goal.name, "target_amount": goal.target})
    return {"message": f"Goal '{goal.name}' set for ₹{goal.target}!"}

@app.post("/process-sms")
async def process_sms(sms_content: str):
    try:
        # 1. Privacy Masking
        safe_sms = mask_sensitive_info(sms_content)
        
        # 2. AI Parsing
        raw_data = parse_indian_sms(safe_sms)
        
        # 3. Handle JSON safely
        if isinstance(raw_data, str):
            data = json.loads(raw_data)
        else:
            data = raw_data

        # 4. Generate Smart Nudge based on Profile & Goals
        nudge = generate_smart_nudge(data)

        return {
            "status": "success",
            "extracted_data": data,
            "nudge": nudge
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/analyze-profile")
async def analyze_profile(doc_text: str):
    try:
        # 1. AI extracts data from document snippet
        raw_extraction = extract_financial_profile(doc_text)
        
        # 2. Expert Logic: Parse the JSON string from AI
        if isinstance(raw_extraction, str):
            extracted_data = json.loads(raw_extraction)
        else:
            extracted_data = raw_extraction
        
        # 3. Standardize Keys (Crucial Fix)
        # Some AI models might use 'monthly_income', some 'AverageMonthlyIncome'
        # We standardize it here for our DB handler.
        profile_update = {
            "monthly_income": extracted_data.get("monthly_income") or extracted_data.get("AverageMonthlyIncome", 0),
            "primary_bank": extracted_data.get("bank_name") or extracted_data.get("BankName", "Unknown"),
            "recurring_expenses_total": extracted_data.get("recurring_debits_total") or extracted_data.get("RecurringDebits", 0)
        }
        
        # 4. Update the Unified Data Model (Persistence)
        update_user_fields("demo_user", profile_update)
        
        # 5. Get refreshed Health Score
        metrics = FinancialConsultant.calculate_health_metrics()
        
        return {
            "status": "Success",
            "analysis": "Financial Graph Updated.",
            "metrics_at_a_glance": metrics,
            "ai_verification": "I've locked in your income and bank details for future nudges."
        }
    except Exception as e:
        return {"status": "error", "message": f"Parsing failed: {str(e)}"}

@app.get("/health-check")
async def health_check():
    metrics = FinancialConsultant.calculate_health_metrics()
    advice = FinancialConsultant.get_expert_advice(metrics)
    return {
        "metrics": metrics,
        "expert_advice": advice
    }
@app.get("/get-daily-nudge")
async def get_daily_nudge():
    # This combines the Gap Analysis with a friendly greeting
    question = generate_contextual_question()
    return {
        "type": "discovery_question",
        "message": question,
        "action_required": True
    }
class AnswerRequest(BaseModel):
    field: str  # e.g., "age" or "city_type"
    value: str

@app.post("/submit-answer")
async def submit_answer(answer: AnswerRequest):
    # Update the profile with the user's answer
    update_user_fields("demo_user", {answer.field: answer.value})
    
    # Immediately check if there is a NEW question now
    next_q = generate_contextual_question()
    
    return {
        "status": "Profile Updated",
        "message": f"Got it! I've updated your {answer.field}.",
        "next_question": next_q
    }

@app.get("/chat-history")
async def chat_history():
    history = get_chat_history("demo_user")
    return {"history": history}

@app.get("/me")
async def get_me():
    user = get_user("demo_user")
    return user

class ChatRequest(BaseModel):
    text: str

@app.post("/chat")
async def chat(req: ChatRequest):
    # Save user message
    add_chat_message("demo_user", "user", req.text)

    text = req.text.lower()
    cards = []
    response_text = "I'm your AI Money Mentor. What's on your mind?"
    
    if "save" in text or "invest" in text or "goal" in text:
        metrics = FinancialConsultant.calculate_health_metrics()
        advice = FinancialConsultant.get_expert_advice(metrics)
        response_text = "Here is a quick look at your financial health:"
        cards.append({
            "type": "problem" if metrics["status"] == "Attention Needed" else "plan",
            "title": "Health Check",
            "content": f"**Savings Rate:** {metrics['savings_rate']}%\n**Emergency Fund:** {metrics['emergency_fund_progress']}%\n\n{advice}"
        })
    elif "rs" in text or "debited" in text or "credited" in text or "a/c" in text:
        # Route to SMS parser
        try:
            safe_sms = mask_sensitive_info(req.text)
            raw_data = parse_indian_sms(safe_sms)
            data = json.loads(raw_data) if isinstance(raw_data, str) else raw_data
            nudge = generate_smart_nudge(data)
            
            response_text = nudge
            
            amount = data.get("amount") or data.get("Amount")
            merchant = data.get("merchant_name") or data.get("MerchantName", "Unknown")
            txn_type = str(data.get("transaction_type") or data.get("TransactionType", "Unknown")).lower()
            
            if txn_type == "debit":
                cards.append({
                    "type": "action",
                    "title": "Expense Tracking",
                    "content": f"Recorded an expense of ₹{amount} at {merchant}."
                })
        except Exception as e:
            response_text = "I couldn't parse that transaction properly."
    else:
        # Default response
        response_text = generate_contextual_question()
    
    # Save AI response
    add_chat_message("demo_user", "ai", response_text, cards)
    
    return {
        "text": response_text,
        "cards": cards
    }
if __name__ == "__main__":
    import uvicorn
    # Using string import for reload to work
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)