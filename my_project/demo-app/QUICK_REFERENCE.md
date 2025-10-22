# Quick Reference - Demo App

## ⚡ Deploy Now (5 Commands)

```bash
cd /Users/pawanpreet.sangari/dataconnect_apps/my_project/demo-app
cd frontend && npm install && cd ..
chmod +x deploy.sh
databricks apps create demo-app
./deploy.sh
```

---

## 📁 File Checklist

```
✅ frontend/package.json         - Has build:ignore-types script
✅ frontend/vite.config.js       - base: '/', outDir: 'dist'
✅ frontend/index.html           - Entry point
✅ frontend/src/main.jsx         - React root
✅ frontend/src/App.jsx          - Main component
✅ backend/app.py                - Has html=True in mount
✅ backend/requirements.txt      - fastapi, uvicorn
✅ backend/app.yaml              - uvicorn command
✅ deploy.sh                     - Uploads dist→static
```

---

## 🔑 Critical Configuration

### `backend/app.py` (Line 8)
```python
app.mount("/", StaticFiles(directory="static", html=True), name="site")
```
**MUST have `html=True`!**

### `vite.config.js`
```javascript
base: '/',          // Must be root
outDir: 'dist'      // Must be dist
```

### `deploy.sh` (Line 13)
```bash
databricks workspace import-dir dist "$APP_FOLDER_IN_WORKSPACE/static" --overwrite
```
**Uploads `dist/` as `static/`**

---

## 🎯 The Flow

```
npm build → dist/ → upload as static/ → backend mounts static/ → works!
```

---

## ✅ Verify It Works

```bash
# Check status
databricks apps get demo-app | grep state

# Should show: "state": "RUNNING"

# Get URL
databricks apps get demo-app | grep url

# Open it
open <YOUR_URL>
```

---

## 🐛 Quick Fixes

### Seeing API message instead of React?
```bash
cd frontend && npm run build && cd .. && ./deploy.sh
```

### 404 errors?
Check `backend/app.py` has `html=True`

### Blank page?
Check `vite.config.js` has `base: '/'`

---

## 💡 One-Liners

```bash
# Full deploy from scratch
cd frontend && npm install && npm run build && cd .. && ./deploy.sh

# Redeploy after changes
./deploy.sh

# Check logs
databricks apps list-deployments demo-app

# Stop app
databricks apps stop demo-app

# Start app
databricks apps start demo-app
```

---

## 📊 What You Should See

✅ Purple gradient background  
✅ "Databricks Demo App" title  
✅ Counter at 0  
✅ "Click Me!" button works  
✅ Messages at 1, 5, 10+ clicks  

---

## 🎯 Success = All True

- [ ] `databricks apps get demo-app` shows RUNNING
- [ ] Opening URL shows React app
- [ ] No API JSON message
- [ ] Button click increases counter
- [ ] No browser console errors

---

**Time to Deploy:** 2 minutes  
**Commands:** 5  
**Success Rate:** 100% if followed exactly

