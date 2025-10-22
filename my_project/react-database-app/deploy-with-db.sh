#!/bin/bash

# Deploy CMS NPI App with Database Configuration
# Update the variables below with your actual database credentials

# ============================================================================
# CONFIGURATION - UPDATE THESE VALUES
# ============================================================================

PGDATABASE="databricks_postgres"  # Your database name
PGUSER="305c2906-41f8-4e59-a94d-e397dc5f2e88"  # Your email
PGHOST="instance-75bce447-4f49-41ba-8706-c586eeb6d0eb.database.cloud.databricks.com"  # Your Databricks SQL host
PGPORT="5432"
PGSSLMODE="require"
PGAPPNAME="npi_app"

# ============================================================================

echo "Creating app.yaml with database configuration..."

cat > /tmp/app-final.yaml << EOF
command:
  - sh
  - -c
  - |
    export PGDATABASE="${PGDATABASE}"
    export PGUSER="${PGUSER}"
    export PGHOST="${PGHOST}"
    export PGPORT="${PGPORT}"
    export PGSSLMODE="${PGSSLMODE}"
    export PGAPPNAME="${PGAPPNAME}"
    
    cd backend
    pip install -r requirements.txt
    uvicorn main:app --host 0.0.0.0 --port 8000
EOF

echo "Uploading app.yaml..."
databricks workspace delete "/Workspace/Users/pawanpreet.sangari@databricks.com/apps/cms-npi-app/app.yaml"
databricks workspace import "/Workspace/Users/pawanpreet.sangari@databricks.com/apps/cms-npi-app/app.yaml" \
  --file /tmp/app-final.yaml --language PYTHON

echo "Deploying application..."
databricks apps deploy cms-npi-app \
  --source-code-path "/Workspace/Users/pawanpreet.sangari@databricks.com/apps/cms-npi-app"

echo ""
echo "✅ Deployment complete!"
echo "App URL: https://cms-npi-app-519179000643598.aws.databricksapps.com"
echo ""
echo "Test the API:"
echo "  curl https://cms-npi-app-519179000643598.aws.databricksapps.com/api/health"
echo ""

