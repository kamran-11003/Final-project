const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Configure multer for CV uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/cvs';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'cv-' + req.user._id + '-' + uniqueSuffix + path.extname(file.originalname));
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

// @route   GET /api/users/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('company');

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [
  authenticateToken,
  body('firstName').optional().trim().notEmpty(),
  body('lastName').optional().trim().notEmpty(),
  body('phone').optional().trim(),
  body('company').optional().isObject(),
  body('profile').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, phone, company, profile } = req.body;
    
    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone) updateData.phone = phone;
    if (company) updateData.company = company;
    if (profile) updateData.profile = profile;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error during profile update' });
  }
});

// @route   POST /api/users/profile/cv-upload
// @desc    Upload CV file (applicants only)
// @access  Private (Applicants only)
router.post('/profile/cv-upload', [
  authenticateToken,
  authorizeRole('applicant'),
  upload.single('cv')
], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'CV file is required' });
    }

    // Update user's profile with CV file path
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 'profile.resume': req.file.path },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'CV uploaded successfully',
      user
    });
  } catch (error) {
    console.error('CV upload error:', error);
    res.status(500).json({ message: 'Server error during CV upload' });
  }
});

// @route   PUT /api/users/profile/resume
// @desc    Update user resume (applicants only)
// @access  Private (Applicants only)
router.put('/profile/resume', [
  authenticateToken,
  authorizeRole('applicant'),
  body('resume').notEmpty().withMessage('Resume is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { resume } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 'profile.resume': resume },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Resume updated successfully',
      user
    });
  } catch (error) {
    console.error('Resume update error:', error);
    res.status(500).json({ message: 'Server error during resume update' });
  }
});

// @route   PUT /api/users/profile/avatar
// @desc    Update user avatar
// @access  Private
router.put('/profile/avatar', [
  authenticateToken,
  body('avatar').notEmpty().withMessage('Avatar URL is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 'profile.avatar': avatar },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Avatar updated successfully',
      user
    });
  } catch (error) {
    console.error('Avatar update error:', error);
    res.status(500).json({ message: 'Server error during avatar update' });
  }
});

// @route   PUT /api/users/profile/experience
// @desc    Add/Update work experience (applicants only)
// @access  Private (Applicants only)
router.put('/profile/experience', [
  authenticateToken,
  authorizeRole('applicant'),
  body('experience').isArray().withMessage('Experience must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { experience } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 'profile.experience': experience },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Experience updated successfully',
      user
    });
  } catch (error) {
    console.error('Experience update error:', error);
    res.status(500).json({ message: 'Server error during experience update' });
  }
});

// @route   PUT /api/users/profile/education
// @desc    Add/Update education (applicants only)
// @access  Private (Applicants only)
router.put('/profile/education', [
  authenticateToken,
  authorizeRole('applicant'),
  body('education').isArray().withMessage('Education must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { education } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 'profile.education': education },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Education updated successfully',
      user
    });
  } catch (error) {
    console.error('Education update error:', error);
    res.status(500).json({ message: 'Server error during education update' });
  }
});

// @route   PUT /api/users/profile/skills
// @desc    Update skills (applicants only)
// @access  Private (Applicants only)
router.put('/profile/skills', [
  authenticateToken,
  authorizeRole('applicant'),
  body('skills').isArray().withMessage('Skills must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { skills } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 'profile.skills': skills },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Skills updated successfully',
      user
    });
  } catch (error) {
    console.error('Skills update error:', error);
    res.status(500).json({ message: 'Server error during skills update' });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID (public profile)
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('firstName lastName role company profile.headline profile.summary profile.skills profile.avatar')
      .populate('company');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/users/account
// @desc    Delete user account
// @access  Private
router.delete('/account', [
  authenticateToken,
  body('password').notEmpty().withMessage('Password is required for account deletion')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { password } = req.body;
    const user = await User.findById(req.user._id);

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Password is incorrect' });
    }

    // Delete user account
    await User.findByIdAndDelete(req.user._id);

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: 'Server error during account deletion' });
  }
});

// @route   GET /api/users/stats
// @desc    Get user statistics
// @access  Private
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const stats = {
      totalUsers: await User.countDocuments(),
      totalEmployers: await User.countDocuments({ role: 'employer' }),
      totalApplicants: await User.countDocuments({ role: 'applicant' }),
      activeUsers: await User.countDocuments({ isActive: true }),
      verifiedUsers: await User.countDocuments({ isVerified: true })
    };

    res.json(stats);
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
