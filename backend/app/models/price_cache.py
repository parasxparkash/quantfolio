"""
Price cache model for storing market data
"""

from beanie import Document
from pydantic import Field
from datetime import datetime
from typing import Optional


class PriceCache(Document):
    """Price cache document model"""
    symbol: str  # Unique stock symbol
    price: float
    change: float
    change_percent: float
    volume: Optional[int] = None
    market_cap: Optional[float] = None
    pe_ratio: Optional[float] = None
    data: dict = {}  # Additional data from yfinance
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime
    
    class Settings:
        name = "price_cache"
        indexes = ["symbol", "expires_at"]

