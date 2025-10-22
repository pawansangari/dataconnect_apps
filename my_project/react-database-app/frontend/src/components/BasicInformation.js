import React from 'react';
import {
  Box,
  Typography,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  Button,
  Alert
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object({
  submission_reason: Yup.string().required('Submission reason is required'),
  entity_type: Yup.string().required('Entity type is required'),
  npi: Yup.string()
    .matches(/^\d{10}$/, 'NPI must be exactly 10 digits')
    .nullable()
});

const BasicInformation = ({ data, onUpdate, onNext }) => {
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
        Section 1: Basic Information
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Please select the reason for this submission and your entity type.
      </Alert>

      {/* Submission Reason */}
      <FormControl component="fieldset" sx={{ mb: 3 }} fullWidth>
        <FormLabel component="legend">
          Reason for Submission *
        </FormLabel>
        <RadioGroup
          name="submission_reason"
          value={formik.values.submission_reason}
          onChange={formik.handleChange}
        >
          <FormControlLabel 
            value="Initial Application" 
            control={<Radio />} 
            label="Initial Application (New NPI)" 
          />
          <FormControlLabel 
            value="Update Existing" 
            control={<Radio />} 
            label="Update Existing NPI Information" 
          />
          <FormControlLabel 
            value="Deactivate" 
            control={<Radio />} 
            label="Deactivate NPI" 
          />
          <FormControlLabel 
            value="Reactivate" 
            control={<Radio />} 
            label="Reactivate Deactivated NPI" 
          />
        </RadioGroup>
        {formik.touched.submission_reason && formik.errors.submission_reason && (
          <Typography color="error" variant="caption">
            {formik.errors.submission_reason}
          </Typography>
        )}
      </FormControl>

      {/* Entity Type */}
      <FormControl component="fieldset" sx={{ mb: 3 }} fullWidth>
        <FormLabel component="legend">
          Entity Type *
        </FormLabel>
        <RadioGroup
          name="entity_type"
          value={formik.values.entity_type}
          onChange={formik.handleChange}
        >
          <FormControlLabel 
            value="Individual" 
            control={<Radio />} 
            label="Individual (Physician, Dentist, etc.)" 
          />
          <FormControlLabel 
            value="Organization" 
            control={<Radio />} 
            label="Organization (Hospital, Clinic, Group Practice, etc.)" 
          />
        </RadioGroup>
        {formik.touched.entity_type && formik.errors.entity_type && (
          <Typography color="error" variant="caption">
            {formik.errors.entity_type}
          </Typography>
        )}
      </FormControl>

      {/* Existing NPI (conditional) */}
      {(formik.values.submission_reason === 'Update Existing' || 
        formik.values.submission_reason === 'Deactivate' ||
        formik.values.submission_reason === 'Reactivate') && (
        <TextField
          fullWidth
          label="Existing NPI"
          name="npi"
          value={formik.values.npi}
          onChange={formik.handleChange}
          error={formik.touched.npi && Boolean(formik.errors.npi)}
          helperText={formik.touched.npi && formik.errors.npi || "Enter your 10-digit NPI"}
          sx={{ mb: 3 }}
          inputProps={{ maxLength: 10 }}
        />
      )}

      {/* Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={!formik.isValid || !formik.values.submission_reason || !formik.values.entity_type}
        >
          Next: Identifying Information
        </Button>
      </Box>
    </Box>
  );
};

export default BasicInformation;

