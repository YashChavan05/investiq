# InvestIQ — Final Project Blueprint

## 1. Project Vision
InvestIQ is a state-of-the-art Multi-Agent Financial Intelligence System designed to maximize ROI through logic-driven, real-time portfolio optimization. It utilizes a stateful orchestrator to manage 8 specialized agents, ensuring all decisions are backed by market math, historical memory, and explainable AI.

---

## 2. System Architecture (FARM Stack)
- **Frontend**: React + Vite + Tailwind CSS (Premium Glassmorphism UI).
- **Backend**: FastAPI + LangGraph (Stateful Multi-Agent Orchestration).
- **Database**: MongoDB (Persistent Agent Memory & Self-Learning).
- **Model Layer**: Groq Llama-3-70B (Orchestration) + Scikit-Learn (Forecasting) + SciPy (Optimization).

---

## 3. The 8-Agent High-Performance Pipeline
Every analysis run triggers a coordinated workflow between these specialized entities:

1.  **Risk Analyzer Agent**: Calculates VaR, Volatility, and Max Drawdown to set guardrails.
2.  **Market Forecast Agent**: Uses Linear Regression to project 30-day returns and trend horizons.
3.  **Sustainability Agent**: Audits ESG scores and Carbon Intensity for ethical alignment.
4.  **Market Knowledge Agent**: Fetches real-time news and sentiment from NewsAPI/yfinance.
5.  **Self-Learning Agent**: Compares current data with MongoDB history to adapt weights based on past errors.
6.  **Finance Optimization Agent**: Runs SciPy SLSQP solvers to find the mathematical "Sweet Spot" for ROI.
7.  **Auto-Budget Allocator**: Converts optimization weights into specific dollar distributions and explains risk bias.
8.  **XAI ROI Attribution Agent**: Uses SHAP values to explain *why* the AI made specific choices for every asset.

---

## 4. Final Intelligent Output
The system's "Brain" (LLM Agent) synthesizes all the above into a 9-field JSON report:
- **Final Decision**: Actionable recommendation (Invest/Avoid).
- **Confidence Score**: Mathematically derived from forecast accuracy.
- **ROI Estimate**: Precise percentage expectation.
- **Agent Contributions**: Breakdown of which agent influenced the decision most.
- **Strategy Reasoning**: Human-readable logic.
- **Alternative Strategy**: Backup plan for risk mitigation.

---

## 5. Persistence & Learning Loop
- **Memory Storage**: Every session is indexed in MongoDB.
- **Feedback Mechanism**: The Learning Agent retrieves past records, calculates "Prediction Error" (Actual vs. Predicted ROI), and adjusts the importance of agents for the next run.

---

## 6. Real-Time Data Integrity
- **No Mock Data**: All inputs come from live `yfinance` and `NewsAPI` feeds.
- **Logic-Driven**: Badges, risk levels, and strategies are derived from calculations, not hardcoded strings.

---
**Status: 100% COMPLETE & DEPLOYMENT READY**
