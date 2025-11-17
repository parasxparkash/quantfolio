"""
Holdings routes
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from app.models.holding import Holding
from app.models.portfolio import Portfolio
from app.routers.auth import get_current_user, get_current_user_optional
from app.models.user import User
from app.services.portfolio_service import PortfolioService
from typing import Optional

router = APIRouter()


class HoldingCreate(BaseModel):
    portfolio_id: str
    symbol: str
    quantity: float
    average_cost: float
    first_purchase_date: Optional[datetime] = None


class HoldingUpdate(BaseModel):
    quantity: Optional[float] = None
    average_cost: Optional[float] = None


@router.get("/portfolio/{portfolio_id}", response_model=List[dict])
async def get_holdings(
    portfolio_id: str,
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Get all holdings for a portfolio with real-time prices and gain/loss (public portfolios accessible without auth)"""
    # Check portfolio access
    try:
        portfolio = await Portfolio.get(portfolio_id)
    except:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    # Check access - allow if public or if user owns it
    if current_user is None:
        # Unauthenticated users can only access public portfolios
        if not portfolio.is_public:
            raise HTTPException(status_code=403, detail="Please sign in to view this portfolio")
    else:
        # Authenticated users can access their own portfolios or public ones
        if str(portfolio.user_id) != str(current_user.id) and not portfolio.is_public:
            raise HTTPException(status_code=403, detail="Access denied")
    
    holdings = await Holding.find(Holding.portfolio_id == portfolio.id).to_list()
    
    # Calculate values with current prices from yfinance
    holdings_data = await PortfolioService.calculate_holdings_values(holdings)
    
    return holdings_data


@router.post("", response_model=dict)
async def create_holding(
    holding_data: HoldingCreate,
    current_user: User = Depends(get_current_user)
):
    """Create new holding"""
    # Check portfolio access
    try:
        portfolio = await Portfolio.get(holding_data.portfolio_id)
    except:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    if str(portfolio.user_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Check if holding exists
    existing = await Holding.find_one(
        Holding.portfolio_id == portfolio.id,
        Holding.symbol == holding_data.symbol.upper()
    )
    
    if existing:
        raise HTTPException(status_code=400, detail="Holding already exists")
    
    holding = Holding(
        portfolio_id=portfolio.id,
        symbol=holding_data.symbol.upper(),
        quantity=holding_data.quantity,
        average_cost=holding_data.average_cost,
        first_purchase_date=holding_data.first_purchase_date or datetime.utcnow(),
    )
    await holding.create()
    
    # Return holding with calculated values including current price
    holding_data = await PortfolioService.calculate_holding_value(holding)
    return holding_data


@router.put("/{holding_id}", response_model=dict)
async def update_holding(
    holding_id: str,
    holding_data: HoldingUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update holding"""
    try:
        holding = await Holding.get(holding_id)
    except:
        raise HTTPException(status_code=404, detail="Holding not found")
    
    # Check portfolio access
    portfolio = await Portfolio.get(holding.portfolio_id)
    if str(portfolio.user_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Access denied")
    
    if holding_data.quantity is not None:
        holding.quantity = holding_data.quantity
    if holding_data.average_cost is not None:
        holding.average_cost = holding_data.average_cost
    
    holding.last_transaction_date = datetime.utcnow()
    await holding.save()
    
    # Return holding with calculated values including current price
    holding_data = await PortfolioService.calculate_holding_value(holding)
    return holding_data


@router.delete("/{holding_id}")
async def delete_holding(
    holding_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete holding"""
    try:
        holding = await Holding.get(holding_id)
    except:
        raise HTTPException(status_code=404, detail="Holding not found")
    
    # Check portfolio access
    portfolio = await Portfolio.get(holding.portfolio_id)
    if str(portfolio.user_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Access denied")
    
    await holding.delete()
    
    return {"message": "Holding deleted successfully"}

