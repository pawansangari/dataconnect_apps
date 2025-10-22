# Deploy Without Node.js - Manual Guide

## Problem
You're getting `npm: command not found` because Node.js is not installed.

## Solution Options

### ✅ Option 1: Use No-Build Deployment Script (Quickest)

Deploy source code directly (backend only for now):

```bash
cd /Users/pawanpreet.sangari/dataconnect_apps/my_project/react-database-app
./deploy-no-build.sh cms-npi-app dev
```

This script:
- ✅ Skips frontend build (uses backend only)
- ✅ Deploys immediately
- ✅ No Node.js required

---

### ✅ Option 2: Manual Deployment (Backend Only)

Deploy just the FastAPI backend without frontend:

```bash
cd /Users/pawanpreet.sangari/dataconnect_apps/my_project/react-database-app

# Set variables
export LAKEHOUSE_APP_NAME="cms-npi-app-backend"
export APP_FOLDER_IN_WORKSPACE="/Users/$(databricks current-user me | jq -r .userName)/apps/cms-npi-app-backend"

# Create workspace directory
databricks workspace mkdirs "$APP_FOLDER_IN_WORKSPACE"

# Upload backend only
databricks workspace import-dir backend "$APP_FOLDER_IN_WORKSPACE/backend" --overwrite

# Create simple app.yaml for backend only
cat > /tmp/backend-app.yaml << 'EOF'
command: ["sh", "-c", "cd backend && pip install -r requirements.txt && uvicorn main:app --host 0.0.0.0 --port 8000"]
EOF

databricks workspace import /tmp/backend-app.yaml "$APP_FOLDER_IN_WORKSPACE/app.yaml" --overwrite

# Deploy
databricks apps deploy "$LAKEHOUSE_APP_NAME" "$APP_FOLDER_IN_WORKSPACE" dev

# Get API URL
databricks apps get "$LAKEHOUSE_APP_NAME"
```

You can test the API at:
```bash
APP_URL=$(databricks apps get cms-npi-app-backend | jq -r .url)
curl "$APP_URL/api/health"
curl "$APP_URL/docs"  # Swagger UI
```

---

### ✅ Option 3: Install Node.js (For Full App)

If you want the complete React frontend + backend:

**Using Homebrew (Recommended):**
```bash
# Install Homebrew if needed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node

# Verify
node --version
npm --version

# Now deploy normally
cd /Users/pawanpreet.sangari/dataconnect_apps/my_project/react-database-app
./deploy.sh cms-npi-app dev
```

**Using Official Installer:**
1. Visit: https://nodejs.org/
2. Download LTS version for macOS
3. Install
4. Run: `./deploy.sh cms-npi-app dev`

---

### ✅ Option 4: Use Pre-Built Frontend (If Available)

If someone already built the frontend:

```bash
cd /Users/pawanpreet.sangari/dataconnect_apps/my_project/react-database-app

# Check if build exists
if [ -d "frontend/build" ]; then
    echo "✅ Build found, deploying..."
    
    export LAKEHOUSE_APP_NAME="cms-npi-app"
    export APP_FOLDER_IN_WORKSPACE="/Users/$(databricks current-user me | jq -r .userName)/apps/cms-npi-app"
    
    databricks workspace mkdirs "$APP_FOLDER_IN_WORKSPACE"
    databricks workspace import-dir backend "$APP_FOLDER_IN_WORKSPACE/backend" --overwrite
    databricks workspace import-dir frontend/build "$APP_FOLDER_IN_WORKSPACE/frontend" --overwrite
    
    databricks apps deploy "$LAKEHOUSE_APP_NAME" "$APP_FOLDER_IN_WORKSPACE" dev
else
    echo "❌ No build found. Options:"
    echo "1. Install Node.js and run: ./deploy.sh"
    echo "2. Deploy backend only: ./deploy-no-build.sh"
fi
```

---

## Comparison of Options

| Option | Pros | Cons | Use Case |
|--------|------|------|----------|
| **No-Build Script** | No Node.js needed, fast | Backend only | Quick API deployment |
| **Manual Backend** | Full control, API only | No frontend | API testing, development |
| **Install Node.js** | Full app, best UX | Requires installation | Production deployment |
| **Pre-Built** | Fast if build exists | Requires pre-built files | Team deployment |

---

## Recommended Path

### For Quick Testing (Now):
```bash
./deploy-no-build.sh cms-npi-app dev
```

### For Production (Install Node.js):
```bash
brew install node
./deploy.sh cms-npi-app prod
```

---

## What Each Option Deploys

### No-Build / Manual Backend Only
- ✅ FastAPI backend with all endpoints
- ✅ Database integration
- ✅ API documentation at `/docs`
- ❌ No React frontend UI
- ✅ Can use API via curl/Postman

### Full Deployment (with Node.js)
- ✅ React frontend with forms
- ✅ FastAPI backend
- ✅ Database integration
- ✅ Complete user interface
- ✅ Multi-step wizard

---

## Testing Backend-Only Deployment

After deploying with no-build script:

```bash
# Get API URL
APP_URL=$(databricks apps get cms-npi-app | jq -r .url)

# Test health
curl "$APP_URL/api/health"

# View API docs (open in browser)
echo "API Docs: $APP_URL/docs"

# Submit application via API
curl -X POST "$APP_URL/api/applications" \
  -H "Content-Type: application/json" \
  -d '{
    "basic_information": {
      "submission_reason": "Initial Application",
      "entity_type": "Individual"
    },
    ...
  }'
```

---

## Troubleshooting

### "jq: command not found"
```bash
brew install jq
```

### "Still getting npm error"
Make sure you're using the new script:
```bash
./deploy-no-build.sh cms-npi-app dev
```
NOT:
```bash
./deploy.sh cms-npi-app dev
```

### "Want the full UI"
Install Node.js:
```bash
brew install node
# Then use original script
./deploy.sh cms-npi-app dev
```

---

## Summary

**Quick Fix (No Node.js):**
```bash
./deploy-no-build.sh cms-npi-app dev
```

**Full Solution (with Frontend):**
```bash
brew install node
./deploy.sh cms-npi-app dev
```

Both options work, choose based on your needs!

