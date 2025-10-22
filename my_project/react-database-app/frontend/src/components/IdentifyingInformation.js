import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Grid,
  MenuItem,
  Button,
  Alert,
  Divider
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const states = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

const IdentifyingInformation = ({ data, entityType, onUpdate, onNext, onBack }) => {
  const isIndividual = entityType === 'Individual';
  
  const validationSchema = Yup.object().shape(
    isIndividual ? {
      first_name: Yup.string().required('First name is required'),
      last_name: Yup.string().required('Last name is required'),
      date_of_birth: Yup.date().required('Date of birth is required').nullable(),
      ssn: Yup.string().matches(/^\d{3}-\d{2}-\d{4}$/, 'SSN format: XXX-XX-XXXX'),
    } : {
      organization_name: Yup.string().required('Organization name is required'),
      ein: Yup.string().required('EIN is required').matches(/^\d{2}-\d{7}$/, 'EIN format: XX-XXXXXXX'),
    }
  );

  const formik = useFormik({
    initialValues: data,
    validationSchema,
    onSubmit: (values) => {
      onUpdate(values);
      onNext();
    },
  });

  return (
    <Box component="form" onSubmit={formik.handleSubmit}>
      <Typography variant="h5" gutterBottom color="primary" sx={{ mb: 3 }}>
        Section 2: Identifying Information
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        {isIndividual 
          ? 'Please provide your personal identifying information.' 
          : 'Please provide your organization\'s identifying information.'}
      </Alert>

      {isIndividual ? (
        <>
          {/* Individual Fields */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={2}>
              <TextField
                fullWidth
                select
                label="Prefix"
                name="name_prefix"
                value={formik.values.name_prefix}
                onChange={formik.handleChange}
              >
                <MenuItem value="">None</MenuItem>
                <MenuItem value="Dr.">Dr.</MenuItem>
                <MenuItem value="Mr.">Mr.</MenuItem>
                <MenuItem value="Ms.">Ms.</MenuItem>
                <MenuItem value="Mrs.">Mrs.</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                required
                label="First Name"
                name="first_name"
                value={formik.values.first_name}
                onChange={formik.handleChange}
                error={formik.touched.first_name && Boolean(formik.errors.first_name)}
                helperText={formik.touched.first_name && formik.errors.first_name}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                fullWidth
                label="Middle Name"
                name="middle_name"
                value={formik.values.middle_name}
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                required
                label="Last Name"
                name="last_name"
                value={formik.values.last_name}
                onChange={formik.handleChange}
                error={formik.touched.last_name && Boolean(formik.errors.last_name)}
                helperText={formik.touched.last_name && formik.errors.last_name}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                fullWidth
                select
                label="Suffix"
                name="name_suffix"
                value={formik.values.name_suffix}
                onChange={formik.handleChange}
              >
                <MenuItem value="">None</MenuItem>
                <MenuItem value="Jr.">Jr.</MenuItem>
                <MenuItem value="Sr.">Sr.</MenuItem>
                <MenuItem value="II">II</MenuItem>
                <MenuItem value="III">III</MenuItem>
                <MenuItem value="IV">IV</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Credentials"
                name="credential"
                value={formik.values.credential}
                onChange={formik.handleChange}
                placeholder="e.g., MD, DO, DDS, RN"
                helperText="Professional credentials"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Date of Birth"
                name="date_of_birth"
                type="date"
                value={formik.values.date_of_birth || ''}
                onChange={formik.handleChange}
                InputLabelProps={{ shrink: true }}
                error={formik.touched.date_of_birth && Boolean(formik.errors.date_of_birth)}
                helperText={formik.touched.date_of_birth && formik.errors.date_of_birth}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Gender"
                name="gender"
                value={formik.values.gender}
                onChange={formik.handleChange}
              >
                <MenuItem value="">Select</MenuItem>
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Social Security Number"
                name="ssn"
                value={formik.values.ssn}
                onChange={formik.handleChange}
                placeholder="XXX-XX-XXXX"
                error={formik.touched.ssn && Boolean(formik.errors.ssn)}
                helperText={formik.touched.ssn && formik.errors.ssn || "Format: XXX-XX-XXXX"}
              />
            </Grid>
          </Grid>
        </>
      ) : (
        <>
          {/* Organization Fields */}
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Organization Name"
                name="organization_name"
                value={formik.values.organization_name}
                onChange={formik.handleChange}
                error={formik.touched.organization_name && Boolean(formik.errors.organization_name)}
                helperText={formik.touched.organization_name && formik.errors.organization_name}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Organization Type"
                name="organization_type"
                value={formik.values.organization_type}
                onChange={formik.handleChange}
              >
                <MenuItem value="">Select</MenuItem>
                <MenuItem value="Hospital">Hospital</MenuItem>
                <MenuItem value="Clinic">Clinic</MenuItem>
                <MenuItem value="Group Practice">Group Practice</MenuItem>
                <MenuItem value="Nursing Facility">Nursing Facility</MenuItem>
                <MenuItem value="Laboratory">Laboratory</MenuItem>
                <MenuItem value="Home Health Agency">Home Health Agency</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Employer Identification Number (EIN)"
                name="ein"
                value={formik.values.ein}
                onChange={formik.handleChange}
                placeholder="XX-XXXXXXX"
                error={formik.touched.ein && Boolean(formik.errors.ein)}
                helperText={formik.touched.ein && formik.errors.ein || "Format: XX-XXXXXXX"}
              />
            </Grid>
          </Grid>
        </>
      )}

      <Divider sx={{ my: 4 }} />

      {/* License Information (common for both) */}
      <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>
        License Information
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="State License Number"
            name="state_license_number"
            value={formik.values.state_license_number}
            onChange={formik.handleChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            select
            label="Issuing State"
            name="issuing_state"
            value={formik.values.issuing_state}
            onChange={formik.handleChange}
          >
            <MenuItem value="">Select State</MenuItem>
            {states.map(state => (
              <MenuItem key={state} value={state}>{state}</MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>

      {/* Other Names */}
      <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>
        Other Names (if applicable)
      </Typography>
      <Grid container spacing={2}>
        {isIndividual ? (
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Other Name (Former Name, Alias)"
              name="other_name"
              value={formik.values.other_name}
              onChange={formik.handleChange}
              helperText="Include any former or maiden names"
            />
          </Grid>
        ) : (
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Other Organization Name (Former Name, DBA)"
              name="other_organization_name"
              value={formik.values.other_organization_name}
              onChange={formik.handleChange}
              helperText="Include any former names or DBA names"
            />
          </Grid>
        )}
      </Grid>

      {/* Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button
          onClick={onBack}
          variant="outlined"
          size="large"
        >
          Back
        </Button>
        <Button
          type="submit"
          variant="contained"
          size="large"
        >
          Next: Business Address
        </Button>
      </Box>
    </Box>
  );
};

export default IdentifyingInformation;

