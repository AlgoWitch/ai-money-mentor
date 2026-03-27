from backend.utils.db_handler import get_data

def generate_smart_nudge(transaction_data):
    user_data = get_data()
    income = user_data.get("profile", {}).get("monthly_income", 0)
    
    # National Level Feature: Proactive Warning
    if income > 0 and transaction_data.get("amount", 0) > (income * 0.1):
        return "Bhai, this is a big expense (more than 10% of your salary)! Are you sure this fits your budget?"
    goals = user_data.get("goals", {})
    
    # 1. Get the first goal from the DB or default to "Savings"
    # We use .lower() here to match how update_goal saves them
    goal_list = list(goals.keys())
    goal_name = goal_list[0] if goal_list else "Savings"
    goal_stats = goals.get(goal_name, {"target": 10000, "saved": 0})
    
    # 2. Extract transaction details (ensuring we handle AI's lowercase/uppercase)
    amt = transaction_data.get("amount", 0)
    cat = transaction_data.get("category", "General")
    # Force the transaction type to Capitalized for the 'if' check
    trans_type = str(transaction_data.get("transaction_type", "")).capitalize()
    
    # 3. Decision Logic: What should the AI say?
    if trans_type == "Debit":
        # Calculate a small "Round-up" amount to suggest for saving
        round_up = 10 if amt < 500 else 50
        
        # Personalized Hinglish Nudges
        if cat.lower() == "food":
            return f"Bhai, ₹{amt} on Food? 🍕 Swiggy thoda kam, {goal_name} thoda zyada! Agar ₹{round_up} save karoge, toh goal 5 din pehle poora hoga."
        
        if cat.lower() == "transfer":
            return f"Sent ₹{amt} to someone? Chalo, ₹{round_up} round-up karke '{goal_name}' fund mein daalein? Progress matters! 🚀"

        return f"Noticed a spend of ₹{amt}. Should we add ₹{round_up} to your {goal_name} fund? Abhi tak ₹{goal_stats['saved']} bacha liye hain!"
    
    # 4. If it's a Credit (Salary/Refund)
    if trans_type == "Credit":
        return f"Arre waah! ₹{amt} received. 💰 Party se pehle thoda '{goal_name}' ke liye side rakh lein?"

    return "Great job managing your cashflow!"