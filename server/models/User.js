const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId; // Password not required if using Google OAuth
    },
    minlength: 6
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  role: {
    type: String,
    enum: ['applicant', 'employer', 'admin'],
    default: 'applicant'
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  // For employers
  company: {
    name: String,
    description: String,
    website: String,
    logo: String,
    industry: String,
    size: String,
    location: String,
    founded: Number,
    mission: String,
    values: [String],
    socialMedia: {
      linkedin: String,
      twitter: String,
      facebook: String,
      instagram: String
    }
  },
  // For applicants - LinkedIn-style profile
  profile: {
    headline: String,
    summary: String,
    location: String,
    website: String,
    socialMedia: {
      linkedin: String,
      github: String,
      twitter: String,
      portfolio: String,
      blog: String
    },
    experience: [{
      title: String,
      company: String,
      location: String,
      startDate: Date,
      endDate: Date,
      current: Boolean,
      description: String,
      achievements: [String],
      skills: [String]
    }],
    education: [{
      degree: String,
      institution: String,
      field: String,
      graduationYear: Number,
      gpa: Number,
      activities: [String],
      honors: [String]
    }],
    skills: [{
      name: String,
      level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'expert'],
        default: 'intermediate'
      },
      endorsements: {
        type: Number,
        default: 0
      }
    }],
    certifications: [{
      name: String,
      issuer: String,
      issueDate: Date,
      expiryDate: Date,
      credentialId: String,
      credentialUrl: String
    }],
    projects: [{
      title: String,
      description: String,
      technologies: [String],
      githubUrl: String,
      liveUrl: String,
      startDate: Date,
      endDate: Date,
      current: Boolean,
      highlights: [String]
    }],
    languages: [{
      name: String,
      proficiency: {
        type: String,
        enum: ['basic', 'conversational', 'fluent', 'native'],
        default: 'conversational'
      }
    }],
    interests: [String],
    resume: String,
    avatar: String,
    coverPhoto: String,
    recommendations: [{
      from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      relationship: String,
      content: String,
      date: {
        type: Date,
        default: Date.now
      }
    }],
    publications: [{
      title: String,
      authors: [String],
      journal: String,
      publicationDate: Date,
      url: String,
      description: String
    }],
    patents: [{
      title: String,
      patentNumber: String,
      issueDate: Date,
      description: String,
      url: String
    }],
    volunteerExperience: [{
      organization: String,
      role: String,
      cause: String,
      startDate: Date,
      endDate: Date,
      current: Boolean,
      description: String,
      hours: Number
    }],
    honors: [{
      title: String,
      issuer: String,
      date: Date,
      description: String
    }],
    courses: [{
      name: String,
      institution: String,
      completionDate: Date,
      certificateUrl: String,
      description: String
    }],
    testScores: [{
      testName: String,
      score: String,
      date: Date,
      expiryDate: Date
    }]
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  emailPreferences: {
    jobAlerts: {
      type: Boolean,
      default: true
    },
    applicationUpdates: {
      type: Boolean,
      default: true
    },
    marketingEmails: {
      type: Boolean,
      default: false
    },
    newsletter: {
      type: Boolean,
      default: true
    }
  },
  privacySettings: {
    profileVisibility: {
      type: String,
      enum: ['public', 'connections', 'private'],
      default: 'public'
    },
    showEmail: {
      type: Boolean,
      default: false
    },
    showPhone: {
      type: Boolean,
      default: false
    },
    allowMessages: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Get full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Remove password from JSON response
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.resetPasswordToken;
  delete user.resetPasswordExpires;
  return user;
};

module.exports = mongoose.model('User', userSchema);
