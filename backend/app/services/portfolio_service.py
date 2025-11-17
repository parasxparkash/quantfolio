"""
Portfolio calculation service using yfinance
Calculates portfolio values, holdings values, and gain/loss
"""

from typing import List, Dict, Optional
from app.models.holding import Holding
from app.models.portfolio import Portfolio
from app.services.market_data_service import MarketDataService


class PortfolioService:
    """Service for calculating portfolio values and performance"""
    
    @staticmethod
    async def calculate_holding_value(holding: Holding) -> Dict:
        """
        Calculate current value and gain/loss for a single holding
        Returns holding data with current price, value, and gain/loss
        """
        try:
            # Fetch current price from yfinance
            quote = await MarketDataService.get_quote(holding.symbol)
            current_price = quote.get('price', 0.0)
            
            # Calculate values
            current_value = current_price * holding.quantity
            total_cost = holding.average_cost * holding.quantity
            gain_loss = current_value - total_cost
            gain_loss_percent = (gain_loss / total_cost * 100) if total_cost > 0 else 0.0
            
            return {
                "id": str(holding.id),
                "symbol": holding.symbol,
                "quantity": holding.quantity,
                "average_cost": holding.average_cost,
                "current_price": current_price,
                "current_value": current_value,
                "total_cost": total_cost,
                "gain_loss": gain_loss,
                "gain_loss_percent": gain_loss_percent,
                "first_purchase_date": holding.first_purchase_date.isoformat(),
                "last_transaction_date": holding.last_transaction_date.isoformat(),
                "price_change": quote.get('change', 0.0),
                "price_change_percent": quote.get('change_percent', 0.0),
                "market_cap": quote.get('market_cap'),
                "pe_ratio": quote.get('pe_ratio'),
                "name": quote.get('name'),
                "currency": quote.get('currency', 'USD'),
            }
        except Exception as e:
            # If price fetch fails, return holding without current price
            total_cost = holding.average_cost * holding.quantity
            return {
                "id": str(holding.id),
                "symbol": holding.symbol,
                "quantity": holding.quantity,
                "average_cost": holding.average_cost,
                "current_price": None,
                "current_value": 0.0,
                "total_cost": total_cost,
                "gain_loss": -total_cost,
                "gain_loss_percent": -100.0,
                "first_purchase_date": holding.first_purchase_date.isoformat(),
                "last_transaction_date": holding.last_transaction_date.isoformat(),
                "error": str(e),
            }
    
    @staticmethod
    async def calculate_holdings_values(holdings: List[Holding]) -> List[Dict]:
        """
        Calculate values for multiple holdings
        """
        results = []
        for holding in holdings:
            holding_data = await PortfolioService.calculate_holding_value(holding)
            results.append(holding_data)
        return results
    
    @staticmethod
    async def calculate_portfolio_totals(holdings: List[Holding]) -> Dict:
        """
        Calculate total portfolio value, cost, and gain/loss
        """
        holdings_data = await PortfolioService.calculate_holdings_values(holdings)
        
        total_value = sum(h.get('current_value', 0.0) for h in holdings_data)
        total_cost = sum(h.get('total_cost', 0.0) for h in holdings_data)
        total_gain_loss = total_value - total_cost
        total_gain_loss_percent = (total_gain_loss / total_cost * 100) if total_cost > 0 else 0.0
        
        # Calculate today's change
        today_change = sum(
            (h.get('price_change', 0.0) * h.get('quantity', 0.0)) 
            for h in holdings_data 
            if h.get('price_change') is not None
        )
        today_change_percent = (today_change / total_value * 100) if total_value > 0 else 0.0
        
        return {
            "total_value": total_value,
            "total_cost": total_cost,
            "total_gain_loss": total_gain_loss,
            "total_gain_loss_percent": total_gain_loss_percent,
            "today_change": today_change,
            "today_change_percent": today_change_percent,
            "holdings_count": len(holdings),
        }
    
    @staticmethod
    async def update_portfolio_values(portfolio: Portfolio) -> Portfolio:
        """
        Update portfolio with calculated values from holdings
        """
        holdings = await Holding.find(Holding.portfolio_id == portfolio.id).to_list()
        totals = await PortfolioService.calculate_portfolio_totals(holdings)
        
        portfolio.total_value = totals['total_value']
        portfolio.total_cost = totals['total_cost']
        await portfolio.save()
        
        return portfolio
    
    @staticmethod
    async def get_portfolio_with_values(portfolio: Portfolio, include_holdings: bool = True) -> Dict:
        """
        Get portfolio with calculated values and optionally holdings with prices
        """
        holdings = await Holding.find(Holding.portfolio_id == portfolio.id).to_list()
        totals = await PortfolioService.calculate_portfolio_totals(holdings)
        
        result = {
            "id": str(portfolio.id),
            "name": portfolio.name,
            "description": portfolio.description,
            "is_public": portfolio.is_public,
            "share_link": portfolio.share_link,
            "total_value": totals['total_value'],
            "total_cost": totals['total_cost'],
            "total_gain_loss": totals['total_gain_loss'],
            "total_gain_loss_percent": totals['total_gain_loss_percent'],
            "today_change": totals['today_change'],
            "today_change_percent": totals['today_change_percent'],
            "holdings_count": totals['holdings_count'],
            "created_at": portfolio.created_at.isoformat(),
            "updated_at": portfolio.updated_at.isoformat(),
        }
        
        if include_holdings:
            holdings_data = await PortfolioService.calculate_holdings_values(holdings)
            result["holdings"] = holdings_data
        
        return result

