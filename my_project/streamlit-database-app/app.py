import streamlit as st
import psycopg
import os
import time
import re
from datetime import datetime, date
from databricks import sdk
from psycopg import sql
from psycopg_pool import ConnectionPool

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
        try:
            postgres_password = workspace_client.config.oauth_token().access_token
            last_password_refresh = time.time()
        except Exception as e:
            st.error(f"❌ Failed to refresh OAuth token: {str(e)}")
            st.stop()

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
    
    # Recreate pool if token expired
    if postgres_password is None or time.time() - last_password_refresh > 900:
        if connection_pool:
            connection_pool.close()
            connection_pool = None
    
    return get_connection_pool().connection()

def get_schema_name():
    """Get the schema name in the format {PGAPPNAME}_schema_{PGUSER}."""
    pgappname = os.getenv("PGAPPNAME", "my_app")
    pguser = os.getenv("PGUSER", "").replace('-', '')
    return f"{pgappname}_schema_{pguser}"

def init_database():
    """Initialize database schema and tables for HETS EDI Enrollment."""
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                schema_name = get_schema_name()
                
                # Create schema
                cur.execute(sql.SQL("CREATE SCHEMA IF NOT EXISTS {}").format(sql.Identifier(schema_name)))
                
                # Create providers table
                cur.execute(sql.SQL("""
                    CREATE TABLE IF NOT EXISTS {}.hets_providers (
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
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """).format(sql.Identifier(schema_name)))
                
                # Create vendor relationships table
                cur.execute(sql.SQL("""
                    CREATE TABLE IF NOT EXISTS {}.hets_vendor_relationships (
                        relationship_id SERIAL PRIMARY KEY,
                        provider_id INTEGER REFERENCES {}.hets_providers(provider_id) ON DELETE CASCADE,
                        vendor_clearinghouse_name VARCHAR(255) NOT NULL,
                        vendor_contact_name VARCHAR(255),
                        vendor_contact_email VARCHAR(255),
                        vendor_contact_phone VARCHAR(20),
                        effective_date DATE NOT NULL,
                        termination_date DATE,
                        offshore_data_sharing_consent BOOLEAN DEFAULT FALSE,
                        relationship_status VARCHAR(50) DEFAULT 'Active',
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """).format(sql.Identifier(schema_name), sql.Identifier(schema_name)))
                
                # Create attestations table
                cur.execute(sql.SQL("""
                    CREATE TABLE IF NOT EXISTS {}.hets_attestations (
                        attestation_id SERIAL PRIMARY KEY,
                        provider_id INTEGER REFERENCES {}.hets_providers(provider_id) ON DELETE CASCADE,
                        relationship_id INTEGER REFERENCES {}.hets_vendor_relationships(relationship_id) ON DELETE CASCADE,
                        attestation_text TEXT NOT NULL,
                        attested_by VARCHAR(255) NOT NULL,
                        attestation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        ip_address VARCHAR(45),
                        submission_status VARCHAR(50) DEFAULT 'Submitted'
                    )
                """).format(sql.Identifier(schema_name), sql.Identifier(schema_name), sql.Identifier(schema_name)))
                
                # Create submission history table
                cur.execute(sql.SQL("""
                    CREATE TABLE IF NOT EXISTS {}.hets_submission_history (
                        submission_id SERIAL PRIMARY KEY,
                        provider_id INTEGER REFERENCES {}.hets_providers(provider_id) ON DELETE CASCADE,
                        submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        submission_type VARCHAR(50),
                        status VARCHAR(50),
                        notes TEXT
                    )
                """).format(sql.Identifier(schema_name), sql.Identifier(schema_name)))
                
                conn.commit()
                return True
    except Exception as e:
        st.error(f"❌ Database initialization failed: {str(e)}")
        return False

def validate_email(email):
    """Validate email format."""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_npi(npi):
    """Validate NPI format (10 digits)."""
    return len(npi) == 10 and npi.isdigit()

def validate_ptan(ptan):
    """Validate PTAN format."""
    return len(ptan) >= 5 and len(ptan) <= 50

