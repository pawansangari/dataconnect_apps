# CMS-10114 NPI App - Quick Reference Card 📋

## 🌐 Your App URL
```
https://cms-npi-app-519179000643598.aws.databricksapps.com
```

## ⚡ Quick Commands

### Open App in Browser
```bash
open https://cms-npi-app-519179000643598.aws.databricksapps.com
```

### Check App Status
```bash
databricks apps get cms-npi-app
```

### Deploy Updates
```bash
cd /Users/pawanpreet.sangari/dataconnect_apps/my_project/react-database-app
./deploy-react-frontend.sh
```

### Rebuild Frontend (after changes)
```bash
cd frontend
npm run build
cd ..
./deploy-react-frontend.sh
```

## 🔍 API Endpoints

### Health Check
```bash
curl https://cms-npi-app-519179000643598.aws.databricksapps.com/api/health
```

### Get Providers
```bash
curl https://cms-npi-app-519179000643598.aws.databricksapps.com/api/providers
```

## 📊 Current Status

| Item | Status |
|------|--------|
| Node.js | ✅ v24.10.0 |
| React Build | ✅ Production |
| Deployment | ✅ SUCCEEDED |
| App Status | ✅ RUNNING |
| Frontend | ✅ Deployed |
| Backend | ✅ Deployed |
| Database | ⏳ Ready to connect |

## 🎯 What Works Now

✅ React frontend (production build)
✅ Material-UI components
✅ Form validation
✅ FastAPI backend
✅ API endpoints
✅ Static file serving
✅ Client-side routing

## 📁 Key Files

| File | Purpose |
|------|---------|
| `deploy-react-frontend.sh` | Main deployment script |
| `app-react-frontend.yaml` | App configuration |
| `frontend/build/` | React production build |
| `backend/main.py` | FastAPI backend |

## 🔐 Authentication

All users need Databricks workspace access to view the app.
First-time users will be redirected to Databricks login.

## 🆘 Troubleshooting

### App Not Loading?
```bash
databricks apps get cms-npi-app
# Check if app_status.state is "RUNNING"
```

### Need to Restart?
```bash
databricks apps stop cms-npi-app
databricks apps start cms-npi-app
```

### Want to See All Deployments?
```bash
databricks apps list-deployments cms-npi-app
```

## 📚 Full Documentation

- `README.md` - Project overview
- `REACT_DEPLOYMENT_COMPLETE.md` - Complete deployment guide
- `DATABRICKS_DEPLOYMENT.md` - Databricks-specific details
- `QUICKSTART.md` - Getting started guide

---

**App Name:** cms-npi-app  
**Status:** 🟢 RUNNING  
**Last Updated:** October 22, 2025  

