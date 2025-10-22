# How to Create and Deploy React App on Databricks Apps

## 🎯 Overview

This guide explains **exactly** how to create a React app that deploys successfully on Databricks Apps.

---

## 📁 Project Structure

```
demo-app/
├── frontend/                    # React Application
│   ├── package.json            # npm dependencies
│   ├── vite.config.js          # Build configuration
│   ├── index.html              # HTML entry point
│   └── src/
│       ├── main.jsx            # React entry
│       ├── App.jsx             # Main component
│       ├── App.css             # Component styles
│       └── index.css           # Global styles
│
├── backend/                     # FastAPI Backend
│   ├── app.py                  # FastAPI server (CRITICAL FILE)
│   ├── requirements.txt        # Python dependencies
│   └── app.yaml                # Databricks commands
│
└── deploy.sh                    # Deployment script
```

---

## 🔑 Critical Success Factors

### Why Previous Attempts Failed

1. **Wrong build output directory** - Must be `dist/` not `build/`
2. **Wrong static mount point** - Backend must look for `static/` directory
3. **Missing `html=True`** - Required for SPA routing
4. **Base path mismatch** - Vite must use `base: '/'`

### What Makes This Work

✅ **Vite builds to `dist/`** (default)  
✅ **Deploy script uploads `dist/` → `static/` in workspace**  
✅ **Backend mounts `static/` at root with `html=True`**  
✅ **All paths align perfectly**

---

## 🛠️ Step-by-Step Creation Guide

### Step 1: Create Project Directory

```bash
mkdir demo-app
cd demo-app
mkdir frontend backend
```

---

### Step 2: Create Frontend (React + Vite)

#### 2.1 Create `frontend/package.json`

```json
{
  "name": "databricks-demo-app",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:ignore-types": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.0.8"
  }
}
```

**Key Points:**
- `"type": "module"` - Required for Vite
- `"build:ignore-types"` - Matches deploy script
- Vite builds to `dist/` by default

#### 2.2 Create `frontend/vite.config.js`

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',                    // CRITICAL: Must be root
  build: {
    outDir: 'dist',             // CRITICAL: Must be dist
    assetsDir: 'assets',
    emptyOutDir: true
  }
})
```

**Why This Matters:**
- `base: '/'` - Ensures all asset paths are absolute
- `outDir: 'dist'` - Matches deploy script expectation

#### 2.3 Create `frontend/index.html`

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Databricks Demo App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

#### 2.4 Create React Components

See the actual files for:
- `frontend/src/main.jsx` - React entry point
- `frontend/src/App.jsx` - Main component with counter
- `frontend/src/App.css` - Component styles
- `frontend/src/index.css` - Global styles

---

### Step 3: Create Backend (FastAPI)

#### 3.1 Create `backend/app.py` ⚠️ CRITICAL FILE

```python
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

app = FastAPI()

target_dir = "static"

app.mount("/", StaticFiles(directory=target_dir, html=True), name="site")
```

**Line-by-Line Explanation:**

- **Line 1-2:** Import FastAPI and StaticFiles
- **Line 4:** Create FastAPI app instance
- **Line 6:** Define directory name (must match workspace upload)
- **Line 8:** **MOST CRITICAL LINE**
  - Mounts `static/` directory at root `/`
  - `html=True` - Enables SPA routing (serves index.html for all routes)
  - Without `html=True`, only exact file paths work

**Why `html=True` is Critical:**
- Without it: Only `/index.html` works
- With it: `/`, `/about`, `/anything` all serve index.html (React routing works)

#### 3.2 Create `backend/requirements.txt`

```txt
fastapi
uvicorn
```

**Minimal dependencies:**
- `fastapi` - Web framework
- `uvicorn` - ASGI server

#### 3.3 Create `backend/app.yaml`

```yaml
command: ["uvicorn", "app:app"]
```

**What Databricks Apps Runs:**
- Starts uvicorn server
- Loads `app.py` and finds `app` variable
- Listens on port 8000 (automatic)

---

### Step 4: Create Deployment Script

#### 4.1 Create `deploy.sh`

```bash
#!/bin/bash

