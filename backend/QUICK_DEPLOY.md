# Quick Deploy Reference 🚀

**One-page deployment guide for CureQueue Backend**

## ⚡ Pre-Deployment Check

```bash
cd backend
npm install
npm start
# Verify: http://localhost:5000/ shows "CureQueue Backend Running"
```

## 🎯 Deploy to Render (Recommended)

1. Go to [render.com](https://render.com) → **New** → **Web Service**
2. Connect your GitHub repository
3. **Configuration**:
   ```
   Name: curequeue-backend
   Root Directory: backend
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   ```
4. **Environment Variables** (click "Advanced"):
   ```
   MONGO_URI = mongodb+srv://user:pass@cluster.mongodb.net/curequeue
   JWT_SECRET = your_secure_secret_here
   NODE_ENV = production
   ```
5. Click **Create Web Service**
6. Wait 2-3 minutes for deployment
7. Test: `https://your-app.onrender.com/`

## 🚂 Deploy to Railway

1. Go to [railway.app](https://railway.app) → **New Project**
2. Select **Deploy from GitHub repo**
3. Choose your repository
4. **Settings**:
   ```
   Root Directory: backend
   ```
5. **Variables** tab → Add:
   ```
   MONGO_URI = mongodb+srv://user:pass@cluster.mongodb.net/curequeue
   JWT_SECRET = your_secure_secret_here
   NODE_ENV = production
   ```
6. Railway auto-detects Node.js and runs `npm start`
7. Get your URL from **Settings** → **Domains**

## ☁️ Deploy to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Create `vercel.json` in backend folder:
   ```json
   {
     "version": 2,
     "builds": [{"src": "server.js", "use": "@vercel/node"}],
     "routes": [{"src": "/(.*)", "dest": "server.js"}]
   }
   ```
3. Deploy:
   ```bash
   cd backend
   vercel --prod
   ```
4. Add environment variables in Vercel dashboard

## 🔑 Required Environment Variables

| Variable | Example | Where to Get |
|----------|---------|--------------|
| `MONGO_URI` | `mongodb+srv://...` | MongoDB Atlas dashboard |
| `JWT_SECRET` | `my_super_secret_key_123` | Generate random string |
| `NODE_ENV` | `production` | Set manually |

## 🗄️ MongoDB Atlas Setup (5 minutes)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. **Create Free Cluster** (M0 Sandbox)
3. **Database Access** → Create user with password
4. **Network Access** → Add IP: `0.0.0.0/0` (allow all)
5. **Connect** → Get connection string
6. Replace `<password>` in connection string
7. Copy to `MONGO_URI` environment variable

## ✅ Post-Deployment Verification

```bash
# 1. Health check
curl https://your-domain.com/
# Expected: "CureQueue Backend Running"

# 2. Test registration
curl -X POST https://your-domain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"test123","role":"patient"}'

# 3. Check logs on platform dashboard
```

## 🔧 Quick Fixes

**Problem**: App crashes on start  
**Fix**: Check environment variables are set

**Problem**: Database connection fails  
**Fix**: Verify MONGO_URI and MongoDB Atlas IP whitelist

**Problem**: 404 on all routes  
**Fix**: Ensure root directory is `backend`

**Problem**: CORS errors  
**Fix**: Update CORS in server.js:
```javascript
app.use(cors({ origin: 'https://your-frontend.com' }));
```

## 📱 Update Frontend

After deployment, update frontend API URL:

```javascript
// frontend/.env or frontend/src/api.js
REACT_APP_API_URL=https://your-backend-domain.com/api
```

## 📚 Need More Details?

- Full guide: `backend/README.md`
- Checklist: `backend/DEPLOYMENT_CHECKLIST.md`
- Summary: `DEPLOYMENT_PREPARATION_SUMMARY.md`

## 🎉 You're Done!

Your backend is now live and ready to handle requests!

Test all endpoints and update your frontend to use the new API URL.
