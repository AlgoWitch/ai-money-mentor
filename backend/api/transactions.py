@app.post("/initiate-micro-save")
async def initiate_save(amount: float, goal_name: str):
    # In a real app, this triggers a UPI Intent / Mandate
    # For the National Pitch, we simulate the 'India Stack' API call
    transaction_id = f"TXN-{int(datetime.datetime.now().timestamp())}"
    
    # Update local DB
    from backend.database.mongo import get_user, update_user_fields
    user = get_user("demo_user") or {}
    current_saved = user.get("savings", 0)
    update_user_fields("demo_user", {"savings": current_saved + amount})
    
    return {
        "status": "Mandate_Triggered",
        "upi_link": f"upi://pay?pa=niveshak@bank&am={amount}&tn=Saving+for+{goal_name}",
        "message": f"Great! ₹{amount} is moving to your {goal_name} fund."
    }