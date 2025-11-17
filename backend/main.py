"""
QUANTFOLIO Backend API
FastAPI application for portfolio tracking with yfinance integration
"""

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import uvicorn
from dotenv import load_dotenv
import os

from app.routers import auth, portfolios, holdings, transactions, watchlist, market_data
from app.database import init_db
from app.config import settings
from app.models.price_cache import PriceCache
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="QUANTFOLIO API",
    description="Portfolio tracking API with real-time market data",
    version="1.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(portfolios.router, prefix="/api/portfolios", tags=["Portfolios"])
app.include_router(holdings.router, prefix="/api/holdings", tags=["Holdings"])
app.include_router(transactions.router, prefix="/api/transactions", tags=["Transactions"])
app.include_router(watchlist.router, prefix="/api/watchlist", tags=["Watchlist"])
app.include_router(market_data.router, prefix="/api/market", tags=["Market Data"])


@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    await init_db()
    
    # Clean up expired cache entries on startup
    try:
        deleted = await PriceCache.cleanup_expired()
        print(f"🧹 Cleaned up {deleted} expired cache entries on startup")
    except Exception as e:
        print(f"⚠️  Cache cleanup on startup failed: {e}")
    
    # Setup periodic cache cleanup if enabled
    if settings.ENABLE_SCHEDULER:
        scheduler = AsyncIOScheduler()
        # Clean up expired cache every hour
        scheduler.add_job(
            PriceCache.cleanup_expired,
            trigger=IntervalTrigger(hours=1),
            id='cleanup_cache',
            name='Clean up expired price cache entries',
            replace_existing=True
        )
        scheduler.start()
        print("✅ Background scheduler started for cache cleanup")


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "QUANTFOLIO API",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True if os.getenv("ENV") == "development" else False
    )

