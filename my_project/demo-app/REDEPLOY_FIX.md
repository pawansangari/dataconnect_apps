# 🔧 Path Fix - Redeploy Instructions

## Issue Found
The deploy script was using the wrong workspace path!

**Wrong Path (old):**
```
/Workspace/Users/pawanpreet.sangari@databricks.com/apps/demo-app
```

**Correct Path (fixed):**
```
/Workspace/Users/pawanpreet.sangari@databricks.com/dataconnect_apps/my_project/demo-app
```

---

## ✅ Fixed Files

I've updated `deploy.sh` with the correct path.

---

## 🚀 Redeploy Now

### Option 1: Using Fixed Script (Recommended)

```bash
cd /Users/pawanpreet.sangari/dataconnect_apps/my_project/demo-app

# Build frontend
cd frontend
npm run build:ignore-types
cd ..

# Deploy with corrected script
./deploy.sh
```

### Option 2: Manual Deployment with Correct Path

```bash
cd /Users/pawanpreet.sangari/dataconnect_apps/my_project/demo-app

# Set the correct path
APP_PATH="/Workspace/Users/pawanpreet.sangari@databricks.com/dataconnect_apps/my_project/demo-app"
APP_NAME="demo-app"

# Build frontend
cd frontend
npm run build:ignore-types
cd ..

# Upload frontend (dist → static)
databricks workspace import-dir frontend/dist "$APP_PATH/static" --overwrite

# Upload backend
cd backend
mkdir -p build
cp app.py requirements.txt app.yaml build/
databricks workspace import-dir build "$APP_PATH" --overwrite
rm -rf build
cd ..

# Deploy
databricks apps deploy "$APP_NAME" "$APP_PATH" dev
```

---

## 🔍 Verify Deployment

### Check Files in Workspace

```bash
# Should show: app.py, requirements.txt, app.yaml, static/
databricks workspace ls /Workspace/Users/pawanpreet.sangari@databricks.com/dataconnect_apps/my_project/demo-app/

# Should show: index.html, assets/
databricks workspace ls /Workspace/Users/pawanpreet.sangari@databricks.com/dataconnect_apps/my_project/demo-app/static/
```

### Check App Status

```bash
databricks apps get demo-app
```

Should show:
- `"state": "RUNNING"`
- `"source_code_path": "/Workspace/Users/pawanpreet.sangari@databricks.com/dataconnect_apps/my_project/demo-app"`

---

## 🎯 What Should Happen

After redeploying with the correct path:

1. ✅ Backend files uploaded to correct location
2. ✅ Frontend static files uploaded to `static/` subdirectory
3. ✅ App starts successfully
4. ✅ Opening URL shows React UI (not API message)

---

## 🐛 If Still Unavailable

### Check App Logs

```bash
databricks apps list-deployments demo-app
```

Look for the latest deployment and its status.

### Verify File Structure

The workspace should look like:

```
/Workspace/Users/pawanpreet.sangari@databricks.com/dataconnect_apps/my_project/demo-app/
├── app.py                  ← FastAPI server
├── requirements.txt        ← Python deps
├── app.yaml               ← Commands
└── static/                ← React build
    ├── index.html
    └── assets/
        ├── index-*.js
        └── index-*.css
```

### Test Backend Directly

```bash
# Check if backend file exists
databricks workspace export /Workspace/Users/pawanpreet.sangari@databricks.com/dataconnect_apps/my_project/demo-app/app.py
```

---

## 💡 Key Points

1. **Workspace path must match your repo structure**
   - Your repo: `/dataconnect_apps/my_project/demo-app/`
   - Workspace path should be the same

2. **Frontend goes in `static/` subdirectory**
   - `frontend/dist/` → `workspace/.../static/`
   - Backend looks for `static/` folder

3. **Backend files go in root**
   - `app.py`, `requirements.txt`, `app.yaml` in root
   - Not in a `backend/` subdirectory

---

## ✅ Success Checklist

- [ ] Ran `./deploy.sh` with updated script
- [ ] Saw "Deployment Complete!" message
- [ ] `databricks apps get demo-app` shows RUNNING
- [ ] Files exist at correct workspace path
- [ ] Opening app URL shows React UI

---

**Run `./deploy.sh` now and it should work!** 🚀

