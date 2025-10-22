# Correct Databricks Apps Deploy Syntax

## Issue Resolved

The `databricks apps deploy` command only accepts **1 argument** (the app name) and uses flags for other parameters.

## ❌ Incorrect Syntax (What We Used Before)

```bash
databricks apps deploy "$APP_NAME" "$WORKSPACE_PATH" "$ENVIRONMENT"
# Error: accepts 1 arg(s), received 3
```

## ✅ Correct Syntax

```bash
databricks apps deploy "$APP_NAME" --source-code-path "$WORKSPACE_PATH"
```

## Command Structure

```
databricks apps deploy APP_NAME [flags]

Flags:
  --source-code-path string   # Path to source code in workspace
  --mode AppDeploymentMode    # AUTO_SYNC or SNAPSHOT (optional)
  --deployment-id string      # Unique deployment ID (optional)
  --no-wait                   # Don't wait for completion (optional)
  --timeout duration          # Max wait time (default 20m)
```

## Examples

### Basic Deployment
```bash
databricks apps deploy "cms-npi-app" \
  --source-code-path "/Users/user@databricks.com/apps/cms-npi-app"
```

### With Auto-Sync Mode
```bash
databricks apps deploy "cms-npi-app" \
  --source-code-path "/Users/user@databricks.com/apps/cms-npi-app" \
  --mode AUTO_SYNC
```

### With Custom Timeout
```bash
databricks apps deploy "cms-npi-app" \
  --source-code-path "/Users/user@databricks.com/apps/cms-npi-app" \
  --timeout 30m
```

### Background Deployment (No Wait)
```bash
databricks apps deploy "cms-npi-app" \
  --source-code-path "/Users/user@databricks.com/apps/cms-npi-app" \
  --no-wait
```

## Full Deployment Sequence

```bash
# 1. Set variables
export APP_NAME="cms-npi-app"
export WORKSPACE_PATH="/Users/$(databricks current-user me | jq -r .userName)/apps/$APP_NAME"

# 2. Create workspace directory
databricks workspace mkdirs "$WORKSPACE_PATH"

# 3. Upload files
databricks workspace import-dir backend "$WORKSPACE_PATH/backend" --overwrite
databricks workspace import-dir frontend "$WORKSPACE_PATH/frontend" --overwrite

# 4. Upload config
databricks workspace delete "$WORKSPACE_PATH/app.yaml" 2>/dev/null || true
databricks workspace import "$WORKSPACE_PATH/app.yaml" --file app.yaml --language PYTHON

# 5. Deploy (CORRECT SYNTAX)
databricks apps deploy "$APP_NAME" --source-code-path "$WORKSPACE_PATH"
```

## Note on Environment Parameter

The original sample command format mentioned:
```bash
databricks apps deploy "$LAKEHOUSE_APP_NAME" "$APP_FOLDER_IN_WORKSPACE" dev
```

However, the current Databricks CLI doesn't use a positional environment parameter. Environment-specific configuration should be handled through:
1. Different app names (e.g., `cms-npi-app-dev`, `cms-npi-app-prod`)
2. Configuration files in the source code
3. Environment variables

## Updated Scripts

Both deployment scripts have been updated:
- ✅ `deploy.sh` - Now uses correct syntax
- ✅ `deploy-no-build.sh` - Now uses correct syntax

## Try Again

Run the deployment with the fixed script:

```bash
cd /Users/pawanpreet.sangari/dataconnect_apps/my_project/react-database-app
./deploy-no-build.sh cms-npi-app
```

Note: The environment parameter is no longer used in the command.

