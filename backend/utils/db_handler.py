import os
import certifi
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

# The URI can be picked up from .env automatically
MONGO_URI = os.environ.get("MONGO_URI", "mongodb+srv://shreya212suman_db_user:bfk3VPTn7YCoSqRz@cluster0.og1pkbs.mongodb.net/")

# FIX: Added tlsCAFile=certifi.where() to prevent silent hanging on macOS/TLS handshakes
# FIX: Motor client handles the event loop correctly when initialized this way
client = AsyncIOMotorClient(MONGO_URI, tlsCAFile=certifi.where())
db = client.get_database("niveshak_db")

async def save_user_profile(user_id: str, data: dict):
    # This acts as an upsert/merge to continuously evolve the profile
    current = await db.users.find_one({"user_id": user_id})
    if not current:
        current = {"user_id": user_id, "profile": {}, "goals": {}, "savings_history": []}
    
    # Merge nested dictionaries properly
    for key, val in data.items():
        if isinstance(val, dict) and key in current and isinstance(current[key], dict):
            current[key].update(val)
        else:
            current[key] = val
            
    await db.users.replace_one({"user_id": user_id}, current, upsert=True)
    return current

async def get_user_profile(user_id: str):
    user_doc = await db.users.find_one({"user_id": user_id})
    if not user_doc:
        user_doc = {"user_id": user_id, "profile": {}, "goals": {}, "savings_history": []}
    return user_doc

async def update_goal(user_id: str, goal_name: str, target_amount: float, saved_so_far: float = 0):
    user = await get_user_profile(user_id)
    if "goals" not in user:
        user["goals"] = {}
    user["goals"][goal_name.lower()] = {
        "target": target_amount,
        "saved": saved_so_far
    }
    await save_user_profile(user_id, {"goals": user["goals"]})

async def update_user_fields(user_id: str, fields: dict):
    # Directly update fields inside profile
    user = await get_user_profile(user_id)
    if "profile" not in user:
        user["profile"] = {}
    for k, v in fields.items():
        user["profile"][k] = v
    await save_user_profile(user_id, {"profile": user["profile"]})
    return user