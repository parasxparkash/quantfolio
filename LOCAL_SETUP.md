# Local Development Setup Guide

This guide will help you run QUANTFOLIO on your local machine.

## ✅ Prerequisites Check

- ✅ Python 3.14.0 installed
- ✅ Node.js v22.20.0 installed
- ✅ Backend dependencies installed
- ✅ Frontend dependencies installed

## 📝 Step 1: Configure MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster (M0 Sandbox)
3. Create a database user (username and password)
4. Whitelist IP addresses: Click "Add IP Address" → "Allow Access from Anywhere" (0.0.0.0/0)
5. Get your connection string:
   - Click "Connect" → "Connect your application"
   - Copy the connection string (it looks like: `mongodb+srv://username:password@cluster.mongodb.net/quantfolio?retryWrites=true&w=majority`)
   - Replace `<password>` with your actual password

## 🔧 Step 2: Configure Backend Environment

1. Navigate to the backend directory:
   ```powershell
   cd backend
   ```

2. Create a `.env` file (copy from example if it exists, or create new):
   ```powershell
   # Create .env file
   New-Item -Path .env -ItemType File
   ```

3. Add the following content to `backend/.env`:
   ```env
   ENV=development
   MONGODB_URL=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/quantfolio?retryWrites=true&w=majority
   SECRET_KEY=your-secret-key-here-change-in-production-use-random-string
   CORS_ORIGINS=["http://localhost:3000"]
   DATABASE_NAME=quantfolio
   REDIS_ENABLED=False
   ```

   **Important**: Replace:
   - `YOUR_USERNAME` with your MongoDB username
   - `YOUR_PASSWORD` with your MongoDB password
   - `YOUR_CLUSTER` with your cluster name
   - `your-secret-key-here-change-in-production-use-random-string` with a random secret key (you can generate one online)

## 🌐 Step 3: Configure Frontend Environment

1. Navigate to the frontend directory:
   ```powershell
   cd frontend
   ```

2. Create a `.env.local` file:
   ```powershell
   # Create .env.local file
   New-Item -Path .env.local -ItemType File
   ```

3. Add the following content to `frontend/.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

## 🚀 Step 4: Run the Application

### Terminal 1: Start Backend

```powershell
cd backend
.\venv\Scripts\Activate.ps1
python main.py
```

The backend will start on: `http://localhost:8000`

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
```

### Terminal 2: Start Frontend

Open a new terminal/PowerShell window:

```powershell
cd frontend
npm run dev
```

The frontend will start on: `http://localhost:3000`

You should see:
```
  ▲ Next.js 14.0.4
  - Local:        http://localhost:3000
```

## ✅ Step 5: Verify Everything Works

1. **Backend Health Check:**
   - Open browser: `http://localhost:8000/health`
   - Should return: `{"status": "healthy"}`

2. **API Documentation:**
   - Open browser: `http://localhost:8000/docs`
   - You should see FastAPI Swagger documentation

3. **Frontend:**
   - Open browser: `http://localhost:3000`
   - You should see the QUANTFOLIO homepage

4. **Test Registration:**
   - Click "Sign Up"
   - Create an account
   - Login
   - Create a portfolio
   - Add holdings

## 🐛 Troubleshooting

### Backend Issues

**Port Already in Use:**
- If port 8000 is busy, change it in `backend/main.py` or set `PORT` environment variable

**MongoDB Connection Error:**
- Verify your connection string is correct
- Check that your IP is whitelisted in MongoDB Atlas
- Ensure your password doesn't have special characters (or URL-encode them)

**Import Errors:**
```powershell
cd backend
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### Frontend Issues

**API Connection Error:**
- Verify `NEXT_PUBLIC_API_URL` in `frontend/.env.local` is `http://localhost:8000`
- Ensure backend is running
- Check browser console for CORS errors

**Module Not Found:**
```powershell
cd frontend
rm -r node_modules
npm install
```

## 📚 Next Steps

- Read [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture
- Read [FEATURES.md](./FEATURES.md) for feature list
- Read [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment instructions

## 💡 Tips

- Keep both terminals open while developing
- Backend auto-reloads on code changes
- Frontend hot-reloads on code changes
- Check browser DevTools console for frontend errors
- Check backend terminal for API errors

Happy coding! 🚀

