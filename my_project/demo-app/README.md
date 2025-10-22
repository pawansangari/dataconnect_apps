# Databricks Demo App

A **simple, beautiful React application** that deploys perfectly on Databricks Apps every time.

![Status](https://img.shields.io/badge/status-production--ready-green) ![React](https://img.shields.io/badge/React-18.2-blue) ![FastAPI](https://img.shields.io/badge/FastAPI-latest-green)

---

## ✨ Features

- 🎨 Beautiful gradient UI with animations
- 🔢 Interactive counter with milestones
- ⚡ Lightning-fast Vite build
- ☁️ Serverless deployment on Databricks Apps
- 📱 Fully responsive design
- 🎯 Production-ready code

---

## 🚀 Quick Deploy

```bash
# 1. Navigate to project
cd /Users/pawanpreet.sangari/dataconnect_apps/my_project/demo-app

# 2. Install dependencies
cd frontend && npm install && cd ..

# 3. Make deploy script executable
chmod +x deploy.sh

# 4. Create app (first time only)
databricks apps create demo-app

# 5. Deploy!
./deploy.sh
```

**That's it!** Your app will be live in ~2 minutes.

---

## 📁 Project Structure

```
demo-app/
├── README.md                          ← You are here
├── HOW_TO_CREATE_AND_DEPLOY.md       ← Complete guide
├── deploy.sh                          ← Deployment script
│
├── frontend/                          ← React App (Vite)
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── App.css
│       └── index.css
│
└── backend/                           ← FastAPI Server
    ├── app.py                         ← CRITICAL: Static file server
    ├── requirements.txt
    └── app.yaml
```

---

## 🎯 What Makes This Work

### The Secret Sauce

1. **Vite builds to `dist/`** (not `build/`)
2. **Deploy script uploads `dist/` → workspace `static/`**
3. **Backend mounts `static/` at root with `html=True`**
4. **Perfect alignment of all paths**

### Critical Backend Code

```python
# backend/app.py
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

app = FastAPI()
target_dir = "static"

# This line is CRITICAL
app.mount("/", StaticFiles(directory=target_dir, html=True), name="site")
```

**Why `html=True` matters:**
- ✅ With it: All routes serve React app (SPA routing works)
- ❌ Without it: Only exact file paths work

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| **README.md** | Quick overview (this file) |
| **HOW_TO_CREATE_AND_DEPLOY.md** | Complete step-by-step guide |

Read `HOW_TO_CREATE_AND_DEPLOY.md` for:
- Detailed creation steps
- Why each file matters
- Troubleshooting guide
- How deployment works
- Common mistakes to avoid

---

## 🎨 What It Looks Like

### Home Screen
- Purple gradient background (beautiful!)
- Large animated counter
- "Click Me!" button
- Three feature cards
- Smooth animations throughout

### Interactive Features
- Click button → counter increases
- Milestone messages:
  - 1 click: "Great start! 🎉"
  - 5 clicks: "You're on fire! 🔥"
  - 10 clicks: "Amazing! 🌟"
  - 10+ clicks: "Unstoppable! 🚀"

---

## 🛠️ Tech Stack

| Component | Technology | Why |
|-----------|------------|-----|
| Frontend | React 18.2 | Modern, fast, popular |
| Build Tool | Vite 5.0 | 30x faster than webpack |
| Backend | FastAPI | Modern Python framework |
| Server | Uvicorn | ASGI server for FastAPI |
| Platform | Databricks Apps | Serverless, scalable |

---

## ✅ Checklist After Deploy

### Verify Deployment

```bash
# Check status
databricks apps get demo-app

# Look for:
# "state": "RUNNING"
# "url": "https://...databricksapps.com"
```

### Test in Browser

1. Open app URL
2. Should see:
   - ✅ Purple gradient background
   - ✅ "Databricks Demo App" title
   - ✅ Counter at 0
   - ✅ "Click Me!" button
   - ✅ Three feature cards

3. Click button multiple times
   - ✅ Counter increases
   - ✅ Messages appear

---

## 🐛 Troubleshooting

### Issue: Seeing API message instead of React app

**Fix:**
```bash
# Rebuild and redeploy
cd frontend
npm run build
cd ..
./deploy.sh
```

### Issue: 404 Not Found

**Check:** `backend/app.py` has `html=True`
```python
app.mount("/", StaticFiles(directory=target_dir, html=True), name="site")
```

### Issue: Blank page

**Check:** `vite.config.js` has correct base
```javascript
base: '/'
```

**Full troubleshooting guide:** See `HOW_TO_CREATE_AND_DEPLOY.md`

---

## 🎓 Learning Resources

### Want to Understand How It Works?

Read `HOW_TO_CREATE_AND_DEPLOY.md` for:
- Why previous attempts failed
- How the deployment flow works
- Line-by-line code explanations
- Architecture diagrams
- Best practices

### Want to Add Features?

Examples in `HOW_TO_CREATE_AND_DEPLOY.md`:
- Add API endpoints
- Connect to database
- Add authentication
- Real-time updates

---

## 🚀 Deploy with Custom Parameters

```bash
# Custom workspace path and app name
./deploy.sh "/Workspace/Users/YOUR_EMAIL@databricks.com/apps/my-app" "my-app"

# Default (recommended)
./deploy.sh
```

### Parameters

1. **APP_FOLDER_IN_WORKSPACE** - Where to upload files
   - Default: `/Workspace/Users/pawanpreet.sangari@databricks.com/apps/demo-app`

2. **LAKEHOUSE_APP_NAME** - App name in Databricks
   - Default: `demo-app`

---

## 💡 Key Commands

```bash
# Install frontend dependencies
cd frontend && npm install && cd ..

# Build frontend locally (for testing)
cd frontend && npm run build && cd ..

# Make deploy script executable
chmod +x deploy.sh

# Create app (first time only)
databricks apps create demo-app

# Deploy
./deploy.sh

# Check status
databricks apps get demo-app

# View logs
databricks apps list-deployments demo-app
```

---

## 🎯 Success Criteria

Your deployment is successful if:

✅ Command completes without errors  
✅ `databricks apps get demo-app` shows `"state": "RUNNING"`  
✅ Opening URL shows React app (not API message)  
✅ Counter button works  
✅ Page is responsive  
✅ No console errors  

---

## 📊 Deployment Time

| Step | Time |
|------|------|
| Frontend build | 10-30 seconds |
| Backend packaging | 5 seconds |
| Upload to workspace | 10-20 seconds |
| App deployment | 30-60 seconds |
| **Total** | **~2 minutes** |

---

## 🎉 What's Included

- ✅ Production-ready React app
- ✅ FastAPI backend configured correctly
- ✅ One-command deployment
- ✅ Beautiful gradient UI
- ✅ Smooth animations
- ✅ Responsive design
- ✅ Complete documentation

---

## 🔄 Update Your App

```bash
# Make changes to frontend/src/*.jsx
# Then:
./deploy.sh
```

Changes will be live in ~2 minutes!

---

## 🆘 Need Help?

1. **Quick Questions:** Check `README.md` (this file)
2. **Detailed Guide:** Read `HOW_TO_CREATE_AND_DEPLOY.md`
3. **Still Stuck:** Check Databricks Apps documentation

---

## 📝 Notes

- First deployment takes ~2 minutes
- Subsequent deploys also ~2 minutes
- App auto-scales with traffic
- No infrastructure management needed
- HTTPS included automatically
- Authentication via Databricks workspace

---

**Version:** 1.0.0  
**Status:** ✅ Production Ready  
**Last Updated:** October 22, 2025  
**Tested:** Databricks Apps (Python 3.11.13, Node.js v22.16.0)

🎊 **Happy Deploying!** 🎊

