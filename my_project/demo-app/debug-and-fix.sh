#!/bin/bash

echo "🔍 Debugging Databricks App Deployment"
echo "======================================="
echo ""

APP_NAME="demo-app"
WORKSPACE_PATH="/Workspace/Users/pawanpreet.sangari@databricks.com/dataconnect_apps/my_project/demo-app"

echo "1️⃣ Checking workspace files..."
echo ""
echo "Root directory:"
databricks workspace ls "$WORKSPACE_PATH" || echo "❌ Path not found!"
echo ""
echo "Static directory:"
databricks workspace ls "$WORKSPACE_PATH/static" || echo "❌ Static directory not found!"
echo ""

echo "2️⃣ Checking app status..."
databricks apps get "$APP_NAME"
echo ""

echo "3️⃣ Checking deployments..."
databricks apps list-deployments "$APP_NAME"
echo ""

echo "4️⃣ Checking app.yaml content..."
databricks workspace export "$WORKSPACE_PATH/app.yaml" || echo "❌ app.yaml not found!"
echo ""

echo "5️⃣ Checking app.py content..."
databricks workspace export "$WORKSPACE_PATH/app.py" | head -20 || echo "❌ app.py not found!"
echo ""

