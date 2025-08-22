import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { 
  BriefcaseIcon, 
  CalendarIcon, 
  MapPinIcon, 
  CurrencyDollarIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  EyeIcon,
  ChatBubbleLeftIcon,
  DocumentTextIcon,
  UserIcon,
  BuildingOfficeIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  CheckIcon,
  XMarkIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Applications = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Fetch applications based on user role
  const { data: applicationsData, isLoading, error } = useQuery({
    queryKey: ['applications', user?.role],
    queryFn: async () => {
      const response = user?.role === 'employer' 
        ? await applicationsAPI.getEmployerApplications()
        : await applicationsAPI.getMyApplications();
      return response.data; // Extract data from response
    }
  });

  // Update application status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, notes }) => {
      const response = await applicationsAPI.updateApplicationStatus(id, status, notes);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast.success('Application status updated successfully');
      setSelectedApplication(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update application status');
    }
  });

  // Ensure applications is always an array
  const applications = Array.isArray(applicationsData?.applications) 
    ? applicationsData.applications 
    : Array.isArray(applicationsData) 
      ? applicationsData 
      : [];
  const stats = applicationsData?.stats || {};

  const getStatusColor = (status) => {
    const colors = {
      'applied': 'bg-blue-100 text-blue-800',
      'reviewing': 'bg-yellow-100 text-yellow-800',
      'shortlisted': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'interviewed': 'bg-purple-100 text-purple-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'applied': ClockIcon,
      'reviewing': EyeIcon,
      'shortlisted': CheckCircleIcon,
      'rejected': XCircleIcon,
      'interviewed': ChatBubbleLeftIcon
    };
    return icons[status] || ClockIcon;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

  // Filter and sort applications
  const filteredApplications = Array.isArray(applications) 
    ? applications
        .filter(app => {
          if (activeTab === 'all') return true;
          return app.status === activeTab;
        })
        .filter(app => {
          if (!searchTerm) return true;
          const searchLower = searchTerm.toLowerCase();
          return (
            app.job?.title?.toLowerCase().includes(searchLower) ||
            app.applicant?.firstName?.toLowerCase().includes(searchLower) ||
            app.applicant?.lastName?.toLowerCase().includes(searchLower) ||
            app.applicant?.email?.toLowerCase().includes(searchLower) ||
            app.job?.company?.name?.toLowerCase().includes(searchLower)
          );
        })
        .sort((a, b) => {
          let aValue, bValue;
          
          switch (sortBy) {
            case 'date':
              aValue = new Date(a.createdAt);
              bValue = new Date(b.createdAt);
              break;
            case 'name':
              aValue = `${a.applicant?.firstName} ${a.applicant?.lastName}`;
              bValue = `${b.applicant?.firstName} ${b.applicant?.lastName}`;
              break;
            case 'job':
              aValue = a.job?.title;
              bValue = b.job?.title;
              break;
            case 'status':
              aValue = a.status;
              bValue = b.status;
              break;
            default:
              aValue = new Date(a.createdAt);
              bValue = new Date(b.createdAt);
          }
          
          if (sortOrder === 'asc') {
            return aValue > bValue ? 1 : -1;
          } else {
            return aValue < bValue ? 1 : -1;
          }
        })
    : [];

  const handleQuickAction = (applicationId, action) => {
    const status = action === 'shortlist' ? 'shortlisted' : 'rejected';
    const notes = action === 'shortlist' ? 'Application shortlisted' : 'Application rejected';
    
    updateStatusMutation.mutate({
      id: applicationId,
      status,
      notes
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
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
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-red-600 text-lg">Error loading applications</div>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {user?.role === 'employer' ? 'Applications Received' : 'My Applications'}
          </h1>
          <p className="text-gray-600">
            {user?.role === 'employer' 
              ? 'Review and manage job applications from candidates'
              : 'Track the status of your job applications'
            }
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BriefcaseIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ClockIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Applied</p>
                <p className="text-2xl font-bold text-gray-900">{stats.applied || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <EyeIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Reviewing</p>
                <p className="text-2xl font-bold text-gray-900">{stats.reviewing || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Shortlisted</p>
                <p className="text-2xl font-bold text-gray-900">{stats.shortlisted || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircleIcon className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-gray-900">{stats.rejected || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, job, or company..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Sort */}
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="date">Date</option>
                  <option value="name">Name</option>
                  <option value="job">Job</option>
                  <option value="status">Status</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'all', name: 'All', count: stats.total || 0 },
                { id: 'applied', name: 'Applied', count: stats.applied || 0 },
                { id: 'reviewing', name: 'Reviewing', count: stats.reviewing || 0 },
                { id: 'shortlisted', name: 'Shortlisted', count: stats.shortlisted || 0 },
                { id: 'rejected', name: 'Rejected', count: stats.rejected || 0 }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                  <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <div className="text-gray-500 text-lg mb-4">No applications found</div>
            <p className="text-gray-400">
              {user?.role === 'employer' 
                ? 'No applications have been submitted for your jobs yet'
                : 'You haven\'t applied for any jobs yet'
              }
            </p>
          </div>
        ) : user?.role === 'employer' ? (
          // Employer Table View
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applicant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Job Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applied Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredApplications.map((application) => {
                    const StatusIcon = getStatusIcon(application.status);
                    return (
                      <tr key={application._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <UserIcon className="h-6 w-6 text-gray-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {application.applicant?.firstName} {application.applicant?.lastName}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center">
                                <EnvelopeIcon className="h-4 w-4 mr-1" />
                                {application.applicant?.email}
                              </div>
                              {application.applicant?.profile?.headline && (
                                <div className="text-xs text-gray-400 mt-1">
                                  {application.applicant.profile.headline}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">{application.job?.title}</div>
                            <div className="text-gray-500 flex items-center">
                              <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                              {application.job?.company?.name || 'Unknown Company'}
                            </div>
                            <div className="text-gray-500 flex items-center">
                              <MapPinIcon className="h-4 w-4 mr-1" />
                              {application.job?.location || 'Location not specified'}
                            </div>
                            <div className="text-gray-500 flex items-center">
                              <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                              {formatSalary(application.job?.salary?.min, application.job?.salary?.max)}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(application.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {application.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setSelectedApplication(application)}
                              className="text-blue-600 hover:text-blue-900"
                              title="View Details"
                            >
                              <EyeIcon className="h-5 w-5" />
                            </button>
                            
                            {application.resume && (
                              <a
                                href={application.resume}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-600 hover:text-green-900"
                                title="View Resume"
                              >
                                <DocumentTextIcon className="h-5 w-5" />
                              </a>
                            )}

                            {application.status === 'applied' && (
                              <>
                                <button
                                  onClick={() => handleQuickAction(application._id, 'shortlist')}
                                  className="text-green-600 hover:text-green-900"
                                  title="Shortlist"
                                >
                                  <CheckIcon className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => handleQuickAction(application._id, 'reject')}
                                  className="text-red-600 hover:text-red-900"
                                  title="Reject"
                                >
                                  <XMarkIcon className="h-5 w-5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          // Applicant Card View
          <div className="space-y-4">
            {filteredApplications.map((application) => {
              const StatusIcon = getStatusIcon(application.status);
              return (
                <div key={application._id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {application.job?.title || 'Job Title Not Available'}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                          {application.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                          <BuildingOfficeIcon className="w-4 h-4 mr-1" />
                          {application.job?.company?.name || 'Unknown Company'}
                        </div>
                        <div className="flex items-center">
                          <MapPinIcon className="w-4 h-4 mr-1" />
                          {application.job?.location || 'Location not specified'}
                        </div>
                        <div className="flex items-center">
                          <CurrencyDollarIcon className="w-4 h-4 mr-1" />
                          {formatSalary(application.job?.salary?.min, application.job?.salary?.max)}
                        </div>
                        <div className="flex items-center">
                          <CalendarIcon className="w-4 h-4 mr-1" />
                          Applied {formatDate(application.createdAt)}
                        </div>
                      </div>

                      {application.coverLetter && (
                        <p className="text-gray-700 text-sm line-clamp-2 mb-3">
                          {application.coverLetter}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedApplication(application)}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                        title="View Details"
                      >
                        <EyeIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Application Detail Modal */}
        {selectedApplication && (
          <ApplicationDetailModal
            application={selectedApplication}
            onClose={() => setSelectedApplication(null)}
            onUpdateStatus={updateStatusMutation.mutate}
            userRole={user?.role}
          />
        )}
      </div>
    </div>
  );
};

// Application Detail Modal Component
const ApplicationDetailModal = ({ application, onClose, onUpdateStatus, userRole }) => {
  const [status, setStatus] = useState(application.status);
  const [notes, setNotes] = useState(application.notes || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateStatus = () => {
    setIsUpdating(true);
    onUpdateStatus({
      id: application._id,
      status,
      notes
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Application Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Job Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Job Title</label>
                  <p className="text-gray-900">{application.job?.title || 'Not available'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Company</label>
                  <p className="text-gray-900">{application.job?.company?.name || 'Unknown Company'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Location</label>
                  <p className="text-gray-900">{application.job?.location || 'Location not specified'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Salary Range</label>
                  <p className="text-gray-900">{formatSalary(application.job?.salary?.min, application.job?.salary?.max)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Job Type</label>
                  <p className="text-gray-900 capitalize">{application.job?.type || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Experience Level</label>
                  <p className="text-gray-900 capitalize">{application.job?.experience || 'Not specified'}</p>
                </div>
              </div>
            </div>

            {/* Application Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <p className="text-gray-900 capitalize">{application.status}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Applied Date</label>
                  <p className="text-gray-900">{formatDate(application.createdAt)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Expected Salary</label>
                  <p className="text-gray-900">
                    {application.expectedSalary?.amount 
                      ? `$${application.expectedSalary.amount.toLocaleString()} ${application.expectedSalary.currency || 'USD'}`
                      : 'Not specified'
                    }
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Availability</label>
                  <p className="text-gray-900 capitalize">{application.availability}</p>
                </div>
                {application.resume && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Resume</label>
                    <a 
                      href={application.resume} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      View Resume
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Cover Letter */}
          {application.coverLetter && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cover Letter</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">{application.coverLetter}</p>
              </div>
            </div>
          )}

          {/* Status Update (Employer Only) */}
          {userRole === 'employer' && (
            <div className="mt-6 border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Status</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="applied">Applied</option>
                    <option value="reviewing">Reviewing</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="rejected">Rejected</option>
                    <option value="interviewed">Interviewed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add any notes about this application..."
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateStatus}
                    disabled={isUpdating}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isUpdating ? 'Updating...' : 'Update Status'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Applications;
