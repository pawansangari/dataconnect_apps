#!/bin/bash

# Deploy Simple Version (No Database)
# This version works without database to test the app structure

echo "Uploading simple backend..."
databricks workspace delete "/Workspace/Users/pawanpreet.sangari@databricks.com/apps/cms-npi-app/backend/simple-backend.py" 2>/dev/null || true
databricks workspace import "/Workspace/Users/pawanpreet.sangari@databricks.com/apps/cms-npi-app/backend/simple-backend.py" \
  --file simple-backend.py --language PYTHON

echo "Creating simple app.yaml..."
cat > /tmp/app-simple.yaml << 'EOF'
command:
  - sh
  - -c
  - |
    cd backend
    pip install fastapi uvicorn pydantic
    uvicorn simple-backend:app --host 0.0.0.0 --port 8000
EOF

echo "Uploading app.yaml..."
databricks workspace delete "/Workspace/Users/pawanpreet.sangari@databricks.com/apps/cms-npi-app/app.yaml"
databricks workspace import "/Workspace/Users/pawanpreet.sangari@databricks.com/apps/cms-npi-app/app.yaml" \
  --file /tmp/app-simple.yaml --language PYTHON

echo "Deploying application..."
databricks apps deploy cms-npi-app \
  --source-code-path "/Workspace/Users/pawanpreet.sangari@databricks.com/apps/cms-npi-app"

echo ""
echo "✅ Deployment complete!"
echo "App URL: https://cms-npi-app-519179000643598.aws.databricksapps.com"
echo ""
echo "Test the API:"
echo "  curl https://cms-npi-app-519179000643598.aws.databricksapps.com"
echo "  curl https://cms-npi-app-519179000643598.aws.databricksapps.com/api/health"
echo ""
echo "Open in browser for API docs:"
echo "  https://cms-npi-app-519179000643598.aws.databricksapps.com/docs"
echo ""

