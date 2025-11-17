"""
Holding model
"""

from beanie import Document
from pydantic import Field
from datetime import datetime
from typing import Optional
from bson import ObjectId


class Holding(Document):
    """Holding document model"""
    portfolio_id: ObjectId
    symbol: str  # e.g., "AAPL"
    quantity: float
    average_cost: float
    first_purchase_date: datetime
    last_transaction_date: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "holdings"
        indexes = ["portfolio_id", "symbol"]

