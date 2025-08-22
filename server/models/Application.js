const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  employer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['applied', 'reviewing', 'shortlisted', 'interviewed', 'offered', 'rejected', 'withdrawn'],
    default: 'applied'
  },
  coverLetter: {
    type: String,
    required: true,
    maxlength: 2000
  },
  resume: {
    type: String,
    required: true
  },
  expectedSalary: {
    amount: Number,
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
  availability: {
    type: String,
    enum: ['immediate', '2-weeks', '1-month', '3-months', 'negotiable'],
    default: 'immediate'
  },
  notes: {
    applicant: String,
    employer: String
  },
  interview: {
    scheduled: Date,
    location: String,
    type: {
      type: String,
      enum: ['phone', 'video', 'in-person'],
      default: 'video'
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
      default: 'scheduled'
    },
    feedback: String
  },
  isViewed: {
    type: Boolean,
    default: false
  },
  viewedAt: Date,
  appliedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });
applicationSchema.index({ applicant: 1, status: 1 });
applicationSchema.index({ employer: 1, status: 1 });

// Virtual for application age
applicationSchema.virtual('age').get(function() {
  const now = new Date();
  const applied = this.appliedAt || this.createdAt;
  const diffTime = Math.abs(now - applied);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Static method to get applications by status
applicationSchema.statics.getByStatus = function(userId, role, status) {
  const query = {};
  
  if (role === 'applicant') {
    query.applicant = userId;
  } else if (role === 'employer') {
    query.employer = userId;
  }
  
  if (status) {
    query.status = status;
  }
  
  return this.find(query)
    .populate('job', 'title company location salary type')
    .populate('applicant', 'firstName lastName email profile.avatar')
    .populate('employer', 'firstName lastName company.name')
    .sort({ createdAt: -1 });
};

// Static method to get application statistics
applicationSchema.statics.getStats = function(userId, role) {
  const matchStage = role === 'applicant' 
    ? { applicant: mongoose.Types.ObjectId(userId) }
    : { employer: mongoose.Types.ObjectId(userId) };
    
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

// Pre-save middleware to update job application count
applicationSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const Job = mongoose.model('Job');
      await Job.findByIdAndUpdate(this.job, { $inc: { applications: 1 } });
    } catch (error) {
      next(error);
    }
  }
  next();
});

module.exports = mongoose.model('Application', applicationSchema);
