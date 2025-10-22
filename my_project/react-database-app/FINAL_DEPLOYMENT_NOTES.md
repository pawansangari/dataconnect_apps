# Final Deployment Notes - Databricks Apps

## Correct Two-Step Process

Databricks Apps requires a two-step process for new apps:

### Step 1: Create the App (just the name)
```bash
databricks apps create "app-name"
```

### Step 2: Deploy Source Code
```bash
databricks apps deploy "app-name" --source-code-path "/Workspace/path/to/code"
```

## Common Mistakes (Now Fixed)

### ❌ Wrong: Create with source path
```bash
databricks apps create "app-name" --source-code-path "/path"
# Error: unknown flag: --source-code-path
```

### ✅ Correct: Create, then deploy
```bash
# First create
databricks apps create "app-name"

# Then deploy
databricks apps deploy "app-name" --source-code-path "/Workspace/path"
```

## Updated Script Behavior

The deployment scripts now handle this correctly:

```bash
if app exists:
    deploy update
else:
    create app (no source path)
    then deploy with source path
```

## Complete Deployment Command Sequence

```bash
# 1. Upload code to workspace
databricks workspace import-dir backend "/Workspace/Users/user@databricks.com/apps/myapp/backend" --overwrite

# 2. Create app (first time only)
databricks apps create "myapp"

# 3. Deploy code to app
databricks apps deploy "myapp" --source-code-path "/Workspace/Users/user@databricks.com/apps/myapp"

# 4. Check status
databricks apps get "myapp"

# 5. View logs
databricks apps logs "myapp" --follow
```

## All Commands Reference

### Create App
```bash
databricks apps create NAME [flags]

Flags:
  --description string        App description
  --no-compute               Don't start after creation
  --no-wait                  Don't wait for ACTIVE state
  --timeout duration         Max wait time (default 20m)
```

### Deploy to App
```bash
databricks apps deploy APP_NAME [flags]

Flags:
  --source-code-path string   Workspace path to source code
  --mode AppDeploymentMode    AUTO_SYNC or SNAPSHOT
  --no-wait                   Don't wait for SUCCEEDED state
  --timeout duration          Max wait time (default 20m)
```

### Other Commands
```bash
# Get app details
databricks apps get APP_NAME

# List all apps
databricks apps list

# View logs
databricks apps logs APP_NAME [--follow] [--tail N]

# Stop app
databricks apps stop APP_NAME

# Start app
databricks apps start APP_NAME

# Delete app
databricks apps delete APP_NAME
```

## Path Requirements

Databricks Apps requires:
- ✅ Use `/Workspace` prefix (not `/Users`)
- ✅ Full path: `/Workspace/Users/email@domain.com/path/to/app`
- ✅ Path must contain `app.yaml` or `databricks.yml`

## Example app.yaml

Your app directory needs an `app.yaml` configuration file:

```yaml
# Minimal app.yaml for FastAPI backend
command: ["sh", "-c", "cd backend && pip install -r requirements.txt && uvicorn main:app --host 0.0.0.0 --port 8000"]
```

## Run Deployment Now

The scripts are now fixed. Run:

```bash
cd /Users/pawanpreet.sangari/dataconnect_apps/my_project/react-database-app
./deploy-no-build.sh cms-npi-app
```

This will:
1. ✅ Upload your code to `/Workspace/Users/{your-email}/apps/cms-npi-app`
2. ✅ Create the app with `databricks apps create`
3. ✅ Deploy code with `databricks apps deploy --source-code-path`
4. ✅ Show app URL when complete

## Troubleshooting

### Error: "unknown flag: --source-code-path" on create
**Fixed**: We now create first, then deploy separately

### Error: "App does not exist" on deploy
**Fixed**: We now check if app exists and create it if needed

### Error: "accepts 1 arg(s), received 3"
**Fixed**: We now use flags instead of positional arguments

### Error: "Overwrite cannot be used for source format"
**Fixed**: We delete files before importing them

## Summary of All Fixes

1. ✅ Changed path from `/Users/` to `/Workspace/Users/`
2. ✅ Fixed workspace import to use `--file` flag
3. ✅ Removed `--overwrite` flag, added delete before import
4. ✅ Split create and deploy into two separate commands
5. ✅ Fixed command syntax to use only 1 argument with flags

The deployment should now work correctly! 🎉

