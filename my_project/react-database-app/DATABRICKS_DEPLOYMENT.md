# Databricks Apps Deployment Guide - React CMS NPI Application

## Overview

This guide provides step-by-step instructions for deploying the React + FastAPI application to Databricks Apps.

---

## Prerequisites

Before deploying, ensure you have:

- ✅ Databricks CLI installed and configured
- ✅ Databricks workspace access with Apps permissions
- ✅ Database connection details (PGDATABASE, PGUSER, etc.)
- ✅ Node.js and npm installed (for building frontend)
- ✅ Python 3.8+ installed

---

## Deployment Architecture

```
Databricks Workspace
    │
    ├── Frontend (React) → Port 3000
    │   └── Served as static files
    │
    └── Backend (FastAPI) → Port 8000
        └── API endpoints + Database connection
```

---

## Step 1: Prepare the Application

### 1.1 Build the Frontend

```bash
cd /Users/pawanpreet.sangari/dataconnect_apps/my_project/react-database-app/frontend

# Install dependencies
npm install

# Create production build
npm run build
```

This creates an optimized production bundle in `frontend/build/`

### 1.2 Verify Backend Requirements

```bash
cd /Users/pawanpreet.sangari/dataconnect_apps/my_project/react-database-app/backend

# Ensure requirements.txt is complete
cat requirements.txt
```

Should contain:
```
fastapi>=0.104.0
uvicorn[standard]>=0.24.0
psycopg[binary,pool]>=3.1.0
databricks-sdk>=0.18.0
pydantic>=2.0.0
python-multipart>=0.0.6
```

---

## Step 2: Configure Databricks CLI

### 2.1 Install Databricks CLI (if not already installed)

```bash
# Using pip
pip install databricks-cli

# Or using Homebrew (macOS)
brew tap databricks/tap
brew install databricks
```

### 2.2 Authenticate with Databricks

```bash
# Interactive authentication
databricks auth login --host https://your-workspace.cloud.databricks.com

# Or set environment variables
export DATABRICKS_HOST="https://your-workspace.cloud.databricks.com"
export DATABRICKS_TOKEN="your_personal_access_token"
```

### 2.3 Verify Authentication

```bash
# Test connection
databricks workspace list /Users
```

---

## Step 3: Upload App to Workspace

### 3.1 Create Workspace Directory

```bash
# Set variables
export APP_NAME="cms-npi-app"
export WORKSPACE_PATH="/Users/$(databricks current-user me | jq -r .userName)/apps/$APP_NAME"

# Create directory
databricks workspace mkdirs "$WORKSPACE_PATH"
```

### 3.2 Upload Application Files

```bash
cd /Users/pawanpreet.sangari/dataconnect_apps/my_project/react-database-app

# Upload backend
databricks workspace import-dir backend "$WORKSPACE_PATH/backend" --overwrite

# Upload frontend build
databricks workspace import-dir frontend/build "$WORKSPACE_PATH/frontend" --overwrite

# Upload configuration
databricks workspace import app.yaml "$WORKSPACE_PATH/app.yaml" --overwrite
```

### Alternative: Use DBFS

```bash
# Upload to DBFS
databricks fs cp -r backend dbfs:/apps/$APP_NAME/backend
databricks fs cp -r frontend/build dbfs:/apps/$APP_NAME/frontend
databricks fs cp app.yaml dbfs:/apps/$APP_NAME/app.yaml
```

---

## Step 4: Configure app.yaml for Production

Create an updated `app.yaml` for Databricks deployment:

```yaml
# app.yaml
name: cms-npi-app
description: CMS-10114 NPI Application Form

# Environment variables for the app
env:
  - name: PGDATABASE
    value: "{{ secrets/db-scope/database }}"
  - name: PGUSER
    value: "{{ secrets/db-scope/user }}"
  - name: PGHOST
    value: "{{ secrets/db-scope/host }}"
  - name: PGPORT
    value: "5432"
  - name: PGSSLMODE
    value: "require"
  - name: PGAPPNAME
    value: "npi_app"

# Services configuration
services:
  - name: backend
    command: ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
    working_directory: /app/backend
    port: 8000
    
  - name: frontend
    command: ["python", "-m", "http.server", "3000", "--directory", "/app/frontend"]
    working_directory: /app/frontend
    port: 3000

# Resource configuration
resources:
  cpu: "2"
  memory: "4Gi"
```

---

## Step 5: Set Up Databricks Secrets

Store sensitive information in Databricks Secrets:

### 5.1 Create Secret Scope

```bash
# Create scope (if not exists)
databricks secrets create-scope --scope db-scope
```

### 5.2 Add Database Secrets

```bash
# Add database credentials
databricks secrets put --scope db-scope --key database --string-value "your_database"
databricks secrets put --scope db-scope --key user --string-value "your_user@databricks.com"
databricks secrets put --scope db-scope --key host --string-value "your-host.azuredatabricks.net"
```

### 5.3 Verify Secrets