def save_enrollment(provider_data, vendor_data, attestation_data):
    """Save enrollment data to database."""
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                schema = get_schema_name()
                
                # Insert provider
                cur.execute(sql.SQL("""
                    INSERT INTO {}.hets_providers 
                    (authorized_signatory_name, title, organization_name, email_address, 
                     alternate_email_address, phone_number, ptan, npi, tax_id, organization_type)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING provider_id
                """).format(sql.Identifier(schema)), (
                    provider_data['authorized_signatory_name'],
                    provider_data['title'],
                    provider_data['organization_name'],
                    provider_data['email_address'],
                    provider_data['alternate_email_address'],
                    provider_data['phone_number'],
                    provider_data['ptan'],
                    provider_data['npi'],
                    provider_data['tax_id'],
                    provider_data['organization_type']
                ))
                
                provider_id = cur.fetchone()[0]
                
                # Insert vendor relationship
                cur.execute(sql.SQL("""
                    INSERT INTO {}.hets_vendor_relationships 
                    (provider_id, vendor_clearinghouse_name, vendor_contact_name, 
                     vendor_contact_email, vendor_contact_phone, effective_date, 
                     termination_date, offshore_data_sharing_consent, relationship_status)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING relationship_id
                """).format(sql.Identifier(schema)), (
                    provider_id,
                    vendor_data['vendor_clearinghouse_name'],
                    vendor_data['vendor_contact_name'],
                    vendor_data['vendor_contact_email'],
                    vendor_data['vendor_contact_phone'],
                    vendor_data['effective_date'],
                    vendor_data['termination_date'],
                    vendor_data['offshore_data_sharing_consent'],
                    vendor_data['relationship_status']
                ))
                
                relationship_id = cur.fetchone()[0]
                
                # Insert attestation
                cur.execute(sql.SQL("""
                    INSERT INTO {}.hets_attestations 
                    (provider_id, relationship_id, attestation_text, attested_by, ip_address)
                    VALUES (%s, %s, %s, %s, %s)
                """).format(sql.Identifier(schema)), (
                    provider_id,
                    relationship_id,
                    attestation_data['attestation_text'],
                    attestation_data['attested_by'],
                    attestation_data['ip_address']
                ))
                
                # Insert submission history
                cur.execute(sql.SQL("""
                    INSERT INTO {}.hets_submission_history 
                    (provider_id, submission_type, status, notes)
                    VALUES (%s, %s, %s, %s)
                """).format(sql.Identifier(schema)), (
                    provider_id,
                    'EDI Enrollment',
                    'Submitted',
                    f'Initial enrollment submission for {provider_data["organization_name"]}'
                ))
                
                conn.commit()
                return True, provider_id
    except Exception as e:
        st.error(f"❌ Failed to save enrollment: {str(e)}")
        return False, None

def get_enrollments():
    """Retrieve all enrollments."""
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                schema = get_schema_name()
                cur.execute(sql.SQL("""
                    SELECT 
                        p.provider_id,
                        p.authorized_signatory_name,
                        p.organization_name,
                        p.email_address,
                        p.ptan,
                        p.npi,
                        v.vendor_clearinghouse_name,
                        v.effective_date,
                        v.relationship_status,
                        p.created_at
                    FROM {}.hets_providers p
                    LEFT JOIN {}.hets_vendor_relationships v ON p.provider_id = v.provider_id
                    ORDER BY p.created_at DESC
                """).format(sql.Identifier(schema), sql.Identifier(schema)))
                return cur.fetchall()
    except Exception as e:
        st.error(f"❌ Failed to retrieve enrollments: {str(e)}")
        return []

@st.fragment
def display_enrollments():
    """Display existing enrollments."""
    st.subheader("📊 Enrollment Records")
    
    enrollments = get_enrollments()
    
    if not enrollments:
        st.info("📋 No enrollment records found.")
    else:
        for enrollment in enrollments:
            with st.expander(f"🏥 {enrollment[2]} - {enrollment[1]}"):
                col1, col2 = st.columns(2)
                with col1:
                    st.write(f"**Email:** {enrollment[3]}")
                    st.write(f"**PTAN:** {enrollment[4]}")
                    st.write(f"**NPI:** {enrollment[5]}")
                with col2:
                    st.write(f"**Vendor:** {enrollment[6]}")
                    st.write(f"**Effective Date:** {enrollment[7]}")
                    st.write(f"**Status:** {enrollment[8]}")
                st.caption(f"Submitted: {enrollment[9].strftime('%Y-%m-%d %H:%M')}")

