# Deployment Success Guide

## Current Status

Your app **cms-npi-app** has been created successfully!

**App URL**: https://cms-npi-app-519179000643598.aws.databricksapps.com

## Issue: App Crashes on Startup

The app is crashing because it needs database environment variables. 

### Fix Option 1: Update app.yaml with Your Database Info

Edit `app-with-env.yaml` and replace these values:

```yaml
export PGDATABASE="your_actual_database"  # e.g., "main"
export PGUSER="pawanpreet.sangari@databricks.com"  # Your email
export PGHOST="your-actual-host.azuredatabricks.net"  # Your workspace host
export PGPORT="5432"
export PGSSLMODE="require"
export PGAPPNAME="npi_app"
```

Then redeploy:
```bash
databricks workspace delete "/Workspace/Users/pawanpreet.sangari@databricks.com/apps/cms-npi-app/app.yaml"
databricks workspace import "/Workspace/Users/pawanpreet.sangari@databricks.com/apps/cms-npi-app/app.yaml" --file app-with-env.yaml --language PYTHON
databricks apps deploy cms-npi-app --source-code-path "/Workspace/Users/pawanpreet.sangari@databricks.com/apps/cms-npi-app"
```

### Fix Option 2: Use Databricks Secrets (Recommended for Production)

1. **Create secrets** (if not already done):
```bash
databricks secrets create-scope --scope db-scope
databricks secrets put --scope db-scope --key database
databricks secrets put --scope db-scope --key user  
databricks secrets put --scope db-scope --key host
```

2. **Update app.yaml** to use secrets:
```yaml
command:
  - sh
  - -c
  - |
    export PGDATABASE="$(databricks secrets get --scope db-scope --key database)"
    export PGUSER="$(databricks secrets get --scope db-scope --key user)"
    export PGHOST="$(databricks secrets get --scope db-scope --key host)"
    export PGPORT="5432"
    export PGSSLMODE="require"
    export PGAPPNAME="npi_app"
    
    cd backend
    pip install -r requirements.txt
    uvicorn main:app --host 0.0.0.0 --port 8000
```

### Fix Option 3: Test Without Database First

Create a minimal test app.yaml to verify the app structure works:

```yaml
command:
  - sh
  - -c
  - |
    cd backend
    pip install fastapi uvicorn
    cat > test_main.py << 'EOF'
    from fastapi import FastAPI
    app = FastAPI()
    
    @app.get("/")
    def read_root():
        return {"status": "healthy", "message": "Backend is running!"}
    
    @app.get("/api/health")
    def health():
        return {"status": "healthy", "database": "not_configured"}
    EOF
    uvicorn test_main:app --host 0.0.0.0 --port 8000
```

Upload and deploy:
```bash
# Save above as test-app.yaml
databricks workspace delete "/Workspace/Users/pawanpreet.sangari@databricks.com/apps/cms-npi-app/app.yaml"
databricks workspace import "/Workspace/Users/pawanpreet.sangari@databricks.com/apps/cms-npi-app/app.yaml" --file test-app.yaml --language PYTHON
databricks apps deploy cms-npi-app --source-code-path "/Workspace/Users/pawanpreet.sangari@databricks.com/apps/cms-npi-app"
```

This will test if the app structure works without database dependencies.

## Quick Commands

### Check App Status
```bash
databricks apps get cms-npi-app
```

### List Deployments
```bash
databricks apps list-deployments cms-npi-app
```

### Redeploy After Fixing app.yaml
```bash
databricks apps deploy cms-npi-app --source-code-path "/Workspace/Users/pawanpreet.sangari@databricks.com/apps/cms-npi-app"
```

### Delete and Start Over
```bash
databricks apps delete cms-npi-app
# Then run ./deploy-no-build.sh again
```

## What You Need

To make the backend work, you need:
1. ✅ Database name (PGDATABASE)
2. ✅ Database user (PGUSER) 
3. ✅ Database host (PGHOST)
4. ✅ Database port (PGPORT - usually 5432)
5. ✅ SSL mode (PGSSLMODE - usually "require")

Get these from your Databricks SQL warehouse or PostgreSQL database.

## Next Steps

1. Choose one of the fix options above
2. Update your database credentials
3. Redeploy the app
4. Access it at: https://cms-npi-app-519179000643598.aws.databricksapps.com

## Need Help?

The app is created and ready - it just needs proper database configuration to start!

