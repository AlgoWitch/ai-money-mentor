import json
import os

# Ensure the path is relative to the project root
DB_FILE = "data/user_data.json"

def ensure_db_exists():
    """Creates the data folder and json file if they don't exist."""
    os.makedirs(os.path.dirname(DB_FILE), exist_ok=True)
    if not os.path.exists(DB_FILE):
        with open(DB_FILE, "w") as f:
            json.dump({"goals": {}, "savings_history": []}, f)
        print(f"Created new database at {DB_FILE}")

def get_data():
    ensure_db_exists() # Always check before reading
    try:
        with open(DB_FILE, "r") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {"goals": {}, "savings_history": []}

def update_goal(goal_name, target_amount, saved_so_far=0):
    ensure_db_exists()
    data = get_data()
    # Use lowercase keys for consistency
    data["goals"][goal_name.lower()] = {
        "target": float(target_amount), 
        "saved": float(saved_so_far)
    }
    with open(DB_FILE, "w") as f:
        json.dump(data, f, indent=4)
    return data
def update_user_profile(profile_updates):
    """
    Updates the 'profile' and 'financial_health' sections of the DB.
    profile_updates: dict containing fields like 'monthly_income', 'bank_name', etc.
    """
    data = get_data()
    
    # Update profile fields
    if "profile" not in data:
        data["profile"] = {}
        
    for key, value in profile_updates.items():
        data["profile"][key] = value
        
    # Set a timestamp for 'Last Audited'
    import datetime
    data["profile"]["last_audited"] = datetime.datetime.now().strftime("%Y-%m-%d")
    
    with open(DB_FILE, "w") as f:
        json.dump(data, f, indent=4)
    return data