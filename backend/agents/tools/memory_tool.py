"""
Memory Tool: Handles long-term persistence of agent decisions 
and outcomes using MongoDB.
"""

import datetime
from typing import List, Dict, Any
from agents.db_config import db_connection

async def save_analysis_to_memory(tickers: List[str], structured_output: Dict[str, Any]):
    """
    Saves a completed portfolio analysis to the 'history' collection.
    """
    if db_connection.db is None:
        print("\033[91m> [Memory Error] MongoDB not connected. Cannot save.\033[0m")
        return
        
    record = {
        "timestamp": datetime.datetime.now(datetime.timezone.utc),
        "tickers": tickers,
        "results": structured_output,
        "type": "portfolio_analysis"
    }
    
    try:
        result = await db_connection.db.history.insert_one(record)
        print(f"\033[94m> [Memory Agent] Success! Saved to {db_connection.db.name}.history with ID: {result.inserted_id}\033[0m")
    except Exception as e:
        print(f"\033[91m> [Memory Error] Failed to save to MongoDB: {e}\033[0m")

async def get_historical_insights(tickers: List[str]) -> List[Dict[str, Any]]:
    """
    Retrieves previous analysis results for a set of tickers to 
    provide historical context to the Learning Agent.
    """
    if db_connection.db is None:
        return []
        
    cursor = db_connection.db.history.find(
        {"tickers": {"$in": tickers}},
        {"_id": 0}
    ).sort("timestamp", -1).limit(5)
    
    return await cursor.to_list(length=5)
