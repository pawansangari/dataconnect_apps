# HETS EDI Enrollment - Data Dictionary

## Overview
This document provides detailed information about all database tables, columns, relationships, and constraints used in the HETS EDI Enrollment application.

---

## Table: `hets_providers`

**Purpose**: Store comprehensive healthcare provider information for EDI enrollment.

**Primary Key**: `provider_id`

### Columns

| Column Name | Data Type | Nullable | Default | Description | Validation Rules |
|------------|-----------|----------|---------|-------------|------------------|
| `provider_id` | SERIAL | No | Auto-increment | Unique identifier for each provider | System-generated |
| `authorized_signatory_name` | VARCHAR(255) | No | - | Full legal name of person authorized to sign | Required, max 255 chars |
| `title` | VARCHAR(100) | Yes | - | Professional title of signatory (e.g., CEO, Director) | Max 100 chars |
| `organization_name` | VARCHAR(255) | Yes | - | Legal name of healthcare organization | Max 255 chars |
| `email_address` | VARCHAR(255) | No | - | Primary contact email | Valid email format required |
| `alternate_email_address` | VARCHAR(255) | Yes | - | Secondary contact email | Valid email format if provided |
| `phone_number` | VARCHAR(20) | Yes | - | Primary contact phone number | Max 20 chars |
| `ptan` | VARCHAR(50) | Yes | - | Provider Transaction Access Number | 5-50 characters |
| `npi` | VARCHAR(10) | Yes | - | National Provider Identifier | Exactly 10 digits |
| `tax_id` | VARCHAR(20) | Yes | - | Tax Identification Number / EIN | Max 20 chars |
| `organization_type` | VARCHAR(100) | Yes | - | Type of healthcare organization | Predefined list |
| `created_at` | TIMESTAMP | No | CURRENT_TIMESTAMP | Record creation timestamp | System-generated |
| `updated_at` | TIMESTAMP | No | CURRENT_TIMESTAMP | Last update timestamp | Auto-updated on change |

### Indexes
- `PRIMARY KEY` on `provider_id`
- `INDEX` on `npi` (for fast lookup)
- `INDEX` on `ptan` (for fast lookup)
- `INDEX` on `email_address` (for fast lookup)
- `INDEX` on `created_at` (for chronological queries)

### Business Rules
1. Email address must be unique and valid format
2. NPI must be exactly 10 numeric digits
3. PTAN must be between 5-50 characters
4. Organization type must be from predefined list: Hospital, Clinic, Physician Practice, DME Supplier, Home Health Agency, Nursing Facility, Other

---

## Table: `hets_vendor_relationships`

**Purpose**: Track relationships between healthcare providers and EDI vendors/clearinghouses.

**Primary Key**: `relationship_id`

**Foreign Keys**: 
- `provider_id` → `hets_providers.provider_id`

### Columns

| Column Name | Data Type | Nullable | Default | Description | Validation Rules |
|------------|-----------|----------|---------|-------------|------------------|
| `relationship_id` | SERIAL | No | Auto-increment | Unique identifier for each relationship | System-generated |
| `provider_id` | INTEGER | No | - | Reference to associated provider | Must exist in hets_providers |
| `vendor_clearinghouse_name` | VARCHAR(255) | No | - | Name of EDI vendor or clearinghouse | Required, max 255 chars |
| `vendor_contact_name` | VARCHAR(255) | Yes | - | Primary contact person at vendor | Max 255 chars |
| `vendor_contact_email` | VARCHAR(255) | Yes | - | Vendor contact email address | Valid email if provided |
| `vendor_contact_phone` | VARCHAR(20) | Yes | - | Vendor contact phone number | Max 20 chars |
| `effective_date` | DATE | No | - | Date when relationship becomes effective | Required, cannot be null |
| `termination_date` | DATE | Yes | - | Date when relationship ends | Must be >= effective_date |
| `offshore_data_sharing_consent` | BOOLEAN | Yes | FALSE | Consent for offshore data processing | TRUE/FALSE |
| `relationship_status` | VARCHAR(50) | Yes | 'Active' | Current status of relationship | Must be: Active, Pending, Terminated, or Suspended |
| `created_at` | TIMESTAMP | No | CURRENT_TIMESTAMP | Record creation timestamp | System-generated |
| `updated_at` | TIMESTAMP | No | CURRENT_TIMESTAMP | Last update timestamp | Auto-updated on change |

