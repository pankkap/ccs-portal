import React, { useEffect, useState, useRef } from 'react';
import { Layout } from '../../components/Layout';
import { GripVertical, Edit2, Trash2, Plus, X, Key, Save } from 'lucide-react';
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
];

const FACULTY_ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'faculty', label: 'Faculty' },
  { value: 'placement', label: 'Placement' }
];

const FacultyManagement = () => {
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
    name: '', email: '', department: '', customDepartment: '', role: 'faculty', password: ''
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
  // Drag and Drop Logic
  // ----------------------------------------------------------------
  const handleSort = async () => {
    const _faculty = [...faculty];
    const draggedItemContent = _faculty.splice(dragItem.current, 1)[0];
    _faculty.splice(dragOverItem.current, 0, draggedItemContent);
    dragItem.current = null;
    dragOverItem.current = null;

    // Local sequence update
    const updatedOrderList = _faculty.map((item, index) => ({
      ...item,
      order: index
    }));
    
    setFaculty(updatedOrderList);

    // Persist to backend
    try {
      const payload = updatedOrderList.map(f => ({ id: f._id, order: f.order }));
      await facultyService.reorderFaculty(payload);
      toast.success("Order saved successfully");
    } catch(err) {
      toast.error("Error saving new order");
      fetchFaculty(); // revert if failed
    }
  };

  // ----------------------------------------------------------------
  // Modal Handlers
  // ----------------------------------------------------------------
  const openCreateModal = () => {
    setIsEditing(false);
    setSelectedFaculty(null);
    setFormData({ name: '', email: '', department: '', customDepartment: '', role: 'faculty', password: '' });
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
      password: ''
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
        name: formData.name, email: formData.email, role: formData.role, department: finalDepartment
      };

      if (!isEditing) {
        if (!formData.password) return toast.error("Password is required for new faculty");
        payload.password = formData.password;
        payload.order = faculty.length; // Append dynamically at end
        
        await facultyService.createFaculty(payload);
        toast.success("Faculty added successfully");
      } else {
        await facultyService.updateFaculty(selectedFaculty._id, payload);
        toast.success("Faculty updated successfully");
      }
      
      setShowModal(false);
      fetchFaculty();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const handleDeleteFaculty = async (facultyId) => {
    if (!window.confirm("Are you sure you want to delete this faculty member?")) return;
    try {
      await facultyService.deleteFaculty(facultyId);
      toast.success("Faculty deleted successfully");
      setFaculty(faculty.filter(f => f._id !== facultyId));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete faculty");
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  // A generic fallback avatar color based on name length or generic
  const getAvatarColor = (index) => {
    const colors = ['bg-blue-100 text-blue-700', 'bg-emerald-100 text-emerald-700', 'bg-amber-100 text-amber-700', 'bg-purple-100 text-purple-700', 'bg-rose-100 text-rose-700'];
    return colors[index % colors.length];
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Faculty Management</h1>
            <p className="text-gray-500 mt-2">Add, edit, delete, and seamlessly drag-and-drop to reorder faculty profiles.</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={openCreateModal}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Faculty
            </button>
          </div>
        </header>

        {/* Draggable Card List */}
        <div className="space-y-3">
          {loading ? (
            <div className="py-12 text-center text-gray-400 font-semibold animate-pulse">Loading Faculty...</div>
          ) : faculty.length === 0 ? (
            <div className="py-12 text-center text-gray-400 bg-white rounded-xl shadow-sm border border-gray-100">No faculty members found.</div>
          ) : (
            faculty.map((member, index) => (
              <div 
                key={member._id}
                draggable
                onDragStart={() => (dragItem.current = index)}
                onDragEnter={() => (dragOverItem.current = index)}
                onDragEnd={handleSort}
                onDragOver={(e) => e.preventDefault()}
                className="bg-white rounded-xl p-4 flex items-center justify-between shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="text-gray-300 cursor-move hover:text-gray-500 transition-colors p-1">
                    <GripVertical className="w-5 h-5" />
                  </div>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold shadow-inner ${getAvatarColor(index)}`}>
                    {getInitials(member.name)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-[15px]">{member.name}</h3>
                    <p className="text-sm text-gray-500 capitalize mt-0.5">
                      {member.role === 'admin' ? 'System Administrator' : (FACULTY_ROLES.find(r => r.value === member.role)?.label || member.role)}
                      {member.department ? ` - ${member.department}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEditModal(member)} className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeleteFaculty(member._id)} className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Logic (Reused from Previous Revamp) */}
        {showModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{isEditing ? 'Edit Faculty Member' : 'Add New Faculty'}</h3>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleCreateOrUpdate} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                    <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500" placeholder="e.g. Dr. Sarah Johnson" />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                    <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500" placeholder="sarah@iilm.edu" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Department</label>
                    <select name="department" required value={formData.department} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500">
                      <option value="">Select Dept</option>
                      {DEFAULT_DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                      <option value="Other">Other...</option>
                    </select>
                  </div>
                  {formData.department === 'Other' && (
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Custom Department</label>
                      <input type="text" name="customDepartment" required value={formData.customDepartment} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500" placeholder="Please specify" />
                    </div>
                  )}

                  <div className={`col-span-2 ${formData.department === 'Other' ? '' : 'sm:col-span-1'}`}>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Role</label>
                    <select name="role" required value={formData.role} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500">
                      {FACULTY_ROLES.map(role => <option key={role.value} value={role.value}>{role.label}</option>)}
                    </select>
                  </div>
                </div>

                {!isEditing && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                    <div className="flex gap-2">
                      <input type="text" name="password" required value={formData.password} onChange={handleInputChange} className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500" placeholder="Password" />
                      <button type="button" onClick={generatePassword} className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold flex items-center transition-colors">
                        <Key className="w-4 h-4 mr-2" /> Generate
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 mt-6">
                  <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-gray-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors">Cancel</button>
                  <button type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2 rounded-lg transition-colors">
                    <Save className="w-4 h-4" /> {isEditing ? 'Save Changes' : 'Create User'}
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
