import os
import json
import asyncio
from typing import Annotated, Sequence, TypedDict, List, Dict, Any
from dotenv import load_dotenv

from langchain_groq import ChatGroq
from langgraph.graph import StateGraph, END

from agents.tools import (
    risk_tool, 
    forecast_tool, 
    news_tool, 
    budget_tool, 
    optimization_tool, 
    xai_tool,
    finance_tool,
    sustainability_tool,
    learning_tool
)
from agents.tools.memory_tool import save_analysis_to_memory

load_dotenv()

# ────────────────────────────────────────────────────────
# 1. Define State
# ────────────────────────────────────────────────────────

class AgentState(TypedDict):
    tickers: List[str]
    tickers_str: str
    total_budget: float
    risk_threshold: float
    risk_data: Dict[str, Any]
    forecast_data: Dict[str, Any]
    news_data: Dict[str, Any]
    finance_data: Dict[str, Any]
    sustainability_data: Dict[str, Any]
    learning_data: Dict[str, Any]
    budget_data: Dict[str, Any]
    optimization_results: Dict[str, Any]
    xai_results: Dict[str, Any]
    explanation: str
    summary: str
    structured_output: Dict[str, Any]
    steps_taken: int

# ────────────────────────────────────────────────────────
# 2. Define Asynchronous Nodes
# ────────────────────────────────────────────────────────

async def risk_node(state: AgentState):
    print(f"\033[92m> [Risk Agent] Analyzing volatility and VaR...\033[0m")
    out = await asyncio.to_thread(risk_tool.invoke, {"tickers_str": state["tickers_str"]})
    data = json.loads(out) if isinstance(out, str) else out
    return {"risk_data": data, "steps_taken": state["steps_taken"] + 1}

async def forecast_node(state: AgentState):
    print(f"\033[92m> [Forecast Agent] Running ML return predictions...\033[0m")
    out = await asyncio.to_thread(forecast_tool.invoke, {"tickers_str": state["tickers_str"]})
    data = json.loads(out) if isinstance(out, str) else out
    return {"forecast_data": data, "steps_taken": state["steps_taken"] + 1}

async def news_node(state: AgentState):
    print(f"\033[92m> [News Agent] Evaluating market sentiment...\033[0m")
    out = await asyncio.to_thread(news_tool.invoke, {"queries_str": state["tickers_str"]})
    data = json.loads(out) if isinstance(out, str) else out
    return {"news_data": data, "steps_taken": state["steps_taken"] + 1}

async def finance_node(state: AgentState):
    print(f"\033[92m> [Finance Agent] Auditing fundamental health metrics...\033[0m")
    out = await asyncio.to_thread(finance_tool.invoke, {"tickers_str": state["tickers_str"]})
    data = json.loads(out) if isinstance(out, str) else out
    return {"finance_data": data, "steps_taken": state["steps_taken"] + 1}

async def sustainability_node(state: AgentState):
    print(f"\033[92m> [Sustainability Agent] Checking ESG and carbon scores...\033[0m")
    out = await asyncio.to_thread(sustainability_tool.invoke, {"tickers_str": state["tickers_str"]})
    data = json.loads(out) if isinstance(out, str) else out
    return {"sustainability_data": data, "steps_taken": state["steps_taken"] + 1}

async def learning_node(state: AgentState):
    print(f"\033[92m> [Learning Agent] Factoring in historical memory and biases...\033[0m")
    # This tool is already async
    from agents.tools.learning_tool import learning_tool as lt_async
    out = await lt_async(state["tickers_str"])
    return {"learning_data": out, "steps_taken": state["steps_taken"] + 1}

async def optimization_node(state: AgentState):
    print(f"\033[93m> [Optimization Agent] Running SciPy ROI maximization...\033[0m")
    stocks_list = []
    for t in state["tickers"]:
        base_risk = state["risk_data"].get(t, {}).get("risk_score", 0.5)
        base_return = state["forecast_data"].get(t, {}).get("predicted_return", 0.05)
        learned_adj = state["learning_data"].get("ticker_insights", {}).get(t, {}).get("adaptation_factor", 0)
        
        stocks_list.append({
            "ticker": t,
            "risk_score": base_risk,
            "predicted_return": base_return + learned_adj
        })
        
    opt_input = json.dumps({
        "stocks": stocks_list,
        "risk_threshold": state["risk_threshold"],
        "total_budget": state["total_budget"]
    })
    out = await asyncio.to_thread(optimization_tool.invoke, {"input_json": opt_input})
    data = json.loads(out) if isinstance(out, str) else out
    return {"optimization_results": data, "steps_taken": state["steps_taken"] + 1}

async def budget_node(state: AgentState):
    print(f"\033[93m> [Budget Agent] Calculating dynamic capital distribution...\033[0m")
    budget_input = json.dumps({
        "total_budget": state["total_budget"],
        "allocations": state["optimization_results"].get("allocations", [])
    })
    out = await asyncio.to_thread(budget_tool.invoke, {"input_json": budget_input})
    data = json.loads(out) if isinstance(out, str) else out
    return {"budget_data": data, "steps_taken": state["steps_taken"] + 1}