### Indexes
- `PRIMARY KEY` on `relationship_id`
- `FOREIGN KEY` on `provider_id`
- `INDEX` on `relationship_status` (for filtering)
- `INDEX` on `effective_date` (for date range queries)

### Business Rules
1. Each relationship must be associated with a valid provider
2. Termination date, if provided, must be on or after effective date
3. Status must be one of: Active, Pending, Terminated, Suspended
4. Deleting a provider cascades to delete related relationships
5. Offshore consent is required if vendor processes data internationally

### Relationship Status Values
- **Active**: Relationship is currently active and operational
- **Pending**: Relationship is awaiting approval or activation
- **Terminated**: Relationship has been ended
- **Suspended**: Relationship is temporarily inactive

---

## Table: `hets_attestations`

**Purpose**: Store attestation statements and electronic signatures for compliance tracking.

**Primary Key**: `attestation_id`

**Foreign Keys**: 
- `provider_id` → `hets_providers.provider_id`
- `relationship_id` → `hets_vendor_relationships.relationship_id`

### Columns

| Column Name | Data Type | Nullable | Default | Description | Validation Rules |
|------------|-----------|----------|---------|-------------|------------------|
| `attestation_id` | SERIAL | No | Auto-increment | Unique identifier for each attestation | System-generated |
| `provider_id` | INTEGER | No | - | Reference to provider attesting | Must exist in hets_providers |
| `relationship_id` | INTEGER | No | - | Reference to related vendor relationship | Must exist in hets_vendor_relationships |
| `attestation_text` | TEXT | No | - | Full text of attestation statement | Required, no length limit |
| `attested_by` | VARCHAR(255) | No | - | Name of person providing attestation | Required, max 255 chars |
| `attestation_date` | TIMESTAMP | No | CURRENT_TIMESTAMP | Date and time of attestation | System-generated |
| `ip_address` | VARCHAR(45) | Yes | - | IP address of submitter | IPv4 or IPv6 format |
| `submission_status` | VARCHAR(50) | Yes | 'Submitted' | Current status of attestation | Must be valid status |

### Indexes
- `PRIMARY KEY` on `attestation_id`
- `FOREIGN KEY` on `provider_id`
- `FOREIGN KEY` on `relationship_id`
- `INDEX` on `attestation_date` (for chronological queries)
- `INDEX` on `submission_status` (for filtering)

### Business Rules
1. Each attestation must be linked to both a provider and a vendor relationship
2. Attestation text must include complete compliance statements
3. Attested by name should match authorized signatory name
4. IP address is captured for audit purposes
5. Deleting a provider or relationship cascades to delete attestations

### Attestation Status Values
- **Submitted**: Attestation has been submitted
- **Approved**: Attestation has been reviewed and approved
- **Rejected**: Attestation has been rejected
- **Pending Review**: Attestation is awaiting review

### Compliance Requirements
The attestation must include statements regarding:
1. Authorization to submit on behalf of organization
2. Accuracy and completeness of information
3. CMS verification and approval acknowledgment
4. Agreement to notify CMS of changes within 30 days
5. Understanding of consequences for false information
6. Agreement to comply with HIPAA regulations

---

## Table: `hets_submission_history`

**Purpose**: Maintain audit trail of all submission activities and status changes.

**Primary Key**: `submission_id`

**Foreign Keys**: 
- `provider_id` → `hets_providers.provider_id`

### Columns

| Column Name | Data Type | Nullable | Default | Description | Validation Rules |
|------------|-----------|----------|---------|-------------|------------------|
| `submission_id` | SERIAL | No | Auto-increment | Unique identifier for each submission | System-generated |
| `provider_id` | INTEGER | No | - | Reference to provider | Must exist in hets_providers |
| `submission_date` | TIMESTAMP | No | CURRENT_TIMESTAMP | Date and time of submission | System-generated |
| `submission_type` | VARCHAR(50) | Yes | - | Type of submission (e.g., EDI Enrollment) | Max 50 chars |
| `status` | VARCHAR(50) | Yes | - | Status of submission | Max 50 chars |
| `notes` | TEXT | Yes | - | Additional notes or comments | No length limit |

