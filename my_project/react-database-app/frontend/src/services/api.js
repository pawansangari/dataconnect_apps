import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error
      console.error('API Error:', error.response.status, error.response.data);
      throw new Error(error.response.data.detail || 'An error occurred');
    } else if (error.request) {
      // Request made but no response
      console.error('Network Error:', error.request);
      throw new Error('Network error. Please check your connection.');
    } else {
      // Something else happened
      console.error('Error:', error.message);
      throw new Error(error.message);
    }
  }
);

// API functions
export const submitApplication = async (applicationData) => {
  try {
    // Transform date fields to proper format
    const transformedData = {
      basic_information: {
        ...applicationData.basicInformation,
        npi: applicationData.basicInformation.npi || null
      },
      identifying_information: {
        ...applicationData.identifyingInformation,
        date_of_birth: applicationData.identifyingInformation.date_of_birth || null,
        ssn: applicationData.identifyingInformation.ssn || null,
        ein: applicationData.identifyingInformation.ein || null
      },
      business_address: {
        ...applicationData.businessAddress,
        enumeration_date: applicationData.businessAddress.enumeration_date || null
      },
      contact_person: applicationData.contactPerson,
      certification: applicationData.certification
    };

    const response = await api.post('/applications', transformedData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getApplications = async (limit = 50, offset = 0) => {
  try {
    const response = await api.get('/applications', {
      params: { limit, offset }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getApplication = async (applicationId) => {
  try {
    const response = await api.get(`/applications/${applicationId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const checkHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default api;

