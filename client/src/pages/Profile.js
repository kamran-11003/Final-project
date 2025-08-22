import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authAPI, uploadAPI, userAPI } from '../services/api';
import { 
  UserIcon, 
  BriefcaseIcon, 
  AcademicCapIcon, 
  StarIcon,
  GlobeAltIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  DocumentArrowUpIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Profile = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editSection, setEditSection] = useState(null);

  // Fetch user profile
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['profile'],
    queryFn: authAPI.getProfile
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: authAPI.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile updated successfully');
      setIsEditing(false);
      setEditSection(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  });

  // File upload mutations
  const uploadCVMutation = useMutation({
    mutationFn: userAPI.uploadCV,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('CV uploaded successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to upload CV');
    }
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: uploadAPI.uploadAvatar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Avatar uploaded successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to upload avatar');
    }
  });

  const handleFileUpload = (file, type) => {
    console.log('File upload triggered:', { type, fileName: file.name });
    if (type === 'resume') {
      uploadCVMutation.mutate(file);
    } else if (type === 'avatar') {
      uploadAvatarMutation.mutate(file);
    }
  };

  const handleProfileUpdate = (data) => {
    updateProfileMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-4 bg-gray-200 rounded"></div>
                ))}
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
            <div className="text-red-600 text-lg">Error loading profile</div>
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

  const tabs = user?.role === 'applicant' ? [
    { id: 'overview', name: 'Overview', icon: UserIcon },
    { id: 'experience', name: 'Experience', icon: BriefcaseIcon },
    { id: 'education', name: 'Education', icon: AcademicCapIcon },
    { id: 'skills', name: 'Skills', icon: StarIcon },
    { id: 'projects', name: 'Projects', icon: GlobeAltIcon }
  ] : [
    { id: 'overview', name: 'Company Profile', icon: UserIcon },
    { id: 'company', name: 'Company Details', icon: BriefcaseIcon }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Profile
          </h1>
          <p className="text-gray-600">
            Manage your professional profile and showcase your skills
          </p>
        </div>

        <div className="bg-white rounded-lg shadow">
          {/* Profile Header */}
          <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-lg p-6">
            <div className="flex items-center space-x-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
                  {user?.profile?.avatar ? (
                    <img 
                      src={user.profile.avatar} 
                      alt="Profile" 
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <UserIcon className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-50">
                  <PhotoIcon className="w-4 h-4 text-gray-600" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) handleFileUpload(file, 'avatar');
                    }}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-white">
                <h2 className="text-2xl font-bold mb-1">
                  {user?.firstName} {user?.lastName}
                </h2>
                <p className="text-blue-100 mb-2">
                  {user?.profile?.title || 'Professional'}
                </p>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center">
                    <MapPinIcon className="w-4 h-4 mr-1" />
                    <span>{user?.profile?.location || 'Location not specified'}</span>
                  </div>
                  <div className="flex items-center">
                    <EnvelopeIcon className="w-4 h-4 mr-1" />
                    <span>{user?.email}</span>
                  </div>
                  {user?.phone && (
                    <div className="flex items-center">
                      <PhoneIcon className="w-4 h-4 mr-1" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Edit Button */}
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <PencilIcon className="w-4 h-4 mr-2 inline" />
                Edit Profile
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <OverviewTab 
                user={user} 
                isEditing={isEditing}
                onUpdate={handleProfileUpdate}
                onFileUpload={handleFileUpload}
              />
            )}
            {user?.role === 'applicant' && (
              <>
                {activeTab === 'experience' && (
                  <ExperienceTab 
                    user={user} 
                    isEditing={isEditing}
                    onUpdate={handleProfileUpdate}
                  />
                )}
                {activeTab === 'education' && (
                  <EducationTab 
                    user={user} 
                    isEditing={isEditing}
                    onUpdate={handleProfileUpdate}
                  />
                )}
                {activeTab === 'skills' && (
                  <SkillsTab 
                    user={user} 
                    isEditing={isEditing}
                    onUpdate={handleProfileUpdate}
                  />
                )}
                {activeTab === 'projects' && (
                  <ProjectsTab 
                    user={user} 
                    isEditing={isEditing}
                    onUpdate={handleProfileUpdate}
                  />
                )}
              </>
            )}
            {user?.role === 'employer' && activeTab === 'company' && (
              <CompanyTab 
                user={user} 
                isEditing={isEditing}
                onUpdate={handleProfileUpdate}
                setIsEditing={setIsEditing}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ user, isEditing, onUpdate, onFileUpload }) => {
  const [formData, setFormData] = useState({
    title: user?.profile?.title || '',
    summary: user?.profile?.summary || '',
    location: user?.profile?.location || '',
    website: user?.profile?.website || '',
    socialMedia: user?.profile?.socialMedia || {}
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate({ profile: { ...user.profile, ...formData } });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Overview</h3>
        {isEditing && (
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save Changes
          </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Professional Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Senior Software Engineer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Summary
            </label>
            <textarea
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Write a brief summary about your professional background..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., San Francisco, CA"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://yourwebsite.com"
              />
            </div>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              {user?.profile?.title || 'Professional Title'}
            </h4>
            <p className="text-gray-600">
              {user?.profile?.summary || 'No summary provided'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="font-medium text-gray-900 mb-1">Location</h5>
              <p className="text-gray-600">
                {user?.profile?.location || 'Not specified'}
              </p>
            </div>
            <div>
              <h5 className="font-medium text-gray-900 mb-1">Website</h5>
              <p className="text-gray-600">
                {user?.profile?.website ? (
                  <a href={user.profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {user.profile.website}
                  </a>
                ) : (
                  'Not specified'
                )}
              </p>
            </div>
          </div>

          {user?.role === 'employer' && (
            <div className="border-t pt-6">
              <h5 className="font-medium text-gray-900 mb-3">Company Information</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h6 className="font-medium text-gray-700 mb-1">Industry</h6>
                  <p className="text-gray-600">{user?.company?.industry || 'Not specified'}</p>
                </div>
                <div>
                  <h6 className="font-medium text-gray-700 mb-1">Company Size</h6>
                  <p className="text-gray-600">{user?.company?.size || 'Not specified'}</p>
                </div>
                <div>
                  <h6 className="font-medium text-gray-700 mb-1">Founded</h6>
                  <p className="text-gray-600">{user?.company?.founded || 'Not specified'}</p>
                </div>
                <div>
                  <h6 className="font-medium text-gray-700 mb-1">Website</h6>
                  <p className="text-gray-600">
                    {user?.company?.website ? (
                      <a href={user.company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {user.company.website}
                      </a>
                    ) : (
                      'Not specified'
                    )}
                  </p>
                </div>
              </div>
              {user?.company?.description && (
                <div className="mt-4">
                  <h6 className="font-medium text-gray-700 mb-1">Company Description</h6>
                  <p className="text-gray-600">{user.company.description}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* CV Upload - Always show for applicants */}
      {user?.role === 'applicant' && (
        <div className="border-t pt-6">
          <h5 className="font-medium text-gray-900 mb-3">CV/Resume</h5>
          {user?.profile?.resume ? (
            <div className="flex items-center space-x-3">
              <DocumentArrowUpIcon className="w-5 h-5 text-green-500" />
              <span className="text-gray-600">CV uploaded successfully</span>
              <button 
                onClick={() => window.open(`/${user.profile.resume}`, '_blank')}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                View CV
              </button>
              {isEditing && (
                <label className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 cursor-pointer">
                  <PlusIcon className="w-3 h-3 mr-1" />
                  Update CV
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) onFileUpload(file, 'resume');
                    }}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <DocumentArrowUpIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 mb-2">No CV uploaded</p>
              <p className="text-sm text-gray-500 mb-3">Upload your CV to apply for jobs</p>
              <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">
                <PlusIcon className="w-4 h-4 mr-2" />
                Upload CV
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) onFileUpload(file, 'resume');
                  }}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Experience Tab Component
const ExperienceTab = ({ user, isEditing, onUpdate }) => {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    description: ''
  });

  const handleAddExperience = () => {
    const newExperience = {
      ...formData,
      startDate: new Date(formData.startDate),
      endDate: formData.current ? null : new Date(formData.endDate)
    };

    const updatedExperience = [...(user.profile?.experience || []), newExperience];
    onUpdate({ profile: { ...user.profile, experience: updatedExperience } });
    setFormData({
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    });
  };

  const handleDeleteExperience = (index) => {
    const updatedExperience = user.profile.experience.filter((_, i) => i !== index);
    onUpdate({ profile: { ...user.profile, experience: updatedExperience } });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Experience</h3>
        {isEditing && (
          <button
            onClick={handleAddExperience}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <PlusIcon className="w-4 h-4 mr-2 inline" />
            Add Experience
          </button>
        )}
      </div>

      {isEditing && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-gray-900 mb-4">Add New Experience</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Job Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Company"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.current}
                onChange={(e) => setFormData({ ...formData, current: e.target.checked })}
                className="rounded"
              />
              <label className="text-sm text-gray-700">Current Position</label>
            </div>
            <input
              type="date"
              placeholder="Start Date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {!formData.current && (
              <input
                type="date"
                placeholder="End Date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            )}
          </div>
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full mt-4 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )}

      <div className="space-y-6">
        {user?.profile?.experience?.map((exp, index) => (
          <div key={index} className="border-l-4 border-blue-500 pl-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{exp.title}</h4>
                <p className="text-blue-600 font-medium">{exp.company}</p>
                <p className="text-gray-600 text-sm">
                  {new Date(exp.startDate).toLocaleDateString()} - 
                  {exp.current ? 'Present' : new Date(exp.endDate).toLocaleDateString()}
                </p>
                <p className="text-gray-600 text-sm">{exp.location}</p>
                <p className="text-gray-700 mt-2">{exp.description}</p>
              </div>
              {isEditing && (
                <button
                  onClick={() => handleDeleteExperience(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}

        {(!user?.profile?.experience || user.profile.experience.length === 0) && (
          <div className="text-center py-8 text-gray-500">
            No experience added yet
          </div>
        )}
      </div>
    </div>
  );
};

// Education Tab Component
const EducationTab = ({ user, isEditing, onUpdate }) => {
  const [formData, setFormData] = useState({
    degree: '',
    institution: '',
    field: '',
    graduationYear: '',
    gpa: ''
  });

  const handleAddEducation = () => {
    const newEducation = {
      ...formData,
      graduationYear: parseInt(formData.graduationYear),
      gpa: parseFloat(formData.gpa) || null
    };

    const updatedEducation = [...(user.profile?.education || []), newEducation];
    onUpdate({ profile: { ...user.profile, education: updatedEducation } });
    setFormData({
      degree: '',
      institution: '',
      field: '',
      graduationYear: '',
      gpa: ''
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Education</h3>
        {isEditing && (
          <button
            onClick={handleAddEducation}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <PlusIcon className="w-4 h-4 mr-2 inline" />
            Add Education
          </button>
        )}
      </div>

      {isEditing && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-gray-900 mb-4">Add New Education</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Degree"
              value={formData.degree}
              onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Institution"
              value={formData.institution}
              onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Field of Study"
              value={formData.field}
              onChange={(e) => setFormData({ ...formData, field: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="number"
              placeholder="Graduation Year"
              value={formData.graduationYear}
              onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="number"
              step="0.01"
              placeholder="GPA (optional)"
              value={formData.gpa}
              onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      <div className="space-y-6">
        {user?.profile?.education?.map((edu, index) => (
          <div key={index} className="border-l-4 border-green-500 pl-4">
            <h4 className="font-semibold text-gray-900">{edu.degree}</h4>
            <p className="text-green-600 font-medium">{edu.institution}</p>
            <p className="text-gray-600 text-sm">
              {edu.field} • {edu.graduationYear}
              {edu.gpa && ` • GPA: ${edu.gpa}`}
            </p>
          </div>
        ))}

        {(!user?.profile?.education || user.profile.education.length === 0) && (
          <div className="text-center py-8 text-gray-500">
            No education added yet
          </div>
        )}
      </div>
    </div>
  );
};

// Skills Tab Component
const SkillsTab = ({ user, isEditing, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: '',
    level: 'intermediate'
  });

  const handleAddSkill = () => {
    const newSkill = {
      ...formData,
      endorsements: 0
    };

    const updatedSkills = [...(user.profile?.skills || []), newSkill];
    onUpdate({ profile: { ...user.profile, skills: updatedSkills } });
    setFormData({ name: '', level: 'intermediate' });
  };

  const getLevelColor = (level) => {
    const colors = {
      'beginner': 'bg-green-100 text-green-800',
      'intermediate': 'bg-blue-100 text-blue-800',
      'advanced': 'bg-yellow-100 text-yellow-800',
      'expert': 'bg-red-100 text-red-800'
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Skills</h3>
        {isEditing && (
          <button
            onClick={handleAddSkill}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <PlusIcon className="w-4 h-4 mr-2 inline" />
            Add Skill
          </button>
        )}
      </div>

      {isEditing && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-gray-900 mb-4">Add New Skill</h4>
          <div className="flex space-x-4">
            <input
              type="text"
              placeholder="Skill name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <select
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {user?.profile?.skills?.map((skill, index) => (
          <div
            key={index}
            className={`px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(skill.level)}`}
          >
            {skill.name}
            {skill.endorsements > 0 && (
              <span className="ml-1 text-xs">({skill.endorsements})</span>
            )}
          </div>
        ))}

        {(!user?.profile?.skills || user.profile.skills.length === 0) && (
          <div className="text-center py-8 text-gray-500 w-full">
            No skills added yet
          </div>
        )}
      </div>
    </div>
  );
};

// Projects Tab Component
const ProjectsTab = ({ user, isEditing, onUpdate }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    technologies: '',
    githubUrl: '',
    liveUrl: '',
    current: false
  });

  const handleAddProject = () => {
    const newProject = {
      ...formData,
      technologies: formData.technologies.split(',').map(tech => tech.trim()),
      startDate: new Date(),
      endDate: formData.current ? null : new Date(),
      highlights: []
    };

    const updatedProjects = [...(user.profile?.projects || []), newProject];
    onUpdate({ profile: { ...user.profile, projects: updatedProjects } });
    setFormData({
      title: '',
      description: '',
      technologies: '',
      githubUrl: '',
      liveUrl: '',
      current: false
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Projects</h3>
        {isEditing && (
          <button
            onClick={handleAddProject}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <PlusIcon className="w-4 h-4 mr-2 inline" />
            Add Project
          </button>
        )}
      </div>

      {isEditing && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-gray-900 mb-4">Add New Project</h4>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Project Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <textarea
              placeholder="Project Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Technologies (comma-separated)"
                value={formData.technologies}
                onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.current}
                  onChange={(e) => setFormData({ ...formData, current: e.target.checked })}
                  className="rounded"
                />
                <label className="text-sm text-gray-700">Currently Working</label>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="url"
                placeholder="GitHub URL"
                value={formData.githubUrl}
                onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="url"
                placeholder="Live URL"
                value={formData.liveUrl}
                onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {user?.profile?.projects?.map((project, index) => (
          <div key={index} className="border rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">{project.title}</h4>
            <p className="text-gray-600 text-sm mb-3">{project.description}</p>
            <div className="flex flex-wrap gap-1 mb-3">
              {project.technologies?.map((tech, techIndex) => (
                <span
                  key={techIndex}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                >
                  {tech}
                </span>
              ))}
            </div>
            <div className="flex space-x-2">
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  GitHub
                </a>
              )}
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Live Demo
                </a>
              )}
            </div>
          </div>
        ))}

        {(!user?.profile?.projects || user.profile.projects.length === 0) && (
          <div className="text-center py-8 text-gray-500 col-span-2">
            No projects added yet
          </div>
        )}
      </div>
    </div>
  );
};

// Company Tab Component (for employers)
const CompanyTab = ({ user, isEditing, onUpdate, setIsEditing }) => {
  const [formData, setFormData] = useState({
    name: user?.company?.name || '',
    description: user?.company?.description || '',
    website: user?.company?.website || '',
    industry: user?.company?.industry || '',
    size: user?.company?.size || '',
    location: user?.company?.location || '',
    founded: user?.company?.founded || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate({ company: formData });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">Company Details</h3>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="btn-outline btn-sm"
        >
          <PencilIcon className="w-4 h-4 mr-1" />
          {isEditing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Company Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
                required
              />
            </div>
            <div>
              <label className="form-label">Industry</label>
              <input
                type="text"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="form-label">Company Size</label>
              <select
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                className="input"
              >
                <option value="">Select size</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="501-1000">501-1000 employees</option>
                <option value="1000+">1000+ employees</option>
              </select>
            </div>
            <div>
              <label className="form-label">Founded</label>
              <input
                type="number"
                value={formData.founded}
                onChange={(e) => setFormData({ ...formData, founded: e.target.value })}
                className="input"
                min="1800"
                max={new Date().getFullYear()}
              />
            </div>
            <div>
              <label className="form-label">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="form-label">Website</label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="input"
                placeholder="https://company.com"
              />
            </div>
          </div>
          
          <div>
            <label className="form-label">Company Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="input"
              placeholder="Describe your company, mission, and values..."
            />
          </div>

          <div className="flex space-x-3">
            <button type="submit" className="btn-primary">
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="btn-outline"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="font-medium text-gray-900 mb-1">Company Name</h5>
              <p className="text-gray-600">{user?.company?.name || 'Not specified'}</p>
            </div>
            <div>
              <h5 className="font-medium text-gray-900 mb-1">Industry</h5>
              <p className="text-gray-600">{user?.company?.industry || 'Not specified'}</p>
            </div>
            <div>
              <h5 className="font-medium text-gray-900 mb-1">Company Size</h5>
              <p className="text-gray-600">{user?.company?.size || 'Not specified'}</p>
            </div>
            <div>
              <h5 className="font-medium text-gray-900 mb-1">Founded</h5>
              <p className="text-gray-600">{user?.company?.founded || 'Not specified'}</p>
            </div>
            <div>
              <h5 className="font-medium text-gray-900 mb-1">Location</h5>
              <p className="text-gray-600">{user?.company?.location || 'Not specified'}</p>
            </div>
            <div>
              <h5 className="font-medium text-gray-900 mb-1">Website</h5>
              <p className="text-gray-600">
                {user?.company?.website ? (
                  <a href={user.company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {user.company.website}
                  </a>
                ) : (
                  'Not specified'
                )}
              </p>
            </div>
          </div>
          
          {user?.company?.description && (
            <div>
              <h5 className="font-medium text-gray-900 mb-1">Company Description</h5>
              <p className="text-gray-600">{user.company.description}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
