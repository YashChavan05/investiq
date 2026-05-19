"""
Risk Tool: Fetches historical stock data via yfinance,
computes volatility, risk_score (0-1), and Value at Risk (VaR).
"""

import yfinance as yf
import numpy as np
import pandas as pd
from langchain.tools import tool
from typing import Any


@tool("risk_tool")
def risk_tool(tickers_str: str) -> dict:
    """
    Fetches historical price data for one or more stock tickers and computes:
    - annualized_volatility
    - risk_score (0 to 1, normalized)
    - value_at_risk_95 (daily VaR at 95% confidence)

    Input: A comma-separated list of tickers (e.g. "AAPL, MSFT, TSLA")
    Output: JSON-serializable dict mapping ticker to its risk metrics
    """
    results = {}
    try:
        spy_hist = yf.Ticker("SPY").history(period="1y")["Close"].pct_change().dropna()
    except Exception:
        spy_hist = None

    for ticker in tickers_str.split(','):
        ticker = ticker.strip().upper()
        if not ticker: continue
        try:
            stock = yf.Ticker(ticker)
            hist = stock.history(period="1y")

            if hist.empty or len(hist) < 20:
                results[ticker] = {
                    "error": "Insufficient historical data",
                    "risk_score": 0.5,
                    "annualized_volatility": 0.0,
                    "value_at_risk_95": 0.0,
                }
                continue

            close = hist["Close"]
            daily_returns = close.pct_change().dropna()

            ann_vol = float(daily_returns.std() * np.sqrt(252))
            risk_score = float(min(ann_vol / 1.0, 1.0))
            var_95 = float(np.percentile(daily_returns, 5))

            # Risk Level categorization
            if risk_score < 0.35:
                risk_level = "Low"
            elif risk_score < 0.65:
                risk_level = "Medium"
            else:
                risk_level = "High"

            rolling_max = close.cummax()
            drawdown = (close - rolling_max) / rolling_max
            max_drawdown = float(drawdown.min())

            beta = 1.0
            if spy_hist is not None:
                try:
                    aligned = pd.concat([daily_returns, spy_hist], axis=1, join="inner")
                    aligned.columns = ["stock", "spy"]
                    cov = np.cov(aligned["stock"], aligned["spy"])
                    if cov[1][1] != 0:
                        beta = float(cov[0][1] / cov[1][1])
                except Exception:
                    pass

            # Max Drawdown Calculation
            roll_max = close.cummax()
            drawdown = (close - roll_max) / roll_max
            max_drawdown = float(drawdown.min())

            # Suggestions and Factors
            factors = []
            if ann_vol > 0.3: factors.append("High volatility")
            if var_95 < -0.05: factors.append("Significant potential loss")
            if len(hist) < 252: factors.append("Limited historical data")
            
            suggestion = "Consider diversification" if risk_score > 0.6 else "Maintaining position is safe"
            if risk_score > 0.8: suggestion = "Reduce exposure immediately"

            results[ticker] = {
                "risk_score": round(risk_score, 4),
                "risk_level": risk_level,
                "volatility": round(ann_vol, 4),
                "value_at_risk": round(var_95, 4),
                "max_drawdown": round(max_drawdown, 4),
                "confidence": round(min(0.95, 0.5 + (len(hist)/1000)), 2),
                "risk_factors": factors if factors else ["Stable market conditions"],
                "suggestion": suggestion
            }

        except Exception as e:
            results[ticker] = {
                "error": str(e),
                "risk_score": 0.5,
                "annualized_volatility": 0.0,
                "value_at_risk_95": 0.0,
            }

    return results
