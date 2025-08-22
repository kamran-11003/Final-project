import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { jobsAPI } from '../../services/api';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  BriefcaseIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const JobList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  // Get current search parameters
  const search = searchParams.get('search') || '';
  const location = searchParams.get('location') || '';
  const type = searchParams.get('type') || '';
  const experience = searchParams.get('experience') || '';
  const page = parseInt(searchParams.get('page')) || 1;

  // Fetch jobs
  const { data: jobsData, isLoading, error } = useQuery({
    queryKey: ['jobs', search, location, type, experience, page],
    queryFn: () => {
      // Filter out empty values
      const params = {};
      if (search && search.trim()) params.search = search;
      if (location && location.trim()) params.location = location;
      if (type && type.trim()) params.type = type;
      if (experience && experience.trim()) params.experience = experience;
      params.page = page;
      
      return jobsAPI.getJobs(params);
    },
    placeholderData: (previousData) => previousData
  });

  const handleSearch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newSearch = formData.get('search');
    const newLocation = formData.get('location');
    const newType = formData.get('type');
    const newExperience = formData.get('experience');

    const params = new URLSearchParams();
    if (newSearch) params.set('search', newSearch);
    if (newLocation) params.set('location', newLocation);
    if (newType) params.set('type', newType);
    if (newExperience) params.set('experience', newExperience);
    params.set('page', '1');

    setSearchParams(params);
  };

  const handleFilterChange = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
  };

  const getJobTypeColor = (type) => {
    const colors = {
      'full-time': 'bg-green-100 text-green-800',
      'part-time': 'bg-blue-100 text-blue-800',
      'contract': 'bg-purple-100 text-purple-800',
      'internship': 'bg-orange-100 text-orange-800',
      'freelance': 'bg-indigo-100 text-indigo-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getExperienceColor = (exp) => {
    const colors = {
      'entry': 'bg-green-100 text-green-800',
      'junior': 'bg-blue-100 text-blue-800',
      'mid': 'bg-yellow-100 text-yellow-800',
      'senior': 'bg-orange-100 text-orange-800',
      'lead': 'bg-purple-100 text-purple-800',
      'executive': 'bg-red-100 text-red-800'
    };
    return colors[exp] || 'bg-gray-100 text-gray-800';
  };

  if (error) {
    return (
      <div className="container-responsive py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Jobs</h2>
          <p className="text-gray-600">Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-responsive py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Dream Job</h1>
        <p className="text-gray-600">
          {jobsData?.pagination?.total || 0} jobs available
        </p>
      </div>

      {/* Search and Filters */}
      <div className="card mb-8">
        <div className="card-body">
          <form onSubmit={handleSearch} className="space-y-4">
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="search"
                  defaultValue={search}
                  placeholder="Search for jobs, companies, or skills..."
                  className="input pl-10"
                />
              </div>
              <div className="flex-1 relative">
                <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="location"
                  defaultValue={location}
                  placeholder="Location"
                  className="input pl-10"
                />
              </div>
              <button
                type="submit"
                className="btn-primary px-8"
              >
                Search
              </button>
            </div>

            {/* Advanced Filters */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center text-sm text-gray-600 hover:text-gray-900"
              >
                <FunnelIcon className="w-4 h-4 mr-1" />
                Advanced Filters
              </button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <label className="form-label">Job Type</label>
                  <select
                    name="type"
                    defaultValue={type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    className="input"
                  >
                    <option value="">All Types</option>
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                    <option value="freelance">Freelance</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Experience Level</label>
                  <select
                    name="experience"
                    defaultValue={experience}
                    onChange={(e) => handleFilterChange('experience', e.target.value)}
                    className="input"
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
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Jobs List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="spinner w-12 h-12"></div>
        </div>
      ) : jobsData?.jobs?.length > 0 ? (
        <div className="space-y-6">
          {jobsData.jobs.map((job) => (
            <div key={job._id} className="card hover-lift hover-glow">
              <div className="card-body">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {job.employer?.company?.logo ? (
                        <img
                          src={job.employer.company.logo}
                          alt={job.employer.company.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <BriefcaseIcon className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          <Link to={`/jobs/${job._id}`} className="hover:text-primary-600">
                            {job.title}
                          </Link>
                        </h3>
                        <p className="text-gray-600">{job.employer?.company?.name}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                      <div className="flex items-center">
                        <MapPinIcon className="w-4 h-4 mr-1" />
                        {job.location}
                      </div>
                      <div className="flex items-center">
                        <CurrencyDollarIcon className="w-4 h-4 mr-1" />
                        ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()}
                      </div>
                      <div className="flex items-center">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        {job.type}
                      </div>
                    </div>

                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {job.description.substring(0, 200)}...
                    </p>

                    <div className="flex items-center space-x-2 mb-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getJobTypeColor(job.type)}`}>
                        {job.type}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getExperienceColor(job.experience)}`}>
                        {job.experience}
                      </span>
                      {job.isRemote && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Remote
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        Posted {new Date(job.createdAt).toLocaleDateString()}
                      </div>
                      <Link
                        to={`/jobs/${job._id}`}
                        className="btn-primary btn-sm"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <BriefcaseIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
          <p className="text-gray-600">
            Try adjusting your search criteria or check back later for new opportunities.
          </p>
        </div>
      )}

      {/* Pagination */}
      {jobsData?.pagination && jobsData.pagination.pages > 1 && (
        <div className="mt-8 flex items-center justify-center">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="btn-outline btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {Array.from({ length: jobsData.pagination.pages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`btn-sm ${
                  pageNum === page
                    ? 'btn-primary'
                    : 'btn-outline'
                }`}
              >
                {pageNum}
              </button>
            ))}
            
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === jobsData.pagination.pages}
              className="btn-outline btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default JobList;
