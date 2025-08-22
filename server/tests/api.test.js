const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const app = require('../app'); // Updated to use app.js

// Import models
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');

// Test data
const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123',
  role: 'applicant',
  phone: '1234567890'
};

const testEmployer = {
  name: 'Test Employer',
  email: 'employer@example.com',
  password: 'password123',
  role: 'employer',
  phone: '1234567890'
};

const testJob = {
  title: 'Software Engineer',
  description: 'We are looking for a talented software engineer...',
  requirements: 'Bachelor\'s degree in Computer Science...',
  responsibilities: 'Develop and maintain web applications...',
  location: 'New York, NY',
  type: 'full-time',
  experience: 'mid',
  salary: {
    min: 80000,
    max: 120000,
    currency: 'USD'
  },
  skills: ['JavaScript', 'React', 'Node.js'],
  benefits: 'Health insurance, 401k, flexible hours'
};

let authToken;
let employerToken;
let testJobId;
let testApplicationId;

describe('Job Portal API Tests', () => {
  
  describe('Authentication APIs', () => {
    
    test('POST /api/auth/register - Should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toHaveProperty('_id');
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.user.role).toBe(testUser.role);
      expect(response.body.data).toHaveProperty('token');
    });

    test('POST /api/auth/register - Should not register user with existing email', async () => {
      // First registration
      await request(app)
        .post('/api/auth/register')
        .send(testUser);

      // Second registration with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });

    test('POST /api/auth/login - Should login user with valid credentials', async () => {
      // Register user first
      await request(app)
        .post('/api/auth/register')
        .send(testUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.email).toBe(testUser.email);
      
      authToken = response.body.data.token;
    });

    test('POST /api/auth/login - Should not login with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid credentials');
    });

    test('GET /api/auth/me - Should get current user profile', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(testUser.email);
      expect(response.body.data.name).toBe(testUser.name);
    });

    test('GET /api/auth/me - Should fail without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('No token');
    });

    test('PUT /api/auth/profile - Should update user profile', async () => {
      const updateData = {
        name: 'Updated Name',
        phone: '9876543210'
      };

      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.phone).toBe(updateData.phone);
    });

    test('POST /api/auth/forgot-password - Should send password reset email', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: testUser.email })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Password reset email sent');
    });

    test('POST /api/auth/reset-password - Should reset password with valid token', async () => {
      // First request forgot password to get token
      await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: testUser.email });

      // Get user to check if reset token was set
      const user = await User.findOne({ email: testUser.email });
      const resetToken = user.resetPasswordToken;

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          password: 'newpassword123'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Password reset successful');
    });
  });

  describe('Jobs APIs', () => {
    
    beforeEach(async () => {
      // Register employer and get token
      await request(app)
        .post('/api/auth/register')
        .send(testEmployer);

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmployer.email,
          password: testEmployer.password
        });

      employerToken = loginResponse.body.data.token;
    });

    test('POST /api/jobs - Should create a new job (employer only)', async () => {
      const response = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${employerToken}`)
        .send(testJob)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(testJob.title);
      expect(response.body.data.location).toBe(testJob.location);
      expect(response.body.data.employer).toBeDefined();
      
      testJobId = response.body.data._id;
    });

    test('POST /api/jobs - Should not create job without authentication', async () => {
      const response = await request(app)
        .post('/api/jobs')
        .send(testJob)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('POST /api/jobs - Should not create job with applicant role', async () => {
      const response = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testJob)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    test('GET /api/jobs - Should get all jobs with pagination', async () => {
      // Create a job first
      await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${employerToken}`)
        .send(testJob);

      const response = await request(app)
        .get('/api/jobs?page=1&limit=10')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.jobs).toBeInstanceOf(Array);
      expect(response.body.data.total).toBeGreaterThan(0);
      expect(response.body.data.page).toBe(1);
    });

    test('GET /api/jobs - Should filter jobs by search term', async () => {
      // Create a job first
      await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${employerToken}`)
        .send(testJob);

      const response = await request(app)
        .get('/api/jobs?search=Software')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.jobs.length).toBeGreaterThan(0);
      expect(response.body.data.jobs[0].title).toContain('Software');
    });

    test('GET /api/jobs/:id - Should get job by ID', async () => {
      // Create a job first
      const createResponse = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${employerToken}`)
        .send(testJob);

      const jobId = createResponse.body.data._id;

      const response = await request(app)
        .get(`/api/jobs/${jobId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(testJob.title);
      expect(response.body.data._id).toBe(jobId);
    });

    test('GET /api/jobs/:id - Should return 404 for non-existent job', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .get(`/api/jobs/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    test('PUT /api/jobs/:id - Should update job (employer only)', async () => {
      // Create a job first
      const createResponse = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${employerToken}`)
        .send(testJob);

      const jobId = createResponse.body.data._id;
      const updateData = {
        title: 'Updated Software Engineer',
        salary: { min: 90000, max: 130000, currency: 'USD' }
      };

      const response = await request(app)
        .put(`/api/jobs/${jobId}`)
        .set('Authorization', `Bearer ${employerToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(updateData.title);
      expect(response.body.data.salary.min).toBe(updateData.salary.min);
    });

    test('DELETE /api/jobs/:id - Should delete job (employer only)', async () => {
      // Create a job first
      const createResponse = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${employerToken}`)
        .send(testJob);

      const jobId = createResponse.body.data._id;

      const response = await request(app)
        .delete(`/api/jobs/${jobId}`)
        .set('Authorization', `Bearer ${employerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Job deleted successfully');
    });

    test('GET /api/jobs/employer/my-jobs - Should get employer\'s jobs', async () => {
      // Create a job first
      await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${employerToken}`)
        .send(testJob);

      const response = await request(app)
        .get('/api/jobs/employer/my-jobs')
        .set('Authorization', `Bearer ${employerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('Applications APIs', () => {
    
    beforeEach(async () => {
      // Create a job first
      const createResponse = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${employerToken}`)
        .send(testJob);

      testJobId = createResponse.body.data._id;
    });

    test('POST /api/applications - Should apply for a job', async () => {
      const applicationData = {
        jobId: testJobId,
        coverLetter: 'I am very interested in this position...',
        expectedSalary: 100000,
        availability: 'immediate'
      };

      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${authToken}`)
        .send(applicationData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.jobId).toBe(testJobId);
      expect(response.body.data.coverLetter).toBe(applicationData.coverLetter);
      expect(response.body.data.status).toBe('applied');
      
      testApplicationId = response.body.data._id;
    });

    test('POST /api/applications - Should not apply without authentication', async () => {
      const applicationData = {
        jobId: testJobId,
        coverLetter: 'I am very interested in this position...'
      };

      const response = await request(app)
        .post('/api/applications')
        .send(applicationData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('POST /api/applications - Should not apply for non-existent job', async () => {
      const fakeJobId = new mongoose.Types.ObjectId();
      const applicationData = {
        jobId: fakeJobId,
        coverLetter: 'I am very interested in this position...'
      };

      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${authToken}`)
        .send(applicationData)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    test('GET /api/applications/my-applications - Should get user\'s applications', async () => {
      // Apply for a job first
      await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          jobId: testJobId,
          coverLetter: 'I am very interested in this position...'
        });

      const response = await request(app)
        .get('/api/applications/my-applications')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    test('GET /api/applications/job/:jobId - Should get applications for a job (employer only)', async () => {
      // Apply for a job first
      await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          jobId: testJobId,
          coverLetter: 'I am very interested in this position...'
        });

      const response = await request(app)
        .get(`/api/applications/job/${testJobId}`)
        .set('Authorization', `Bearer ${employerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    test('PUT /api/applications/:id/status - Should update application status (employer only)', async () => {
      // Apply for a job first
      const applyResponse = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          jobId: testJobId,
          coverLetter: 'I am very interested in this position...'
        });

      const applicationId = applyResponse.body.data._id;

      const response = await request(app)
        .put(`/api/applications/${applicationId}/status`)
        .set('Authorization', `Bearer ${employerToken}`)
        .send({ status: 'shortlisted' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('shortlisted');
    });

    test('GET /api/applications/:id - Should get application by ID', async () => {
      // Apply for a job first
      const applyResponse = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          jobId: testJobId,
          coverLetter: 'I am very interested in this position...'
        });

      const applicationId = applyResponse.body.data._id;

      const response = await request(app)
        .get(`/api/applications/${applicationId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(applicationId);
      expect(response.body.data.jobId).toBe(testJobId);
    });
  });

  describe('Users APIs', () => {
    
    test('GET /api/users/profile/:id - Should get user profile by ID', async () => {
      const response = await request(app)
        .get(`/api/users/profile/${authToken ? 'user-id' : 'test-id'}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('PUT /api/users/profile/resume - Should update user resume', async () => {
      const response = await request(app)
        .put('/api/users/profile/resume')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('resume', Buffer.from('test resume'), 'resume.pdf')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('resume');
    });

    test('GET /api/users/search - Should search users', async () => {
      const response = await request(app)
        .get('/api/users/search?q=test')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });
  });

  describe('Upload APIs', () => {
    
    test('POST /api/upload/profile-picture - Should upload profile picture', async () => {
      const response = await request(app)
        .post('/api/upload/profile-picture')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('image', Buffer.from('test image'), 'profile.jpg')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('url');
    });

    test('POST /api/upload/resume - Should upload resume', async () => {
      const response = await request(app)
        .post('/api/upload/resume')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('resume', Buffer.from('test resume'), 'resume.pdf')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('url');
    });

    test('POST /api/upload/company-logo - Should upload company logo', async () => {
      const response = await request(app)
        .post('/api/upload/company-logo')
        .set('Authorization', `Bearer ${employerToken}`)
        .attach('logo', Buffer.from('test logo'), 'logo.png')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('url');
    });

    test('DELETE /api/upload/:publicId - Should delete uploaded file', async () => {
      // First upload a file
      const uploadResponse = await request(app)
        .post('/api/upload/profile-picture')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('image', Buffer.from('test image'), 'profile.jpg');

      const publicId = uploadResponse.body.data.publicId;

      const response = await request(app)
        .delete(`/api/upload/${publicId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('File deleted successfully');
    });
  });

  describe('Google Auth APIs', () => {
    
    test('GET /api/auth/google - Should redirect to Google OAuth', async () => {
      const response = await request(app)
        .get('/api/auth/google')
        .expect(302); // Redirect status

      expect(response.headers.location).toContain('accounts.google.com');
    });

    test('GET /api/auth/google/callback - Should handle Google OAuth callback', async () => {
      // This test would require mocking the Google OAuth flow
      // For now, we'll just test that the endpoint exists
      const response = await request(app)
        .get('/api/auth/google/callback?code=test-code')
        .expect(302); // Usually redirects after OAuth

      // The actual response depends on the OAuth flow implementation
    });
  });

  describe('Error Handling', () => {
    
    test('Should handle 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/non-existent-route')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Route not found');
    });

    test('Should handle validation errors', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test',
          email: 'invalid-email',
          password: '123' // Too short
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    test('Should handle server errors gracefully', async () => {
      // This would require mocking a database error
      // For now, we'll test that the error middleware is in place
      const response = await request(app)
        .get('/api/jobs')
        .expect(200); // Should not crash

      expect(response.body).toBeDefined();
    });
  });

  describe('Rate Limiting', () => {
    
    test('Should limit repeated requests', async () => {
      // Make multiple requests quickly
      const promises = Array(10).fill().map(() => 
        request(app)
          .post('/api/auth/login')
          .send({
            email: 'test@example.com',
            password: 'wrongpassword'
          })
      );

      const responses = await Promise.all(promises);
      
      // Some requests should be rate limited
      const rateLimited = responses.some(res => res.status === 429);
      expect(rateLimited).toBe(true);
    });
  });
});
