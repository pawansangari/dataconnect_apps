# Fixed: Databricks Workspace Import Syntax Error

## What Was Wrong

The deployment scripts had incorrect syntax for `databricks workspace import`:

**❌ Incorrect (what caused the error):**
```bash
databricks workspace import source.yaml target.yaml --overwrite
```

**✅ Correct syntax:**
```bash
databricks workspace import target.yaml --file source.yaml --overwrite
```

## What I Fixed

Updated both deployment scripts:
- `deploy.sh` 
- `deploy-no-build.sh`

The correct syntax is:
```bash
# Single argument (target path) with --file flag
databricks workspace import "$WORKSPACE_PATH/app.yaml" --file app.yaml --overwrite
```

## Try Again Now

The scripts are now fixed. Run the deployment again:

```bash
cd /Users/pawanpreet.sangari/dataconnect_apps/my_project/react-database-app
./deploy-no-build.sh cms-npi-app dev
```

## Manual Command (if needed)

If you want to manually upload a file:

```bash
# Correct syntax
databricks workspace import /path/in/workspace --file /local/file.yaml --overwrite

# Example
databricks workspace import "/Users/your_email/apps/myapp/app.yaml" --file app.yaml --overwrite
```

## Other Correct Examples

```bash
# Import a Python file
databricks workspace import "/Users/me/script.py" --file local_script.py --overwrite

# Import with content directly
databricks workspace import "/Users/me/config.yaml" --content "key: value" --overwrite

# Import directory (different command)
databricks workspace import-dir ./local_dir /workspace/dir --overwrite
```

## Deployment Scripts Status

✅ **deploy-no-build.sh** - Fixed and ready to use
✅ **deploy.sh** - Fixed and ready to use

Both scripts now use the correct syntax!