### Indexes
- `PRIMARY KEY` on `submission_id`
- `FOREIGN KEY` on `provider_id`
- `INDEX` on `submission_date` (for chronological queries)
- `INDEX` on `status` (for filtering)

### Business Rules
1. Each submission must be associated with a valid provider
2. Submission date is automatically recorded
3. Status should reflect current state of submission
4. Notes field can contain detailed information about the submission

### Common Submission Types
- **EDI Enrollment**: Initial enrollment submission
- **Update**: Changes to existing enrollment
- **Renewal**: Periodic renewal of enrollment
- **Termination**: Notification of relationship termination

---

## Entity Relationships

### Relationship Diagram

```
┌─────────────────────┐
│   hets_providers    │
│  (provider_id PK)   │
└──────────┬──────────┘
           │
           │ 1:M
           │
           ├───────────────────────────────────┐
           │                                   │
           │                                   │
    ┌──────▼───────────────────┐    ┌─────────▼────────────────┐
    │ hets_vendor_relationships│    │  hets_submission_history │
    │   (relationship_id PK)   │    │   (submission_id PK)     │
    └──────────┬───────────────┘    └──────────────────────────┘
               │
               │ 1:M
               │
        ┌──────▼─────────────┐
        │  hets_attestations │
        │ (attestation_id PK)│
        └────────────────────┘
```

### Relationship Details

1. **Provider → Vendor Relationships**: One-to-Many
   - One provider can have multiple vendor relationships
   - Each vendor relationship belongs to exactly one provider
   - Cascade delete: Deleting a provider removes all related vendor relationships

2. **Provider → Attestations**: One-to-Many
   - One provider can have multiple attestations
   - Each attestation is linked to exactly one provider
   - Cascade delete: Deleting a provider removes all related attestations

3. **Vendor Relationship → Attestations**: One-to-Many
   - One vendor relationship can have multiple attestations
   - Each attestation is linked to exactly one vendor relationship
   - Cascade delete: Deleting a relationship removes all related attestations

4. **Provider → Submission History**: One-to-Many
   - One provider can have multiple submission history records
   - Each submission record belongs to exactly one provider
   - Cascade delete: Deleting a provider removes all submission history

---

## Views

### `v_complete_enrollments`
**Purpose**: Consolidated view of all enrollment data including provider, vendor, and attestation information.

**Columns**: All columns from providers, vendor_relationships, and attestations tables (left joins)

**Use Cases**:
- Comprehensive reporting
- Export functionality
- Dashboard displays

### `v_active_relationships`
**Purpose**: Quick view of currently active vendor relationships.

**Columns**: 
- provider_id
- organization_name
- email_address
- vendor_clearinghouse_name
- effective_date
- relationship_status
- offshore_data_sharing_consent

**Use Cases**:
- Monitoring active relationships
- Compliance reporting
- Quick status checks

### `v_submission_summary`
**Purpose**: Statistical summary of provider submissions and activities.

**Columns**:
- provider_id
- organization_name
- total_submissions
- last_submission_date
- vendor_count
- attestation_count

**Use Cases**:
- Performance metrics
- Provider activity monitoring
- Administrative reporting

---

## Stored Functions

### `update_timestamp()`
**Purpose**: Automatically update the `updated_at` timestamp when records are modified.

**Trigger**: Fires BEFORE UPDATE on providers and vendor_relationships tables

**Returns**: Modified row with updated timestamp

### `get_provider_summary(p_provider_id INTEGER)`
**Purpose**: Retrieve comprehensive summary information for a specific provider.

**Parameters**:
- `p_provider_id`: The provider ID to summarize

**Returns**:
- provider_name
- email
- active_relationships count
- total_attestations count
- last_activity timestamp

**Use Cases**:
- Provider detail pages
- Quick status lookup
- Dashboard widgets

---

## Data Integrity Constraints

