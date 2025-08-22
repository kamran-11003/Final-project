import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  changePassword: (currentPassword, newPassword) => 
    api.post('/auth/change-password', { currentPassword, newPassword }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  verifyEmail: () => api.post('/auth/verify-email'),
  confirmEmail: (token) => api.post('/auth/confirm-email', { token }),
  logout: () => api.post('/auth/logout'),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (profileData) => api.put('/users/profile', profileData),
  updateResume: (resume) => api.put('/users/profile/resume', { resume }),
  uploadCV: async (cvFile) => {
    const formData = new FormData();
    formData.append('cv', cvFile);
    
    return await api.post('/users/profile/cv-upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  updateAvatar: (avatar) => api.put('/users/profile/avatar', { avatar }),
  updateExperience: (experience) => api.put('/users/profile/experience', { experience }),
  updateEducation: (education) => api.put('/users/profile/education', { education }),
  updateSkills: (skills) => api.put('/users/profile/skills', { skills }),
  deleteAccount: (password) => api.delete('/users/account', { data: { password } }),
  getStats: () => api.get('/users/stats'),
  getPublicProfile: (userId) => api.get(`/users/${userId}`),
};

// Jobs API
export const jobsAPI = {
  getJobs: (params = {}) => api.get('/jobs', { params }),
  getJob: (id) => api.get(`/jobs/${id}`),
  createJob: (jobData) => api.post('/jobs', jobData),
  updateJob: (id, jobData) => api.put(`/jobs/${id}`, jobData),
  deleteJob: (id) => api.delete(`/jobs/${id}`),
  getMyJobs: (params = {}) => api.get('/jobs/employer/my-jobs', { params }),
  getSearchSuggestions: (query) => api.get('/jobs/search/suggestions', { params: { q: query } }),
};

// Applications API
export const applicationsAPI = {
  // Apply for a job
  applyForJob: async (applicationData) => {
    return await api.post('/applications', applicationData);
  },

  // Get applications for current user (applicant)
  getMyApplications: async (params = {}) => {
    return await api.get('/applications/my-applications', { params });
  },

  // Get applications for employer's jobs
  getEmployerApplications: async (params = {}) => {
    return await api.get('/applications/employer', { params });
  },

  // Get application by ID
  getApplication: async (id) => {
    return await api.get(`/applications/${id}`);
  },

  // Update application status (employer only)
  updateApplicationStatus: async (id, status, notes = '') => {
    return await api.put(`/applications/${id}/status`, { status, notes });
  },

  // Schedule interview (employer only)
  scheduleInterview: async (id, interviewData) => {
    return await api.post(`/applications/${id}/interview`, interviewData);
  },

  // Withdraw application (applicant only)
  withdrawApplication: async (id) => {
    return await api.delete(`/applications/${id}`);
  },

  // Check if user has applied for a specific job
  checkApplication: async (jobId) => {
    return await api.get(`/applications/check/${jobId}`);
  }
};

// File Upload API
export const uploadAPI = {
  uploadResume: (file) => {
    const formData = new FormData();
    formData.append('resume', file);
    return api.post('/upload/resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  uploadCoverLetter: (file) => {
    const formData = new FormData();
    formData.append('coverLetter', file);
    return api.post('/upload/cover-letter', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.post('/upload/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  uploadDocument: (file) => {
    const formData = new FormData();
    formData.append('document', file);
    return api.post('/upload/document', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  downloadFile: (filename) => api.get(`/upload/${filename}`),
  deleteFile: (filename) => api.delete(`/upload/${filename}`)
};

// Health check API
export const healthAPI = {
  checkHealth: () => api.get('/health'),
};

export default api;
