# TestFol.io - Portfolio Tracker Architecture & Features

## 🎯 Project Overview

A real-time portfolio tracking application that allows users to manage their investment portfolios with live stock data fetched from Yahoo Finance using yfinance.

---

## 📋 Complete Feature List

### Core Features

#### 1. User Authentication & Authorization
- User registration with email verification
- Login/Logout functionality
- Password reset/recovery
- Session management (JWT tokens)
- Social authentication (Google, GitHub) - Optional
- Two-factor authentication (2FA) - Optional

#### 2. Portfolio Management
- Create multiple portfolios
- Edit portfolio name and description
- Delete portfolios
- Set portfolio as public/private
- Portfolio sharing with unique links
- Copy/duplicate portfolios

#### 3. Asset Management
- Add stocks, ETFs, crypto, forex, commodities
- Add with quantity, purchase price, purchase date
- Edit holdings (quantity, average cost)
- Remove assets from portfolio
- Search assets by symbol or name
- Auto-complete asset suggestions

#### 4. Real-Time Data & Market Information
- Live stock prices (delayed or real-time based on tier)
- Historical price data
- Market hours indicator
- Price change indicators (gain/loss)
- Volume and market cap data
- 52-week high/low

#### 5. Analytics & Performance Tracking
- Total portfolio value
- Daily/weekly/monthly/yearly returns
- Percentage gain/loss per asset
- Total gain/loss (realized + unrealized)
- Portfolio allocation by sector/asset type
- Performance charts (line, candlestick, area)
- Benchmark comparison (S&P 500, NASDAQ, etc.)

