-- =====================================================
-- HETS EDI Enrollment Database Schema
-- =====================================================
-- This SQL file contains the complete database schema
-- for the HETS EDI Enrollment application
-- =====================================================

-- Note: Replace {schema_name} with your actual schema name
-- Format: {PGAPPNAME}_schema_{PGUSER}

-- =====================================================
-- TABLE: hets_providers
-- Purpose: Store healthcare provider information
-- =====================================================

CREATE TABLE IF NOT EXISTS {schema_name}.hets_providers (
    provider_id SERIAL PRIMARY KEY,
    authorized_signatory_name VARCHAR(255) NOT NULL,
    title VARCHAR(100),
    organization_name VARCHAR(255),
    email_address VARCHAR(255) NOT NULL,
    alternate_email_address VARCHAR(255),
    phone_number VARCHAR(20),
    ptan VARCHAR(50),
    npi VARCHAR(10),
    tax_id VARCHAR(20),
    organization_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_email_format CHECK (email_address ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT chk_npi_length CHECK (LENGTH(npi) = 10),
    CONSTRAINT chk_ptan_length CHECK (LENGTH(ptan) >= 5 AND LENGTH(ptan) <= 50)
);

-- Indexes for performance
CREATE INDEX idx_providers_npi ON {schema_name}.hets_providers(npi);
CREATE INDEX idx_providers_ptan ON {schema_name}.hets_providers(ptan);
CREATE INDEX idx_providers_email ON {schema_name}.hets_providers(email_address);
CREATE INDEX idx_providers_created_at ON {schema_name}.hets_providers(created_at DESC);

-- Comments
COMMENT ON TABLE {schema_name}.hets_providers IS 'Healthcare provider information for HETS EDI enrollment';
COMMENT ON COLUMN {schema_name}.hets_providers.provider_id IS 'Unique identifier for provider';
COMMENT ON COLUMN {schema_name}.hets_providers.ptan IS 'Provider Transaction Access Number';
COMMENT ON COLUMN {schema_name}.hets_providers.npi IS 'National Provider Identifier (10 digits)';


-- =====================================================
-- TABLE: hets_vendor_relationships
-- Purpose: Track vendor/clearinghouse relationships
-- =====================================================

CREATE TABLE IF NOT EXISTS {schema_name}.hets_vendor_relationships (
    relationship_id SERIAL PRIMARY KEY,
    provider_id INTEGER NOT NULL,
    vendor_clearinghouse_name VARCHAR(255) NOT NULL,
    vendor_contact_name VARCHAR(255),
    vendor_contact_email VARCHAR(255),
    vendor_contact_phone VARCHAR(20),
    effective_date DATE NOT NULL,
    termination_date DATE,
    offshore_data_sharing_consent BOOLEAN DEFAULT FALSE,
    relationship_status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT fk_vendor_provider 
        FOREIGN KEY (provider_id) 
        REFERENCES {schema_name}.hets_providers(provider_id) 
        ON DELETE CASCADE,
    CONSTRAINT chk_termination_after_effective 
        CHECK (termination_date IS NULL OR termination_date >= effective_date),
    CONSTRAINT chk_relationship_status 
        CHECK (relationship_status IN ('Active', 'Pending', 'Terminated', 'Suspended'))
);

-- Indexes for performance
CREATE INDEX idx_vendor_relationships_provider ON {schema_name}.hets_vendor_relationships(provider_id);
CREATE INDEX idx_vendor_relationships_status ON {schema_name}.hets_vendor_relationships(relationship_status);
CREATE INDEX idx_vendor_relationships_effective_date ON {schema_name}.hets_vendor_relationships(effective_date);

-- Comments
COMMENT ON TABLE {schema_name}.hets_vendor_relationships IS 'Vendor and clearinghouse relationships for EDI transactions';
COMMENT ON COLUMN {schema_name}.hets_vendor_relationships.offshore_data_sharing_consent IS 'Consent for offshore data processing';


-- =====================================================
-- TABLE: hets_attestations
-- Purpose: Store attestation records and e-signatures
-- =====================================================

CREATE TABLE IF NOT EXISTS {schema_name}.hets_attestations (
    attestation_id SERIAL PRIMARY KEY,
    provider_id INTEGER NOT NULL,
    relationship_id INTEGER NOT NULL,
    attestation_text TEXT NOT NULL,
    attested_by VARCHAR(255) NOT NULL,
    attestation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    submission_status VARCHAR(50) DEFAULT 'Submitted',
    
    -- Constraints
    CONSTRAINT fk_attestation_provider 
        FOREIGN KEY (provider_id) 
        REFERENCES {schema_name}.hets_providers(provider_id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_attestation_relationship 
        FOREIGN KEY (relationship_id) 
        REFERENCES {schema_name}.hets_vendor_relationships(relationship_id) 
        ON DELETE CASCADE,
    CONSTRAINT chk_submission_status 
        CHECK (submission_status IN ('Submitted', 'Approved', 'Rejected', 'Pending Review'))
);

-- Indexes for performance
CREATE INDEX idx_attestations_provider ON {schema_name}.hets_attestations(provider_id);
CREATE INDEX idx_attestations_relationship ON {schema_name}.hets_attestations(relationship_id);
CREATE INDEX idx_attestations_date ON {schema_name}.hets_attestations(attestation_date DESC);
CREATE INDEX idx_attestations_status ON {schema_name}.hets_attestations(submission_status);

-- Comments
COMMENT ON TABLE {schema_name}.hets_attestations IS 'Digital attestations and electronic signatures';
COMMENT ON COLUMN {schema_name}.hets_attestations.ip_address IS 'IP address of person submitting attestation';


-- =====================================================
-- TABLE: hets_submission_history
-- Purpose: Track all submission activities
-- =====================================================

CREATE TABLE IF NOT EXISTS {schema_name}.hets_submission_history (
    submission_id SERIAL PRIMARY KEY,
    provider_id INTEGER NOT NULL,
    submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    submission_type VARCHAR(50),
    status VARCHAR(50),
    notes TEXT,
    
    -- Constraints
    CONSTRAINT fk_submission_provider 
        FOREIGN KEY (provider_id) 
        REFERENCES {schema_name}.hets_providers(provider_id) 
        ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_submission_history_provider ON {schema_name}.hets_submission_history(provider_id);
CREATE INDEX idx_submission_history_date ON {schema_name}.hets_submission_history(submission_date DESC);
CREATE INDEX idx_submission_history_status ON {schema_name}.hets_submission_history(status);

-- Comments
COMMENT ON TABLE {schema_name}.hets_submission_history IS 'Audit trail of all submissions and status changes';


-- =====================================================
-- VIEWS
-- Purpose: Useful views for reporting and queries
-- =====================================================

-- View: Complete enrollment information
CREATE OR REPLACE VIEW {schema_name}.v_complete_enrollments AS
SELECT 
    p.provider_id,
    p.authorized_signatory_name,
    p.title,
    p.organization_name,
    p.email_address,
    p.alternate_email_address,
    p.phone_number,
    p.ptan,
    p.npi,
    p.tax_id,
    p.organization_type,
    v.relationship_id,
    v.vendor_clearinghouse_name,
    v.vendor_contact_name,
    v.vendor_contact_email,
    v.vendor_contact_phone,
    v.effective_date,
    v.termination_date,
    v.offshore_data_sharing_consent,
    v.relationship_status,
    a.attestation_id,
    a.attested_by,
    a.attestation_date,
    a.submission_status,
    p.created_at,
    p.updated_at
FROM {schema_name}.hets_providers p
LEFT JOIN {schema_name}.hets_vendor_relationships v ON p.provider_id = v.provider_id
LEFT JOIN {schema_name}.hets_attestations a ON p.provider_id = a.provider_id AND v.relationship_id = a.relationship_id;

COMMENT ON VIEW {schema_name}.v_complete_enrollments IS 'Complete enrollment information with provider, vendor, and attestation details';

-- View: Active relationships
CREATE OR REPLACE VIEW {schema_name}.v_active_relationships AS
SELECT 
    p.provider_id,
    p.organization_name,
    p.email_address,
    v.vendor_clearinghouse_name,
    v.effective_date,
    v.relationship_status,
    v.offshore_data_sharing_consent
FROM {schema_name}.hets_providers p
INNER JOIN {schema_name}.hets_vendor_relationships v ON p.provider_id = v.provider_id
WHERE v.relationship_status = 'Active'
  AND (v.termination_date IS NULL OR v.termination_date > CURRENT_DATE);

COMMENT ON VIEW {schema_name}.v_active_relationships IS 'Currently active vendor relationships';

-- View: Submission summary
CREATE OR REPLACE VIEW {schema_name}.v_submission_summary AS
SELECT 
    p.provider_id,
    p.organization_name,
    COUNT(DISTINCT sh.submission_id) as total_submissions,
    MAX(sh.submission_date) as last_submission_date,
    COUNT(DISTINCT v.relationship_id) as vendor_count,
    COUNT(DISTINCT a.attestation_id) as attestation_count
FROM {schema_name}.hets_providers p
LEFT JOIN {schema_name}.hets_submission_history sh ON p.provider_id = sh.provider_id
LEFT JOIN {schema_name}.hets_vendor_relationships v ON p.provider_id = v.provider_id
LEFT JOIN {schema_name}.hets_attestations a ON p.provider_id = a.provider_id
GROUP BY p.provider_id, p.organization_name;

COMMENT ON VIEW {schema_name}.v_submission_summary IS 'Summary statistics for provider submissions';


-- =====================================================
-- FUNCTIONS
-- Purpose: Useful functions for data management
-- =====================================================

-- Function: Update timestamp trigger
CREATE OR REPLACE FUNCTION {schema_name}.update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update timestamp on providers table
CREATE TRIGGER trg_providers_updated_at
    BEFORE UPDATE ON {schema_name}.hets_providers
    FOR EACH ROW
    EXECUTE FUNCTION {schema_name}.update_timestamp();

-- Trigger: Auto-update timestamp on vendor relationships table
CREATE TRIGGER trg_vendor_relationships_updated_at
    BEFORE UPDATE ON {schema_name}.hets_vendor_relationships
    FOR EACH ROW
    EXECUTE FUNCTION {schema_name}.update_timestamp();


-- Function: Get provider summary
CREATE OR REPLACE FUNCTION {schema_name}.get_provider_summary(p_provider_id INTEGER)
RETURNS TABLE (
    provider_name VARCHAR,
    email VARCHAR,
    active_relationships BIGINT,
    total_attestations BIGINT,
    last_activity TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.organization_name,
        p.email_address,
        COUNT(DISTINCT CASE WHEN v.relationship_status = 'Active' THEN v.relationship_id END) as active_relationships,
        COUNT(DISTINCT a.attestation_id) as total_attestations,
        GREATEST(p.updated_at, MAX(sh.submission_date)) as last_activity
    FROM {schema_name}.hets_providers p
    LEFT JOIN {schema_name}.hets_vendor_relationships v ON p.provider_id = v.provider_id
    LEFT JOIN {schema_name}.hets_attestations a ON p.provider_id = a.provider_id
    LEFT JOIN {schema_name}.hets_submission_history sh ON p.provider_id = sh.provider_id
    WHERE p.provider_id = p_provider_id
    GROUP BY p.provider_id, p.organization_name, p.email_address, p.updated_at;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION {schema_name}.get_provider_summary IS 'Get summary information for a specific provider';


-- =====================================================
-- SAMPLE QUERIES
-- Purpose: Useful queries for common operations
-- =====================================================

-- Query: Find providers with expiring relationships (within 30 days)
/*
SELECT 
    p.organization_name,
    p.email_address,
    v.vendor_clearinghouse_name,
    v.termination_date
FROM {schema_name}.hets_providers p
INNER JOIN {schema_name}.hets_vendor_relationships v ON p.provider_id = v.provider_id
WHERE v.termination_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
  AND v.relationship_status = 'Active'
ORDER BY v.termination_date;
*/

-- Query: Find providers without attestations
/*
SELECT 
    p.provider_id,
    p.organization_name,
    p.email_address,
    p.created_at
FROM {schema_name}.hets_providers p
LEFT JOIN {schema_name}.hets_attestations a ON p.provider_id = a.provider_id
WHERE a.attestation_id IS NULL
ORDER BY p.created_at DESC;
*/

-- Query: Monthly enrollment statistics
/*
SELECT 
    DATE_TRUNC('month', created_at) as enrollment_month,
    COUNT(*) as new_enrollments,
    COUNT(DISTINCT organization_type) as organization_types
FROM {schema_name}.hets_providers
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY enrollment_month DESC;
*/

-- =====================================================
-- DATA INTEGRITY CHECKS
-- Purpose: Queries to verify data integrity
-- =====================================================

-- Check for orphaned records (should return empty)
/*
-- Vendor relationships without providers
SELECT * FROM {schema_name}.hets_vendor_relationships v
WHERE NOT EXISTS (
    SELECT 1 FROM {schema_name}.hets_providers p WHERE p.provider_id = v.provider_id
);

-- Attestations without providers
SELECT * FROM {schema_name}.hets_attestations a
WHERE NOT EXISTS (
    SELECT 1 FROM {schema_name}.hets_providers p WHERE p.provider_id = a.provider_id
);

-- Attestations without relationships
SELECT * FROM {schema_name}.hets_attestations a
WHERE NOT EXISTS (
    SELECT 1 FROM {schema_name}.hets_vendor_relationships v WHERE v.relationship_id = a.relationship_id
);
*/

-- =====================================================
-- MAINTENANCE
-- Purpose: Regular maintenance queries
-- =====================================================

-- Vacuum and analyze tables (run periodically)
/*
VACUUM ANALYZE {schema_name}.hets_providers;
VACUUM ANALYZE {schema_name}.hets_vendor_relationships;
VACUUM ANALYZE {schema_name}.hets_attestations;
VACUUM ANALYZE {schema_name}.hets_submission_history;
*/

-- =====================================================
-- END OF SCHEMA
-- =====================================================

