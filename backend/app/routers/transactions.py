"""
Transactions routes
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from app.models.transaction import Transaction
from app.models.portfolio import Portfolio
from app.routers.auth import get_current_user
from app.models.user import User

router = APIRouter()


class TransactionCreate(BaseModel):
    portfolio_id: str
    symbol: str
    type: str  # "buy", "sell", "dividend", "split"
    quantity: float
    price: float
    date: datetime
    fees: float = 0.0
    notes: Optional[str] = None


@router.get("/portfolio/{portfolio_id}", response_model=List[dict])
async def get_transactions(
    portfolio_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get all transactions for a portfolio"""
    # Check portfolio access
    try:
        portfolio = await Portfolio.get(portfolio_id)
    except:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    if str(portfolio.user_id) != str(current_user.id) and not portfolio.is_public:
        raise HTTPException(status_code=403, detail="Access denied")
    
    transactions = await Transaction.find(
        Transaction.portfolio_id == portfolio.id
    ).sort(-Transaction.date).to_list()
    
    return [
        {
            "id": str(t.id),
            "symbol": t.symbol,
            "type": t.type,
            "quantity": t.quantity,
            "price": t.price,
            "date": t.date.isoformat(),
            "fees": t.fees,
            "notes": t.notes,
        }
        for t in transactions
    ]


@router.post("", response_model=dict)
async def create_transaction(
    transaction_data: TransactionCreate,
    current_user: User = Depends(get_current_user)
):
    """Create new transaction"""
    # Check portfolio access
    try:
        portfolio = await Portfolio.get(transaction_data.portfolio_id)
    except:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    if str(portfolio.user_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Access denied")
    
    transaction = Transaction(
        portfolio_id=portfolio.id,
        symbol=transaction_data.symbol.upper(),
        type=transaction_data.type,
        quantity=transaction_data.quantity,
        price=transaction_data.price,
        date=transaction_data.date,
        fees=transaction_data.fees,
        notes=transaction_data.notes,
    )
    await transaction.create()
    
    # TODO: Update holding based on transaction
    # TODO: Update portfolio totals
    
    return {
        "id": str(transaction.id),
        "symbol": transaction.symbol,
        "type": transaction.type,
        "quantity": transaction.quantity,
        "price": transaction.price,
        "date": transaction.date.isoformat(),
    }


@router.delete("/{transaction_id}")
async def delete_transaction(
    transaction_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete transaction"""
    try:
        transaction = await Transaction.get(transaction_id)
    except:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    # Check portfolio access
    portfolio = await Portfolio.get(transaction.portfolio_id)
    if str(portfolio.user_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Access denied")
    
    await transaction.delete()
    
    return {"message": "Transaction deleted successfully"}

