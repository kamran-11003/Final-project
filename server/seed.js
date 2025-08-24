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

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Job.deleteMany({});
    await Application.deleteMany({});

    console.log('🗑️  Cleared existing data');

    // Create test users
    const employer = new User({
      firstName: 'John',
      lastName: 'Employer',
      email: 'employer@test.com',
      password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      role: 'employer',
      phone: '+1234567890',
      profile: {
        company: {
          name: 'TechCorp',
          description: 'A leading technology company',
          website: 'https://techcorp.com',
          logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
        },
        location: 'San Francisco, CA',
        headline: 'Senior HR Manager at TechCorp'
      }
    });

    const applicant1 = new User({
      firstName: 'Alice',
      lastName: 'Applicant',
      email: 'alice@test.com',
      password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      role: 'applicant',
      phone: '+1234567891',
      profile: {
        headline: 'Full Stack Developer',
        summary: 'Experienced developer with 5+ years in web development',
        location: 'New York, NY',
        resume: 'https://example.com/resume1.pdf',
        experience: [
          {
            title: 'Senior Developer',
            company: 'Previous Corp',
            duration: '3 years'
          }
        ]
      }
    });

    const applicant2 = new User({
      firstName: 'Bob',
      lastName: 'Developer',
      email: 'bob@test.com',
      password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      role: 'applicant',
      phone: '+1234567892',
      profile: {
        headline: 'Frontend Developer',
        summary: 'Passionate about creating beautiful user interfaces',
        location: 'Los Angeles, CA',
        resume: 'https://example.com/resume2.pdf',
        experience: [
          {
            title: 'Frontend Developer',
            company: 'Design Studio',
            duration: '2 years'
          }
        ]
      }
    });

    await employer.save();
    await applicant1.save();
    await applicant2.save();

    console.log('👥 Created test users');

    // Create test jobs
    const job1 = new Job({
      title: 'Senior Software Engineer',
      description: 'We are looking for a talented Senior Software Engineer to join our team and help build amazing products.',
      requirements: '5+ years of experience in software development, proficiency in JavaScript, React, Node.js',
      responsibilities: 'Design and implement new features, mentor junior developers, participate in code reviews',
      skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'AWS'],
      location: 'San Francisco, CA',
      type: 'full-time',
      experience: 'senior',
      salary: {
        min: 120000,
        max: 180000,
        currency: 'USD',
        period: 'yearly'
      },
      benefits: ['Health Insurance', '401k', 'Remote Work', 'Flexible Hours'],
      employer: employer._id,
      company: {
        name: 'TechCorp',
        logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
        location: 'San Francisco, CA'
      },
      isActive: true,
      isRemote: false
    });

    const job2 = new Job({
      title: 'Frontend Developer',
      description: 'Join our frontend team to create beautiful and responsive user interfaces.',
      requirements: '3+ years of experience in frontend development, proficiency in React, TypeScript, CSS',
      responsibilities: 'Build responsive UIs, optimize performance, collaborate with designers',
      skills: ['React', 'TypeScript', 'CSS', 'HTML', 'JavaScript'],
      location: 'Remote',
      type: 'full-time',
      experience: 'mid',
      salary: {
        min: 80000,
        max: 120000,
        currency: 'USD',
        period: 'yearly'
      },
      benefits: ['Health Insurance', '401k', 'Remote Work'],
      employer: employer._id,
      company: {
        name: 'TechCorp',
        logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
        location: 'San Francisco, CA'
      },
      isActive: true,
      isRemote: true
    });

    await job1.save();
    await job2.save();

    console.log('💼 Created test jobs');

    // Create test applications
    const application1 = new Application({
      job: job1._id,
      applicant: applicant1._id,
      employer: employer._id,
      status: 'applied',
      coverLetter: 'I am excited to apply for the Senior Software Engineer position at TechCorp. With my 5+ years of experience in full-stack development, I believe I would be a great fit for your team.',
      resume: 'https://example.com/resume1.pdf',
      expectedSalary: {
        amount: 150000,
        currency: 'USD',
        period: 'yearly'
      },
      availability: 'immediate'
    });

    const application2 = new Application({
      job: job1._id,
      applicant: applicant2._id,
      employer: employer._id,
      status: 'reviewing',
      coverLetter: 'I am interested in the Senior Software Engineer role. I have experience with React and Node.js and am passionate about building scalable applications.',
      resume: 'https://example.com/resume2.pdf',
      expectedSalary: {
        amount: 140000,
        currency: 'USD',
        period: 'yearly'
      },
      availability: '1-month'
    });

    const application3 = new Application({
      job: job2._id,
      applicant: applicant1._id,
      employer: employer._id,
      status: 'shortlisted',
      coverLetter: 'I would love to join your frontend team. I have extensive experience with React and TypeScript.',
      resume: 'https://example.com/resume1.pdf',
      expectedSalary: {
        amount: 100000,
        currency: 'USD',
        period: 'yearly'
      },
      availability: 'immediate'
    });

    await application1.save();
    await application2.save();
    await application3.save();

    console.log('📝 Created test applications');

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📋 Test Accounts:');
    console.log('Employer: employer@test.com / password');
    console.log('Applicant 1: alice@test.com / password');
    console.log('Applicant 2: bob@test.com / password');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
