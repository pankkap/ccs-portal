import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout';
import { 
  Building2, 
  GraduationCap, 
  Calendar, 
  Plus, 
  Trash2, 
  Search, 
  ChevronRight,
  School,
  Layers,
  ArrowRight
} from 'lucide-react';
import academicService from '../../services/academicService';
import { toast } from 'sonner';

const SchoolManagement = () => {
  const [activeTab, setActiveTab] = useState('schools');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', type: 'School', parentId: '' });
  const [expandedSchoolId, setExpandedSchoolId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await academicService.getAll();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      toast.error('Failed to fetch academic lattice data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await academicService.create(newItem);
      if (res.success) {
        toast.success(`${newItem.type} Successfully Initialized`);
        fetchData();
        setShowAddModal(false);
        setNewItem({ name: '', type: activeTab.slice(0, -1).charAt(0).toUpperCase() + activeTab.slice(1, -1), parentId: '' });
      }
    } catch (err) {
      toast.error('Initialization Failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Archive this academic unit?')) return;
    try {
      const res = await academicService.delete(id);
      if (res.success) {
        toast.success('Lattice Node Archived');
        fetchData();
      }
    } catch (err) {
      toast.error('Archival Failed');
    }
  };

  const filteredData = data.filter(item => {
    if (activeTab === 'schools') return item.type === 'School';
    if (activeTab === 'departments') return item.type === 'Department';
    if (activeTab === 'years') return item.type === 'Year';
    return false;
  }).sort((a, b) => a.name.localeCompare(b.name));

  const schools = data.filter(item => item.type === 'School');

  return (
    <Layout>
      <div className="max-w-7xl mx-auto pb-20">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">Academic Structure Management</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg font-medium">Enterprise resource planning and structural governance for schools and departments.</p>
          </div>
          <button 
            onClick={() => {
              const type = activeTab.slice(0, -1).charAt(0).toUpperCase() + activeTab.slice(1, -1);
              setNewItem({ ...newItem, type });
              setShowAddModal(true);
            }}
            className="px-8 py-4 bg-gray-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-4 hover:bg-gray-800 transition-all shadow-2xl border border-gray-800 group"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            Initialize new {activeTab.slice(0, -1)}
          </button>
        </header>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-4 mb-12 border-b border-gray-100 dark:border-gray-900 pb-8">
          {[
            { id: 'schools', label: 'Schools', icon: School },
            { id: 'departments', label: 'Departments', icon: Building2 },
            { id: 'years', label: 'Academic Years', icon: Calendar }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-4 px-8 py-4 rounded-2xl transition-all border ${activeTab === tab.id ? 'bg-gray-950 text-white border-gray-800 shadow-xl' : 'bg-white dark:bg-gray-900 text-gray-400 border-gray-100 dark:border-gray-800 hover:border-gray-200'}`}
            >
              <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-blue-500' : 'text-gray-400'}`} />
              <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
              <div className={`px-2 py-0.5 rounded-lg text-[8px] font-bold ${activeTab === tab.id ? 'bg-blue-600/20 text-blue-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                {data.filter(item => item.type === tab.id.slice(0, -1).charAt(0).toUpperCase() + tab.id.slice(1, -1)).length}
              </div>
            </button>
          ))}
        </div>

        {/* Data Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredData.map((item) => (
            <div 
              key={item._id} 
              onClick={() => {
                if (activeTab === 'schools') {
                  setExpandedSchoolId(expandedSchoolId === item._id ? null : item._id);
                }
              }}
              className={`group p-10 bg-white dark:bg-gray-900 border rounded-[3rem] shadow-sm hover:shadow-2xl transition-all relative overflow-hidden ${activeTab === 'schools' ? 'cursor-pointer' : ''} ${expandedSchoolId === item._id ? 'border-blue-500 ring-4 ring-blue-500/5' : 'border-gray-100 dark:border-gray-800'}`}
            >
               <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 dark:bg-black/20 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700"></div>
               <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                     <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-gray-950 dark:text-white">
                        {activeTab === 'schools' ? <School className="w-6 h-6" /> : activeTab === 'departments' ? <Building2 className="w-6 h-6" /> : <Calendar className="w-6 h-6" />}
                     </div>
                     <div className="flex items-center gap-2">
                        {activeTab === 'schools' && (
                          <div className={`p-2 rounded-lg transition-transform duration-300 ${expandedSchoolId === item._id ? 'rotate-90 text-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-300'}`}>
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        )}
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(item._id);
                            }}
                            className="p-3 bg-gray-50/50 dark:bg-black/20 text-gray-300 hover:text-red-500 rounded-xl transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                     </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight leading-tight mb-4 min-h-[3rem]">{item.name}</h3>
                  
                  {activeTab === 'schools' && expandedSchoolId === item._id && (
                    <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800 animate-in fade-in slide-in-from-top-4 duration-500">
                       <p className="text-[10px] font-bold text-blue-500 tracking-tight mb-4 text-center">Nested Departments</p>
                       <div className="space-y-3">
                          {data.filter(d => d.type === 'Department' && d.parentId === item._id)
                               .sort((a, b) => a.name.localeCompare(b.name))
                               .map(dept => (
                                 <div key={dept._id} className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-black/40 rounded-2xl border border-gray-100 dark:border-gray-800 group/item">
                                    <ArrowRight className="w-3 h-3 text-gray-300 group-hover/item:text-blue-600 transition-colors" />
                                    <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 tracking-tight">{dept.name}</span>
                                 </div>
                          ))}
                          {data.filter(d => d.type === 'Department' && d.parentId === item._id).length === 0 && (
                            <p className="text-[10px] font-medium text-gray-400 italic">No departments linked yet</p>
                          )}
                       </div>
                    </div>
                  )}

                  {item.parentId && activeTab !== 'schools' && (
                    <div className="mt-8 pt-8 border-t border-gray-50 dark:border-gray-800 flex items-center gap-3">
                       <ArrowRight className="w-4 h-4 text-gray-300" />
                       <div>
                          <p className="text-[8px] font-bold text-gray-400 tracking-tight">Parent Division</p>
                          <p className="text-[10px] font-bold text-gray-600 dark:text-gray-400">{schools.find(s => s._id === item.parentId)?.name || 'Central Unit'}</p>
                       </div>
                    </div>
                  )}
               </div>
            </div>
          ))}

          {filteredData.length === 0 && !loading && (
            <div className="col-span-full py-32 text-center border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-[4rem]">
               <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-gray-100 dark:border-gray-700">
                  <Layers className="w-10 h-10 text-gray-300" />
               </div>
               <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-widest">Lattice Depleted</h3>
               <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2">Initialize your first academic segment above.</p>
            </div>
          )}
        </div>

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-white/80 dark:bg-black/80 backdrop-blur-2xl">
            <div className="w-full max-w-xl bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-900 rounded-[3.5rem] shadow-2xl p-12 relative">
               <button 
                  onClick={() => setShowAddModal(false)}
                  className="absolute top-10 right-10 text-gray-300 hover:text-gray-500 transition-colors"
               >
                  <Plus className="w-8 h-8 rotate-45" />
               </button>

               <div className="mb-12">
                  <div className="flex items-center gap-4 mb-4 text-blue-600">
                     <GraduationCap className="w-10 h-10" />
                     <div className="h-0.5 flex-1 bg-blue-600/10"></div>
                  </div>
                  <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tightest">Initialize Segment</h2>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">{newItem.type} Construction Mode</p>
               </div>

               <form onSubmit={handleCreate} className="space-y-10">
                  <div className="space-y-4">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Entity Nomenclature</label>
                     <input 
                        type="text"
                        required
                        value={newItem.name}
                        onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl px-8 py-6 text-sm font-bold focus:border-blue-600 outline-none transition-all dark:text-white"
                        placeholder={`e.g. ${newItem.type === 'School' ? 'School of Management' : newItem.type === 'Year' ? 'Batch of 2024' : 'Cloud Architecture Dept'}`}
                     />
                  </div>

                  {newItem.type === 'Department' && (
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Connect to Parent School</label>
                       <select 
                          required
                          value={newItem.parentId}
                          onChange={(e) => setNewItem({...newItem, parentId: e.target.value})}
                          className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl px-8 py-6 text-sm font-bold focus:border-blue-600 outline-none transition-all dark:text-white appearance-none cursor-pointer"
                       >
                          <option value="">Select Target School</option>
                          {schools.map(school => (
                            <option key={school._id} value={school._id}>{school.name}</option>
                          ))}
                       </select>
                    </div>
                  )}

                  <button 
                    type="submit"
                    className="w-full py-8 bg-gray-950 dark:bg-white dark:text-gray-950 text-white rounded-[2.5rem] font-black text-[12px] uppercase tracking-[0.4em] shadow-2xl shadow-blue-600/20 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    Commit Configuration
                  </button>
               </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SchoolManagement;
