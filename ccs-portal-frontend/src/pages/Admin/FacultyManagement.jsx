import React, { useEffect, useState, useRef } from 'react';
import { Layout } from '../../components/Layout';
import { 
  GripVertical, Edit2, Trash2, Plus, X, Key, Save, 
  GraduationCap, Briefcase, ShieldCheck 
} from 'lucide-react';
import { toast } from 'sonner';
import facultyService from '../../services/facultyService';

const DEFAULT_DEPARTMENTS = [
  'Computer Science',
  'Information Technology',
  'CCR',
  'Electronics',
  'Mechanical',
  'Civil',
  'Electrical',
  'Business Administration',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Placement'
];

const FACULTY_ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'faculty', label: 'Faculty' },
  { value: 'placement', label: 'Placement' }
];

const FacultyManagement = () => {
  const [activeRoleTab, setActiveRoleTab] = useState('faculty');
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);

  // Drag and drop state
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    customDepartment: '',
    role: 'faculty',
    password: '',
    showInFacultyPage: true,
    designation: '',
    specialization: '',
    experience: '',
    education: '',
    image: '',
    linkedin: ''
  });

  useEffect(() => {
    fetchFaculty();
  }, []);

  const fetchFaculty = async () => {
    try {
      setLoading(true);
      const res = await facultyService.getFaculty();
      if (res.success) {
        setFaculty(res.data.faculty || []);
      }
    } catch (error) {
      toast.error("Failed to load faculty data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------------------
  // Filter Logic
  // ----------------------------------------------------------------
  const filteredFaculty = faculty.filter(f => f.role === activeRoleTab);

  const getRoleLabel = (role) => {
    if (role === 'admin') return 'System Administrator';
    if (role === 'placement') return 'Placement Officer';
    return (FACULTY_ROLES.find(r => r.value === role)?.label || role);
  };

  // ----------------------------------------------------------------
  // Drag and Drop Logic
  // ----------------------------------------------------------------
  const handleSort = async () => {
    const roleItems = [...filteredFaculty];
    if (dragItem.current === null || dragOverItem.current === null) return;
    
    const draggedItemContent = roleItems.splice(dragItem.current, 1)[0];
    roleItems.splice(dragOverItem.current, 0, draggedItemContent);
    
    dragItem.current = null;
    dragOverItem.current = null;

    const otherRoles = faculty.filter(f => f.role !== activeRoleTab);
    const updatedGlobal = [...otherRoles, ...roleItems].map((item, index) => ({
      ...item,
      order: index
    }));

    setFaculty(updatedGlobal);

    try {
      const payload = updatedGlobal.map(f => ({ id: f._id, order: f.order }));
      await facultyService.reorderFaculty(payload);
      toast.success("Order saved successfully");
    } catch (err) {
      toast.error("Error saving new order");
      fetchFaculty(); 
    }
  };

  // ----------------------------------------------------------------
  // Modal Handlers
  // ----------------------------------------------------------------
  const openCreateModal = () => {
    setIsEditing(false);
    setSelectedFaculty(null);
    setFormData({
      name: '',
      email: '',
      department: '',
      customDepartment: '',
      role: activeRoleTab, 
      password: '',
      showInFacultyPage: activeRoleTab === 'faculty', 
      designation: '',
      specialization: '',
      experience: '',
      education: '',
      image: '',
      linkedin: ''
    });
    setShowModal(true);
  };

  const openEditModal = (member) => {
    const isCustomDept = member.department && !DEFAULT_DEPARTMENTS.includes(member.department);
    setIsEditing(true);
    setSelectedFaculty(member);
    setFormData({
      name: member.name || '',
      email: member.email || '',
      department: isCustomDept ? 'Other' : (member.department || ''),
      customDepartment: isCustomDept ? member.department : '',
      role: member.role || 'faculty',
      password: '',
      showInFacultyPage: member.showInFacultyPage ?? false,
      designation: member.designation || '',
      specialization: member.specialization || '',
      experience: member.experience || '',
      education: member.education || '',
      image: member.image || '',
      linkedin: member.linkedin || ''
    });
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password }));
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    try {
      const finalDepartment = formData.department === 'Other' ? formData.customDepartment : formData.department;
      const payload = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        department: finalDepartment,
        showInFacultyPage: formData.showInFacultyPage,
        designation: formData.designation,
        specialization: formData.specialization,
        experience: formData.experience,
        education: formData.education,
        image: formData.image,
        linkedin: formData.linkedin
      };

      if (!isEditing) {
        if (!formData.password) return toast.error("Password is required for new registration");
        payload.password = formData.password;
        payload.order = faculty.length; 

        await facultyService.createFaculty(payload);
        toast.success(`${getRoleLabel(formData.role)} profile initialized`);
      } else {
        await facultyService.updateFaculty(selectedFaculty._id, payload);
        toast.success("Profile successfully updated");
      }

      setShowModal(false);
      fetchFaculty();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const handleDeleteFaculty = async (facultyId) => {
    if (!window.confirm("CRITICAL: Are you sure you want to purge this profile?")) return;
    try {
      await facultyService.deleteFaculty(facultyId);
      toast.success("Profile successfully purged");
      setFaculty(faculty.filter(f => f._id !== facultyId));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to purge member");
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getAvatarColor = (role) => {
    if (role === 'admin') return 'bg-purple-100 text-purple-700';
    if (role === 'placement') return 'bg-orange-100 text-orange-700';
    return 'bg-blue-100 text-blue-700';
  };

  const activeTabCounter = (role) => faculty.filter(f => f.role === role).length;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Academic Governance</h1>
            <p className="text-gray-500 mt-2 text-lg font-medium">Manage institutional hierarchies and administrative access controls.</p>
          </div>
          <button
            onClick={openCreateModal}
            className="px-8 py-4 bg-gray-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-4 hover:bg-gray-800 transition-all shadow-2xl group active:scale-95 border border-gray-800"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            Initialize {getRoleLabel(activeRoleTab)}
          </button>
        </header>

        {/* Dynamic Role Tabs */}
        <div className="flex flex-wrap gap-4 mb-10 border-b border-gray-100 pb-8">
           {[
             { id: 'faculty', label: 'Academic Faculty', icon: GraduationCap },
             { id: 'placement', label: 'Placement Officers', icon: Briefcase },
             { id: 'admin', label: 'System Administrators', icon: ShieldCheck }
           ].map(tab => (
             <button
               key={tab.id}
               onClick={() => setActiveRoleTab(tab.id)}
               className={`flex items-center gap-4 px-8 py-4 rounded-2xl transition-all border ${activeRoleTab === tab.id ? 'bg-gray-950 text-white border-gray-800 shadow-xl' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'}`}
             >
               <tab.icon className={`w-5 h-5 ${activeRoleTab === tab.id ? 'text-blue-500' : 'text-gray-400'}`} />
               <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
               <div className={`px-2 py-0.5 rounded-lg text-[8px] font-black ${activeRoleTab === tab.id ? 'bg-blue-600/20 text-blue-400' : 'bg-gray-100 text-gray-500'}`}>
                 {activeTabCounter(tab.id)}
               </div>
             </button>
           ))}
        </div>

        {/* Draggable Card List */}
        <div className="grid gap-4 min-h-[400px]">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center bg-white rounded-[3rem] border border-gray-50 shadow-sm w-full">
                <div className="w-12 h-12 border-4 border-gray-100 border-t-gray-900 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Accessing Governance Records...</p>
            </div>
          ) : filteredFaculty.length === 0 ? (
            <div className="py-24 text-center bg-white rounded-[3rem] border border-gray-50 shadow-sm w-full">
               <h3 className="text-2xl font-black text-gray-900 mb-2">No {getRoleLabel(activeRoleTab)} profiles detected</h3>
               <p className="text-gray-400 font-medium tracking-tight">Initialize the first profile in this category above.</p>
            </div>
          ) : (
            filteredFaculty.map((member, index) => (
              <div
                key={member._id}
                draggable
                onDragStart={() => (dragItem.current = index)}
                onDragEnter={() => (dragOverItem.current = index)}
                onDragEnd={handleSort}
                onDragOver={(e) => e.preventDefault()}
                className="bg-white rounded-[2.5rem] p-6 flex flex-col sm:flex-row items-center justify-between shadow-sm border border-gray-50 hover:border-gray-200 hover:shadow-xl transition-all group"
              >
                <div className="flex flex-col sm:flex-row items-center gap-6 flex-1 w-full">
                  <div className="text-gray-200 cursor-move hover:text-gray-400 transition-colors hidden sm:block p-2">
                    <GripVertical className="w-6 h-6" />
                  </div>
                  <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center font-black text-xl shadow-inner shrink-0 ${getAvatarColor(member.role)}`}>
                    {member.image ? (
                        <img src={member.image} className="w-full h-full object-cover rounded-[1.5rem]" alt={member.name} />
                    ) : getInitials(member.name)}
                  </div>
                  <div className="text-center sm:text-left flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                      <h3 className="font-black text-gray-900 text-lg tracking-tight truncate">{member.name}</h3>
                      <div className="flex gap-2">
                         <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                            member.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                            member.role === 'placement' ? 'bg-orange-100 text-orange-700' :
                            'bg-blue-100 text-blue-700'
                         }`}>
                           {activeRoleTab === 'faculty' ? (member.department || 'Academic Staff') : getRoleLabel(member.role)}
                         </span>
                         {!member.showInFacultyPage && member.role === 'faculty' && (
                           <span className="px-3 py-1 bg-gray-100 text-gray-500 text-[8px] font-black uppercase rounded-full tracking-widest border border-gray-200">Hidden from Web</span>
                         )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-400 font-bold tracking-tight mt-1 truncate">
                        {member.email} • {member.designation || 'Institutional Officer'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-6 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-none border-gray-50 w-full sm:w-auto justify-center">
                  <button onClick={() => openEditModal(member)} className="p-4 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all shadow-sm">
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDeleteFaculty(member._id)} className="p-4 text-gray-400 hover:text-red-700 hover:bg-red-50 rounded-2xl transition-all shadow-sm">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Logic */}
        {showModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{isEditing ? 'Edit Profile' : 'Add New Member'}</h3>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleCreateOrUpdate} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                    <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 shadow-sm" placeholder="e.g. Dr. Sarah Johnson" />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                    <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 shadow-sm" placeholder="sarah@iilm.edu" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Department</label>
                    <select name="department" required value={formData.department} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 shadow-sm">
                      <option value="">Select Dept</option>
                      {DEFAULT_DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                      <option value="Other">Other...</option>
                    </select>
                  </div>
                  {formData.department === 'Other' && (
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Custom Department</label>
                      <input type="text" name="customDepartment" required value={formData.customDepartment} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 shadow-sm" placeholder="Please specify" />
                    </div>
                  )}

                  <div className={`col-span-2 ${formData.department === 'Other' ? '' : 'sm:col-span-1'}`}>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Role</label>
                    <select name="role" required value={formData.role} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 shadow-sm">
                      {FACULTY_ROLES.map(role => <option key={role.value} value={role.value}>{role.label}</option>)}
                    </select>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4 mt-2">
                  <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4">Identity Meta-data</h4>

                  {formData.role === 'faculty' && (
                    <div className="flex items-center justify-between mb-4 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                      <div>
                        <span className="block text-sm font-bold text-blue-900 tracking-tight">Show on Public Website</span>
                        <span className="text-xs text-blue-600/70 font-medium">If enabled, this member will appear on the public faculty registry.</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, showInFacultyPage: !prev.showInFacultyPage }))}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${formData.showInFacultyPage ? 'bg-blue-600' : 'bg-gray-300'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.showInFacultyPage ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Designation</label>
                      <input type="text" name="designation" value={formData.designation} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 shadow-sm" placeholder="e.g. Senior Associate" />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Specialization</label>
                      <input type="text" name="specialization" value={formData.specialization} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 shadow-sm" placeholder="e.g. Core Engineering" />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Experience</label>
                      <input type="text" name="experience" value={formData.experience} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 shadow-sm" placeholder="e.g. 5+ Years" />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Education</label>
                      <input type="text" name="education" value={formData.education} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 shadow-sm" placeholder="e.g. Masters" />
                    </div>
                    <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">LinkedIn Profile</label>
                    <input type="text" name="linkedin" value={formData.linkedin} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 shadow-sm" placeholder="https://linkedin.com/..." />
                  </div>
                  </div>
                </div>

                {!isEditing && (
                  <div className="pt-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Permanent Password</label>
                    <div className="flex gap-2">
                      <input type="text" name="password" required value={formData.password} onChange={handleInputChange} className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 shadow-sm" placeholder="Secure Password" />
                      <button type="button" onClick={generatePassword} className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-black flex items-center transition-colors">
                        <Key className="w-4 h-4 mr-2" /> KEY
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-8 border-t border-gray-100">
                  <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 text-gray-400 font-bold rounded-xl hover:bg-gray-50 transition-colors">Dismiss</button>
                  <button type="submit" className="px-8 py-3 bg-gray-950 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-gray-800 transition-colors shadow-2xl">
                    {isEditing ? 'Sync Changes' : 'Formalize Profile'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
};

export default FacultyManagement;
