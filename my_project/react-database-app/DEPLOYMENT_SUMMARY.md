# Databricks Deployment - Summary & Commands

## 📋 Quick Reference

Your React application is ready to deploy to Databricks Apps!

---

## 🎯 Deployment Command (Your Format)

Based on your sample command format:
```bash
databricks apps deploy "$LAKEHOUSE_APP_NAME" "$APP_FOLDER_IN_WORKSPACE" dev
```

**For this app:**
```bash
# Set variables
export LAKEHOUSE_APP_NAME="cms-npi-app"
export APP_FOLDER_IN_WORKSPACE="/Users/$(databricks current-user me | jq -r .userName)/apps/cms-npi-app"

# Deploy to development
databricks apps deploy "$LAKEHOUSE_APP_NAME" "$APP_FOLDER_IN_WORKSPACE" dev

# Deploy to production
databricks apps deploy "$LAKEHOUSE_APP_NAME" "$APP_FOLDER_IN_WORKSPACE" prod
```

---

## 🚀 Three Ways to Deploy

### Method 1: Automated Script (Easiest)
```bash
cd /Users/pawanpreet.sangari/dataconnect_apps/my_project/react-database-app
./deploy.sh cms-npi-app dev
```
✅ Handles everything automatically

### Method 2: Manual Steps (Your Format)
```bash
# 1. Build frontend
cd frontend && npm run build && cd ..

# 2. Set variables
export LAKEHOUSE_APP_NAME="cms-npi-app"
export APP_FOLDER_IN_WORKSPACE="/Users/$(databricks current-user me | jq -r .userName)/apps/cms-npi-app"

# 3. Upload files to workspace
databricks workspace mkdirs "$APP_FOLDER_IN_WORKSPACE"
databricks workspace import-dir backend "$APP_FOLDER_IN_WORKSPACE/backend" --overwrite
databricks workspace import-dir frontend/build "$APP_FOLDER_IN_WORKSPACE/frontend" --overwrite

# 4. Deploy (your command format)
databricks apps deploy "$LAKEHOUSE_APP_NAME" "$APP_FOLDER_IN_WORKSPACE" dev
```

### Method 3: Using Configuration File
```bash
databricks apps deploy cms-npi-app "$APP_FOLDER_IN_WORKSPACE" dev \
  --config app.databricks.yaml
```

---

## 📦 Pre-Deployment Checklist

Before deploying, ensure:

- [ ] Databricks CLI installed: `pip install databricks-cli`
- [ ] Authenticated: `databricks auth login`
- [ ] Node.js installed: `node --version`
- [ ] Database secrets configured (see below)
- [ ] Frontend built: `cd frontend && npm run build`

---

## 🔐 Configure Database Secrets (One-Time Setup)

```bash
# Create secret scope
databricks secrets create-scope --scope db-scope

# Add database credentials (interactive prompts)
databricks secrets put --scope db-scope --key database
# Enter: your_database_name

databricks secrets put --scope db-scope --key user
# Enter: your_user@databricks.com

databricks secrets put --scope db-scope --key host
# Enter: your-workspace.azuredatabricks.net

# Verify secrets
databricks secrets list --scope db-scope
```

**Or using command line:**
```bash
databricks secrets put --scope db-scope --key database --string-value "main"
databricks secrets put --scope db-scope --key user --string-value "user@databricks.com"
databricks secrets put --scope db-scope --key host --string-value "adb-xxx.azuredatabricks.net"
```

---

## 📊 Complete Deployment Flow

```
┌─────────────────────────────────────┐
│  1. Build Frontend                  │
│     npm run build                   │
└──────────────┬──────────────────────┘
               ↓
┌──────────────▼──────────────────────┐
│  2. Upload to Workspace             │
│     databricks workspace import-dir │
└──────────────┬──────────────────────┘
               ↓
┌──────────────▼──────────────────────┐
│  3. Deploy Application              │
│     databricks apps deploy          │
└──────────────┬──────────────────────┘
               ↓
┌──────────────▼──────────────────────┐
│  4. Application Running!            │
│     Access via provided URL         │
└─────────────────────────────────────┘
```

---

## 🎬 Step-by-Step Commands

Copy and paste these commands in order:

