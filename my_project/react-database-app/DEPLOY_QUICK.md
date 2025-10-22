# Quick Deployment Guide - Databricks Apps

## 🚀 Deploy in 3 Steps

### Prerequisites
- Databricks CLI installed: `pip install databricks-cli`
- Authenticated: `databricks auth login --host https://your-workspace.cloud.databricks.com`
- Node.js installed for building frontend

---

## Option 1: Automated Deployment (Recommended)

### Single Command Deployment

```bash
cd /Users/pawanpreet.sangari/dataconnect_apps/my_project/react-database-app

# Run deployment script
./deploy.sh cms-npi-app dev
```

**That's it!** The script will:
1. ✅ Build the frontend
2. ✅ Verify backend files
3. ✅ Upload to Databricks workspace
4. ✅ Deploy the application
5. ✅ Test health endpoints

---

## Option 2: Manual Deployment

### Step 1: Build Frontend
```bash
cd frontend
npm install
npm run build
cd ..
```

### Step 2: Set Variables
```bash
export APP_NAME="cms-npi-app"
export ENVIRONMENT="dev"
export WORKSPACE_PATH="/Users/$(databricks current-user me | jq -r .userName)/apps/$APP_NAME"
```

### Step 3: Upload & Deploy
```bash
# Create workspace directory
databricks workspace mkdirs "$WORKSPACE_PATH"

# Upload files
databricks workspace import-dir backend "$WORKSPACE_PATH/backend" --overwrite
databricks workspace import-dir frontend/build "$WORKSPACE_PATH/frontend" --overwrite

# Deploy (using your command format)
databricks apps deploy "$APP_NAME" "$WORKSPACE_PATH" "$ENVIRONMENT"
```

---

## Configure Database Secrets

Before first deployment, set up database credentials:

```bash
# Create secret scope
databricks secrets create-scope --scope db-scope

# Add credentials
databricks secrets put --scope db-scope --key database --string-value "your_database"
databricks secrets put --scope db-scope --key user --string-value "your_user@databricks.com"
databricks secrets put --scope db-scope --key host --string-value "your-host.azuredatabricks.net"
```

---

## Verify Deployment

```bash
# Check status
databricks apps get cms-npi-app

# View logs
databricks apps logs cms-npi-app

# Test health
APP_URL=$(databricks apps get cms-npi-app | jq -r .url)
curl "$APP_URL/api/health"
```

---

## Quick Commands Reference

```bash
# Deploy to dev
databricks apps deploy cms-npi-app "$WORKSPACE_PATH" dev

# Deploy to prod
databricks apps deploy cms-npi-app "$WORKSPACE_PATH" prod

# Restart app
databricks apps restart cms-npi-app

# View logs (follow)
databricks apps logs cms-npi-app --follow

# Delete app
databricks apps delete cms-npi-app
```

---

## Troubleshooting

### App not starting?
```bash
# Check logs
databricks apps logs cms-npi-app --tail 100

# Verify files uploaded
databricks workspace list "$WORKSPACE_PATH"
```

### Database connection issues?
```bash
# Verify secrets
databricks secrets list --scope db-scope

# Check environment variables in logs
databricks apps logs cms-npi-app | grep -i "pg"
```

### Frontend not loading?
```bash
# Verify build exists
ls -la frontend/build

# Check frontend service logs
databricks apps logs cms-npi-app --service frontend
```

---

## Production Deployment

For production, use the enhanced configuration:

```bash
# Use production config
databricks apps deploy cms-npi-app "$WORKSPACE_PATH" prod \
  --config app.databricks.yaml

# Or with the script
./deploy.sh cms-npi-app prod
```

---

## Environment Variables

If not using secrets, set environment variables directly:

```bash
# In app.yaml, use direct values (not recommended for prod)
env:
  - name: PGDATABASE
    value: "your_database"
  - name: PGUSER
    value: "your_user"
  - name: PGHOST
    value: "your_host"
```

---

## Complete Example

```bash
# 1. Navigate to project
cd /Users/pawanpreet.sangari/dataconnect_apps/my_project/react-database-app

# 2. Set up secrets (one-time)
databricks secrets create-scope --scope db-scope
databricks secrets put --scope db-scope --key database
databricks secrets put --scope db-scope --key user
databricks secrets put --scope db-scope --key host

# 3. Deploy using script
./deploy.sh cms-npi-app dev

# 4. Access your app
databricks apps get cms-npi-app
```

---

## Next Steps

After deployment:
1. ✅ Access the application URL
2. ✅ Test the form submission
3. ✅ Monitor logs for errors
4. ✅ Set up alerts (optional)
5. ✅ Configure auto-scaling (optional)

---

## Support

- Full guide: See `DATABRICKS_DEPLOYMENT.md`
- App documentation: See `README.md`
- Databricks Docs: https://docs.databricks.com/dev-tools/databricks-apps/

---

**Ready to deploy? Run:** `./deploy.sh cms-npi-app dev`

