import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { jobsAPI } from '../services/api';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const JobPost = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    responsibilities: '',
    benefits: '',
    location: '',
    type: 'full-time',
    experience: 'entry',
    salary: {
      min: '',
      max: '',
      currency: 'USD'
    },
    skills: '',
    deadline: ''
  });

  const createJobMutation = useMutation({
    mutationFn: jobsAPI.createJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Job posted successfully!');
      navigate('/dashboard');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to post job');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const jobData = {
      ...formData,
      skills: formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill),
      salary: {
        min: parseInt(formData.salary.min),
        max: parseInt(formData.salary.max),
        currency: formData.salary.currency
      },
      deadline: formData.deadline ? new Date(formData.deadline) : null
    };

    createJobMutation.mutate(jobData);
  };

  const handleChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Post a New Job</h1>
          <p className="text-gray-600">
            Create a compelling job posting to attract the best candidates
          </p>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => handleChange('title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Senior Software Engineer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.location}
                      onChange={(e) => handleChange('location', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., San Francisco, CA or Remote"
                    />
                  </div>
                </div>
              </div>

              {/* Job Details */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Type *
                    </label>
                    <select
                      required
                      value={formData.type}
                      onChange={(e) => handleChange('type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="full-time">Full Time</option>
                      <option value="part-time">Part Time</option>
                      <option value="contract">Contract</option>
                      <option value="internship">Internship</option>
                      <option value="freelance">Freelance</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Experience Level *
                    </label>
                    <select
                      required
                      value={formData.experience}
                      onChange={(e) => handleChange('experience', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="entry">Entry Level</option>
                      <option value="junior">Junior</option>
                      <option value="mid">Mid Level</option>
                      <option value="senior">Senior</option>
                      <option value="lead">Lead</option>
                      <option value="executive">Executive</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Application Deadline
                    </label>
                    <input
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => handleChange('deadline', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Salary Information */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Salary Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Salary *
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.salary.min}
                      onChange={(e) => handleChange('salary.min', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 50000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Salary *
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.salary.max}
                      onChange={(e) => handleChange('salary.max', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 80000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Currency
                    </label>
                    <select
                      value={formData.salary.currency}
                      onChange={(e) => handleChange('salary.currency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="CAD">CAD (C$)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Job Description */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Provide a detailed description of the role, including what the position entails..."
                  />
                </div>
              </div>

              {/* Requirements */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Requirements *
                  </label>
                  <textarea
                    required
                    value={formData.requirements}
                    onChange={(e) => handleChange('requirements', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="List the qualifications, experience, and skills required for this position..."
                  />
                </div>
              </div>

              {/* Responsibilities */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Responsibilities</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Responsibilities *
                  </label>
                  <textarea
                    required
                    value={formData.responsibilities}
                    onChange={(e) => handleChange('responsibilities', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe the key responsibilities and duties for this role..."
                  />
                </div>
              </div>

              {/* Benefits */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Benefits</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Benefits (Optional)
                  </label>
                  <textarea
                    value={formData.benefits}
                    onChange={(e) => handleChange('benefits', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="List the benefits and perks offered with this position..."
                  />
                </div>
              </div>

              {/* Skills */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Required Skills</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skills (comma-separated) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.skills}
                    onChange={(e) => handleChange('skills', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., JavaScript, React, Node.js, MongoDB"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createJobMutation.isLoading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {createJobMutation.isLoading ? 'Posting...' : 'Post Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobPost;
