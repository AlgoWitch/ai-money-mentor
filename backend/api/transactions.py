@app.post("/initiate-micro-save")
async def initiate_save(amount: float, goal_name: str):
    # In a real app, this triggers a UPI Intent / Mandate
    # For the National Pitch, we simulate the 'India Stack' API call
    transaction_id = f"TXN-{int(datetime.datetime.now().timestamp())}"
    
    # Update local DB
    from backend.utils.db_handler import get_data, update_goal
    data = get_data()
    current_saved = data["goals"].get(goal_name, {}).get("saved", 0)
    update_goal(goal_name, data["goals"][goal_name]["target"], current_saved + amount)
    
    return {
        "status": "Mandate_Triggered",
        "upi_link": f"upi://pay?pa=niveshak@bank&am={amount}&tn=Saving+for+{goal_name}",
        "message": f"Great! ₹{amount} is moving to your {goal_name} fund."
    }