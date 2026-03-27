import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(base_url="https://api.groq.com/openai/v1", api_key=os.environ.get("GROQ_API_KEY"))

def extract_financial_profile(document_text):
    """
    Expert Prompting: Zero-shot extraction with strict schema.
    """
    system_instruction = """
    You are a Financial Data Scientist. Extract key metrics from this bank statement/document.
    Identify:
    {"monthly_income": number,
    "recurring_debits": number (sum of all EMIs/Rent),
    "bank_name": "string"}
    
    Return ONLY JSON.
    """
    
    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": f"Analyze this text: {document_text}"}
            ],
            response_format={"type": "json_object"}
        )
        return response.choices[0].message.content
    except Exception as e:
        return {"error": str(e)}