```bash
# Navigate to project
cd /Users/pawanpreet.sangari/dataconnect_apps/my_project/react-database-app

# Build frontend
echo "📦 Building frontend..."
cd frontend
npm install
npm run build
cd ..

# Set variables
echo "🔧 Setting variables..."
export LAKEHOUSE_APP_NAME="cms-npi-app"
export CURRENT_USER=$(databricks current-user me | jq -r .userName)
export APP_FOLDER_IN_WORKSPACE="/Users/$CURRENT_USER/apps/$LAKEHOUSE_APP_NAME"

echo "App name: $LAKEHOUSE_APP_NAME"
echo "Workspace path: $APP_FOLDER_IN_WORKSPACE"

# Create workspace directory
echo "📁 Creating workspace directory..."
databricks workspace mkdirs "$APP_FOLDER_IN_WORKSPACE"

# Upload backend
echo "📤 Uploading backend..."
databricks workspace import-dir backend "$APP_FOLDER_IN_WORKSPACE/backend" --overwrite

# Upload frontend
echo "📤 Uploading frontend..."
databricks workspace import-dir frontend/build "$APP_FOLDER_IN_WORKSPACE/frontend" --overwrite

# Upload config (optional)
echo "📤 Uploading configuration..."
databricks workspace import app.databricks.yaml "$APP_FOLDER_IN_WORKSPACE/app.yaml" --overwrite

# Deploy application
echo "🚀 Deploying application..."
databricks apps deploy "$LAKEHOUSE_APP_NAME" "$APP_FOLDER_IN_WORKSPACE" dev

# Get app URL
echo "✅ Getting application URL..."
sleep 10
databricks apps get "$LAKEHOUSE_APP_NAME"

echo "🎉 Deployment complete!"
```

---

## ✅ Verification Commands

After deployment:

```bash
# Check app status
databricks apps get cms-npi-app

# View logs
databricks apps logs cms-npi-app

# Follow logs in real-time
databricks apps logs cms-npi-app --follow

# Test backend health
APP_URL=$(databricks apps get cms-npi-app | jq -r .url)
curl "$APP_URL/api/health"

# Test frontend
curl "$APP_URL"
```

---

## 🔄 Update/Redeploy

To update after making changes:

```bash
# Rebuild frontend (if frontend changed)
cd frontend && npm run build && cd ..

# Re-upload files
databricks workspace import-dir backend "$APP_FOLDER_IN_WORKSPACE/backend" --overwrite
databricks workspace import-dir frontend/build "$APP_FOLDER_IN_WORKSPACE/frontend" --overwrite

# Restart or redeploy
databricks apps restart cms-npi-app
# OR
databricks apps deploy "$LAKEHOUSE_APP_NAME" "$APP_FOLDER_IN_WORKSPACE" dev
```

---

## 📍 Important Paths

| Item | Path |
|------|------|
| **Project Root** | `/Users/pawanpreet.sangari/dataconnect_apps/my_project/react-database-app` |
| **Frontend Source** | `./frontend/src` |
| **Frontend Build** | `./frontend/build` |
| **Backend Source** | `./backend/main.py` |
| **Deploy Script** | `./deploy.sh` |
| **Databricks Config** | `./app.databricks.yaml` |
| **Workspace Path** | `/Users/{your_email}/apps/cms-npi-app` |

---

## 🐛 Troubleshooting

### "Command not found: databricks"
```bash
pip install databricks-cli
```

### "Not authenticated"
```bash
databricks auth login --host https://your-workspace.cloud.databricks.com
```

### "Frontend build failed"
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

### "Database connection failed"
```bash
# Verify secrets are set
databricks secrets list --scope db-scope

# Check logs for connection errors
databricks apps logs cms-npi-app | grep -i "database\|connection"
```

### "App deployment failed"
```bash
# View detailed logs
databricks apps logs cms-npi-app --tail 200

# Check uploaded files
databricks workspace list "$APP_FOLDER_IN_WORKSPACE"

# Verify workspace path exists
databricks workspace ls "/Users/$(databricks current-user me | jq -r .userName)/apps"
```

---

## 📱 Access Your App

Once deployed, get your app URL:

```bash
# Get URL from deployment output
databricks apps get cms-npi-app | jq -r .url

# Or visit Databricks Workspace
# Navigate to: Workspace > Apps > cms-npi-app
```

Your app will be available at:
```
https://your-workspace.cloud.databricks.com/apps/cms-npi-app
```

---

## 🎯 Environment-Specific Deployments

### Development
```bash
databricks apps deploy cms-npi-app "$APP_FOLDER_IN_WORKSPACE" dev
```

