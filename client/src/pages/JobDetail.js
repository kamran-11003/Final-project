import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobsAPI, applicationsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { 
  MapPinIcon, 
  CurrencyDollarIcon,
  BriefcaseIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  ArrowLeftIcon,
  UserIcon,
  EyeIcon,
  BookmarkIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { 
  BoltIcon as BoltIconSolid,
  CheckCircleIcon as CheckCircleIconSolid,
  BookmarkIcon as BookmarkIconSolid
} from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
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

  // Fetch job details
  const { data: job, isLoading, error } = useQuery({
    queryKey: ['job', id],
    queryFn: () => jobsAPI.getJob(id)
  });



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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // FEATURE 1: Application Status Badge - uses localStorage
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

  const handleSaveJob = (jobId) => {
    setSavedJobs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) {
        newSet.delete(jobId);
        toast.success('Job removed from saved jobs');
      } else {
        newSet.add(jobId);
        toast.success('Job saved successfully!');
      }
      return newSet;
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-red-600 text-lg">Error loading job details</div>
            <button 
              onClick={() => navigate('/jobs')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Jobs
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-gray-600 text-lg">Job not found</div>
            <button 
              onClick={() => navigate('/jobs')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Jobs
            </button>
          </div>
        </div>
      </div>
    );
  }

  const applicationStatus = getApplicationStatus(job._id);
  const { views, isHot } = getViewCount(job);
  const isSaved = savedJobs.has(job._id);
  const hasApplied = appliedJobs.has(job._id);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/jobs')}
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Back to Jobs
        </button>

        {/* Job Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
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
                <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
                {/* FEATURE 2: Hot Job Badge */}
                {isHot && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <BoltIconSolid className="h-3 w-3 mr-1" />
                    Hot Job
                  </span>
                )}
              </div>
              
              <div className="flex items-center text-gray-600 mb-4">
                <BuildingOfficeIcon className="h-5 w-5 mr-2" />
                <span className="mr-6 font-medium">{job.company?.name || job.employer?.company?.name || 'Unknown Company'}</span>
                <MapPinIcon className="h-5 w-5 mr-2" />
                <span className="mr-6">{job.location}</span>
                <CalendarIcon className="h-5 w-5 mr-2" />
                <span className="capitalize">{job.type}</span>
              </div>

              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                  <span className="font-medium">{formatSalary(job.salary?.min, job.salary?.max, job.salary?.currency)}</span>
                </div>
                <div className="flex items-center">
                  <EyeIcon className="h-4 w-4 mr-2" />
                  <span>{views} views</span>
                </div>
                <div className="flex items-center">
                  <DocumentTextIcon className="h-4 w-4 mr-2" />
                  <span className="capitalize">{job.experience} level</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 ml-6">
              {user?.role === 'applicant' ? (
                <>
                  <button 
                    onClick={() => handleSaveJob(job._id)}
                    className={`p-3 rounded-lg transition-all duration-200 ${
                      isSaved 
                        ? 'bg-blue-600 text-white shadow-lg' 
                        : 'text-blue-600 border border-blue-600 hover:bg-blue-50'
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
                      className="px-6 py-3 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                    >
                      Applied
                    </button>
                  ) : (
                    <Link
                      to={`/jobs/${job._id}/apply`}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 text-center block"
                    >
                      Apply Now
                    </Link>
                  )}
                </>
              ) : (
                <button 
                  onClick={() => window.location.href = `/jobs/${job._id}`}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View Details
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Job Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h2>
              <div className="prose max-w-none text-gray-700 leading-relaxed">
                {job.description}
              </div>
            </div>

            {job.requirements && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h2>
                <div className="prose max-w-none text-gray-700 leading-relaxed">
                  {job.requirements}
                </div>
              </div>
            )}

            {job.responsibilities && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Responsibilities</h2>
                <div className="prose max-w-none text-gray-700 leading-relaxed">
                  {job.responsibilities}
                </div>
              </div>
            )}

            {job.benefits && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Benefits</h2>
                <div className="prose max-w-none text-gray-700 leading-relaxed">
                  {job.benefits}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Summary</h3>
              
              <div className="space-y-4">
                <div className="flex items-center text-gray-600">
                  <MapPinIcon className="h-5 w-5 mr-3 text-blue-500" />
                  <span>{job.location}</span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <CurrencyDollarIcon className="h-5 h-5 mr-3 text-green-500" />
                  <span>{formatSalary(job.salary?.min, job.salary?.max, job.salary?.currency)}</span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <CalendarIcon className="h-5 w-5 mr-3 text-purple-500" />
                  <span className="capitalize">{job.type}</span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <DocumentTextIcon className="h-5 w-5 mr-3 text-orange-500" />
                  <span className="capitalize">{job.experience} level</span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <BriefcaseIcon className="h-5 w-5 mr-3 text-indigo-500" />
                  <span>{job.company?.name || job.employer?.company?.name || 'Unknown Company'}</span>
                </div>
              </div>

              {job.skills && job.skills.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Required Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  <p>Posted on {formatDate(job.createdAt)}</p>
                  <p>Job ID: {job._id}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;
