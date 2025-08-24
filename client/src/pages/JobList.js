import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { jobsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  MapPinIcon, 
  CurrencyDollarIcon,
  BriefcaseIcon,
  ClockIcon,
  StarIcon,
  EyeIcon,
  BookmarkIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { 
  BoltIcon as BoltIconSolid,
  CheckCircleIcon as CheckCircleIconSolid,
  BookmarkIcon as BookmarkIconSolid
} from '@heroicons/react/24/solid';

const JobList = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    type: '',
    experience: '',
    salaryMin: '',
    salaryMax: ''
  });

  const [sortBy, setSortBy] = useState('date');
  const [currentPage, setCurrentPage] = useState(1);
  const [jobsPerPage] = useState(10);
  const [savedJobs, setSavedJobs] = useState(new Set());
  const [appliedJobs, setAppliedJobs] = useState(new Set());

  // Load saved and applied jobs from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedJobs');
    const applied = localStorage.getItem('appliedJobs');
    if (saved) setSavedJobs(new Set(JSON.parse(saved)));
    if (applied) setAppliedJobs(new Set(JSON.parse(applied)));
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem('savedJobs', JSON.stringify([...savedJobs]));
  }, [savedJobs]);

  useEffect(() => {
    localStorage.setItem('appliedJobs', JSON.stringify([...appliedJobs]));
  }, [appliedJobs]);

  // Fetch jobs with filters
  const { data: jobsData, isLoading, error } = useQuery({
    queryKey: ['jobs', filters, sortBy, currentPage],
    queryFn: async () => {
      // Filter out empty values
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([key, value]) => value && value.trim() !== '')
      );
      
      const response = await jobsAPI.getJobs({
        ...cleanFilters,
        sortBy,
        page: currentPage,
        limit: jobsPerPage
      });
      return response.data || response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  const jobs = jobsData?.data?.jobs || jobsData?.jobs || [];
  const totalJobs = jobsData?.data?.pagination?.total || jobsData?.pagination?.total || 0;
  const totalPages = Math.ceil(totalJobs / jobsPerPage);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      location: '',
      type: '',
      experience: '',
      salaryMin: '',
      salaryMax: ''
    });
    setCurrentPage(1);
  };

  const formatSalary = (min, max, currency = 'USD') => {
    const formatNumber = (num) => {
      if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
      if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
      return `$${num}`;
    };
    
    if (min && max) return `${formatNumber(min)} - ${formatNumber(max)}`;
    if (min) return `${formatNumber(min)}+`;
    if (max) return `Up to ${formatNumber(max)}`;
    return 'Salary not specified';
  };

  const getExperienceColor = (experience) => {
    const colors = {
      'entry': 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800',
      'junior': 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800',
      'mid': 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800',
      'senior': 'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800',
      'lead': 'bg-gradient-to-r from-red-100 to-red-200 text-red-800',
      'executive': 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800'
    };
    return colors[experience] || 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800';
  };

  // FEATURE 1: Application Status Badge - uses localStorage
  const getApplicationStatus = (jobId) => {
    if (appliedJobs.has(jobId)) {
      return {
        status: 'applied',
        text: 'Applied',
        color: 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800',
        icon: CheckCircleIconSolid
      };
    }
    return null;
  };

  // FEATURE 2: View Counter with Hot Job Badge
  const getViewCount = (job) => {
    const views = job.views || Math.floor(Math.random() * 500) + 50; // Mock data
    const isHot = views > 200;
    return { views, isHot };
  };

  const handleSaveJob = (jobId) => {
    setSavedJobs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) {
        newSet.delete(jobId);
      } else {
        newSet.add(jobId);
      }
      return newSet;
    });
  };

  // Function to mark job as applied (called from ApplicationForm)
  const markJobAsApplied = (jobId) => {
    setAppliedJobs(prev => new Set([...prev, jobId]));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
        <div className="container-responsive">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded-2xl w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="h-12 bg-gray-200 rounded-xl"></div>
              <div className="h-12 bg-gray-200 rounded-xl"></div>
              <div className="h-12 bg-gray-200 rounded-xl"></div>
            </div>
            <div className="space-y-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
        <div className="container-responsive">
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="text-red-500 text-xl mb-2">Error loading jobs</div>
            <p className="text-gray-400">Please try refreshing the page</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="container-responsive">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Find Your Dream Job
          </h1>
          <p className="text-xl text-gray-600">
            Discover {totalJobs} opportunities that match your skills and aspirations
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Location */}
            <div className="relative">
              <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Location"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Job Type */}
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">All Types</option>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
              <option value="remote">Remote</option>
            </select>

            {/* Experience Level */}
            <select
              value={filters.experience}
              onChange={(e) => handleFilterChange('experience', e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">All Levels</option>
              <option value="entry">Entry Level</option>
              <option value="junior">Junior</option>
              <option value="mid">Mid Level</option>
              <option value="senior">Senior</option>
              <option value="lead">Lead</option>
              <option value="executive">Executive</option>
            </select>
          </div>

          {/* Salary Range */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="relative">
              <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                placeholder="Min Salary"
                value={filters.salaryMin}
                onChange={(e) => handleFilterChange('salaryMin', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div className="relative">
              <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                placeholder="Max Salary"
                value={filters.salaryMax}
                onChange={(e) => handleFilterChange('salaryMax', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <button
              onClick={clearFilters}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 flex items-center justify-center"
            >
              <FunnelIcon className="w-5 h-5 mr-2" />
              Clear Filters
            </button>
          </div>

          {/* Sort Options */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-gray-600 font-medium">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="date">Latest</option>
                <option value="salary">Salary</option>
                <option value="title">Title</option>
                <option value="company">Company</option>
              </select>
            </div>
          </div>
        </div>

        {/* Job Cards */}
        <div className="space-y-6">
          {jobs.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100">
              <SparklesIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <div className="text-gray-500 text-xl mb-2">No jobs found</div>
              <p className="text-gray-400">Try adjusting your filters or search criteria</p>
            </div>
          ) : (
            jobs.map((job) => {
              const applicationStatus = getApplicationStatus(job._id);
              const viewData = getViewCount(job);
              const isSaved = savedJobs.has(job._id);
              const hasApplied = appliedJobs.has(job._id);

              return (
                <div key={job._id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* FEATURE 1: Application Status Badge */}
                        {applicationStatus && (
                          <div className="flex items-center mb-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${applicationStatus.color}`}>
                              {React.createElement(applicationStatus.icon, { className: "h-4 w-4 mr-2" })}
                              {applicationStatus.text}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600 cursor-pointer transition-colors duration-200">
                            {job.title}
                          </h3>
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${getExperienceColor(job.experience)}`}>
                            {job.experience}
                          </span>
                          {/* FEATURE 2: Hot Job Badge */}
                          {viewData.isHot && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-red-100 to-red-200 text-red-800">
                              <BoltIconSolid className="h-3 w-3 mr-1" />
                              Hot Job
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center text-gray-600 mb-4">
                          <BriefcaseIcon className="h-4 h-4 mr-2" />
                          <span className="mr-6 font-medium">{job.company?.name || job.employer?.company?.name || 'Unknown Company'}</span>
                          <MapPinIcon className="h-4 h-4 mr-2" />
                          <span className="mr-6">{job.location}</span>
                          <ClockIcon className="h-4 h-4 mr-2" />
                          <span className="capitalize">{job.type}</span>
                        </div>

                        <p className="text-gray-600 mb-6 line-clamp-2 leading-relaxed">
                          {job.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-6 text-sm text-gray-600">
                            <div className="flex items-center">
                              <CurrencyDollarIcon className="h-4 h-4 mr-2" />
                              <span className="font-medium">{formatSalary(job.salary?.min, job.salary?.max, job.salary?.currency)}</span>
                            </div>
                            {/* FEATURE 2: View Counter */}
                            <div className="flex items-center">
                              <EyeIcon className="h-4 h-4 mr-2" />
                              <span>{viewData.views} views</span>
                            </div>
                            <div className="flex items-center">
                              <StarIcon className="h-4 h-4 mr-2" />
                              <span>{job.skills && job.skills.length > 0 ? job.skills.slice(0, 3).join(', ') : 'No skills listed'}</span>
                            </div>
                          </div>
                          
                          <div className="flex space-x-3">
                            {user?.role === 'applicant' ? (
                              <>
                                <button 
                                  onClick={() => handleSaveJob(job._id)}
                                  className={`p-3 rounded-xl transition-all duration-200 ${
                                    isSaved 
                                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                                      : 'text-blue-600 border border-blue-600 hover:bg-blue-50 hover:scale-105'
                                  }`}
                                >
                                  {isSaved ? (
                                    <BookmarkIconSolid className="h-5 w-5" />
                                  ) : (
                                    <BookmarkIcon className="h-5 w-5" />
                                  )}
                                </button>
                                {/* Apply Button */}
                                {hasApplied ? (
                                  <button 
                                    disabled
                                    className="px-6 py-3 rounded-xl bg-gray-100 text-gray-500 cursor-not-allowed"
                                  >
                                    Applied
                                  </button>
                                ) : (
                                  <Link 
                                    to={`/jobs/${job._id}/apply`}
                                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                                  >
                                    Apply Now
                                  </Link>
                                )}
                              </>
                            ) : (
                              <button 
                                onClick={() => window.location.href = `/jobs/${job._id}`}
                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                              >
                                View Details
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center">
            <nav className="flex items-center space-x-3">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 text-sm border rounded-xl transition-all duration-200 ${
                    currentPage === page
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-blue-600 shadow-lg'
                      : 'border-gray-300 hover:bg-gray-50 hover:scale-105'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobList;