async def xai_node(state: AgentState):
    print(f"\033[95m> [XAI Agent] Calculating SHAP feature importance...\033[0m")
    allocations = state["optimization_results"].get("allocations", [])
    out = await asyncio.to_thread(xai_tool.invoke, {"input_json": json.dumps({"allocations": allocations})})
    data = json.loads(out) if isinstance(out, str) else out
    return {"xai_results": data, "steps_taken": state["steps_taken"] + 1}

async def narration_node(state: AgentState):
    print(f"\033[95m> [Assistant] Finalizing strategy and results...\033[0m")
    tickers = state["tickers"]
    
    narration_prompt = (
        f"You are the central LLM Finance Assistant for InvestIQ. Synthesize all agent outputs below into a final decision.\n"
        f"Risk profile: {state['risk_data']}\n"
        f"Forecast Trend: {state['forecast_data']}\n"
        f"Financial Health: {state['finance_data']}\n"
        f"Capital Allocation: {state['budget_data']}\n"
        f"XAI Attribution: {state['xai_results']}\n"
        f"Past Learning: {state['learning_data']}\n\n"
        "MANDATORY: Return ONLY a JSON with these exact fields:\n"
        "- 'final_decision': String summary recommendation\n"
        "- 'confidence': Float 0-1\n"
        "- 'roi_estimate': Float expected ROI\n"
        "- 'strategy_summary': Clear logic summary\n"
        "- 'external_insights': List of news-driven points\n"
        "- 'agent_contributions': Object showing what each agent said\n"
        "- 'reasoning': Detailed LLM logic\n"
        "- 'alternative_strategy': Backup advice\n"
        "- 'explanation_level': 'High'\n"
    )
    
    groq_api_key = os.getenv("GROQ_API_KEY")
    explanation, summary = "Optimization complete.", "Recommended allocation ready."
    narrative_final = {}
    
    if groq_api_key:
        try:
            llm = ChatGroq(model="llama-3.1-8b-instant", temperature=0.1)
            res = await llm.ainvoke(narration_prompt)
            import re
            match = re.search(r"\{[\s\S]+\}", res.content)
            if match:
                narrative_final = json.loads(match.group())
                explanation = narrative_final.get("reasoning", explanation)
                summary = narrative_final.get("final_decision", summary)
        except Exception:
            pass
    
    # Prepare structured output for frontend and memory
    structured_output = {
        "risk_scores": {t: state["risk_data"].get(t, {}).get("risk_score", 0.5) for t in tickers},
        "predicted_returns": {
            t: {
                "value": state["forecast_data"].get(t, {}).get("predicted_return", 0.05),
                "confidence": state["forecast_data"].get(t, {}).get("confidence", 0.7)
            } for t in tickers
        },
        "finance_metrics": state["finance_data"],
        "sustainability_scores": state["sustainability_data"],
        "learned_insights": state["learning_data"],
        "allocation": [
            {
                "ticker": a["ticker"], 
                "weight": a["optimal_weight"], 
                "allocated_amount": a["allocated_amount"],
                "risk_score": a["risk_score"],
                "expected_return": a["expected_return"],
                "confidence": state["forecast_data"].get(a["ticker"], {}).get("confidence", 0.7)
            } 
            for a in state["optimization_results"].get("allocations", [])
        ],
        "roi_before_optimization": state["optimization_results"].get("roi_before_optimization", 0),
        "roi_after_optimization": state["optimization_results"].get("roi_after_optimization", 0),
        "roi_improvement_pct": state["optimization_results"].get("roi_improvement_pct", 0),
        "news_sentiment": {t: (state["news_data"].get(t, {}).get('sentiment') if isinstance(state["news_data"].get(t), dict) else state["news_data"].get(t, "Neutral")) for t in tickers},
        "final_decision": summary,
        "explanation": explanation,
        "xai_explanation": state["xai_results"].get("decision_explanation", explanation),
        "risk_level": state["risk_data"].get(tickers[0], {}).get("risk_level", "Medium") if tickers else "Medium",
        "confidence": narrative_final.get("confidence", 0.85),
        "expected_roi": state["optimization_results"].get("expected_roi", 0),
        "improvement_over_baseline": state["optimization_results"].get("improvement_over_baseline", 0),
        "diversification_score": state["optimization_results"].get("diversification_score", 0),
        "raw_output": explanation, 
        "steps_taken": state["steps_taken"] + 1
    }
            
    return {"explanation": explanation, "summary": summary, "structured_output": structured_output, "steps_taken": state["steps_taken"] + 1}

async def memory_node(state: AgentState):
    print(f"\033[94m> [Memory Agent] Saving analysis to MongoDB for future learning...\033[0m")
    await save_analysis_to_memory(state["tickers"], state["structured_output"])
    return {"steps_taken": state["steps_taken"] + 1}

# ────────────────────────────────────────────────────────
# 3. Construct Graph
# ────────────────────────────────────────────────────────

