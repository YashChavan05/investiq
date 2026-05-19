"""
Learning Tool: Analyzes historical system performance and provides 
adaptive insights based on previous 'learned' market patterns.
"""

import json
import random
from agents.tools.memory_tool import get_historical_insights

async def learning_tool(tickers_str: str) -> dict:
    """
    Retrieves learned insights for specific assets based on historical 
    optimization performance stored in MongoDB.
    """
    tickers = [t.strip().upper() for t in tickers_str.split(",")]
    
    # Try to fetch real historical data from MongoDB
    historical_data = await get_historical_insights(tickers)
    
    results = {}
    
    for t in tickers:
        # Check if we have real history for this ticker
        ticker_history = [h for h in historical_data if t in h.get("tickers", [])]
        
        if ticker_history:
            # Calculate actual bias based on real past performance
            # In this version, we bias toward success rates recorded in DB
            success_count = sum(1 for h in ticker_history if h.get("results", {}).get("roi_improvement_pct", 0) > 0)
            avg_success = success_count / len(ticker_history)
            
            results[t] = {
                "ticker": t,
                "learned_success_rate": round(avg_success, 4),
                "adaptation_factor": round((avg_success - 0.5) * 0.1, 4), # Adjust return forecast based on past hits
                "memory_source": "MongoDB Historical Record",
                "total_past_analyses": len(ticker_history)
            }
        else:
            # Fallback to simulation if no history yet
            seed = sum(ord(c) for c in t) + 123
            random.seed(seed)
            results[t] = {
                "ticker": t,
                "learned_success_rate": 0.5,
                "adaptation_factor": 0.0,
                "memory_source": "Initial Simulation (No History)",
                "total_past_analyses": 0
            }
        
    return {
        "ticker_insights": results,
        "global_learning_status": "Active (MongoDB-Linked)",
        "db_connected": True
    }
