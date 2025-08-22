# JobPortal - Full-Stack Job Portal Application

A comprehensive job portal application built with React, Node.js, and MongoDB, featuring modern UI/UX and robust functionality for both job seekers and employers.

## 🚀 Features

### 🔐 Authentication & User Management
- **Multi-role Registration**: Separate registration flows for job seekers and employers
- **Google OAuth Integration**: Seamless login for job seekers using Google accounts
- **Email-based Registration**: Traditional email/password registration for all users
- **Role-based Access Control**: Different features and permissions based on user role
- **Password Reset**: Email-based password recovery system

### 👥 Job Seeker Features
- **Profile Management**: Complete LinkedIn-style profile with skills, experience, and education
- **Job Search & Discovery**: Advanced job search with filters (location, salary, experience, type)
- **Job Applications**: Apply to jobs with cover letter and mandatory CV/resume upload
- **Application Tracking**: Real-time status tracking of all applications
- **Resume Management**: Upload and manage multiple resume versions
- **Job Alerts**: Get notified about new job opportunities
- **Application History**: Complete history of all job applications

### 🏢 Employer Features
- **Company Profile**: Detailed company information and branding
- **Job Posting**: Create and manage job listings with rich descriptions
- **Application Management**: Review and manage incoming applications
- **Candidate Evaluation**: Detailed applicant profiles and resume viewing
- **Status Management**: Update application statuses with automated email notifications
- **Interview Scheduling**: Schedule interviews with candidates
- **Analytics Dashboard**: Application statistics and insights

### 📧 Email Notifications
- **Application Status Updates**: Automated emails for status changes
- **Shortlist Notifications**: Special congratulatory emails for shortlisted candidates
- **Rejection Notifications**: Professional rejection emails with feedback
- **Interview Invitations**: Detailed interview scheduling emails
- **Password Reset**: Secure password recovery emails

### 🎨 User Interface
- **Responsive Design**: Mobile-first design that works on all devices
- **Modern UI/UX**: Clean, intuitive interface with Tailwind CSS
- **Dark/Light Mode**: Theme switching capability
- **Real-time Updates**: Live status updates and notifications
- **Advanced Filtering**: Comprehensive search and filter options
- **Data Tables**: Professional table views for employers
- **Modal Dialogs**: Rich modal interfaces for detailed views

### 🔧 Technical Features
- **File Upload**: Secure resume upload with validation
- **Real-time Data**: React Query for efficient data management
- **Form Validation**: Comprehensive client and server-side validation
- **Error Handling**: Graceful error handling and user feedback
- **Security**: JWT authentication, input sanitization, and role-based access
- **Performance**: Optimized queries and efficient data loading

## 🛠 Tech Stack

### Frontend
- **React 18**: Modern React with hooks and functional components
- **React Router**: Client-side routing and navigation
- **TanStack Query**: Server state management and caching
- **Tailwind CSS**: Utility-first CSS framework
- **Heroicons**: Beautiful SVG icons
- **React Hook Form**: Form handling and validation
- **React Hot Toast**: Toast notifications
- **Axios**: HTTP client for API requests

### Backend
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database with Mongoose ODM
- **JWT**: JSON Web Tokens for authentication
- **Multer**: File upload handling
- **Nodemailer**: Email sending functionality
- **Passport.js**: Google OAuth authentication
- **Express Validator**: Input validation and sanitization
- **bcryptjs**: Password hashing

### Development Tools
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **Nodemon**: Development server with auto-restart
- **Concurrently**: Run multiple commands simultaneously

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v16 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn** package manager

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd job-portal
```

### 2. Install Dependencies

#### Backend Dependencies
```bash
cd server
npm install
```

#### Frontend Dependencies
```bash
cd ../client
npm install
```

### 3. Environment Configuration

#### Backend Environment (.env)
Create a `.env` file in the `server` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/job-portal

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Client URL (for CORS)
CLIENT_URL=http://localhost:3000

# Email Configuration (for notifications)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

#### Frontend Environment (.env)
Create a `.env` file in the `client` directory:

```env
REACT_APP_API_URL=http://localhost:5000
```

### 4. Database Setup

#### Start MongoDB
```bash
# Start MongoDB service
mongod
```

#### Seed the Database (Optional)
```bash
cd server
npm run seed
```

### 5. Start the Application

#### Development Mode
```bash
# Start backend server
cd server
npm run dev