```bash
# List secrets (values are hidden)
databricks secrets list --scope db-scope
```

---

## Step 6: Deploy the Application

### Option A: Simple Deployment

```bash
# Set variables
export LAKEHOUSE_APP_NAME="cms-npi-app"
export APP_FOLDER_IN_WORKSPACE="$WORKSPACE_PATH"

# Deploy to development environment
databricks apps deploy "$LAKEHOUSE_APP_NAME" "$APP_FOLDER_IN_WORKSPACE" dev

# Or deploy to production
databricks apps deploy "$LAKEHOUSE_APP_NAME" "$APP_FOLDER_IN_WORKSPACE" prod
```

### Option B: Deployment with Configuration

```bash
# Deploy with specific configuration file
databricks apps deploy \
  --app-name cms-npi-app \
  --source-path "$WORKSPACE_PATH" \
  --environment dev \
  --config-file app.yaml
```

### Option C: Using Python API

Create `deploy.py`:

```python
from databricks.sdk import WorkspaceClient
from databricks.sdk.service.apps import App

w = WorkspaceClient()

# Create or update app
app = w.apps.create(
    name="cms-npi-app",
    description="CMS-10114 NPI Application",
    source_code_path=f"{WORKSPACE_PATH}",
)

print(f"App deployed: {app.name}")
print(f"App URL: {app.url}")
```

Run deployment:
```bash
python deploy.py
```

---

## Step 7: Verify Deployment

### 7.1 Check App Status

```bash
# List all apps
databricks apps list

# Get specific app details
databricks apps get cms-npi-app

# Check app logs
databricks apps logs cms-npi-app
```

### 7.2 Access the Application

```bash
# Get app URL
APP_URL=$(databricks apps get cms-npi-app | jq -r .url)
echo "Application URL: $APP_URL"

# Open in browser (macOS)
open "$APP_URL"
```

### 7.3 Test Health Endpoints

```bash
# Test backend health
curl "$APP_URL/api/health"

# Test frontend
curl "$APP_URL"
```

---

## Step 8: Monitor and Manage

### View Logs

```bash
# Stream logs
databricks apps logs cms-npi-app --follow

# View last 100 lines
databricks apps logs cms-npi-app --tail 100

# Filter backend logs
databricks apps logs cms-npi-app --service backend

# Filter frontend logs
databricks apps logs cms-npi-app --service frontend
```

### Update Application

```bash
# Make changes to code
# Rebuild frontend (if needed)
cd frontend && npm run build

# Re-upload files
databricks workspace import-dir backend "$WORKSPACE_PATH/backend" --overwrite
databricks workspace import-dir frontend/build "$WORKSPACE_PATH/frontend" --overwrite

# Restart app
databricks apps restart cms-npi-app
```

### Scale Application

```bash
# Update resources in app.yaml
# Then redeploy
databricks apps deploy "$LAKEHOUSE_APP_NAME" "$APP_FOLDER_IN_WORKSPACE" prod
```

---

## Complete Deployment Script

Create `deploy.sh`:

```bash
#!/bin/bash
set -e

# Configuration
export APP_NAME="cms-npi-app"
export ENVIRONMENT="dev"  # or "prod"
export WORKSPACE_PATH="/Users/$(databricks current-user me | jq -r .userName)/apps/$APP_NAME"

echo "🚀 Deploying CMS NPI Application to Databricks..."

# Step 1: Build Frontend
echo "📦 Building frontend..."
cd frontend
npm install
npm run build
cd ..

# Step 2: Create workspace directory
echo "📁 Creating workspace directory..."
databricks workspace mkdirs "$WORKSPACE_PATH" || true

# Step 3: Upload files
echo "📤 Uploading application files..."
databricks workspace import-dir backend "$WORKSPACE_PATH/backend" --overwrite
databricks workspace import-dir frontend/build "$WORKSPACE_PATH/frontend" --overwrite
databricks workspace import app.yaml "$WORKSPACE_PATH/app.yaml" --overwrite

# Step 4: Deploy app
echo "🚀 Deploying application..."
databricks apps deploy "$APP_NAME" "$WORKSPACE_PATH" "$ENVIRONMENT"

# Step 5: Get app URL
echo "✅ Deployment complete!"
APP_URL=$(databricks apps get "$APP_NAME" | jq -r .url)
echo "📱 Application URL: $APP_URL"

# Step 6: Test health
echo "🏥 Testing health endpoint..."
sleep 10
curl -f "$APP_URL/api/health" && echo "✅ Backend healthy" || echo "❌ Backend check failed"

echo "🎉 Deployment completed successfully!"
```

Make executable and run:
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## Troubleshooting

### Issue: "App deployment failed"

**Check logs:**
```bash
databricks apps logs cms-npi-app --tail 200
```

**Common causes:**
- Missing dependencies in requirements.txt
- Incorrect file paths
- Database connection issues
- Insufficient permissions

### Issue: "Database connection failed"

**Verify secrets:**
```bash
databricks secrets list --scope db-scope
```

