"""
Market data routes using yfinance
"""

from fastapi import APIRouter, HTTPException
from typing import List, Optional
from datetime import datetime, timedelta
import yfinance as yf

from app.services.market_data_service import MarketDataService

router = APIRouter()


@router.get("/quote/{symbol}")
async def get_quote(symbol: str):
    """Get real-time quote for a symbol"""
    try:
        ticker = yf.Ticker(symbol.upper())
        info = ticker.info
        
        # Get current price
        data = ticker.history(period="1d", interval="1m")
        if data.empty:
            raise HTTPException(status_code=404, detail="Symbol not found")
        
        current_price = data['Close'].iloc[-1]
        prev_close = info.get('previousClose', current_price)
        change = current_price - prev_close
        change_percent = (change / prev_close * 100) if prev_close else 0
        
        return {
            "symbol": symbol.upper(),
            "price": float(current_price),
            "change": float(change),
            "change_percent": float(change_percent),
            "volume": int(data['Volume'].iloc[-1]) if not data.empty else 0,
            "market_cap": info.get('marketCap'),
            "pe_ratio": info.get('trailingPE'),
            "name": info.get('longName'),
            "currency": info.get('currency', 'USD'),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching data: {str(e)}")


@router.get("/quotes")
async def get_multiple_quotes(symbols: str):
    """Get quotes for multiple symbols (comma-separated)"""
    symbol_list = [s.strip().upper() for s in symbols.split(",")]
    results = []
    
    for symbol in symbol_list:
        try:
            ticker = yf.Ticker(symbol)
            data = ticker.history(period="1d", interval="1m")
            info = ticker.info
            
            if data.empty:
                continue
            
            current_price = data['Close'].iloc[-1]
            prev_close = info.get('previousClose', current_price)
            change = current_price - prev_close
            change_percent = (change / prev_close * 100) if prev_close else 0
            
            results.append({
                "symbol": symbol,
                "price": float(current_price),
                "change": float(change),
                "change_percent": float(change_percent),
                "volume": int(data['Volume'].iloc[-1]) if not data.empty else 0,
                "market_cap": info.get('marketCap'),
                "name": info.get('longName'),
            })
        except Exception as e:
            continue
    
    return results


@router.get("/history/{symbol}")
async def get_history(
    symbol: str,
    period: str = "1mo",  # 1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max
    interval: str = "1d"  # 1m, 2m, 5m, 15m, 30m, 60m, 90m, 1h, 1d, 5d, 1wk, 1mo, 3mo
):
    """Get historical data for a symbol"""
    try:
        ticker = yf.Ticker(symbol.upper())
        hist = ticker.history(period=period, interval=interval)
        
        if hist.empty:
            raise HTTPException(status_code=404, detail="No data found")
        
        # Convert to list of dicts
        data = []
        for idx, row in hist.iterrows():
            data.append({
                "date": idx.isoformat(),
                "open": float(row['Open']),
                "high": float(row['High']),
                "low": float(row['Low']),
                "close": float(row['Close']),
                "volume": int(row['Volume']),
            })
        
        return {
            "symbol": symbol.upper(),
            "period": period,
            "interval": interval,
            "data": data,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching history: {str(e)}")


@router.get("/search/{query}")
async def search_symbols(query: str):
    """Search for symbols by name or ticker"""
    # yfinance doesn't have a search API, so we'll use a simple approach
    # In production, consider using a financial data API with search
    try:
        # Try to fetch info for the query as a symbol
        ticker = yf.Ticker(query.upper())
        info = ticker.info
        
        if info and 'symbol' in info:
            return [{
                "symbol": info['symbol'],
                "name": info.get('longName', query),
                "exchange": info.get('exchange', ''),
            }]
        else:
            return []
    except:
        return []

