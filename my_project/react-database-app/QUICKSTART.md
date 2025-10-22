# CMS-10114 NPI Application - Quick Start Guide

## 🚀 Get Started in 5 Minutes

This guide will help you get the application running locally for development.

---

## Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js 16+ installed (`node --version`)
- ✅ Python 3.8+ installed (`python --version`)
- ✅ PostgreSQL database access
- ✅ Databricks workspace credentials

---

## Step 1: Clone and Navigate

```bash
cd /Users/pawanpreet.sangari/dataconnect_apps/my_project/react-database-app
```

---

## Step 2: Backend Setup (2 minutes)

### Install Python Dependencies

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Configure Environment

```bash
# Set these environment variables
export PGDATABASE="main"
export PGUSER="your_email@databricks.com"
export PGHOST="your-workspace.azuredatabricks.net"
export PGPORT="5432"
export PGSSLMODE="require"
export PGAPPNAME="npi_app"
```

### Start Backend Server

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

✅ Backend running at: http://localhost:8000

---

## Step 3: Frontend Setup (2 minutes)

### Open New Terminal

```bash
cd frontend
```

### Install Node Dependencies

```bash
npm install
```

### Configure API URL (Optional)

```bash
echo "REACT_APP_API_URL=http://localhost:8000/api" > .env
```

### Start Frontend Server

```bash
npm start
```

✅ Application opens automatically at: http://localhost:3000

---

## Step 4: Test the Application (1 minute)

### Fill Out the Form

1. **Basic Information**
   - Select "Initial Application"
   - Choose "Individual"
   - Click "Next"

2. **Identifying Information**
   - First Name: `John`
   - Last Name: `Doe`
   - Date of Birth: `1980-01-01`
   - License Number: `MD123456`
   - Issuing State: `CA`
   - Click "Next"

3. **Business Address**
   - Mailing Address: `123 Medical Plaza`
   - City: `Los Angeles`
   - State: `CA`
   - ZIP: `90001`
   - Phone: `(310) 555-1234`
   - Check "Same as mailing address" for practice location
   - Click "Next"

4. **Contact Person**
   - First Name: `Jane`
   - Last Name: `Smith`
   - Phone: `(310) 555-5678`
   - Email: `jane.smith@clinic.com`
   - Click "Next"

5. **Certification**
   - Authorized Official First Name: `John`
   - Last Name: `Doe`
   - Title: `Physician`
   - Phone: `(310) 555-1234`
   - Email: `john.doe@clinic.com`
   - Check agreement box
   - Type your name: `John Doe`
   - Click "Next"

6. **Review & Submit**
   - Review all information
   - Click "Submit Application"

### Verify Success

You should see:
- ✅ Success message with confetti
- ✅ Reference ID number
- ✅ "Submit Another Application" button

---

## Common Commands

### Backend Commands
```bash
# Start backend (development)
cd backend && uvicorn main:app --reload

# Start backend (production)
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4

# Check API health
curl http://localhost:8000/api/health
```

### Frontend Commands
```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

---

## Verification Checklist

After completing the steps above, verify:

- [ ] Backend server running at http://localhost:8000
- [ ] Frontend app running at http://localhost:3000
- [ ] API health check returns "healthy": http://localhost:8000/api/health
- [ ] Database tables created successfully
- [ ] Can navigate through all form sections
- [ ] Form validation works (try submitting with empty fields)
- [ ] Can submit a complete application
- [ ] Success message displays with Reference ID

---

## Troubleshooting

### Backend Won't Start

**Error: "Module not found"**
```bash
cd backend
pip install -r requirements.txt
```

**Error: "Database connection failed"**
- Check your environment variables are set correctly
- Verify database is accessible
- Test connection: `psql -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDATABASE`

**Error: "OAuth token failed"**
- Ensure Databricks SDK is installed
- Check workspace credentials
- Try: `databricks auth login`

### Frontend Won't Start

**Error: "npm command not found"**
- Install Node.js: https://nodejs.org/

**Error: "Port 3000 is already in use"**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm start
```

**Error: "API calls failing"**
- Verify backend is running on port 8000
- Check .env file has correct API URL
- Check browser console for CORS errors

### Database Issues

**Tables not created**
- Backend auto-creates tables on first run
- Check backend logs for errors
- Verify database permissions

**Connection timeout**
- Check firewall rules
- Verify SSL mode setting
- Test network connectivity

---

## Next Steps

### For Development
1. Review the code in `frontend/src/components/`
2. Check API endpoints in `backend/main.py`
3. Customize validation rules
4. Add additional form fields if needed
5. Modify styling in Material-UI theme

### For Production
1. Build frontend: `npm run build`
2. Configure production environment variables
3. Set up reverse proxy (nginx)
4. Enable HTTPS/SSL
5. Configure proper CORS settings
6. Set up database backups
7. Implement monitoring and logging

### For Deployment
1. Review `README.md` for deployment options
2. Choose deployment platform (Databricks, AWS, Azure, etc.)
3. Configure environment variables
4. Deploy backend and frontend
5. Test thoroughly in production environment

---

## Quick Reference

### URLs
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs (Swagger): http://localhost:8000/docs
- API Health: http://localhost:8000/api/health

### Environment Variables
```bash
# Backend
PGDATABASE, PGUSER, PGHOST, PGPORT, PGSSLMODE, PGAPPNAME

# Frontend
REACT_APP_API_URL
```

### Port Usage
- 3000: React development server
- 8000: FastAPI backend server
- 5432: PostgreSQL database (if local)

---

## Sample Data

Use this sample data for quick testing:

### Individual Provider
```
Name: Dr. Sarah Johnson
DOB: 1975-06-15
Gender: Female
SSN: 123-45-6789
License: CA987654
State: CA
Address: 456 Health Street, San Francisco, CA 94102
Phone: (415) 555-0123
Email: sarah.johnson@healthcare.com
```

### Organization Provider
```
Organization: Central Medical Center
Type: Hospital
EIN: 12-3456789
Address: 789 Hospital Drive, Chicago, IL 60601
Phone: (312) 555-0199
Contact: Michael Chen
Email: mchen@centralmedical.com
```

---

## Development Tips

### Hot Reload
Both frontend and backend support hot reload:
- Frontend: Changes auto-refresh in browser
- Backend: Changes auto-restart server

### Debugging
- Frontend: Use React DevTools browser extension
- Backend: Check terminal logs for errors
- Database: Use pgAdmin or psql for queries

### API Testing
Use the built-in Swagger UI at http://localhost:8000/docs to:
- Test API endpoints
- View request/response schemas
- Try out different requests

---

## Getting Help

If you encounter issues:
1. Check this guide first
2. Review the main README.md
3. Check browser/terminal console for errors
4. Verify all prerequisites are installed
5. Test each component separately
6. Contact system administrator

---

## Success Indicators

You're ready to go when you see:

✅ Backend terminal shows:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

✅ Frontend terminal shows:
```
Compiled successfully!
webpack compiled with 0 warnings
```

✅ Browser shows the application with:
```
CMS-10114: NPI Application/Update Form
National Provider Identifier (NPI) Application for Healthcare Providers
```

---

**Time to complete:** ~5 minutes  
**Difficulty:** Easy  
**Status:** Ready for development

🎉 **Congratulations!** Your development environment is ready!