**Test connection from notebook:**
```python
import os
import psycopg

conn = psycopg.connect(
    dbname=os.getenv('PGDATABASE'),
    user=os.getenv('PGUSER'),
    host=os.getenv('PGHOST'),
    port=os.getenv('PGPORT'),
    sslmode=os.getenv('PGSSLMODE')
)
print("✅ Connection successful")
```

### Issue: "Frontend not loading"

**Check frontend build:**
```bash
# Verify build exists
ls -la frontend/build

# Check uploaded files
databricks workspace list "$WORKSPACE_PATH/frontend"
```

**Verify frontend service:**
```bash
# Check service status
databricks apps get cms-npi-app | jq '.services[] | select(.name=="frontend")'
```

### Issue: "API calls return 502"

**Check backend service:**
```bash
# View backend logs
databricks apps logs cms-npi-app --service backend --tail 50

# Check if backend is running
curl "$APP_URL/api/health"
```

### Issue: "CORS errors"

**Update FastAPI CORS in backend/main.py:**
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-workspace.cloud.databricks.com",
        "https://*.databricks.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Production Checklist

Before deploying to production:

- [ ] Frontend built with `npm run build`
- [ ] All secrets configured in Databricks
- [ ] Database connection tested
- [ ] CORS properly configured
- [ ] Environment variables set
- [ ] Resource limits appropriate
- [ ] Logging configured
- [ ] Health checks passing
- [ ] SSL/TLS enabled
- [ ] Backup strategy in place
- [ ] Monitoring alerts configured
- [ ] Documentation updated
- [ ] Team notified

---

## Useful Commands Reference

```bash
# Deployment
databricks apps deploy cms-npi-app "$WORKSPACE_PATH" dev
databricks apps deploy cms-npi-app "$WORKSPACE_PATH" prod

# Management
databricks apps list
databricks apps get cms-npi-app
databricks apps restart cms-npi-app
databricks apps delete cms-npi-app

# Logs
databricks apps logs cms-npi-app
databricks apps logs cms-npi-app --follow
databricks apps logs cms-npi-app --service backend
databricks apps logs cms-npi-app --tail 100

# Secrets
databricks secrets create-scope --scope db-scope
databricks secrets put --scope db-scope --key database
databricks secrets list --scope db-scope

# Workspace
databricks workspace mkdirs /path
databricks workspace import file.py /path/file.py
databricks workspace import-dir ./dir /path/dir
databricks workspace list /path
```

---

## Environment-Specific Configurations

### Development Environment

```yaml
# app.dev.yaml
name: cms-npi-app-dev
environment: dev
resources:
  cpu: "1"
  memory: "2Gi"
log_level: DEBUG
```

### Production Environment

```yaml
# app.prod.yaml
name: cms-npi-app
environment: prod
resources:
  cpu: "4"
  memory: "8Gi"
log_level: INFO
auto_scaling:
  min_instances: 2
  max_instances: 10
```

Deploy with specific config:
```bash
databricks apps deploy cms-npi-app "$WORKSPACE_PATH" prod --config app.prod.yaml
```

---

## Monitoring and Alerts

### Set Up Monitoring

```python
# monitor.py
from databricks.sdk import WorkspaceClient
from databricks.sdk.service import jobs

w = WorkspaceClient()

# Create monitoring job
job = w.jobs.create(
    name="cms-npi-app-monitor",
    tasks=[{
        "task_key": "health_check",
        "python_task": {
            "python_file": "dbfs:/apps/cms-npi-app/monitor.py"
        }
    }],
    schedule={"quartz_cron_expression": "0 */5 * * * ?"}  # Every 5 minutes
)
```

### Health Check Script

```python
# monitor.py
import requests
import sys

APP_URL = "https://your-workspace.cloud.databricks.com/apps/cms-npi-app"

try:
    response = requests.get(f"{APP_URL}/api/health", timeout=10)
    if response.status_code == 200:
        print("✅ App is healthy")
        sys.exit(0)
    else:
        print(f"❌ App returned status {response.status_code}")
        sys.exit(1)
except Exception as e:
    print(f"❌ Health check failed: {e}")
    sys.exit(1)
```

---

## Rollback Procedure

If deployment fails or has issues:

```bash
# List previous versions
databricks apps versions cms-npi-app

# Rollback to previous version
databricks apps rollback cms-npi-app --version previous

# Or rollback to specific version
databricks apps rollback cms-npi-app --version 1.0.5
```

---

## Additional Resources

- **Databricks Apps Documentation**: https://docs.databricks.com/dev-tools/databricks-apps/
- **Databricks CLI Reference**: https://docs.databricks.com/dev-tools/cli/
- **Databricks SDK for Python**: https://databricks-sdk-py.readthedocs.io/

---

## Support

For deployment issues:
1. Check Databricks Apps logs
2. Review this deployment guide
3. Test database connectivity
4. Verify all secrets are configured
5. Contact Databricks support if needed

---

**Last Updated**: October 22, 2025  
**Version**: 1.0.0

