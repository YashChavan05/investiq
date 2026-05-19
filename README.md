# 🚀 InvestIQ — Enterprise-Grade Stateful Multi-Agent Financial Intelligence System

[![Platform](https://img.shields.io/badge/Stack-FARM-blue?style=for-the-badge)](https://fastapi.tiangolo.com/)
[![Orchestrator](https://img.shields.io/badge/Orchestrator-LangGraph-00C2A8?style=for-the-badge)](https://github.com/langchain-ai/langgraph)
[![Model](https://img.shields.io/badge/Model-Groq_Llama--3-orange?style=for-the-badge)](https://console.groq.com/)
[![Database](https://img.shields.io/badge/Database-MongoDB-green?style=for-the-badge)](https://www.mongodb.com/)
[![Frontend](https://img.shields.io/badge/Frontend-React_18_--_Vite_--_Tailwind-cyan?style=for-the-badge)](https://vitejs.dev/)

InvestIQ is a premium, stateful **Multi-Agent Financial Intelligence & Portfolio Optimization System** built on the modern **FARM stack** (FastAPI, React, MongoDB). It orchestrates 11 specialized agent nodes in a precise mathematical and analytical pipeline using **LangGraph**, empowering users with institutional-grade risk analysis, machine learning forecasts, self-learning history loops, dynamic asset allocation, and Explainable AI (XAI).

---

## 🏗️ System Architecture & Workflow

Unlike naive single-agent prompts or loose ReAct loops, InvestIQ utilizes a strict, stateful **LangGraph State Machine** where each specialized agent executes its calculation, stores its results in the global thread state, and pipes it directly to the next specialized node:

![System Architecture](architecture.png)

### The 11-Stage Intelligent Pipeline

1. **Risk Analyzer Agent**: Calculates historical volatility, Value at Risk (VaR), and Maximum Drawdown using live `yfinance` history to establish risk guardrails.
2. **Market Forecast Agent**: Runs a local Machine Learning time-series prediction to output expected 30-day returns and bullish/bearish trends.
3. **Market Knowledge Agent**: Fetches real-time financial headlines and evaluates positive/negative market sentiment.
4. **Finance Auditor Agent**: Conducts fundamental corporate balance sheet health auditing.
5. **Sustainability ESG Agent**: Evaluates ESG performance scores and carbon intensity indicators to promote ethical allocation.
6. **Self-Learning Memory Agent**: Queries past MongoDB runs, calculates previous prediction errors (predicted vs. actual ROI), and calculates an adaptation offset factor.
7. **Finance Optimization Agent**: Solves a complex mathematical portfolio optimization using a **SciPy SLSQP solver**, maximizing expected ROI while keeping portfolio risk within the user's custom risk threshold.
8. **Auto-Budget Allocator**: Converts optimal weights into dynamic capital distributions and details cash/bond/equity percentages based on the risk profile.
9. **XAI ROI Attribution Agent**: Computes **SHAP (SHapley Additive exPlanations)** values to mathematically reveal which agent nodes (Risk, Trend, Sentiment) influenced the allocation of each asset the most.
10. **Central LLM Narration Node**: Synthesizes the quantitative outputs of all upstream agents using a Llama-3 model into a highly cohesive, professional investment strategy.
11. **Memory Persistence Agent**: Saves the full analysis run, parameters, and results to MongoDB to feed the learning loop for subsequent sessions.

---

## 📂 Project Directory Structure

```
investiq/
├── backend/                         # FastAPI high-performance Python Backend
│   ├── agents/
│   │   ├── investiq_agent.py        # LangGraph State Machine Orchestrator
│   │   ├── db_config.py             # MongoDB Async client connection
│   │   └── tools/                   # Specialized mathematical tools
│   │       ├── risk_tool.py         # VaR, volatility, drawdown calculator
│   │       ├── forecast_tool.py     # Linear regression time-series forecasting
│   │       ├── news_tool.py         # Market headlines & sentiment audit
│   │       ├── finance_tool.py      # Corporate fundamental analysis
│   │       ├── sustainability_tool.py # ESG & carbon metric parser
│   │       ├── learning_tool.py     # MongoDB historical error tracking
│   │       ├── optimization_tool.py # SciPy SLSQP optimization optimizer
│   │       ├── budget_tool.py       # Capital allocator
│   │       ├── xai_tool.py          # SHAP attribution score engine
│   │       └── memory_tool.py       # MongoDB read/write persistence
│   ├── main.py                      # REST endpoints & dynamic system metrics
│   └── requirements.txt             # Backend dependencies
└── frontend/                        # Premium Responsive React UI
    ├── src/
    │   ├── components/
    │   │   ├── Layout.jsx           # App layout with live news notification banner
    │   │   └── ui.jsx               # Harmonious reusable glassmorphic UI components
    │   ├── pages/
    │   │   ├── Home.jsx             # Launch portal & indices status
    │   │   ├── Dashboard.jsx        # Admin dashboard & live metrics auditing
    │   │   ├── Markets.jsx          # Interactive Trading Terminal (TradingView charts)
    │   │   ├── AIAllocator.jsx      # Core Multi-Agent Allocator interface
    │   │   ├── Agents.jsx           # Interactive Agent Lab (independent execution node)
    │   │   └── History.jsx          # Database history explorer
    │   ├── services/
    │   │   └── api.js               # Axios API client setup
    │   ├── App.jsx                  # React router setup
    │   └── index.css                # Curated premium HSL colors & animations
    └── package.json                 # Frontend dependencies
```

---

## 🛠️ Installation & Setup Guide

### Prerequisites
* **Python 3.10+** (Ensure Python is added to your environment path)
* **Node.js 18+**
* **MongoDB** (Local instance running at `mongodb://localhost:27017` or a MongoDB Atlas URI)
* **Groq API Key** (Get yours free at [console.groq.com](https://console.groq.com))
* **NewsAPI Key** (Get yours free at [newsapi.org](https://newsapi.org))

---

### 1. Backend Server Setup

```bash
cd backend

# Create and activate a python virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install high-performance financial, mathematical, and agentic dependencies
pip install -r requirements.txt

# Create your local environment configuration
cp .env.example .env
```

Open `backend/.env` and update the variables with your local secrets:
```ini
GROQ_API_KEY=gsk_your_groq_api_key
NEWS_API_KEY=your_news_api_key
MONGO_URL=mongodb://localhost:27017
DB_NAME=investiq_db
```

Start the FastAPI development server:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
* The backend API documentation is now live at: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### 2. Frontend Setup

In a new terminal window:
```bash
cd frontend

# Install package dependencies
npm install

# Run the local Vite server
npm run dev
```
* Open your browser and navigate to: [http://localhost:5173](http://localhost:5173)

---

## 🔌 API Documentation & Schema

### `POST /analyze`
Runs the complete stateful multi-agent LangGraph workflow.

**Request Payload:**
```json
{
  "tickers": ["AAPL", "NVDA", "TSLA"],
  "total_budget": 15000,
  "risk_threshold": 0.45
}
```

**Response Payload Structure:**
```json
{
  "success": true,
  "tickers": ["AAPL", "NVDA", "TSLA"],
  "total_budget": 15000,
  "structured_output": {
    "risk_scores": { "AAPL": 0.32, "NVDA": 0.58, "TSLA": 0.68 },
    "predicted_returns": {
      "AAPL": { "value": 0.08, "confidence": 0.85 },
      "NVDA": { "value": 0.22, "confidence": 0.81 },
      "TSLA": { "value": 0.15, "confidence": 0.74 }
    },
    "allocation": [
      { "ticker": "AAPL", "weight": 0.40, "allocated_amount": 6000 },
      { "ticker": "NVDA", "weight": 0.35, "allocated_amount": 5250 },
      { "ticker": "TSLA", "weight": 0.25, "allocated_amount": 3750 }
    ],
    "roi_before_optimization": 0.078,
    "roi_after_optimization": 0.134,
    "roi_improvement_pct": 71.8,
    "final_decision": "Invest in tech equities with controlled risk limits",
    "explanation": "Quantitative risk metrics justify tech-focused diversification...",
    "xai_explanation": "Volatility trends and risk mitigation weights primarily influenced Apple allocation...",
    "steps_taken": 11
  }
}
```

---

## 🛠️ Technology Stack

| Component | Technology | Role in System |
| :--- | :--- | :--- |
| **Frontend** | React | Modern Single Page Application (SPA) & Interactive Dashboard |
| **Styling** | Tailwind CSS | Fluid CSS design & responsive premium layout |
| **Backend** | FastAPI | High-speed, async Python web framework |
| **AI Orchestration** | LangGraph | Stateful Multi-Agent Execution Graph & Orchestration |
| **Observability** | LangSmith | Live tracing, monitoring, & debugging of agent runs |
| **AI / LLM** | Groq (Llama-3) | Low-latency inference & central strategic reasoning |
| **Database** | MongoDB | Persistent agent memory & historical self-learning loops |
| **ML Framework** | Scikit-Learn | Local time-series forecasting & ROI trend predictors |
| **Optimization** | SciPy | Constrained SLSQP portfolio math solver |
| **Data Processing** | Pandas, NumPy | High-speed financial calculations & preprocessing |
| **Market Data** | yfinance | Live asset price & historical metrics downloader |

---

## ⚡ Key Features

- **Stateful Multi-Agent Orchestration**: LangGraph-guided pipeline ensuring precise node communication and state synchronization.
- **Adaptive Self-Learning**: Loop back learning system utilizing past MongoDB prediction errors to dynamically adjust current ROI trends.
- **Mathematical Optimization**: SciPy SLSQP Solver maximizing return yields while respecting individual user risk guardrails.
- **Explainable AI (XAI)**: Multi-dimensional SHAP values visualized so no decisions remain black-box.
- **Real-Time Integration**: Direct download of live global asset indices and breaking financial news.
- **Scalable & Modular**: High-performance codebase where adding new agents takes a single node addition.
- **Secure & Enterprise-Ready**: Native `.env` ignoring systems to guarantee zero key leakages.
