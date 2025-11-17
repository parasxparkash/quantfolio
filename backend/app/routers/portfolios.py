"""
Portfolio routes
"""

from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Optional
from bson import ObjectId
from pydantic import BaseModel
from datetime import datetime
import secrets

from app.models.portfolio import Portfolio
from app.models.holding import Holding
from app.routers.auth import get_current_user
from app.models.user import User

router = APIRouter()


class PortfolioCreate(BaseModel):
    name: str
    description: Optional[str] = None
    is_public: bool = False


class PortfolioUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_public: Optional[bool] = None


@router.get("", response_model=List[dict])
async def get_portfolios(current_user: User = Depends(get_current_user)):
    """Get all portfolios for current user"""
    portfolios = await Portfolio.find(Portfolio.user_id == current_user.id).to_list()
    return [
        {
            "id": str(p.id),
            "name": p.name,
            "description": p.description,
            "is_public": p.is_public,
            "total_value": p.total_value,
            "total_cost": p.total_cost,
            "created_at": p.created_at.isoformat(),
        }
        for p in portfolios
    ]


@router.post("", response_model=dict)
async def create_portfolio(
    portfolio_data: PortfolioCreate,
    current_user: User = Depends(get_current_user)
):
    """Create new portfolio"""
    # Generate unique share link if public
    share_link = None
    if portfolio_data.is_public:
        share_link = secrets.token_urlsafe(16)
    
    portfolio = Portfolio(
        user_id=current_user.id,
        name=portfolio_data.name,
        description=portfolio_data.description,
        is_public=portfolio_data.is_public,
        share_link=share_link,
    )
    await portfolio.create()
    
    return {
        "id": str(portfolio.id),
        "name": portfolio.name,
        "description": portfolio.description,
        "is_public": portfolio.is_public,
        "share_link": portfolio.share_link,
        "total_value": portfolio.total_value,
        "total_cost": portfolio.total_cost,
    }


@router.get("/{portfolio_id}", response_model=dict)
async def get_portfolio(
    portfolio_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get portfolio by ID"""
    try:
        portfolio = await Portfolio.get(portfolio_id)
    except:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    # Check access
    if str(portfolio.user_id) != str(current_user.id) and not portfolio.is_public:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Get holdings
    holdings = await Holding.find(Holding.portfolio_id == portfolio.id).to_list()
    
    return {
        "id": str(portfolio.id),
        "name": portfolio.name,
        "description": portfolio.description,
        "is_public": portfolio.is_public,
        "share_link": portfolio.share_link,
        "total_value": portfolio.total_value,
        "total_cost": portfolio.total_cost,
        "holdings": [
            {
                "id": str(h.id),
                "symbol": h.symbol,
                "quantity": h.quantity,
                "average_cost": h.average_cost,
            }
            for h in holdings
        ],
        "created_at": portfolio.created_at.isoformat(),
    }


@router.put("/{portfolio_id}", response_model=dict)
async def update_portfolio(
    portfolio_id: str,
    portfolio_data: PortfolioUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update portfolio"""
    try:
        portfolio = await Portfolio.get(portfolio_id)
    except:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    # Check ownership
    if str(portfolio.user_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Update fields
    if portfolio_data.name is not None:
        portfolio.name = portfolio_data.name
    if portfolio_data.description is not None:
        portfolio.description = portfolio_data.description
    if portfolio_data.is_public is not None:
        portfolio.is_public = portfolio_data.is_public
        # Generate share link if making public
        if portfolio_data.is_public and not portfolio.share_link:
            portfolio.share_link = secrets.token_urlsafe(16)
    
    portfolio.updated_at = datetime.utcnow()
    await portfolio.save()
    
    return {
        "id": str(portfolio.id),
        "name": portfolio.name,
        "description": portfolio.description,
        "is_public": portfolio.is_public,
        "share_link": portfolio.share_link,
    }


@router.delete("/{portfolio_id}")
async def delete_portfolio(
    portfolio_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete portfolio"""
    try:
        portfolio = await Portfolio.get(portfolio_id)
    except:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    # Check ownership
    if str(portfolio.user_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Delete holdings
    await Holding.find(Holding.portfolio_id == portfolio.id).delete()
    
    # Delete portfolio
    await portfolio.delete()
    
    return {"message": "Portfolio deleted successfully"}

