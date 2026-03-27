from fastapi import FastAPI
from pydantic import BaseModel
import json

# Internal Imports
from backend.ai_engine.parser import parse_indian_sms
from backend.ai_engine.nudge_logic import generate_smart_nudge
from backend.ai_engine.document_parser import extract_financial_profile
from backend.ai_engine.analyzer import FinancialConsultant
from backend.utils.db_handler import update_goal, ensure_db_exists, update_user_profile
from backend.utils.privacy import mask_sensitive_info
from backend.ai_engine.discovery import generate_contextual_question

app = FastAPI(title="Niveshak AI - National Level Agent")

# Initialize DB on startup
ensure_db_exists()

class GoalRequest(BaseModel):
    name: str
    target: float

@app.get("/")
def home():
    return {"status": "Money AI is Live 🚀", "version": "Phase 4.1-Final"}

@app.post("/set-goal")
async def set_goal(goal: GoalRequest):
    update_goal(goal.name, goal.target)
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
        update_user_profile(profile_update)
        
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
    from backend.utils.db_handler import update_user_profile
    
    # Update the profile with the user's answer
    update_user_profile({answer.field: answer.value})
    
    # Immediately check if there is a NEW question now
    from backend.ai_engine.discovery import generate_contextual_question
    next_q = generate_contextual_question()
    
    return {
        "status": "Profile Updated",
        "message": f"Got it! I've updated your {answer.field}.",
        "next_question": next_q
    }
if __name__ == "__main__":
    import uvicorn
    # Using string import for reload to work
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)