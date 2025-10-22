# Deploy from Your Existing Workspace Path

## Your Source Code Location

You mentioned your code is at:
```
/Workspace/Users/pawanpreet.sangari@databricks.com/dataconnect_apps/my_project/react-database-app
```

## Quick Deploy from Existing Location

If your code is already in the workspace at that path, you can deploy directly:

```bash
# Set your variables
export APP_NAME="cms-npi-app"
export SOURCE_PATH="/Workspace/Users/pawanpreet.sangari@databricks.com/dataconnect_apps/my_project/react-database-app"

# Create the app
databricks apps create "$APP_NAME" --source-code-path "$SOURCE_PATH"

# Check status
databricks apps get "$APP_NAME"

# View logs
databricks apps logs "$APP_NAME" --follow
```

## Or Use the Updated Script

The script will now:
1. ✅ Create app if it doesn't exist
2. ✅ Update app if it already exists
3. ✅ Use `/Workspace` prefix automatically

```bash
cd /Users/pawanpreet.sangari/dataconnect_apps/my_project/react-database-app
./deploy-no-build.sh cms-npi-app
```

## What Changed

### Before (❌ Wrong):
- Path: `/Users/user@databricks.com/apps/...`
- Would fail: "App does not exist"

### After (✅ Correct):
- Path: `/Workspace/Users/user@databricks.com/apps/...`
- Creates app automatically if needed

## Manual Deploy Using Your Path

If you want to use your existing path directly:

```bash
# Create app from your existing code
databricks apps create "cms-npi-app" \
  --source-code-path "/Workspace/Users/pawanpreet.sangari@databricks.com/dataconnect_apps/my_project/react-database-app"
```

## Important Path Notes

Databricks Apps requires:
- ✅ Use `/Workspace` prefix (not `/Users`)
- ✅ Full path including `/Workspace/Users/email@domain.com/...`
- ✅ Path must contain `app.yaml` or `databricks.yml`

## Verify Your app.yaml

Make sure you have an `app.yaml` in your source path:

```bash
# Check if app.yaml exists
databricks workspace list "/Workspace/Users/pawanpreet.sangari@databricks.com/dataconnect_apps/my_project/react-database-app"

# If app.yaml is missing, create one
cat > /tmp/app.yaml << 'EOF'
command: ["sh", "-c", "cd backend && pip install -r requirements.txt && uvicorn main:app --host 0.0.0.0 --port 8000"]
EOF

# Upload it
databricks workspace import \
  "/Workspace/Users/pawanpreet.sangari@databricks.com/dataconnect_apps/my_project/react-database-app/app.yaml" \
  --file /tmp/app.yaml --language PYTHON
```

## Full Workflow

### Option 1: Deploy from Current Location (Recommended)
```bash
cd /Users/pawanpreet.sangari/dataconnect_apps/my_project/react-database-app
./deploy-no-build.sh cms-npi-app
```

This will:
1. Upload your code to `/Workspace/Users/{your-email}/apps/cms-npi-app`
2. Create the app automatically
3. Start the application

### Option 2: Use Your Existing Workspace Path
```bash
databricks apps create "cms-npi-app" \
  --source-code-path "/Workspace/Users/pawanpreet.sangari@databricks.com/dataconnect_apps/my_project/react-database-app"
```

This will:
1. Use code already in workspace
2. Create the app
3. Deploy immediately

## Troubleshooting

### "App does not exist"
**Solution**: Use `databricks apps create` instead of `deploy`
```bash
databricks apps create "$APP_NAME" --source-code-path "$SOURCE_PATH"
```

### "Source code path not found"
**Solution**: Verify the path exists
```bash
databricks workspace list "/Workspace/Users/pawanpreet.sangari@databricks.com/dataconnect_apps/my_project"
```

### "Missing app.yaml"
**Solution**: Your source path needs an `app.yaml` file. The script will create one automatically, or create it manually as shown above.

## Next Steps

1. **Run the deployment**:
   ```bash
   ./deploy-no-build.sh cms-npi-app
   ```

2. **Check app status**:
   ```bash
   databricks apps get cms-npi-app
   ```

3. **Access your app**:
   - Get URL from the output
   - Or check in Databricks workspace UI under "Apps"

## Summary

The scripts are now fixed to:
- ✅ Use `/Workspace` prefix
- ✅ Create app if it doesn't exist
- ✅ Update app if it does exist
- ✅ Handle errors gracefully

Run: `./deploy-no-build.sh cms-npi-app`

