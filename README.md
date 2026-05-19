# InvestIQ — Agentic AI Financial Intelligence System

> LangChain LangGraph × Groq LLaMA 3 × FastAPI × React + Vite

---

## Architecture (Multi-Agent State Machine)

```
InvestIQ
├── backend/                   # Python FastAPI + LangGraph
│   ├── agents/
│   │   ├── investiq_agent.py  # LangGraph Orchestrator (State Machine)
│   │   ├── db_config.py       # MongoDB Async Connection
│   │   └── tools/
│   │       ├── risk_tool.py       # Risk Analyzer (VaR, Max Drawdown)
│   │       ├── forecast_tool.py   # Forecast Agent (ML + Time-series)
│   │       ├── budget_tool.py     # Budget Allocator (Capital distribution)
│   │       ├── optimization_tool.py # Optimization Agent (ROI Maximizer)
│   │       ├── sustainability_tool.py # Sustainability Agent (ESG/Carbon)
│   │       ├── learning_tool.py   # Self-Learning Agent (Historical Memory)
│   │       ├── xai_tool.py        # XAI Agent (SHAP Feature Attribution)
│   │       └── news_tool.py       # Market Knowledge Agent
│   ├── main.py                # FastAPI endpoints + Persistence Hooks
│   ├── requirements.txt
│   └── .env
└── frontend/                  # React (FARM Stack)
    ├── src/
    │   ├── pages/
    │   │   ├── AIAllocator.jsx   # Core Multi-Agent Dashboard
    │   │   ├── History.jsx       # Agent Memory (MongoDB Records)
    │   │   ├── Markets.jsx       # Dynamic Financial Tickers
    │   │   └── Home.jsx          # Entry Portal
    └── package.json
```

---

## Prerequisites

- Python 3.10+
- Node.js 18+
- Groq API key (free at [console.groq.com](https://console.groq.com))
- NewsAPI key (free at [newsapi.org](https://newsapi.org))
- MongoDB Instance (Local or Atlas)

---

## Backend Setup

```bash
cd backend

# 1. Create virtual environment
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment
cp .env.example .env
# Edit .env and set:
#   GROQ_API_KEY=gsk_...
#   NEWS_API_KEY=your_key_here
#   MONGO_URI=mongodb://localhost:27017

# 4. Run server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Backend runs at: http://localhost:8000
API docs at: http://localhost:8000/docs

---

## Frontend Setup

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. (Optional) Set API URL
# Create .env.local:
echo "VITE_API_URL=http://localhost:8000" > .env.local

# 3. Run dev server
npm run dev
```

Frontend runs at: http://localhost:5173

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/analyze` | Run full LangChain ReAct agent pipeline |
| POST | `/market-data` | Fetch OHLCV + metrics for tickers |
| GET | `/market-data/top-movers` | Top gainers/losers from yfinance |
| GET | `/market-data/indices` | S&P 500, NASDAQ, Dow Jones, VIX |
| POST | `/news` | Real-time news from NewsAPI |
| GET | `/health` | Backend health + config check |

### Example: /analyze

```json
POST /analyze
{
  "tickers": ["AAPL", "TSLA", "NVDA"],
  "total_budget": 10000,
  "risk_threshold": 0.4
}
```

Response:
```json
{
  "success": true,
  "tickers": ["AAPL", "TSLA", "NVDA"],
  "total_budget": 10000,
  "structured_output": {
    "risk_scores": {"AAPL": 0.28, "TSLA": 0.71, "NVDA": 0.55},
    "predicted_returns": {"AAPL": 0.12, "TSLA": 0.31, "NVDA": 0.22},
    "allocation": [...],
    "roi_before_optimization": 0.0832,
    "roi_after_optimization": 0.1124,
    "roi_improvement_pct": 35.1,
    "final_decision": "...",
    "xai_explanation": "..."
  },
  "steps_taken": 18,
  "tool_calls": [...]
}
```

---

## LangChain Agent Flow

```
User Query
    │
    ▼
ReAct Agent (Groq LLaMA 3-70B)
    │
    ├─► risk_tool(AAPL)        → risk_score, VaR, volatility
    ├─► risk_tool(TSLA)        → risk_score, VaR, volatility
    ├─► forecast_tool(AAPL)    → predicted_return_30d, trend
    ├─► forecast_tool(TSLA)    → predicted_return_30d, trend
    ├─► news_tool("AAPL stock") → headlines, sentiment
    ├─► news_tool("TSLA stock") → headlines, sentiment
    ├─► budget_tool(...)        → initial allocation weights
    ├─► optimization_tool(...)  → scipy SLSQP optimal weights
    │                             ROI before/after, improvement%
    └─► xai_tool(...)           → SHAP values, feature importance
            │
            ▼
    Final structured JSON response
```

---

## Environment Variables

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `GROQ_API_KEY` | Groq LLM API key | console.groq.com |
| `NEWS_API_KEY` | NewsAPI key | newsapi.org |

---

## Tech Stack

**Backend:**
- FastAPI + Uvicorn
- LangChain (ReAct AgentExecutor)
- langchain-groq (LLaMA 3-70B)
- yfinance (live market data)
- pandas, numpy (data processing)
- scikit-learn (ML forecasting)
- scipy.optimize (portfolio optimization)
- SHAP (explainable AI)

**Frontend:**
- React 18 + Vite
- Tailwind CSS
- Recharts (charts)
- Lucide React (icons)
- Axios (HTTP client)
- React Router v6

---

## Notes

- The `/analyze` endpoint can take 30–120 seconds as the ReAct agent makes multiple LLM + tool calls
- yfinance requires internet access to fetch live stock data
- All calculations are performed with real data — no hardcoded values
- SHAP explanations require ≥2 stocks in the portfolio
