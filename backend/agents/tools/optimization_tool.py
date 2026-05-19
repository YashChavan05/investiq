"""
Finance Optimization Tool: Uses scipy.optimize to maximize expected ROI
subject to risk threshold and budget constraints.
"""

import json
import numpy as np
from scipy.optimize import minimize
from langchain.tools import tool


@tool("optimization_tool")
def optimization_tool(input_json: str) -> dict:
    """
    Maximizes portfolio ROI using scipy.optimize under constraints:
    - Total weight sums to 1.0
    - Each weight >= 0 (long only)
    - Weighted average risk_score <= risk_threshold

    Input (JSON string):
    {
        "stocks": [
            {"ticker": "AAPL", "risk_score": 0.3, "predicted_return": 0.12},
            ...
        ],
        "risk_threshold": 0.4,
        "total_budget": 10000
    }

    Output: optimized weights, expected ROI before/after, improvement %
    """
    try:
        data = json.loads(input_json)
        stocks = data["stocks"]
        risk_threshold = float(data.get("risk_threshold", 0.5))
        total_budget = float(data.get("total_budget", 10000))

        n = len(stocks)
        if n == 0:
            return {"error": "No stocks provided"}

        tickers = [s["ticker"] for s in stocks]
        risk_scores = np.array([float(s.get("risk_score", 0.5)) for s in stocks])
        returns = np.array([float(s.get("predicted_return_30d", s.get("predicted_return", 0.0))) for s in stocks])

        # Baseline: equal weight
        equal_weights = np.ones(n) / n
        baseline_roi = float(np.dot(equal_weights, returns))

        # Objective: maximize return but add a very small penalty for extreme concentration
        # (reduced from 0.1 to 0.01 to allow 'Best Optimized' behavior)
        def neg_portfolio_return(weights):
            return -np.dot(weights, returns) + 0.01 * np.sum(weights**2)

        # Gradient of objective
        def neg_portfolio_return_grad(weights):
            return -returns + 0.02 * weights

        # Constraints
        constraints = [
            # Weights sum to 1
            {"type": "eq", "fun": lambda w: np.sum(w) - 1.0},
            # Weighted risk <= risk_threshold
            {"type": "ineq", "fun": lambda w: risk_threshold - np.dot(w, risk_scores)},
        ]

        # Bounds: allow more flexibility for smaller portfolios
        if n >= 6:
            max_weight = 0.3  # Max 30% per stock for large portfolios
        elif n >= 4:
            max_weight = 0.4  # Max 40%
        elif n >= 2:
            max_weight = 0.8  # Max 80% for 2-3 stocks
        else:
            max_weight = 1.0
            
        bounds = [(0.05, max_weight) for _ in range(n)]

        # Initial guess: equal weights
        x0 = equal_weights.copy()

        result = minimize(
            neg_portfolio_return,
            x0,
            method="SLSQP",
            bounds=bounds,
            constraints=constraints,
            options={"ftol": 1e-9, "maxiter": 1000},
        )

        if result.success or result.status in (0, 1, 2):
            optimal_weights = np.clip(result.x, 0, 1)
            # Renormalize
            if optimal_weights.sum() > 0:
                optimal_weights = optimal_weights / optimal_weights.sum()
        else:
            # Fallback: inverse risk weighting
            inv_risk = 1.0 - risk_scores
            inv_risk = np.clip(inv_risk, 1e-6, None)
            optimal_weights = inv_risk / inv_risk.sum()

        optimized_roi = float(np.dot(optimal_weights, returns))
        optimized_risk = float(np.dot(optimal_weights, risk_scores))

        # ROI improvement %
        if baseline_roi != 0:
            improvement_pct = ((optimized_roi - baseline_roi) / abs(baseline_roi)) * 100
        else:
            improvement_pct = 0.0

        allocations = []
        for i, ticker in enumerate(tickers):
            allocations.append({
                "ticker": ticker,
                "optimal_weight": round(float(optimal_weights[i]), 4),
                "allocated_amount": round(float(optimal_weights[i]) * total_budget, 2),
                "expected_return": round(float(returns[i]), 4),
                "risk_score": round(float(risk_scores[i]), 4),
            })

        allocations.sort(key=lambda x: x["optimal_weight"], reverse=True)

        roi_improvement = round(optimized_roi - baseline_roi, 4)
        
        return {
            "optimization_status": "success" if result.success else "converged_with_fallback",
            "optimized_allocation": {t: round(float(optimal_weights[i]), 4) for i, t in enumerate(tickers)},
            "expected_roi": round(optimized_roi, 4),
            "risk_adjusted_return": round(optimized_roi / (optimized_risk + 0.1), 4),
            "optimization_strategy": "Maximize return under risk constraint (SLSQP)",
            "constraints_used": {
                "budget": total_budget,
                "max_risk": risk_threshold
            },
            "diversification_score": round(1.0 - np.sum(optimal_weights**2), 4),
            "trade_off_analysis": f"Optimized for {risk_threshold} risk threshold. Portfolio risk is {round(optimized_risk, 4)}.",
            "improvement_over_baseline": roi_improvement,
            "recommendation": "Maintain optimized weights for maximum growth." if roi_improvement > 0 else "System holds conservative baseline.",
            "allocations": allocations, # Keep for UI table
            "roi_before_optimization": round(baseline_roi, 4),
            "roi_after_optimization": round(optimized_roi, 4),
            "roi_improvement_pct": round(improvement_pct, 2),
        }

    except Exception as e:
        return {"error": str(e)}
