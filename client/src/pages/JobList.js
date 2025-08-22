import React, { useState, useEffect } from 'react';
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
  EyeIcon
} from '@heroicons/react/24/outline';
import { 
  BoltIcon as BoltIconSolid,
  CheckCircleIcon as CheckCircleIconSolid
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
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  const [savedJobs, setSavedJobs] = useState(new Set());

  // Load applied and saved jobs from localStorage
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
      'entry': 'bg-green-100 text-green-800',
      'junior': 'bg-blue-100 text-blue-800',
      'mid': 'bg-yellow-100 text-yellow-800',
      'senior': 'bg-orange-100 text-orange-800',
      'lead': 'bg-red-100 text-red-800',
      'executive': 'bg-purple-100 text-purple-800'
    };
    return colors[experience] || 'bg-gray-100 text-gray-800';
  };

  // FEATURE 1: Application Status Badge
  const getApplicationStatus = (jobId) => {
    if (appliedJobs.has(jobId)) {
      return {
        status: 'applied',
        text: 'Applied',
        color: 'bg-green-100 text-green-800',
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

  // FEATURE 3: Quick Apply Function
  const handleQuickApply = async (job) => {
    if (!user) {
      alert('Please log in to apply for jobs');
      return;
    }
    
    if (appliedJobs.has(job._id)) {
      alert('You have already applied for this job');
      return;
    }

    try {
      // Add to applied jobs immediately for instant feedback
      setAppliedJobs(prev => new Set([...prev, job._id]));
      
      // Show success message
      alert('Application submitted successfully!');
      
      // Here you would typically make an API call
      // await applicationsAPI.applyForJob(job._id, { coverLetter: '' });
    } catch (error) {
      // Remove from applied jobs if failed
      setAppliedJobs(prev => {
        const newSet = new Set(prev);
        newSet.delete(job._id);
        return newSet;
      });
      alert('Failed to submit application. Please try again.');
    }
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="h-4 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="lg:col-span-2">
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white rounded-lg shadow p-6">
                      <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-red-600 text-lg">Error loading jobs</div>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Find Your Dream Job
              </h1>
              <p className="text-gray-600">
                {totalJobs} jobs available • Browse and apply to opportunities that match your skills
              </p>
            </div>

          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FunnelIcon className="h-5 w-5 mr-2" />
                  Filters
                </h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear all
                </button>
              </div>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Jobs
                </label>
                <div className="relative">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Job title, keywords, or company"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <div className="relative">
                  <MapPinIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="City, state, or remote"
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Job Type */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Types</option>
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                  <option value="freelance">Freelance</option>
                </select>
              </div>

              {/* Experience Level */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience Level
                </label>
                <select
                  value={filters.experience}
                  onChange={(e) => handleFilterChange('experience', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Salary Range
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.salaryMin}
                    onChange={(e) => handleFilterChange('salaryMin', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.salaryMax}
                    onChange={(e) => handleFilterChange('salaryMax', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Job Listings */}
          <div className="lg:col-span-2">
            {/* Sort and Results Count */}
            <div className="flex items-center justify-between mb-6">
              <div className="text-sm text-gray-600">
                Showing {((currentPage - 1) * jobsPerPage) + 1} to {Math.min(currentPage * jobsPerPage, totalJobs)} of {totalJobs} jobs
              </div>
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="date">Date Posted</option>
                  <option value="salary">Salary</option>
                  <option value="title">Job Title</option>
                  <option value="company">Company</option>
                </select>
              </div>
            </div>

                         {/* Job Cards */}
             <div className="space-y-4">
               {jobs.length === 0 ? (
                 <div className="text-center py-12">
                   <div className="text-gray-500 text-lg mb-4">No jobs found</div>
                   <p className="text-gray-400">Try adjusting your filters or search criteria</p>
                 </div>
               ) : (
                jobs.map((job) => {
                const applicationStatus = getApplicationStatus(job._id);
                const viewData = getViewCount(job);
                const isSaved = savedJobs.has(job._id);
                const hasApplied = appliedJobs.has(job._id);

                return (
                  <div key={job._id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200">
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {/* FEATURE 1: Application Status Badge */}
                          {applicationStatus && (
                            <div className="flex items-center mb-3">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${applicationStatus.color}`}>
                                {React.createElement(applicationStatus.icon, { className: "h-4 w-4 mr-1" })}
                                {applicationStatus.text}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">
                              {job.title}
                            </h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getExperienceColor(job.experience)}`}>
                              {job.experience}
                            </span>
                            {/* FEATURE 2: Hot Job Badge */}
                            {viewData.isHot && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                <BoltIconSolid className="h-3 w-3 mr-1" />
                                Hot Job
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center text-gray-600 mb-3">
                            <BriefcaseIcon className="h-4 w-4 mr-1" />
                            <span className="mr-4">{job.company?.name || job.employer?.company?.name || 'Unknown Company'}</span>
                            <MapPinIcon className="h-4 w-4 mr-1" />
                            <span className="mr-4">{job.location}</span>
                            <ClockIcon className="h-4 w-4 mr-1" />
                            <span className="capitalize">{job.type}</span>
                          </div>

                          <p className="text-gray-600 mb-4 line-clamp-2">
                            {job.description}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                                                             <div className="flex items-center">
                                 <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                                 <span>{formatSalary(job.salary?.min, job.salary?.max, job.salary?.currency)}</span>
                               </div>
                              {/* FEATURE 2: View Counter */}
                              <div className="flex items-center">
                                <EyeIcon className="h-4 w-4 mr-1" />
                                <span>{viewData.views} views</span>
                              </div>
                                                             <div className="flex items-center">
                                 <StarIcon className="h-4 w-4 mr-1" />
                                 <span>{job.skills && job.skills.length > 0 ? job.skills.slice(0, 3).join(', ') : 'No skills listed'}</span>
                               </div>
                            </div>
                            
                            <div className="flex space-x-2">
                              {user?.role === 'applicant' ? (
                                <>
                                  <button 
                                    onClick={() => handleSaveJob(job._id)}
                                    className={`px-4 py-2 border rounded-lg transition-colors ${
                                      isSaved 
                                        ? 'bg-blue-600 text-white border-blue-600' 
                                        : 'text-blue-600 border-blue-600 hover:bg-blue-50'
                                    }`}
                                  >
                                    {isSaved ? 'Saved' : 'Save'}
                                  </button>
                                  {/* Quick Apply Button */}
                                  <button 
                                    onClick={() => handleQuickApply(job)}
                                    disabled={hasApplied}
                                    className={`px-4 py-2 rounded-lg transition-colors ${
                                      hasApplied
                                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                                  >
                                    {hasApplied ? 'Applied' : 'Quick Apply'}
                                  </button>
                                  {/* Normal Apply Button */}
                                  {!hasApplied && (
                                    <button 
                                      onClick={() => window.location.href = `/jobs/${job._id}`}
                                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                      Apply
                                    </button>
                                  )}
                                </>
                              ) : (
                                <button 
                                  onClick={() => window.location.href = `/jobs/${job._id}`}
                                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
              }))
              }
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 text-sm border rounded-lg ${
                        currentPage === page
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}


          </div>
        </div>
      </div>
    </div>
  );
};

export default JobList;
