# CMS-10114 NPI Application - React + FastAPI Application

## Overview

This is a modern web application for the CMS-10114 National Provider Identifier (NPI) Application/Update Form. The application features a React frontend with Material-UI components and a FastAPI backend with PostgreSQL database integration.

## Architecture

```
react-database-app/
├── frontend/              # React application
│   ├── src/
│   │   ├── components/   # React components for each form section
│   │   ├── services/     # API service layer
│   │   ├── App.js        # Main application component
│   │   └── index.js      # Application entry point
│   ├── public/           # Static files
│   └── package.json      # Node dependencies
│
├── backend/              # FastAPI application
│   ├── main.py          # API server and database logic
│   └── requirements.txt  # Python dependencies
│
└── app.yaml             # Databricks deployment configuration
```

## Features

### Frontend (React)
- ✅ **Modern UI** with Material-UI components
- ✅ **Multi-step form** with progress indicator
- ✅ **Real-time validation** using Formik and Yup
- ✅ **Responsive design** for mobile and desktop
- ✅ **Professional theming** with CMS-inspired colors
- ✅ **Toast notifications** for user feedback
- ✅ **Electronic signature** capability
- ✅ **Form state management** across steps

### Backend (FastAPI)
- ✅ **RESTful API** with FastAPI
- ✅ **PostgreSQL integration** with connection pooling
- ✅ **OAuth authentication** via Databricks SDK
- ✅ **Automatic token refresh** (15-minute intervals)
- ✅ **Pydantic validation** for data integrity
- ✅ **CORS support** for frontend integration
- ✅ **Audit logging** for compliance
- ✅ **Health check endpoints**

### Database
- ✅ **Comprehensive schema** for NPI applications
- ✅ **Audit log table** for tracking
- ✅ **Foreign key relationships**
- ✅ **Automatic timestamps**

## CMS-10114 Form Sections

The application implements all 5 sections of the CMS-10114 form:

### Section 1: Basic Information
- Submission reason (Initial, Update, Deactivate, Reactivate)
- Entity type (Individual or Organization)
- Existing NPI (for updates)

### Section 2: Identifying Information
**For Individuals:**
- Name (prefix, first, middle, last, suffix)
- Credentials
- Date of birth
- Gender
- Social Security Number
- License information

**For Organizations:**
- Organization name and type
- Employer Identification Number (EIN)
- License information

### Section 3: Business Address
- Mailing address (complete)
- Practice location address
- Phone and fax numbers
- Enumeration date

### Section 4: Contact Person
- Contact person details
- Phone with extension
- Email address

### Section 5: Certification Statement
- Authorized official information
- Certification agreement
- Electronic signature
- Certification date

## Prerequisites

### Frontend
- Node.js 16+ and npm
- React 18+

### Backend
- Python 3.8+
- PostgreSQL database
- Databricks workspace access (for OAuth)

## Installation

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export PGDATABASE="your_database"
export PGUSER="your_user"
export PGHOST="your_host"
export PGPORT="5432"
export PGSSLMODE="require"
export PGAPPNAME="npi_app"

# Run backend server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Set API URL (optional, defaults to localhost:8000)
echo "REACT_APP_API_URL=http://localhost:8000/api" > .env

# Run development server
npm start
```

The application will open at `http://localhost:3000`

## Database Schema

### npi_applications Table

Stores complete NPI application data with all form sections.

**Key Columns:**
- `application_id` - Primary key
- `submission_reason` - Initial/Update/Deactivate/Reactivate
- `entity_type` - Individual/Organization
- Individual fields: name, DOB, SSN, credentials
- Organization fields: org name, type, EIN
- Address fields: mailing and practice locations
- Contact person information
- Authorized official details
- Electronic signature and certification date
- Timestamps and status tracking

### npi_audit_log Table

Tracks all actions on applications for compliance.

**Key Columns:**
- `log_id` - Primary key
- `application_id` - Foreign key to applications
- `action` - Type of action performed
- `action_date` - Timestamp
- `notes` - Additional information

## API Endpoints

### Health & Status
- `GET /` - Root endpoint
- `GET /api/health` - Health check with database status

### Applications
- `POST /api/applications` - Submit new application
- `GET /api/applications` - List all applications (paginated)
- `GET /api/applications/{id}` - Get specific application

## Development

### Running in Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

### Building for Production

**Frontend:**
```bash
cd frontend
npm run build
```

