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
  StarIcon
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
      description: 'Browse thousands of job opportunities and find the perfect match for your skills and career goals.'
    },
    {
      icon: BuildingOfficeIcon,
      title: 'Hire Top Talent',
      description: 'Post job openings and connect with qualified candidates to build your dream team.'
    },
    {
      icon: UserGroupIcon,
      title: 'Build Your Network',
      description: 'Connect with professionals in your industry and expand your professional network.'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Active Jobs' },
    { number: '50,000+', label: 'Job Seekers' },
    { number: '5,000+', label: 'Companies' },
    { number: '95%', label: 'Success Rate' }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Software Engineer',
      company: 'TechCorp',
      content: 'JobPortal helped me find my dream job in just 2 weeks. The platform is incredibly user-friendly and the job matching is spot-on!',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'HR Manager',
      company: 'InnovateTech',
      content: 'As an employer, JobPortal has been invaluable for finding top talent. The quality of candidates and ease of the hiring process is outstanding.',
      rating: 5
    },
    {
      name: 'Emily Rodriguez',
      role: 'Marketing Specialist',
      company: 'GrowthCo',
      content: 'The application process is so smooth and the platform keeps me updated on my application status. Highly recommended!',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative container-responsive py-24 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Find Your Dream Job or
              <span className="block text-yellow-300">Hire Top Talent</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              Connect with opportunities that match your skills and aspirations. 
              Join thousands of professionals and companies already using JobPortal.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search for jobs, companies, or skills..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 text-gray-900 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="btn-primary btn-lg whitespace-nowrap"
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
                    className="btn-success btn-lg inline-flex items-center"
                  >
                    Get Started
                    <ArrowRightIcon className="w-5 h-5 ml-2" />
                  </Link>
                  <Link
                    to="/jobs"
                    className="btn-outline btn-lg text-white border-white hover:bg-white hover:text-primary-600"
                  >
                    Browse Jobs
                  </Link>
                </>
              ) : (
                <Link
                  to="/dashboard"
                  className="btn-success btn-lg inline-flex items-center"
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
      <section className="py-16 bg-white">
        <div className="container-responsive">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container-responsive">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose JobPortal?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We provide the tools and platform you need to succeed in your career or find the perfect candidate for your team.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card hover-lift hover-glow p-8 text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="container-responsive">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600">
              Don't just take our word for it. Here's what our community has to say.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <div className="font-semibold text-gray-900">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {testimonial.role} at {testimonial.company}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="container-responsive text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 text-primary-100 max-w-2xl mx-auto">
            Join thousands of professionals and companies who have already found success with JobPortal.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!user ? (
              <>
                <Link
                  to="/register"
                  className="btn-success btn-lg inline-flex items-center"
                >
                  Create Account
                  <ArrowRightIcon className="w-5 h-5 ml-2" />
                </Link>
                <Link
                  to="/jobs"
                  className="btn-outline btn-lg text-white border-white hover:bg-white hover:text-primary-600"
                >
                  Explore Jobs
                </Link>
              </>
            ) : (
              <Link
                to="/dashboard"
                className="btn-success btn-lg inline-flex items-center"
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
