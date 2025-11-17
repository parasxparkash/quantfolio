"""
Application configuration
"""

from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings"""
    
    # App
    APP_NAME: str = "QUANTFOLIO API"
    ENV: str = "development"
    DEBUG: bool = True
    
    # Database
    MONGODB_URL: str = "mongodb+srv://username:password@cluster.mongodb.net/quantfolio?retryWrites=true&w=majority"
    DATABASE_NAME: str = "quantfolio"
    
    # Redis
    REDIS_URL: str = "redis://default:password@redis-host:6379"
    REDIS_ENABLED: bool = True
    CACHE_TTL: int = 300  # 5 minutes
    
    # JWT
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://your-app.netlify.app",
    ]
    
    # yfinance
    YFINANCE_CACHE_TTL: int = 300  # 5 minutes for stock prices (reduced API calls, expired entries auto-cleaned)
    YFINANCE_MAX_RETRIES: int = 3
    
    # Background Jobs
    ENABLE_SCHEDULER: bool = True
    PRICE_UPDATE_INTERVAL: int = 300  # 5 minutes
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

