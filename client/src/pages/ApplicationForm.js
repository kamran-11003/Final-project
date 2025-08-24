import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { applicationsAPI, jobsAPI, uploadAPI } from '../services/api';
import toast from 'react-hot-toast';
import { 
  ArrowLeftIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  DocumentTextIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  DocumentArrowUpIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const ApplicationForm = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    coverLetter: '',
    expectedSalary: '',
    availability: 'immediate',
    additionalNotes: ''
  });

  const [resumeFile, setResumeFile] = useState(null);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeUrl, setResumeUrl] = useState(user?.profile?.resume || '');

  // Fetch job details
  const { data: job, isLoading: jobLoading } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => jobsAPI.getJob(jobId),
    enabled: !!jobId
  });

  // Check if user has already applied
  const { data: applicationCheck } = useQuery({
    queryKey: ['application-check', jobId],
    queryFn: () => applicationsAPI.checkApplication(jobId),
    enabled: !!jobId && !!user
  });

  // Upload resume mutation
  const uploadResumeMutation = useMutation({
    mutationFn: uploadAPI.uploadResume,
    onSuccess: (data) => {
      setResumeUrl(data.resumeUrl);
      setResumeFile(null);
      setResumeUploading(false);
      toast.success('Resume uploaded successfully!');
    },
    onError: (error) => {
      setResumeUploading(false);
      toast.error(error.response?.data?.message || 'Failed to upload resume');
    }
  });

  // Apply mutation
  const applyMutation = useMutation({
    mutationFn: applicationsAPI.applyForJob,
    onSuccess: () => {
      // Mark job as applied in localStorage
      const appliedJobs = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
      if (!appliedJobs.includes(jobId)) {
        appliedJobs.push(jobId);
        localStorage.setItem('appliedJobs', JSON.stringify(appliedJobs));
      }
      toast.success('Application submitted successfully!');
      navigate('/applications');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to submit application');
    }
  });

  // Pre-fill form with user data when component mounts
  useEffect(() => {
    if (user && job) {
      // Pre-fill cover letter with a template
      const coverLetterTemplate = `Dear Hiring Manager,

I am writing to express my strong interest in the ${job.title} position at ${job.company?.name || job.employer?.company?.name}.

${user.profile?.summary ? `About me: ${user.profile.summary}` : ''}

${user.profile?.experience && user.profile.experience.length > 0 ? 
  `I have ${user.profile.experience.length} year${user.profile.experience.length > 1 ? 's' : ''} of experience in ${user.profile.experience[0]?.title || 'my field'}.` : 
  'I am excited about the opportunity to contribute to your team.'
}

I am particularly drawn to this role because of ${job.company?.description ? 'your company\'s mission and values' : 'the opportunity to grow and contribute to meaningful projects'}.

I am available for an interview at your convenience and look forward to discussing how my skills and experience can benefit your team.

Best regards,
${user.firstName} ${user.lastName}`;

      setFormData(prev => ({
        ...prev,
        coverLetter: coverLetterTemplate
      }));
    }
  }, [user, job]);

  // Redirect if already applied
  useEffect(() => {
    if (applicationCheck?.hasApplied) {
      toast.error('You have already applied for this job');
      navigate(`/jobs/${jobId}`);
    }
  }, [applicationCheck, jobId, navigate]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size must be less than 5MB');
        return;
      }
      if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
        toast.error('Please upload a PDF, DOC, or DOCX file');
        return;
      }
      setResumeFile(file);
    }
  };

  const handleUploadResume = async () => {
    if (!resumeFile) {
      toast.error('Please select a file to upload');
      return;
    }

    setResumeUploading(true);
    uploadResumeMutation.mutate(resumeFile);
  };

  const removeResume = () => {
    setResumeFile(null);
    setResumeUrl('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please log in to apply for jobs');
      return;
    }

    if (!resumeUrl && !resumeFile) {
      toast.error('Please upload your CV/Resume before applying for jobs');
      return;
    }

    if (!formData.coverLetter.trim()) {
      toast.error('Please write a cover letter');
      return;
    }

    // Upload resume first if there's a new file
    if (resumeFile) {
      try {
        await uploadResumeMutation.mutateAsync(resumeFile);
        // Continue with application submission after successful upload
      } catch (error) {
        return; // Stop if upload fails
      }
    }

    const applicationData = {
      jobId,
      coverLetter: formData.coverLetter,
      expectedSalary: formData.expectedSalary ? parseInt(formData.expectedSalary) : null,
      availability: formData.availability,
      additionalNotes: formData.additionalNotes
    };

    applyMutation.mutate(applicationData);
  };

  if (jobLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Job not found</h1>
          <button 
            onClick={() => navigate('/jobs')}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Browse Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container-responsive py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/jobs/${jobId}`)}
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Job Details
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Apply for {job.title}
          </h1>
          <p className="text-xl text-gray-600">
            at {job.company?.name || job.employer?.company?.name}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Job Summary Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Summary</h2>
              
              <div className="space-y-4">
                <div className="flex items-center text-gray-600">
                  <MapPinIcon className="w-5 h-5 mr-3 text-blue-500" />
                  <span>{job.location}</span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <CurrencyDollarIcon className="w-5 h-5 mr-3 text-green-500" />
                  <span>{job.salary?.min && job.salary?.max ? 
                    `$${job.salary.min.toLocaleString()} - $${job.salary.max.toLocaleString()}` : 
                    job.salary?.amount ? `$${job.salary.amount.toLocaleString()}` : 'Salary not specified'
                  }</span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <CalendarIcon className="w-5 h-5 mr-3 text-purple-500" />
                  <span className="capitalize">{job.type}</span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <DocumentTextIcon className="w-5 h-5 mr-3 text-orange-500" />
                  <span className="capitalize">{job.experience}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Application Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Application Details</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information Section */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center text-gray-600">
                      <UserIcon className="w-4 h-4 mr-2 text-blue-500" />
                      <span className="font-medium">{user?.firstName} {user?.lastName}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <EnvelopeIcon className="w-4 h-4 mr-2 text-green-500" />
                      <span className="font-medium">{user?.email}</span>
                    </div>
                    {user?.phone && (
                      <div className="flex items-center text-gray-600">
                        <PhoneIcon className="w-4 h-4 mr-2 text-purple-500" />
                        <span className="font-medium">{user.phone}</span>
                      </div>
                    )}
                    {user?.profile?.location && (
                      <div className="flex items-center text-gray-600">
                        <MapPinIcon className="w-4 h-4 mr-2 text-orange-500" />
                        <span className="font-medium">{user.profile.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Resume Upload Section */}
                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-3">
                    Resume/CV *
                  </label>
                  
                  {resumeUrl ? (
                    <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-green-700">
                          <CheckCircleIcon className="w-5 h-5 mr-2" />
                          <span className="font-medium">Resume uploaded successfully</span>
                        </div>
                        <button
                          type="button"
                          onClick={removeResume}
                          className="text-red-500 hover:text-red-700"
                        >
                          <XMarkIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                      <DocumentArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <div className="mb-4">
                        <label htmlFor="resume-upload" className="cursor-pointer">
                          <span className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                            Choose File
                          </span>
                          <input
                            id="resume-upload"
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <p className="text-sm text-gray-500">
                        Upload your resume (PDF, DOC, or DOCX, max 5MB)
                      </p>
                      {resumeFile && (
                        <div className="mt-4">
                          <p className="text-sm text-gray-600 mb-2">Selected: {resumeFile.name}</p>
                          <button
                            type="button"
                            onClick={handleUploadResume}
                            disabled={resumeUploading}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                          >
                            {resumeUploading ? 'Uploading...' : 'Upload Resume'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Cover Letter */}
                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-3">
                    Cover Letter *
                  </label>
                  <textarea
                    required
                    value={formData.coverLetter}
                    onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
                    rows={12}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
                    placeholder="Write a compelling cover letter explaining why you're interested in this position and why you'd be a great fit..."
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    {formData.coverLetter.length}/2000 characters
                  </p>
                </div>

                {/* Expected Salary */}
                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-3">
                    Expected Salary (Optional)
                  </label>
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-500">$</span>
                    <input
                      type="number"
                      value={formData.expectedSalary}
                      onChange={(e) => setFormData({ ...formData, expectedSalary: e.target.value })}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 75000"
                    />
                    <span className="text-gray-500">per year</span>
                  </div>
                </div>

                {/* Availability */}
                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-3">
                    Availability *
                  </label>
                  <select
                    value={formData.availability}
                    onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="immediate">Immediate</option>
                    <option value="2-weeks">2 weeks notice</option>
                    <option value="1-month">1 month notice</option>
                    <option value="3-months">3 months notice</option>
                    <option value="negotiable">Negotiable</option>
                  </select>
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-3">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    value={formData.additionalNotes}
                    onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Any additional information you'd like to share..."
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={applyMutation.isPending || resumeUploading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:transform-none"
                  >
                    {applyMutation.isPending ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Submitting Application...
                      </div>
                    ) : (
                      'Submit Application'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationForm;
