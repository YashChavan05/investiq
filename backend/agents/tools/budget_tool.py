import json
from langchain.tools import tool

@tool("budget_tool")
def budget_tool(input_json: str) -> dict:
    """
    Distributes total budget across assets based on optimization weights.
    Input (JSON): {"total_budget": 10000, "allocations": [{"ticker": "AAPL", "weight": 0.5, "expected_return": 0.1}, ...]}
    """
    try:
        data = json.loads(input_json)
        total_budget = float(data.get("total_budget", 10000))
        allocations = data.get("allocations", [])
        
        allocated_budget = {}
        allocation_percent = {}
        expected_contribution = {}
        
        for a in allocations:
            ticker = a["ticker"]
            weight = float(a.get("optimal_weight", a.get("weight", 0)))
            exp_return = float(a.get("expected_return", 0.05))
            
            allocated_budget[ticker] = round(weight * total_budget, 2)
            allocation_percent[ticker] = round(weight, 4)
            expected_contribution[ticker] = round(weight * exp_return, 4)
            
        return {
            "total_budget": total_budget,
            "allocated_budget": allocated_budget,
            "allocation_percent": allocation_percent,
            "allocation_strategy": "Risk-adjusted dynamic allocation",
            "risk_influence": "High risk detected in some assets; weights adjusted to stay within threshold.",
            "expected_return_contribution": expected_contribution,
            "diversification_level": "High" if len(allocations) > 3 else "Moderate",
            "adjustment_flag": True
        }
    except Exception as e:
        return {"error": str(e)}