# Accept parameters
APP_FOLDER_IN_WORKSPACE=${1:-"/Workspace/Users/YOUR_EMAIL@databricks.com/apps/demo-app"}
LAKEHOUSE_APP_NAME=${2:-"demo-app"}

echo "🚀 Deploying Databricks Demo App"

# Frontend build and import
(
  cd frontend
  npm run build:ignore-types
  databricks workspace import-dir dist "$APP_FOLDER_IN_WORKSPACE/static" --overwrite
) &

# Backend packaging
(
  cd backend
  mkdir -p build
  find . -mindepth 1 -maxdepth 1 -not -name '.*' -not -name "local_conf*" -not -name 'build' -not -name '__pycache__' -exec cp -r {} build/ \;
  if [ -f app_prod.py ]; then
    cp app_prod.py build/app.py
  fi
  databricks workspace import-dir build "$APP_FOLDER_IN_WORKSPACE" --overwrite
  rm -rf build
) &

wait

# Deploy the application
databricks apps deploy "$LAKEHOUSE_APP_NAME" "$APP_FOLDER_IN_WORKSPACE" dev

echo "✅ Deployment Complete!"
```

**Key Parts:**

1. **Frontend Section:**
   ```bash
   npm run build:ignore-types      # Builds to dist/
   databricks workspace import-dir dist "$APP_FOLDER_IN_WORKSPACE/static" --overwrite
   ```
   - Builds React app to `dist/`
   - Uploads `dist/` contents to workspace as `static/`

2. **Backend Section:**
   ```bash
   mkdir -p build
   find . ... -exec cp -r {} build/ \;
   databricks workspace import-dir build "$APP_FOLDER_IN_WORKSPACE" --overwrite
   ```
   - Creates temp `build/` directory
   - Copies backend files (excluding hidden, cache, etc.)
   - Uploads to workspace root
   - Cleans up temp directory

3. **Deploy Command:**
   ```bash
   databricks apps deploy "$LAKEHOUSE_APP_NAME" "$APP_FOLDER_IN_WORKSPACE" dev
   ```
   - Deploys to Databricks Apps
   - `dev` = development mode

---

## 🚀 Deployment Steps

### Prerequisites

```bash
# Node.js and npm
node --version   # Should be v16+
npm --version

# Databricks CLI (configured)
databricks --version
databricks workspace list /   # Test connection
```

### Deploy Commands

```bash
# 1. Navigate to project
cd /Users/pawanpreet.sangari/dataconnect_apps/my_project/demo-app

# 2. Install frontend dependencies
cd frontend
npm install
cd ..

# 3. Make deploy script executable
chmod +x deploy.sh

# 4. Create the app in Databricks (first time only)
databricks apps create demo-app

