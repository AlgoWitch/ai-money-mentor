from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
import json
from typing import Any

# Internal Imports
from backend.utils.auth import verify_password, get_password_hash, create_access_token, decode_access_token
from backend.utils.db_handler import save_user_profile, get_user_profile, update_goal, update_user_fields, db
from backend.ai_engine.parser import parse_indian_sms
from backend.ai_engine.nudge_logic import generate_smart_nudge
from backend.ai_engine.groq_parser import extract_6_dimensions, generate_fire_roadmap
from backend.ai_engine.analyzer import FinancialConsultant
from backend.ai_engine.discovery import generate_contextual_question
from backend.api.market_data import get_nifty50_sentiment
from backend.utils.privacy import mask_sensitive_info
from datetime import datetime

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Advanced Niveshak AI - Luxury Wealth Tech")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# --- Dependency ---
async def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    user = await get_user_profile(user_id)
    return user["user_id"]

# --- Auth Routes ---
class SignupRequest(BaseModel):
    email: str
    password: str
    name: str

@app.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup(req: SignupRequest):
    existing = await db.users.find_one({"email": req.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(req.password)
    user_id = req.email
    
    await save_user_profile(user_id, {
        "email": req.email, 
        "password": hashed_password, 
        "profile": {"name": req.name},
        "chat_history": []
    })
    
    token = create_access_token(data={"sub": user_id})
    return {"access_token": token, "token_type": "bearer", "user": {"name": req.name, "email": req.email}}

@app.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await db.users.find_one({"email": form_data.username})
    if not user or not verify_password(form_data.password, user.get("password", "")):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    token = create_access_token(data={"sub": user["user_id"]})
    name = user.get("profile", {}).get("name", "User")
    return {"access_token": token, "token_type": "bearer", "user": {"name": name, "email": user["user_id"]}}

@app.get("/me")
async def get_me(user_id: str = Depends(get_current_user)):
    user = await get_user_profile(user_id)
    if "password" in user:
        del user["password"]
    if "_id" in user:
        del user["_id"]
    return user

# --- Application Routes ---
class GoalRequest(BaseModel):
    name: str
    target: float

@app.post("/set-goal")
async def set_goal(goal: GoalRequest, user_id: str = Depends(get_current_user)):
    await update_goal(user_id, goal.name, goal.target)
    return {"message": f"Goal '{goal.name}' set for ₹{goal.target}!"}

class SmsRequest(BaseModel):
    sms_content: str

@app.post("/process-sms")
async def process_sms(req: SmsRequest, user_id: str = Depends(get_current_user)):
    try:
        safe_sms = mask_sensitive_info(req.sms_content)
        raw_data = parse_indian_sms(safe_sms)
        data = json.loads(raw_data) if isinstance(raw_data, str) else raw_data
        nudge = generate_smart_nudge(data)
        return {"status": "success", "extracted_data": data, "nudge": nudge}
    except Exception as e:
        return {"status": "error", "message": str(e)}

class ProfileRequest(BaseModel):
    doc_text: str

@app.post("/analyze-profile")
async def analyze_profile(req: ProfileRequest, user_id: str = Depends(get_current_user)):
    try:
        # Use Groq LLM logic here to extract financial proof points
        dimensions = extract_6_dimensions(req.doc_text)
        await update_user_fields(user_id, {"six_dimensions": dimensions})
        
        return {
            "status": "Success",
            "analysis": "Financial Proof verified.",
            "dimensions": dimensions,
            "ai_verification": "I've locked in your wealth profile points."
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/health-check")
async def health_check(user_id: str = Depends(get_current_user)):
    user = await get_user_profile(user_id)
    profile = user.get("profile", {})
    dimensions = profile.get("six_dimensions", {})
    
    score = 50
    good_status = ["Strong", "On Track", "High", "Achievable"]
    for _, dim in dimensions.items():
        if isinstance(dim, dict) and dim.get("status") in good_status:
           score += 10
        elif isinstance(dim, dict) and dim.get("status") == "Unknown":
           score += 2
        else:
           score -= 5
    score = min(max(score, 0), 100)
    
    savings = profile.get("current_savings", 0)
    expenses = profile.get("monthly_expenses", 0)
    runway = round(savings / expenses, 1) if expenses > 0 else 0
    runway_str = f"{runway} Months"
           
    advice = "Your profile is evolving. Upload more documents to increase accuracy."
    if score >= 80:
        advice = "Excellent health. Start aggressively deploying capital to equity markets."
    elif score >= 60:
        advice = "Decent health, optimize your tax structure."
    else:
        advice = "Warning: Rebuild your emergency fund before aggressive investments."
        
    metrics = {
       "score": score,
       "runway": runway_str,
       "status": "On Track" if score > 70 else "Attention Needed"
    }
    
    return {"metrics": metrics, "expert_advice": f"Bhai, {advice.lower()}", "dimensions": dimensions}

class AnswerRequest(BaseModel):
    field: str
    value: Any

@app.post("/submit-answer")
async def submit_answer(answer: AnswerRequest, user_id: str = Depends(get_current_user)):
    if answer.field == "trigger_fire_plan":
        user = await get_user_profile(user_id)
        p = user.get("profile", {})
        roadmap = generate_fire_roadmap(
            p.get("age", 30),
            p.get("monthly_income", 100000),
            p.get("monthly_expenses", 50000),
            p.get("current_savings", 200000),
            float(p.get("fire_goal", 50000000))
        )
        return {"status": "Roadmap Generated", "roadmap": roadmap}
        
    await update_user_fields(user_id, {answer.field: answer.value})
    next_q = generate_contextual_question()
    return {"status": "Profile Updated", "message": f"Got it!", "next_question": next_q}

@app.get("/market-sentiment")
async def market_sentiment(user_id: str = Depends(get_current_user)):
    return get_nifty50_sentiment()

@app.get("/chat-history")
async def chat_history(user_id: str = Depends(get_current_user)):
    user = await get_user_profile(user_id)
    return {"history": user.get("chat_history", [])}

class ChatRequest(BaseModel):
    text: str

async def _add_chat_message(user_id: str, role: str, message: str, cards: list = None):
    user = await get_user_profile(user_id)
    history = user.get("chat_history", [])
    history.append({
        "role": role,
        "message": message,
        "cards": cards or [],
        "timestamp": datetime.utcnow().isoformat()
    })
    await update_user_fields(user_id, {"chat_history": history})

@app.post("/chat")
async def chat(req: ChatRequest, user_id: str = Depends(get_current_user)):
    # Save user message
    await _add_chat_message(user_id, "user", req.text)

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
        response_text = generate_contextual_question()
    
    # Save AI response
    await _add_chat_message(user_id, "ai", response_text, cards)
    
    return {
        "text": response_text,
        "cards": cards
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)