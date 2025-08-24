const mongoose = require('mongoose');
require('dotenv').config({ path: './config.env' });
const User = require('./models/User');
const Job = require('./models/Job');
const Application = require('./models/Application');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/job-portal', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const checkData = async () => {
  try {
    console.log('🔍 Checking database data...\n');

    // Check users
    const users = await User.find({}).select('firstName lastName email role');
    console.log('👥 Users in database:');
    users.forEach(user => {
      console.log(`- ${user.firstName} ${user.lastName} (${user.email}) - ${user.role}`);
    });
    console.log('');

    // Check jobs
    const jobs = await Job.find({}).populate('employer', 'firstName lastName email');
    console.log('💼 Jobs in database:');
    jobs.forEach(job => {
      console.log(`- ${job.title} (posted by: ${job.employer.firstName} ${job.employer.lastName})`);
    });
    console.log('');

    // Check applications
    const applications = await Application.find({})
      .populate('job', 'title')
      .populate('applicant', 'firstName lastName email')
      .populate('employer', 'firstName lastName email');
    
    console.log('📝 Applications in database:');
    applications.forEach(app => {
      console.log(`- ${app.applicant.firstName} ${app.applicant.lastName} applied for "${app.job.title}" (employer: ${app.employer.firstName} ${app.employer.lastName})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking data:', error);
    process.exit(1);
  }
};

checkData();
