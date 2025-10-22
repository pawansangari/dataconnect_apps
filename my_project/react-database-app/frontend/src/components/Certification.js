import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Grid,
  Button,
  Alert,
  Paper,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object({
  authorized_official_first_name: Yup.string().required('First name is required'),
  authorized_official_last_name: Yup.string().required('Last name is required'),
  authorized_official_title: Yup.string().required('Title/Position is required'),
  authorized_official_phone: Yup.string().required('Phone number is required'),
  authorized_official_email: Yup.string().email('Invalid email address').required('Email is required'),
  signature: Yup.string().required('Electronic signature is required'),
  certification_date: Yup.date().required('Certification date is required'),
  agreement: Yup.boolean().oneOf([true], 'You must agree to the certification statement'),
});

const Certification = ({ data, onUpdate, onNext, onBack }) => {
  const [agreed, setAgreed] = React.useState(false);

  const formik = useFormik({
    initialValues: { ...data, agreement: false },
    validationSchema,
    onSubmit: (values) => {
      const { agreement, ...dataToSave } = values;
      onUpdate(dataToSave);
      onNext();
    },
  });

  const certificationStatement = `I certify that the information provided in this application is true, accurate, and complete. I understand that:

1. I am the authorized official for the applicant and have the authority to submit this application on behalf of the individual or organization.

2. I understand that any willful misrepresentation or falsification of the information provided in this application may subject me to criminal, civil, or administrative penalties.

3. I authorize CMS or its agents to obtain information regarding my credentials and licensure status from primary sources and their authorized agents.

4. I authorize CMS to release NPI data to the public as specified in 45 CFR §162.410.

5. I will review the NPPES data at least every 12 months and report changes within 30 days.

6. I understand that an NPI will remain assigned to me even if I am no longer an active healthcare provider.`;

  return (
    <Box component="form" onSubmit={formik.handleSubmit}>
      <Typography variant="h5" gutterBottom color="primary" sx={{ mb: 3 }}>
        Section 5: Certification Statement
      </Typography>

      <Alert severity="warning" sx={{ mb: 3 }}>
        <strong>Important:</strong> The authorized official must be a person with the authority to legally bind the applicant.
        This person will be held accountable for the accuracy of the information provided.
      </Alert>

      <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>
        Authorized Official Information
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            required
            label="First Name"
            name="authorized_official_first_name"
            value={formik.values.authorized_official_first_name}
            onChange={formik.handleChange}
            error={formik.touched.authorized_official_first_name && Boolean(formik.errors.authorized_official_first_name)}
            helperText={formik.touched.authorized_official_first_name && formik.errors.authorized_official_first_name}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Middle Name"
            name="authorized_official_middle_name"
            value={formik.values.authorized_official_middle_name}
            onChange={formik.handleChange}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            required
            label="Last Name"
            name="authorized_official_last_name"
            value={formik.values.authorized_official_last_name}
            onChange={formik.handleChange}
            error={formik.touched.authorized_official_last_name && Boolean(formik.errors.authorized_official_last_name)}
            helperText={formik.touched.authorized_official_last_name && formik.errors.authorized_official_last_name}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            required
            label="Title/Position"
            name="authorized_official_title"
            value={formik.values.authorized_official_title}
            onChange={formik.handleChange}
            placeholder="e.g., CEO, Administrator, Owner"
            error={formik.touched.authorized_official_title && Boolean(formik.errors.authorized_official_title)}
            helperText={formik.touched.authorized_official_title && formik.errors.authorized_official_title}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            required
            label="Phone Number"
            name="authorized_official_phone"
            value={formik.values.authorized_official_phone}
            onChange={formik.handleChange}
            placeholder="(XXX) XXX-XXXX"
            error={formik.touched.authorized_official_phone && Boolean(formik.errors.authorized_official_phone)}
            helperText={formik.touched.authorized_official_phone && formik.errors.authorized_official_phone}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            required
            label="Email Address"
            name="authorized_official_email"
            type="email"
            value={formik.values.authorized_official_email}
            onChange={formik.handleChange}
            error={formik.touched.authorized_official_email && Boolean(formik.errors.authorized_official_email)}
            helperText={formik.touched.authorized_official_email && formik.errors.authorized_official_email}
          />
        </Grid>
      </Grid>

      {/* Certification Statement */}
      <Paper elevation={0} sx={{ bgcolor: 'grey.50', p: 3, my: 3 }}>
        <Typography variant="h6" gutterBottom>
          Certification Statement
        </Typography>
        <Typography
          variant="body2"
          component="pre"
          sx={{
            whiteSpace: 'pre-wrap',
            fontFamily: 'inherit',
            color: 'text.secondary',
            lineHeight: 1.8
          }}
        >
          {certificationStatement}
        </Typography>
      </Paper>

      <FormControlLabel
        control={
          <Checkbox
            name="agreement"
            checked={formik.values.agreement}
            onChange={(e) => {
              formik.handleChange(e);
              setAgreed(e.target.checked);
            }}
            color="primary"
          />
        }
        label={
          <Typography variant="body2">
            I have read and agree to the certification statement above *
          </Typography>
        }
      />
      {formik.touched.agreement && formik.errors.agreement && (
        <Typography color="error" variant="caption" display="block" sx={{ ml: 4 }}>
          {formik.errors.agreement}
        </Typography>
      )}

      {/* Electronic Signature */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Electronic Signature
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              label="Type Your Full Name"
              name="signature"
              value={formik.values.signature}
              onChange={formik.handleChange}
              placeholder="Type your full legal name"
              helperText="This serves as your electronic signature"
              error={formik.touched.signature && Boolean(formik.errors.signature)}
              disabled={!agreed}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              label="Date"
              name="certification_date"
              type="date"
              value={formik.values.certification_date}
              onChange={formik.handleChange}
              InputLabelProps={{ shrink: true }}
              error={formik.touched.certification_date && Boolean(formik.errors.certification_date)}
              helperText={formik.touched.certification_date && formik.errors.certification_date}
            />
          </Grid>
        </Grid>
      </Box>

      <Alert severity="info" sx={{ mt: 3 }}>
        By typing your name above, you are providing an electronic signature that is legally binding and has the same effect as a handwritten signature.
      </Alert>

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
          disabled={!agreed}
        >
          Next: Review Application
        </Button>
      </Box>
    </Box>
  );
};

export default Certification;

