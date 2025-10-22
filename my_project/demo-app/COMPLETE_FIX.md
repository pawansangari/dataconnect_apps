# 🔧 Complete Fix for Unavailable App

## Run These Commands Step-by-Step

```bash
cd /Users/pawanpreet.sangari/dataconnect_apps/my_project/demo-app

# STEP 1: Build frontend
echo "📦 Building frontend..."
cd frontend
npm install
npm run build:ignore-types
echo "✅ Build complete. Files in dist/:"
ls -la dist/
cd ..

# STEP 2: Clean and recreate workspace directory
echo "🗑️ Cleaning workspace..."
databricks workspace delete /Workspace/Users/pawanpreet.sangari@databricks.com/dataconnect_apps/my_project/demo-app --recursive
databricks workspace mkdirs /Workspace/Users/pawanpreet.sangari@databricks.com/dataconnect_apps/my_project/demo-app

# STEP 3: Upload frontend to static/
echo "📤 Uploading frontend..."
databricks workspace import-dir frontend/dist /Workspace/Users/pawanpreet.sangari@databricks.com/dataconnect_apps/my_project/demo-app/static --overwrite

# STEP 4: Upload backend files individually
echo "📤 Uploading backend..."
databricks workspace import backend/app.py /Workspace/Users/pawanpreet.sangari@databricks.com/dataconnect_apps/my_project/demo-app/app.py --language PYTHON
databricks workspace import backend/requirements.txt /Workspace/Users/pawanpreet.sangari@databricks.com/dataconnect_apps/my_project/demo-app/requirements.txt --language AUTO
databricks workspace import backend/app.yaml /Workspace/Users/pawanpreet.sangari@databricks.com/dataconnect_apps/my_project/demo-app/app.yaml --language PYTHON

# STEP 5: Verify files
echo "🔍 Verifying files in workspace..."
echo "Root directory:"
databricks workspace ls /Workspace/Users/pawanpreet.sangari@databricks.com/dataconnect_apps/my_project/demo-app
echo ""
echo "Static directory:"
databricks workspace ls /Workspace/Users/pawanpreet.sangari@databricks.com/dataconnect_apps/my_project/demo-app/static
echo ""

# STEP 6: Deploy
echo "🚀 Deploying app..."
databricks apps deploy demo-app /Workspace/Users/pawanpreet.sangari@databricks.com/dataconnect_apps/my_project/demo-app dev

echo ""
echo "⏳ Waiting 10 seconds for deployment..."
sleep 10

# STEP 7: Check status
echo "📊 Checking app status..."
databricks apps get demo-app

echo ""
echo "✅ Done! Open: https://demo-app-519179000643598.aws.databricksapps.com"
```

---

## What I Fixed

1. **Updated `app.yaml`** - Now explicitly sets host and port
2. **Updated `app.py`** - Now shows debugging info if static directory is missing
3. **Clear workspace first** - Ensures no old files interfere
4. **Upload files individually** - More reliable than import-dir for backend

---

## Expected Workspace Structure

After upload, workspace should look like:

```
/Workspace/.../my_project/demo-app/
├── app.py                  ← Your backend
├── requirements.txt        ← fastapi, uvicorn
├── app.yaml               ← uvicorn command
└── static/                ← From frontend/dist/
    ├── index.html
    └── assets/
        ├── index-*.js
        └── index-*.css
```

---

## Verify It Worked

```bash
# Should show: "state": "RUNNING"
databricks apps get demo-app | grep state

# Should show React UI (not error page)
curl https://demo-app-519179000643598.aws.databricksapps.com
```

---

## If Still Not Working

1. **Check deployment logs:**
   ```bash
   databricks apps list-deployments demo-app
   ```

2. **Try visiting the URL in browser**
   - If you see "Static Directory Not Found" → static files didn't upload
   - If you see API error → backend isn't starting
   - If blank page → check browser console

3. **Export and check app.py:**
   ```bash
   databricks workspace export /Workspace/Users/pawanpreet.sangari@databricks.com/dataconnect_apps/my_project/demo-app/app.py
   ```

---

## Nuclear Option: Start Fresh

If nothing works, delete and recreate:

```bash
# Delete app
databricks apps delete demo-app

# Delete workspace files
databricks workspace delete /Workspace/Users/pawanpreet.sangari@databricks.com/dataconnect_apps/my_project/demo-app --recursive

# Start over
databricks apps create demo-app

# Then run the deployment commands above
```

---

**Run the commands above and the app should work!** 🚀

