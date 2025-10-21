# HETS EDI Enrollment Application

## Overview

This Streamlit application facilitates the HIPAA Eligibility Transaction System (HETS) Electronic Data Interchange (EDI) Enrollment process. The application allows healthcare providers to enroll their EDI vendor/clearinghouse relationships and submit required attestations in compliance with CMS regulations.

## Features

- **Provider Information Management**: Capture comprehensive provider details including:
  - Authorized signatory information
  - Organization details
  - Contact information (email, phone)
  - Provider identifiers (PTAN, NPI, Tax ID)

- **Vendor/Clearinghouse Management**: Track vendor relationships including:
  - Vendor contact details
  - Relationship effective and termination dates
  - Offshore data sharing consent
  - Relationship status tracking

- **Digital Attestation**: 
  - Electronic signature capability
  - Comprehensive attestation statement
  - Compliance with CMS requirements

- **Records Management**: 
  - View all submitted enrollments
  - Track submission history
  - Monitor relationship status

## Database Schema

The application creates the following tables in your PostgreSQL database:

### 1. `hets_providers`
Stores healthcare provider information.

| Column | Type | Description |
|--------|------|-------------|
| provider_id | SERIAL (PK) | Unique provider identifier |
| authorized_signatory_name | VARCHAR(255) | Name of authorized signatory |
| title | VARCHAR(100) | Signatory's title |
| organization_name | VARCHAR(255) | Legal organization name |
| email_address | VARCHAR(255) | Primary email address |
| alternate_email_address | VARCHAR(255) | Secondary email (optional) |
| phone_number | VARCHAR(20) | Contact phone number |
| ptan | VARCHAR(50) | Provider Transaction Access Number |
| npi | VARCHAR(10) | National Provider Identifier (10 digits) |
| tax_id | VARCHAR(20) | Tax ID/EIN |
| organization_type | VARCHAR(100) | Type of healthcare organization |
| created_at | TIMESTAMP | Record creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

### 2. `hets_vendor_relationships`
Tracks vendor/clearinghouse relationships.

| Column | Type | Description |
|--------|------|-------------|
| relationship_id | SERIAL (PK) | Unique relationship identifier |
| provider_id | INTEGER (FK) | Reference to provider |
| vendor_clearinghouse_name | VARCHAR(255) | Vendor/clearinghouse name |
| vendor_contact_name | VARCHAR(255) | Vendor primary contact |
| vendor_contact_email | VARCHAR(255) | Vendor contact email |
| vendor_contact_phone | VARCHAR(20) | Vendor contact phone |
| effective_date | DATE | Relationship start date |
| termination_date | DATE | Relationship end date (nullable) |
| offshore_data_sharing_consent | BOOLEAN | Offshore data sharing consent flag |
| relationship_status | VARCHAR(50) | Status (Active, Pending, Terminated, Suspended) |
| created_at | TIMESTAMP | Record creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

### 3. `hets_attestations`
Stores attestation records and electronic signatures.

| Column | Type | Description |
|--------|------|-------------|
| attestation_id | SERIAL (PK) | Unique attestation identifier |
| provider_id | INTEGER (FK) | Reference to provider |
| relationship_id | INTEGER (FK) | Reference to vendor relationship |
| attestation_text | TEXT | Full attestation statement text |
| attested_by | VARCHAR(255) | Name of person attesting |
| attestation_date | TIMESTAMP | Date and time of attestation |
| ip_address | VARCHAR(45) | IP address of submitter |
| submission_status | VARCHAR(50) | Status (Submitted, Approved, Rejected) |

### 4. `hets_submission_history`
Tracks all submission activities.

| Column | Type | Description |
|--------|------|-------------|
| submission_id | SERIAL (PK) | Unique submission identifier |
| provider_id | INTEGER (FK) | Reference to provider |
| submission_date | TIMESTAMP | Date and time of submission |
| submission_type | VARCHAR(50) | Type of submission |
| status | VARCHAR(50) | Submission status |
| notes | TEXT | Additional notes or comments |

## Data Relationships

```
hets_providers (1) ──< (M) hets_vendor_relationships
       │                          │
       │                          │
       └──< (M) hets_attestations <──┘
       │
       └──< (M) hets_submission_history
```

## Installation & Setup

### Prerequisites

- Python 3.8+
- PostgreSQL database (via Databricks SQL or compatible)
- Databricks workspace access

### Environment Variables

The application requires the following environment variables:

```bash
PGDATABASE=your_database_name
PGUSER=your_username
PGHOST=your_host
PGPORT=your_port
PGSSLMODE=require
PGAPPNAME=hets_edi_app
```

### Dependencies

Install required packages:

```bash
pip install -r requirements.txt
```

## Running the Application

```bash
streamlit run app.py
```

Or using the app.yaml configuration:

```bash
databricks apps deploy
```

## Validation Rules

The application enforces the following validation rules:

1. **Email Addresses**: Must be valid email format
2. **NPI**: Must be exactly 10 digits
3. **PTAN**: Must be between 5-50 characters
4. **Required Fields**: All fields marked with * are mandatory
5. **Attestation**: Attested name must match Authorized Signatory Name
6. **Digital Signature**: Must agree to attestation statement before submission

## Security Features

- OAuth token-based authentication via Databricks SDK
- Token auto-refresh (15-minute intervals)
- Connection pooling for efficient database access
- SQL injection prevention via parameterized queries
- Input validation and sanitization
- Electronic signature verification

## Usage Guide

### Submitting a New Enrollment

1. Navigate to the "New Enrollment" tab
2. Complete all required fields in the Provider Information section:
   - Authorized Signatory Name
   - Title
   - Organization Name
   - Email Address
   - Phone Number
   - PTAN, NPI, Tax ID
   - Organization Type

3. Fill in Vendor/Clearinghouse Information:
   - Vendor/Clearinghouse Name
   - Vendor contact details
   - Relationship dates
   - Data sharing consent

4. Review the Attestation Statement
5. Check the attestation agreement box
6. Type your full name to serve as electronic signature
7. Click "Submit Enrollment"

### Viewing Enrollment Records

1. Navigate to the "View Enrollments" tab
2. Browse submitted enrollments
3. Expand any record to view full details

## Compliance

This application is designed to comply with:

- HIPAA regulations
- CMS HETS EDI requirements
- Electronic signature standards
- Data privacy and security standards

## Database Maintenance

### Indexing Recommendations

For optimal performance, consider adding the following indexes:

```sql
CREATE INDEX idx_providers_npi ON hets_providers(npi);
CREATE INDEX idx_providers_ptan ON hets_providers(ptan);
CREATE INDEX idx_providers_email ON hets_providers(email_address);
CREATE INDEX idx_vendor_relationships_status ON hets_vendor_relationships(relationship_status);
CREATE INDEX idx_attestations_date ON hets_attestations(attestation_date);
```

### Backup Strategy

Regularly backup the following tables:
- hets_providers
- hets_vendor_relationships
- hets_attestations
- hets_submission_history

## Support & Documentation

For questions or issues:
- Review CMS HETS documentation: [https://www.cms.gov/data-research/cms-information-technology/hipaa-eligibility-transaction-system-hets](https://www.cms.gov/data-research/cms-information-technology/hipaa-eligibility-transaction-system-hets)
- Contact your Databricks administrator for database access issues
- Review Streamlit documentation: [https://docs.streamlit.io](https://docs.streamlit.io)

## Version History

- **v1.0.0** (2025-10-21): Initial release with core enrollment functionality

## License

Internal use only. Complies with organizational and regulatory requirements.

