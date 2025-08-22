import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  const [showApplyModal, setShowApplyModal] = useState(false);
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

  // Fetch job details
  const { data: job, isLoading, error } = useQuery({
    queryKey: ['job', id],
    queryFn: () => jobsAPI.getJob(id)
  });

  // Check if user has already applied for this job
  const { data: existingApplication, error: applicationCheckError } = useQuery({
    queryKey: ['application', id, user?.id],
    queryFn: () => applicationsAPI.checkApplication(id),
    enabled: !!user && !!id,
    onSuccess: (data) => {
      console.log('Application check result:', data);
    },
    onError: (error) => {
      console.error('Application check error:', error);
      // If error, assume no application exists
      return null;
    }
  });

  // Apply for job mutation
  const applyMutation = useMutation({
    mutationFn: applicationsAPI.applyForJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['application', id, user?.id] });
      setAppliedJobs(prev => new Set([...prev, job._id]));
      toast.success('Application submitted successfully!');
      setShowApplyModal(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to submit application');
    }
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
  const handleQuickApply = async () => {
    if (!user) {
      toast.error('Please log in to apply for jobs');
      return;
    }
    
    if (appliedJobs.has(job._id)) {
      toast.error('You have already applied for this job');
      return;
    }

    // Check if user has a CV uploaded
    if (!user.profile?.resume) {
      toast.error('Please upload your CV/Resume in your profile before applying for jobs');
      navigate('/profile');
      return;
    }

    try {
      // Submit application with default cover letter
      const applicationData = {
        jobId: job._id,
        coverLetter: `I am interested in the ${job.title} position at ${job.company?.name || job.employer?.company?.name}. I believe my skills and experience make me a strong candidate for this role.`,
        expectedSalary: null,
        availability: 'immediate'
      };

      await applyMutation.mutateAsync(applicationData);
      
      // Add to applied jobs for instant feedback
      setAppliedJobs(prev => new Set([...prev, job._id]));
      
      // Invalidate the application check query
      queryClient.invalidateQueries({ queryKey: ['application', id, user?.id] });
      
      toast.success('Application submitted successfully!');
    } catch (error) {
      toast.error('Failed to submit application. Please try again.');
    }
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
  const hasApplied = existingApplication?.hasApplied || appliedJobs.has(job._id);
  console.log('Application status:', { existingApplication, hasApplied, jobId: job?._id });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/jobs')}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to Jobs
        </button>

        <div className="bg-white rounded-lg shadow">
          {/* Job Header */}
          <div className="p-6 border-b border-gray-200">
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
                  <h1 className="text-3xl font-bold text-gray-900">
                    {job.title}
                  </h1>
                  {/* FEATURE 2: Hot Job Badge */}
                  {isHot && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <BoltIconSolid className="h-3 w-3 mr-1" />
                      Hot Job
                    </span>
                  )}
                </div>

                <div className="flex items-center text-gray-600 mb-4">
                  <BuildingOfficeIcon className="h-5 w-5 mr-2" />
                  <span className="mr-4">{job.company?.name || job.employer?.company?.name || 'Unknown Company'}</span>
                  <MapPinIcon className="h-5 w-5 mr-2" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                    <span>{formatSalary(job.salary?.min, job.salary?.max)}</span>
                  </div>
                  <div className="flex items-center">
                    <BriefcaseIcon className="h-4 w-4 mr-1" />
                    <span className="capitalize">{job.type}</span>
                  </div>
                  <div className="flex items-center">
                    <UserIcon className="h-4 w-4 mr-1" />
                    <span className="capitalize">{job.experience}</span>
                  </div>
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    <span>Posted {formatDate(job.createdAt)}</span>
                  </div>
                  {/* FEATURE 2: View Counter */}
                  <div className="flex items-center">
                    <EyeIcon className="h-4 w-4 mr-1" />
                    <span>{views} views</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col space-y-2 ml-4">
                {user?.role === 'applicant' && (
                  <>
                    <button
                      onClick={() => handleSaveJob(job._id)}
                      className={`px-4 py-2 border rounded-lg transition-colors flex items-center justify-center ${
                        isSaved 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : 'text-blue-600 border-blue-600 hover:bg-blue-50'
                      }`}
                    >
                      {isSaved ? (
                        <>
                          <BookmarkIconSolid className="h-4 w-4 mr-1" />
                          Saved
                        </>
                      ) : (
                        <>
                          <BookmarkIcon className="h-4 w-4 mr-1" />
                          Save
                        </>
                      )}
                    </button>
                    {/* FEATURE 3: Quick Apply Button */}
                    <button
                      onClick={hasApplied ? () => toast.info('You have already applied for this job') : handleQuickApply}
                      disabled={hasApplied}
                      className={`px-6 py-3 rounded-lg transition-colors ${
                        hasApplied
                          ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {hasApplied ? 'Applied' : 'Quick Apply'}
                    </button>
                    {!hasApplied && (
                      <button
                        onClick={() => setShowApplyModal(true)}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Apply with Cover Letter
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Job Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h2>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
                  </div>
                </div>

                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h2>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">{job.requirements}</p>
                  </div>
                </div>

                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Responsibilities</h2>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">{job.responsibilities}</p>
                  </div>
                </div>

                {job.benefits && (
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Benefits</h2>
                    <div className="prose max-w-none">
                      <p className="text-gray-700 whitespace-pre-wrap">{job.benefits}</p>
                    </div>
                  </div>
                )}

                                 <div className="mb-8">
                   <h2 className="text-xl font-semibold text-gray-900 mb-4">Required Skills</h2>
                   <div className="flex flex-wrap gap-2">
                     {job.skills && job.skills.length > 0 ? (
                       job.skills.map((skill, index) => (
                         <span
                           key={index}
                           className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                         >
                           {skill}
                         </span>
                       ))
                     ) : (
                       <p className="text-gray-500">No specific skills listed</p>
                     )}
                   </div>
                 </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-lg p-6 sticky top-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Overview</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Company</label>
                      <p className="text-gray-900">{job.company?.name || job.employer?.company?.name || 'Unknown Company'}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600">Location</label>
                      <p className="text-gray-900">{job.location}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600">Job Type</label>
                      <p className="text-gray-900 capitalize">{job.type}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600">Experience Level</label>
                      <p className="text-gray-900 capitalize">{job.experience}</p>
                    </div>
                    
                                         <div>
                       <label className="text-sm font-medium text-gray-600">Salary Range</label>
                       <p className="text-gray-900">{formatSalary(job.salary?.min, job.salary?.max)}</p>
                     </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600">Posted Date</label>
                      <p className="text-gray-900">{formatDate(job.createdAt)}</p>
                    </div>
                    
                    {/* FEATURE 2: View Counter in Sidebar */}
                    <div>
                      <label className="text-sm font-medium text-gray-600">Views</label>
                      <p className="text-gray-900">{views} views</p>
                    </div>
                    
                    {job.deadline && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Application Deadline</label>
                        <p className="text-gray-900">{formatDate(job.deadline)}</p>
                      </div>
                    )}
                  </div>

                  {user?.role === 'applicant' && !hasApplied && (
                    <div className="mt-6 space-y-2">
                      <button
                        onClick={handleQuickApply}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Quick Apply
                      </button>
                      <button
                        onClick={() => setShowApplyModal(true)}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Apply with Cover Letter
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Apply Modal */}
        {showApplyModal && (
          <ApplyModal
            job={job}
            user={user}
            onClose={() => setShowApplyModal(false)}
            onSubmit={applyMutation.mutate}
            isLoading={applyMutation.isLoading}
          />
        )}
      </div>
    </div>
  );
};

// Apply Modal Component
const ApplyModal = ({ job, user, onClose, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    coverLetter: '',
    expectedSalary: '',
    availability: 'immediate'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Check if user has a CV uploaded in their profile
    if (!user.profile?.resume) {
      alert('Please upload your CV/Resume in your profile before applying for jobs. You will be redirected to your profile page.');
      window.location.href = '/profile';
      return;
    }
    
    // Validate required fields
    if (!formData.coverLetter.trim()) {
      alert('Please write a cover letter');
      return;
    }
    
    onSubmit({
      jobId: job._id,
      coverLetter: formData.coverLetter,
      expectedSalary: formData.expectedSalary ? parseInt(formData.expectedSalary) : null,
      availability: formData.availability
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Apply for {job.title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Letter *
              </label>
              <textarea
                required
                value={formData.coverLetter}
                onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Write a cover letter explaining why you're interested in this position and why you'd be a great fit..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CV/Resume
              </label>
              <div className="p-3 bg-gray-50 rounded-lg border">
                <div className="flex items-center text-sm text-gray-600">
                  <DocumentTextIcon className="w-4 h-4 mr-2" />
                  <span>Using CV from your profile</span>
                  {!user.profile?.resume && (
                    <span className="ml-2 text-red-600">(No CV uploaded - please upload in your profile first)</span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expected Salary (optional)
                </label>
                <input
                  type="number"
                  value={formData.expectedSalary}
                  onChange={(e) => setFormData({ ...formData, expectedSalary: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter expected salary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Availability
                </label>
                <select
                  value={formData.availability}
                  onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="immediate">Immediate</option>
                  <option value="2-weeks">2 weeks notice</option>
                  <option value="1-month">1 month notice</option>
                  <option value="3-months">3 months notice</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Submitting...' : 'Submit Application'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;
