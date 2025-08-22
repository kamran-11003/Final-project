const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Job = require('./models/Job');
const Application = require('./models/Application');
require('dotenv').config({ path: './config.env' });

// Sample data
const users = [
  // Demo Applicant
  {
    email: 'applicant@demo.com',
    password: 'password123',
    role: 'applicant',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+1-555-0123',
    profile: {
      headline: 'Full Stack Developer | React & Node.js Expert',
      summary: 'Passionate full-stack developer with 3+ years of experience building scalable web applications. Expertise in React, Node.js, and modern JavaScript frameworks.',
      location: 'San Francisco, CA',
      website: 'https://johndoe.dev',
      socialMedia: {
        linkedin: 'https://linkedin.com/in/johndoe',
        github: 'https://github.com/johndoe',
        portfolio: 'https://johndoe.dev'
      },
      skills: [
        { name: 'JavaScript', level: 'expert' },
        { name: 'React', level: 'advanced' },
        { name: 'Node.js', level: 'advanced' },
        { name: 'MongoDB', level: 'intermediate' },
        { name: 'TypeScript', level: 'intermediate' }
      ],
      experience: [{
        title: 'Senior Frontend Developer',
        company: 'TechCorp',
        location: 'San Francisco, CA',
        startDate: new Date('2021-01-01'),
        current: true,
        description: 'Lead frontend development for multiple web applications using React and TypeScript.'
      }],
      education: [{
          degree: 'Bachelor of Computer Science',
        institution: 'University of California',
        field: 'Computer Science',
          graduationYear: 2020
      }]
    }
  },
  // Demo Employer
  {
    email: 'employer@demo.com',
    password: 'password123',
    role: 'employer',
    firstName: 'Jane',
    lastName: 'Smith',
    phone: '+1-555-0456',
    company: {
      name: 'Innovation Labs',
      description: 'A cutting-edge technology company focused on AI and machine learning solutions.',
      website: 'https://innovationlabs.com',
      industry: 'Technology',
      size: '50-200',
      location: 'San Francisco, CA',
      founded: 2018
    }
  }
];

const sampleJobs = [
  {
    title: 'Full Stack Developer',
    description: 'Join our dynamic team as a Full Stack Developer where you will work on exciting projects using cutting-edge technologies. We value creativity, innovation, and continuous learning.',
    requirements: '• 3+ years of experience in full-stack development\n• Proficiency in JavaScript/TypeScript, React, and Node.js\n• Experience with databases (MongoDB, PostgreSQL)\n• Knowledge of RESTful APIs and GraphQL\n• Familiarity with cloud platforms (AWS, Azure)\n• Experience with version control (Git)\n• Strong communication and teamwork skills',
    responsibilities: '• Build and maintain full-stack web applications\n• Design and implement database schemas\n• Create and maintain RESTful APIs\n• Collaborate with cross-functional teams\n• Participate in agile development processes\n• Write unit and integration tests',
    location: 'San Francisco, CA',
    type: 'full-time',
    experience: 'mid',
    salary: {
      min: 90000,
      max: 130000,
      currency: 'USD'
    },
    skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Express', 'Git', 'AWS'],
    benefits: ['Competitive salary', 'health benefits', 'flexible work arrangements', 'learning opportunities', 'team events'],
    status: 'active'
  }
];

const sampleApplications = [
  {
    coverLetter: 'Dear Hiring Manager,\n\nI am excited to apply for the Full Stack Developer position at Innovation Labs. With 3+ years of experience in React and Node.js development, I believe I would be a valuable addition to your team.\n\nI have experience building scalable web applications and working with modern JavaScript frameworks. I am passionate about creating clean, maintainable code and collaborating with cross-functional teams.\n\nI am particularly drawn to Innovation Labs\' innovative approach to AI and machine learning, and I would love the opportunity to contribute to your cutting-edge projects.\n\nThank you for considering my application.\n\nBest regards,\nJohn Doe',
    expectedSalary: {
      amount: 110000,
      currency: 'USD',
      period: 'yearly'
    },
    availability: 'immediate',
    status: 'applied',
    resume: 'uploads/resumes/john-doe-resume.pdf'
  }
];

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/job-portal')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Seed function
async function seed() {
  try {
    console.log('Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Job.deleteMany({});
    await Application.deleteMany({});

    console.log('Cleared existing data');

    // Create users
    const createdUsers = [];
    for (const userData of users) {
      // Prepare user data without password first
      const userDataWithoutPassword = { ...userData };
      delete userDataWithoutPassword.password;
      
      const user = new User({
        ...userDataWithoutPassword,
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Set password separately if it exists
      if (userData.password) {
        user.password = userData.password; // This will trigger the pre-save middleware
      }
      
      await user.save();
      createdUsers.push(user);
      console.log(`Created user: ${user.email}`);
    }

    // Separate users by role
    const employers = createdUsers.filter(user => user.role === 'employer');
    const applicants = createdUsers.filter(user => user.role === 'applicant');

    // Create jobs
    const createdJobs = [];
    for (let i = 0; i < sampleJobs.length; i++) {
      const jobData = sampleJobs[i];
      const employer = employers[i % employers.length];
      
      const job = new Job({
        ...jobData,
        employer: employer._id,
        views: Math.floor(Math.random() * 1000) + 50,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      await job.save();
      createdJobs.push(job);
      console.log(`Created job: ${job.title}`);
    }

    // Create applications
    for (let i = 0; i < sampleApplications.length; i++) {
      const applicationData = sampleApplications[i];
      const applicant = applicants[i % applicants.length];
      const job = createdJobs[i % createdJobs.length];
        
        const application = new Application({
        ...applicationData,
        job: job._id, // Use 'job' instead of 'jobId'
          applicant: applicant._id,
          employer: job.employer,
        createdAt: new Date(),
        updatedAt: new Date()
      });
        await application.save();
      console.log(`Created application for job: ${job.title}`);
    }

    // No additional applications needed for simple demo

    console.log('Database seeding completed successfully!');
    console.log(`Created ${createdUsers.length} users`);
    console.log(`Created ${createdJobs.length} jobs`);
    console.log('Created multiple applications');

    // Display demo account information
    console.log('\n=== Demo Accounts ===');
    console.log('Applicant: applicant@demo.com / password123 (John Doe)');
    console.log('Employer: employer@demo.com / password123 (Jane Smith)');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

// Run seed function
seed();