This creates an optimized production build in the `build/` directory.

**Backend:**
The FastAPI app is production-ready. Deploy using:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

## Deployment

### Option 1: Databricks Apps

```bash
# From project root
databricks apps deploy
```

The `app.yaml` configuration will:
1. Start the FastAPI backend on port 8000
2. Start the React frontend on port 3000
3. Proxy API requests from frontend to backend

### Option 2: Docker

**Create Dockerfile for Backend:**
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Create Dockerfile for Frontend:**
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Option 3: Cloud Platforms

The application can be deployed to:
- AWS (EC2, ECS, Elastic Beanstalk)
- Azure (App Service, Container Instances)
- Google Cloud (Cloud Run, App Engine)
- Heroku
- Vercel (frontend) + Railway (backend)

## Environment Variables

### Backend (.env)
```bash
PGDATABASE=your_database
PGUSER=your_user
PGHOST=your_host
PGPORT=5432
PGSSLMODE=require
PGAPPNAME=npi_app
```

### Frontend (.env)
```bash
REACT_APP_API_URL=http://localhost:8000/api
```

## Validation Rules

### Email Format
- RFC-compliant email validation

### NPI (National Provider Identifier)
- Exactly 10 numeric digits

### SSN (Social Security Number)
- Format: XXX-XX-XXXX

### EIN (Employer Identification Number)
- Format: XX-XXXXXXX

### ZIP Code
- Format: XXXXX or XXXXX-XXXX

### Phone Numbers
- Required for all contact fields
- Recommended format: (XXX) XXX-XXXX

## Security Features

### Backend Security
- ✅ OAuth token-based authentication
- ✅ Automatic token refresh
- ✅ SQL injection prevention (parameterized queries)
- ✅ CORS configuration
- ✅ Input validation with Pydantic
- ✅ SSL/TLS database connections

### Frontend Security
- ✅ Input sanitization
- ✅ XSS protection
- ✅ Environment-based API URLs
- ✅ Secure form submission

## Testing

### Frontend Testing
```bash
cd frontend
npm test
```

### Backend Testing
```bash
cd backend
pytest
```

### Manual Testing Checklist
- [ ] All 5 form sections load correctly
- [ ] Field validation works for each input
- [ ] Individual vs Organization toggle works
- [ ] Address copy function works
- [ ] Electronic signature validates
- [ ] Form submission successful
- [ ] Success confirmation displays
- [ ] Reference ID provided
- [ ] Data saved to database

## Troubleshooting

### Frontend Issues

**Issue: API calls failing**
- Check backend is running on port 8000
- Verify REACT_APP_API_URL in .env
- Check browser console for errors
- Verify CORS is enabled in backend

**Issue: Form validation not working**
- Check Formik and Yup are installed
- Verify validation schema in components
- Check browser console for validation errors

### Backend Issues

**Issue: Database connection fails**
- Verify environment variables are set
- Check database credentials
- Ensure PostgreSQL is accessible
- Test OAuth token generation

**Issue: Token refresh fails**
- Check Databricks SDK is installed
- Verify workspace credentials
- Check OAuth token permissions

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

### Frontend
- Code splitting for optimal loading
- Lazy loading of components
- Optimized bundle size
- Image optimization

### Backend
- Connection pooling (2-10 connections)
- Async endpoints
- Efficient query optimization
- Token caching

## Contributing

When contributing to this project:
1. Follow the existing code style
2. Add tests for new features
3. Update documentation
4. Test all form sections thoroughly
5. Ensure validation rules work correctly

## Compliance

This application is designed to meet:
- CMS NPI application requirements
- HIPAA regulations
- Healthcare data security standards
- Electronic signature standards

## Support

For issues or questions:
- Check this README
- Review the code comments
- Check the browser/server console logs
- Contact your system administrator

## References

- **CMS NPI Information**: https://nppes.cms.hhs.gov/
- **CMS Forms**: https://www.cms.gov/medicare/cms-forms
- **FastAPI Documentation**: https://fastapi.tiangolo.com/
- **React Documentation**: https://react.dev/
- **Material-UI**: https://mui.com/

## License

Internal use only. Complies with organizational and regulatory requirements.

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-10-22 | Initial release with complete CMS-10114 implementation |

---

**Built with:** React, FastAPI, PostgreSQL, Material-UI, Formik, Databricks SDK

