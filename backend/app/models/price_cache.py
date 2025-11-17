"""
Price cache model for storing market data
Optimized to store only essential fields to minimize database storage
"""

from beanie import Document
from pydantic import Field
from datetime import datetime
from typing import Optional


class PriceCache(Document):
    """Price cache document model - stores only essential price data"""
    symbol: str  # Unique stock symbol
    price: float
    change: float
    change_percent: float
    volume: Optional[int] = None
    market_cap: Optional[float] = None
    pe_ratio: Optional[float] = None
    # Essential metadata only (not the entire info dict)
    name: Optional[str] = None  # Company name
    currency: Optional[str] = None  # Currency code
    previous_close: Optional[float] = None  # Previous close price
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime
    
    class Settings:
        name = "price_cache"
        indexes = ["symbol", "expires_at"]
    
    @staticmethod
    async def cleanup_expired():
        """Delete expired cache entries to free up database space"""
        from datetime import datetime
        result = await PriceCache.find(PriceCache.expires_at < datetime.utcnow()).delete()
        return result.deleted_count if hasattr(result, 'deleted_count') else 0

