"""
Simple FastAPI Backend without Database Dependencies
This version works without database connection for testing
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, date
import os

# Initialize FastAPI app
app = FastAPI(
    title="CMS-10114 NPI Application API",
    description="Backend API for NPI Application/Update Form (No DB Version)",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for demo
applications_db = []

# Pydantic models
class BasicInformation(BaseModel):
    submission_reason: str
    entity_type: str
    npi: Optional[str] = None

class NPIApplication(BaseModel):
    basic_information: BasicInformation
    # Add other fields as needed

@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "status": "healthy",
        "service": "CMS-10114 NPI Application API",
        "version": "1.0.0",
        "database": "in-memory (no PostgreSQL)",
        "message": "API is running successfully!"
    }

@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "database": "not_connected",
        "storage": "in-memory",
        "applications_count": len(applications_db)
    }

@app.post("/api/applications")
async def create_application(application: NPIApplication):
    """Submit a new NPI application (in-memory storage)."""
    app_data = {
        "application_id": len(applications_db) + 1,
        "submission_date": datetime.now().isoformat(),
        "status": "Submitted",
        "data": application.dict()
    }
    applications_db.append(app_data)
    
    return {
        "application_id": app_data["application_id"],
        "submission_date": app_data["submission_date"],
        "status": "Submitted",
        "message": "Application submitted successfully (stored in memory)"
    }

@app.get("/api/applications")
async def get_applications():
    """List all applications."""
    return {
        "applications": applications_db,
        "total": len(applications_db)
    }

@app.get("/api/applications/{application_id}")
async def get_application(application_id: int):
    """Get a specific application by ID."""
    for app in applications_db:
        if app["application_id"] == application_id:
            return app
    raise HTTPException(status_code=404, detail="Application not found")

@app.get("/docs")
async def get_docs():
    """Redirect to API documentation."""
    return {"message": "Visit /docs for interactive API documentation"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

