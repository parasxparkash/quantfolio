# Database Storage Optimization Guide

## Overview

This document explains the optimizations made to minimize database storage usage for the TestFol.io application, specifically designed to work within MongoDB Atlas's 500MB free tier limit.

## Problem

The original implementation stored the entire yfinance `info` dictionary (which can contain 100+ fields and be several KB per symbol) in the `PriceCache` model. This would quickly fill up the 500MB database limit.

## Solution

### 1. Optimized PriceCache Model

**Before:**
- Stored entire `info` dict in `data: dict = {}` field
- Could be 5-10KB+ per symbol
- No automatic cleanup

**After:**
- Only stores essential fields:
  - `symbol`, `price`, `change`, `change_percent`
  - `volume`, `market_cap`, `pe_ratio`
  - `name`, `currency`, `previous_close`
- Removed the large `data` dict field
- Each cache entry is now ~200-500 bytes instead of 5-10KB+
- **Storage reduction: ~95% per cache entry**

### 2. Automatic Cache Cleanup

- **Startup cleanup**: Expired cache entries are deleted when the server starts
- **Periodic cleanup**: Background job runs every hour to delete expired entries
- **Manual cleanup endpoint**: `POST /api/market/cache/cleanup` for manual cleanup

### 3. Cache TTL Optimization

- Increased cache TTL from 60 seconds to 300 seconds (5 minutes)
- Reduces API calls to yfinance while still providing relatively fresh data
- Expired entries are automatically cleaned up, so longer TTL doesn't waste space

## What Data is Stored vs Fetched

### Stored in Database (MongoDB):
- ✅ User accounts and authentication
- ✅ Portfolios (user-created portfolios)
- ✅ Holdings (stocks in portfolios)
- ✅ Transactions (buy/sell history)
- ✅ Watchlists
- ✅ **Price cache** (essential price data only, expires after 5 minutes)

### Fetched On-Demand (from yfinance):
- ❌ Historical price data (fetched when needed, not stored)
- ❌ Full company info dictionary (only essential fields cached)
- ❌ News and financial statements
- ❌ Real-time quotes (cached for 5 minutes, then re-fetched)

## Storage Estimates

### Per User (typical):
- User account: ~1KB
- Portfolios (5 portfolios): ~5KB
- Holdings (50 holdings): ~10KB
- Transactions (100 transactions): ~20KB
- Watchlists: ~2KB
- **Total per user: ~38KB**

### Price Cache:
- Per symbol: ~300 bytes
- 1000 symbols cached: ~300KB
- With 5-minute TTL and hourly cleanup, cache size stays manageable

### Total Capacity:
- 500MB = ~500,000KB
- Can support ~13,000 users with typical usage
- Price cache will auto-clean and stay under ~1MB

## Best Practices

1. **Don't store historical data**: Always fetch from yfinance when needed
2. **Use cache for frequently accessed symbols**: Cache helps reduce API calls
3. **Monitor database size**: Check MongoDB Atlas dashboard regularly
4. **Manual cleanup**: Use `/api/market/cache/cleanup` if needed
5. **Adjust cache TTL**: If you need fresher data, reduce `YFINANCE_CACHE_TTL` in config

## Monitoring

To check database size:
1. Go to MongoDB Atlas dashboard
2. Navigate to your cluster
3. Check "Storage" metrics

To manually trigger cache cleanup:
```bash
curl -X POST http://your-api-url/api/market/cache/cleanup
```

## Future Optimizations

If you approach the 500MB limit:
1. Add database size monitoring alerts
2. Implement more aggressive cache cleanup (e.g., every 30 minutes)
3. Reduce cache TTL if storage is tight
4. Consider archiving old transactions
5. Add indexes to improve query performance (indexes use minimal space)

