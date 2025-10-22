import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Grid,
  Button,
  Alert
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object({
  contact_first_name: Yup.string().required('First name is required'),
  contact_last_name: Yup.string().required('Last name is required'),
  contact_phone: Yup.string().required('Phone number is required'),
  contact_email: Yup.string().email('Invalid email address').required('Email is required'),
});

const ContactPerson = ({ data, onUpdate, onNext, onBack }) => {
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
        Section 4: Contact Person
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Provide the name and contact information of the person who can answer questions about this application.
        This person may be contacted regarding the status of the application.
      </Alert>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            required
            label="First Name"
            name="contact_first_name"
            value={formik.values.contact_first_name}
            onChange={formik.handleChange}
            error={formik.touched.contact_first_name && Boolean(formik.errors.contact_first_name)}
            helperText={formik.touched.contact_first_name && formik.errors.contact_first_name}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Middle Name"
            name="contact_middle_name"
            value={formik.values.contact_middle_name}
            onChange={formik.handleChange}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            required
            label="Last Name"
            name="contact_last_name"
            value={formik.values.contact_last_name}
            onChange={formik.handleChange}
            error={formik.touched.contact_last_name && Boolean(formik.errors.contact_last_name)}
            helperText={formik.touched.contact_last_name && formik.errors.contact_last_name}
          />
        </Grid>
        <Grid item xs={12} sm={5}>
          <TextField
            fullWidth
            required
            label="Phone Number"
            name="contact_phone"
            value={formik.values.contact_phone}
            onChange={formik.handleChange}
            placeholder="(XXX) XXX-XXXX"
            error={formik.touched.contact_phone && Boolean(formik.errors.contact_phone)}
            helperText={formik.touched.contact_phone && formik.errors.contact_phone}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <TextField
            fullWidth
            label="Extension"
            name="contact_phone_ext"
            value={formik.values.contact_phone_ext}
            onChange={formik.handleChange}
            placeholder="Ext."
          />
        </Grid>
        <Grid item xs={12} sm={5}>
          <TextField
            fullWidth
            required
            label="Email Address"
            name="contact_email"
            type="email"
            value={formik.values.contact_email}
            onChange={formik.handleChange}
            error={formik.touched.contact_email && Boolean(formik.errors.contact_email)}
            helperText={formik.touched.contact_email && formik.errors.contact_email}
          />
        </Grid>
      </Grid>

      <Alert severity="warning" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>Important:</strong> This contact person must be available to receive correspondence 
          regarding this NPI application and should have knowledge of the information provided in this form.
        </Typography>
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
        >
          Next: Certification
        </Button>
      </Box>
    </Box>
  );
};

export default ContactPerson;

