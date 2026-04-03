import React, { useEffect, useState } from 'react';
import { Layout } from '../../components/Layout';
import { 
  Plus, 
  Search, 
  Award, 
  Clock, 
  Target, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Loader2,
  FileText,
  Users,
  Calendar,
  ChevronRight,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import testService from '../../services/testService';
import { toast } from 'sonner';

const MockTests = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const res = await testService.getMyTests();
      if (res.success) {
        setTests(res.data.tests);
      }
    } catch (error) {
      toast.error("Failed to load mock tests");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this mock test? This action cannot be undone.")) return;
    try {
      await testService.deleteTest(id);
      setTests(tests.filter(t => t._id !== id));
      toast.success("Test deleted successfully");
    } catch (error) {
      toast.error("Deletion failed");
    }
  };

  const filteredTests = tests.filter(t => 
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-2 transition-colors">Mock Assessments</h1>
            <p className="text-sm font-medium text-gray-400 dark:text-gray-500 tracking-tight leading-relaxed transition-colors">Design, manage, and monitor your specialized evaluation blueprints.</p>
          </div>
          <button 
            onClick={() => navigate('/faculty/test-builder')}
            className="flex items-center gap-3 px-8 py-5 bg-blue-600 text-white rounded-[2rem] font-bold text-xs tracking-tight hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 dark:shadow-blue-900/20 group"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            New Mock Test
          </button>
        </header>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
           <div className="bg-[#0f172a] dark:bg-[#1e293b] rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl transition-colors">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
              <p className="text-[10px] font-bold tracking-tight text-white/40 mb-2">Total Managed</p>
              <h3 className="text-4xl font-bold">{tests.length}</h3>
              <div className="flex items-center gap-2 mt-4 text-emerald-400">
                 <TrendingUp className="w-4 h-4" />
                 <span className="text-xs font-bold tracking-tight">Active Curriculum</span>
              </div>
           </div>
           <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 border border-gray-100 dark:border-slate-700 shadow-sm transition-colors">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 mb-2">Total Questions</p>
              <h3 className="text-4xl font-black text-gray-900 dark:text-white transition-colors">
                 {tests.reduce((acc, t) => acc + (t.questions?.length || 0), 0)}
              </h3>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-4 uppercase tracking-widest leading-none transition-colors">Across Focus Areas</p>
           </div>
            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 border border-gray-100 dark:border-slate-700 shadow-sm transition-colors">
               <p className="text-[10px] font-bold tracking-tight text-gray-400 dark:text-gray-500 mb-2">Avg. Duration</p>
               <h3 className="text-4xl font-bold text-gray-900 dark:text-white transition-colors">
                  {tests.length > 0 ? Math.round(tests.reduce((acc, t) => acc + (t.duration || 0), 0) / tests.length) : 0}
                  <span className="text-xl ml-2 font-medium">min</span>
               </h3>
               <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-4 tracking-tight leading-none transition-colors">Per evaluation</p>
            </div>
        </div>

        {/* List Filter */}
        <div className="relative mb-8 max-w-xl">
           <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-500 w-5 h-5" />
           <input 
             type="text" 
             placeholder="Search by title or focus area..."
             value={search}
             onChange={(e) => setSearch(e.target.value)}
             className="w-full pl-14 pr-8 py-5 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-[2rem] text-sm font-bold font-sans dark:text-white outline-none focus:border-indigo-500 transition-all shadow-sm shadow-black/[0.02]"
           />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 bg-white dark:bg-slate-800/50 rounded-[3rem] border border-gray-50 dark:border-slate-700 transition-colors">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
            <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em]">Accessing Blueprint Vault</p>
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em]">Accessing Blueprint Vault</p>
          </div>
        ) : filteredTests.length === 0 ? (
          <div className="bg-white dark:bg-slate-800/50 rounded-[4rem] border-2 border-dashed border-gray-100 dark:border-slate-700 p-32 text-center shadow-inner transition-colors">
             <div className="w-24 h-24 bg-gray-50 dark:bg-slate-900 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-sm">
                <FileText className="w-12 h-12 text-gray-200 dark:text-gray-700" />
             </div>
             <h3 className="text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-tight mb-2 transition-colors">No blueprinted tests</h3>
             <p className="text-gray-400 dark:text-gray-500 text-sm font-bold max-w-xs mx-auto mb-10 transition-colors">You haven't designed any mock assessments yet. Begin your first architecture using AI or Bank questions.</p>
             <button 
               onClick={() => navigate('/faculty/test-builder')}
               className="px-10 py-4 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-3xl font-bold text-[10px] uppercase tracking-widest hover:bg-black dark:hover:bg-gray-100 transition-all"
             >
                Initialize First Build
             </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {filteredTests.map((test) => (
              <div 
                key={test._id}
                className="group bg-white dark:bg-slate-800 rounded-[2.5rem] p-10 border border-transparent dark:border-slate-700/50 hover:border-indigo-100 dark:hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-50/50 dark:hover:shadow-indigo-900/10 transition-all relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 flex gap-3">
                   <button 
                     onClick={() => navigate(`/faculty/test-builder/${test._id}`)}
                     className="p-4 bg-gray-50 dark:bg-slate-900 rounded-2xl text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all opacity-0 group-hover:opacity-100 shadow-sm border border-transparent hover:border-indigo-100 dark:hover:border-indigo-800"
                   >
                      <Edit2 className="w-4 h-4" />
                   </button>
                   <button 
                     onClick={() => handleDelete(test._id)}
                     className="p-4 bg-gray-50 dark:bg-slate-900 rounded-2xl text-gray-400 dark:text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-0 group-hover:opacity-100 shadow-sm border border-transparent hover:border-red-100 dark:hover:border-red-900"
                   >
                      <Trash2 className="w-4 h-4" />
                   </button>
                </div>

                <div className="mb-6 flex flex-wrap items-center gap-3">
                   <span className="px-4 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-[0.2em] bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400">
                      {test.category}
                   </span>
                   {test.isProctored && (
                     <span className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-[0.2em] bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
                        <ShieldCheck className="w-3 h-3" />
                        AI Proctored
                     </span>
                   )}
                </div>

                <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 font-sans leading-tight pr-20 transition-colors uppercase">{test.title}</h4>
                
                <div className="grid grid-cols-3 gap-4 mb-10 pb-8 border-b border-gray-50 dark:border-slate-700/50">
                   <div>
                      <p className="text-[9px] font-bold text-gray-300 dark:text-gray-600 uppercase tracking-widest mb-1">Time Limit</p>
                      <div className="flex items-center gap-2">
                         <Clock className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                         <span className="text-xs font-bold text-gray-600 dark:text-gray-300">{test.duration} Min</span>
                      </div>
                   </div>
                   <div>
                      <p className="text-[9px] font-bold text-gray-300 dark:text-gray-600 uppercase tracking-widest mb-1">Questions</p>
                      <div className="flex items-center gap-2">
                         <FileText className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                         <span className="text-xs font-bold text-gray-600 dark:text-gray-300">{test.questions?.length || 0} Total</span>
                      </div>
                   </div>
                   <div>
                      <p className="text-[9px] font-bold text-gray-300 dark:text-gray-600 uppercase tracking-widest mb-1">Max Marks</p>
                      <div className="flex items-center gap-2">
                         <Target className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                         <span className="text-xs font-bold text-gray-600 dark:text-gray-300">{test.maxMarks || 100} Pts</span>
                      </div>
                   </div>
                </div>

                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="p-3 bg-gray-50 dark:bg-slate-900 rounded-2xl">
                         <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      </div>
                      <div>
                         <p className="text-[9px] font-bold text-gray-300 dark:text-gray-600 uppercase tracking-widest leading-none">Blueprint Date</p>
                         <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-1">{new Date(test.createdAt).toLocaleDateString()}</p>
                      </div>
                   </div>
                   <button 
                     onClick={() => navigate(`/faculty/test-builder/${test._id}`)}
                     className="flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-2xl text-[10px] font-bold uppercase tracking-tight hover:bg-black dark:hover:bg-gray-100 transition-all shadow-lg"
                   >
                      Modify Blueprint
                      <ChevronRight className="w-3.5 h-3.5" />
                   </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MockTests;
