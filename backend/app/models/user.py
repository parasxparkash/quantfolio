"""
User model
"""

from beanie import Document
from pydantic import EmailStr, Field
from datetime import datetime
from typing import Optional, Dict


class UserPreferences(Document):
    """User preferences"""
    currency: str = "USD"
    theme: str = "light"  # light | dark
    notifications: bool = True


class User(Document):
    """User document model"""
    email: EmailStr
    password_hash: str
    username: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    email_verified: bool = False
    preferences: Dict = {
        "currency": "USD",
        "theme": "light",
        "notifications": True
    }
    
    class Settings:
        name = "users"
        indexes = ["email"]  # Unique index on email

