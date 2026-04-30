# TaskSphere Deployment Guide

This guide provides step-by-step instructions to deploy TaskSphere to production using:
- **Frontend**: Vercel
- **Backend**: Railway
- **Database**: MongoDB Atlas

## Prerequisites

- Git repository with committed code
- Accounts: [Vercel](https://vercel.com), [Railway](https://railway.app), [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Node.js 18+ installed locally

---

## 1. MongoDB Atlas Setup

### 1.1 Create a MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Click **Sign Up** and create a free account
3. Verify your email address

### 1.2 Create a Cluster

1. Log in to MongoDB Atlas Dashboard
2. Click **Create a Deployment**
3. Choose **Serverless** (free tier, auto-scales)
4. Select your region (closest to your users)
5. Name the cluster: `tasksphere`
6. Click **Create Deployment**

### 1.3 Configure Network Access

1. Go to **Security > Network Access**
2. Click **Add IP Address**
3. Select **Allow Access from Anywhere** (for development; restrict in production)
4. Click **Confirm**

### 1.4 Create a Database User

1. Go to **Security > Database Access**
2. Click **Add New Database User**
3. **Username**: `tasksphere_admin`
4. **Password**: Generate a secure password (save this!)
5. **Built-in Role**: `readWriteAnyDatabase`
6. Click **Add User**

### 1.5 Get Connection String

1. Go back to **Deployments**
2. Click **Connect** on your cluster
3. Choose **Drivers**
4. Copy the connection string:
   ```
   mongodb+srv://tasksphere_admin:<password>@tasksphere.xxxxx.mongodb.net/tasksphere?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your database user password
6. Save this as `MONGO_URI` for later

---

## 2. Backend Deployment (Railway)

### 2.1 Prepare Railway Configuration

Backend already has `railway.json` configured. No additional setup needed.

### 2.2 Deploy to Railway

1. Go to [Railway.app](https://railway.app) and log in
2. Click **New Project**
3. Select **Deploy from GitHub**
4. Authorize Railway to access your GitHub account
5. Select the repository and branch (`main`)
6. Select the `backend` directory as the root
7. Railway will auto-detect Node.js

### 2.3 Configure Environment Variables

After deployment starts:

1. Go to **Project > Environments > Production**
2. Click **Add Variable** and set:
   ```
   MONGO_URI=mongodb+srv://tasksphere_admin:<password>@tasksphere.xxxxx.mongodb.net/tasksphere?retryWrites=true&w=majority
   JWT_SECRET=your-super-secret-key-here-min-32-chars
   PORT=5000
   NODE_ENV=production
   FRONTEND_URL=https://your-vercel-frontend-url.vercel.app
   ```

3. Railway will redeploy automatically with new environment variables

### 2.4 Get Backend URL

1. Go to **Project > Deployments**
2. Under **Railway Provided Domain**, copy the URL (e.g., `https://tasksphere-api.railway.app`)
3. Save this as `BACKEND_URL` for Vercel setup

---

## 3. Frontend Deployment (Vercel)

### 3.1 Prepare Vercel Configuration

Frontend already has `vercel.json` configured.

### 3.2 Deploy to Vercel

1. Go to [Vercel](https://vercel.com) and log in
2. Click **Add New > Project**
3. Select **Import Git Repository**
4. Authorize Vercel to access your GitHub account
5. Select your repository
6. Configure:
   - **Framework Preset**: Vite (auto-detected)
   - **Root Directory**: Select `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 3.3 Configure Environment Variables

Before deploying:

1. Add **Environment Variable**:
   ```
   VITE_API_URL=https://tasksphere-api.railway.app
   ```
   (Use the Railway backend URL from Step 2.4)

2. Click **Deploy**

### 3.4 Monitor Deployment

1. Vercel will build and deploy automatically
2. Once complete, you'll get a URL: `https://tasksphere-xxx.vercel.app`
3. Your app is now live!

---

## 4. Update Production URLs

### 4.1 Update Railway Environment

After Vercel deployment:

1. Go to Railway > Project > Environment
2. Update `FRONTEND_URL`:
   ```
   FRONTEND_URL=https://tasksphere-xxx.vercel.app
   ```
3. Railway will redeploy

### 4.2 Update Frontend

If you made local changes:

1. Push to GitHub:
   ```bash
   git add .
   git commit -m "production deployment"
   git push origin main
   ```
2. Vercel auto-deploys on push

---

## 5. Post-Deployment Testing

### 5.1 Test Frontend

1. Open `https://tasksphere-xxx.vercel.app`
2. Test signup with new account
3. Create project and tasks
4. Verify all features work

### 5.2 Test Backend

1. Open `https://tasksphere-api.railway.app/api/health`
2. Should see: `{"status":"ok"}`

### 5.3 Test API Endpoints

Use Postman or curl:

```bash
# Test signup
curl -X POST https://tasksphere-api.railway.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@prod.com","password":"password123"}'

# Test login
curl -X POST https://tasksphere-api.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@prod.com","password":"password123"}'
```

---

## 6. Troubleshooting

### Frontend shows 404 or blank page

- Verify `VITE_API_URL` points to correct Railway URL
- Check Railway backend is running: `https://tasksphere-api.railway.app/api/health`

### API calls fail with CORS error

- Verify `FRONTEND_URL` in Railway matches deployed Vercel URL
- Check both URLs are in production (not localhost)

### Database connection fails

- Verify `MONGO_URI` is correct (password-encoded special chars)
- Check MongoDB Atlas Network Access includes Railway IP
- MongoDB Atlas: Security > Network Access > allow anywhere (for testing only)

### Railway build fails

- Check `npm start` works locally: `npm run build && npm start`
- Verify `package.json` has correct `start` script
- Check `railway.json` is in backend root directory

### Vercel build fails

- Check `npm run build` works locally in frontend directory
- Verify `package.json` has correct `build` script
- Check `vercel.json` is in frontend root directory

---

## 7. Performance & Security

### Recommended for Production

1. **MongoDB Atlas**:
   - Restrict Network Access to specific IPs (not "anywhere")
   - Enable Encryption at Rest
   - Enable Backup

2. **Railway**:
   - Monitor logs: Railway Dashboard > Logs
   - Set up alerts for failures
   - Scale if needed

3. **Vercel**:
   - Enable Analytics: Project Settings > Analytics
   - Configure custom domain
   - Set up branch deployments for staging

4. **Frontend**:
   - Enable cache for assets (Vercel auto-optimizes)
   - Minify and optimize bundles (Vite does this)

5. **Backend**:
   - Add rate limiting middleware
   - Use HTTPS enforced (Railway/Vercel handle this)
   - Set secure cookies: `httpOnly: true, secure: true`

---

## 8. Monitoring & Logging

### Railway Logs

```bash
railway logs --tail
```

### Vercel Logs

```bash
vercel logs
```

### MongoDB Atlas Logs

1. Project > Activity > View
2. Recent activity shows API calls, deployments, etc.

---

## 9. Rollback & Troubleshooting

### If deployment breaks:

1. **Railway**: 
   - Go to Deployments > select previous working version > click "Redeploy"

2. **Vercel**: 
   - Go to Deployments > select previous working version > click "Redeploy"

3. **MongoDB**: 
   - Data is always available; just reconnect with correct credentials

---

## 10. Next Steps

- Set up custom domains (e.g., tasksphere.com)
- Enable SSL certificates (auto in Railway/Vercel)
- Configure CI/CD for automated testing
- Set up monitoring and error tracking (Sentry, DataDog)
- Implement analytics (Vercel Analytics, Custom dashboards)
