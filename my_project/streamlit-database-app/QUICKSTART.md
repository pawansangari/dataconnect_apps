# HETS EDI Enrollment - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

This guide will help you get the HETS EDI Enrollment application up and running quickly.

---

## Prerequisites

Before you begin, ensure you have:

- ✅ Python 3.8 or higher installed
- ✅ Access to a PostgreSQL database (Databricks SQL or compatible)
- ✅ Databricks workspace credentials
- ✅ Required environment variables configured

---

## Step 1: Install Dependencies

Navigate to the application directory and install required packages:

```bash
cd /Users/pawanpreet.sangari/dataconnect_apps/my_project/streamlit-database-app
pip install -r requirements.txt
```

### Required Packages
- `streamlit>=1.28.0` - Web application framework
- `psycopg[binary,pool]>=3.1.0` - PostgreSQL adapter with connection pooling
- `databricks-sdk>=0.18.0` - Databricks SDK for authentication

---

## Step 2: Configure Environment Variables

Set the following environment variables (or create a `.env` file):

```bash
export PGDATABASE="your_database_name"
export PGUSER="your_username"
export PGHOST="your_host.databricks.com"
export PGPORT="5432"
export PGSSLMODE="require"
export PGAPPNAME="hets_edi_app"
```

### Variable Descriptions

| Variable | Description | Example |
|----------|-------------|---------|
| `PGDATABASE` | Database name | `main` |
| `PGUSER` | Database username | `user@databricks.com` |
| `PGHOST` | Database host address | `adb-123456789.azuredatabricks.net` |
| `PGPORT` | Database port | `5432` |
| `PGSSLMODE` | SSL connection mode | `require` |
| `PGAPPNAME` | Application name for schema | `hets_edi_app` |

---

## Step 3: Verify Database Connection

The application will automatically:
1. Connect to the database using OAuth token authentication
2. Create the required schema if it doesn't exist
3. Create all necessary tables on first run

### Database Schema Naming

The schema is created with the format: `{PGAPPNAME}_schema_{PGUSER}`

Example: `hets_edi_app_schema_userdatabrickscom`

---

## Step 4: Run the Application

### Local Development

```bash
streamlit run app.py
```

The application will open in your default browser at `http://localhost:8501`

### Databricks Apps (Production)

Deploy using the Databricks CLI:

```bash
databricks apps deploy
```

The app will use the configuration from `app.yaml`.

---

## Step 5: Test the Application

### Create a Test Enrollment

1. Navigate to the **"📝 New Enrollment"** tab
2. Fill in the required fields:
   - **Provider Information**: Name, title, organization, email, phone
   - **Identifiers**: PTAN, NPI (10 digits), Tax ID
   - **Organization Type**: Select from dropdown
   - **Vendor Information**: Vendor name and contact details
   - **Dates**: Relationship effective date
   - **Attestation**: Check agreement and type your name
3. Click **"Submit Enrollment"**
4. Verify success message with Reference ID

### View Enrollments

1. Navigate to the **"📊 View Enrollments"** tab
2. You should see your test enrollment
3. Expand the record to view full details

---

## Application Features

### 🏥 New Enrollment Tab

- **Provider Information Form**
  - Authorized signatory details
  - Organization information
  - Contact information
  - Provider identifiers (PTAN, NPI, Tax ID)

- **Vendor/Clearinghouse Information**
  - Vendor name and contacts
  - Relationship dates
  - Status tracking
  - Offshore data consent

- **Digital Attestation**
  - Compliance statement
  - Electronic signature
  - Timestamp capture

### 📊 View Enrollments Tab

- List all submitted enrollments
- Expandable detail view
- Status tracking
- Submission timestamps

---

## Validation Rules

The application enforces these validation rules:

### Required Fields (marked with *)
- Authorized Signatory Name
- Title
- Organization Name
- Email Address
- Phone Number
- PTAN (5-50 characters)
- NPI (exactly 10 digits)
- Tax ID
- Organization Type
- Vendor/Clearinghouse Name
- Relationship Effective Date
- Attestation Agreement
- Electronic Signature

### Format Validation
- **Email**: Must be valid email format
- **NPI**: Must be exactly 10 numeric digits
- **PTAN**: Must be 5-50 characters
- **Signature**: Must match Authorized Signatory Name

---

## Database Tables Created

The application automatically creates these tables:

1. **`hets_providers`** - Provider information
2. **`hets_vendor_relationships`** - Vendor relationships
3. **`hets_attestations`** - Attestation records
4. **`hets_submission_history`** - Audit trail

