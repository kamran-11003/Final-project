const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = file.fieldname === 'resume' ? 'uploads/resumes' : 
                     file.fieldname === 'coverLetter' ? 'uploads/cover-letters' :
                     file.fieldname === 'avatar' ? 'uploads/avatars' :
                     'uploads/documents';
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    'resume': ['.pdf', '.doc', '.docx'],
    'coverLetter': ['.pdf', '.doc', '.docx', '.txt'],
    'avatar': ['.jpg', '.jpeg', '.png', '.gif'],
    'document': ['.pdf', '.doc', '.docx', '.txt', '.rtf']
  };

  const fieldType = file.fieldname;
  const allowedExtensions = allowedTypes[fieldType] || allowedTypes.document;
  const fileExtension = path.extname(file.originalname).toLowerCase();

  if (allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types for ${fieldType}: ${allowedExtensions.join(', ')}`), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1
  }
});

// @route   POST /api/upload/resume
// @desc    Upload resume file
// @access  Private
router.post('/resume', [
  authenticateToken,
  upload.single('resume')
], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileInfo = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      uploadedAt: new Date()
    };

    // Update user's resume field
    const User = require('../models/User');
    await User.findByIdAndUpdate(req.user._id, {
      'profile.resume': fileInfo.path
    });

    res.json({
      message: 'Resume uploaded successfully',
      file: fileInfo
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({ message: 'Error uploading resume' });
  }
});

// @route   POST /api/upload/cover-letter
// @desc    Upload cover letter file
// @access  Private
router.post('/cover-letter', [
  authenticateToken,
  upload.single('coverLetter')
], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileInfo = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      uploadedAt: new Date()
    };

    res.json({
      message: 'Cover letter uploaded successfully',
      file: fileInfo
    });
  } catch (error) {
    console.error('Cover letter upload error:', error);
    res.status(500).json({ message: 'Error uploading cover letter' });
  }
});

// @route   POST /api/upload/avatar
// @desc    Upload profile avatar
// @access  Private
router.post('/avatar', [
  authenticateToken,
  upload.single('avatar')
], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileInfo = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      uploadedAt: new Date()
    };

    // Update user's avatar field
    const User = require('../models/User');
    await User.findByIdAndUpdate(req.user._id, {
      'profile.avatar': fileInfo.path
    });

    res.json({
      message: 'Avatar uploaded successfully',
      file: fileInfo
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ message: 'Error uploading avatar' });
  }
});

// @route   POST /api/upload/document
// @desc    Upload general document
// @access  Private
router.post('/document', [
  authenticateToken,
  upload.single('document')
], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileInfo = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      uploadedAt: new Date()
    };

    res.json({
      message: 'Document uploaded successfully',
      file: fileInfo
    });
  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({ message: 'Error uploading document' });
  }
});

// @route   GET /api/upload/:filename
// @desc    Download file
// @access  Private
router.get('/:filename', authenticateToken, (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '..', 'uploads', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.download(filePath);
  } catch (error) {
    console.error('File download error:', error);
    res.status(500).json({ message: 'Error downloading file' });
  }
});

// @route   DELETE /api/upload/:filename
// @desc    Delete uploaded file
// @access  Private
router.delete('/:filename', authenticateToken, async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '..', 'uploads', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Remove file from filesystem
    fs.unlinkSync(filePath);

    // Update user profile if it was a resume or avatar
    const User = require('../models/User');
    const user = await User.findById(req.user._id);
    
    if (user.profile.resume && user.profile.resume.includes(filename)) {
      await User.findByIdAndUpdate(req.user._id, {
        'profile.resume': null
      });
    }
    
    if (user.profile.avatar && user.profile.avatar.includes(filename)) {
      await User.findByIdAndUpdate(req.user._id, {
        'profile.avatar': null
      });
    }

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('File deletion error:', error);
    res.status(500).json({ message: 'Error deleting file' });
  }
});

module.exports = router;
