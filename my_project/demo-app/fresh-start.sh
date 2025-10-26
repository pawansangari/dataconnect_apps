#!/bin/bash

set -e

echo "🔄 Fresh Start - Recreating demo-app"
echo "====================================="
echo ""

APP_NAME="demo-app"
WORKSPACE_PATH="/Workspace/Users/pawanpreet.sangari@databricks.com/dataconnect_apps/my_project/demo-app"

cd "$(dirname "$0")"

# Step 1: Delete old app
echo "🗑️ Step 1: Deleting old app..."
databricks apps delete "$APP_NAME" 2>/dev/null || echo "   (App already deleted or doesn't exist)"
echo "✅ Old app removed"
echo ""

# Step 2: Clean workspace
echo "🗑️ Step 2: Cleaning workspace directory..."
databricks workspace delete "$WORKSPACE_PATH" --recursive 2>/dev/null || true
databricks workspace mkdirs "$WORKSPACE_PATH"
echo "✅ Workspace cleaned"
echo ""

# Step 3: Build frontend
echo "📦 Step 3: Building React frontend..."
cd frontend
npm install
npm run build:ignore-types
echo "✅ Frontend built to dist/"
cd ..
echo ""

# Step 4: Upload frontend
echo "📤 Step 4: Uploading frontend to workspace..."
databricks workspace import-dir frontend/dist "$WORKSPACE_PATH/static" --overwrite
echo "✅ Frontend uploaded to $WORKSPACE_PATH/static/"
echo ""

# Step 5: Upload backend
echo "📤 Step 5: Uploading backend files..."
databricks workspace import backend/app.py "$WORKSPACE_PATH/app.py" --language PYTHON
databricks workspace import backend/requirements.txt "$WORKSPACE_PATH/requirements.txt" --language AUTO
databricks workspace import backend/app.yaml "$WORKSPACE_PATH/app.yaml" --language PYTHON
echo "✅ Backend uploaded to $WORKSPACE_PATH/"
echo ""

# Step 6: Verify files
echo "🔍 Step 6: Verifying workspace structure..."
echo ""
echo "Root directory ($WORKSPACE_PATH):"
databricks workspace ls "$WORKSPACE_PATH"
echo ""
echo "Static directory ($WORKSPACE_PATH/static):"
databricks workspace ls "$WORKSPACE_PATH/static"
echo ""

# Step 7: Create new app
echo "📱 Step 7: Creating new app..."
databricks apps create "$APP_NAME" --description "Demo React + FastAPI app"
echo "✅ App created: $APP_NAME"
echo ""

# Step 8: Deploy
echo "🚀 Step 8: Deploying app..."
databricks apps deploy "$APP_NAME" "$WORKSPACE_PATH" dev

echo ""
echo "⏳ Waiting 20 seconds for deployment..."
sleep 20

# Step 9: Check status
echo ""
echo "📊 Step 9: Checking app status..."
echo ""
databricks apps get "$APP_NAME"

echo ""
echo "====================================="
echo "✅ Fresh Start Complete!"
echo "====================================="
echo ""
echo "🌐 App URL: https://demo-app-519179000643598.aws.databricksapps.com"
echo ""
echo "🔍 Verify it's working:"
echo "   curl https://demo-app-519179000643598.aws.databricksapps.com | head -20"
echo ""
echo "📊 Check status anytime:"
echo "   databricks apps get $APP_NAME"
echo ""

