#!/bin/bash

echo "🔍 Path Verification"
echo "===================="
echo ""

APP_NAME="demo-app"
WORKSPACE_PATH="/Workspace/Users/pawanpreet.sangari@databricks.com/dataconnect_apps/my_project/demo-app"

echo "✅ Configuration:"
echo "   App Name: $APP_NAME"
echo "   Workspace Path: $WORKSPACE_PATH"
echo ""

echo "✅ What will be uploaded:"
echo "   Frontend: frontend/dist/ → $WORKSPACE_PATH/static/"
echo "   Backend:  backend/*.py   → $WORKSPACE_PATH/"
echo ""

echo "✅ Expected workspace structure after deploy:"
echo "   $WORKSPACE_PATH/"
echo "   ├── app.py"
echo "   ├── requirements.txt"
echo "   ├── app.yaml"
echo "   └── static/"
echo "       ├── index.html"
echo "       └── assets/"
echo ""

echo "✅ Deploy command that will be used:"
echo "   databricks apps deploy \"$APP_NAME\" \"$WORKSPACE_PATH\" dev"
echo ""

echo "Press Enter to continue with fresh-start.sh or Ctrl+C to cancel..."
read

