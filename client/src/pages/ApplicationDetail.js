import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { 
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ArrowLeftIcon,
  BriefcaseIcon,
  MapPinIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

const ApplicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [application, setApplication] = useState(null);
  const [job, setJob] = useState(null);
  const [applicant, setApplicant] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/applications/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setApplication(data.data);
          setSelectedStatus(data.data.status);
          
          // Fetch job details
          const jobResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/jobs/${data.data.jobId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
          });
          
          if (jobResponse.ok) {
            const jobData = await jobResponse.json();
            setJob(jobData.data);
          }

          // Fetch applicant details (for employers)
          if (user.role === 'employer') {
            const applicantResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/profile/${data.data.applicant}`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
              },
            });
            
            if (applicantResponse.ok) {
              const applicantData = await applicantResponse.json();
              setApplicant(applicantData.data);
            }
          }
        } else {
          toast.error('Failed to fetch application details');
          navigate('/applications');
        }
      } catch (error) {
        toast.error('Error fetching application details');
        navigate('/applications');
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplication();
  }, [id, user.role, navigate]);

  const handleStatusUpdate = async () => {
    if (!selectedStatus || selectedStatus === application.status) return;

    setIsUpdatingStatus(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/applications/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ status: selectedStatus }),
      });

      const result = await response.json();

      if (result.success) {
        setApplication(prev => ({ ...prev, status: selectedStatus }));
        toast.success('Application status updated successfully!');
      } else {
        toast.error(result.message || 'Failed to update status');
      }
    } catch (error) {
      toast.error('An error occurred while updating status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'applied':
        return 'bg-blue-100 text-blue-800';
      case 'reviewed':
        return 'bg-yellow-100 text-yellow-800';
      case 'shortlisted':
        return 'bg-purple-100 text-purple-800';
      case 'interview-scheduled':
        return 'bg-indigo-100 text-indigo-800';
      case 'interview-completed':
        return 'bg-orange-100 text-orange-800';
      case 'hired':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'withdrawn':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'hired':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'rejected':
        return <XCircleIcon className="w-4 h-4" />;
      default:
        return <ClockIcon className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Not Found</h2>
          <p className="text-gray-600 mb-4">The application you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/applications')}
            className="btn-primary"
          >
            Back to Applications
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500 mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            Back
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Application Details</h1>
              <p className="text-gray-600 mt-2">
                {user.role === 'employer' ? 'Reviewing application for' : 'Your application for'} {job?.title}
              </p>
            </div>
            
            {/* Status Badge */}
            <div className="mt-4 sm:mt-0">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                {getStatusIcon(application.status)}
                <span className="ml-1 capitalize">{application.status.replace('-', ' ')}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Information */}
            {job && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <BriefcaseIcon className="w-5 h-5 mr-2" />
                  Job Information
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{job.title}</h3>
                    <p className="text-gray-600">{job.company}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center text-gray-600">
                      <MapPinIcon className="w-4 h-4 mr-2" />
                      {job.location}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <ClockIcon className="w-4 h-4 mr-2" />
                      {job.type}
                    </div>
                    {job.salary && (
                      <div className="flex items-center text-gray-600">
                        <CurrencyDollarIcon className="w-4 h-4 mr-2" />
                        {job.salary.min} - {job.salary.max} {job.salary.currency}
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => navigate(`/jobs/${job._id}`)}
                    className="text-primary-600 hover:text-primary-500 text-sm font-medium"
                  >
                    View Job Details →
                  </button>
                </div>
              </div>
            )}

            {/* Application Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <DocumentTextIcon className="w-5 h-5 mr-2" />
                Application Details
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cover Letter</label>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-900 whitespace-pre-wrap">{application.coverLetter}</p>
                  </div>
                </div>

                {application.expectedSalary && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Expected Salary</label>
                    <p className="text-gray-900">{application.expectedSalary} {application.salaryCurrency || 'USD'}</p>
                  </div>
                )}

                {application.availability && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                    <p className="text-gray-900 capitalize">{application.availability}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Applied Date</label>
                    <p className="text-gray-900">
                      {new Date(application.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Updated</label>
                    <p className="text-gray-900">
                      {new Date(application.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Management (Employers Only) */}
            {user.role === 'employer' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Update Status</h2>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="input flex-1"
                  >
                    <option value="applied">Applied</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="interview-scheduled">Interview Scheduled</option>
                    <option value="interview-completed">Interview Completed</option>
                    <option value="hired">Hired</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  
                  <button
                    onClick={handleStatusUpdate}
                    disabled={isUpdatingStatus || selectedStatus === application.status}
                    className="btn-primary"
                  >
                    {isUpdatingStatus ? (
                      <div className="flex items-center">
                        <div className="spinner w-4 h-4 mr-2"></div>
                        Updating...
                      </div>
                    ) : (
                      'Update Status'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Applicant Information (Employers Only) */}
            {user.role === 'employer' && applicant && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <UserIcon className="w-5 h-5 mr-2" />
                  Applicant Information
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900">{applicant.name}</h3>
                    <p className="text-gray-600">{applicant.email}</p>
                  </div>
                  
                  {applicant.phone && (
                    <div className="flex items-center text-gray-600">
                      <PhoneIcon className="w-4 h-4 mr-2" />
                      {applicant.phone}
                    </div>
                  )}
                  
                  {applicant.location && (
                    <div className="flex items-center text-gray-600">
                      <MapPinIcon className="w-4 h-4 mr-2" />
                      {applicant.location}
                    </div>
                  )}
                  
                  {applicant.resume && (
                    <a
                      href={applicant.resume}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-primary-600 hover:text-primary-500 text-sm font-medium"
                    >
                      <EyeIcon className="w-4 h-4 mr-1" />
                      View Resume
                    </a>
                  )}
                  
                  <button
                    onClick={() => navigate(`/users/profile/${applicant._id}`)}
                    className="w-full btn-secondary"
                  >
                    View Full Profile
                  </button>
                </div>
              </div>
            )}

            {/* Application Timeline */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Application Timeline</h2>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Application Submitted</p>
                    <p className="text-sm text-gray-500">
                      {new Date(application.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
                
                {application.status !== 'applied' && (
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Status Updated</p>
                      <p className="text-sm text-gray-500">
                        {new Date(application.updatedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/applications')}
                  className="w-full btn-secondary"
                >
                  Back to Applications
                </button>
                
                {user.role === 'employer' && (
                  <button
                    onClick={() => navigate(`/jobs/${job?._id}`)}
                    className="w-full btn-secondary"
                  >
                    View Job Posting
                  </button>
                )}
                
                {user.role === 'applicant' && (
                  <button
                    onClick={() => navigate(`/jobs/${job?._id}`)}
                    className="w-full btn-secondary"
                  >
                    View Job Details
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetail;
