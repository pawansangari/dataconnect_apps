#!/bin/bash

set -e

echo "🔧 Complete Fix and Deploy for demo-app"
echo "========================================"
echo ""

cd "$(dirname "$0")"

# Build frontend
echo "📦 Step 1: Building frontend..."
cd frontend
npm install --silent
npm run build:ignore-types
cd ..
echo "✅ Frontend built"
echo ""

# Clean workspace
echo "🗑️ Step 2: Cleaning workspace..."
databricks workspace delete /Workspace/Users/pawanpreet.sangari@databricks.com/dataconnect_apps/my_project/demo-app --recursive 2>/dev/null || true
databricks workspace mkdirs /Workspace/Users/pawanpreet.sangari@databricks.com/dataconnect_apps/my_project/demo-app
echo "✅ Workspace cleaned"
echo ""

# Upload static files
echo "📤 Step 3: Uploading frontend (static/)..."
databricks workspace import-dir frontend/dist /Workspace/Users/pawanpreet.sangari@databricks.com/dataconnect_apps/my_project/demo-app/static --overwrite
echo "✅ Frontend uploaded"
echo ""

# Upload backend files
echo "📤 Step 4: Uploading backend files..."
databricks workspace import backend/app.py /Workspace/Users/pawanpreet.sangari@databricks.com/dataconnect_apps/my_project/demo-app/app.py --language PYTHON
databricks workspace import backend/requirements.txt /Workspace/Users/pawanpreet.sangari@databricks.com/dataconnect_apps/my_project/demo-app/requirements.txt --language AUTO
databricks workspace import backend/app.yaml /Workspace/Users/pawanpreet.sangari@databricks.com/dataconnect_apps/my_project/demo-app/app.yaml --language PYTHON
echo "✅ Backend uploaded"
echo ""

# Verify
echo "🔍 Step 5: Verifying files..."
echo "Files in workspace:"
databricks workspace ls /Workspace/Users/pawanpreet.sangari@databricks.com/dataconnect_apps/my_project/demo-app
echo ""

# Deploy
echo "🚀 Step 6: Deploying app..."
databricks apps deploy demo-app /Workspace/Users/pawanpreet.sangari@databricks.com/dataconnect_apps/my_project/demo-app dev

echo ""
echo "⏳ Waiting 15 seconds for app to start..."
sleep 15

# Check status
echo ""
echo "📊 Final Status:"
databricks apps get demo-app

echo ""
echo "========================================"
echo "✅ Deployment Complete!"
echo "========================================"
echo ""
echo "🌐 App URL: https://demo-app-519179000643598.aws.databricksapps.com"
echo ""
echo "🔍 Check if it's working:"
echo "   curl https://demo-app-519179000643598.aws.databricksapps.com"
echo ""

