import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  MagnifyingGlassIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  StarIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/jobs?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const features = [
    {
      icon: BriefcaseIcon,
      title: 'Find Your Dream Job',
      description: 'Browse thousands of job opportunities and find the perfect match for your skills and career goals.',
      image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80'
    },
    {
      icon: BuildingOfficeIcon,
      title: 'Hire Top Talent',
      description: 'Post job openings and connect with qualified candidates to build your dream team.',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'
    },
    {
      icon: UserGroupIcon,
      title: 'Build Your Network',
      description: 'Connect with professionals in your industry and expand your professional network.',
      image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Active Jobs', icon: BriefcaseIcon },
    { number: '50,000+', label: 'Job Seekers', icon: UserGroupIcon },
    { number: '5,000+', label: 'Companies', icon: BuildingOfficeIcon },
    { number: '95%', label: 'Success Rate', icon: CheckCircleIcon }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Software Engineer',
      company: 'TechCorp',
      content: 'JobPortal helped me find my dream job in just 2 weeks. The platform is incredibly user-friendly and the job matching is spot-on!',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80'
    },
    {
      name: 'Michael Chen',
      role: 'HR Manager',
      company: 'InnovateTech',
      content: 'As an employer, JobPortal has been invaluable for finding top talent. The quality of candidates and ease of the hiring process is outstanding.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Marketing Specialist',
      company: 'GrowthCo',
      content: 'The application process is so smooth and the platform keeps me updated on my application status. Highly recommended!',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'
    }
  ];

  const featuredJobs = [
    {
      title: 'Senior Software Engineer',
      company: 'TechCorp',
      location: 'San Francisco, CA',
      salary: '$120k - $180k',
      type: 'Full-time',
      logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1326&q=80'
    },
    {
      title: 'Product Manager',
      company: 'InnovateTech',
      location: 'New York, NY',
      salary: '$100k - $150k',
      type: 'Full-time',
      logo: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80'
    },
    {
      title: 'UX Designer',
      company: 'DesignStudio',
      location: 'Remote',
      salary: '$80k - $120k',
      type: 'Full-time',
      logo: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/5"></div>
        </div>
        
        {/* Hero Background Image */}
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
            alt="Professional team" 
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        
        <div className="relative container-responsive py-24 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="mb-6">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-white/10 backdrop-blur-sm border border-white/20">
                <CheckCircleIcon className="w-4 h-4 mr-2" />
                Trusted by 50,000+ professionals
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Find Your Dream Job or
              <span className="block bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Hire Top Talent
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Connect with opportunities that match your skills and aspirations. 
              Join thousands of professionals and companies already using JobPortal.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-3xl mx-auto mb-8">
              <div className="flex flex-col lg:flex-row gap-4 p-2 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                <div className="flex-1 relative">
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search for jobs, companies, or skills..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-lg"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  Search Jobs
                </button>
              </div>
            </form>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!user ? (
                <>
                  <Link
                    to="/register"
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-4 rounded-xl font-semibold text-lg inline-flex items-center justify-center transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    Get Started Free
                    <ArrowRightIcon className="w-5 h-5 ml-2" />
                  </Link>
                  <Link
                    to="/jobs"
                    className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/20 transition-all duration-200"
                  >
                    Browse Jobs
                  </Link>
                </>
              ) : (
                <Link
                  to="/dashboard"
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-4 rounded-xl font-semibold text-lg inline-flex items-center justify-center transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  Go to Dashboard
                  <ArrowRightIcon className="w-5 h-5 ml-2" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="container-responsive">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container-responsive">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Featured Opportunities
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover the latest job openings from top companies around the world
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {featuredJobs.map((job, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                <div className="flex items-start justify-between mb-4">
                  <img 
                    src={job.logo} 
                    alt={job.company} 
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    {job.type}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h3>
                <p className="text-gray-600 mb-4">{job.company}</p>
                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-gray-500">
                    <MapPinIcon className="w-4 h-4 mr-2" />
                    {job.location}
                  </div>
                  <div className="flex items-center text-gray-500">
                    <CurrencyDollarIcon className="w-4 h-4 mr-2" />
                    {job.salary}
                  </div>
                </div>
                                 <Link
                   to={`/jobs/${index + 1}/apply`}
                   className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 text-center block"
                 >
                   Apply Now
                 </Link>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link
              to="/jobs"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold text-lg"
            >
              View All Jobs
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container-responsive">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why Choose JobPortal?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We provide the tools and platform you need to succeed in your career or find the perfect candidate for your team.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            {features.map((feature, index) => (
              <div key={index} className="group">
                <div className="relative overflow-hidden rounded-2xl mb-6">
                  <img 
                    src={feature.image} 
                    alt={feature.title}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container-responsive">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600">
              Don't just take our word for it. Here's what our community has to say.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center mb-6">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover mr-4"
                  />
                  <div>
                    <div className="font-semibold text-gray-900 text-lg">
                      {testimonial.name}
                    </div>
                    <div className="text-gray-500">
                      {testimonial.role} at {testimonial.company}
                    </div>
                  </div>
                </div>
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 italic text-lg leading-relaxed">
                  "{testimonial.content}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/5"></div>
        </div>
        <div className="relative container-responsive text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Join thousands of professionals and companies who have already found success with JobPortal.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!user ? (
              <>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-4 rounded-xl font-semibold text-lg inline-flex items-center justify-center transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  Create Account
                  <ArrowRightIcon className="w-5 h-5 ml-2" />
                </Link>
                <Link
                  to="/jobs"
                  className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/20 transition-all duration-200"
                >
                  Explore Jobs
                </Link>
              </>
            ) : (
              <Link
                to="/dashboard"
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-4 rounded-xl font-semibold text-lg inline-flex items-center justify-center transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Go to Dashboard
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
