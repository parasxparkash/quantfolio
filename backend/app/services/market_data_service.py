"""
Market data service for caching and fetching stock data
"""

import yfinance as yf
from datetime import datetime, timedelta
from typing import Optional, Dict
from app.models.price_cache import PriceCache
from app.config import settings


class MarketDataService:
    """Service for fetching and caching market data"""
    
    @staticmethod
    async def get_quote(symbol: str, use_cache: bool = True) -> Dict:
        """Get quote for a symbol with caching"""
        symbol = symbol.upper()
        
        # Check cache first
        if use_cache:
            cached = await PriceCache.find_one(PriceCache.symbol == symbol)
            if cached and cached.expires_at > datetime.utcnow():
                return {
                    "symbol": cached.symbol,
                    "price": cached.price,
                    "change": cached.change,
                    "change_percent": cached.change_percent,
                    "volume": cached.volume,
                    "market_cap": cached.market_cap,
                    "pe_ratio": cached.pe_ratio,
                    "data": cached.data,
                    "cached": True,
                }
        
        # Fetch from yfinance
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.info
            data = ticker.history(period="1d", interval="1m")
            
            if data.empty:
                raise ValueError(f"No data found for {symbol}")
            
            current_price = float(data['Close'].iloc[-1])
            prev_close = info.get('previousClose', current_price)
            change = current_price - prev_close
            change_percent = (change / prev_close * 100) if prev_close else 0
            
            quote_data = {
                "symbol": symbol,
                "price": current_price,
                "change": change,
                "change_percent": change_percent,
                "volume": int(data['Volume'].iloc[-1]) if not data.empty else 0,
                "market_cap": info.get('marketCap'),
                "pe_ratio": info.get('trailingPE'),
                "name": info.get('longName'),
                "currency": info.get('currency', 'USD'),
                "data": info,
            }
            
            # Update cache
            if use_cache:
                expires_at = datetime.utcnow() + timedelta(seconds=settings.YFINANCE_CACHE_TTL)
                
                existing_cache = await PriceCache.find_one(PriceCache.symbol == symbol)
                if existing_cache:
                    existing_cache.price = current_price
                    existing_cache.change = change
                    existing_cache.change_percent = change_percent
                    existing_cache.volume = quote_data['volume']
                    existing_cache.market_cap = quote_data['market_cap']
                    existing_cache.pe_ratio = quote_data['pe_ratio']
                    existing_cache.data = info
                    existing_cache.updated_at = datetime.utcnow()
                    existing_cache.expires_at = expires_at
                    await existing_cache.save()
                else:
                    cache = PriceCache(
                        symbol=symbol,
                        price=current_price,
                        change=change,
                        change_percent=change_percent,
                        volume=quote_data['volume'],
                        market_cap=quote_data['market_cap'],
                        pe_ratio=quote_data['pe_ratio'],
                        data=info,
                        expires_at=expires_at,
                    )
                    await cache.create()
            
            return quote_data
            
        except Exception as e:
            raise Exception(f"Error fetching data for {symbol}: {str(e)}")
    
    @staticmethod
    async def get_multiple_quotes(symbols: list) -> list:
        """Get quotes for multiple symbols"""
        results = []
        for symbol in symbols:
            try:
                quote = await MarketDataService.get_quote(symbol)
                results.append(quote)
            except:
                continue
        return results

