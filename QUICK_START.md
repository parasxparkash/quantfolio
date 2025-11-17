# Quick Start Guide

Get QUANTFOLIO up and running in minutes!

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- Python 3.11+
- MongoDB Atlas account (free tier)
- Git

---

## 🚀 Local Development Setup

### 1. Clone & Install

```bash
# Clone repository (or create new)
cd quantfolio

# Install backend dependencies
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster (M0 Sandbox)
3. Create database user
4. Whitelist IP: `0.0.0.0/0` (for development)
5. Get connection string

### 3. Configure Environment Variables

**Backend** (`backend/.env`):
```env
ENV=development
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/quantfolio?retryWrites=true&w=majority
SECRET_KEY=your-secret-key-here-change-in-production
CORS_ORIGINS=["http://localhost:3000"]
DATABASE_NAME=quantfolio
```

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 4. Run Backend

```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
python main.py
```

Backend runs on: `http://localhost:8000`

### 5. Run Frontend

```bash
cd frontend
npm run dev
```

Frontend runs on: `http://localhost:3000`

### 6. Test It!

1. Open `http://localhost:3000`
2. Click "Sign Up"
3. Create an account
4. Login
5. Create a portfolio
6. Add holdings

---

## 🚀 Deployment Setup

### Option 1: Netlify + Render (Recommended)

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

**Quick Steps:**
1. Push code to GitHub
2. Deploy backend on Render
3. Deploy frontend on Netlify
4. Update environment variables

### Option 2: Vercel + Render

Similar to Netlify, but use Vercel instead:
- Deploy frontend on Vercel
- Deploy backend on Render

---

## ✅ Verify Installation

### Backend Health Check
```bash
curl http://localhost:8000/health
```

Expected: `{"status": "healthy"}`

### Test API
```bash
curl http://localhost:8000/
```

Expected: API information JSON

---

## 🐛 Troubleshooting

### Backend Issues

**Import Errors:**
```bash
cd backend
pip install -r requirements.txt
```

**Database Connection Error:**
- Check MongoDB connection string
- Verify IP whitelist includes your IP
- Check credentials

**Port Already in Use:**
```bash
# Change port in backend/main.py or use:
PORT=8001 python main.py
```

### Frontend Issues

**Module Not Found:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**API Connection Error:**
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`
- Check backend is running
- Check CORS settings in backend

**Build Errors:**
```bash
cd frontend
npm run build
# Check for TypeScript errors
```

---

## 📚 Next Steps

1. ✅ Complete setup
2. ✅ Test basic features
3. 📖 Read [ARCHITECTURE.md](./ARCHITECTURE.md) for details
4. 🚀 See [FEATURES.md](./FEATURES.md) for feature roadmap
5. 📦 Deploy using [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 💡 Tips

- Use MongoDB Compass for database management
- Check browser DevTools for API errors
- Check backend logs for debugging
- Use Postman/Insomnia for API testing

---

## 🆘 Need Help?

- Check [ARCHITECTURE.md](./ARCHITECTURE.md) for technical details
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment issues
- Check [FEATURES.md](./FEATURES.md) for feature list

---

**Happy coding! 🚀**

