# 🚀 Vercel Deployment Guide

## Pre-Deployment Checklist
✅ All hardcoded localhost URLs replaced  
✅ Environment configuration ready  
✅ `vercel.json` configured  

---

## Step 1: Push to GitHub

```bash
cd frontend
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

---

## Step 2: Deploy on Vercel

1. Go to **https://vercel.com** and login
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository
4. Configure settings:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

---

## Step 3: Add Environment Variable

In Vercel Project Settings → Environment Variables:

| Name | Value | Environment |
|------|-------|-------------|
| `REACT_APP_API_URL` | `https://ecommerce-backend-de3d.onrender.com` | Production |

> ⚠️ **Important**: Must start with `REACT_APP_` for Create React App

---

## Step 4: Update Backend CORS

Add your Vercel URL to your backend's CORS configuration:

```javascript
// backend/server.js
const allowedOrigins = [
  'http://localhost:3000',
  'https://your-app.vercel.app',      // Add this
  'https://your-domain.com'            // If custom domain
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
```

Then redeploy your backend on Render.

---

## Step 5: Verify Deployment

1. Visit your Vercel URL
2. Open DevTools → Network tab
3. Check API calls go to your Render backend

---

## Quick Reference

| Environment | API URL |
|------------|---------|
| **Local** | `http://localhost:5000` (from `.env.local`) |
| **Production** | Vercel env var `REACT_APP_API_URL` |

---

## Troubleshooting

### Build Fails
```bash
npm run build  # Check errors locally first
```

### API Calls Fail
1. Check env var is set in Vercel
2. Verify CORS allows your Vercel domain
3. Confirm backend is running on Render

### After Code Changes
```bash
git push origin main  # Vercel auto-deploys!
```