### Staging
```bash
databricks apps deploy cms-npi-app "$APP_FOLDER_IN_WORKSPACE" staging
```

### Production
```bash
databricks apps deploy cms-npi-app "$APP_FOLDER_IN_WORKSPACE" prod
```

---

## 📚 Documentation Files

Your deployment documentation includes:

1. **DEPLOY_QUICK.md** - Quick 3-step deployment guide
2. **DATABRICKS_DEPLOYMENT.md** - Comprehensive 50+ page guide
3. **deploy.sh** - Automated deployment script
4. **app.databricks.yaml** - Production-ready configuration
5. **DEPLOYMENT_SUMMARY.md** - This file

---

## ⚙️ Configuration Files

### app.yaml (Simple)
Basic configuration for quick deployment

### app.databricks.yaml (Production)
Enhanced configuration with:
- Secret references
- Health checks
- Auto-scaling
- Resource limits
- Multiple services

Use with:
```bash
databricks apps deploy cms-npi-app "$APP_FOLDER_IN_WORKSPACE" prod \
  --config app.databricks.yaml
```

---

## 🔧 Management Commands

```bash
# List all apps
databricks apps list

# Get app details
databricks apps get cms-npi-app

# View logs
databricks apps logs cms-npi-app

# Restart app
databricks apps restart cms-npi-app

# Delete app
databricks apps delete cms-npi-app

# Check app status
databricks apps status cms-npi-app
```

---

## 📊 Monitoring

### View Logs
```bash
# Last 100 lines
databricks apps logs cms-npi-app --tail 100

# Follow logs
databricks apps logs cms-npi-app --follow

# Backend only
databricks apps logs cms-npi-app --service backend

# Frontend only
databricks apps logs cms-npi-app --service frontend

# Filter by error
databricks apps logs cms-npi-app | grep -i error
```

### Health Checks
```bash
# Get app URL
APP_URL=$(databricks apps get cms-npi-app | jq -r .url)

# Check backend health
curl "$APP_URL/api/health"

# Check with details
curl "$APP_URL/api/health" | jq

# Frontend health
curl -I "$APP_URL"
```

---

## 🎉 Success Indicators

Your deployment is successful when:

✅ **Command completes without errors**
```
✅ Application deployed successfully!
```

✅ **App appears in list**
```bash
databricks apps list | grep cms-npi-app
```

✅ **Health check passes**
```bash
curl "$APP_URL/api/health"
# Returns: {"status":"healthy","database":"connected", ...}
```

✅ **Frontend loads**
```bash
curl "$APP_URL"
# Returns: HTML content
```

✅ **Can submit a form**
- Open app URL in browser
- Complete all 6 steps
- Submit successfully
- See success confirmation

---

## 🚨 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| **CLI not found** | `pip install databricks-cli` |
| **Not authenticated** | `databricks auth login` |
| **Build failed** | Check Node.js version, try `npm install` again |
| **Upload failed** | Verify workspace path, check permissions |
| **Deploy failed** | Check logs: `databricks apps logs cms-npi-app` |
| **DB connection failed** | Verify secrets, check database accessibility |
| **App not starting** | Check resource limits, view logs |
| **502 errors** | Backend not responding, restart app |
| **CORS errors** | Check CORS config in backend/main.py |

---

## 📞 Need Help?

1. **Check logs**: `databricks apps logs cms-npi-app --follow`
2. **Review docs**: See `DATABRICKS_DEPLOYMENT.md`
3. **Test locally first**: Follow `QUICKSTART.md`
4. **Databricks support**: Contact your Databricks administrator

---

## 🎯 Quick Commands Cheat Sheet

```bash
# Deploy
databricks apps deploy cms-npi-app "$APP_FOLDER_IN_WORKSPACE" dev

# Or use script
./deploy.sh cms-npi-app dev

# Check status
databricks apps get cms-npi-app

# View logs
databricks apps logs cms-npi-app --follow

# Restart
databricks apps restart cms-npi-app

# Update
databricks workspace import-dir backend "$APP_FOLDER_IN_WORKSPACE/backend" --overwrite
databricks apps restart cms-npi-app
```

---

**Ready to deploy? Choose your method:**

1. **Easiest**: `./deploy.sh cms-npi-app dev`
2. **Your format**: See "Method 2: Manual Steps" above
3. **With config**: See "Method 3: Using Configuration File" above

---

**Last Updated**: October 22, 2025  
**App Version**: 1.0.0  
**Status**: ✅ Ready for Deployment

