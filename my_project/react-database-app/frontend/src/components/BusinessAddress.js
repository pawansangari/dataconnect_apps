import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Grid,
  Button,
  Alert,
  Divider,
  FormControlLabel,
  Checkbox,
  MenuItem
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

const validationSchema = Yup.object({
  mailing_address_line1: Yup.string().required('Mailing address is required'),
  mailing_city: Yup.string().required('City is required'),
  mailing_state: Yup.string().required('State is required'),
  mailing_zip: Yup.string().required('ZIP code is required').matches(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),
  mailing_phone: Yup.string().required('Phone number is required'),
  practice_address_line1: Yup.string().required('Practice address is required'),
  practice_city: Yup.string().required('City is required'),
  practice_state: Yup.string().required('State is required'),
  practice_zip: Yup.string().required('ZIP code is required').matches(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),
  practice_phone: Yup.string().required('Phone number is required'),
});

const BusinessAddress = ({ data, onUpdate, onNext, onBack }) => {
  const [sameAsMailing, setSameAsMailing] = React.useState(false);

  const formik = useFormik({
    initialValues: data,
    validationSchema,
    onSubmit: (values) => {
      onUpdate(values);
      onNext();
    },
  });

  const copyMailingToPractice = () => {
    setSameAsMailing(true);
    formik.setFieldValue('practice_address_line1', formik.values.mailing_address_line1);
    formik.setFieldValue('practice_address_line2', formik.values.mailing_address_line2);
    formik.setFieldValue('practice_city', formik.values.mailing_city);
    formik.setFieldValue('practice_state', formik.values.mailing_state);
    formik.setFieldValue('practice_zip', formik.values.mailing_zip);
    formik.setFieldValue('practice_country', formik.values.mailing_country);
    formik.setFieldValue('practice_phone', formik.values.mailing_phone);
    formik.setFieldValue('practice_fax', formik.values.mailing_fax);
  };

  return (
    <Box component="form" onSubmit={formik.handleSubmit}>
      <Typography variant="h5" gutterBottom color="primary" sx={{ mb: 3 }}>
        Section 3: Business Address and Other Information
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Provide your mailing address and practice location address. These must be physical addresses, not P.O. Boxes (unless in rural areas).
      </Alert>

      {/* Mailing Address */}
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        Mailing Address
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            required
            label="Address Line 1"
            name="mailing_address_line1"
            value={formik.values.mailing_address_line1}
            onChange={formik.handleChange}
            error={formik.touched.mailing_address_line1 && Boolean(formik.errors.mailing_address_line1)}
            helperText={formik.touched.mailing_address_line1 && formik.errors.mailing_address_line1}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Address Line 2"
            name="mailing_address_line2"
            value={formik.values.mailing_address_line2}
            onChange={formik.handleChange}
            placeholder="Suite, Unit, Building, Floor, etc."
          />
        </Grid>
        <Grid item xs={12} sm={5}>
          <TextField
            fullWidth
            required
            label="City"
            name="mailing_city"
            value={formik.values.mailing_city}
            onChange={formik.handleChange}
            error={formik.touched.mailing_city && Boolean(formik.errors.mailing_city)}
            helperText={formik.touched.mailing_city && formik.errors.mailing_city}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            required
            select
            label="State"
            name="mailing_state"
            value={formik.values.mailing_state}
            onChange={formik.handleChange}
            error={formik.touched.mailing_state && Boolean(formik.errors.mailing_state)}
            helperText={formik.touched.mailing_state && formik.errors.mailing_state}
          >
            <MenuItem value="">Select</MenuItem>
            {states.map(state => (
              <MenuItem key={state} value={state}>{state}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            required
            label="ZIP Code"
            name="mailing_zip"
            value={formik.values.mailing_zip}
            onChange={formik.handleChange}
            placeholder="XXXXX or XXXXX-XXXX"
            error={formik.touched.mailing_zip && Boolean(formik.errors.mailing_zip)}
            helperText={formik.touched.mailing_zip && formik.errors.mailing_zip}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Country"
            name="mailing_country"
            value={formik.values.mailing_country}
            onChange={formik.handleChange}
            disabled
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            required
            label="Phone Number"
            name="mailing_phone"
            value={formik.values.mailing_phone}
            onChange={formik.handleChange}
            placeholder="(XXX) XXX-XXXX"
            error={formik.touched.mailing_phone && Boolean(formik.errors.mailing_phone)}
            helperText={formik.touched.mailing_phone && formik.errors.mailing_phone}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Fax Number"
            name="mailing_fax"
            value={formik.values.mailing_fax}
            onChange={formik.handleChange}
            placeholder="(XXX) XXX-XXXX"
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      {/* Practice Location */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Practice Location Address
        </Typography>
        <FormControlLabel
          control={
            <Checkbox
              checked={sameAsMailing}
              onChange={(e) => {
                if (e.target.checked) {
                  copyMailingToPractice();
                } else {
                  setSameAsMailing(false);
                }
              }}
            />
          }
          label="Same as mailing address"
        />
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            required
            label="Address Line 1"
            name="practice_address_line1"
            value={formik.values.practice_address_line1}
            onChange={formik.handleChange}
            error={formik.touched.practice_address_line1 && Boolean(formik.errors.practice_address_line1)}
            helperText={formik.touched.practice_address_line1 && formik.errors.practice_address_line1}
            disabled={sameAsMailing}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Address Line 2"
            name="practice_address_line2"
            value={formik.values.practice_address_line2}
            onChange={formik.handleChange}
            placeholder="Suite, Unit, Building, Floor, etc."
            disabled={sameAsMailing}
          />
        </Grid>
        <Grid item xs={12} sm={5}>
          <TextField
            fullWidth
            required
            label="City"
            name="practice_city"
            value={formik.values.practice_city}
            onChange={formik.handleChange}
            error={formik.touched.practice_city && Boolean(formik.errors.practice_city)}
            helperText={formik.touched.practice_city && formik.errors.practice_city}
            disabled={sameAsMailing}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            required
            select
            label="State"
            name="practice_state"
            value={formik.values.practice_state}
            onChange={formik.handleChange}
            error={formik.touched.practice_state && Boolean(formik.errors.practice_state)}
            helperText={formik.touched.practice_state && formik.errors.practice_state}
            disabled={sameAsMailing}
          >
            <MenuItem value="">Select</MenuItem>
            {states.map(state => (
              <MenuItem key={state} value={state}>{state}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            required
            label="ZIP Code"
            name="practice_zip"
            value={formik.values.practice_zip}
            onChange={formik.handleChange}
            placeholder="XXXXX or XXXXX-XXXX"
            error={formik.touched.practice_zip && Boolean(formik.errors.practice_zip)}
            helperText={formik.touched.practice_zip && formik.errors.practice_zip}
            disabled={sameAsMailing}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Country"
            name="practice_country"
            value={formik.values.practice_country}
            onChange={formik.handleChange}
            disabled
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            required
            label="Phone Number"
            name="practice_phone"
            value={formik.values.practice_phone}
            onChange={formik.handleChange}
            placeholder="(XXX) XXX-XXXX"
            error={formik.touched.practice_phone && Boolean(formik.errors.practice_phone)}
            helperText={formik.touched.practice_phone && formik.errors.practice_phone}
            disabled={sameAsMailing}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Fax Number"
            name="practice_fax"
            value={formik.values.practice_fax}
            onChange={formik.handleChange}
            placeholder="(XXX) XXX-XXXX"
            disabled={sameAsMailing}
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      {/* Additional Information */}
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        Additional Information
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Enumeration Date"
            name="enumeration_date"
            type="date"
            value={formik.values.enumeration_date || ''}
            onChange={formik.handleChange}
            InputLabelProps={{ shrink: true }}
            helperText="If applicable, the date you began practicing"
          />
        </Grid>
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
          Next: Contact Person
        </Button>
      </Box>
    </Box>
  );
};

export default BusinessAddress;

