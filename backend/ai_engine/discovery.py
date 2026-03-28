from backend.database.mongo import get_user

def identify_profile_gaps():
    user = get_user("demo_user") or {}
    
    gaps = []
    
    # Critical Gaps
    if not (user.get("income") or user.get("monthly_income")): gaps.append("income")
    if not user.get("age"): gaps.append("age")
    if not user.get("city_type"): gaps.append("location") # Tier 1/2/3 affects inflation
    if not user.get("has_insurance"): gaps.append("insurance")
    if not user.get("goal"): gaps.append("primary_goal")
    
    return gaps

def generate_contextual_question():
    gaps = identify_profile_gaps()
    if not gaps:
        return "Your financial shield is strong! Ready for some advanced investment gyaan?"

    # Pick the most important gap
    priority_gap = gaps[0]
    
    # Map gaps to "Human-like" Hinglish prompts
    prompts = {
        "age": "Bhai, to calculate your retirement 'corpus', I need to know your age. How young are you?",
        "location": "Which city do you live in? It helps me adjust for the cost of living (Mehangai).",
        "insurance": "Life is unpredictable. Do you have Health or Term Insurance, or are you currently 'Aatmanirbhar'?",
        "income": "I noticed I don't have your income details yet. Mind sharing your monthly take-home?"
    }
    
    return prompts.get(priority_gap, "Tell me more about your financial dreams!")