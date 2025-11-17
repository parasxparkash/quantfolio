# QUANTFOLIO - Portfolio Tracker

A real-time portfolio tracking application with live stock data from Yahoo Finance.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- Python 3.11+
- MongoDB Atlas account (free tier)
- GitHub account for deployment

### Setup Instructions

#### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd quantfolio
```

#### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your MongoDB connection string
python main.py
```

#### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with your API URL
npm run dev
```

## 📁 Project Structure

```
quantfolio/
├── frontend/          # Next.js frontend application
├── backend/           # FastAPI backend application
├── ARCHITECTURE.md    # Detailed architecture documentation
└── README.md          # This file
```

## 🔧 Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: FastAPI (Python), yfinance
- **Database**: MongoDB Atlas
- **Cache**: Upstash Redis
- **Hosting**: Netlify (frontend), Render (backend)

## 📚 Documentation

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture, features, and deployment guides.

## 🚢 Deployment

### Frontend (Netlify)
1. Push to GitHub
2. Connect to Netlify
3. Build command: `cd frontend && npm run build`
4. Publish directory: `frontend/.next`

### Backend (Render)
1. Push to GitHub
2. Create new Web Service on Render
3. Select repository
4. Build command: `cd backend && pip install -r requirements.txt`
5. Start command: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`

## 🔢 Version Management

QUANTFOLIO uses automatic version management. The version automatically increments when you push to a remote repository.

- **Current Version**: See `VERSION` file
- **Setup**: Run `scripts/install_git_hook.ps1` (Windows) or `scripts/install_git_hook.sh` (Linux/Mac)
- **Manual Update**: Run `python scripts/update_version.py`

See [scripts/README.md](./scripts/README.md) for more details.

## 📝 License

MIT

