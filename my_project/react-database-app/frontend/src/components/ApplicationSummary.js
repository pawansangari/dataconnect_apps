import React from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Divider,
  CircularProgress
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const SectionTitle = ({ children }) => (
  <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 3, mb: 2 }}>
    {children}
  </Typography>
);

const DataRow = ({ label, value }) => (
  <Grid container spacing={2} sx={{ mb: 1 }}>
    <Grid item xs={5}>
      <Typography variant="body2" fontWeight="600" color="text.secondary">
        {label}:
      </Typography>
    </Grid>
    <Grid item xs={7}>
      <Typography variant="body2">
        {value || 'Not provided'}
      </Typography>
    </Grid>
  </Grid>
);

const ApplicationSummary = ({ formData, onSubmit, onBack, submitting }) => {
  const { basicInformation, identifyingInformation, businessAddress, contactPerson, certification } = formData;
  const isIndividual = basicInformation.entity_type === 'Individual';

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <CheckCircleIcon color="success" sx={{ fontSize: 40, mr: 2 }} />
        <Box>
          <Typography variant="h5" color="primary">
            Review Your Application
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please review all information carefully before submitting
          </Typography>
        </Box>
      </Box>

      <Paper elevation={0} sx={{ bgcolor: 'grey.50', p: 3 }}>
        {/* Basic Information */}
        <SectionTitle>1. Basic Information</SectionTitle>
        <DataRow label="Submission Reason" value={basicInformation.submission_reason} />
        <DataRow label="Entity Type" value={basicInformation.entity_type} />
        {basicInformation.npi && <DataRow label="Existing NPI" value={basicInformation.npi} />}

        <Divider sx={{ my: 3 }} />

        {/* Identifying Information */}
        <SectionTitle>2. Identifying Information</SectionTitle>
        {isIndividual ? (
          <>
            <DataRow 
              label="Full Name" 
              value={`${identifyingInformation.name_prefix || ''} ${identifyingInformation.first_name} ${identifyingInformation.middle_name || ''} ${identifyingInformation.last_name} ${identifyingInformation.name_suffix || ''}`.trim()} 
            />
            <DataRow label="Credential" value={identifyingInformation.credential} />
            <DataRow label="Date of Birth" value={identifyingInformation.date_of_birth} />
            <DataRow label="Gender" value={identifyingInformation.gender} />
            <DataRow label="SSN" value={identifyingInformation.ssn ? '***-**-' + identifyingInformation.ssn.slice(-4) : ''} />
          </>
        ) : (
          <>
            <DataRow label="Organization Name" value={identifyingInformation.organization_name} />
            <DataRow label="Organization Type" value={identifyingInformation.organization_type} />
            <DataRow label="EIN" value={identifyingInformation.ein} />
          </>
        )}
        <DataRow label="State License Number" value={identifyingInformation.state_license_number} />
        <DataRow label="Issuing State" value={identifyingInformation.issuing_state} />

        <Divider sx={{ my: 3 }} />

        {/* Business Address */}
        <SectionTitle>3. Business Address</SectionTitle>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
          Mailing Address
        </Typography>
        <DataRow 
          label="Address" 
          value={`${businessAddress.mailing_address_line1}${businessAddress.mailing_address_line2 ? ', ' + businessAddress.mailing_address_line2 : ''}`} 
        />
        <DataRow 
          label="City, State ZIP" 
          value={`${businessAddress.mailing_city}, ${businessAddress.mailing_state} ${businessAddress.mailing_zip}`} 
        />
        <DataRow label="Phone" value={businessAddress.mailing_phone} />
        
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, mt: 2 }}>
          Practice Location
        </Typography>
        <DataRow 
          label="Address" 
          value={`${businessAddress.practice_address_line1}${businessAddress.practice_address_line2 ? ', ' + businessAddress.practice_address_line2 : ''}`} 
        />
        <DataRow 
          label="City, State ZIP" 
          value={`${businessAddress.practice_city}, ${businessAddress.practice_state} ${businessAddress.practice_zip}`} 
        />
        <DataRow label="Phone" value={businessAddress.practice_phone} />

        <Divider sx={{ my: 3 }} />

        {/* Contact Person */}
        <SectionTitle>4. Contact Person</SectionTitle>
        <DataRow 
          label="Name" 
          value={`${contactPerson.contact_first_name} ${contactPerson.contact_middle_name || ''} ${contactPerson.contact_last_name}`.trim()} 
        />
        <DataRow label="Phone" value={`${contactPerson.contact_phone}${contactPerson.contact_phone_ext ? ' ext. ' + contactPerson.contact_phone_ext : ''}`} />
        <DataRow label="Email" value={contactPerson.contact_email} />

        <Divider sx={{ my: 3 }} />

        {/* Certification */}
        <SectionTitle>5. Certification</SectionTitle>
        <DataRow 
          label="Authorized Official" 
          value={`${certification.authorized_official_first_name} ${certification.authorized_official_middle_name || ''} ${certification.authorized_official_last_name}`.trim()} 
        />
        <DataRow label="Title" value={certification.authorized_official_title} />
        <DataRow label="Phone" value={certification.authorized_official_phone} />
        <DataRow label="Email" value={certification.authorized_official_email} />
        <DataRow label="Signature" value={certification.signature} />
        <DataRow label="Date" value={certification.certification_date} />
      </Paper>

      <Box 
        sx={{ 
          bgcolor: 'warning.light', 
          p: 2, 
          borderRadius: 1, 
          mt: 3,
          border: '1px solid',
          borderColor: 'warning.main'
        }}
      >
        <Typography variant="body2" fontWeight="600">
          ⚠️ By submitting this application, you certify that all information provided is true and accurate.
        </Typography>
        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
          After submission, you will receive a reference ID for tracking your application status.
        </Typography>
      </Box>

      {/* Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button
          onClick={onBack}
          variant="outlined"
          size="large"
          disabled={submitting}
        >
          Back to Edit
        </Button>
        <Button
          onClick={onSubmit}
          variant="contained"
          size="large"
          disabled={submitting}
          startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : null}
          sx={{ minWidth: 200 }}
        >
          {submitting ? 'Submitting...' : 'Submit Application'}
        </Button>
      </Box>
    </Box>
  );
};

export default ApplicationSummary;