See `DATA_DICTIONARY.md` for complete schema details.

---

## Troubleshooting

### Common Issues

#### Issue: "Failed to refresh OAuth token"
**Solution**: 
- Verify Databricks credentials are configured
- Check that `databricks-sdk` is properly installed
- Ensure workspace access is granted

#### Issue: "Database initialization failed"
**Solution**:
- Verify database connection parameters
- Check that user has CREATE SCHEMA privileges
- Ensure database is accessible from your network

#### Issue: "Connection timeout"
**Solution**:
- Check `PGHOST` and `PGPORT` values
- Verify firewall rules allow database connections
- Ensure SSL mode is set correctly

#### Issue: NPI validation fails
**Solution**:
- NPI must be exactly 10 numeric digits
- Remove any dashes or spaces
- Example valid NPI: `1234567890`

#### Issue: Email validation fails
**Solution**:
- Ensure email format is valid: `user@domain.com`
- Check for spaces or special characters
- Both primary and alternate emails must be valid format

---

## Testing Checklist

Use this checklist to verify the application is working correctly:

- [ ] Application starts without errors
- [ ] Database connection established
- [ ] Schema and tables created successfully
- [ ] Can navigate between tabs
- [ ] Form validates required fields
- [ ] Email validation works correctly
- [ ] NPI validation (10 digits) works
- [ ] PTAN validation (5-50 chars) works
- [ ] Can submit a test enrollment
- [ ] Success message displays with Reference ID
- [ ] Submitted enrollment appears in View Enrollments tab
- [ ] Can expand enrollment to see details
- [ ] Date picker works correctly
- [ ] Organization type dropdown populated
- [ ] Attestation checkbox required before submit
- [ ] Electronic signature matches signatory name

---

## Sample Test Data

Use this sample data for testing:

### Provider Information
```
Authorized Signatory Name: Dr. Jane Smith
Title: Medical Director
Organization Name: HealthCare Clinic Inc
Email Address: jsmith@healthcareclinic.com
Alternate Email: admin@healthcareclinic.com
Phone Number: (555) 123-4567
PTAN: ABC123456
NPI: 1234567890
Tax ID: 12-3456789
Organization Type: Clinic
```

### Vendor Information
```
Vendor Name: ClearingHouse Solutions LLC
Vendor Contact: John Doe
Vendor Email: jdoe@chsolutions.com
Vendor Phone: (555) 987-6543
Effective Date: (Today's date)
Termination Date: (Leave blank)
Offshore Consent: ☑ Checked
Relationship Status: Active
```

### Attestation
```
Agreement: ☑ Checked
Electronic Signature: Dr. Jane Smith
```

---

## Next Steps

After successful setup and testing:

1. **Customize**: Modify the attestation text if needed for your organization
2. **Security**: Review and enhance IP address capture for audit
3. **Reporting**: Create additional views or queries for reporting needs
4. **Integration**: Connect to email notifications or workflow systems
5. **Monitoring**: Set up alerts for failed submissions
6. **Backup**: Implement regular database backup procedures

---

## Additional Resources

- **README.md** - Complete application documentation
- **DATA_DICTIONARY.md** - Detailed database schema reference
- **schema.sql** - SQL schema and sample queries
- **CMS HETS Documentation**: https://www.cms.gov/data-research/cms-information-technology/hipaa-eligibility-transaction-system-hets

---

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Review the complete README.md
3. Consult the DATA_DICTIONARY.md for database questions
4. Contact your Databricks administrator for access issues

---

## Security Considerations

- ⚠️ Never commit `.env` files with credentials
- ⚠️ Use OAuth tokens, not hardcoded passwords
- ⚠️ Enable SSL/TLS for database connections
- ⚠️ Review and audit access logs regularly
- ⚠️ Implement row-level security if needed
- ⚠️ Back up data regularly and securely

---

## Quick Reference Commands

```bash
# Install dependencies
pip install -r requirements.txt

# Run locally
streamlit run app.py

# Deploy to Databricks
databricks apps deploy

# Check logs (local)
streamlit run app.py --server.headless true

# Database connection test (Python)
python -c "from databricks import sdk; client = sdk.WorkspaceClient(); print('Connected:', client.current_user.me())"
```

---

**Version**: 1.0.0  
**Last Updated**: October 21, 2025  
**Status**: Ready for Production

---

🎉 **Congratulations!** You're now ready to use the HETS EDI Enrollment application.