### Check Constraints

1. **Email Format** (`hets_providers.email_address`)
   - Must match standard email regex pattern
   - Format: `^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$`

2. **NPI Length** (`hets_providers.npi`)
   - Must be exactly 10 characters
   - All characters must be numeric

3. **PTAN Length** (`hets_providers.ptan`)
   - Must be between 5 and 50 characters

4. **Termination Date** (`hets_vendor_relationships.termination_date`)
   - If provided, must be greater than or equal to effective_date

5. **Relationship Status** (`hets_vendor_relationships.relationship_status`)
   - Must be one of: 'Active', 'Pending', 'Terminated', 'Suspended'

6. **Submission Status** (`hets_attestations.submission_status`)
   - Must be one of: 'Submitted', 'Approved', 'Rejected', 'Pending Review'

### Foreign Key Constraints

All foreign keys are configured with `ON DELETE CASCADE` to maintain referential integrity:
- Deleting a provider automatically removes related vendor relationships
- Deleting a provider automatically removes related attestations
- Deleting a provider automatically removes related submission history
- Deleting a vendor relationship automatically removes related attestations

---

## Indexes and Performance

### Indexing Strategy

1. **Primary Keys**: All tables have indexed primary keys (automatic with SERIAL)

2. **Foreign Keys**: All foreign key columns are indexed for join performance

3. **Lookup Columns**: Commonly queried columns are indexed:
   - NPI (frequently used for provider lookup)
   - PTAN (frequently used for provider lookup)
   - Email addresses (used for contact and duplicate checking)

4. **Date Columns**: Date/timestamp columns used in range queries are indexed:
   - created_at (for chronological ordering)
   - attestation_date (for audit queries)
   - submission_date (for reporting)

5. **Status Columns**: Status fields used in filtering are indexed:
   - relationship_status
   - submission_status

### Performance Considerations

1. **Connection Pooling**: Application uses connection pooling (2-10 connections)
2. **Prepared Statements**: All queries use parameterized statements to prevent SQL injection
3. **Transaction Management**: Database operations are wrapped in transactions
4. **Token Refresh**: OAuth tokens are refreshed every 15 minutes to prevent disconnections

---

## Security and Compliance

### Access Control
- OAuth token-based authentication via Databricks SDK
- Row-level security can be implemented via schema permissions
- Audit trail maintained in submission_history table

### Data Protection
- Email addresses and personal information stored securely
- IP addresses captured for audit purposes
- Electronic signatures tracked with timestamps

### HIPAA Compliance
- All tables support HIPAA compliance requirements
- Audit trail functionality built-in
- Attestation tracking for regulatory compliance

### CMS Requirements
- NPI validation enforced
- PTAN tracking implemented
- Relationship effective dates tracked
- Offshore data sharing consent captured

---

## Maintenance and Monitoring

### Regular Maintenance Tasks

1. **Vacuum and Analyze** (Weekly):
   ```sql
   VACUUM ANALYZE hets_providers;
   VACUUM ANALYZE hets_vendor_relationships;
   VACUUM ANALYZE hets_attestations;
   VACUUM ANALYZE hets_submission_history;
   ```

2. **Index Maintenance** (Monthly):
   - Check index usage statistics
   - Rebuild fragmented indexes if needed

3. **Data Archival** (Annually):
   - Archive old submission history records
   - Maintain terminated relationships for compliance period

### Monitoring Queries

1. **Check for Orphaned Records**:
   - Query to find vendor relationships without valid providers
   - Query to find attestations without valid relationships

2. **Expiring Relationships**:
   - Identify relationships terminating within 30 days

3. **Missing Attestations**:
   - Find providers without attestations

4. **Activity Statistics**:
   - Monthly enrollment counts
   - Organization type distribution
   - Relationship status distribution

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-10-21 | Initial schema design and implementation |

---

## References

- CMS HETS Documentation: https://www.cms.gov/data-research/cms-information-technology/hipaa-eligibility-transaction-system-hets
- HIPAA Regulations: https://www.hhs.gov/hipaa
- NPI Information: https://nppes.cms.hhs.gov/

---

*End of Data Dictionary*

