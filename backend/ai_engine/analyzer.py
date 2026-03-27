from backend.utils.db_handler import get_data

class FinancialConsultant:
    @staticmethod
    def calculate_health_metrics():
        data = get_data()
        profile = data.get("profile", {})
        income = profile.get("monthly_income", 0)
        
        # Calculate total saved from history
        total_saved = sum(item['amount'] for item in data.get("savings_history", []))
        
        # Expert Metric 1: Savings Rate
        savings_rate = (total_saved / income * 100) if income > 0 else 0
        
        # Expert Metric 2: Emergency Fund (Target is 6 months of income)
        ef_status = total_saved / (income * 0.7) if income > 0 else 0 
        
        return {
            "savings_rate": round(savings_rate, 2),
            "emergency_fund_progress": round(ef_status * 100, 2),
            "status": "Healthy" if savings_rate > 20 else "Attention Needed"
        }
    
    @staticmethod
    def calculate_fragility_score():
        data = get_data()
        income = data.get("profile", {}).get("monthly_income", 0)
        expenses = data.get("profile", {}).get("recurring_expenses_total", 0)
        savings = sum(item['amount'] for item in data.get("savings_history", []))
        
        if expenses == 0: return 0
        
        # How many months can you survive?
        runway = savings / expenses
        
        # Scoring: < 1 month = Critical, 1-3 = Warning, 6+ = Secure
        return {
            "months_of_runway": round(runway, 1),
            "safety_rating": "Secure" if runway >= 6 else "Vulnerable"
        }

    @staticmethod
    def get_expert_advice(metrics):
        """Generates high-level strategic advice based on hard numbers."""
        if metrics['savings_rate'] < 10:
            return "Bhai, your savings rate is low. We need to cut 'Wants' and focus on 'Needs'."
        elif metrics['emergency_fund_progress'] < 100:
            return "Focus on building your Emergency Fund first. It's the 'Suraksha Kawach' of your family."
        return "You are doing great! Should we look into 'Index Funds' for your long-term goals?"