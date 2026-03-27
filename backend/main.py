from fastapi import FastAPI
from backend.ai_engine.parser import parse_indian_sms
from backend.ai_engine.nudge_logic import generate_smart_nudge # Correct function name
from backend.utils.db_handler import update_goal,ensure_db_exists # Import this!
from backend.utils.privacy import mask_sensitive_info
from pydantic import BaseModel
import json

app = FastAPI(title="Money AI Backend")

ensure_db_exists()
@app.get("/")
def home():
    return {"status": "Money AI is Live 🚀"}
class GoalRequest(BaseModel):
    name: str
    target: float

@app.post("/set-goal")
async def set_goal(goal: GoalRequest):
    update_goal(goal.name, goal.target)
    return {"message": f"Goal '{goal.name}' set for ₹{goal.target}!"}

@app.post("/process-sms")
async def process_sms(sms_content: str, lang: str = "hinglish"):
    try:
        print("\n--- NEW REQUEST ---")
        print(f"Original SMS: {sms_content}")

        # 1️⃣ Privacy masking (VERY IMPORTANT for demo)
        safe_sms = mask_sensitive_info(sms_content)
        print(f"Masked SMS: {safe_sms}")

        # 2️⃣ Parsing
        raw_data = parse_indian_sms(safe_sms)
        print(f"Raw Parsed Output: {raw_data}")

        # 3️⃣ Safe JSON handling
        try:
            data = json.loads(raw_data) if isinstance(raw_data, str) else raw_data
        except Exception:
            return {
                "status": "error",
                "message": "Parser returned invalid JSON",
                "raw_output": raw_data
            }

        # 4️⃣ Generate nudge
        nudge = generate_smart_nudge(data)

        return {
            "status": "success",
            "privacy_applied": True,
            "masked_sms": safe_sms,
            "data": data,
            "nudge": nudge
        }

    except Exception as e:
        print(f"CRASH ERROR: {e}")
        return {
            "status": "error",
            "message": str(e)
        }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)