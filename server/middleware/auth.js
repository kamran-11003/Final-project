const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    res.status(500).json({ message: 'Authentication error' });
  }
};

// Check if user has specific role
const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Access denied. Insufficient permissions.' 
      });
    }

    next();
  };
};

// Check if user is employer of the job
const authorizeJobOwner = async (req, res, next) => {
  try {
    const Job = require('../models/Job');
    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: 'Access denied. You can only manage your own job postings.' 
      });
    }

    req.job = job;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Authorization error' });
  }
};

// Check if user is application owner
const authorizeApplicationOwner = async (req, res, next) => {
  try {
    const Application = require('../models/Application');
    const application = await Application.findById(req.params.applicationId);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const isApplicant = application.applicant.toString() === req.user._id.toString();
    const isEmployer = application.employer.toString() === req.user._id.toString();

    if (!isApplicant && !isEmployer) {
      return res.status(403).json({ 
        message: 'Access denied. You can only view your own applications.' 
      });
    }

    req.application = application;
    req.isEmployer = isEmployer;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Authorization error' });
  }
};

// Optional authentication (for public routes that can show different content for logged users)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

module.exports = {
  authenticateToken,
  authorizeRole,
  authorizeJobOwner,
  authorizeApplicationOwner,
  optionalAuth
};
