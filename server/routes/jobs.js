const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Job = require('../models/Job');
const { authenticateToken, authorizeRole, authorizeJobOwner, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/jobs
// @desc    Get all jobs with filters and pagination
// @access  Public
router.get('/', [
  optionalAuth,
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('search').optional().trim(),
  query('location').optional().trim(),
  query('type').optional().isIn(['full-time', 'part-time', 'contract', 'internship', 'freelance']),
  query('experience').optional().isIn(['entry', 'junior', 'mid', 'senior', 'lead', 'executive']),
  query('isRemote').optional().isBoolean(),
  query('salaryMin').optional().isNumeric(),
  query('salaryMax').optional().isNumeric(),
  query('skills').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = { isActive: true };

    // Search functionality
    if (req.query.search) {
      query = {
        $and: [
          { isActive: true },
          {
            $or: [
              { title: { $regex: req.query.search, $options: 'i' } },
              { description: { $regex: req.query.search, $options: 'i' } },
              { skills: { $in: [new RegExp(req.query.search, 'i')] } },
              { location: { $regex: req.query.search, $options: 'i' } },
              { 'company.name': { $regex: req.query.search, $options: 'i' } }
            ]
          }
        ]
      };
    }

    // Apply filters
    if (req.query.location) {
      query.location = { $regex: req.query.location, $options: 'i' };
    }
    if (req.query.type) {
      query.type = req.query.type;
    }
    if (req.query.experience) {
      query.experience = req.query.experience;
    }
    if (req.query.isRemote !== undefined) {
      query.isRemote = req.query.isRemote === 'true';
    }
    if (req.query.salaryMin || req.query.salaryMax) {
      query.salary = {};
      if (req.query.salaryMin) query.salary.$gte = parseInt(req.query.salaryMin);
      if (req.query.salaryMax) query.salary.$lte = parseInt(req.query.salaryMax);
    }
    if (req.query.skills && req.query.skills.length > 0) {
      query.skills = { $in: req.query.skills };
    }

    const jobs = await Job.find(query)
      .populate('employer', 'firstName lastName company.name company.logo')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Job.countDocuments(query);

    res.json({
      jobs,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/jobs/:id
// @desc    Get job by ID
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('employer', 'firstName lastName company.name company.logo company.description');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (!job.isActive) {
      return res.status(404).json({ message: 'Job is no longer active' });
    }

    // Increment views
    job.views += 1;
    await job.save();

    res.json(job);
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/jobs
// @desc    Create a new job
// @access  Private (Employers only)
router.post('/', [
  authenticateToken,
  authorizeRole('employer'),
  body('title').trim().notEmpty().withMessage('Job title is required'),
  body('description').notEmpty().withMessage('Job description is required'),
  body('requirements').notEmpty().withMessage('Job requirements are required'),
  body('responsibilities').notEmpty().withMessage('Job responsibilities are required'),
  body('skills').isArray().withMessage('Skills must be an array'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('type').isIn(['full-time', 'part-time', 'contract', 'internship', 'freelance']),
  body('experience').isIn(['entry', 'junior', 'mid', 'senior', 'lead', 'executive']),
  body('salary.min').isNumeric().withMessage('Minimum salary must be a number'),
  body('salary.max').isNumeric().withMessage('Maximum salary must be a number'),
  body('isRemote').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title, description, requirements, responsibilities, skills,
      location, type, experience, salary, benefits, isRemote,
      applicationDeadline, tags
    } = req.body;

    // Validate salary range
    if (salary.min >= salary.max) {
      return res.status(400).json({ message: 'Maximum salary must be greater than minimum salary' });
    }

    const job = new Job({
      title,
      description,
      requirements,
      responsibilities,
      skills,
      location,
      type,
      experience,
      salary,
      benefits: benefits || [],
      isRemote: isRemote || false,
      applicationDeadline,
      tags: tags || [],
      employer: req.user._id,
      company: {
        name: req.user.company?.name || '',
        logo: req.user.company?.logo || '',
        location: req.user.company?.location || ''
      }
    });

    await job.save();

    res.status(201).json({
      message: 'Job created successfully',
      job
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ message: 'Server error during job creation' });
  }
});

// @route   PUT /api/jobs/:id
// @desc    Update a job
// @access  Private (Job owner only)
router.put('/:id', [
  authenticateToken,
  authorizeRole('employer'),
  authorizeJobOwner,
  body('title').optional().trim().notEmpty(),
  body('description').optional().notEmpty(),
  body('requirements').optional().notEmpty(),
  body('responsibilities').optional().notEmpty(),
  body('skills').optional().isArray(),
  body('location').optional().trim().notEmpty(),
  body('type').optional().isIn(['full-time', 'part-time', 'contract', 'internship', 'freelance']),
  body('experience').optional().isIn(['entry', 'junior', 'mid', 'senior', 'lead', 'executive']),
  body('salary.min').optional().isNumeric(),
  body('salary.max').optional().isNumeric(),
  body('isRemote').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updateData = { ...req.body };

    // Validate salary range if provided
    if (updateData.salary) {
      if (updateData.salary.min >= updateData.salary.max) {
        return res.status(400).json({ message: 'Maximum salary must be greater than minimum salary' });
      }
    }

    const job = await Job.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('employer', 'firstName lastName company.name');

    res.json({
      message: 'Job updated successfully',
      job
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ message: 'Server error during job update' });
  }
});

// @route   DELETE /api/jobs/:id
// @desc    Delete a job
// @access  Private (Job owner only)
router.delete('/:id', [
  authenticateToken,
  authorizeRole('employer'),
  authorizeJobOwner
], async (req, res) => {
  try {
    await Job.findByIdAndDelete(req.params.id);

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ message: 'Server error during job deletion' });
  }
});

// @route   GET /api/jobs/employer/my-jobs
// @desc    Get jobs posted by current employer
// @access  Private (Employers only)
router.get('/employer/my-jobs', [
  authenticateToken,
  authorizeRole('employer')
], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const jobs = await Job.find({ employer: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Job.countDocuments({ employer: req.user._id });

    res.json({
      jobs,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get employer jobs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/jobs/search/suggestions
// @desc    Get search suggestions
// @access  Public
router.get('/search/suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({ suggestions: [] });
    }

    const suggestions = await Job.aggregate([
      {
        $match: {
          isActive: true,
          $or: [
            { title: { $regex: q, $options: 'i' } },
            { location: { $regex: q, $options: 'i' } },
            { skills: { $in: [new RegExp(q, 'i')] } }
          ]
        }
      },
      {
        $group: {
          _id: null,
          titles: { $addToSet: '$title' },
          locations: { $addToSet: '$location' },
          skills: { $addToSet: '$skills' }
        }
      }
    ]);

    if (suggestions.length === 0) {
      return res.json({ suggestions: [] });
    }

    const { titles, locations, skills } = suggestions[0];
    const allSuggestions = [
      ...titles.slice(0, 5),
      ...locations.slice(0, 5),
      ...skills.flat().slice(0, 5)
    ];

    res.json({ suggestions: [...new Set(allSuggestions)] });
  } catch (error) {
    console.error('Search suggestions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