#### 6. Dashboard Features
- Portfolio summary cards
- Top gainers/losers
- Recent transactions/activity log
- Quick stats (total value, today's change, etc.)
- Market overview widgets
- News feed related to holdings

#### 7. Transaction History
- Manual transaction entry
- Transaction types: Buy, Sell, Dividend, Split
- Transaction history view
- Export transactions (CSV, PDF)
- Transaction filters and search

#### 8. Watchlist
- Create multiple watchlists
- Add/remove symbols from watchlist
- Real-time price updates
- Price alerts (above/below threshold)
- Email/SMS notifications (optional)

#### 9. Reports & Insights
- Portfolio performance report
- Tax reporting (realized gains/losses)
- Asset allocation pie charts
- Sector diversification analysis
- Risk metrics (beta, volatility)
- Export reports (PDF, CSV)

#### 10. News & Research
- News related to portfolio holdings
- Company financials (P/E, EPS, etc.)
- Analyst ratings
- Earnings calendar
- Financial statements summary

#### 11. Alerts & Notifications
- Price alerts (push notifications)
- Portfolio value change alerts
- News alerts for holdings
- Earnings announcements
- Email digest (daily/weekly)

#### 12. Settings & Preferences
- User profile management
- Currency preferences
- Display preferences (dark/light mode)
- Notification settings
- Data export/import
- Account deletion

---

## 🏗️ Technical Architecture

### Recommended Stack (Free Tier Optimized)

#### **Option 1: Next.js + Python (Recommended)**
```
Frontend: Next.js 14 (React framework)
  - Hosting: Netlify or Vercel (Free tier: 100GB bandwidth, unlimited sites)
  - Features: SSR, ISR, API routes for proxy
  - State: React Context API or Zustand

Backend: Flask/FastAPI (Python)
  - Hosting: Render (Free tier: 750 hours/month, spins down after inactivity)
  - Python 3.11+
  - yfinance integration for real-time data
  - RESTful API

Database: 
  - MongoDB Atlas (Free tier: 512MB storage, shared cluster)
  - OR PostgreSQL on Render (Free tier: 90 days, then $7/month)
  - Redis for caching (Upstash free tier: 10K requests/day)

Data Fetching:
  - yfinance (Python library for Yahoo Finance)
  - Caching layer for rate limiting
  - Background jobs for data refresh
```

#### **Option 2: Next.js + Node.js (Alternative)**
```
Frontend: Next.js 14
  - Hosting: Netlify/Vercel

Backend: Node.js + Express
  - Hosting: Render
  - Use node-yahoo-finance2 or yahoo-finance npm package
  - Note: Less mature than yfinance Python library

Database: MongoDB Atlas
Cache: Upstash Redis
```

#### **Option 3: All-in-One Next.js (Simplest)**
```
Frontend + Backend: Next.js 14 (API routes)
  - Hosting: Vercel (Free tier: Serverless functions)
  - Python serverless functions for yfinance
  - Edge functions for caching

Database: 
  - MongoDB Atlas or 
  - Supabase (PostgreSQL, free tier: 500MB, 2GB bandwidth)
```

### **Recommended: Option 1 (Next.js + Flask/FastAPI)**

**Why?**
- yfinance is native Python, more reliable
- Better error handling and community support
- Separation of concerns (frontend/backend)
- Easier to scale independently
- Render free tier sufficient for MVP

---

## 📊 Database Schema

### Collections/Tables

#### **Users Collection**
```json
{
  "_id": "ObjectId",
  "email": "string (unique)",
  "password_hash": "string",
  "username": "string",
  "created_at": "datetime",
  "updated_at": "datetime",
  "email_verified": "boolean",
  "preferences": {
    "currency": "USD",
    "theme": "light|dark",
    "notifications": "boolean"
  }
}
```

#### **Portfolios Collection**
```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId (ref: Users)",
  "name": "string",
  "description": "string",
  "is_public": "boolean",
  "created_at": "datetime",
  "updated_at": "datetime",
  "total_value": "number",
  "total_cost": "number"
}
```

#### **Holdings Collection**
```json
{
  "_id": "ObjectId",
  "portfolio_id": "ObjectId (ref: Portfolios)",
  "symbol": "string (e.g., AAPL)",
  "quantity": "number",
  "average_cost": "number",
  "first_purchase_date": "datetime",
  "last_transaction_date": "datetime"
}
```

#### **Transactions Collection**
```json
{
  "_id": "ObjectId",
  "portfolio_id": "ObjectId",
  "symbol": "string",
  "type": "buy|sell|dividend|split",
  "quantity": "number",
  "price": "number",
  "date": "datetime",
  "fees": "number",
  "notes": "string"
}
```

#### **Watchlists Collection**
```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "name": "string",
  "symbols": ["string"],
  "created_at": "datetime"
}
```

#### **Price Cache Collection**
```json
{
  "_id": "ObjectId",
  "symbol": "string (unique)",
  "price": "number",
  "change": "number",
  "change_percent": "number",
  "volume": "number",
  "updated_at": "datetime",
  "expires_at": "datetime"
}
```

---

## 🔄 Data Flow Architecture

```
User Browser
    ↓
Next.js Frontend (Netlify/Vercel)
    ↓
API Request
    ↓
Flask/FastAPI Backend (Render)
    ↓
[Check Redis Cache] → [If miss: yfinance API] → [Store in cache]
    ↓
[MongoDB Query] → [Combine data]
    ↓
Return JSON Response
    ↓
Frontend renders with React
```

### Background Jobs (Cron/Scheduled Tasks)
- **Price Updates**: Every 5-15 minutes during market hours
- **News Updates**: Every hour
- **Cleanup**: Daily cache cleanup

---

## 🗂️ Page-by-Page Features

### 1. **Landing Page** (`/`)
- Hero section with value proposition
- Feature highlights
- Demo screenshot/video
- Pricing (if applicable) - free tier emphasis
- Sign up / Login CTAs
- Testimonials (optional)

### 2. **Sign Up Page** (`/signup`)
- Email registration form
- Password strength indicator
- Terms of service checkbox
- Email verification prompt
- Social login options (optional)
- Link to login page

### 3. **Login Page** (`/login`)
- Email/password login
- "Forgot password" link
- "Remember me" checkbox
- Social login options
- Link to signup page

### 4. **Dashboard** (`/dashboard`)
- **Portfolio Summary Cards**:
  - Total portfolio value
  - Today's gain/loss (absolute and %)
  - Total gain/loss
  - Number of holdings
- **Portfolio List** (quick view)
- **Top Gainers/Losers Widget**
- **Market Overview** (S&P 500, NASDAQ, DOW)
- **Recent Activity Feed**
- **Quick Actions**: Add portfolio, Add holding

### 5. **Portfolios Page** (`/portfolios`)
- List of all user portfolios
- Create new portfolio button
- Portfolio cards showing:
  - Name, total value, gain/loss
  - Number of holdings
  - Performance chart thumbnail
- Edit/Delete portfolio actions
- Search/filter portfolios

### 6. **Portfolio Detail Page** (`/portfolios/[id]`)
- **Portfolio Header**:
  - Name, description
  - Total value, cost basis, gain/loss
  - Performance chart (1D, 1W, 1M, 3M, 1Y, ALL)
- **Holdings Table**:
  - Symbol, quantity, avg cost
  - Current price, current value
  - Gain/loss (absolute and %)
  - Allocation %
  - Actions: Edit, Remove
- **Asset Allocation Pie Chart**
- **Add Holding Button**
- **Transactions Tab**
- **Performance Metrics Tab**

### 7. **Add/Edit Holding** (`/portfolios/[id]/add-holding`)
- Symbol search with autocomplete
- Quantity input
- Purchase price (optional, auto-filled)
- Purchase date (optional)
- Save/Cancel buttons

### 8. **Asset Detail Page** (`/asset/[symbol]`)
- **Stock Information**:
  - Current price, change %
  - Market cap, volume, P/E ratio
  - 52-week high/low
- **Interactive Chart** (1D, 5D, 1M, 3M, 1Y, 5Y, MAX)
- **Company Info** (description)
- **Financials Tab**:
  - Key metrics (EPS, Revenue, etc.)
- **News Tab**:
  - Recent news articles
- **Add to Watchlist** button
- **Add to Portfolio** quick action

### 9. **Watchlist Page** (`/watchlist`)
- List of watchlists
- Create new watchlist
- Watchlist cards:
  - Symbol, current price, change %
  - Price alerts indicator
- Add symbol to watchlist
- Remove symbols

### 10. **Transactions Page** (`/portfolios/[id]/transactions`)
- **Transactions Table**:
  - Date, type, symbol, quantity, price
  - Total value, fees
  - Actions: Edit, Delete
- **Add Transaction Button**
- **Filters**: By symbol, date range, type
- **Export CSV** button
- **Summary Stats**: Total invested, realized gains

### 11. **Reports Page** (`/reports`)
- **Performance Report**:
  - Portfolio performance over time
  - Comparison with benchmarks
  - Export PDF
- **Tax Report**:
  - Realized gains/losses
  - By year
  - Export for tax software
- **Allocation Report**:
  - By sector, asset type
  - Diversification metrics

### 12. **Settings Page** (`/settings`)
- **Profile Tab**:
  - Username, email
  - Change password
  - Delete account
- **Preferences Tab**:
  - Currency selection
  - Theme (light/dark)
  - Date format
  - Number format
- **Notifications Tab**:
  - Email notifications toggle
  - Price alert preferences
- **Data Tab**:
  - Export all data (JSON, CSV)
  - Import data
- **API Keys Tab** (if applicable)

### 13. **Public Portfolio View** (`/p/[share-link]`)
- Read-only view of shared portfolio
- Same visualization as detail page
- No edit capabilities
- Share button

---

## 🚀 Deployment Architecture

### Frontend: Netlify/Vercel
```
Repository (GitHub/GitLab)
    ↓
Netlify/Vercel (Auto-deploy on push)
    ↓
CDN Distribution
    ↓
Users
```

**Netlify Free Tier:**
- 100GB bandwidth/month
- 300 build minutes/month
- Unlimited sites
- Form handling (100 submissions/month)
- Serverless functions (125K invocations/month)

**Vercel Free Tier:**
- 100GB bandwidth/month
- 100 build hours/month
- Serverless functions (100GB-hours/month)

### Backend: Render
```
Repository (GitHub)
    ↓
Render (Auto-deploy on push)
    ↓
Web Service (spins down after inactivity on free tier)
    ↓
Database (MongoDB Atlas/PostgreSQL)
```

**Render Free Tier:**
- 750 hours/month (enough for 24/7)
- Spins down after 15 min inactivity
- 100GB bandwidth/month
- SSL certificates included
- Auto-deploy from Git

**Limitations:**
- Cold starts (~30-60s after spin-down)
- For production, consider paid tier ($7/month)

---

## 🔧 Technology Stack Details

### Frontend Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui or Chakra UI
- **Charts**: Recharts or Chart.js
- **Forms**: React Hook Form
- **State Management**: Zustand or React Context
- **HTTP Client**: Axios or Fetch API
- **Date Handling**: date-fns
- **Icons**: Lucide React

### Backend Stack
- **Framework**: FastAPI (recommended) or Flask
- **Language**: Python 3.11+
- **ORM**: SQLAlchemy (if PostgreSQL) or Motor (if MongoDB)
- **Data Library**: yfinance
- **Authentication**: JWT (python-jose, passlib)
- **Validation**: Pydantic
- **Task Queue**: APScheduler (for cron jobs)
- **HTTP Client**: requests or httpx
- **Caching**: redis-py (Upstash Redis)

### Database
- **Primary**: MongoDB Atlas or PostgreSQL
- **Cache**: Upstash Redis (free tier)

### DevOps
- **Version Control**: GitHub
- **CI/CD**: GitHub Actions (free)
- **Monitoring**: Sentry (free tier) or Render logs
- **Environment**: dotenv for config

---

## 📦 Free Tier Limits & Considerations

### Netlify Free Tier
- ✅ 100GB bandwidth/month (sufficient for MVP)
- ✅ 300 build minutes/month
- ⚠️ Serverless functions: 125K invocations/month
- ⚠️ Forms: 100 submissions/month

### Render Free Tier
- ✅ 750 hours/month (24/7 coverage)
- ⚠️ Spins down after 15 min inactivity (cold starts)
- ✅ 100GB bandwidth/month
- ⚠️ Consider paid tier ($7/month) for production

### MongoDB Atlas Free Tier
- ✅ 512MB storage (sufficient for ~10K users)
- ✅ Shared cluster (no dedicated resources)
- ⚠️ Limited to single region

### Upstash Redis Free Tier
- ✅ 10K commands/day
- ✅ 256MB storage
- ⚠️ Consider caching strategy to stay within limits

---

## 🎨 Alternative Architectures

### Alternative 1: Vercel + Serverless Functions
- **Pros**: No backend server needed, zero cold starts on edge
- **Cons**: yfinance requires Python, Vercel supports Python functions but limited
- **Best for**: Simpler deployments

### Alternative 2: Supabase + Next.js
- **Frontend**: Next.js on Vercel
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Data Fetching**: Edge Functions or separate Python service
- **Pros**: Includes auth, real-time, storage
- **Cons**: Less control, Python integration needs separate service

### Alternative 3: Railway (All-in-One)
- **Frontend + Backend**: Railway platform
- **Free Tier**: $5 credit/month
- **Pros**: Easy deployment, Docker support
- **Cons**: Not completely free after credits

### Alternative 4: Firebase + Cloud Functions
- **Frontend**: Next.js on Vercel
- **Backend**: Firebase Cloud Functions (Node.js/Python)
- **Database**: Firestore
- **Pros**: Great free tier, real-time capabilities
- **Cons**: Vendor lock-in, pricing can scale up

---

## 🔐 Security Considerations

1. **Authentication**: JWT tokens with refresh tokens
2. **API Security**: Rate limiting, CORS configuration
3. **Data Validation**: Input validation on frontend and backend
4. **HTTPS**: Enforced via hosting providers
5. **Environment Variables**: Store secrets securely
6. **SQL Injection**: Use ORM/parameterized queries
7. **XSS Protection**: Sanitize user inputs
8. **CSRF Protection**: Use CSRF tokens

---

## 📈 Scalability Plan

### Phase 1: MVP (Free Tier)
- 100-1000 users
- Basic features
- Manual scaling

### Phase 2: Growth (Paid Tier)
- 1000-10000 users
- Background job queue (Celery)
- CDN optimization
- Database indexes

### Phase 3: Scale (Production)
- 10000+ users
- Load balancing
- Database sharding
- Microservices architecture

---

## ✅ Feasibility Assessment

### **Is this feasible with free tier?**

**YES**, with caveats:

✅ **Feasible:**
- Core portfolio tracking features
- Real-time data with yfinance
- User authentication and portfolios
- Basic analytics and charts
- 100-1000 active users/month

⚠️ **Limitations:**
- Cold starts on Render (15-60s after inactivity)
- Rate limits on free tiers
- Limited storage (512MB MongoDB)
- 100GB bandwidth/month may be limiting with high traffic

🎯 **Recommendation:**
- Start with free tier for MVP
- Monitor usage and upgrade when needed
- Render paid tier ($7/month) eliminates cold starts
- Consider MongoDB paid tier ($9/month) for production

---

## 🚀 Getting Started Plan

1. **Set up repositories** (frontend + backend)
2. **Configure MongoDB Atlas** (free tier)
3. **Set up Render backend** (Python Flask/FastAPI)
4. **Set up Netlify frontend** (Next.js)
5. **Integrate yfinance** for data fetching
6. **Implement authentication**
7. **Build core features** (portfolios, holdings)
8. **Add real-time updates**
9. **Deploy and test**
10. **Iterate based on feedback**

---

## 📝 Next Steps

See project structure in `/frontend` and `/backend` directories for implementation details.

