# Deployment Guide

This guide covers deploying TestFol.io to free tier services: Netlify (frontend) and Render (backend).

## 📋 Prerequisites

1. GitHub account
2. MongoDB Atlas account (free tier)
3. Netlify account
4. Render account
5. (Optional) Upstash Redis account for caching

---

## 🗄️ Step 1: Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster (M0 Sandbox)
3. Create a database user
4. Whitelist IP addresses (0.0.0.0/0 for development)
5. Get your connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/testfolio?retryWrites=true&w=majority
   ```

---

## 🚀 Step 2: Deploy Backend to Render

### 2.1 Push Code to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2.2 Deploy on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `testfolio-api`
   - **Environment**: `Python 3`
   - **Build Command**: `cd backend && pip install -r requirements.txt`
   - **Start Command**: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`

5. Add Environment Variables:
   ```
   ENV=production
   MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/testfolio?retryWrites=true&w=majority
   SECRET_KEY=<generate-a-random-secret-key>
   CORS_ORIGINS=["https://your-app.netlify.app"]
   DATABASE_NAME=testfolio
   ```

6. Click **Create Web Service**

7. Wait for deployment (first deploy takes ~5 minutes)

8. Copy your Render URL: `https://testfolio-api.onrender.com`

### 2.3 Render Free Tier Limitations
- Spins down after 15 minutes of inactivity
- Cold starts take ~30-60 seconds
- 750 hours/month (enough for 24/7)
- 100GB bandwidth/month

---

## 🌐 Step 3: Deploy Frontend to Netlify

### 3.1 Configure Frontend

1. Update `frontend/.env.production`:
   ```
   NEXT_PUBLIC_API_URL=https://testfolio-api.onrender.com
   ```

2. Push changes to GitHub

### 3.2 Deploy on Netlify

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Click **Add new site** → **Import an existing project**
3. Connect to GitHub and select your repository
4. Configure build settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/.next`

5. Add Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=https://testfolio-api.onrender.com
   ```

6. Click **Deploy site**

7. Wait for deployment (~2-3 minutes)

8. Your site will be live at: `https://random-name.netlify.app`

### 3.3 Custom Domain (Optional)

1. In Netlify dashboard → **Domain settings**
2. Add custom domain
3. Update CORS in Render backend:
   ```
   CORS_ORIGINS=["https://your-custom-domain.com"]
   ```

---

## ✅ Step 4: Verify Deployment

### Backend Health Check
```bash
curl https://your-app.onrender.com/health
```

Expected response:
```json
{"status": "healthy"}
```

### Frontend
- Visit your Netlify URL
- Test registration/login
- Create a portfolio
- Add holdings

---

## 🔧 Troubleshooting

### Backend Issues

**Cold Start Delays**
- Render free tier spins down after inactivity
- First request after spin-down takes 30-60 seconds
- Solution: Upgrade to paid tier ($7/month) for always-on

**Database Connection Errors**
- Check MongoDB Atlas IP whitelist
- Verify connection string
- Check Render logs

**CORS Errors**
- Ensure frontend URL is in `CORS_ORIGINS`
- Check Render environment variables

### Frontend Issues

**API Connection Errors**
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check browser console for errors
- Ensure backend is running

**Build Errors**
- Check Netlify build logs
- Verify Node.js version (18+)
- Check for TypeScript errors

---

## 📊 Monitoring

### Render Logs
- View logs in Render dashboard
- Real-time log streaming available

### Netlify Analytics
- Free tier includes basic analytics
- View in Netlify dashboard → Analytics

---

## 🔒 Security Checklist

- [ ] Change `SECRET_KEY` to random string
- [ ] Use strong MongoDB password
- [ ] Restrict MongoDB IP whitelist in production
- [ ] Enable HTTPS (automatic on Netlify/Render)
- [ ] Set secure CORS origins
- [ ] Use environment variables for secrets

---

## 💰 Cost Estimate (Free Tier)

| Service | Cost | Limitations |
|---------|------|-------------|
| Netlify | $0 | 100GB bandwidth/month |
| Render | $0 | 750 hours/month, spins down |
| MongoDB Atlas | $0 | 512MB storage |
| **Total** | **$0** | Sufficient for MVP |

---

## 🚀 Upgrading to Production

When ready to scale:

1. **Render Paid Tier** ($7/month)
   - Always-on service
   - No cold starts
   - Better performance

2. **MongoDB Atlas Paid Tier** ($9/month)
   - More storage (10GB)
   - Better performance
   - Dedicated resources

3. **Netlify Pro** ($19/month)
   - More bandwidth
   - Advanced features
   - Better support

---

## 📝 Environment Variables Reference

### Backend (Render)
```
ENV=production
MONGODB_URL=mongodb+srv://...
SECRET_KEY=<random-secret>
CORS_ORIGINS=["https://your-app.netlify.app"]
DATABASE_NAME=testfolio
REDIS_URL=redis://... (optional)
REDIS_ENABLED=False
```

### Frontend (Netlify)
```
NEXT_PUBLIC_API_URL=https://your-app.onrender.com
```

---

## 🎯 Next Steps

1. Set up domain name (optional)
2. Configure custom email (optional)
3. Set up monitoring/analytics
4. Implement error tracking (Sentry)
5. Set up CI/CD pipeline
6. Add automated testing

---

For detailed architecture, see [ARCHITECTURE.md](./ARCHITECTURE.md)

