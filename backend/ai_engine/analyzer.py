# analyzer.py — pure financial metric calculator, no DB dependency
# Accepts user dict as a parameter instead of fetching from DB directly.

class FinancialConsultant:
    @staticmethod
    def calculate_health_metrics(user: dict = None):
        if user is None:
            user = {}
        income = user.get("income") or user.get("monthly_income") or 0
        total_saved = user.get("savings") or user.get("current_savings") or 0

        savings_rate = (total_saved / income * 100) if income > 0 else 0
        ef_status = total_saved / (income * 0.7) if income > 0 else 0

        return {
            "savings_rate": round(savings_rate, 2),
            "emergency_fund_progress": round(ef_status * 100, 2),
            "status": "Healthy" if savings_rate > 20 else "Attention Needed"
        }

    @staticmethod
    def calculate_fragility_score(user: dict = None):
        if user is None:
            user = {}
        income = user.get("income") or user.get("monthly_income") or 0
        expenses = user.get("expenses") or user.get("monthly_expenses") or 0
        savings = user.get("savings") or user.get("current_savings") or 0

        if expenses == 0:
            return {"months_of_runway": 0, "safety_rating": "Unknown"}

        runway = savings / expenses
        return {
            "months_of_runway": round(runway, 1),
            "safety_rating": "Secure" if runway >= 6 else "Vulnerable"
        }

    @staticmethod
    def get_expert_advice(metrics: dict = None):
        if not metrics:
            return "Upload your bank statement so I can give you personalized advice!"
        if metrics.get("savings_rate", 0) < 10:
            return "Bhai, your savings rate is low. We need to cut 'Wants' and focus on 'Needs'."
        elif metrics.get("emergency_fund_progress", 0) < 100:
            return "Focus on building your Emergency Fund first. It's the 'Suraksha Kawach' of your family."
        return "You are doing great! Should we look into 'Index Funds' for your long-term goals?"