import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Layout } from '../../components/Layout';
import { Users, Search, Trash2, Mail, Calendar, Loader2, ShieldCheck, UserPlus, Filter } from 'lucide-react';
import { toast } from 'sonner';
import adminService from '../../services/adminService';

const UserManagement = () => {
  const { profile: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await adminService.getUsers({
          role: roleFilter !== 'all' ? roleFilter : undefined,
          search: searchTerm || undefined
        });
        if (res.success) {
          setUsers(res.data.users || []);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to synchronize user directory");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [roleFilter, searchTerm]);

  const handleUpdateRole = async (userId, newRole) => {
    try {
      const res = await adminService.updateUser(userId, { role: newRole });
      if (res.success) {
        setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
        toast.success(`Access level escalated to ${newRole}`);
      }
    } catch (error) {
       toast.error(error.message || "Credential modification failed");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("CRITICAL: Are you sure you want to purge this user? This action is irreversible.")) return;
    
    try {
      const res = await adminService.deleteUser(userId);
      if (res.success) {
        setUsers(users.filter(u => u._id !== userId));
        toast.success("User identity purged from system");
      }
    } catch (error) {
      toast.error(error.message || "Failed to delete user profile");
    }
  };

  if (loading && users.length === 0) return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Accessing Central Registry...</p>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto pb-20">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Identity & Access</h1>
            <p className="text-gray-500 mt-2 text-lg">Manage organizational hierarchies and system authorizations.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
              <input 
                type="text" 
                placeholder="Search Identity..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all w-full sm:w-64 font-medium shadow-sm"
              />
            </div>
            <div className="relative">
               <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
               <select 
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="pl-12 pr-10 py-4 bg-white border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all font-bold text-gray-700 shadow-sm appearance-none"
                >
                  <option value="all">Global (All Roles)</option>
                  <option value="student">🎓 Students</option>
                  <option value="faculty">👨‍🏫 Faculty</option>
                  <option value="placement">💼 Placement Officers</option>
                  <option value="admin">🛡️ System Admins</option>
                </select>
            </div>
          </div>
        </header>

        <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-50">
                  <th className="px-10 py-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Digital Identity</th>
                  <th className="px-10 py-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Authorization</th>
                  <th className="px-10 py-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Registry Date</th>
                  <th className="px-10 py-6 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50/30 transition-colors group">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-900 to-black flex items-center justify-center text-white font-black text-xl shadow-xl overflow-hidden shrink-0 border border-white/10">
                          {user.image ? (
                            <img src={user.image} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            user.name.charAt(0)
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-gray-900 text-lg truncate tracking-tight">{user.name}</div>
                          <div className="text-sm text-gray-400 flex items-center gap-2 mt-1 font-medium">
                            <Mail className="w-3.5 h-3.5" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <select 
                        value={user.role}
                        onChange={(e) => handleUpdateRole(user._id, e.target.value)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-none focus:ring-4 focus:ring-blue-100 transition-all ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                          user.role === 'faculty' ? 'bg-blue-100 text-blue-700' :
                          user.role === 'placement' ? 'bg-orange-100 text-orange-700' :
                          'bg-green-100 text-green-700'
                        }`}
                      >
                        <option value="student">Student</option>
                        <option value="faculty">Faculty</option>
                        <option value="placement">Placement</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-10 py-8">
                      <div className="text-xs text-gray-500 font-bold flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-300" />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <button 
                          onClick={() => handleDeleteUser(user._id)}
                          disabled={user._id === currentUser?._id}
                          className="p-3 text-red-500 hover:bg-red-50 rounded-2xl transition-all disabled:opacity-10"
                          title="Purge Identity"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {users.length === 0 && !loading && (
            <div className="text-center py-32">
              <Users className="w-20 h-20 text-gray-100 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No identities found</h3>
              <p className="text-gray-400 font-medium">Verify your search criteria or role filters.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default UserManagement;
