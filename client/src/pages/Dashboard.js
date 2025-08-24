import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { applicationsAPI, jobsAPI } from '../services/api';
import { 
  BriefcaseIcon,
  DocumentTextIcon,
  UserGroupIcon,
  EyeIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { user, isAuthenticated, token } = useAuth();

  // Fetch data based on user role
  const { data: applicationsResponse, isLoading: applicationsLoading, error: applicationsError } = useQuery({
    queryKey: ['applications', user?.role],
    queryFn: async () => {
      try {
        if (user?.role === 'applicant') {
          const response = await applicationsAPI.getMyApplications({ limit: 5 });
          return response.data || response;
        } else if (user?.role === 'employer') {
          const response = await applicationsAPI.getEmployerApplications({ limit: 5 });
          return response.data || response;
        }
        return null;
      } catch (error) {
        console.error('Error fetching applications:', error);
        throw error;
      }
    },
    enabled: !!user,
    retry: 2,
    onError: (error) => {
      console.error('Error fetching applications:', error);
      console.error('Applications error response:', error.response?.data);
      console.error('Applications error status:', error.response?.status);
    },
    onSuccess: (data) => {
      console.log('Applications data received:', data);
      console.log('Applications data type:', typeof data);
      console.log('Applications data keys:', Object.keys(data || {}));
      console.log('Applications.applications:', data?.applications);
      console.log('Applications length:', data?.length);
    }
  });

  // Extract applications array from the response
  const applications = applicationsResponse?.applications || applicationsResponse || [];

  const { data: jobsResponse, isLoading: jobsLoading, error: jobsError } = useQuery({
    queryKey: ['jobs', user?.role],
    queryFn: async () => {
      try {
        if (user?.role === 'employer') {
          const response = await jobsAPI.getMyJobs({ limit: 5 });
          return response.data || response;
        }
        return null;
      } catch (error) {
        console.error('Error fetching jobs:', error);
        throw error;
      }
    },
    enabled: !!user && user?.role === 'employer',
    retry: 2,
    onError: (error) => {
      console.error('Error fetching jobs:', error);
      console.error('Jobs error response:', error.response?.data);
      console.error('Jobs error status:', error.response?.status);
    },
    onSuccess: (data) => {
      console.log('Jobs data received:', data);
      console.log('Jobs data type:', typeof data);
      console.log('Jobs data keys:', Object.keys(data || {}));
      console.log('Jobs.jobs:', data?.jobs);
      console.log('Jobs length:', data?.length);
    }
  });

  // Extract jobs array from the response
  const jobs = jobsResponse?.jobs || jobsResponse || [];

  const { data: statsResponse } = useQuery({
    queryKey: ['application-stats'],
    queryFn: async () => {
      try {
        const response = await applicationsAPI.getApplicationStats();
        return response.data || response;
      } catch (error) {
        console.error('Error fetching stats:', error);
        throw error;
      }
    },
    enabled: !!user,
    retry: 2
  });

  // Extract stats from the response
  const stats = statsResponse?.stats || statsResponse || {};

  const getStatusColor = (status) => {
    const colors = {
      applied: 'bg-blue-100 text-blue-800',
      reviewing: 'bg-yellow-100 text-yellow-800',
      shortlisted: 'bg-green-100 text-green-800',
      interviewed: 'bg-purple-100 text-purple-800',
      offered: 'bg-emerald-100 text-emerald-800',
      rejected: 'bg-red-100 text-red-800',
      withdrawn: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || colors.applied;
  };

  const getStatusIcon = (status) => {
    const icons = {
      applied: ClockIcon,
      reviewing: EyeIcon,
      shortlisted: CheckCircleIcon,
      interviewed: UserGroupIcon,
      offered: CheckCircleIcon,
      rejected: XCircleIcon,
      withdrawn: XCircleIcon
    };
    return icons[status] || ClockIcon;
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner w-12 h-12"></div>
      </div>
    );
  }

  return (
    <div className="container-responsive py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user.firstName}! 👋
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your {user.role === 'applicant' ? 'job search' : 'job postings'}.
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <DocumentTextIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.applied || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <EyeIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Under Review</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.reviewing || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Shortlisted</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.shortlisted || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <UserGroupIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Interviews</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.interviewed || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Applications */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Applications
              </h2>
              <Link
                to="/applications"
                className="text-sm text-primary-600 hover:text-primary-500 font-medium"
              >
                View all
              </Link>
            </div>
          </div>
          <div className="card-body">
            {applicationsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="spinner w-8 h-8"></div>
              </div>
            ) : applicationsError ? (
              <div className="text-center py-8">
                <div className="text-red-500 text-lg mb-2">Error loading applications</div>
                <p className="text-gray-400">Please try refreshing the page</p>
              </div>
            ) : (applications?.applications?.length > 0 || applications?.length > 0 || (Array.isArray(applications) && applications.length > 0)) ? (
              <div className="space-y-4">
                {(applications?.applications || (Array.isArray(applications) ? applications : []) || []).map((application) => {
                  const StatusIcon = getStatusIcon(application.status);
                  return (
                    <div key={application._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 ${getStatusColor(application.status)} rounded-full flex items-center justify-center`}>
                          <StatusIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {application.job?.title || 'Job Title Not Available'}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {user?.role === 'employer' 
                              ? `${application.applicant?.firstName} ${application.applicant?.lastName}`
                              : application.job?.company?.name || 'Unknown Company'
                            }
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                          {application.status}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(application.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {user.role === 'applicant' 
                    ? "You haven't applied to any jobs yet."
                    : "No applications received yet."
                  }
                </p>
                {user.role === 'applicant' && (
                  <Link
                    to="/jobs"
                    className="btn-primary btn-sm mt-4"
                  >
                    Browse Jobs
                  </Link>
                )}
                {user.role === 'employer' && (
                  <div className="text-xs text-gray-400 mt-2">
                    Debug: applications.length = {applications?.length || 0},
                    isArray = {Array.isArray(applications) ? 'true' : 'false'},
                    isAuthenticated = {isAuthenticated ? 'true' : 'false'},
                    hasToken = {token ? 'true' : 'false'}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Recent Jobs (Employers) or Quick Actions (Applicants) */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {user.role === 'employer' ? 'Recent Job Postings' : 'Quick Actions'}
              </h2>
              {user.role === 'employer' && (
                <Link
                  to="/jobs/post"
                  className="text-sm text-primary-600 hover:text-primary-500 font-medium"
                >
                  Post New Job
                </Link>
              )}
            </div>
          </div>
          <div className="card-body">
            {user.role === 'employer' ? (
              jobsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="spinner w-8 h-8"></div>
                </div>
              ) : jobsError ? (
                <div className="text-center py-8">
                  <div className="text-red-500 text-lg mb-2">Error loading jobs</div>
                  <p className="text-gray-400">Please try refreshing the page</p>
                </div>
              ) : (jobs?.jobs?.length > 0 || jobs?.length > 0 || (Array.isArray(jobs) && jobs.length > 0)) ? (
                <div className="space-y-4">
                  {(jobs?.jobs || (Array.isArray(jobs) ? jobs : []) || []).map((job) => (
                    <div key={job._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">{job.title}</h3>
                        <p className="text-sm text-gray-500">{job.location}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium job-type-${job.type}`}>
                            {job.type}
                          </span>
                          <span className="text-xs text-gray-500">
                            {job.applications || 0} applications
                          </span>
                        </div>
                      </div>
                      <Link
                        to={`/jobs/${job._id}`}
                        className="text-primary-600 hover:text-primary-500 text-sm font-medium"
                      >
                        View
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BriefcaseIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">You haven't posted any jobs yet.</p>
                  <Link
                    to="/jobs/post"
                    className="btn-primary btn-sm mt-4"
                  >
                    Post Your First Job
                  </Link>
                  <div className="text-xs text-gray-400 mt-2">
                    Debug: jobs.length = {jobs?.length || 0},
                    isArray = {Array.isArray(jobs) ? 'true' : 'false'},
                    isAuthenticated = {isAuthenticated ? 'true' : 'false'},
                    hasToken = {token ? 'true' : 'false'}
                  </div>
                </div>
              )
            ) : (
              <div className="space-y-4">
                <Link
                  to="/jobs"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <BriefcaseIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Browse Jobs</h3>
                    <p className="text-sm text-gray-500">Find your next opportunity</p>
                  </div>
                </Link>

                <Link
                  to="/profile"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <UserGroupIcon className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Update Profile</h3>
                    <p className="text-sm text-gray-500">Keep your profile current</p>
                  </div>
                </Link>

                <Link
                  to="/applications"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <DocumentTextIcon className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">View Applications</h3>
                    <p className="text-sm text-gray-500">Track your job applications</p>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-8">
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Activity Overview</h2>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Debug info */}
              <div className="col-span-3 text-xs text-gray-400 mb-4">
                Debug Stats: shortlisted = {stats?.shortlisted || 0}, 
                interviewed = {stats?.interviewed || 0}, 
                total = {stats?.total || 0}
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600 mb-2">
                  {user.role === 'applicant' ? '0' : (jobs?.length || 0)}
                </div>
                <p className="text-sm text-gray-600">
                  {user.role === 'applicant' ? 'Jobs Applied This Month' : 'Jobs Posted This Month'}
                </p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {stats?.shortlisted || 0}
                </div>
                <p className="text-sm text-gray-600">
                  {user.role === 'applicant' ? 'Applications Shortlisted' : 'Candidates Shortlisted'}
                </p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-2">
                  {stats?.interviewed || 0}
                </div>
                <p className="text-sm text-gray-600">
                  {user.role === 'applicant' ? 'Interviews Scheduled' : 'Interviews Conducted'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
