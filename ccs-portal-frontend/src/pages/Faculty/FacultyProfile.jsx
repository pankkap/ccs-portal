import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Layout } from '../../components/Layout';
import { User, Mail, Briefcase, GraduationCap, Link as LinkIcon, Save, Loader2, Camera } from 'lucide-react';
import { toast } from 'sonner';
import facultyService from '../../services/facultyService';
import uploadService from '../../services/uploadService';

const FacultyProfile = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    designation: '',
    specialization: '',
    experience: '',
    education: '',
    linkedin: '',
    image: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        designation: profile.designation || '',
        specialization: profile.specialization || '',
        experience: profile.experience || '',
        education: profile.education || '',
        linkedin: profile.linkedin || '',
        image: profile.image || '',
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      return toast.error("Image size must be less than 5MB");
    }

    setUploading(true);
    try {
      const res = await uploadService.uploadFile(file);
      if (res.success) {
        setFormData(prev => ({ ...prev, image: res.data.url }));
        toast.success("Profile image uploaded!");
      }
    } catch (error) {
      toast.error(error.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await facultyService.updateProfile(formData);
      toast.success("Profile updated successfully!");
      await refreshProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500 mt-2">Manage your professional information for the faculty directory.</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Profile Header Card */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-8">
             <div className="relative group">
                <div className="w-32 h-32 rounded-3xl overflow-hidden bg-gray-100 border-4 border-white shadow-xl">
                  {formData.image ? (
                    <img 
                      src={formData.image} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <User className="w-12 h-12" />
                    </div>
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                  )}
                </div>
                <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-all shadow-lg border-2 border-white">
                  <Camera className="w-5 h-5" />
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                </label>
             </div>

             <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-gray-900">{formData.name || 'Your Name'}</h2>
                <p className="text-blue-600 font-semibold uppercase tracking-widest text-sm mt-1">
                  {formData.designation || 'Add Designation'}
                </p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-6">
                  <div className="flex items-center gap-2 text-sm text-gray-500 px-4 py-2 bg-gray-50 rounded-lg">
                    <Mail className="w-4 h-4" /> {formData.email}
                  </div>
                  {formData.specialization && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 px-4 py-2 bg-gray-50 rounded-lg">
                      <Briefcase className="w-4 h-4" /> {formData.specialization}
                    </div>
                  )}
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Basic Info */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-4">Basic Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Display Name</label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Designation</label>
                  <input 
                    type="text" 
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    placeholder="e.g. Senior Technical Trainer"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Specialization</label>
                  <input 
                    type="text" 
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    placeholder="e.g. Full Stack Development"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Professional Details */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-4">Professional Details</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Total Experience</label>
                  <input 
                    type="text" 
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    placeholder="e.g. 12+ Years"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Education</label>
                  <input 
                    type="text" 
                    name="education"
                    value={formData.education}
                    onChange={handleChange}
                    placeholder="e.g. M.Tech in CS"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">LinkedIn URL</label>
                  <div className="relative">
                    <LinkIcon className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                    <input 
                      type="url" 
                      name="linkedin"
                      value={formData.linkedin}
                      onChange={handleChange}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button 
              type="submit"
              disabled={loading}
              className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 disabled:opacity-50 flex items-center gap-3"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Profile
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default FacultyProfile;
