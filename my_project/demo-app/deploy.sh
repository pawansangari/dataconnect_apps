#!/bin/bash

# Accept parameters - UPDATED WITH CORRECT PATH
APP_FOLDER_IN_WORKSPACE=${1:-"/Workspace/Users/pawanpreet.sangari@databricks.com/dataconnect_apps/my_project/demo-app"}
# Databricks App must already have been created. You can do so with the Databricks CLI or via the UI in a Workspace.
LAKEHOUSE_APP_NAME=${2:-"demo-app"}

echo "🚀 Deploying Databricks Demo App"
echo "=================================="
echo ""
echo "📍 Workspace Path: $APP_FOLDER_IN_WORKSPACE"
echo "📱 App Name: $LAKEHOUSE_APP_NAME"
echo ""

# Frontend build and import
echo "📦 Building and uploading frontend..."
(
  cd frontend
  npm run build:ignore-types
  databricks workspace import-dir dist "$APP_FOLDER_IN_WORKSPACE/static" --overwrite
) &

# Backend packaging
echo "📦 Packaging and uploading backend..."
(
  cd backend
  mkdir -p build
  # Exclude all hidden files and app_prod.py
  find . -mindepth 1 -maxdepth 1 -not -name '.*' -not -name "local_conf*" -not -name 'build' -not -name '__pycache__' -exec cp -r {} build/ \;
  if [ -f app_prod.py ]; then
    cp app_prod.py build/app.py
  fi
  # Import and deploy the application
  databricks workspace import-dir build "$APP_FOLDER_IN_WORKSPACE" --overwrite
  rm -rf build
) &

# Wait for both background processes to finish
wait

echo ""
echo "🚀 Deploying application..."
# Deploy the application
databricks apps deploy "$LAKEHOUSE_APP_NAME" "$APP_FOLDER_IN_WORKSPACE" dev

echo ""
echo "=================================="
echo "✅ Deployment Complete!"
echo "=================================="
echo ""
echo "🌐 Open the app page for details and permission:"
echo "   https://dbc-c542a15f-437f.cloud.databricks.com/apps/$LAKEHOUSE_APP_NAME"
echo ""
echo "📊 Check app status:"
echo "   databricks apps get $LAKEHOUSE_APP_NAME"
echo ""
