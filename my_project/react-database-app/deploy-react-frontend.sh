#!/bin/bash

# Deploy React Frontend + FastAPI Backend to Databricks Apps
# This script deploys the full-stack application with proper static file serving

set -e

# Configuration
APP_NAME="cms-npi-app"
WORKSPACE_PATH="/Workspace/Users/pawanpreet.sangari@databricks.com/apps/$APP_NAME"

echo "🚀 Deploying Full-Stack React + FastAPI Application"
echo "===================================================="
echo ""

# Step 1: Verify React build exists
echo "📦 Step 1/5: Verifying React build..."
if [ ! -d "frontend/build" ]; then
    echo "❌ Error: frontend/build directory not found!"
    echo ""
    echo "Please build the React app first:"
    echo "  cd frontend"
    echo "  npm install"
    echo "  npm run build"
    echo "  cd .."
    exit 1
fi

echo "✅ React build verified"
echo "   Files: $(find frontend/build -type f | wc -l) files"
echo ""

# Step 2: Create workspace directory structure
echo "📁 Step 2/5: Setting up workspace directory structure..."
databricks workspace mkdirs "$WORKSPACE_PATH"
echo "✅ Workspace ready: $WORKSPACE_PATH"
echo ""

# Step 3: Upload React build as 'frontend'
echo "📤 Step 3/5: Uploading React frontend..."
echo "   Uploading frontend/build/ to $WORKSPACE_PATH/frontend/"

# Delete old frontend if exists
databricks workspace delete "$WORKSPACE_PATH/frontend" --recursive 2>/dev/null || true

# Upload the entire build directory
databricks workspace import-dir frontend/build "$WORKSPACE_PATH/frontend" --overwrite

echo "✅ Frontend uploaded successfully"
echo ""

# Step 4: Upload backend (optional, for future use)
echo "📤 Step 4/5: Uploading backend files..."

# Delete old backend if exists
databricks workspace delete "$WORKSPACE_PATH/backend" --recursive 2>/dev/null || true

# Upload backend
databricks workspace import-dir backend "$WORKSPACE_PATH/backend" --overwrite

echo "✅ Backend uploaded successfully"
echo ""

# Step 5: Deploy with app configuration
echo "🚀 Step 5/5: Deploying application with configuration..."

# Delete existing app.yaml
databricks workspace delete "$WORKSPACE_PATH/app.yaml" 2>/dev/null || true

# Upload new app.yaml
echo "   Uploading app-react-frontend.yaml as app.yaml..."
databricks workspace import "$WORKSPACE_PATH/app.yaml" \
    --file app-react-frontend.yaml \
    --language PYTHON

echo "✅ Configuration uploaded"
echo ""

# Check if app exists
echo "🔍 Checking application status..."
if ! databricks apps get "$APP_NAME" &>/dev/null; then
    echo "📱 Creating new app: $APP_NAME..."
    databricks apps create "$APP_NAME"
    echo "✅ App created"
else
    echo "✅ App exists: $APP_NAME"
fi
echo ""

# Deploy the application
echo "🚀 Deploying to Databricks Apps..."
echo "   Source: $WORKSPACE_PATH"
echo ""

databricks apps deploy "$APP_NAME" --source-code-path "$WORKSPACE_PATH"

echo ""
echo "===================================================="
echo "✅ Deployment Complete!"
echo "===================================================="
echo ""
echo "🌐 App URL:"
echo "   https://cms-npi-app-519179000643598.aws.databricksapps.com"
echo ""
echo "🔍 Test the application:"
echo "   API Health Check:"
echo "   curl https://cms-npi-app-519179000643598.aws.databricksapps.com/api/health"
echo ""
echo "   View in browser (requires authentication):"
echo "   open https://cms-npi-app-519179000643598.aws.databricksapps.com"
echo ""
echo "📊 Check app status:"
echo "   databricks apps get $APP_NAME"
echo ""
echo "📋 View logs:"
echo "   databricks apps logs $APP_NAME"
echo ""