# 5. Deploy!
./deploy.sh
```

**Or with custom parameters:**
```bash
./deploy.sh "/Workspace/Users/YOUR_EMAIL@databricks.com/apps/my-app" "my-app"
```

---

## 🔍 How the Deployment Works

### The Flow

```
┌─────────────────────────────────────────────────┐
│ 1. Local Development                             │
│    frontend/src/*.jsx  →  npm run build         │
│    ↓                                             │
│    frontend/dist/      (index.html, assets/)    │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ 2. Upload to Databricks Workspace                │
│    frontend/dist/  →  /workspace/.../static/    │
│    backend/*       →  /workspace/.../           │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ 3. Databricks Apps Runs                          │
│    uvicorn app:app                               │
│    ↓                                             │
│    FastAPI starts                                │
│    ↓                                             │
│    Mounts static/ at /                           │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ 4. User Visits App                               │
│    https://demo-app-XXX.databricksapps.com      │
│    ↓                                             │
│    FastAPI serves static/index.html             │
│    ↓                                             │
│    React app loads in browser                    │
└─────────────────────────────────────────────────┘
```

### Workspace Structure After Deploy

```
/Workspace/Users/YOUR_EMAIL@databricks.com/apps/demo-app/
├── app.py                      # FastAPI server
├── requirements.txt            # Python deps
├── app.yaml                    # Run commands
└── static/                     # React build
    ├── index.html             # Entry point
    └── assets/                # JS/CSS files
        ├── index-ABC123.js
        └── index-DEF456.css
```

---

## ✅ Verification Steps

### 1. Check App Status

```bash
databricks apps get demo-app
```

Look for:
- `"state": "RUNNING"`
- `"url": "https://...databricksapps.com"`

### 2. Test in Browser

```bash
# Get URL
databricks apps get demo-app | grep url

# Open in browser
open <YOUR_APP_URL>
```

### 3. What You Should See

✅ Purple gradient background  
✅ "Databricks Demo App" title  
✅ Counter showing "0"  
✅ "Click Me!" button  
✅ Three feature cards at bottom  

### 4. Test Functionality

- Click the button → counter increases
- At 1 click → "Great start! 🎉"
- At 5 clicks → "You're on fire! 🔥"
- At 10 clicks → "Amazing! 🌟"

---

## 🐛 Troubleshooting

### Issue: Seeing `{"message": "Task Manager API", "docs": "/docs"}`

**Cause:** Frontend files not found

**Fix:**
```bash
# Check workspace
databricks workspace ls /Workspace/Users/YOUR_EMAIL@databricks.com/apps/demo-app/static/

# Should show:
# index.html
# assets/

# If empty, re-run deploy
./deploy.sh
```

### Issue: "404 Not Found" for root path

**Cause:** Missing `html=True` in `app.mount()`

**Fix:** Ensure `backend/app.py` line 8 has:
```python
app.mount("/", StaticFiles(directory=target_dir, html=True), name="site")
```

### Issue: Assets not loading (blank page)

**Cause:** Wrong base path in Vite config

**Fix:** Ensure `vite.config.js` has:
```javascript
base: '/'
```

### Issue: npm build fails

**Check:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 🎯 Key Takeaways

### What Makes It Work

1. ✅ **Vite builds to `dist/`** (configured in vite.config.js)
2. ✅ **Deploy script uploads `dist/` to workspace `static/`**
3. ✅ **Backend looks for `static/` directory**
4. ✅ **`html=True` enables SPA routing**
5. ✅ **All paths align: `/` → `static/index.html`**

### Common Mistakes to Avoid

❌ Building to `build/` instead of `dist/`  
❌ Forgetting `html=True` in StaticFiles mount  
❌ Using wrong base path in Vite  
❌ Uploading to wrong workspace directory  
❌ Missing `app.yaml` in backend  

---

## 📚 Understanding Each Component

### Why Vite?

- Fast builds (30x faster than webpack)
- Simple configuration
- Modern ES modules
- Built-in HMR (Hot Module Replacement)
- Builds to `dist/` by default

### Why FastAPI?

- Modern Python web framework
- Async support
- Automatic API docs
- Built-in static file serving
- Compatible with Databricks Apps

### Why This Structure?

- **Separation of Concerns:** Frontend/Backend separated
- **Easy Development:** Run frontend with `npm run dev`
- **Simple Deployment:** One command deploys both
- **Scalable:** Easy to add API routes later

---

## 🚀 Next Steps

### Add API Endpoints

```python
# backend/app.py
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

app = FastAPI()

# Add API routes BEFORE mounting static files
@app.get("/api/hello")
def hello():
    return {"message": "Hello from API!"}

# Mount static files last (catches all other routes)
target_dir = "static"
app.mount("/", StaticFiles(directory=target_dir, html=True), name="site")
```

### Connect to Database

```python
# Use environment variables from Databricks Apps
import os

PGHOST = os.getenv("PGHOST")
PGDATABASE = os.getenv("PGDATABASE")
PGUSER = os.getenv("PGUSER")
```

### Add More Features

- User authentication
- Data visualization
- File uploads
- Real-time updates

---

## 📊 Summary

| Component | Technology | Purpose |
|-----------|------------|---------|
| Frontend | React + Vite | User interface |
| Backend | FastAPI | Static file server (+ API) |
| Build Tool | Vite | Compiles React to static files |
| Server | Uvicorn | Runs FastAPI |
| Platform | Databricks Apps | Serverless hosting |

**Total Time:** ~5 minutes from creation to deployment

---

**Created:** October 22, 2025  
**Status:** ✅ Production Ready  
**Tested:** Working on Databricks Apps

