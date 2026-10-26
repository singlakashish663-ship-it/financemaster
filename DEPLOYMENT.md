# FinanceQuest Deployment Guide

## Frontend (Vercel) ✅ DEPLOYED
- **Live URL:** https://client-taupe-five-76.vercel.app
- **Status:** Already deployed and connected to GitHub
- **Auto-deploys:** Every push to main branch

## Backend (Render) - Deploy Instructions

### Option 1: Deploy via Render Dashboard (Recommended)

1. **Go to [Render Dashboard](https://dashboard.render.com)**
   - Sign up/login with GitHub

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository: `financemaster`
   - Select the repository

3. **Configure Service**
   - **Name:** `financequest-api`
   - **Region:** Oregon (US West)
   - **Branch:** `main`
   - **Root Directory:** `server`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free

4. **Add Environment Variables**
   Required:
   - `NODE_ENV` = `production`
   - `PORT` = `10000` (Render default)
   - `CLIENT_URL` = `https://client-taupe-five-76.vercel.app`
   - `MONGODB_URI` = Your MongoDB Atlas connection string (see below)
   
   Firebase (Optional - for auth):
   - `FIREBASE_PROJECT_ID` = `financemaster-3713b`
   - `FIREBASE_CLIENT_EMAIL` = (from Firebase service account)
   - `FIREBASE_PRIVATE_KEY` = (from Firebase service account)
   
   Auto-generated (Render will create):
   - `SESSION_SECRET` = (click "Generate")
   - `JWT_SECRET` = (click "Generate")

5. **Click "Create Web Service"**
   - Render will build and deploy automatically
   - First deployment takes ~5-10 minutes

### Option 2: Deploy via Render Blueprint (Faster)

```bash
# Push render.yaml to your repo
git add render.yaml DEPLOYMENT.md
git commit -m "Add Render deployment config"
git push origin main

# Then in Render Dashboard:
# New + → Blueprint → Connect your repo → Deploy
```

## MongoDB Setup (Required for Backend)

1. **Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)**
2. Create free cluster (M0 - Free tier)
3. Create database user with password
4. Add IP: `0.0.0.0/0` (allow from anywhere) under Network Access
5. Get connection string:
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database password
6. Add to Render environment variables as `MONGODB_URI`

Example: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/financequest?retryWrites=true&w=majority`

## Update Frontend to Use Backend API

Once backend is deployed, update Vercel environment variable:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your `client` project
3. Go to **Settings** → **Environment Variables**
4. Update `VITE_API_BASE_URL` to your Render URL:
   - Value: `https://financequest-api.onrender.com/api/v1`
5. Redeploy frontend (automatic or manual)

## Post-Deployment Checklist

- [ ] Backend deployed on Render
- [ ] MongoDB Atlas connected
- [ ] Frontend environment variable updated
- [ ] Test authentication (login/register)
- [ ] Test API endpoints (check browser console)
- [ ] Verify CORS settings

## URLs After Full Deployment

- Frontend: https://client-taupe-five-76.vercel.app
- Backend API: https://financequest-api.onrender.com
- Health Check: https://financequest-api.onrender.com/health

## Free Tier Limitations

**Render Free Tier:**
- Spins down after 15 minutes of inactivity
- First request after sleep takes ~30-60 seconds
- 750 hours/month (enough for continuous running)

**MongoDB Atlas Free Tier:**
- 512MB storage
- Shared RAM
- Perfect for development/testing

## Troubleshooting

**Backend not responding:**
- Check Render logs: Dashboard → Your Service → Logs
- Verify MongoDB connection string
- Ensure CORS is configured for your frontend URL

**Authentication failing:**
- Verify Firebase credentials in Render
- Check CLIENT_URL matches your Vercel URL
- Review browser console for errors

**Need help?**
- Render Docs: https://render.com/docs
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com
