"""
Watchlist routes
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import List
from pydantic import BaseModel

from app.models.watchlist import Watchlist
from app.routers.auth import get_current_user
from app.models.user import User

router = APIRouter()


class WatchlistCreate(BaseModel):
    name: str


@router.get("", response_model=List[dict])
async def get_watchlists(current_user: User = Depends(get_current_user)):
    """Get all watchlists for current user"""
    watchlists = await Watchlist.find(Watchlist.user_id == current_user.id).to_list()
    return [
        {
            "id": str(w.id),
            "name": w.name,
            "symbols": w.symbols,
        }
        for w in watchlists
    ]


@router.post("", response_model=dict)
async def create_watchlist(
    watchlist_data: WatchlistCreate,
    current_user: User = Depends(get_current_user)
):
    """Create new watchlist"""
    watchlist = Watchlist(
        user_id=current_user.id,
        name=watchlist_data.name,
    )
    await watchlist.create()
    
    return {
        "id": str(watchlist.id),
        "name": watchlist.name,
        "symbols": watchlist.symbols,
    }


@router.post("/{watchlist_id}/symbols")
async def add_symbol(
    watchlist_id: str,
    symbol: str,
    current_user: User = Depends(get_current_user)
):
    """Add symbol to watchlist"""
    try:
        watchlist = await Watchlist.get(watchlist_id)
    except:
        raise HTTPException(status_code=404, detail="Watchlist not found")
    
    if str(watchlist.user_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Access denied")
    
    if symbol.upper() not in watchlist.symbols:
        watchlist.symbols.append(symbol.upper())
        await watchlist.save()
    
    return {"message": "Symbol added successfully"}


@router.delete("/{watchlist_id}/symbols/{symbol}")
async def remove_symbol(
    watchlist_id: str,
    symbol: str,
    current_user: User = Depends(get_current_user)
):
    """Remove symbol from watchlist"""
    try:
        watchlist = await Watchlist.get(watchlist_id)
    except:
        raise HTTPException(status_code=404, detail="Watchlist not found")
    
    if str(watchlist.user_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Access denied")
    
    if symbol.upper() in watchlist.symbols:
        watchlist.symbols.remove(symbol.upper())
        await watchlist.save()
    
    return {"message": "Symbol removed successfully"}


@router.delete("/{watchlist_id}")
async def delete_watchlist(
    watchlist_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete watchlist"""
    try:
        watchlist = await Watchlist.get(watchlist_id)
    except:
        raise HTTPException(status_code=404, detail="Watchlist not found")
    
    if str(watchlist.user_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Access denied")
    
    await watchlist.delete()
    
    return {"message": "Watchlist deleted successfully"}