# Streamlit UI
def main():
    st.set_page_config(
        page_title="HETS EDI Enrollment",
        page_icon="🏥",
        layout="wide"
    )
    
    # Header with styling
    st.markdown("""
        <style>
        .main-header {
            background: linear-gradient(90deg, #1e3a8a 0%, #3b82f6 100%);
            padding: 2rem;
            border-radius: 10px;
            margin-bottom: 2rem;
        }
        .main-header h1 {
            color: white;
            margin: 0;
        }
        .main-header p {
            color: #e0e7ff;
            margin: 0.5rem 0 0 0;
        }
        </style>
    """, unsafe_allow_html=True)
    
    st.markdown("""
        <div class="main-header">
            <h1>🏥 HETS EDI Enrollment Form</h1>
            <p>HIPAA Eligibility Transaction System - Electronic Data Interchange Enrollment</p>
        </div>
    """, unsafe_allow_html=True)
    
    # Initialize database
    if not init_database():
        st.stop()
    
    # Create tabs
    tab1, tab2 = st.tabs(["📝 New Enrollment", "📊 View Enrollments"])
    
    with tab1:
        st.markdown("### Provider Information")
        st.markdown("Please complete all required fields marked with *")
        
        with st.form("hets_enrollment_form", clear_on_submit=True):
            # Provider Information Section
            col1, col2 = st.columns(2)
            
            with col1:
                authorized_signatory = st.text_input(
                    "Authorized Signatory Name *",
                    placeholder="Full legal name",
                    help="The person authorized to sign on behalf of the organization"
                )
                title = st.text_input(
                    "Title *",
                    placeholder="e.g., CEO, Administrator, Director"
                )
                organization_name = st.text_input(
                    "Organization/Practice Name *",
                    placeholder="Legal organization name"
                )
                email = st.text_input(
                    "Email Address *",
                    placeholder="primary@example.com"
                )
                alternate_email = st.text_input(
                    "Alternate Email Address",
                    placeholder="secondary@example.com (optional)"
                )
            
            with col2:
                phone = st.text_input(
                    "Phone Number *",
                    placeholder="(123) 456-7890"
                )
                ptan = st.text_input(
                    "Provider Transaction Access Number (PTAN) *",
                    placeholder="Enter PTAN",
                    max_chars=50
                )
                npi = st.text_input(
                    "National Provider Identifier (NPI) *",
                    placeholder="10-digit NPI",
                    max_chars=10
                )
                tax_id = st.text_input(
                    "Tax ID/EIN *",
                    placeholder="XX-XXXXXXX"
                )
                organization_type = st.selectbox(
                    "Organization Type *",
                    ["", "Hospital", "Clinic", "Physician Practice", "DME Supplier", 
                     "Home Health Agency", "Nursing Facility", "Other"]
                )
            
            st.markdown("---")
            st.markdown("### Vendor/Clearinghouse Information")
            
            col3, col4 = st.columns(2)
            
            with col3:
                vendor_name = st.text_input(
                    "Vendor/Clearinghouse Name *",
                    placeholder="Name of EDI vendor or clearinghouse"
                )
                vendor_contact_name = st.text_input(
                    "Vendor Contact Name",
                    placeholder="Primary contact at vendor"
                )
                vendor_contact_email = st.text_input(
                    "Vendor Contact Email",
                    placeholder="vendor@example.com"
                )
            
            with col4:
                vendor_contact_phone = st.text_input(
                    "Vendor Contact Phone",
                    placeholder="(123) 456-7890"
                )
                effective_date = st.date_input(
                    "Relationship Effective Date *",
                    value=date.today(),
                    help="Date when the vendor relationship begins"
                )
                termination_date = st.date_input(
                    "Relationship Termination Date",
                    value=None,
                    help="Leave blank if ongoing"
                )
            
            st.markdown("---")
            st.markdown("### Data Sharing and Attestation")
            
            offshore_consent = st.checkbox(
                "I consent to offshore organization data sharing as required by CMS regulations",
                help="Required for vendors that process data outside the United States"
            )
            
            relationship_status = st.selectbox(
                "Relationship Status *",
                ["Active", "Pending", "Terminated", "Suspended"]
            )
            
            st.markdown("---")
            st.markdown("### Attestation")
            
            attestation_text = """
            I hereby attest that:
            
            1. I am authorized to submit this HETS EDI enrollment on behalf of the organization listed above.
            2. All information provided in this form is accurate and complete to the best of my knowledge.
            3. I understand that this enrollment is subject to CMS verification and approval.
            4. I agree to notify CMS of any changes to the information provided within 30 days.
            5. I acknowledge that providing false information may result in termination of HETS access and potential legal consequences.
            6. I have read and agree to comply with all HIPAA regulations and CMS requirements for EDI transactions.
            """
            
            st.text_area(
                "Attestation Statement",
                value=attestation_text,
                height=200,
                disabled=True
            )
            
            attestation_agree = st.checkbox(
                "I have read and agree to the attestation statement above *",
                help="Required to submit enrollment"
            )
            
            attested_by_name = st.text_input(
                "Type your full name to attest *",
                placeholder="Full legal name",
                help="This serves as your electronic signature"
            )
            
            st.markdown("---")
            
            # Submit button
            col_submit1, col_submit2, col_submit3 = st.columns([1, 1, 1])
            with col_submit2:
                submitted = st.form_submit_button("Submit Enrollment", type="primary", use_container_width=True)
            
            if submitted:
                # Validation
                errors = []
                
                if not authorized_signatory:
                    errors.append("Authorized Signatory Name is required")
                if not title:
                    errors.append("Title is required")
                if not organization_name:
                    errors.append("Organization Name is required")
                if not email:
                    errors.append("Email Address is required")
                elif not validate_email(email):
                    errors.append("Invalid email format")
                if alternate_email and not validate_email(alternate_email):
                    errors.append("Invalid alternate email format")
                if not phone:
                    errors.append("Phone Number is required")
                if not ptan:
                    errors.append("PTAN is required")
                elif not validate_ptan(ptan):
                    errors.append("Invalid PTAN format")
                if not npi:
                    errors.append("NPI is required")
                elif not validate_npi(npi):
                    errors.append("NPI must be exactly 10 digits")
                if not tax_id:
                    errors.append("Tax ID is required")
                if not organization_type:
                    errors.append("Organization Type is required")
                if not vendor_name:
                    errors.append("Vendor/Clearinghouse Name is required")
                if not attestation_agree:
                    errors.append("You must agree to the attestation statement")
                if not attested_by_name:
                    errors.append("You must type your name to attest")
                if attested_by_name and authorized_signatory and attested_by_name.strip().lower() != authorized_signatory.strip().lower():
                    errors.append("Attested name must match Authorized Signatory Name")
                
                if errors:
                    st.error("❌ Please correct the following errors:")
                    for error in errors:
                        st.write(f"- {error}")
                else:
                    # Prepare data
                    provider_data = {
                        'authorized_signatory_name': authorized_signatory,
                        'title': title,
                        'organization_name': organization_name,
                        'email_address': email,
                        'alternate_email_address': alternate_email if alternate_email else None,
                        'phone_number': phone,
                        'ptan': ptan,
                        'npi': npi,
                        'tax_id': tax_id,
                        'organization_type': organization_type
                    }
                    
                    vendor_data = {
                        'vendor_clearinghouse_name': vendor_name,
                        'vendor_contact_name': vendor_contact_name if vendor_contact_name else None,
                        'vendor_contact_email': vendor_contact_email if vendor_contact_email else None,
                        'vendor_contact_phone': vendor_contact_phone if vendor_contact_phone else None,
                        'effective_date': effective_date,
                        'termination_date': termination_date if termination_date else None,
                        'offshore_data_sharing_consent': offshore_consent,
                        'relationship_status': relationship_status
                    }
                    
                    attestation_data = {
                        'attestation_text': attestation_text,
                        'attested_by': attested_by_name,
                        'ip_address': 'system'  # You can enhance this to capture actual IP
                    }
                    
                    # Save to database
                    success, provider_id = save_enrollment(provider_data, vendor_data, attestation_data)
                    
                    if success:
                        st.success(f"""
                        ✅ **Enrollment Submitted Successfully!**
                        
                        Your HETS EDI enrollment has been submitted for processing.
                        
                        **Reference ID:** {provider_id}
                        
                        **Organization:** {organization_name}
                        
                        **Next Steps:**
                        - You will receive a confirmation email at {email}
                        - CMS will review your enrollment within 5-7 business days
                        - You will be notified of your enrollment status
                        
                        Please retain this reference ID for your records.
                        """)
                        st.balloons()
    
    with tab2:
        display_enrollments()

if __name__ == "__main__":
    main() 