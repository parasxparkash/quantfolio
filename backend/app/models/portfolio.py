"""
Portfolio model
"""

from beanie import Document
from pydantic import Field
from datetime import datetime
from typing import Optional
from bson import ObjectId


class Portfolio(Document):
    """Portfolio document model"""
    user_id: ObjectId
    name: str
    description: Optional[str] = None
    is_public: bool = False
    share_link: Optional[str] = None  # Unique share link
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    total_value: float = 0.0
    total_cost: float = 0.0
    
    class Settings:
        name = "portfolios"
        indexes = ["user_id", "share_link"]