workflow = StateGraph(AgentState)
workflow.add_node("risk", risk_node)
workflow.add_node("forecast", forecast_node)
workflow.add_node("news", news_node)
workflow.add_node("finance", finance_node)
workflow.add_node("sustainability", sustainability_node)
workflow.add_node("learning", learning_node)
workflow.add_node("optimization", optimization_node)
workflow.add_node("budget", budget_node)
workflow.add_node("xai", xai_node)
workflow.add_node("narration", narration_node)
workflow.add_node("memory", memory_node)

workflow.set_entry_point("risk")
workflow.add_edge("risk", "forecast")
workflow.add_edge("forecast", "news")
workflow.add_edge("news", "finance")
workflow.add_edge("finance", "sustainability")
workflow.add_edge("sustainability", "learning")
workflow.add_edge("learning", "optimization")
workflow.add_edge("optimization", "budget")
workflow.add_edge("budget", "xai")
workflow.add_edge("xai", "narration")
workflow.add_edge("narration", "memory")
workflow.add_edge("memory", END)

app = workflow.compile()

# ────────────────────────────────────────────────────────
# 4. Final Run Function
# ────────────────────────────────────────────────────────

async def run_investiq_agent(
    tickers: list[str],
    total_budget: float,
    risk_threshold: float = 0.5,
) -> dict:
    tickers_str = ", ".join(tickers)
    print(f"\n\033[94m> [LangGraph] Starting async orchestration for {tickers_str}\033[0m")
    
    initial_state = {
        "tickers": tickers, "tickers_str": tickers_str, 
        "total_budget": total_budget, "risk_threshold": risk_threshold,
        "steps_taken": 0, "risk_data": {}, "forecast_data": {}, "news_data": {}, 
        "finance_data": {}, "sustainability_data": {}, "learning_data": {},
        "optimization_results": {}, "budget_data": {}, "xai_results": {}, "explanation": "", "summary": "",
        "structured_output": {}
    }
    
    try:
        final_state = await app.ainvoke(initial_state)
        return {
            "success": True, "tickers": tickers, "total_budget": total_budget,
            "risk_threshold": risk_threshold, 
            "structured_output": final_state["structured_output"],
            "raw_output": f"{final_state['explanation']}\n\nFINAL DECISION: {final_state['summary']}",
            "steps_taken": final_state["steps_taken"]
        }
    except Exception as e:
        print(f"\033[91m> [Error] {e}\033[0m")
        return {"success": False, "error": str(e)}

async def run_casual_chat(message: str) -> str:
    groq_api_key = os.getenv("GROQ_API_KEY")
    if not groq_api_key: return "InvestIQ API Key missing. Please check your .env configuration."
    try:
        llm = ChatGroq(model="llama-3.1-8b-instant", temperature=0.6)
        system_prompt = (
            "You are the InvestIQ Senior AI Strategist. You assist users with financial analysis, "
            "portfolio optimization, and market insights. You are aware of the system's 8 agents: "
            "Risk, Forecast, Sustainability, Knowledge, Learning, Optimization, Budget, and XAI. "
            "Keep your tone professional, authoritative, and helpful. Focus on logic-driven finance."
        )
        messages = [
            ("system", system_prompt),
            ("human", message),
        ]
        res = await llm.ainvoke(messages)
        return res.content
    except Exception as e: return f"InvestIQ Chat Error: {e}"


async def run_single_agent(agent_id: str, tickers: List[str]) -> Dict[str, Any]:
    """Runs a single agent node from the LangGraph workflow independently."""
    state: AgentState = {
        "tickers": tickers,
        "tickers_str": ", ".join(tickers),
        "total_budget": 10000,
        "risk_threshold": 0.5,
        "steps_taken": 0,
        "risk_data": {}, "forecast_data": {}, "news_data": {},
        "finance_data": {}, "sustainability_data": {}, "learning_data": {},
        "optimization_results": {}, "budget_data": {}, "xai_results": {},
        "explanation": "", "summary": "", "structured_output": {}
    }
    
    node_map = {
        "risk": risk_node,
        "forecast": forecast_node,
        "news": news_node,
        "finance": finance_node,
        "sustainability": sustainability_node,
        "learning": learning_node,
        "optimization": optimization_node,
        "budget": budget_node,
        "xai": xai_node,
    }
    
    if agent_id not in node_map:
        return {"success": False, "error": f"Agent {agent_id} not found"}
        
    try:
        # Some nodes depend on others. For a 'single' run, we provide empty dependencies
        # unless it's optimization/budget which need complex state.
        # We handle this by providing a default dummy state for those.
        if agent_id in ["optimization", "budget", "xai"]:
             # For these agents to be TRULY dynamic in the Lab, we must run their dependencies
             # fetch real-time risk and forecast data instead of using fakes
             if not state.get("risk_data") or not state.get("risk_data"):
                 state.update(await risk_node(state))
             if not state.get("forecast_data") or not state.get("forecast_data"):
                 state.update(await forecast_node(state))
             
             # Also ensure optimization_results exist for budget/xai
             if agent_id in ["budget", "xai"] and (not state.get("optimization_results") or not state.get("optimization_results")):
                 state.update(await optimization_node(state))

        result = await node_map[agent_id](state)
        return {"success": True, "agent": agent_id, "output": result}
    except Exception as e:
        return {"success": False, "error": str(e)}
