import React, { useState } from 'react';
import {
  Container,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  Box,
  Typography,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Alert
} from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import BasicInformation from './components/BasicInformation';
import IdentifyingInformation from './components/IdentifyingInformation';
import BusinessAddress from './components/BusinessAddress';
import ContactPerson from './components/ContactPerson';
import Certification from './components/Certification';
import ApplicationSummary from './components/ApplicationSummary';
import { submitApplication } from './services/api';

// Create custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1e3a8a', // CMS blue
      light: '#3b82f6',
      dark: '#1e40af',
    },
    secondary: {
      main: '#059669', // Green for success
    },
    background: {
      default: '#f3f4f6',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

const steps = [
  'Basic Information',
  'Identifying Information',
  'Business Address',
  'Contact Person',
  'Certification',
  'Review & Submit'
];

function App() {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    basicInformation: {
      submission_reason: '',
      entity_type: '',
      npi: ''
    },
    identifyingInformation: {
      name_prefix: '',
      first_name: '',
      middle_name: '',
      last_name: '',
      name_suffix: '',
      credential: '',
      organization_name: '',
      organization_type: '',
      ssn: '',
      ein: '',
      date_of_birth: null,
      gender: '',
      state_license_number: '',
      issuing_state: ''
    },
    businessAddress: {
      mailing_address_line1: '',
      mailing_address_line2: '',
      mailing_city: '',
      mailing_state: '',
      mailing_zip: '',
      mailing_country: 'USA',
      mailing_phone: '',
      mailing_fax: '',
      practice_address_line1: '',
      practice_address_line2: '',
      practice_city: '',
      practice_state: '',
      practice_zip: '',
      practice_country: 'USA',
      practice_phone: '',
      practice_fax: '',
      enumeration_date: null
    },
    contactPerson: {
      contact_first_name: '',
      contact_middle_name: '',
      contact_last_name: '',
      contact_phone: '',
      contact_phone_ext: '',
      contact_email: ''
    },
    certification: {
      authorized_official_first_name: '',
      authorized_official_middle_name: '',
      authorized_official_last_name: '',
      authorized_official_title: '',
      authorized_official_phone: '',
      authorized_official_email: '',
      signature: '',
      certification_date: new Date().toISOString().split('T')[0]
    }
  });

  const [submitting, setSubmitting] = useState(false);
  const [applicationId, setApplicationId] = useState(null);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateFormData = (section, data) => {
    setFormData(prev => ({
      ...prev,
      [section]: data
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const response = await submitApplication(formData);
      setApplicationId(response.application_id);
      toast.success(`Application submitted successfully! Reference ID: ${response.application_id}`);
      handleNext();
    } catch (error) {
      toast.error(`Submission failed: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <BasicInformation
            data={formData.basicInformation}
            onUpdate={(data) => handleUpdateFormData('basicInformation', data)}
            onNext={handleNext}
          />
        );
      case 1:
        return (
          <IdentifyingInformation
            data={formData.identifyingInformation}
            entityType={formData.basicInformation.entity_type}
            onUpdate={(data) => handleUpdateFormData('identifyingInformation', data)}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 2:
        return (
          <BusinessAddress
            data={formData.businessAddress}
            onUpdate={(data) => handleUpdateFormData('businessAddress', data)}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <ContactPerson
            data={formData.contactPerson}
            onUpdate={(data) => handleUpdateFormData('contactPerson', data)}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 4:
        return (
          <Certification
            data={formData.certification}
            onUpdate={(data) => handleUpdateFormData('certification', data)}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 5:
        return (
          <ApplicationSummary
            formData={formData}
            onSubmit={handleSubmit}
            onBack={handleBack}
            submitting={submitting}
          />
        );
      case 6:
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Alert severity="success" sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Application Submitted Successfully!
              </Typography>
              <Typography variant="body1">
                Reference ID: <strong>{applicationId}</strong>
              </Typography>
            </Alert>
            <Typography variant="body1" paragraph>
              Your NPI application has been submitted for processing.
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              You will receive a confirmation email with further instructions.
              Please retain your reference ID for tracking purposes.
            </Typography>
            <Button
              variant="contained"
              onClick={() => {
                setActiveStep(0);
                setApplicationId(null);
                // Reset form if needed
              }}
            >
              Submit Another Application
            </Button>
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="lg">
          {/* Header */}
          <Paper
            elevation={0}
            sx={{
              background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
              color: 'white',
              p: 4,
              mb: 4,
              borderRadius: 3
            }}
          >
            <Typography variant="h4" gutterBottom>
              CMS-10114: NPI Application/Update Form
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              National Provider Identifier (NPI) Application for Healthcare Providers
            </Typography>
          </Paper>

          {/* Stepper */}
          <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Paper>

          {/* Form Content */}
          <Paper elevation={2} sx={{ p: 4 }}>
            {getStepContent(activeStep)}
          </Paper>

          {/* Footer */}
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              CMS Form 10114 | National Provider Identifier Application
            </Typography>
            <Typography variant="caption" color="text.secondary">
              For technical assistance, please contact your system administrator
            </Typography>
          </Box>
        </Container>
      </Box>
      <ToastContainer position="top-right" autoClose={5000} />
    </ThemeProvider>
  );
}

export default App;

