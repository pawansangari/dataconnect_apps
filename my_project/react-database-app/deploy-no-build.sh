#!/bin/bash
set -e

# ============================================================================
# Databricks Apps Deployment Script (No Local Build Required)
# CMS-10114 NPI Application - Deploys source code, builds on Databricks
# ============================================================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="${1:-cms-npi-app}"
ENVIRONMENT="${2:-dev}"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}CMS NPI Application Deployment${NC}"
echo -e "${BLUE}(No Local Build Required)${NC}"
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

# Step 1: Verify Files
echo -e "${YELLOW}📋 Step 1/4: Verifying files...${NC}"
if [ ! -f "backend/main.py" ]; then
    echo -e "${RED}❌ backend/main.py not found${NC}"
    exit 1
fi

if [ ! -d "frontend/src" ]; then
    echo -e "${RED}❌ frontend/src not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Files verified${NC}"
echo ""

# Step 2: Create Workspace Directory
echo -e "${YELLOW}📁 Step 2/4: Creating workspace directory...${NC}"
databricks workspace mkdirs "$WORKSPACE_PATH" 2>/dev/null || true
databricks workspace mkdirs "$WORKSPACE_PATH/backend" 2>/dev/null || true
databricks workspace mkdirs "$WORKSPACE_PATH/frontend" 2>/dev/null || true
echo -e "${GREEN}✅ Workspace directory created${NC}"
echo ""

# Step 3: Upload Files (source code, not built)
echo -e "${YELLOW}📤 Step 3/4: Uploading application files...${NC}"

echo "Uploading backend..."
databricks workspace import-dir backend "$WORKSPACE_PATH/backend" --overwrite

echo "Uploading frontend source..."
databricks workspace import-dir frontend "$WORKSPACE_PATH/frontend" --overwrite

echo "Uploading configuration..."
if [ -f "app.yaml" ]; then
    databricks workspace import "$WORKSPACE_PATH/app.yaml" --file app.yaml --overwrite
else
    echo -e "${YELLOW}⚠️  app.yaml not found, creating default${NC}"
    cat > /tmp/app_temp.yaml << 'EOF'
command: ["sh", "-c", "cd backend && pip install -r requirements.txt && uvicorn main:app --host 0.0.0.0 --port 8000"]
EOF
    databricks workspace import "$WORKSPACE_PATH/app.yaml" --file /tmp/app_temp.yaml --overwrite
    rm /tmp/app_temp.yaml
fi

echo -e "${GREEN}✅ Files uploaded successfully${NC}"
echo ""

# Step 4: Deploy Application
echo -e "${YELLOW}🚀 Step 4/4: Deploying application...${NC}"
echo "Running: databricks apps deploy \"$APP_NAME\" \"$WORKSPACE_PATH\" \"$ENVIRONMENT\""
echo ""

if databricks apps deploy "$APP_NAME" "$WORKSPACE_PATH" "$ENVIRONMENT"; then
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
echo -e "${YELLOW}Note:${NC} Frontend will be built on Databricks on first access."
echo -e "This may take a few minutes the first time."
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. View logs: ${GREEN}databricks apps logs $APP_NAME${NC}"
echo "2. Check status: ${GREEN}databricks apps get $APP_NAME${NC}"
echo "3. Access app: Open the URL shown above"
echo ""
echo -e "${YELLOW}If you want to build locally (faster):${NC}"
echo "1. Install Node.js: ${GREEN}brew install node${NC}"
echo "2. Run: ${GREEN}./deploy.sh $APP_NAME $ENVIRONMENT${NC}"
echo ""

