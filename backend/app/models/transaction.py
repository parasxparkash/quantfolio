"""
Transaction model
"""

from beanie import Document
from pydantic import Field
from datetime import datetime
from typing import Optional, Literal
from bson import ObjectId


class Transaction(Document):
    """Transaction document model"""
    portfolio_id: ObjectId
    symbol: str
    type: Literal["buy", "sell", "dividend", "split"]
    quantity: float
    price: float
    date: datetime
    fees: float = 0.0
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "transactions"
        indexes = ["portfolio_id", "symbol", "date"]

