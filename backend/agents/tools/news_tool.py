"""
News Tool: Fetches real-time financial news from NewsAPI.
"""

import os
import requests
from langchain.tools import tool
from dotenv import load_dotenv

load_dotenv()


@tool("news_tool")
def news_tool(queries_str: str) -> dict:
    """
    Fetches real-time financial news headlines for one or more queries/tickers.
    Uses NEWS_API_KEY environment variable.

    Input: A comma-separated list of queries or tickers (e.g. "AAPL, MSFT")
    Output: dict mapping query to its top headlines and summaries
    """
    api_key = os.getenv("NEWS_API_KEY", "")
    results = {}
    api_key = os.getenv("NEWS_API_KEY", "")

    for query in queries_str.split(','):
        query = query.strip()
        if not query: continue

        if not api_key:
            results[query] = {
                "error": "NEWS_API_KEY not set",
                "headlines": [],
                "sentiment_hint": "neutral",
            }
            continue

        try:
            url = "https://newsapi.org/v2/everything"
            params = {
                "q": query,
                "sortBy": "publishedAt",
                "pageSize": 5,
                "language": "en",
                "apiKey": api_key,
            }
            resp = requests.get(url, params=params, timeout=10)
            resp.raise_for_status()
            data = resp.json()

            articles = data.get("articles", [])
            headlines = []
            for a in articles:
                headlines.append({
                    "title": a.get("title", ""),
                    "description": a.get("description", ""),
                    "source": a.get("source", {}).get("name", ""),
                    "published_at": a.get("publishedAt", ""),
                    "url": a.get("url", ""),
                })

            positive_words = {"surge", "gain", "rise", "bull", "growth", "rally", "up", "profit", "record", "beat"}
            negative_words = {"fall", "drop", "crash", "bear", "loss", "decline", "down", "sell", "miss", "cut"}

            pos = sum(1 for h in headlines if any(w in h["title"].lower() for w in positive_words))
            neg = sum(1 for h in headlines if any(w in h["title"].lower() for w in negative_words))

            if pos > neg:
                sentiment = "positive"
            elif neg > pos:
                sentiment = "negative"
            else:
                sentiment = "neutral"

            results[query] = {
                "sentiment": sentiment,
                "pos_signals": pos,
                "neg_signals": neg,
            }

        except Exception as e:
            results[query] = {
                "error": str(e)
            }

    return results
