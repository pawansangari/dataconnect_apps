#!/bin/bash

# Simple Task Manager - Deployment Script for Databricks Apps
# This script builds and deploys the React + FastAPI application

set -e

# Configuration
APP_NAME="task-manager-demo"
WORKSPACE_PATH="/Workspace/Users/pawanpreet.sangari@databricks.com/apps/$APP_NAME"

echo "🚀 Task Manager - Databricks Deployment"
echo "========================================="
echo ""

# Step 1: Check if Node.js is installed
echo "📋 Step 1/6: Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed!"
    echo ""
    echo "Please install Node.js first:"
    echo "  brew install node"
    exit 1
fi

NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
echo "✅ Node.js $NODE_VERSION"
echo "✅ npm $NPM_VERSION"
echo ""

# Step 2: Install frontend dependencies
echo "📦 Step 2/6: Installing frontend dependencies..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo "Installing npm packages..."
    npm install
else
    echo "✅ Dependencies already installed"
fi
cd ..
echo ""

# Step 3: Build React app
echo "🔨 Step 3/6: Building React application..."
cd frontend
npm run build
echo "✅ Build complete"
cd ..
echo ""

# Step 4: Create workspace directory
echo "📁 Step 4/6: Creating workspace directory..."
databricks workspace mkdirs "$WORKSPACE_PATH"
echo "✅ Workspace ready: $WORKSPACE_PATH"
echo ""

# Step 5: Upload files
echo "📤 Step 5/6: Uploading files to Databricks..."

# Upload frontend build
echo "  → Uploading React frontend..."
databricks workspace delete "$WORKSPACE_PATH/frontend" --recursive 2>/dev/null || true
databricks workspace import-dir frontend/build "$WORKSPACE_PATH/frontend" --overwrite

# Upload backend
echo "  → Uploading FastAPI backend..."
databricks workspace delete "$WORKSPACE_PATH/backend" --recursive 2>/dev/null || true
databricks workspace import-dir backend "$WORKSPACE_PATH/backend" --overwrite

# Upload app.yaml
echo "  → Uploading app configuration..."
databricks workspace delete "$WORKSPACE_PATH/app.yaml" 2>/dev/null || true
databricks workspace import "$WORKSPACE_PATH/app.yaml" --file app.yaml --language PYTHON

echo "✅ All files uploaded"
echo ""

# Step 6: Deploy application
echo "🚀 Step 6/6: Deploying application..."

# Check if app exists, create if it doesn't
if ! databricks apps get "$APP_NAME" &>/dev/null; then
    echo "  → Creating new app: $APP_NAME..."
    databricks apps create "$APP_NAME"
    echo "✅ App created"
else
    echo "✅ App exists: $APP_NAME"
fi

echo ""
echo "  → Deploying source code..."
DEPLOY_OUTPUT=$(databricks apps deploy "$APP_NAME" --source-code-path "$WORKSPACE_PATH")

# Extract app URL from deployment output
echo "$DEPLOY_OUTPUT"
echo ""

# Get app details
APP_INFO=$(databricks apps get "$APP_NAME")
APP_URL=$(echo "$APP_INFO" | grep -o 'https://[^"]*databricksapps.com' | head -1)

echo ""
echo "========================================="
echo "✅ Deployment Complete!"
echo "========================================="
echo ""
echo "🌐 Application URL:"
echo "   $APP_URL"
echo ""
echo "🔍 Quick Tests:"
echo "   Health Check:"
echo "   curl $APP_URL/api/health"
echo ""
echo "   Open in Browser:"
echo "   open $APP_URL"
echo ""
echo "📊 Check Status:"
echo "   databricks apps get $APP_NAME"
echo ""
echo "📝 View Logs:"
echo "   databricks apps list-deployments $APP_NAME"
echo ""

