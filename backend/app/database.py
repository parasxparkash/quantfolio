"""
Database connection and initialization
"""

from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
import os
from app.models.user import User
from app.models.portfolio import Portfolio
from app.models.holding import Holding
from app.models.transaction import Transaction
from app.models.watchlist import Watchlist
from app.models.price_cache import PriceCache
from app.config import settings


class Database:
    client: AsyncIOMotorClient = None


db = Database()


async def get_database():
    """Get database instance"""
    return db.client[settings.DATABASE_NAME]


async def init_db():
    """Initialize database connection"""
    try:
        db.client = AsyncIOMotorClient(settings.MONGODB_URL)
        
        # Initialize Beanie with document models
        await init_beanie(
            database=db.client[settings.DATABASE_NAME],
            document_models=[
                User,
                Portfolio,
                Holding,
                Transaction,
                Watchlist,
                PriceCache,
            ]
        )
        print("✅ Database connected successfully")
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        raise


async def close_db():
    """Close database connection"""
    if db.client:
        db.client.close()
        print("Database connection closed")

