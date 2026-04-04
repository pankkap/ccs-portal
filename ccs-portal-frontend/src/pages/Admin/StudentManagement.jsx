import React, { useEffect, useState } from 'react';
import { Layout } from '../../components/Layout';
import { 
  Users, Search, Filter, Loader2, GraduationCap, 
  Building2, Calendar, CheckCircle2, XCircle, 
  ChevronRight, RefreshCcw
} from 'lucide-react';
import { toast } from 'sonner';
import adminService from '../../services/adminService';
import academicService from '../../services/academicService';
import axios from 'axios';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filter States
  const [filters, setFilters] = useState({
    search: '',
    college: 'all',
    department: 'all',
    year: 'all'
  });

  // Academic Meta-data (Lattice)
  const [lattice, setLattice] = useState([]);

  const fetchStudents = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    
    try {
      const params = {
        role: 'student',
        search: filters.search || undefined,
        college: filters.college !== 'all' ? filters.college : undefined,
        department: filters.department !== 'all' ? filters.department : undefined,
        year: filters.year !== 'all' ? filters.year : undefined
      };

      const res = await adminService.getUsers(params);
      if (res.success) {
        setStudents(res.data.users || []);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to synchronize student directory");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchLattice = async () => {
    try {
      const res = await academicService.getAll();
      if (res.success) {
        setLattice(res.data);
      }
    } catch (error) {
      console.error("Error fetching lattice:", error);
    }
  };

  useEffect(() => {
    fetchLattice();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents();
    }, 300);
    return () => clearTimeout(timer);
  }, [filters]);

  // Derived Filter Options
  const schools = lattice.filter(item => item.type === 'School').sort((a, b) => a.name.localeCompare(b.name));
  const batches = lattice.filter(item => item.type === 'Year').sort((a, b) => b.name.localeCompare(a.name));
  
  // Dependent Departments: Filtered by selected school
  const departments = lattice.filter(item => {
    if (item.type !== 'Department') return false;
    if (filters.college === 'all') return true;
    
    // Find the school ID for the selected school name
    const selectedSchool = schools.find(s => s.name === filters.college);
    return item.parentId === selectedSchool?._id;
  }).sort((a, b) => a.name.localeCompare(b.name));

  // Handle School Change: Reset department if school changes
  const handleSchoolChange = (schoolName) => {
    setFilters(prev => ({
      ...prev,
      college: schoolName,
      department: 'all' // Reset department to "All" when school changes
    }));
  };

  const toggleStatus = async (studentId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      const res = await adminService.updateUserStatus(studentId, newStatus);
      if (res.success) {
        setStudents(students.map(s => s._id === studentId ? { ...s, status: newStatus } : s));
        toast.success(`Identity status pivoted to ${newStatus}`);
      }
    } catch (error) {
      toast.error("Status modification failed");
    }
  };

  return (
    <Layout>
      <div className="max-w-screen-2xl mx-auto pb-10">
        {/* Header Section */}
        <header className="mb-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="animate-in fade-in slide-in-from-left duration-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">Student Governance</span>
            </div>
            <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Student Body Management</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Coordinate, verify, and manage all active academic identities.</p>
          </div>

          {/* Search/Refresh Actions */}
          <div className="flex items-center gap-4 animate-in fade-in slide-in-from-right duration-700">
             <button 
              onClick={() => fetchStudents(true)}
              className="p-4 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl hover:bg-gray-50 dark:hover:bg-slate-750 transition-all group shadow-sm active:scale-95"
              title="Synchronize Registry"
             >
                <RefreshCcw className={`w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-all ${refreshing ? 'animate-spin text-indigo-500' : ''}`} />
             </button>
             <div className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                <input 
                  type="text"
                  placeholder="Find student by name or email..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full sm:w-80 pl-14 pr-6 py-4 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl text-sm font-bold dark:text-white outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/20 shadow-sm transition-all"
                />
             </div>
          </div>
        </header>

        {/* Filter Hub */}
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-6 mb-8 flex flex-wrap items-center gap-6 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full -mr-10 -mt-10"></div>
          
          <div className="flex items-center gap-3 text-gray-400 mr-4">
            <Filter className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-widest">Filters</span>
          </div>

          {/* School Filter */}
          <div className="space-y-1.5 min-w-[200px]">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Academic School</label>
            <select 
              value={filters.college}
              onChange={(e) => handleSchoolChange(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border-none rounded-xl text-sm font-bold dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none cursor-pointer font-mono"
            >
              <option value="all">All Schools</option>
              {schools.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
            </select>
          </div>

          {/* Department Filter */}
          <div className="space-y-1.5 min-w-[200px]">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Department Division</label>
            <select 
              value={filters.department}
              onChange={(e) => setFilters({ ...filters, department: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border-none rounded-xl text-sm font-bold dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none cursor-pointer font-mono"
            >
              <option value="all">All Departments</option>
              {departments.map(d => <option key={d._id} value={d.name}>{d.name}</option>)}
            </select>
          </div>

          {/* Batch Filter */}
          <div className="space-y-1.5 min-w-[150px]">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Administrative Batch</label>
            <select 
              value={filters.year}
              onChange={(e) => setFilters({ ...filters, year: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border-none rounded-xl text-sm font-bold dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none cursor-pointer font-mono"
            >
              <option value="all">All Batches</option>
              {batches.map(v => <option key={v._id} value={v.name}>{v.name}</option>)}
            </select>
          </div>
        </div>

        {/* Global Student Registry Table */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-xl overflow-hidden relative min-h-[400px]">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm z-10">
              <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
              <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Accessing student ledger...</p>
            </div>
          ) : students.length > 0 ? (
            <div className="overflow-x-auto custom-scrollbar border-b border-gray-50 dark:border-slate-800">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800">
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Student Information</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Academic Context</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Batch Group</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Identity Status</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Registry Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                  {students.map((student) => (
                    <tr key={student._id} className="hover:bg-gray-50/50 dark:hover:bg-slate-850/50 transition-all group">
                      {/* Name & Identity */}
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white font-black shadow-lg shadow-indigo-200 dark:shadow-none shrink-0 overflow-hidden border-2 border-white dark:border-slate-700">
                            {student.image ? (
                              <img src={student.image} alt="" className="w-full h-full object-cover" />
                            ) : (
                              student.name.charAt(0)
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2 group-hover:text-indigo-600 transition-colors">
                              {student.name}
                              <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:translate-x-1 transition-all" />
                            </div>
                            <div className="text-[11px] text-gray-400 font-bold tracking-tight flex items-center gap-1.5 mt-0.5 uppercase">
                              <span className="text-gray-300">ID:</span> {student.rollNo || 'UNASSIGNED'}
                            </div>
                            <div className="text-[10px] text-indigo-400 font-medium flex items-center gap-1.5 mt-1 lowercase truncate max-w-[200px]">
                              <span className="text-gray-300 uppercase font-black text-[8px]">Email:</span> {student.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Academic Context */}
                      <td className="px-8 py-6">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-[13px] font-bold text-gray-700 dark:text-gray-300">
                            <Building2 className="w-3.5 h-3.5 text-gray-400" />
                            {student.department || 'N/A'}
                          </div>
                          <div className="text-[11px] text-gray-400 font-medium ml-5 italic">
                            {student.college || 'N/A'}
                          </div>
                        </div>
                      </td>

                      {/* Batch Group */}
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-[13px] font-black text-gray-600 dark:text-gray-400">
                          <Calendar className="w-4 h-4 text-gray-300" />
                          Class of {student.year || '202X'}
                        </div>
                      </td>

                      {/* Status Check */}
                      <td className="px-8 py-6">
                        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          student.status === 'active' 
                            ? 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600' 
                            : 'bg-rose-50 dark:bg-rose-900/10 text-rose-600'
                        }`}>
                          {student.status === 'active' ? (
                            <>
                              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                              Active Portal
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5" />
                              Identity Deactivated
                            </>
                          )}
                        </div>
                      </td>

                      {/* Toggle Operations */}
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <label className="relative inline-flex items-center cursor-pointer group/toggle">
                            <input 
                              type="checkbox" 
                              className="sr-only peer" 
                              checked={student.status === 'active'}
                              onChange={() => toggleStatus(student._id, student.status)}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600 shadow-inner"></div>
                            <span className="ml-3 text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover/toggle:text-gray-600 dark:group-hover/toggle:text-gray-200 transition-colors">
                              {student.status === 'active' ? 'Deactivate' : 'Activate'}
                            </span>
                          </label>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 animate-in zoom-in-95 duration-500">
              <div className="w-24 h-24 bg-gray-50 dark:bg-slate-800 rounded-[2.5rem] flex items-center justify-center mb-6">
                <Users className="w-12 h-12 text-gray-200 dark:text-slate-700" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">No Identities Detected</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Verify your filter parameters or directory search term.</p>
              <button 
                onClick={() => setFilters({ search: '', college: 'all', department: 'all', year: 'all' })}
                className="mt-6 px-6 py-2.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-100 transition-all active:scale-95"
              >
                Clear All Filters
              </button>
            </div>
          )}

          {/* Registry Footer */}
          {!loading && students.length > 0 && (
            <div className="px-10 py-6 bg-gray-50/50 dark:bg-slate-800/30 border-t border-gray-50 dark:border-slate-800 flex items-center justify-between">
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                Registry Integrity Verified • {students.length} Academic Entities
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default StudentManagement;
