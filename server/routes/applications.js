const express = require('express');
const { body, validationResult, query } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Application = require('../models/Application');
const Job = require('../models/Job');
const { authenticateToken, authorizeRole, authorizeApplicationOwner } = require('../middleware/auth');
const { 
  sendApplicationStatusUpdate, 
  sendShortlistedNotification, 
  sendRejectionNotification,
  sendInterviewNotification 
} = require('../utils/emailService');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/resumes';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.'), false);
    }
  }
});

// @route   POST /api/applications
// @desc    Apply for a job
// @access  Private (Applicants only)
router.post('/', [
  authenticateToken,
  authorizeRole('applicant'),
  body('jobId').notEmpty().withMessage('Job ID is required'),
  body('coverLetter').notEmpty().withMessage('Cover letter is required'),
  body('expectedSalary.amount').optional().isNumeric(),
  body('availability').optional().isIn(['immediate', '2-weeks', '1-month', '3-months', 'negotiable'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if user has a CV uploaded in their profile or is uploading one
    if (!req.user.profile?.resume) {
      return res.status(400).json({ message: 'Please upload your CV/Resume before applying for jobs' });
    }

    const { jobId, coverLetter, expectedSalary, availability, additionalNotes } = req.body;

    // Check if job exists and is active
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (!job.isActive) {
      return res.status(400).json({ message: 'This job is no longer accepting applications' });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      job: jobId,
      applicant: req.user._id
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    // Create application
    const application = new Application({
      job: jobId,
      applicant: req.user._id,
      employer: job.employer, // This should be the job's employer
      coverLetter,
      resume: req.user.profile.resume || '', // Use CV from user's profile
      expectedSalary: expectedSalary ? { amount: parseInt(expectedSalary), currency: 'USD', period: 'yearly' } : {},
      availability: availability || 'immediate',
      notes: additionalNotes ? { applicant: additionalNotes } : {}
    });

    console.log('Creating application with:', {
      jobId,
      applicant: req.user._id,
      employer: job.employer,
      jobEmployer: job.employer
    });

    await application.save();

    // Populate job details for response
    await application.populate('job', 'title company.name location');

    res.status(201).json({
      message: 'Application submitted successfully',
      application
    });
  } catch (error) {
    console.error('Submit application error:', error);
    res.status(500).json({ message: 'Server error during application submission' });
  }
});

// @route   GET /api/applications/my-applications
// @desc    Get applications by current applicant
// @access  Private (Applicants only)
router.get('/my-applications', [
  authenticateToken,
  authorizeRole('applicant'),
  query('status').optional().isIn(['applied', 'reviewing', 'shortlisted', 'interviewed', 'offered', 'rejected', 'withdrawn']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { applicant: req.user._id };
    if (req.query.status) {
      query.status = req.query.status;
    }

    const applications = await Application.find(query)
      .populate('job', 'title company.name location salary type experience')
      .populate('employer', 'firstName lastName company.name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Application.countDocuments(query);

    // Calculate stats
    const stats = await Application.aggregate([
      { $match: { applicant: req.user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statsObject = {
      total,
      applied: 0,
      reviewing: 0,
      shortlisted: 0,
      rejected: 0,
      interviewed: 0
    };

    stats.forEach(stat => {
      if (statsObject.hasOwnProperty(stat._id)) {
        statsObject[stat._id] = stat.count;
      }
    });

    res.json({
      applications,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      },
      stats: statsObject
    });
  } catch (error) {
    console.error('Get my applications error:', error);
    res.status(500).json({ message: 'Server error while fetching applications' });
  }
});

// @route   GET /api/applications/employer
// @desc    Get applications for employer's jobs
// @access  Private (Employers only)
router.get('/employer', [
  authenticateToken,
  authorizeRole('employer'),
  query('status').optional().isIn(['applied', 'reviewing', 'shortlisted', 'interviewed', 'offered', 'rejected', 'withdrawn']),
  query('jobId').optional().isMongoId(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // For employers, we need to find applications for jobs they posted
    // First, get all jobs posted by this employer
    const employerJobs = await Job.find({ employer: req.user._id }).select('_id');
    const jobIds = employerJobs.map(job => job._id);
    
    const query = { job: { $in: jobIds } };
    if (req.query.status) {
      query.status = req.query.status;
    }
    if (req.query.jobId) {
      query.job = req.query.jobId;
    }

    console.log('Employer applications query:', query);
    console.log('User ID:', req.user._id);
    console.log('Employer job IDs:', jobIds);

    const applications = await Application.find(query)
      .populate('job', 'title company.name location salary type experience')
      .populate('applicant', 'firstName lastName email profile.headline profile.avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Application.countDocuments(query);

    console.log('Found applications:', applications.length);
    console.log('Total applications:', total);

    // Calculate stats for applications to jobs posted by this employer
    const stats = await Application.aggregate([
      { $match: { job: { $in: jobIds } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statsObject = {
      total,
      applied: 0,
      reviewing: 0,
      shortlisted: 0,
      rejected: 0,
      interviewed: 0
    };

    stats.forEach(stat => {
      if (statsObject.hasOwnProperty(stat._id)) {
        statsObject[stat._id] = stat.count;
      }
    });

    res.json({
      applications,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      },
      stats: statsObject
    });
  } catch (error) {
    console.error('Get employer applications error:', error);
    res.status(500).json({ message: 'Server error while fetching applications' });
  }
});

// @route   PUT /api/applications/:id/status
// @desc    Update application status (employer only)
// @access  Private (Employers only)
router.put('/:id/status', [
  authenticateToken,
  authorizeRole('employer'),
  body('status').isIn(['applied', 'reviewing', 'shortlisted', 'interviewed', 'offered', 'rejected', 'withdrawn']),
  body('notes').optional().isString().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, notes } = req.body;
    const applicationId = req.params.id;

    const application = await Application.findById(applicationId)
      .populate('job', 'title company.name location salary')
      .populate('applicant', 'firstName lastName email')
      .populate('employer', 'firstName lastName company.name');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check if the current user is the employer for this application
    console.log('Authorization check:', {
      applicationEmployer: application.employer._id.toString(),
      currentUser: req.user._id.toString(),
      applicationId: applicationId,
      match: application.employer._id.toString() === req.user._id.toString()
    });
    
    if (application.employer._id.toString() !== req.user._id.toString()) {
      console.log('Authorization failed:', {
        applicationEmployer: application.employer._id.toString(),
        currentUser: req.user._id.toString(),
        applicationId: applicationId
      });
      return res.status(403).json({ 
        message: 'Not authorized to update this application. You can only update applications for jobs you posted.' 
      });
    }

    const oldStatus = application.status;
    application.status = status;
    if (notes) {
      // Update the employer notes field
      if (!application.notes) {
        application.notes = {};
      }
      application.notes.employer = notes;
    }
    application.updatedAt = new Date();

    await application.save();

    // Send email notification based on status change
    try {
      if (status === 'shortlisted') {
        await sendShortlistedNotification(application, notes);
      } else if (status === 'rejected') {
        await sendRejectionNotification(application, notes);
      } else if (status === 'interviewed') {
        // For interviewed status, you might want to send interview details
        // This would require additional interview scheduling functionality
        await sendApplicationStatusUpdate(application, status, notes);
      } else {
        await sendApplicationStatusUpdate(application, status, notes);
      }
    } catch (emailError) {
      console.error('Email notification failed:', emailError);
      // Don't fail the request if email fails
    }

    res.json({
      message: 'Application status updated successfully',
      application
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({ message: 'Server error while updating application status' });
  }
});

// @route   GET /api/applications/:id
// @desc    Get application details
// @access  Private (Application owner or employer)
router.get('/:id', [
  authenticateToken
], async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('job', 'title company.name location salary type experience description requirements')
      .populate('applicant', 'firstName lastName email profile')
      .populate('employer', 'firstName lastName company.name');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check if user is authorized to view this application
    const isOwner = application.applicant._id.toString() === req.user._id.toString();
    const isEmployer = application.employer._id.toString() === req.user._id.toString();

    if (!isOwner && !isEmployer) {
      return res.status(403).json({ message: 'Not authorized to view this application' });
    }

    res.json({ application });
  } catch (error) {
    console.error('Get application details error:', error);
    res.status(500).json({ message: 'Server error while fetching application details' });
  }
});

// @route   GET /api/applications/:id/resume
// @desc    Download resume file
// @access  Private (Application owner or employer)
router.get('/:id/resume', [
  authenticateToken
], async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('applicant', 'firstName lastName')
      .populate('employer', 'firstName lastName');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check if user is authorized to view this application
    const isOwner = application.applicant._id.toString() === req.user._id.toString();
    const isEmployer = application.employer._id.toString() === req.user._id.toString();

    if (!isOwner && !isEmployer) {
      return res.status(403).json({ message: 'Not authorized to view this resume' });
    }

    if (!application.resume || !fs.existsSync(application.resume)) {
      return res.status(404).json({ message: 'Resume file not found' });
    }

    // Send file
    res.download(application.resume);
  } catch (error) {
    console.error('Download resume error:', error);
    res.status(500).json({ message: 'Server error while downloading resume' });
  }
});

// @route   DELETE /api/applications/:id
// @desc    Withdraw application (applicant only)
// @access  Private (Application owner only)
router.delete('/:id', [
  authenticateToken,
  authorizeRole('applicant')
], async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.applicant.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to withdraw this application' });
    }

    if (application.status !== 'applied' && application.status !== 'reviewing') {
      return res.status(400).json({ message: 'Cannot withdraw application in current status' });
    }

    application.status = 'withdrawn';
    application.updatedAt = new Date();
    await application.save();

    res.json({ message: 'Application withdrawn successfully' });
  } catch (error) {
    console.error('Withdraw application error:', error);
    res.status(500).json({ message: 'Server error while withdrawing application' });
  }
});

// @route   POST /api/applications/:id/interview
// @desc    Schedule interview (employer only)
// @access  Private (Employers only)
router.post('/:id/interview', [
  authenticateToken,
  authorizeRole('employer'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('time').notEmpty().withMessage('Time is required'),
  body('type').isIn(['phone', 'video', 'in-person']).withMessage('Valid interview type is required'),
  body('location').optional().isString(),
  body('link').optional().isURL().withMessage('Valid URL is required for video interviews'),
  body('notes').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { date, time, type, location, link, notes } = req.body;
    const applicationId = req.params.id;

    const application = await Application.findById(applicationId)
      .populate('job', 'title company.name location')
      .populate('applicant', 'firstName lastName email')
      .populate('employer', 'firstName lastName company.name');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to schedule interview for this application' });
    }

    // Update application status to interviewed
    application.status = 'interviewed';
    application.interview = {
      date: new Date(date),
      time,
      type,
      location: location || '',
      link: link || '',
      notes: notes || '',
      scheduledBy: req.user._id,
      scheduledAt: new Date()
    };
    application.updatedAt = new Date();

    await application.save();

    // Send interview notification email
    try {
      const interviewDetails = {
        date: new Date(date).toLocaleDateString(),
        time,
        type: type.charAt(0).toUpperCase() + type.slice(1),
        location: location || 'TBD',
        link: link || ''
      };
      await sendInterviewNotification(application, interviewDetails);
    } catch (emailError) {
      console.error('Interview notification email failed:', emailError);
    }

    res.json({
      message: 'Interview scheduled successfully',
      application
    });
  } catch (error) {
    console.error('Schedule interview error:', error);
    res.status(500).json({ message: 'Server error while scheduling interview' });
  }
});

// @route   GET /api/applications/check/:jobId
// @desc    Check if user has applied for a specific job
// @access  Private (Applicants only)
router.get('/check/:jobId', [
  authenticateToken,
  authorizeRole('applicant')
], async (req, res) => {
  try {
    const { jobId } = req.params;

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if user has already applied
    const existingApplication = await Application.findOne({
      job: jobId,
      applicant: req.user._id
    });

    if (existingApplication) {
      return res.json({ 
        hasApplied: true, 
        application: {
          id: existingApplication._id,
          status: existingApplication.status,
          appliedAt: existingApplication.createdAt
        }
      });
    }

    res.json({ hasApplied: false });
  } catch (error) {
    console.error('Check application error:', error);
    res.status(500).json({ message: 'Server error while checking application status' });
  }
});

module.exports = router;
