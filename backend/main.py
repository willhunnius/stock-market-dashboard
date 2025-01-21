from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf
from datetime import datetime, timedelta
import pandas as pd
import numpy as np

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def detect_patterns(df):
    """Detect candlestick patterns."""
    patterns = []
    
    for i in range(1, len(df)):
        current = df.iloc[i]
        previous = df.iloc[i-1]
        
        # Calculate body sizes
        curr_body_size = abs(current['Close'] - current['Open'])
        prev_body_size = abs(previous['Close'] - previous['Open'])
        
        # Bullish Engulfing
        if (previous['Close'] < previous['Open'] and  # Previous red candle
            current['Close'] > current['Open'] and    # Current green candle
            current['Open'] < previous['Close'] and   # Opens below previous close
            current['Close'] > previous['Open']):     # Closes above previous open
            patterns.append(('bullish_engulfing', i))
            
        # Bearish Engulfing
        elif (previous['Close'] > previous['Open'] and  # Previous green candle
              current['Close'] < current['Open'] and    # Current red candle
              current['Open'] > previous['Close'] and   # Opens above previous close
              current['Close'] < previous['Open']):     # Closes below previous open
            patterns.append(('bearish_engulfing', i))
            
        # Morning Star (simplified)
        elif (i > 1 and
              df.iloc[i-2]['Close'] < df.iloc[i-2]['Open'] and  # First day: bearish
              abs(previous['Close'] - previous['Open']) < curr_body_size * 0.3 and  # Second day: small body
              current['Close'] > current['Open']):  # Third day: bullish
            patterns.append(('morning_star', i))
            
        # Evening Star (simplified)
        elif (i > 1 and
              df.iloc[i-2]['Close'] > df.iloc[i-2]['Open'] and  # First day: bullish
              abs(previous['Close'] - previous['Open']) < curr_body_size * 0.3 and  # Second day: small body
              current['Close'] < current['Open']):  # Third day: bearish
            patterns.append(('evening_star', i))
    
    return patterns

@app.get("/stock/{symbol}")
async def get_stock_info(
    symbol: str,
    timeframe: str = Query("1mo", enum=["1d", "5d", "1mo", "3mo", "6mo", "1y", "2y", "5y", "max"]),
    interval: str = Query("1d", enum=["1m", "2m", "5m", "15m", "30m", "60m", "90m", "1h", "1d", "5d", "1wk", "1mo", "3mo"]),
    chart_type: str = Query("line", enum=["line", "candle"])
):
    try:
        stock = yf.Ticker(symbol)
        info = stock.info
        
        # Get historical data
        history = stock.history(period=timeframe, interval=interval)
        
        # Detect patterns if using candlestick chart
        patterns = detect_patterns(history) if chart_type == "candle" else []
        
        # Format historical data
        historical_data = []
        for i, (date, row) in enumerate(history.iterrows()):
            data_point = {
                "date": date.strftime("%Y-%m-%d %H:%M"),
                "open": round(row["Open"], 2),
                "high": round(row["High"], 2),
                "low": round(row["Low"], 2),
                "close": round(row["Close"], 2),
                "volume": row["Volume"],
                "patterns": []
            }
            
            # Add any patterns for this candle
            for pattern, idx in patterns:
                if idx == i:
                    data_point["patterns"].append(pattern)
            
            historical_data.append(data_point)

        return {
            "symbol": symbol,
            "name": info.get("longName"),
            "currentPrice": info.get("currentPrice", info.get("regularMarketPrice")),
            "currency": info.get("currency"),
            "historical": historical_data
        }
    except Exception as e:
        return {"error": str(e)}