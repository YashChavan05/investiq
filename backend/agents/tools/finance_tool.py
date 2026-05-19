"""
Finance Tool: Provides fundamental financial analysis including P/E ratios, 
EPS growth, and overall financial health scores.
"""

import json
import yfinance as yf
from langchain.tools import tool

@tool("finance_tool")
def finance_tool(tickers_str: str) -> dict:
    """
    Performs fundamental financial analysis for a list of tickers.
    
    Input: Comma-separated tickers (e.g., 'AAPL, MSFT')
    Output: P/E ratio, Market Cap, Debt-to-Equity, and financial health score.
    """
    tickers = [t.strip().upper() for t in tickers_str.split(",")]
    results = {}
    
    for t in tickers:
        try:
            stock = yf.Ticker(t)
            info = stock.info
            
            pe_ratio = info.get("trailingPE")
            pb_ratio = info.get("priceToBook")
            debt_to_equity = info.get("debtToEquity")
            profit_margin = info.get("profitMargins")
            
            # Calculate a proprietary 'Financial Health Score' (0 to 100)
            health_score = 50 # Default
            if profit_margin: health_score += (profit_margin * 100)
            if debt_to_equity: health_score -= min(debt_to_equity / 5, 20)
            
            results[t] = {
                "ticker": t,
                "pe_ratio": round(pe_ratio, 2) if pe_ratio else "N/A",
                "pb_ratio": round(pb_ratio, 2) if pb_ratio else "N/A",
                "debt_to_equity": round(debt_to_equity, 2) if debt_to_equity else "N/A",
                "profit_margin": round(profit_margin * 100, 2) if profit_margin else "N/A",
                "financial_health_score": min(round(health_score, 2), 100),
                "market_cap": info.get("marketCap", "N/A"),
                "dividend_yield": round(info.get("dividendYield", 0) * 100, 2) if info.get("dividendYield") else 0
            }
        except Exception as e:
            results[t] = {"ticker": t, "error": str(e), "financial_health_score": 50}
            
    return results
