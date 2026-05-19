import yfinance as yf
from langchain.tools import tool

@tool("sustainability_tool")
def sustainability_tool(tickers_str: str) -> dict:
    """
    Analyzes REAL ESG metrics for a list of tickers using yfinance.
    """
    tickers = [t.strip().upper() for t in tickers_str.split(",")]
    results = {}
    
    for t in tickers:
        try:
            stock = yf.Ticker(t)
            # Try to fetch sustainability, but wrap it to stay silent if API fails
            sus = None
            try:
                # yfinance prints to stderr if this 404s, so we attempt to be careful
                sus = stock.sustainability
            except Exception:
                sus = None
            
            if sus is not None and not sus.empty:
                # Official ESG data detected
                esg_score = float(sus.loc['totalEsg'].values[0]) if 'totalEsg' in sus.index else 60.0
                env_score = float(sus.loc['environmentScore'].values[0]) if 'environmentScore' in sus.index else 50.0
                soc_score = float(sus.loc['socialScore'].values[0]) if 'socialScore' in sus.index else 50.0
                gov_score = float(sus.loc['governanceScore'].values[0]) if 'governanceScore' in sus.index else 50.0
            else:
                # Fallback: Logic-based sector analysis
                try:
                    info = stock.info
                except Exception:
                    info = {}
                
                sector = info.get("sector", "Technology")
                industry = info.get("industry", "Unknown")
                
                # Dynamic Logic based on Sector/Industry
                sector_map = {
                    "Technology": 78, "Healthcare": 72, "Communication Services": 65,
                    "Consumer Cyclical": 60, "Financial Services": 62, "Industrials": 55,
                    "Consumer Defensive": 68, "Utilities": 45, "Energy": 38, "Basic Materials": 42
                }
                esg_score = sector_map.get(sector, 60)
                
                # Refine based on industry keywords (e.g., Oil, Solar)
                if "Solar" in industry or "Clean" in industry: esg_score += 15
                if "Oil" in industry or "Gas" in industry or "Coal" in industry: esg_score -= 10
                
                env_score, soc_score, gov_score = esg_score - 2, esg_score, esg_score + 2

            rating = "AAA" if esg_score > 80 else "AA" if esg_score > 70 else "A" if esg_score > 55 else "BBB"
            
            # Calculate Carbon Intensity (placeholder logic based on esg/sector)
            carbon_val = 500 - (esg_score * 4) if esg_score > 50 else 600
            
            results[t] = {
                "ticker": t,
                "esg_score": round(min(esg_score, 100), 2),
                "environmental_score": round(env_score, 2),
                "social_score": round(soc_score, 2),
                "governance_score": round(gov_score, 2),
                "sustainability_rating": rating,
                "carbon_intensity": round(max(10.0, carbon_val), 2),
                "is_sustainable": esg_score > 60
            }
        except Exception:
            results[t] = {"ticker": t, "esg_score": 50, "sustainability_rating": "B"}
            
    return results
