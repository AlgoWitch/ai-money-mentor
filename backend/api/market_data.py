import yfinance as yf

def get_nifty50_sentiment():
    """
    Fetches the Nifty 50 (^NSEI) data using yfinance.
    Calculates a basic market sentiment based on day's change.
    """
    try:
        nifty = yf.Ticker("^NSEI")
        # Fetch data for the last 2 days to compare
        hist = nifty.history(period="2d")
        
        if len(hist) < 2:
            return {"status": "Market Closed", "change": 0, "current": 0}
            
        prev_close = hist['Close'].iloc[-2]
        current = hist['Close'].iloc[-1]
        
        change = current - prev_close
        change_pct = (change / prev_close) * 100
        
        sentiment = "Bullish" if change > 0 else "Bearish"
        if abs(change_pct) < 0.2:
            sentiment = "Neutral"
            
        return {
            "ticker": "NIFTY 50",
            "current": round(current, 2),
            "change_points": round(change, 2),
            "change_pct": round(change_pct, 2),
            "sentiment": sentiment
        }
    except Exception as e:
        print(f"yfinance error: {e}")
        return {
            "ticker": "NIFTY 50",
            "current": "Unavailable",
            "change_points": 0,
            "change_pct": 0,
            "sentiment": "Unknown"
        }
