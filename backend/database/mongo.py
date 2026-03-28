import os
from datetime import datetime, timezone
from pymongo import MongoClient, ReturnDocument
from typing import Dict, Any, Optional

MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017")
client = MongoClient(MONGO_URI)
db = client["ai_money_mentor"]
users_collection = db["users"]

def _clean_user_document(user_doc: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """Helper: Removes the MongoDB '_id' field before returning data to FastAPI."""
    if user_doc and "_id" in user_doc:
        del user_doc["_id"]
    return user_doc

def create_or_update_user(user_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Creates a new user or updates an existing one using MongoDB upsert.
    Ensures timestamps are properly managed dynamically.
    """
    user_id = user_data.get("user_id", "demo_user")
    
    set_data = {
        "user_id": user_id,
        "updated_at": datetime.now(timezone.utc)
    }
    
    # Append strictly defined or optional fields mapped dynamically
    for field in ["income", "savings", "debt", "goal", "expenses"]:
        if field in user_data:
            set_data[field] = user_data[field]

    update_query = {
        "$set": set_data,
        "$setOnInsert": {
            "created_at": datetime.now(timezone.utc),
            "chat_history": []
        }
    }
    
    updated_user = users_collection.find_one_and_update(
        {"user_id": user_id},
        update_query,
        upsert=True,
        return_document=ReturnDocument.AFTER
    )
    
    return _clean_user_document(updated_user)

def get_user(user_id: str = "demo_user") -> Optional[Dict[str, Any]]:
    """Retrieves the user document and cleans the MongoDB _id."""
    user = users_collection.find_one({"user_id": user_id})
    return _clean_user_document(user)

def get_chat_history(user_id: str = "demo_user") -> list:
    """Retrieves the chat history array for a user."""
    user = users_collection.find_one({"user_id": user_id}, {"chat_history": 1})
    if user and "chat_history" in user:
        return user["chat_history"]
    return []

def add_chat_message(user_id: str, role: str, message: str, cards: list = None) -> bool:
    """Robustly pushes a new AI/User message into the chat_history array."""
    chat_entry = {
        "role": role,
        "message": message,
        "cards": cards or [],
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    
    result = users_collection.update_one(
        {"user_id": user_id},
        {
            "$push": {"chat_history": chat_entry},
            "$set": {"updated_at": datetime.now(timezone.utc)}
        }
    )
    
    return result.modified_count > 0

def update_user_fields(user_id: str, new_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Updates specific fields dynamically without overwriting unmodified fields."""
    if not new_data:
        return get_user(user_id)
        
    update_query = {
        "$set": {
            **new_data,
            "updated_at": datetime.now(timezone.utc)
        }
    }
    
    updated_user = users_collection.find_one_and_update(
        {"user_id": user_id},
        update_query,
        return_document=ReturnDocument.AFTER
    )
    
    return _clean_user_document(updated_user)