# Start frontend (in a new terminal)
cd client
npm start
```

#### Production Mode
```bash
# Build frontend
cd client
npm run build

# Start production server
cd ../server
npm start
```

## 📁 Project Structure

```
job-portal/
├── client/                 # React frontend
│   ├── public/            # Static files
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # React contexts
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── utils/         # Utility functions
│   └── package.json
├── server/                # Node.js backend
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── utils/            # Utility functions
│   ├── uploads/          # File uploads
│   └── package.json
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/google` - Google OAuth initiation
- `GET /api/auth/google/callback` - Google OAuth callback
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset

### Jobs
- `GET /api/jobs` - Get all jobs with filters
- `POST /api/jobs` - Create new job (employer only)
- `GET /api/jobs/:id` - Get job details
- `PUT /api/jobs/:id` - Update job (employer only)
- `DELETE /api/jobs/:id` - Delete job (employer only)

### Applications
- `POST /api/applications` - Apply for a job
- `GET /api/applications/my-applications` - Get user's applications
- `GET /api/applications/employer` - Get employer's applications
- `PUT /api/applications/:id/status` - Update application status
- `POST /api/applications/:id/interview` - Schedule interview
- `GET /api/applications/:id/resume` - Download resume

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/upload-avatar` - Upload profile picture

## 🎯 Key Features Implementation

### 1. Google OAuth (Applicants Only)
- Restricted to job seekers only
- Automatic profile creation from Google data
- Seamless integration with existing accounts

### 2. Mandatory CV Upload
- File type validation (PDF, DOC, DOCX)
- File size limits (5MB)
- Secure file storage and retrieval
- Resume viewing for employers

### 3. Email Notifications
- Automated status update emails
- Professional email templates
- Configurable email settings
- Error handling for failed emails

### 4. Advanced Application Management
- Detailed table view for employers
- Quick action buttons (shortlist/reject)
- Search and filtering capabilities
- Sort by multiple criteria
- Real-time status updates

### 5. Responsive Design
- Mobile-first approach
- Tablet and desktop optimization
- Touch-friendly interfaces
- Cross-browser compatibility

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Different permissions for different user types
- **Input Validation**: Server-side validation for all inputs
- **File Upload Security**: File type and size validation
- **Password Hashing**: Secure password storage with bcrypt
- **CORS Configuration**: Proper cross-origin resource sharing
- **Environment Variables**: Secure configuration management

## 🚀 Deployment

### Backend Deployment (Heroku)
```bash
# Add Heroku remote
heroku git:remote -a your-app-name

# Deploy
git push heroku main

# Set environment variables
heroku config:set MONGODB_URI=your-mongodb-uri
heroku config:set JWT_SECRET=your-jwt-secret
# ... other environment variables
```

### Frontend Deployment (Netlify/Vercel)
```bash
# Build the application
npm run build

# Deploy the build folder
# Upload to Netlify or Vercel
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Contact the development team

## 🎉 Acknowledgments

- React team for the amazing framework
- Tailwind CSS for the utility-first approach
- MongoDB for the flexible database
- All contributors and supporters

---

**Built with ❤️ for the job market**

### Latest Updates
- ✅ Google OAuth integration
- ✅ Password reset functionality
- ✅ Enhanced job editing
- ✅ Comprehensive application management
- ✅ Real-time status updates
- ✅ Improved UI/UX with visual feedback
- ✅ Complete testing suite
- ✅ Enhanced seed data with demo accounts

### Demo Accounts
- **Applicant**: `applicant@demo.com` / `password123`
- **Employer**: `employer@demo.com` / `password123`
- **Google OAuth Users**: `john.doe@gmail.com`, `jane.smith@gmail.com`

---

**Built with ❤️ using modern web technologies**
