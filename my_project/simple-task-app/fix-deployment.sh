#!/bin/bash

# Quick Fix Deployment Script
# This fixes the frontend serving issue

set -e

APP_NAME="task-manager-demo"
WORKSPACE_PATH="/Workspace/Users/pawanpreet.sangari@databricks.com/apps/$APP_NAME"

echo "🔧 Fixing Task Manager Deployment"
echo "=================================="
echo ""

# Step 1: Verify React build
echo "📦 Step 1/4: Verifying React build..."
if [ ! -d "frontend/build" ]; then
    echo "❌ Frontend build not found. Building now..."
    cd frontend
    npm install
    npm run build
    cd ..
fi
echo "✅ React build verified"
echo ""

# Step 2: Upload fixed app.yaml
echo "📤 Step 2/4: Uploading fixed configuration..."
databricks workspace delete "$WORKSPACE_PATH/app.yaml" 2>/dev/null || true
databricks workspace import "$WORKSPACE_PATH/app.yaml" --file app-fixed.yaml --language PYTHON
echo "✅ Configuration updated"
echo ""

# Step 3: Re-upload frontend (make sure it's in the right place)
echo "📤 Step 3/4: Re-uploading frontend files..."
databricks workspace delete "$WORKSPACE_PATH/frontend" --recursive 2>/dev/null || true
databricks workspace import-dir frontend/build "$WORKSPACE_PATH/frontend" --overwrite
echo "✅ Frontend uploaded"
echo ""

# Step 4: Redeploy
echo "🚀 Step 4/4: Redeploying application..."
databricks apps deploy "$APP_NAME" --source-code-path "$WORKSPACE_PATH"

echo ""
echo "=================================="
echo "✅ Fix Applied!"
echo "=================================="
echo ""
echo "🌐 Your app should now work at:"
APP_INFO=$(databricks apps get "$APP_NAME")
APP_URL=$(echo "$APP_INFO" | grep -o 'https://[^"]*databricksapps.com' | head -1)
echo "   $APP_URL"
echo ""
echo "🔍 Test it:"
echo "   curl $APP_URL/api/health"
echo "   open $APP_URL"
echo ""

