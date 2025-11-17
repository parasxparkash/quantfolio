"""
Watchlist model
"""

from beanie import Document
from pydantic import Field
from datetime import datetime
from typing import List
from bson import ObjectId


class Watchlist(Document):
    """Watchlist document model"""
    user_id: ObjectId
    name: str
    symbols: List[str] = []  # List of stock symbols
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "watchlists"
        indexes = ["user_id"]

