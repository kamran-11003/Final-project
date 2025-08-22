import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { 
  BriefcaseIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ClockIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

const JobEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [job, setJob] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm();

  const jobType = watch('type');
  const experienceLevel = watch('experienceLevel');

  // Fetch job data on component mount
  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/jobs/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const jobData = data.data;
          setJob(jobData);
          
          // Pre-fill form with existing data
          setValue('title', jobData.title);
          setValue('description', jobData.description);
          setValue('requirements', jobData.requirements);
          setValue('responsibilities', jobData.responsibilities);
          setValue('location', jobData.location);
          setValue('type', jobData.type);
          setValue('experienceLevel', jobData.experienceLevel);
          setValue('salary.min', jobData.salary?.min || '');
          setValue('salary.max', jobData.salary?.max || '');
          setValue('salary.currency', jobData.salary?.currency || 'USD');
          setValue('skills', jobData.skills?.join(', ') || '');
          setValue('benefits', jobData.benefits || '');
          setValue('status', jobData.status);
        } else {
          toast.error('Failed to fetch job details');
          navigate('/dashboard');
        }
      } catch (error) {
        toast.error('Error fetching job details');
        navigate('/dashboard');
      }
    };

    fetchJob();
  }, [id, setValue, navigate]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const jobData = {
        ...data,
        skills: data.skills.split(',').map(skill => skill.trim()).filter(skill => skill),
        salary: {
          min: parseInt(data.salary.min),
          max: parseInt(data.salary.max),
          currency: data.salary.currency
        }
      };

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/jobs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(jobData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Job updated successfully!');
        navigate(`/jobs/${id}`);
      } else {
        toast.error(result.message || 'Failed to update job');
      }
    } catch (error) {
      toast.error('An error occurred while updating the job');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/jobs/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Job deleted successfully!');
        navigate('/dashboard');
      } else {
        toast.error(result.message || 'Failed to delete job');
      }
    } catch (error) {
      toast.error('An error occurred while deleting the job');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500 mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Job</h1>
          <p className="text-gray-600 mt-2">Update your job posting details</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <BriefcaseIcon className="w-5 h-5 mr-2" />
              Basic Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Job Title */}
              <div className="md:col-span-2">
                <label className="form-label">Job Title *</label>
                <input
                  type="text"
                  className={`input ${errors.title ? 'input-error' : ''}`}
                  placeholder="e.g., Senior Software Engineer"
                  {...register('title', {
                    required: 'Job title is required',
                    minLength: {
                      value: 3,
                      message: 'Job title must be at least 3 characters',
                    },
                  })}
                />
                {errors.title && <p className="form-error">{errors.title.message}</p>}
              </div>

              {/* Location */}
              <div>
                <label className="form-label">Location *</label>
                <div className="relative">
                  <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    className={`input pl-10 ${errors.location ? 'input-error' : ''}`}
                    placeholder="e.g., New York, NY"
                    {...register('location', {
                      required: 'Location is required',
                    })}
                  />
                </div>
                {errors.location && <p className="form-error">{errors.location.message}</p>}
              </div>

              {/* Job Type */}
              <div>
                <label className="form-label">Job Type *</label>
                <select
                  className={`input ${errors.type ? 'input-error' : ''}`}
                  {...register('type', {
                    required: 'Job type is required',
                  })}
                >
                  <option value="">Select job type</option>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                  <option value="freelance">Freelance</option>
                </select>
                {errors.type && <p className="form-error">{errors.type.message}</p>}
              </div>

              {/* Experience Level */}
              <div>
                <label className="form-label">Experience Level *</label>
                <select
                  className={`input ${errors.experienceLevel ? 'input-error' : ''}`}
                  {...register('experienceLevel', {
                    required: 'Experience level is required',
                  })}
                >
                  <option value="">Select experience level</option>
                  <option value="entry">Entry Level</option>
                  <option value="junior">Junior</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior</option>
                  <option value="lead">Lead</option>
                  <option value="executive">Executive</option>
                </select>
                {errors.experienceLevel && <p className="form-error">{errors.experienceLevel.message}</p>}
              </div>

              {/* Status */}
              <div>
                <label className="form-label">Status *</label>
                <select
                  className={`input ${errors.status ? 'input-error' : ''}`}
                  {...register('status', {
                    required: 'Status is required',
                  })}
                >
                  <option value="">Select status</option>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="closed">Closed</option>
                  <option value="expired">Expired</option>
                </select>
                {errors.status && <p className="form-error">{errors.status.message}</p>}
              </div>
            </div>
          </div>

          {/* Salary Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <CurrencyDollarIcon className="w-5 h-5 mr-2" />
              Salary Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="form-label">Minimum Salary</label>
                <input
                  type="number"
                  className={`input ${errors['salary.min'] ? 'input-error' : ''}`}
                  placeholder="e.g., 50000"
                  {...register('salary.min', {
                    min: {
                      value: 0,
                      message: 'Minimum salary must be positive',
                    },
                  })}
                />
                {errors['salary.min'] && <p className="form-error">{errors['salary.min'].message}</p>}
              </div>

              <div>
                <label className="form-label">Maximum Salary</label>
                <input
                  type="number"
                  className={`input ${errors['salary.max'] ? 'input-error' : ''}`}
                  placeholder="e.g., 80000"
                  {...register('salary.max', {
                    min: {
                      value: 0,
                      message: 'Maximum salary must be positive',
                    },
                  })}
                />
                {errors['salary.max'] && <p className="form-error">{errors['salary.max'].message}</p>}
              </div>

              <div>
                <label className="form-label">Currency</label>
                <select
                  className={`input ${errors['salary.currency'] ? 'input-error' : ''}`}
                  {...register('salary.currency')}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD (C$)</option>
                  <option value="AUD">AUD (A$)</option>
                </select>
                {errors['salary.currency'] && <p className="form-error">{errors['salary.currency'].message}</p>}
              </div>
            </div>
          </div>

          {/* Job Description */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <DocumentTextIcon className="w-5 h-5 mr-2" />
              Job Description
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="form-label">Job Description *</label>
                <textarea
                  rows={6}
                  className={`input ${errors.description ? 'input-error' : ''}`}
                  placeholder="Describe the role, responsibilities, and what makes this position exciting..."
                  {...register('description', {
                    required: 'Job description is required',
                    minLength: {
                      value: 50,
                      message: 'Description must be at least 50 characters',
                    },
                  })}
                />
                {errors.description && <p className="form-error">{errors.description.message}</p>}
              </div>

              <div>
                <label className="form-label">Requirements *</label>
                <textarea
                  rows={4}
                  className={`input ${errors.requirements ? 'input-error' : ''}`}
                  placeholder="List the required skills, experience, and qualifications..."
                  {...register('requirements', {
                    required: 'Requirements are required',
                    minLength: {
                      value: 30,
                      message: 'Requirements must be at least 30 characters',
                    },
                  })}
                />
                {errors.requirements && <p className="form-error">{errors.requirements.message}</p>}
              </div>

              <div>
                <label className="form-label">Responsibilities</label>
                <textarea
                  rows={4}
                  className={`input ${errors.responsibilities ? 'input-error' : ''}`}
                  placeholder="List the key responsibilities and duties..."
                  {...register('responsibilities')}
                />
                {errors.responsibilities && <p className="form-error">{errors.responsibilities.message}</p>}
              </div>
            </div>
          </div>

          {/* Skills and Benefits */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <CheckCircleIcon className="w-5 h-5 mr-2" />
              Skills & Benefits
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">Required Skills</label>
                <input
                  type="text"
                  className={`input ${errors.skills ? 'input-error' : ''}`}
                  placeholder="e.g., JavaScript, React, Node.js, MongoDB"
                  {...register('skills')}
                />
                <p className="text-sm text-gray-500 mt-1">Separate skills with commas</p>
                {errors.skills && <p className="form-error">{errors.skills.message}</p>}
              </div>

              <div>
                <label className="form-label">Benefits</label>
                <textarea
                  rows={3}
                  className={`input ${errors.benefits ? 'input-error' : ''}`}
                  placeholder="e.g., Health insurance, 401k, flexible hours, remote work..."
                  {...register('benefits')}
                />
                {errors.benefits && <p className="form-error">{errors.benefits.message}</p>}
          </div>
        </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <button
              type="button"
              onClick={() => navigate(`/jobs/${id}`)}
              className="btn-secondary"
            >
              Cancel
            </button>
            
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="btn-danger"
            >
              {isDeleting ? (
                <div className="flex items-center">
                  <div className="spinner w-4 h-4 mr-2"></div>
                  Deleting...
                </div>
              ) : (
                <div className="flex items-center">
                  <XCircleIcon className="w-4 h-4 mr-2" />
                  Delete Job
                </div>
              )}
            </button>
            
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="spinner w-4 h-4 mr-2"></div>
                  Updating...
                </div>
              ) : (
                <div className="flex items-center">
                  <CheckCircleIcon className="w-4 h-4 mr-2" />
                  Update Job
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobEdit;
