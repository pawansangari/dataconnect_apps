"""
CMS-10114 NPI Application Backend API
FastAPI backend for React application
"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List
from datetime import datetime, date
import psycopg
from psycopg import sql
from psycopg_pool import ConnectionPool
import os
import time
from databricks import sdk

# Initialize FastAPI app
app = FastAPI(
    title="CMS-10114 NPI Application API",
    description="Backend API for NPI Application/Update Form",
    version="1.0.0"
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection setup
workspace_client = sdk.WorkspaceClient()
postgres_password = None
last_password_refresh = 0
connection_pool = None

def refresh_oauth_token():
    """Refresh OAuth token if expired."""
    global postgres_password, last_password_refresh
    if postgres_password is None or time.time() - last_password_refresh > 900:
        print("Refreshing PostgreSQL OAuth token")
        postgres_password = workspace_client.config.oauth_token().access_token
        last_password_refresh = time.time()

def get_connection_pool():
    """Get or create the connection pool."""
    global connection_pool
    if connection_pool is None:
        refresh_oauth_token()
        conn_string = (
            f"dbname={os.getenv('PGDATABASE')} "
            f"user={os.getenv('PGUSER')} "
            f"password={postgres_password} "
            f"host={os.getenv('PGHOST')} "
            f"port={os.getenv('PGPORT')} "
            f"sslmode={os.getenv('PGSSLMODE', 'require')} "
            f"application_name={os.getenv('PGAPPNAME')}"
        )
        connection_pool = ConnectionPool(conn_string, min_size=2, max_size=10)
    return connection_pool

def get_connection():
    """Get a connection from the pool."""
    global connection_pool
    if postgres_password is None or time.time() - last_password_refresh > 900:
        if connection_pool:
            connection_pool.close()
            connection_pool = None
    return get_connection_pool().connection()

def get_schema_name():
    """Get the schema name."""
    pgappname = os.getenv("PGAPPNAME", "npi_app")
    pguser = os.getenv("PGUSER", "").replace('-', '')
    return f"{pgappname}_schema_{pguser}"

# Pydantic models for request/response
class BasicInformation(BaseModel):
    submission_reason: str = Field(..., description="Reason for submission")
    entity_type: str = Field(..., description="Entity type (Individual/Organization)")
    npi: Optional[str] = Field(None, min_length=10, max_length=10, description="Existing NPI for updates")
    
    @validator('npi')
    def validate_npi(cls, v):
        if v and (not v.isdigit() or len(v) != 10):
            raise ValueError('NPI must be exactly 10 digits')
        return v

class IdentifyingInformation(BaseModel):
    # For individuals
    name_prefix: Optional[str] = None
    first_name: Optional[str] = None
    middle_name: Optional[str] = None
    last_name: Optional[str] = None
    name_suffix: Optional[str] = None
    credential: Optional[str] = None
    
    # For organizations
    organization_name: Optional[str] = None
    organization_type: Optional[str] = None
    
    # Common fields
    other_name: Optional[str] = None
    other_organization_name: Optional[str] = None
    ssn: Optional[str] = None
    ein: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    state_license_number: Optional[str] = None
    issuing_state: Optional[str] = None

class BusinessAddress(BaseModel):
    # Mailing address
    mailing_address_line1: str
    mailing_address_line2: Optional[str] = None
    mailing_city: str
    mailing_state: str
    mailing_zip: str = Field(..., min_length=5, max_length=10)
    mailing_country: str = "USA"
    mailing_phone: str
    mailing_fax: Optional[str] = None
    
    # Practice location
    practice_address_line1: str
    practice_address_line2: Optional[str] = None
    practice_city: str
    practice_state: str
    practice_zip: str = Field(..., min_length=5, max_length=10)
    practice_country: str = "USA"
    practice_phone: str
    practice_fax: Optional[str] = None
    
    # Additional info
    enumeration_date: Optional[date] = None

class ContactPerson(BaseModel):
    contact_first_name: str
    contact_middle_name: Optional[str] = None
    contact_last_name: str
    contact_phone: str
    contact_phone_ext: Optional[str] = None
    contact_email: EmailStr

class Certification(BaseModel):
    authorized_official_first_name: str
    authorized_official_middle_name: Optional[str] = None
    authorized_official_last_name: str
    authorized_official_title: str
    authorized_official_phone: str
    authorized_official_email: EmailStr
    signature: str  # Electronic signature
    certification_date: date

class NPIApplication(BaseModel):
    basic_information: BasicInformation
    identifying_information: IdentifyingInformation
    business_address: BusinessAddress
    contact_person: ContactPerson
    certification: Certification

class ApplicationResponse(BaseModel):
    application_id: int
    submission_date: datetime
    status: str
    message: str

# Database initialization
def init_database():
    """Initialize database tables for NPI applications."""
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                schema_name = get_schema_name()
                
                # Create schema
                cur.execute(sql.SQL("CREATE SCHEMA IF NOT EXISTS {}").format(sql.Identifier(schema_name)))
                
                # Create NPI applications table
                cur.execute(sql.SQL("""
                    CREATE TABLE IF NOT EXISTS {}.npi_applications (
                        application_id SERIAL PRIMARY KEY,
                        
                        -- Basic Information
                        submission_reason VARCHAR(100) NOT NULL,
                        entity_type VARCHAR(50) NOT NULL,
                        existing_npi VARCHAR(10),
                        
                        -- Identifying Information (Individual)
                        name_prefix VARCHAR(10),
                        first_name VARCHAR(100),
                        middle_name VARCHAR(100),
                        last_name VARCHAR(100),
                        name_suffix VARCHAR(10),
                        credential VARCHAR(50),
                        
                        -- Identifying Information (Organization)
                        organization_name VARCHAR(255),
                        organization_type VARCHAR(100),
                        
                        -- Common Identifying Info
                        other_name VARCHAR(255),
                        other_organization_name VARCHAR(255),
                        ssn VARCHAR(11),
                        ein VARCHAR(10),
                        date_of_birth DATE,
                        gender VARCHAR(20),
                        state_license_number VARCHAR(50),
                        issuing_state VARCHAR(2),
                        
                        -- Mailing Address
                        mailing_address_line1 VARCHAR(255) NOT NULL,
                        mailing_address_line2 VARCHAR(255),
                        mailing_city VARCHAR(100) NOT NULL,
                        mailing_state VARCHAR(2) NOT NULL,
                        mailing_zip VARCHAR(10) NOT NULL,
                        mailing_country VARCHAR(50) NOT NULL,
                        mailing_phone VARCHAR(20) NOT NULL,
                        mailing_fax VARCHAR(20),
                        
                        -- Practice Location
                        practice_address_line1 VARCHAR(255) NOT NULL,
                        practice_address_line2 VARCHAR(255),
                        practice_city VARCHAR(100) NOT NULL,
                        practice_state VARCHAR(2) NOT NULL,
                        practice_zip VARCHAR(10) NOT NULL,
                        practice_country VARCHAR(50) NOT NULL,
                        practice_phone VARCHAR(20) NOT NULL,
                        practice_fax VARCHAR(20),
                        
                        enumeration_date DATE,
                        
                        -- Contact Person
                        contact_first_name VARCHAR(100) NOT NULL,
                        contact_middle_name VARCHAR(100),
                        contact_last_name VARCHAR(100) NOT NULL,
                        contact_phone VARCHAR(20) NOT NULL,
                        contact_phone_ext VARCHAR(10),
                        contact_email VARCHAR(255) NOT NULL,
                        
                        -- Certification
                        authorized_official_first_name VARCHAR(100) NOT NULL,
                        authorized_official_middle_name VARCHAR(100),
                        authorized_official_last_name VARCHAR(100) NOT NULL,
                        authorized_official_title VARCHAR(100) NOT NULL,
                        authorized_official_phone VARCHAR(20) NOT NULL,
                        authorized_official_email VARCHAR(255) NOT NULL,
                        signature VARCHAR(255) NOT NULL,
                        certification_date DATE NOT NULL,
                        
                        -- Metadata
                        submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        status VARCHAR(50) DEFAULT 'Submitted',
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """).format(sql.Identifier(schema_name)))
                
                # Create audit log table
                cur.execute(sql.SQL("""
                    CREATE TABLE IF NOT EXISTS {}.npi_audit_log (
                        log_id SERIAL PRIMARY KEY,
                        application_id INTEGER REFERENCES {}.npi_applications(application_id) ON DELETE CASCADE,
                        action VARCHAR(50) NOT NULL,
                        action_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        notes TEXT
                    )
                """).format(sql.Identifier(schema_name), sql.Identifier(schema_name)))
                
                conn.commit()
                return True
    except Exception as e:
        print(f"Database initialization error: {e}")
        return False

# API Routes
@app.on_event("startup")
async def startup_event():
    """Initialize database on startup."""
    init_database()

@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "CMS-10114 NPI Application API",
        "version": "1.0.0"
    }

@app.get("/api/health")
async def health_check():
    """Detailed health check."""
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT 1")
                db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    return {
        "status": "healthy",
        "database": db_status,
        "timestamp": datetime.now().isoformat()
    }

@app.post("/api/applications", response_model=ApplicationResponse)
async def create_application(application: NPIApplication):
    """Submit a new NPI application."""
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                schema = get_schema_name()
                
                cur.execute(sql.SQL("""
                    INSERT INTO {}.npi_applications (
                        submission_reason, entity_type, existing_npi,
                        name_prefix, first_name, middle_name, last_name, name_suffix, credential,
                        organization_name, organization_type,
                        other_name, other_organization_name, ssn, ein, date_of_birth, gender,
                        state_license_number, issuing_state,
                        mailing_address_line1, mailing_address_line2, mailing_city, mailing_state, 
                        mailing_zip, mailing_country, mailing_phone, mailing_fax,
                        practice_address_line1, practice_address_line2, practice_city, practice_state,
                        practice_zip, practice_country, practice_phone, practice_fax,
                        enumeration_date,
                        contact_first_name, contact_middle_name, contact_last_name,
                        contact_phone, contact_phone_ext, contact_email,
                        authorized_official_first_name, authorized_official_middle_name,
                        authorized_official_last_name, authorized_official_title,
                        authorized_official_phone, authorized_official_email,
                        signature, certification_date
                    ) VALUES (
                        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                    ) RETURNING application_id, submission_date, status
                """).format(sql.Identifier(schema)), (
                    application.basic_information.submission_reason,
                    application.basic_information.entity_type,
                    application.basic_information.npi,
                    application.identifying_information.name_prefix,
                    application.identifying_information.first_name,
                    application.identifying_information.middle_name,
                    application.identifying_information.last_name,
                    application.identifying_information.name_suffix,
                    application.identifying_information.credential,
                    application.identifying_information.organization_name,
                    application.identifying_information.organization_type,
                    application.identifying_information.other_name,
                    application.identifying_information.other_organization_name,
                    application.identifying_information.ssn,
                    application.identifying_information.ein,
                    application.identifying_information.date_of_birth,
                    application.identifying_information.gender,
                    application.identifying_information.state_license_number,
                    application.identifying_information.issuing_state,
                    application.business_address.mailing_address_line1,
                    application.business_address.mailing_address_line2,
                    application.business_address.mailing_city,
                    application.business_address.mailing_state,
                    application.business_address.mailing_zip,
                    application.business_address.mailing_country,
                    application.business_address.mailing_phone,
                    application.business_address.mailing_fax,
                    application.business_address.practice_address_line1,
                    application.business_address.practice_address_line2,
                    application.business_address.practice_city,
                    application.business_address.practice_state,
                    application.business_address.practice_zip,
                    application.business_address.practice_country,
                    application.business_address.practice_phone,
                    application.business_address.practice_fax,
                    application.business_address.enumeration_date,
                    application.contact_person.contact_first_name,
                    application.contact_person.contact_middle_name,
                    application.contact_person.contact_last_name,
                    application.contact_person.contact_phone,
                    application.contact_person.contact_phone_ext,
                    application.contact_person.contact_email,
                    application.certification.authorized_official_first_name,
                    application.certification.authorized_official_middle_name,
                    application.certification.authorized_official_last_name,
                    application.certification.authorized_official_title,
                    application.certification.authorized_official_phone,
                    application.certification.authorized_official_email,
                    application.certification.signature,
                    application.certification.certification_date
                ))
                
                result = cur.fetchone()
                application_id, submission_date, status = result
                
                # Log the submission
                cur.execute(sql.SQL("""
                    INSERT INTO {}.npi_audit_log (application_id, action, notes)
                    VALUES (%s, %s, %s)
                """).format(sql.Identifier(schema)), (
                    application_id,
                    'APPLICATION_SUBMITTED',
                    f'New {application.basic_information.entity_type} application submitted'
                ))
                
                conn.commit()
                
                return ApplicationResponse(
                    application_id=application_id,
                    submission_date=submission_date,
                    status=status,
                    message="Application submitted successfully"
                )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to submit application: {str(e)}")

@app.get("/api/applications")
async def get_applications(limit: int = 50, offset: int = 0):
    """Get all applications with pagination."""
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                schema = get_schema_name()
                
                cur.execute(sql.SQL("""
                    SELECT 
                        application_id, submission_reason, entity_type,
                        COALESCE(organization_name, CONCAT(first_name, ' ', last_name)) as name,
                        existing_npi, contact_email, submission_date, status
                    FROM {}.npi_applications
                    ORDER BY submission_date DESC
                    LIMIT %s OFFSET %s
                """).format(sql.Identifier(schema)), (limit, offset))
                
                results = cur.fetchall()
                
                applications = []
                for row in results:
                    applications.append({
                        "application_id": row[0],
                        "submission_reason": row[1],
                        "entity_type": row[2],
                        "name": row[3],
                        "existing_npi": row[4],
                        "contact_email": row[5],
                        "submission_date": row[6].isoformat(),
                        "status": row[7]
                    })
                
                return {"applications": applications, "total": len(applications)}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve applications: {str(e)}")

@app.get("/api/applications/{application_id}")
async def get_application(application_id: int):
    """Get a specific application by ID."""
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                schema = get_schema_name()
                
                cur.execute(sql.SQL("""
                    SELECT * FROM {}.npi_applications
                    WHERE application_id = %s
                """).format(sql.Identifier(schema)), (application_id,))
                
                result = cur.fetchone()
                
                if not result:
                    raise HTTPException(status_code=404, detail="Application not found")
                
                # Return full application details (you'd want to map this properly)
                return {"application_id": result[0], "data": "Full application data"}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve application: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

