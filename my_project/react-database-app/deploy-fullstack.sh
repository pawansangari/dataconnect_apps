#!/bin/bash

# Full-stack deployment script for React + FastAPI app
# This script deploys both the built React frontend and FastAPI backend

set -e

# Configuration
APP_NAME="cms-npi-app"
WORKSPACE_PATH="/Workspace/Users/pawanpreet.sangari@databricks.com/apps/$APP_NAME"

echo "🚀 Deploying Full-Stack React + FastAPI App"
echo "============================================"
echo ""

# Step 1: Check if build exists
echo "📦 Step 1/5: Checking React build..."
if [ ! -d "frontend/build" ]; then
    echo "❌ Error: frontend/build directory not found!"
    echo "Run 'npm run build' in the frontend directory first."
    exit 1
fi
echo "✅ React build found"
echo ""

# Step 2: Create workspace directory
echo "📁 Step 2/5: Creating workspace directory..."
databricks workspace mkdirs "$WORKSPACE_PATH"
echo "✅ Workspace directory ready"
echo ""

# Step 3: Upload backend
echo "📤 Step 3/5: Uploading backend..."
databricks workspace delete "$WORKSPACE_PATH/backend" --recursive || true
databricks workspace import-dir backend "$WORKSPACE_PATH/backend" --overwrite
echo "✅ Backend uploaded"
echo ""

# Step 4: Upload built frontend
echo "📤 Step 4/5: Uploading built frontend..."
databricks workspace delete "$WORKSPACE_PATH/frontend" --recursive || true
databricks workspace import-dir frontend/build "$WORKSPACE_PATH/frontend" --overwrite
echo "✅ Frontend uploaded"
echo ""

# Step 5: Upload and deploy with app.yaml
echo "📤 Step 5/5: Uploading app configuration and deploying..."

# Delete existing app.yaml if it exists
databricks workspace delete "$WORKSPACE_PATH/app.yaml" || true

# Upload app.yaml
databricks workspace import "$WORKSPACE_PATH/app.yaml" \
    --file app-fullstack.yaml \
    --language PYTHON

echo "✅ Configuration uploaded"
echo ""

# Check if app exists, create if it doesn't
echo "🔍 Checking if app exists..."
if ! databricks apps get "$APP_NAME" &>/dev/null; then
    echo "Creating new app..."
    databricks apps create "$APP_NAME"
    echo "✅ App created"
else
    echo "✅ App already exists"
fi
echo ""

# Deploy the app
echo "🚀 Deploying application..."
echo "Running: databricks apps deploy \"$APP_NAME\" --source-code-path \"$WORKSPACE_PATH\""
databricks apps deploy "$APP_NAME" --source-code-path "$WORKSPACE_PATH"

echo ""
echo "============================================"
echo "✅ Deployment complete!"
echo ""
echo "App URL: https://cms-npi-app-519179000643598.aws.databricksapps.com"
echo ""
echo "Test the API:"
echo "  curl https://cms-npi-app-519179000643598.aws.databricksapps.com/api/health"
echo ""

