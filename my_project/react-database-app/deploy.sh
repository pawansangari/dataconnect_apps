#!/bin/bash
set -e

# ============================================================================
# Databricks Apps Deployment Script
# CMS-10114 NPI Application (React + FastAPI)
# ============================================================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="${1:-cms-npi-app}"
ENVIRONMENT="${2:-dev}"  # dev or prod

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}CMS NPI Application Deployment${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "App Name: ${GREEN}$APP_NAME${NC}"
echo -e "Environment: ${GREEN}$ENVIRONMENT${NC}"
echo ""

# Check if databricks CLI is installed
if ! command -v databricks &> /dev/null; then
    echo -e "${RED}❌ Databricks CLI not found. Please install it first:${NC}"
    echo "   pip install databricks-cli"
    exit 1
fi

# Check if authenticated
echo -e "${YELLOW}📋 Checking Databricks authentication...${NC}"
if ! databricks current-user me &> /dev/null; then
    echo -e "${RED}❌ Not authenticated with Databricks${NC}"
    echo "Please run: databricks auth login --host https://your-workspace.cloud.databricks.com"
    exit 1
fi
echo -e "${GREEN}✅ Authenticated${NC}"

# Get current user
CURRENT_USER=$(databricks current-user me | grep -o '"userName":"[^"]*"' | cut -d'"' -f4)
echo -e "User: ${GREEN}$CURRENT_USER${NC}"

# Set workspace path
WORKSPACE_PATH="/Users/$CURRENT_USER/apps/$APP_NAME"
echo -e "Workspace path: ${GREEN}$WORKSPACE_PATH${NC}"
echo ""

# Step 1: Build Frontend
echo -e "${YELLOW}📦 Step 1/5: Building frontend...${NC}"
cd frontend

if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ package.json not found. Are you in the correct directory?${NC}"
    exit 1
fi

echo "Installing dependencies..."
npm install

echo "Creating production build..."
npm run build

if [ ! -d "build" ]; then
    echo -e "${RED}❌ Frontend build failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Frontend built successfully${NC}"
cd ..
echo ""

# Step 2: Verify Backend
echo -e "${YELLOW}📋 Step 2/5: Verifying backend...${NC}"
if [ ! -f "backend/main.py" ]; then
    echo -e "${RED}❌ backend/main.py not found${NC}"
    exit 1
fi

if [ ! -f "backend/requirements.txt" ]; then
    echo -e "${RED}❌ backend/requirements.txt not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Backend files verified${NC}"
echo ""

# Step 3: Create Workspace Directory
echo -e "${YELLOW}📁 Step 3/5: Creating workspace directory...${NC}"
databricks workspace mkdirs "$WORKSPACE_PATH" 2>/dev/null || true
databricks workspace mkdirs "$WORKSPACE_PATH/backend" 2>/dev/null || true
databricks workspace mkdirs "$WORKSPACE_PATH/frontend" 2>/dev/null || true
echo -e "${GREEN}✅ Workspace directory created${NC}"
echo ""

# Step 4: Upload Files
echo -e "${YELLOW}📤 Step 4/5: Uploading application files...${NC}"

echo "Uploading backend..."
databricks workspace import-dir backend "$WORKSPACE_PATH/backend" --overwrite

echo "Uploading frontend..."
databricks workspace import-dir frontend/build "$WORKSPACE_PATH/frontend" --overwrite

echo "Uploading configuration..."
# Delete existing app.yaml if it exists
databricks workspace delete "$WORKSPACE_PATH/app.yaml" 2>/dev/null || true

if [ -f "app.yaml" ]; then
    databricks workspace import "$WORKSPACE_PATH/app.yaml" --file app.yaml --language PYTHON
else
    echo -e "${YELLOW}⚠️  app.yaml not found, using default configuration${NC}"
fi

echo -e "${GREEN}✅ Files uploaded successfully${NC}"
echo ""

# Step 5: Deploy Application
echo -e "${YELLOW}🚀 Step 5/5: Deploying application...${NC}"
echo "Running: databricks apps deploy \"$APP_NAME\" --source-code-path \"$WORKSPACE_PATH\""
echo ""

if databricks apps deploy "$APP_NAME" --source-code-path "$WORKSPACE_PATH"; then
    echo -e "${GREEN}✅ Application deployed successfully!${NC}"
else
    echo -e "${RED}❌ Deployment failed. Check logs with:${NC}"
    echo "   databricks apps logs $APP_NAME"
    exit 1
fi
echo ""

# Wait for app to start
echo -e "${YELLOW}⏳ Waiting for application to start...${NC}"
sleep 15

# Get App Information
echo -e "${YELLOW}📱 Getting application details...${NC}"
APP_INFO=$(databricks apps get "$APP_NAME" 2>/dev/null || echo "{}")

if [ "$APP_INFO" != "{}" ]; then
    APP_URL=$(echo "$APP_INFO" | grep -o '"url":"[^"]*"' | cut -d'"' -f4 | head -1)
    
    if [ -n "$APP_URL" ]; then
        echo -e "${GREEN}✅ Application URL: $APP_URL${NC}"
        echo ""
        
        # Test Health Endpoint
        echo -e "${YELLOW}🏥 Testing health endpoint...${NC}"
        HEALTH_URL="$APP_URL/api/health"
        
        if curl -f -s "$HEALTH_URL" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Backend health check passed${NC}"
        else
            echo -e "${YELLOW}⚠️  Backend health check failed (app may still be starting)${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Could not retrieve app URL${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Could not retrieve app details${NC}"
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. View logs: ${GREEN}databricks apps logs $APP_NAME${NC}"
echo "2. Check status: ${GREEN}databricks apps get $APP_NAME${NC}"
echo "3. Access app: Open the URL shown above"
echo ""
echo -e "${YELLOW}Troubleshooting:${NC}"
echo "• View logs: ${GREEN}databricks apps logs $APP_NAME --follow${NC}"
echo "• Restart app: ${GREEN}databricks apps restart $APP_NAME${NC}"
echo "• Delete app: ${GREEN}databricks apps delete $APP_NAME${NC}"
echo ""

