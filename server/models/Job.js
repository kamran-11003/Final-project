const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  requirements: {
    type: String,
    required: true
  },
  responsibilities: {
    type: String,
    required: true
  },
  skills: [{
    type: String,
    trim: true
  }],
  location: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'internship', 'freelance'],
    required: true
  },
  experience: {
    type: String,
    enum: ['entry', 'junior', 'mid', 'senior', 'lead', 'executive'],
    required: true
  },
  salary: {
    min: {
      type: Number,
      required: true
    },
    max: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    },
    period: {
      type: String,
      enum: ['hourly', 'monthly', 'yearly'],
      default: 'yearly'
    }
  },
  benefits: [String],
  employer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  company: {
    name: String,
    logo: String,
    location: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isRemote: {
    type: Boolean,
    default: false
  },
  applicationDeadline: {
    type: Date
  },
  views: {
    type: Number,
    default: 0
  },
  applications: {
    type: Number,
    default: 0
  },
  tags: [String]
}, {
  timestamps: true
});

// Index for search functionality
jobSchema.index({
  title: 'text',
  description: 'text',
  skills: 'text',
  location: 'text',
  'company.name': 'text'
});

// Virtual for salary range
jobSchema.virtual('salaryRange').get(function() {
  return `${this.salary.currency} ${this.salary.min.toLocaleString()} - ${this.salary.max.toLocaleString()} ${this.salary.period}`;
});

// Static method to search jobs
jobSchema.statics.searchJobs = function(query) {
  return this.find({
    $and: [
      { isActive: true },
      {
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { skills: { $in: [new RegExp(query, 'i')] } },
          { location: { $regex: query, $options: 'i' } },
          { 'company.name': { $regex: query, $options: 'i' } }
        ]
      }
    ]
  }).populate('employer', 'firstName lastName company');
};

// Static method to get jobs with filters
jobSchema.statics.getJobsWithFilters = function(filters) {
  const query = { isActive: true };
  
  if (filters.location) {
    query.location = { $regex: filters.location, $options: 'i' };
  }
  
  if (filters.type) {
    query.type = filters.type;
  }
  
  if (filters.experience) {
    query.experience = filters.experience;
  }
  
  if (filters.isRemote !== undefined) {
    query.isRemote = filters.isRemote;
  }
  
  if (filters.salaryMin || filters.salaryMax) {
    query.salary = {};
    if (filters.salaryMin) query.salary.$gte = filters.salaryMin;
    if (filters.salaryMax) query.salary.$lte = filters.salaryMax;
  }
  
  if (filters.skills && filters.skills.length > 0) {
    query.skills = { $in: filters.skills };
  }
  
  return this.find(query).populate('employer', 'firstName lastName company');
};

module.exports = mongoose.model('Job', jobSchema);
